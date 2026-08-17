"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatComposer } from "@/components/skilz/chat-composer"
import { ChatHeroMessage, ChatMessage, ChatTypingIndicator } from "@/components/skilz/chat-message"
import { ChatSessionHeader } from "@/components/skilz/chat-session-header"
import { ListeningOrb } from "@/components/skilz/listening-orb"
import { useVoice } from "@/lib/voice/use-voice"
import { AIConversationService, SkillAnalysisService, type WireMessage } from "@/lib/ai/services"
import { StreamSpeaker } from "@/lib/voice/stream-speak"
import {
  MIN_USER_EXCHANGES,
  assessAnswerEligibility,
  assessTranscriptEligibility,
  normalizeSpeechText,
  EligibilityError,
  type EligibilityResult,
} from "@/lib/ai/eligibility"
import { useSkilz } from "@/lib/data/store"
import { useAuth } from "@/lib/auth/auth-context"
import { useHandleAuthRequired } from "@/lib/auth/use-handle-auth-required"
import type { Message } from "@/lib/data/types"

type OrbState = "idle" | "listening" | "thinking" | "speaking"

const MIN_EXCHANGES = MIN_USER_EXCHANGES

function uid() {
  return `m_${Math.random().toString(36).slice(2, 9)}`
}

let discoverRequestInflight = false

export function DiscoverySession() {
  const router = useRouter()
  const { state, setConversation, saveSkills } = useSkilz()
  const { profile } = state
  const prefersVoice = profile.interactionPreference === "voice"
  const { refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()
  const voice = useVoice()

  const [orbState, setOrbState] = useState<OrbState>("idle")
  const [messages, setMessages] = useState<Message[]>(state.conversation)
  const [textValue, setTextValue] = useState("")
  const [showTranscript, setShowTranscript] = useState(!prefersVoice)
  const [muted, setMuted] = useState(!prefersVoice)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [readyToConclude, setReadyToConclude] = useState(false)
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)
  const [streamingReply, setStreamingReply] = useState<string | null>(null)
  const [ttsActive, setTtsActive] = useState(false)

  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const streamSpeakerRef = useRef<StreamSpeaker | null>(null)
  const isStreamingRef = useRef(false)
  const mutedRef = useRef(muted)
  const autoListenTimerRef = useRef<number | null>(null)

  useEffect(() => {
    streamSpeakerRef.current = new StreamSpeaker()
    return () => {
      streamSpeakerRef.current?.cancel()
      if (autoListenTimerRef.current) window.clearTimeout(autoListenTimerRef.current)
    }
  }, [])

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const stopAiSpeech = useCallback(() => {
    streamSpeakerRef.current?.cancel()
    voice.cancelSpeak()
    setTtsActive(false)
  }, [voice])

  const toWire = useCallback(
    (list: Message[]): WireMessage[] =>
      list.map((m) => ({
        role: m.role,
        content: m.role === "user" ? normalizeSpeechText(m.content) : m.content,
      })),
    [],
  )

  const userExchanges = messages.filter((m) => m.role === "user").length
  const localEligibility = assessTranscriptEligibility(toWire(messages))
  const canAnalyze = (eligibility?.eligible ?? localEligibility.eligible) && userExchanges >= MIN_EXCHANGES

  const isThinking = orbState === "thinking"
  const isSpeaking = orbState === "speaking" || ttsActive

  const beginListening = useCallback(async () => {
    if (!voice.recognitionSupported) {
      setError("Voice input isn't available in this browser. You can type your answer instead.")
      return false
    }

    stopAiSpeech()
    voice.reset()
    setOrbState("listening")
    const started = await voice.start()
    if (!started) setOrbState("idle")
    return started
  }, [voice, stopAiSpeech])

  const scheduleAutoListen = useCallback(() => {
    if (!prefersVoice || mutedRef.current || !voice.recognitionSupported) return
    if (autoListenTimerRef.current) window.clearTimeout(autoListenTimerRef.current)
    autoListenTimerRef.current = window.setTimeout(() => {
      autoListenTimerRef.current = null
      if (mutedRef.current || isStreamingRef.current) return
      void beginListening()
    }, 450)
  }, [prefersVoice, voice.recognitionSupported, beginListening])

  const finishStreaming = useCallback(
    (reply: string) => {
      const msg: Message = { id: uid(), role: "assistant", content: reply, createdAt: Date.now() }
      setMessages((prev) => [...prev, msg])
      setStreamingReply(null)
      discoverRequestInflight = false
      isStreamingRef.current = false

      if (mutedRef.current || !voice.synthesisSupported) {
        setOrbState("idle")
        setTtsActive(false)
        streamSpeakerRef.current?.reset()
        scheduleAutoListen()
        return
      }

      setOrbState("speaking")
      setTtsActive(true)
      streamSpeakerRef.current!.flush(reply, () => {
        setOrbState("idle")
        setTtsActive(false)
        scheduleAutoListen()
      })
    },
    [voice.synthesisSupported, scheduleAutoListen],
  )

  const requestNext = useCallback(
    async (history: Message[]) => {
      if (discoverRequestInflight || isStreamingRef.current) return
      discoverRequestInflight = true
      isStreamingRef.current = true
      setOrbState("thinking")
      setError(null)
      setStreamingReply(null)
      autoListenTimerRef.current && window.clearTimeout(autoListenTimerRef.current)
      autoListenTimerRef.current = null

      if (voice.listening) {
        voice.stop()
        voice.reset()
      }

      const speaker = streamSpeakerRef.current!
      speaker.reset()

      await AIConversationService.streamNext(
        toWire(history),
        {
          name: profile.name,
          interests: profile.interests,
          goal: profile.goal,
        },
        {
          onToken: (_token, fullReply) => {
            setStreamingReply(fullReply)
            setOrbState("speaking")
            if (!mutedRef.current && voice.synthesisSupported) {
              setTtsActive(true)
              speaker.feed(fullReply)
            } else {
              setTtsActive(false)
            }
          },
          onDone: (result) => {
            if (result.eligibility) setEligibility(result.eligibility)
            setReadyToConclude(result.readyToConclude)
            finishStreaming(result.reply)
            void refreshSession()
          },
          onError: async (err) => {
            discoverRequestInflight = false
            isStreamingRef.current = false
            setStreamingReply(null)
            speaker.cancel()
            setError(
              await handleAuthRequired(
                err,
                "SKILZ is having trouble responding right now. You can keep going with text.",
              ),
            )
            setOrbState("idle")
            setTtsActive(false)
          },
        },
      )
    },
    [profile, finishStreaming, refreshSession, handleAuthRequired, toWire, voice, voice.synthesisSupported],
  )

  useEffect(() => {
    setConversation(messages)
  }, [messages, setConversation])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (messages.length === 0) void requestNext([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showTranscript, streamingReply])

  const submitUser = useCallback(
    (content: string, options?: { fromVoice?: boolean }) => {
      const normalized = normalizeSpeechText(content)
      const check = assessAnswerEligibility(normalized, { voice: options?.fromVoice })
      if (!check.eligible) {
        setError(check.message)
        if (options?.fromVoice) void beginListening()
        return
      }
      setError(null)
      autoListenTimerRef.current && window.clearTimeout(autoListenTimerRef.current)
      autoListenTimerRef.current = null
      const msg: Message = { id: uid(), role: "user", content: normalized, createdAt: Date.now() }
      setTextValue("")
      setMessages((prev) => {
        const next = [...prev, msg]
        void requestNext(next)
        return next
      })
    },
    [requestNext, beginListening],
  )

  const handleMicToggle = useCallback(async () => {
    setError(null)
    if (autoListenTimerRef.current) {
      window.clearTimeout(autoListenTimerRef.current)
      autoListenTimerRef.current = null
    }

    if (voice.listening) {
      const captured = voice.stopAndCapture().trim()
      if (captured) {
        setOrbState("idle")
        voice.reset()
        submitUser(captured, { fromVoice: true })
      } else {
        // No speech yet — keep the mic open instead of showing an error.
        await beginListening()
      }
      return
    }

    if (orbState === "speaking" || streamSpeakerRef.current?.isActive()) {
      stopAiSpeech()
      setOrbState("idle")
      const started = await voice.interruptForListening()
      if (started) setOrbState("listening")
      return
    }

    if (isThinking) return

    await beginListening()
  }, [voice, submitUser, orbState, isThinking, stopAiSpeech, beginListening])

  useEffect(() => {
    if (voice.permission === "denied") {
      setOrbState("idle")
      if (autoListenTimerRef.current) window.clearTimeout(autoListenTimerRef.current)
      autoListenTimerRef.current = null
      setError(
        "Microphone permission was denied. You can type your answer, or enable the mic in your browser settings.",
      )
    }
  }, [voice.permission])

  const finish = useCallback(async () => {
    if (!canAnalyze) {
      const missing = localEligibility.missing.join(", ")
      setError(`Keep going — SKILZ needs ${missing || "more detail"} for an accurate read.`)
      return
    }
    if (autoListenTimerRef.current) window.clearTimeout(autoListenTimerRef.current)
    autoListenTimerRef.current = null
    voice.stop()
    stopAiSpeech()
    setAnalyzing(true)
    try {
      const skills = await SkillAnalysisService.analyze(toWire(messages))
      saveSkills(skills)
      void refreshSession()
      router.push("/discover/results")
    } catch (err) {
      setAnalyzing(false)
      if (err instanceof EligibilityError) {
        setError(err.message)
        return
      }
      setError(await handleAuthRequired(err, "We couldn't analyze the conversation. Please try again."))
    }
  }, [messages, saveSkills, router, voice, stopAiSpeech, refreshSession, handleAuthRequired, canAnalyze, localEligibility, toWire])

  const handleEnd = useCallback(() => {
    if (autoListenTimerRef.current) window.clearTimeout(autoListenTimerRef.current)
    autoListenTimerRef.current = null
    voice.stop()
    stopAiSpeech()
    if (userExchanges >= 2) void finish()
    else router.push("/dashboard")
  }, [voice, stopAiSpeech, userExchanges, finish, router])

  const handleMuteToggle = useCallback(() => {
    if (autoListenTimerRef.current) {
      window.clearTimeout(autoListenTimerRef.current)
      autoListenTimerRef.current = null
    }
    if (muted) {
      setMuted(false)
      return
    }
    stopAiSpeech()
    setMuted(true)
    setOrbState("idle")
  }, [muted, stopAiSpeech])

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
  const displayReply = streamingReply ?? lastAssistant?.content ?? null

  const orbCaption = voice.listening
    ? voice.liveText || "Start speaking…"
    : undefined

  const composerHint = voice.listening
    ? "Tap the mic again to send your answer"
    : isSpeaking
      ? "Tap the mic to interrupt and respond"
      : prefersVoice && !muted
        ? "The mic opens automatically after SKILZ speaks"
        : "Use the mic or type below"

  const progressPct = Math.min((userExchanges / MIN_EXCHANGES) * 100, 100)
  const statusMessage = canAnalyze
    ? "Enough detail collected — finish when you're ready."
    : userExchanges > 0 && localEligibility.missing.length > 0
      ? `Still need: ${localEligibility.missing.join(", ")}.`
      : undefined

  if (analyzing) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
        <div className="relative flex size-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-7 animate-pulse text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold">Finding your patterns…</h2>
          <p className="max-w-xs text-pretty text-sm text-muted-foreground">
            SKILZ is reviewing your conversation to surface potential strengths.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col">
      <ChatSessionHeader
        progress={progressPct}
        progressLabel={`${Math.min(userExchanges, MIN_EXCHANGES)} / ${MIN_EXCHANGES} answers`}
        statusMessage={statusMessage}
        statusTone={canAnalyze ? "primary" : "muted"}
        onEnd={handleEnd}
        badge={prefersVoice && !muted ? "Voice" : undefined}
      />

      <div className="relative mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-muted/30 via-background to-background">
        {!showTranscript ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
            <ListeningOrb state={orbState} caption={orbCaption} voiceMode={prefersVoice && !muted} />
            {displayReply && !voice.listening && (
              <ChatHeroMessage content={displayReply} streaming={streamingReply !== null} />
            )}
            {isThinking && !displayReply && <ChatTypingIndicator />}
          </div>
        ) : (
          <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                userInitial={profile.name || "Y"}
              />
            ))}
            {streamingReply !== null && (
              <ChatMessage role="assistant" content={streamingReply} streaming />
            )}
            {isThinking && streamingReply === null && <ChatTypingIndicator />}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive"
        >
          {error}
        </div>
      )}

      <div className="sticky bottom-0 mt-4 space-y-3 bg-background/95 pb-1 pt-2 backdrop-blur-md">
        <ChatComposer
          value={textValue}
          onChange={setTextValue}
          onSubmit={() => submitUser(textValue)}
          disabled={isThinking}
          hint={composerHint}
          muted={muted}
          onMuteToggle={handleMuteToggle}
          showTranscript={showTranscript}
          onTranscriptToggle={() => setShowTranscript((s) => !s)}
          listening={voice.listening}
          thinking={isThinking}
          speaking={!!isSpeaking}
          micDisabled={isThinking}
          onMicToggle={() => void handleMicToggle()}
        />

        {(readyToConclude || userExchanges >= MIN_EXCHANGES) && (
          <Button onClick={finish} variant="secondary" className="h-11 w-full rounded-xl" disabled={!canAnalyze}>
            <Sparkles className="mr-2 size-4" />
            {canAnalyze ? "See what we discovered" : "Need more detail first"}
          </Button>
        )}
      </div>
    </div>
  )
}

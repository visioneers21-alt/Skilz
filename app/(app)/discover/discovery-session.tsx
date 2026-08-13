"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Send, X, MessageSquare, Loader2, Sparkles, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
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

export function DiscoverySession() {
  const router = useRouter()
  const { state, setConversation, saveSkills } = useSkilz()
  const { profile } = state
  const { refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()
  const voice = useVoice()

  const [orbState, setOrbState] = useState<OrbState>("idle")
  const [messages, setMessages] = useState<Message[]>(state.conversation)
  const [textValue, setTextValue] = useState("")
  const [showTranscript, setShowTranscript] = useState(false)
  const [muted, setMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [readyToConclude, setReadyToConclude] = useState(false)
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)
  const [streamingReply, setStreamingReply] = useState<string | null>(null)

  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const streamSpeakerRef = useRef<StreamSpeaker | null>(null)
  const isStreamingRef = useRef(false)

  if (!streamSpeakerRef.current) {
    streamSpeakerRef.current = new StreamSpeaker()
  }

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

  const isBusy = orbState === "thinking" || orbState === "speaking" || streamingReply !== null

  const finishStreaming = useCallback(
    (reply: string) => {
      const msg: Message = { id: uid(), role: "assistant", content: reply, createdAt: Date.now() }
      setMessages((prev) => [...prev, msg])
      setStreamingReply(null)
      isStreamingRef.current = false

      if (muted || !voice.synthesisSupported) {
        setOrbState("idle")
        streamSpeakerRef.current?.reset()
        return
      }

      setOrbState("speaking")
      streamSpeakerRef.current!.flush(reply, () => setOrbState("idle"))
    },
    [muted, voice.synthesisSupported],
  )

  const requestNext = useCallback(
    async (history: Message[]) => {
      if (isStreamingRef.current) return
      isStreamingRef.current = true
      setOrbState("thinking")
      setError(null)
      setStreamingReply("")

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
            if (!muted && voice.synthesisSupported) {
              speaker.feed(fullReply)
            }
          },
          onDone: (result) => {
            if (result.eligibility) setEligibility(result.eligibility)
            setReadyToConclude(result.readyToConclude)
            finishStreaming(result.reply)
            void refreshSession()
          },
          onError: async (err) => {
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
          },
        },
      )
    },
    [profile, finishStreaming, refreshSession, handleAuthRequired, toWire, muted, voice.synthesisSupported],
  )

  // Keep the global store in sync without calling setState during a render/update phase.
  useEffect(() => {
    setConversation(messages)
  }, [messages, setConversation])

  // Kick off with the first question if this is a fresh session
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (messages.length === 0) void requestNext([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showTranscript])

  const submitUser = useCallback(
    (content: string) => {
      const normalized = normalizeSpeechText(content)
      const check = assessAnswerEligibility(normalized)
      if (!check.eligible) {
        setError(check.message)
        return
      }
      setError(null)
      const msg: Message = { id: uid(), role: "user", content: normalized, createdAt: Date.now() }
      setTextValue("")
      setMessages((prev) => {
        const next = [...prev, msg]
        void requestNext(next)
        return next
      })
    },
    [requestNext],
  )

  const handleMicToggle = useCallback(async () => {
    setError(null)

    if (orbState === "speaking") {
      voice.cancelSpeak()
      streamSpeakerRef.current?.cancel()
      setOrbState("idle")
    }

    if (voice.listening) {
      voice.stop()
      setOrbState("idle")
      const captured = voice.liveText.trim()
      voice.reset()
      if (captured) submitUser(captured)
      return
    }

    if (!voice.recognitionSupported) {
      setError("Voice input isn't available in this browser. You can type your answer instead.")
      return
    }

    voice.cancelSpeak()
    voice.reset()
    setOrbState("listening")
    const started = await voice.start()
    if (!started) setOrbState("idle")
  }, [voice, submitUser, orbState])

  // Surface permission-denied errors from the voice layer
  useEffect(() => {
    if (voice.permission === "denied") {
      setOrbState("idle")
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
    voice.stop()
    voice.cancelSpeak()
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
  }, [messages, saveSkills, router, voice, refreshSession, handleAuthRequired, canAnalyze, localEligibility, toWire])

  const handleEnd = useCallback(() => {
    voice.stop()
    voice.cancelSpeak()
    if (userExchanges >= 2) void finish()
    else router.push("/dashboard")
  }, [voice, userExchanges, finish, router])

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
  const displayReply = streamingReply ?? lastAssistant?.content ?? null

  if (analyzing) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-7 w-7 animate-pulse text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Finding your patterns…</h2>
        <p className="max-w-xs text-pretty text-sm text-muted-foreground">
          SKILZ is reviewing your conversation to surface potential strengths.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            SKILZ AI
          </div>
          <p className="text-xs text-muted-foreground">Skills Discovery Session</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleEnd} className="text-muted-foreground">
          <X className="mr-1 h-4 w-4" />
          End
        </Button>
      </div>

      {/* Progress hint */}
      <div className="mb-2">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Exploring your strengths</span>
          <span>
            {Math.min(userExchanges, MIN_EXCHANGES)} / {MIN_EXCHANGES} answers
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min((userExchanges / MIN_EXCHANGES) * 100, 100)}%` }}
          />
        </div>
        {!canAnalyze && userExchanges > 0 && localEligibility.missing.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            For accurate results, still need: {localEligibility.missing.join(", ")}.
          </p>
        )}
        {canAnalyze && (
          <p className="mt-2 text-xs font-medium text-primary">
            Enough detail collected — you can finish when ready.
          </p>
        )}
      </div>

      {!showTranscript ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          <ListeningOrb
            state={orbState}
            caption={
              voice.listening ? voice.liveText || "Start speaking…" : undefined
            }
          />
          {displayReply && (
            <Card
              key={streamingReply ? "streaming" : lastAssistant?.id}
              className="animate-fade-up max-w-md border-primary/10 bg-card p-5 text-center shadow-sm"
            >
              <p className="text-pretty text-base leading-relaxed">
                {displayReply}
                {streamingReply !== null && (
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
                )}
              </p>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {streamingReply !== null && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
                {streamingReply}
                <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-primary align-middle" />
              </div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="sticky bottom-0 space-y-3 border-t border-border bg-background/90 py-4 backdrop-blur">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (!muted) voice.cancelSpeak()
              setMuted((m) => !m)
            }}
            aria-label={muted ? "Unmute SKILZ voice" : "Mute SKILZ voice"}
            className="rounded-full"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Button
            size="lg"
            onClick={() => void handleMicToggle()}
            disabled={isBusy}
            aria-label={voice.listening ? "Stop and send" : "Start speaking"}
            className={cn(
              "h-16 w-16 rounded-full shadow-md transition-transform",
              voice.listening && "scale-105 bg-destructive hover:bg-destructive/90",
            )}
          >
            {orbState === "thinking" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : voice.listening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowTranscript((s) => !s)}
            aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
            className="rounded-full"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Text input fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitUser(textValue)
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault()
                submitUser(textValue)
              }
            }}
            placeholder="Or type your answer…"
            aria-label="Type your answer"
            disabled={isBusy}
            className="rounded-full bg-card"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!textValue.trim() || isBusy}
            className="rounded-full"
            aria-label="Send answer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {(readyToConclude || userExchanges >= MIN_EXCHANGES) && (
          <Button onClick={finish} variant="secondary" className="w-full" disabled={!canAnalyze}>
            <Sparkles className="mr-2 h-4 w-4" />
            {canAnalyze ? "See what we discovered" : "Need more detail first"}
          </Button>
        )}
      </div>
    </div>
  )
}

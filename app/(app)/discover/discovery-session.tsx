"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthForm } from "@/components/skilz/auth-form"
import { ChatSessionHeader } from "@/components/skilz/chat-session-header"
import { DiscoveryCelebration } from "@/components/skilz/discovery-celebration"
import { DiscoveryChapterIntro } from "@/components/skilz/discovery-chapter-intro"
import { DiscoveryChapterProgress } from "@/components/skilz/discovery-chapter-progress"
import { DiscoveryMascot } from "@/components/skilz/discovery-mascot"
import { DiscoveryScenarioPicker } from "@/components/skilz/discovery-scenario-picker"
import { SkillAnalysisService } from "@/lib/ai/services"
import { EligibilityError } from "@/lib/ai/eligibility"
import {
  getChapterForQuestionIndex,
  getChapterProgress,
  shouldShowChapterIntro,
} from "@/lib/discovery/chapters"
import { DISCOVERY_QUESTION_COUNT } from "@/lib/discovery/questions"
import {
  applyDiscoveryAnswer,
  buildDiscoveryTranscript,
  createDiscoveryState,
  discoveryProgress,
  getCurrentQuestion,
  isDiscoveryComplete,
  type DiscoveryEngineState,
} from "@/lib/discovery/engine"
import {
  clearPendingDiscovery,
  loadPendingDiscovery,
  savePendingDiscovery,
} from "@/lib/discovery/pending"
import {
  getIntroLines,
  getMilestoneMessage,
  getOptionUi,
  getQuestionUi,
  randomCheer,
} from "@/lib/discovery/presentation"
import { useSkilz } from "@/lib/data/store"
import { useAuth } from "@/lib/auth/auth-context"
import { useHandleAuthRequired } from "@/lib/auth/use-handle-auth-required"
import type { Message } from "@/lib/data/types"

const OPTION_KEY_MAP: Record<string, string> = {
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  "1": "a",
  "2": "b",
  "3": "c",
  "4": "d",
}

function engineToMessages(state: DiscoveryEngineState, name?: string): Message[] {
  const wire = buildDiscoveryTranscript(state, name ? { name } : undefined)
  const now = Date.now()
  return wire.map((m, i) => ({
    id: `m_${i}`,
    role: m.role,
    content: m.content,
    createdAt: now + i,
  }))
}

export function DiscoverySession() {
  const router = useRouter()
  const { state, setConversation, saveSkills } = useSkilz()
  const { profile } = state
  const { authenticated, loading: authLoading, refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()

  const [started, setStarted] = useState(false)
  const [engine, setEngine] = useState<DiscoveryEngineState>(() =>
    createDiscoveryState({ interests: profile.interests }),
  )
  const [analyzing, setAnalyzing] = useState(false)
  const [awaitingSignup, setAwaitingSignup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<{ message: string; emoji: string } | null>(null)
  const [mascotMood, setMascotMood] = useState<"idle" | "excited" | "thinking" | "celebrate">("idle")
  const [questionKey, setQuestionKey] = useState(0)
  const [chapterIntroAt, setChapterIntroAt] = useState<number | null>(null)
  const analyzeStarted = useRef(false)
  const restoredPending = useRef(false)

  const question = getCurrentQuestion(engine)
  const complete = isDiscoveryComplete(engine)
  const progress = discoveryProgress(engine)
  const intro = getIntroLines(profile.name)
  const chapterProgress = getChapterProgress(engine.questionIndex)
  const showingChapterIntro = started && chapterIntroAt !== null && !complete

  const q20Labels = question?.id === "q20-identity" ? question.options.map((o) => o.label) : undefined
  const questionUi = question ? getQuestionUi(question.id, q20Labels) : null

  const runAnalysis = useCallback(
    async (engineState: DiscoveryEngineState = engine) => {
      if (!isDiscoveryComplete(engineState) || analyzeStarted.current) return
      analyzeStarted.current = true
      setAnalyzing(true)
      setAwaitingSignup(false)
      setError(null)

      try {
        const transcript = buildDiscoveryTranscript(engineState, { name: profile.name })
        const skills = await SkillAnalysisService.analyze(transcript, {
          structured: true,
        })
        saveSkills(skills)
        clearPendingDiscovery()
        void refreshSession()
        router.push("/discover/results")
      } catch (err) {
        setAnalyzing(false)
        analyzeStarted.current = false
        if (err instanceof EligibilityError) {
          setError(err.message)
          return
        }
        setError(await handleAuthRequired(err, "We couldn't analyze your answers. Please try again."))
      }
    },
    [engine, profile.name, saveSkills, router, refreshSession, handleAuthRequired],
  )

  useEffect(() => {
    setConversation(engineToMessages(engine, profile.name))
  }, [engine, profile.name, setConversation])

  useEffect(() => {
    if (!celebration) return
    const t = window.setTimeout(() => setCelebration(null), 1200)
    return () => window.clearTimeout(t)
  }, [celebration])

  useEffect(() => {
    if (restoredPending.current || authLoading) return
    const saved = loadPendingDiscovery()
    if (!saved || !isDiscoveryComplete(saved)) return
    restoredPending.current = true
    setEngine(saved)
    setStarted(true)
    if (authenticated) {
      void runAnalysis(saved)
    } else {
      setAwaitingSignup(true)
    }
  }, [authLoading, authenticated, runAnalysis])

  useEffect(() => {
    if (awaitingSignup && authenticated && !authLoading) {
      void runAnalysis(engine)
    }
  }, [awaitingSignup, authenticated, authLoading, engine, runAnalysis])

  const progressPct = (progress.answered / DISCOVERY_QUESTION_COUNT) * 100

  const mascotMessage = useMemo(() => {
    if (complete) return "You did it! Create an account to see your potential."
    if (pending) return "Got it…"
    if (questionUi) return questionUi.mascotLine
    return "Let's explore what fits you."
  }, [complete, pending, questionUi])

  const choices = useMemo(() => {
    if (!question || !questionUi) return []
    return question.options.map((opt) => ({
      id: opt.id,
      ui: getOptionUi(question.id, opt.id, opt.label, q20Labels),
    }))
  }, [question, questionUi, q20Labels])

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!question || pending || complete || showingChapterIntro) return
      const option = question.options.find((o) => o.id === optionId)
      if (!option) return

      setError(null)
      setPending(true)
      setSelectedId(optionId)
      setMascotMood("thinking")

      window.setTimeout(() => {
        let nextIndex = engine.questionIndex
        let nextEngine = engine
        setEngine((prev) => {
          const q = getCurrentQuestion(prev)
          if (!q) return prev
          const opt = q.options.find((o) => o.id === optionId)
          if (!opt) return prev
          const next = applyDiscoveryAnswer(prev, q, opt)
          nextIndex = next.questionIndex
          nextEngine = next
          return next
        })

        const milestone = getMilestoneMessage(nextIndex)
        setCelebration({
          message: milestone ?? randomCheer(),
          emoji: milestone ? "🏅" : "✨",
        })
        setMascotMood(milestone ? "celebrate" : "excited")
        setSelectedId(null)
        setQuestionKey((k) => k + 1)
        setPending(false)

        if (nextIndex < DISCOVERY_QUESTION_COUNT && shouldShowChapterIntro(nextIndex)) {
          setChapterIntroAt(nextIndex)
        } else if (nextIndex >= DISCOVERY_QUESTION_COUNT) {
          window.setTimeout(() => {
            savePendingDiscovery(nextEngine)
            if (authenticated) {
              void runAnalysis(nextEngine)
            } else {
              setAwaitingSignup(true)
            }
          }, 400)
        }

        window.setTimeout(() => setMascotMood("idle"), 600)
      }, 280)
    },
    [question, pending, complete, showingChapterIntro, engine, authenticated, runAnalysis],
  )

  useEffect(() => {
    if (!started || complete || showingChapterIntro || pending || !question) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, button")) return

      const mapped = OPTION_KEY_MAP[event.key.toLowerCase()]
      if (!mapped) return
      const exists = question.options.some((o) => o.id === mapped)
      if (!exists) return
      event.preventDefault()
      handleSelect(mapped)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [started, complete, showingChapterIntro, pending, question, handleSelect])

  const handleEnd = useCallback(() => {
    router.push("/dashboard")
  }, [router])

  const handleStart = () => {
    setStarted(true)
    setChapterIntroAt(0)
  }

  if (analyzing) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <DiscoveryMascot mood="excited" size="lg" message="Reading your answers and finding patterns…" />
        <div className="relative flex size-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-7 animate-pulse text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold">Finding your top potential areas</h2>
          <p className="max-w-xs text-pretty text-sm text-muted-foreground">
            SKILZ is analyzing your full discovery journey — looking for patterns across all your choices.
          </p>
        </div>
      </div>
    )
  }

  if (awaitingSignup && complete) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-1">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-6 text-center sm:p-8">
          <DiscoveryMascot mood="celebrate" message="Journey complete!" />
          <h2 className="mt-4 font-display text-2xl font-bold">Create an account to see your results</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your discovery answers are saved. Sign up free to unlock your potential profile — areas worth
            exploring based on what you chose.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Suspense fallback={null}>
            <AuthForm mode="signup" showGuestHint={false} redirectTo="/discover" />
          </Suspense>
        </div>
        {error && (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }

  if (!started) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col justify-center gap-6 px-1">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-6 sm:p-8 text-center animate-fade-up">
          <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">{intro.headline}</h1>
          <p className="mt-2 text-muted-foreground">{intro.subline}</p>
          <ul className="mt-6 space-y-3 text-left">
            {intro.steps.map((step) => (
              <li key={step.text} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm">
                <span className="text-2xl" aria-hidden>{step.emoji}</span>
                <span className="font-medium">{step.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Try the journey free — create an account at the end to see your potential profile.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 w-full rounded-2xl text-base font-bold sm:w-auto sm:px-10"
            onClick={handleStart}
          >
            <Rocket className="mr-2 size-5" />
            Begin discovery
          </Button>
        </div>
      </div>
    )
  }

  if (showingChapterIntro) {
    const chapter = getChapterForQuestionIndex(chapterIntroAt ?? 0)
    return (
      <div className="mx-auto max-w-2xl px-1">
        <DiscoveryChapterIntro chapter={chapter} onContinue={() => setChapterIntroAt(null)} />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col">
      <DiscoveryCelebration
        message={celebration?.message ?? ""}
        emoji={celebration?.emoji}
        visible={!!celebration}
      />

      <ChatSessionHeader
        title="Discovery journey"
        subtitle={chapterProgress.chapter.title}
        progress={progressPct}
        progressLabel={
          complete
            ? "Complete"
            : `${chapterProgress.chapter.title} · ${chapterProgress.momentInChapter} of ${chapterProgress.chapterSize}`
        }
        statusMessage={
          complete
            ? "Almost there — create an account to see your results."
            : progress.answered === 0
              ? "Read the moment, then tap what feels most like you."
              : `${progress.activeSkillCount} areas still in the running`
        }
        statusTone={complete ? "primary" : "muted"}
        onEnd={handleEnd}
      />

      <div className="mt-3">
        <DiscoveryChapterProgress
          chapterIndex={chapterProgress.chapterIndex}
          momentInChapter={chapterProgress.momentInChapter}
          chapterSize={chapterProgress.chapterSize}
          complete={complete}
        />
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
        {!complete && question && questionUi && (
          <section
            key={questionKey}
            className="rounded-3xl border border-primary/15 bg-gradient-to-b from-primary/5 via-background to-background p-5 sm:p-6 animate-fade-up"
          >
            <DiscoveryMascot mood={mascotMood} message={mascotMessage} size="sm" />

            <div className="mt-4 rounded-2xl border border-border/60 bg-card/80 p-4">
              <p className="text-xs font-medium text-muted-foreground">{questionUi.scene}</p>
              <h2 className="mt-2 font-display text-xl font-bold leading-snug text-balance sm:text-2xl">
                {questionUi.emoji} {questionUi.title}
              </h2>
            </div>

            <div className="mt-4">
              <DiscoveryScenarioPicker
                choices={choices}
                onSelect={handleSelect}
                disabled={pending}
                selectedId={selectedId}
              />
            </div>
          </section>
        )}
      </div>

      {error && !awaitingSignup && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive"
        >
          {error}
        </div>
      )}
    </div>
  )
}

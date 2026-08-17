"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Sparkles, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatSessionHeader } from "@/components/skilz/chat-session-header"
import { DiscoveryCelebration } from "@/components/skilz/discovery-celebration"
import { DiscoveryChoices } from "@/components/skilz/discovery-choices"
import { DiscoveryMascot } from "@/components/skilz/discovery-mascot"
import { DiscoveryQuestMap } from "@/components/skilz/discovery-quest-map"
import { DiscoverySkillRadar } from "@/components/skilz/discovery-skill-radar"
import { DiscoveryStickerBook } from "@/components/skilz/discovery-sticker-book"
import { SkillAnalysisService } from "@/lib/ai/services"
import { EligibilityError } from "@/lib/ai/eligibility"
import { DISCOVERY_QUESTION_COUNT } from "@/lib/discovery/questions"
import {
  applyDiscoveryAnswer,
  buildDiscoveryTranscript,
  createDiscoveryState,
  discoveryProgress,
  getCandidateSlugsForAnalysis,
  getCurrentQuestion,
  isDiscoveryComplete,
  type DiscoveryEngineState,
} from "@/lib/discovery/engine"
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
  const { refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()

  const [started, setStarted] = useState(false)
  const [engine, setEngine] = useState<DiscoveryEngineState>(() =>
    createDiscoveryState({ interests: profile.interests }),
  )
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<{ message: string; emoji: string } | null>(null)
  const [mascotMood, setMascotMood] = useState<"idle" | "excited" | "thinking" | "celebrate">("idle")
  const [questionKey, setQuestionKey] = useState(0)

  const question = getCurrentQuestion(engine)
  const complete = isDiscoveryComplete(engine)
  const progress = discoveryProgress(engine)
  const intro = getIntroLines(profile.name)

  const q20Labels = question?.id === "q20-identity" ? question.options.map((o) => o.label) : undefined
  const questionUi = question ? getQuestionUi(question.id, q20Labels) : null

  useEffect(() => {
    setConversation(engineToMessages(engine, profile.name))
  }, [engine, profile.name, setConversation])

  useEffect(() => {
    if (!celebration) return
    const t = window.setTimeout(() => setCelebration(null), 1400)
    return () => window.clearTimeout(t)
  }, [celebration])

  const progressPct = (progress.answered / DISCOVERY_QUESTION_COUNT) * 100

  const mascotMessage = useMemo(() => {
    if (complete) return "You did it! Ready to see your superpowers?"
    if (pending) return "Locking in your pick…"
    if (questionUi) return questionUi.mascotLine
    return "Let's find your hidden strengths!"
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
      if (!question || pending || complete) return
      const option = question.options.find((o) => o.id === optionId)
      if (!option) return

      setError(null)
      setPending(true)
      setSelectedId(optionId)
      setMascotMood("thinking")

      window.setTimeout(() => {
        setEngine((prev) => {
          const q = getCurrentQuestion(prev)
          if (!q) return prev
          const opt = q.options.find((o) => o.id === optionId)
          if (!opt) return prev
          return applyDiscoveryAnswer(prev, q, opt)
        })

        const nextAnswered = engine.questionIndex + 1
        const milestone = getMilestoneMessage(nextAnswered)
        setCelebration({
          message: milestone ?? randomCheer(),
          emoji: milestone ? "🏅" : "✨",
        })
        setMascotMood(milestone ? "celebrate" : "excited")
        setSelectedId(null)
        setQuestionKey((k) => k + 1)
        setPending(false)

        window.setTimeout(() => setMascotMood("idle"), 800)
      }, 520)
    },
    [question, pending, complete, engine.questionIndex],
  )

  const finish = useCallback(async () => {
    if (!complete) return
    setAnalyzing(true)
    setError(null)
    try {
      const transcript = buildDiscoveryTranscript(engine, { name: profile.name })
      const candidateSlugs = getCandidateSlugsForAnalysis(engine)
      const skills = await SkillAnalysisService.analyze(transcript, {
        candidateSlugs,
        structured: true,
      })
      saveSkills(skills)
      void refreshSession()
      router.push("/discover/results")
    } catch (err) {
      setAnalyzing(false)
      if (err instanceof EligibilityError) {
        setError(err.message)
        return
      }
      setError(await handleAuthRequired(err, "We couldn't analyze your answers. Please try again."))
    }
  }, [engine, profile.name, saveSkills, router, refreshSession, handleAuthRequired, complete])

  const handleEnd = useCallback(() => {
    if (complete) void finish()
    else router.push("/dashboard")
  }, [complete, finish, router])

  if (analyzing) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <DiscoveryMascot mood="excited" size="lg" message="Mixing your answers into superpower potions…" />
        <div className="relative flex size-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-7 animate-pulse text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold">Almost there…</h2>
          <p className="max-w-xs text-pretty text-sm text-muted-foreground">
            SKILZ is finding the skills that match YOU best.
          </p>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col justify-center gap-6 px-1">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-6 sm:p-8 text-center animate-fade-up">
          <DiscoveryMascot mood="excited" size="lg" message="Hi! I'm your SKILZ guide. Let's play a quick quest!" />
          <h1 className="mt-6 font-display text-2xl font-bold capitalize sm:text-3xl">{intro.headline}</h1>
          <p className="mt-2 text-muted-foreground">{intro.subline}</p>
          <ul className="mt-6 space-y-3 text-left">
            {intro.steps.map((step) => (
              <li key={step.text} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm">
                <span className="text-2xl" aria-hidden>{step.emoji}</span>
                <span className="font-medium">{step.text}</span>
              </li>
            ))}
          </ul>
          <Button
            size="lg"
            className="mt-8 h-12 w-full rounded-2xl text-base font-bold sm:w-auto sm:px-10"
            onClick={() => setStarted(true)}
          >
            <Rocket className="mr-2 size-5" />
            Start the quest!
          </Button>
        </div>
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
        title="Skill Quest"
        subtitle="20 fun stops · find your superpowers"
        progress={progressPct}
        progressLabel={`Quest ${Math.min(progress.answered + (complete ? 0 : 1), DISCOVERY_QUESTION_COUNT)} / ${DISCOVERY_QUESTION_COUNT}`}
        statusMessage={
          complete
            ? "Quest complete! Tap below to reveal your skills."
            : progress.answered === 0
              ? "Tap a card to pick your answer — no wrong choices!"
              : `${progress.activeSkillCount} skills still in the running`
        }
        statusTone={complete ? "primary" : "muted"}
        onEnd={handleEnd}
      />

      <div className="mt-3 space-y-3">
        <DiscoveryQuestMap currentStep={progress.answered + 1} complete={complete} />
        <DiscoverySkillRadar
          topSkills={progress.topSkills}
          activeCount={progress.activeSkillCount}
          answered={progress.answered}
        />
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
        {!complete && question && questionUi && (
          <section
            key={questionKey}
            className="rounded-3xl border-2 border-primary/15 bg-gradient-to-b from-primary/5 via-background to-background p-5 sm:p-6 animate-fade-up"
          >
            <DiscoveryMascot mood={mascotMood} message={mascotMessage} />

            <div className="mt-5 rounded-2xl border border-border/60 bg-card/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {questionUi.emoji} Stop {progress.answered + 1}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{questionUi.scene}</p>
              <h2 className="mt-2 font-display text-xl font-bold leading-snug text-balance sm:text-2xl">
                {questionUi.title}
              </h2>
            </div>

            <div className="mt-4">
              <DiscoveryChoices
                choices={choices}
                onSelect={handleSelect}
                disabled={pending}
                selectedId={selectedId}
              />
            </div>
          </section>
        )}

        {complete && (
          <section className="rounded-3xl border-2 border-success/30 bg-gradient-to-b from-success/10 to-background p-6 text-center animate-discovery-pop">
            <PartyPopper className="mx-auto size-10 text-success" />
            <DiscoveryMascot mood="celebrate" message="Woohoo! Quest complete!" />
            <h2 className="mt-4 font-display text-2xl font-bold">Your top matches</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              These skills rose to the top based on your picks.
            </p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {progress.topSkills.map((s, i) => (
                <li
                  key={s.slug}
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                >
                  {["🥇", "🥈", "🥉"][i]} {s.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        <DiscoveryStickerBook answers={engine.answers} />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive"
        >
          {error}
        </div>
      )}

      <div className="sticky bottom-0 mt-4 bg-background/95 pb-1 pt-2 backdrop-blur-md">
        {complete && (
          <Button
            onClick={() => void finish()}
            size="lg"
            className="h-12 w-full rounded-2xl text-base font-bold"
          >
            <Sparkles className="mr-2 size-5" />
            Reveal my superpowers!
          </Button>
        )}
      </div>
    </div>
  )
}

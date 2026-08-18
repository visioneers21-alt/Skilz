'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ListeningOrb } from '@/components/skilz/listening-orb'
import {
  ChallengeResponseInput,
  ChallengeWordCount,
  isChallengeResponseEligible,
} from '@/components/skilz/challenge-response-input'
import { ChallengeReflectionForm } from '@/components/skilz/challenge-reflection'
import { useVoice } from '@/lib/voice/use-voice'
import { ChallengeEvaluationService, EligibilityError } from '@/lib/ai/services'
import { normalizeSpeechText } from '@/lib/ai/eligibility'
import { useSkilz } from '@/lib/data/store'
import { useAuth } from '@/lib/auth/auth-context'
import { useHandleAuthRequired } from '@/lib/auth/use-handle-auth-required'
import { resolveChallengeForPage } from '@/lib/challenges/catalog'
import { cn } from '@/lib/utils'

type Phase = 'prompt' | 'responding' | 'evaluating' | 'feedback' | 'reflection' | 'done'

export default function ChallengePageClient() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { state, recordAttempt, strengthenSkill, addChallengeReflection, setSkillFeedback } = useSkilz()
  const { refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()
  const voice = useVoice()

  const skillSlug = searchParams.get('skill') ?? ''
  const skill = state.skills.find((s) => s.slug === skillSlug) ?? state.skills[0]

  const challenge = useMemo(() => {
    if (!params.slug) return null
    const slug = skill?.slug ?? skillSlug
    if (!slug) return null
    return resolveChallengeForPage(params.slug, slug, skill?.name)
  }, [params.slug, skill, skillSlug])

  const [phase, setPhase] = useState<Phase>('prompt')
  const [response, setResponse] = useState('')
  const [mode, setMode] = useState<'voice' | 'text'>(state.profile.interactionPreference)
  const [feedback, setFeedback] = useState<{
    strengths: string[]
    improvements: string[]
    summary: string
  } | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!voice.listening && phase === 'responding' && mode === 'voice') {
      const captured = voice.transcript.trim()
      if (captured) setResponse(captured)
    }
  }, [voice.listening, voice.transcript, phase, mode])

  const submit = useCallback(async () => {
    if (!challenge) return
    const trimmed = (response.trim() || voice.liveText.trim())
    if (!trimmed) return

    const eligibility = isChallengeResponseEligible(trimmed)
    if (!eligibility.eligible) {
      setError(eligibility.message)
      return
    }

    voice.stop()
    setPhase('evaluating')
    setError(null)

    try {
      const result = await ChallengeEvaluationService.evaluate({
        skillName: skill?.name ?? challenge.skillSlug,
        challengeTitle: challenge.title,
        challengePrompt: challenge.prompt,
        goal: challenge.goal,
        response: normalizeSpeechText(trimmed),
      })

      setFeedback(result)
      const id = recordAttempt({
        challengeSlug: challenge.slug,
        skillSlug: challenge.skillSlug,
        response: trimmed,
        mode,
        strengths: result.strengths,
        improvements: result.improvements,
        summary: result.summary,
      })
      setAttemptId(id)
      if (skill) {
        strengthenSkill(skill.slug, result.summary || result.strengths[0] || 'Completed challenge')
      }
      setPhase('feedback')
      void refreshSession()
    } catch (err) {
      if (err instanceof EligibilityError) {
        setError(err.message)
      } else {
        setError(await handleAuthRequired(err, 'Could not evaluate your response. Please try again.'))
      }
      setPhase('responding')
    }
  }, [
    challenge,
    response,
    skill,
    mode,
    recordAttempt,
    strengthenSkill,
    voice,
    refreshSession,
    handleAuthRequired,
    voice.liveText,
  ])

  const responseText = response.trim() || voice.liveText.trim()
  const canSubmit = isChallengeResponseEligible(responseText).eligible

  if (!challenge) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-xl font-bold">Challenge not found</h1>
        <p className="text-sm text-muted-foreground">Pick a challenge from your dashboard or explore page.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to home</Link>
        </Button>
      </div>
    )
  }

  if (phase === 'evaluating') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Reviewing your response…</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          SKILZ looks for strengths and growth areas — this is practice, not a final grade.
        </p>
      </div>
    )
  }

  if (phase === 'reflection') {
    return (
      <div className="mx-auto max-w-xl">
        <ChallengeReflectionForm
          skillName={skill?.name}
          onSubmit={(reflection, interestFeedback) => {
            if (attemptId) addChallengeReflection(attemptId, reflection)
            if (interestFeedback && skill) setSkillFeedback(skill.slug, interestFeedback)
            setPhase('done')
          }}
          onSkip={() => setPhase('done')}
        />
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <p className="text-4xl" aria-hidden>🎉</p>
        <h1 className="font-display text-2xl font-bold">Nice work!</h1>
        <p className="text-sm text-muted-foreground">
          You tested an area of potential and shared how it felt. That&apos;s how real discovery works.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/explore">Explore more areas</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'feedback' && feedback) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <header className="text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Challenge complete</h1>
          <p className="mt-2 text-sm text-muted-foreground">{feedback.summary}</p>
          {skill && (
            <p className="mt-1 text-xs text-muted-foreground">
              Testing potential in: <span className="font-medium text-foreground">{skill.name}</span>
            </p>
          )}
        </header>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
            What you did well
          </h2>
          <ul className="mt-3 space-y-2">
            {feedback.strengths.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            To grow next
          </h2>
          <ul className="mt-3 space-y-2">
            {feedback.improvements.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <Button size="lg" className="w-full" onClick={() => setPhase('reflection')}>
          Continue to reflection
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <header>
        <p className="text-sm font-semibold text-primary">Try it · Mini-challenge</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{challenge.title}</h1>
        {skill && (
          <p className="mt-1 text-sm text-muted-foreground">
            Testing your potential in <span className="font-medium text-foreground">{skill.name}</span>
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          This helps you explore whether this area fits — not prove you&apos;re already an expert.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-pretty leading-relaxed">{challenge.prompt}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Goal:</span> {challenge.goal}
        </p>
      </section>

      {phase === 'prompt' ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">How would you like to respond?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setMode('voice')
                setPhase('responding')
              }}
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
            >
              <Mic className="size-5 text-primary" />
              <p className="mt-3 font-semibold">Speak your answer</p>
              <p className="mt-1 text-sm text-muted-foreground">Use your voice — SKILZ will transcribe it.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('text')
                setPhase('responding')
              }}
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
            >
              <Send className="size-5 text-primary" />
              <p className="mt-3 font-semibold">Type your answer</p>
              <p className="mt-1 text-sm text-muted-foreground">Write at your own pace — at least 25 words in your own words.</p>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {mode === 'voice' ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <ListeningOrb
                state={voice.listening ? 'listening' : 'idle'}
                caption={
                  voice.listening
                    ? voice.liveText || 'Start speaking…'
                    : response || voice.transcript || undefined
                }
              />
              <Button
                size="lg"
                className={cn(
                  'rounded-full',
                  voice.listening && 'bg-destructive hover:bg-destructive/90',
                )}
                onClick={async () => {
                  if (voice.listening) {
                    voice.stop()
                    const captured = voice.liveText.trim()
                    if (captured) setResponse(captured)
                  } else {
                    voice.reset()
                    await voice.start()
                  }
                }}
              >
                {voice.listening ? (
                  <>
                    <MicOff className="size-4" />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="size-4" />
                    {response ? 'Record again' : 'Start recording'}
                  </>
                )}
              </Button>
              <ChallengeWordCount text={response.trim() || voice.liveText} />
            </div>
          ) : (
            <ChallengeResponseInput
              value={response}
              onChange={setResponse}
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={!canSubmit}
            onClick={() => {
              const text = response.trim() || voice.liveText.trim()
              if (text) setResponse(text)
              void submit()
            }}
          >
            Submit response
            <ArrowRight className="size-4" />
          </Button>
          {!canSubmit && responseText.length > 0 && !error && (
            <p className="text-center text-xs text-muted-foreground">
              Give a fuller response (25+ words) so feedback is accurate.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

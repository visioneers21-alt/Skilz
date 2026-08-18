'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lightbulb, Loader2, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/skilz/status-badge'
import { SkillAdviceService } from '@/lib/ai/services'
import { useHandleAuthRequired } from '@/lib/auth/use-handle-auth-required'
import type { SkilzState } from '@/lib/data/types'
import { challengeForSkill, challengeHref } from '@/lib/challenges/catalog'

const SHOW_ADVICE_KEY = 'skilz_show_advice'

export function markDiscoveryAdvicePending() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SHOW_ADVICE_KEY, '1')
}

export function DiscoveryAdvicePanel({ state }: { state: SkilzState }) {
  const router = useRouter()
  const handleAuthRequired = useHandleAuthRequired()
  const started = useRef(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [highlights, setHighlights] = useState<
    { skillName: string; advice: string; nextStep: string }[]
  >([])

  const { skills, profile } = state

  useEffect(() => {
    if (started.current || skills.length === 0) return
    const shouldShow = sessionStorage.getItem(SHOW_ADVICE_KEY) === '1'
    if (!shouldShow) return

    started.current = true
    setVisible(true)
    setLoading(true)
    sessionStorage.removeItem(SHOW_ADVICE_KEY)

    void SkillAdviceService.get({
      skills: skills.map((s) => ({
        name: s.name,
        statusLabel: s.statusLabel,
        reasoning: s.reasoning,
        developmentAreas: s.developmentAreas,
      })),
      profile: {
        name: profile.name,
        interests: profile.interests,
        goal: profile.goal,
      },
    })
      .then((result) => {
        setSummary(result.summary)
        setHighlights(result.highlights)
        setLoading(false)
      })
      .catch(async (err) => {
        setLoading(false)
        setError(await handleAuthRequired(err, 'Could not load personalized advice. Please try again.'))
      })
  }, [skills, profile, handleAuthRequired])

  if (!visible) return null

  function dismiss() {
    setVisible(false)
    router.replace('/dashboard')
  }

  return (
    <section className="rounded-3xl border border-primary/25 bg-gradient-to-b from-primary/10 via-card to-card p-6 md:p-8 animate-fade-up">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Discovery complete
          </p>
          <h2 className="mt-1 font-display text-xl font-bold md:text-2xl">
            {profile.name ? `${profile.name}, here` : 'Here'}&apos;s what SKILZ suggests
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI guidance based on your journey — areas of potential to explore, not final labels.
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 py-5 text-sm text-muted-foreground">
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
          Reading your discovery answers and preparing personalized advice…
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {error}
        </p>
      )}

      {!loading && summary && (
        <p className="mt-6 text-pretty text-sm leading-relaxed md:text-base">{summary}</p>
      )}

      {!loading && highlights.length > 0 && (
        <ul className="mt-6 space-y-4">
          {highlights.map((item) => {
            const skill = skills.find(
              (s) => s.name.toLowerCase() === item.skillName.toLowerCase(),
            )
            const challenge = skill
              ? challengeForSkill(skill.slug, skill.name)
              : null

            return (
              <li
                key={item.skillName}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 md:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-bold">{item.skillName}</h3>
                  {skill && <StatusBadge status={skill.statusLabel} />}
                </div>
                <p className="mt-2 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {item.advice}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-foreground">Try next: </span>
                  {item.nextStep}
                </p>
                {challenge && skill && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href={challengeHref(challenge.slug, skill.slug)}>
                      <Trophy className="size-4" />
                      Mini-challenge
                    </Link>
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!loading && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/skills">
              View your skills
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={dismiss}>
            Continue to home
          </Button>
        </div>
      )}
    </section>
  )
}

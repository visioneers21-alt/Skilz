'use client'

import Link from 'next/link'
import {
  Mic,
  Sparkles,
  ArrowRight,
  Trophy,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillRow } from '@/components/skilz/skill-card'
import { JourneyStrip } from '@/components/skilz/journey-strip'
import { NextStepCard } from '@/components/skilz/next-step-card'
import { useSkilz } from '@/lib/data/store'
import { challengeForSkill } from '@/lib/data/seed'
import { getPrimaryNextStep, pickFocusSkill } from '@/lib/recommendations/next-steps'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { state } = useSkilz()
  const { profile, skills, discoveryComplete, attempts } = state

  const nextStep = getPrimaryNextStep(state)
  const focusSkill = pickFocusSkill(state)
  const todaysChallenge = focusSkill
    ? challengeForSkill(focusSkill.slug)
    : null

  const strengths = skills.filter((s) => s.category === 'strong').slice(0, 4)
  const displayed = strengths.length ? strengths : skills.slice(0, 4)

  return (
    <div className="space-y-6">
      <header className="pt-1">
        <h1 className="text-balance text-2xl font-bold md:text-3xl">
          {greeting()}, {profile.name} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {discoveryComplete
            ? 'One clear next step — grounded in what you actually said.'
            : 'Most people guess at their strengths. You can find yours with real stories.'}
        </p>
      </header>

      <NextStepCard step={nextStep} />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">
              Evidence so far
            </h2>
            {skills.length > 0 && (
              <Link
                href="/skills"
                className="text-sm font-medium text-primary hover:underline"
              >
                See all
              </Link>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Hypotheses from your conversation — validate with challenges to strengthen them.
          </p>
          {displayed.length > 0 ? (
            <div className="mt-3 flex flex-col">
              {displayed.map((skill) => (
                <SkillRow key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-muted-foreground">
                No skills yet. A 10-minute conversation with SKILZ surfaces patterns
                you might not see yourself.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/discover">Start discovering</Link>
              </Button>
            </div>
          )}
        </section>

        {todaysChallenge && (
          <section className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Trophy className="size-4.5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold">
                  Validate a skill
                </h2>
                {focusSkill && (
                  <p className="text-xs text-muted-foreground">
                    Testing: {focusSkill.name}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 text-balance font-display text-lg font-bold">
              {todaysChallenge.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {todaysChallenge.prompt}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {todaysChallenge.estimatedTime}
              {attempts.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{attempts.length} completed</span>
                </>
              )}
            </div>
            <Button asChild className="mt-auto pt-0.5" size="lg">
              <Link href={`/challenge/${todaysChallenge.slug}`}>
                Start challenge
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>
        )}
      </div>

      {discoveryComplete && (
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Go deeper</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Skill discovery isn&apos;t one-and-done. Another session adds evidence
                and refines your profile — previous skills are merged, not replaced.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/discover">
                <Mic className="size-4" />
                Continue discovery
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Growth journey</h2>
          <Link
            href="/progress"
            className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
          >
            Progress
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <JourneyStrip
          className="mt-5"
          discoveryComplete={discoveryComplete}
          hasChallenge={attempts.length > 0}
          hasPlan={state.plan.length > 0}
        />
      </section>
    </div>
  )
}

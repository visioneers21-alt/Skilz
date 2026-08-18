'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Compass,
  Sparkles,
  Trophy,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillRow } from '@/components/skilz/skill-card'
import { JourneyStrip } from '@/components/skilz/journey-strip'
import { NextStepCard } from '@/components/skilz/next-step-card'
import { TalentProfileSummary, DiscoveryDimensionsNote } from '@/components/skilz/talent-profile-summary'
import { DiscoveryAdvicePanel } from '@/components/skilz/discovery-advice-panel'
import { RecommendationsPanel } from '@/components/skilz/recommendations-panel'
import { useSkilz } from '@/lib/data/store'
import { challengeForSkill, challengeHref } from '@/lib/challenges/catalog'
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
    ? challengeForSkill(focusSkill.slug, focusSkill.name)
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
            ? 'Discover → test → understand → explore → develop. One clear next step below.'
            : 'Find areas of potential, test them with activities, and explore paths that fit you.'}
        </p>
        <DiscoveryDimensionsNote />
      </header>

      <DiscoveryAdvicePanel state={state} />

      <TalentProfileSummary state={state} />

      <NextStepCard step={nextStep} />

      {discoveryComplete && <RecommendationsPanel state={state} />}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Potential areas</h2>
            {skills.length > 0 && (
              <Link href="/skills" className="text-sm font-medium text-primary hover:underline">
                See all
              </Link>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Indications from discovery — validate with mini-challenges to learn what fits.
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
                Complete the discovery journey to see your potential profile.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/discover">Start discovery</Link>
              </Button>
            </div>
          )}
        </section>

        {todaysChallenge && focusSkill && (
          <section className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Trophy className="size-4.5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold">Try it</h2>
                <p className="text-xs text-muted-foreground">Testing: {focusSkill.name}</p>
              </div>
            </div>
            <p className="mt-4 text-balance font-display text-lg font-bold">{todaysChallenge.title}</p>
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {todaysChallenge.prompt}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {todaysChallenge.estimatedTime}
              {attempts.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{attempts.length} tried</span>
                </>
              )}
            </div>
            <Button asChild className="mt-auto pt-0.5" size="lg">
              <Link href={challengeHref(todaysChallenge.slug, focusSkill.slug)}>
                Start mini-challenge
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
              <h2 className="font-display text-base font-bold">Keep exploring</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Discovery isn&apos;t one-and-done. Retry the quest or explore new fields as you grow.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/explore">
                  <Compass className="size-4" />
                  Explore
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/discover">
                  <Sparkles className="size-4" />
                  Rediscover
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Your journey</h2>
          <Link
            href="/progress"
            className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
          >
            Track progress
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <JourneyStrip className="mt-5" state={state} />
      </section>
    </div>
  )
}

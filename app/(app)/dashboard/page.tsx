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
import { useSkilz } from '@/lib/data/store'
import { challengeForSkill, CHALLENGES } from '@/lib/data/seed'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { state } = useSkilz()
  const { profile, skills, discoveryComplete, attempts } = state

  const strengths = skills.filter((s) => s.category === 'strong').slice(0, 4)
  const displayed = strengths.length ? strengths : skills.slice(0, 4)

  const focusSkill = skills[0]
  const todaysChallenge = focusSkill
    ? challengeForSkill(focusSkill.slug)
    : CHALLENGES[0]

  return (
    <div className="space-y-6">
      <header className="pt-1">
        <h1 className="text-balance text-2xl font-bold md:text-3xl">
          {greeting()}, {profile.name} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Let&apos;s continue discovering what you&apos;re capable of.
        </p>
      </header>

      {/* Continue discovery */}
      <section className="overflow-hidden rounded-3xl bg-primary text-primary-foreground">
        <div className="relative p-6 md:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary-foreground/10 blur-2xl"
          />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            {discoveryComplete ? 'Discovery complete' : 'Start here'}
          </span>
          <h2 className="mt-4 max-w-md text-balance text-xl font-bold text-primary-foreground md:text-2xl">
            {discoveryComplete
              ? 'Keep exploring — SKILZ has more to uncover.'
              : 'Your skills discovery journey is ready to begin.'}
          </h2>
          <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
            {discoveryComplete
              ? 'Pick up the conversation or dive into a challenge to strengthen your evidence.'
              : 'Have a natural conversation with SKILZ. No right answers — just tell it about you.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link href="/discover">
                <Mic className="size-4" />
                Talk to SKILZ
              </Link>
            </Button>
            {discoveryComplete && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/skills">
                  View my skills
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current strengths */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">
              Current strengths
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
          {displayed.length > 0 ? (
            <div className="mt-3 flex flex-col">
              {displayed.map((skill) => (
                <SkillRow key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-muted-foreground">
                No strengths identified yet. Talk to SKILZ to discover your
                potential.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/discover">Start discovering</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Today's challenge */}
        <section className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Trophy className="size-4.5" />
            </span>
            <h2 className="font-display text-base font-bold">
              Today&apos;s challenge
            </h2>
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
                <span>{attempts.length} completed so far</span>
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
      </div>

      {/* Growth journey */}
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

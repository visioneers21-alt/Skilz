'use client'

import Link from 'next/link'
import { ArrowRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecommendationsPanel } from '@/components/skilz/recommendations-panel'
import { WhyRecommendation } from '@/components/skilz/why-recommendation'
import { useSkilz } from '@/lib/data/store'
import { rankSkillsForRecommendations } from '@/lib/recommendations/explain'
import { challengeForSkill, challengeHref } from '@/lib/challenges/catalog'
import { suggestCareerAreas } from '@/lib/career/paths'
import { pickFocusSkill } from '@/lib/recommendations/next-steps'

export default function ExplorePage() {
  const { state } = useSkilz()
  const { skills, profile, discoveryComplete } = state
  const ranked = rankSkillsForRecommendations(state)
  const focus = pickFocusSkill(state)
  const careerAreas = suggestCareerAreas(ranked, 4)

  if (!discoveryComplete || skills.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <p className="text-4xl" aria-hidden>🧭</p>
        <h1 className="font-display text-2xl font-bold">Explore your potential</h1>
        <p className="text-muted-foreground">
          Finish discovery first — then we&apos;ll suggest fields, projects, and challenges to try.
        </p>
        <Button asChild>
          <Link href="/discover">Start discovery</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Explore & try it</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your potential to possible career directions, school activities, and practical challenges —
          then see what feels right for you.
        </p>
      </header>

      {focus && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Suggested next try</p>
          <h2 className="mt-1 font-display text-lg font-bold">{focus.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{focus.summary || focus.reasoning}</p>
          <Button asChild className="mt-4">
            <Link href={challengeHref(challengeForSkill(focus.slug, focus.name).slug, focus.slug)}>
              <Trophy className="size-4" />
              Try a mini-challenge
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      )}

      <RecommendationsPanel state={state} />

      {careerAreas.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-base font-bold">Possible career areas to explore</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on your potential profile — starting points for research and conversation, not guaranteed outcomes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {careerAreas.map((area) => (
              <article
                key={area.domain}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <h3 className="font-display font-bold">{area.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{area.hook}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Examples to research
                </p>
                <ul className="mt-1 space-y-0.5 text-sm">
                  {area.careers.slice(0, 4).map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Matched: {area.matchedSkills.join(', ')}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-base font-bold">Why each area?</h2>
        {ranked.slice(0, 4).map((skill) => (
          <WhyRecommendation
            key={skill.id}
            skill={skill}
            profileInterests={profile.interests}
            state={state}
          />
        ))}
      </section>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight, Lightbulb, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { explainSkillRecommendation } from '@/lib/recommendations/explain'
import type { UserSkill, SkilzState } from '@/lib/data/types'
import { challengeForSkill, challengeHref } from '@/lib/challenges/catalog'

export function WhyRecommendation({
  skill,
  profileInterests,
  state,
}: {
  skill: UserSkill
  profileInterests: string[]
  state?: SkilzState
}) {
  const { title, bullets } = explainSkillRecommendation(skill, profileInterests, state)
  const challenge = challengeForSkill(skill.slug, skill.name)

  return (
    <details className="group rounded-2xl border border-border/70 bg-muted/20 open:bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
        <Lightbulb className="size-4 shrink-0" />
        {title}
        <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">
          Tap to see why
        </span>
      </summary>
      <div className="space-y-3 border-t border-border/60 px-4 pb-4 pt-3">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2 leading-relaxed">
              <span className="text-primary" aria-hidden>•</span>
              {b}
            </li>
          ))}
        </ul>
        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
          <Link href={challengeHref(challenge.slug, skill.slug)}>
            <Trophy className="size-4" />
            Try a mini-challenge
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </details>
  )
}

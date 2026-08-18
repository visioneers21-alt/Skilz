'use client'

import Link from 'next/link'
import { ArrowRight, Compass, Sparkles, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SkilzState } from '@/lib/data/types'
import { buildFieldRecommendations } from '@/lib/recommendations/personalized'
import { explainAreaRecommendation } from '@/lib/recommendations/explain'

export function RecommendationsPanel({ state }: { state: SkilzState }) {
  const fields = buildFieldRecommendations(state, 3)
  if (fields.length === 0) return null

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Compass className="size-5 text-primary" />
        <h2 className="font-display text-base font-bold">Areas to explore</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Based on your potential profile — possible areas to explore, not final career answers.
      </p>

      <div className="mt-4 space-y-4">
        {fields.map((field, i) => {
          const why = explainAreaRecommendation(
            field.title,
            field.matchedSkills,
            state.profile.interests,
          )
          return (
            <article
              key={field.id}
              className="rounded-xl border border-border/70 bg-background/80 p-4 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>{field.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-bold">{field.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{field.why}</p>
                </div>
              </div>

              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium text-primary">
                  Why this recommendation?
                </summary>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {why.bullets.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </details>

              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Start with
                </p>
                <ul className="mt-1 space-y-1 text-sm">
                  {field.starterProjects.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Target className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {field.challengeHref && (
                <Button asChild size="sm" className="mt-3 w-full sm:w-auto">
                  <Link href={field.challengeHref}>
                    <Trophy className="size-4" />
                    {field.challengeTitle ?? 'Try a challenge'}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </article>
          )
        })}
      </div>

      <Button asChild variant="outline" size="sm" className="mt-4 w-full">
        <Link href="/explore">
          <Sparkles className="size-4" />
          See all explore ideas
        </Link>
      </Button>
    </section>
  )
}

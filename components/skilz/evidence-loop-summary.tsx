'use client'

import { RefreshCw } from 'lucide-react'
import type { SkilzState, UserSkill } from '@/lib/data/types'
import { buildEvidenceLoopSummary } from '@/lib/evidence/synthesis'
import { cn } from '@/lib/utils'

export function EvidenceLoopSummary({
  skill,
  state,
  className,
}: {
  skill: UserSkill
  state: SkilzState
  className?: string
}) {
  const summary = buildEvidenceLoopSummary(skill, state)

  return (
    <section
      className={cn(
        'rounded-2xl border border-primary/20 bg-primary/5 p-5',
        className,
      )}
      aria-labelledby={`evidence-loop-${skill.slug}`}
    >
      <div className="flex items-start gap-2">
        <RefreshCw className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div>
          <h2
            id={`evidence-loop-${skill.slug}`}
            className="font-display text-base font-bold"
          >
            {summary.headline}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Discovery → challenge → reflection — combined as possibilities, not verdicts.
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {summary.paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
    </section>
  )
}

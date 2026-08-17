'use client'

import type { CatalogSkill } from '@/lib/discovery/catalog'
import { SKILL_COUNT } from '@/lib/discovery/catalog'
import { cn } from '@/lib/utils'

export function DiscoverySkillRadar({
  topSkills,
  activeCount,
  answered,
}: {
  topSkills: CatalogSkill[]
  activeCount: number
  answered: number
}) {
  const shrinkPct = Math.max(
    8,
    Math.round(((SKILL_COUNT - activeCount) / SKILL_COUNT) * 100),
  )

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skill scanner
        </p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
          {activeCount} left
        </span>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-accent-foreground/80 to-success transition-all duration-700 ease-out"
          style={{ width: `${shrinkPct}%` }}
        />
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {answered === 0
          ? `${SKILL_COUNT} possibilities — pick answers to zoom in!`
          : `Zoomed in ${shrinkPct}% — leading skills glow below`}
      </p>

      <div className="flex flex-wrap gap-2">
        {topSkills.map((skill, i) => (
          <span
            key={skill.slug}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-500',
              i === 0
                ? 'border-primary/40 bg-primary/15 text-primary animate-discovery-glow'
                : 'border-border bg-muted/50 text-foreground',
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span aria-hidden>{['🥇', '🥈', '🥉'][i] ?? '✦'}</span>
            {skill.name}
          </span>
        ))}
        {topSkills.length === 0 && (
          <span className="text-xs text-muted-foreground">Waiting for your first pick…</span>
        )}
      </div>
    </div>
  )
}

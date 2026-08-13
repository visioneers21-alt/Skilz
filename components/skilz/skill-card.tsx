import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { StatusBadge } from '@/components/skilz/status-badge'
import { STAGE_LABELS } from '@/lib/data/seed'
import type { UserSkill } from '@/lib/data/types'
import { cn } from '@/lib/utils'

export function SkillCard({ skill }: { skill: UserSkill }) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">{skill.name}</h3>
          <div className="mt-1.5">
            <StatusBadge status={skill.statusLabel} />
          </div>
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {skill.reasoning}
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {STAGE_LABELS[skill.stage]}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {skill.evidence.length} signal
          {skill.evidence.length === 1 ? '' : 's'}
        </span>
      </div>
    </Link>
  )
}

export function SkillRow({ skill }: { skill: UserSkill }) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted"
    >
      <span
        className={cn(
          'flex size-2.5 shrink-0 rounded-full',
          skill.category === 'strong'
            ? 'bg-primary'
            : skill.category === 'developing'
              ? 'bg-accent-foreground/70'
              : 'bg-muted-foreground/50',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{skill.name}</p>
      </div>
      <StatusBadge status={skill.statusLabel} />
    </Link>
  )
}

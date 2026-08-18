'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import type { SkilzState } from '@/lib/data/types'
import { cn } from '@/lib/utils'

export function TalentProfileSummary({ state }: { state: SkilzState }) {
  const { skills, profile, attempts, discoveryComplete } = state
  const strong = skills.filter((s) => s.category === 'strong')
  const developing = skills.filter((s) => s.category === 'developing')
  const exploring = skills.filter((s) => s.category === 'exploring')

  if (!discoveryComplete || skills.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-display font-bold">Your talent profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete the discovery quest to see areas of potential — not fixed labels, but
              places worth exploring.
            </p>
            <Link href="/discover" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Start discovery →
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5">
      <h2 className="font-display text-base font-bold">Your potential profile</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Based on your discovery answers{profile.interests.length ? ` and interests (${profile.interests.slice(0, 2).join(', ')})` : ''}.
        These are indications to explore — not verdicts.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <PotentialBucket
          label="Strong potential"
          count={strong.length}
          skills={strong.map((s) => s.name)}
          tone="primary"
        />
        <PotentialBucket
          label="Emerging"
          count={developing.length}
          skills={developing.map((s) => s.name)}
          tone="accent"
        />
        <PotentialBucket
          label="Worth exploring"
          count={exploring.length}
          skills={exploring.map((s) => s.name)}
          tone="muted"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{skills.length} areas tracked</span>
        <span>·</span>
        <span>{attempts.length} challenge{attempts.length === 1 ? '' : 's'} tried</span>
        <Link href="/skills" className="font-medium text-primary hover:underline">
          View full profile →
        </Link>
      </div>
    </section>
  )
}

function PotentialBucket({
  label,
  count,
  skills,
  tone,
}: {
  label: string
  count: number
  skills: string[]
  tone: 'primary' | 'accent' | 'muted'
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3',
        tone === 'primary' && 'border-primary/25 bg-primary/10',
        tone === 'accent' && 'border-accent bg-accent/30',
        tone === 'muted' && 'border-border bg-muted/40',
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{count}</p>
      {skills.length > 0 ? (
        <ul className="mt-2 space-y-0.5 text-xs">
          {skills.slice(0, 2).map((s) => (
            <li key={s} className="truncate">{s}</li>
          ))}
          {skills.length > 2 && <li className="text-muted-foreground">+{skills.length - 2} more</li>}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">None yet</p>
      )}
    </div>
  )
}

export function DiscoveryDimensionsNote() {
  const dimensions = [
    'Interests',
    'Problem-solving',
    'Creativity',
    'Communication',
    'Leadership',
    'Analytical thinking',
    'Technical inclination',
    'Collaboration',
    'Persistence',
    'Curiosity',
  ]
  return (
    <p className="text-xs text-muted-foreground">
      Discovery looks across: {dimensions.join(' · ')}.
    </p>
  )
}

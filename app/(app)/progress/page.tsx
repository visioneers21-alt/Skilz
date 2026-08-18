'use client'

import Link from 'next/link'
import {
  Compass,
  Layers,
  Map,
  Sparkles,
  Trophy,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JourneyStrip } from '@/components/skilz/journey-strip'
import { useSkilz } from '@/lib/data/store'

const TYPE_ICON = {
  discovery: Compass,
  skill: Sparkles,
  challenge: Trophy,
  plan: Map,
} as const

export default function ProgressPage() {
  const { state } = useSkilz()
  const { progress, skills, attempts, plan, discoveryComplete } = state

  const planDone = plan.filter((p) => p.status === 'done').length
  const sorted = [...progress].sort((a, b) => b.date - a.date)

  if (progress.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <TrendingUp className="size-7" />
        </span>
        <h1 className="text-xl font-bold">Your journey starts here</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Progress will appear as you discover skills, complete challenges, and
          work through your plan.
        </p>
        <Button asChild size="lg">
          <Link href="/discover">
            <Compass className="size-4" />
            Start discovery
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Progress</h1>
        <p className="mt-1 text-muted-foreground">
          Interest discovered → challenge tried → reflection → updated recommendations.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Skills identified"
          value={String(skills.length)}
        />
        <StatCard
          icon={Trophy}
          label="Challenges done"
          value={String(attempts.length)}
        />
        <StatCard
          icon={Map}
          label="Plan steps done"
          value={plan.length ? `${planDone}/${plan.length}` : '—'}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold">Journey</h2>
        <JourneyStrip className="mt-5" state={state} />
      </section>

      <section>
        <h2 className="font-display text-base font-bold">Activity</h2>
        <ol className="relative mt-4 space-y-0 border-l border-border pl-6">
          {sorted.map((event) => {
            const Icon = TYPE_ICON[event.type]
            return (
              <li key={event.id} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[calc(0.75rem+1px)] flex size-6 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="size-3 text-primary" />
                </span>
                <time className="text-xs text-muted-foreground">
                  {formatDate(event.date)}
                </time>
                <p className="mt-0.5 font-semibold">{event.title}</p>
                {event.detail && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {event.detail}
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function formatDate(ts: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(ts))
  } catch {
    return String(ts)
  }
}

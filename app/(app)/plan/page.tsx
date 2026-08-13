'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Check, Compass, Loader2, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSkilz } from '@/lib/data/store'
import { DevelopmentPlanService } from '@/lib/ai/services'
import { useAuth } from '@/lib/auth/auth-context'
import { useHandleAuthRequired } from '@/lib/auth/use-handle-auth-required'
import { cn } from '@/lib/utils'

const BUCKET_LABELS: Record<string, string> = {
  'this-week': 'This week',
  next: 'Up next',
  then: 'Then',
  later: 'Later',
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function PlanPage() {
  const { state, setPlan, togglePlanItem } = useSkilz()
  const { plan, skills } = state
  const { refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generatePlan() {
    if (skills.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const { items } = await DevelopmentPlanService.build({
        skills: skills.map((s) => ({
          name: s.name,
          statusLabel: s.statusLabel,
          developmentAreas: s.developmentAreas,
        })),
        focusSkill: skills[0]?.name,
      })
      setPlan(
        items.map((item, i) => ({
          id: `plan_${Date.now()}_${i}`,
          skillSlug: slugify(item.skillName),
          skillName: item.skillName,
          title: item.title,
          detail: item.detail,
          estimatedTime: item.estimatedTime,
          bucket: item.bucket,
          status: 'todo',
        })),
      )
      void refreshSession()
    } catch (err) {
      setError(await handleAuthRequired(err, 'Could not build your plan. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (skills.length > 0 && plan.length === 0 && !loading) {
      void generatePlan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills.length])

  const buckets = ['this-week', 'next', 'then', 'later'] as const
  const doneCount = plan.filter((p) => p.status === 'done').length

  if (skills.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Map className="size-7" />
        </span>
        <h1 className="text-xl font-bold">No plan yet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Complete a discovery session first so SKILZ can build a plan around
          your strengths.
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

  if (loading && plan.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Building your plan…</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          SKILZ is putting together practical next steps based on your skills.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">My Plan</h1>
        <p className="mt-1 text-muted-foreground">
          {doneCount} of {plan.length} steps completed
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
          <Button
            variant="link"
            size="sm"
            className="ml-2 h-auto p-0 text-destructive"
            onClick={() => void generatePlan()}
          >
            Retry
          </Button>
        </div>
      )}

      {buckets.map((bucket) => {
        const items = plan.filter((p) => p.bucket === bucket)
        if (items.length === 0) return null
        return (
          <section key={bucket}>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {BUCKET_LABELS[bucket]}
            </h2>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => togglePlanItem(item.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30',
                      item.status === 'done' && 'opacity-70',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border',
                        item.status === 'done'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border',
                      )}
                    >
                      {item.status === 'done' && (
                        <Check className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'font-semibold',
                          item.status === 'done' && 'line-through',
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {item.detail}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{item.estimatedTime}</span>
                        <span aria-hidden="true">·</span>
                        <Link
                          href={`/skills/${item.skillSlug}`}
                          className="font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.skillName}
                        </Link>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <Button
        variant="outline"
        disabled={loading}
        onClick={() => void generatePlan()}
      >
        {loading ? 'Refreshing…' : 'Refresh plan'}
      </Button>
    </div>
  )
}

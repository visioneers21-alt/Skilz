'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ConfidenceLabel,
  StatusBadge,
} from '@/components/skilz/status-badge'
import { useSkilz } from '@/lib/data/store'
import {
  STAGE_LABELS,
  STAGE_ORDER,
  challengeForSkill,
} from '@/lib/data/seed'

export default function SkillDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const { state } = useSkilz()
  const skill = state.skills.find((s) => s.slug === params.slug)

  if (!skill) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-xl font-bold">Skill not found</h1>
        <Button asChild variant="outline">
          <Link href="/skills">Back to skills</Link>
        </Button>
      </div>
    )
  }

  const challenge = challengeForSkill(skill.slug)
  const stageIndex = STAGE_ORDER.indexOf(skill.stage)
  const stageProgress = ((stageIndex + 1) / STAGE_ORDER.length) * 100

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {skill.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={skill.statusLabel} />
              <ConfidenceLabel confidence={skill.confidence} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          {skill.reasoning}
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Growth stage</span>
          <span className="text-muted-foreground">
            {STAGE_LABELS[skill.stage]}
          </span>
        </div>
        <Progress value={stageProgress} className="mt-3 h-2" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Discovered</span>
          <span>Advanced</span>
        </div>
      </section>

      {skill.evidence.length > 0 && (
        <section>
          <h2 className="font-display text-base font-bold">
            Evidence from your conversation
          </h2>
          <ul className="mt-3 space-y-2">
            {skill.evidence.map((ev) => (
              <li
                key={ev.id}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed"
              >
                {ev.text}
                <span className="mt-1 block text-xs text-muted-foreground">
                  From {ev.source === 'conversation' ? 'discovery' : 'challenge'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {skill.developmentAreas.length > 0 && (
        <section>
          <h2 className="font-display text-base font-bold">Areas to grow</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skill.developmentAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-primary/20 bg-accent/40 p-5">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-primary" />
          <h2 className="font-display text-base font-bold">
            Test this skill
          </h2>
        </div>
        <p className="mt-2 font-display text-lg font-bold">{challenge.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {challenge.prompt}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {challenge.estimatedTime}
        </div>
        <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
          <Link href={`/challenge/${challenge.slug}`}>
            Start challenge
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}

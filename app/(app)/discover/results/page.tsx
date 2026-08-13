'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Map, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillCard } from '@/components/skilz/skill-card'
import { useSkilz } from '@/lib/data/store'
import { DevelopmentPlanService } from '@/lib/ai/services'
import { useAuth } from '@/lib/auth/auth-context'
import { useHandleAuthRequired } from '@/lib/auth/use-handle-auth-required'
import { useEffect, useState } from 'react'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function DiscoveryResultsPage() {
  const router = useRouter()
  const { state, setPlan } = useSkilz()
  const { skills } = state
  const { refreshSession } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()
  const [buildingPlan, setBuildingPlan] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    if (skills.length === 0) router.replace('/discover')
  }, [skills.length, router])

  if (skills.length === 0) return null

  const strong = skills.filter((s) => s.category === 'strong')
  const developing = skills.filter((s) => s.category === 'developing')
  const exploring = skills.filter((s) => s.category === 'exploring')

  async function buildPlan() {
    setBuildingPlan(true)
    setPlanError(null)
    try {
      const focus = skills[0]?.name
      const { items } = await DevelopmentPlanService.build({
        skills: skills.map((s) => ({
          name: s.name,
          statusLabel: s.statusLabel,
          developmentAreas: s.developmentAreas,
        })),
        focusSkill: focus,
      })
      setPlan(
        items.map((item, i) => ({
          id: `plan_${i}`,
          skillSlug: slugify(item.skillName),
          skillName: item.skillName,
          title: item.title,
          detail: item.detail,
          estimatedTime: item.estimatedTime,
          bucket: item.bucket,
          status: 'todo',
        })),
      )
      router.push('/plan')
    } catch (err) {
      setBuildingPlan(false)
      setPlanError(await handleAuthRequired(err, 'Could not build your plan. Please try again.'))
    }
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="size-3.5" />
          Discovery complete
        </span>
        <h1 className="mt-4 text-balance text-2xl font-bold md:text-3xl">
          Here&apos;s what stood out from your conversation
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          These are hypotheses to explore — not labels. Each one is grounded in
          what you said and ready to test through challenges.
        </p>
      </header>

      {strong.length > 0 && (
        <section>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Strong potential
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {strong.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {developing.length > 0 && (
        <section>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Developing
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {developing.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      {exploring.length > 0 && (
        <section>
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Worth exploring
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {exploring.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-lg font-bold">What&apos;s next?</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Validate a skill with a quick challenge, or let SKILZ build a plan
          around your top strengths.
        </p>
        {planError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {planError}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="flex-1">
            <Link href="/skills">
              Explore my skills
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={buildingPlan}
            onClick={() => void buildPlan()}
          >
            <Map className="size-4" />
            {buildingPlan ? 'Building plan…' : 'Build my plan'}
          </Button>
        </div>
        <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
          <Link href="/dashboard">
            <Trophy className="size-4" />
            Try a challenge from home
          </Link>
        </Button>
      </section>
    </div>
  )
}

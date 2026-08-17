'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Map, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillCard } from '@/components/skilz/skill-card'
import { CareerPathsSection } from '@/components/skilz/career-paths-section'
import { SkillsSnapshotButton } from '@/components/skilz/skills-snapshot-button'
import { useSkilz } from '@/lib/data/store'
import { DevelopmentPlanService } from '@/lib/ai/services'
import { useAuth } from '@/lib/auth/auth-context'
import { useHandleAuthRequired } from '@/lib/auth/use-handle-auth-required'
import { suggestCareerPaths, isCareerExplorer } from '@/lib/career/paths'
import { pickFocusSkill } from '@/lib/recommendations/next-steps'
import { challengeForSkill } from '@/lib/data/seed'
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
  const { profile, skills } = state
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
  const careerPaths = isCareerExplorer(profile.goal) ? suggestCareerPaths(skills) : []
  const focusSkill = pickFocusSkill(state)
  const focusChallenge = focusSkill ? challengeForSkill(focusSkill.slug) : null

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
      void refreshSession()
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
          These are hypotheses grounded in what you said — not personality labels.
          Disagree with any? Remove it. Agree? Validate it with a quick challenge.
        </p>
        <div className="mt-4 flex justify-center">
          <SkillsSnapshotButton profile={profile} skills={skills} />
        </div>
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

      {careerPaths.length > 0 && <CareerPathsSection paths={careerPaths} />}

      <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-lg font-bold">What&apos;s next?</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {focusChallenge && focusSkill
            ? `Best move: validate "${focusSkill.name}" with "${focusChallenge.title}" — real proof beats guessing.`
            : 'Explore your skills, export a snapshot, or build a plan around your strengths.'}
        </p>
        {planError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {planError}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {focusChallenge && (
            <Button asChild size="lg" className="flex-1">
              <Link href={`/challenge/${focusChallenge.slug}`}>
                <Trophy className="size-4" />
                Validate {focusSkill?.name}
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant={focusChallenge ? 'outline' : 'default'} className="flex-1">
            <Link href="/skills">
              Review evidence
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
      </section>
    </div>
  )
}

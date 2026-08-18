import type { SkilzState } from '@/lib/data/types'
import { challengeForSkill } from '@/lib/data/seed'
import { challengeHref } from '@/lib/challenges/catalog'

export interface NextStep {
  id: string
  title: string
  description: string
  href: string
  cta: string
  kind: 'discover' | 'validate' | 'plan' | 'reflect' | 'career' | 'continue'
}

/** One prioritized action based on where the user actually is in their journey. */
export function getPrimaryNextStep(state: SkilzState): NextStep {
  const { profile, skills, discoveryComplete, attempts, plan } = state
  const attemptedSlugs = new Set(attempts.map((a) => a.skillSlug))

  if (!discoveryComplete || skills.length === 0) {
    return {
      id: 'discover',
      title: 'Start your discovery quest',
      description:
        'Answer 20 fun questions across interests, problem-solving, creativity, and more — SKILZ narrows 150+ areas to your best potential matches.',
      href: '/discover',
      cta: 'Start discovery',
      kind: 'discover',
    }
  }

  const unvalidated = skills.filter((s) => !attemptedSlugs.has(s.slug))
  if (unvalidated.length > 0) {
    const focus = unvalidated.find((s) => s.category === 'strong') ?? unvalidated[0]!
    const challenge = challengeForSkill(focus.slug, focus.name)
    return {
      id: 'validate',
      title: `Try it: test "${focus.name}"`,
      description: `${challenge.prompt.slice(0, 120)}… Mini-challenges help you explore whether an area fits — not prove you're already an expert.`,
      href: challengeHref(challenge.slug, focus.slug),
      cta: 'Start mini-challenge',
      kind: 'validate',
    }
  }

  const nextPlanItem = plan.find((p) => p.status !== 'done')
  if (nextPlanItem) {
    return {
      id: 'plan',
      title: nextPlanItem.title,
      description: nextPlanItem.detail,
      href: '/plan',
      cta: 'Open your plan',
      kind: 'plan',
    }
  }

  if (plan.length === 0) {
    return {
      id: 'build-plan',
      title: 'Turn potential into a plan',
      description:
        'SKILZ builds small weekly steps from your top areas — then explore fields and try mini-challenges along the way.',
      href: '/discover/results',
      cta: 'Build my plan',
      kind: 'plan',
    }
  }

  const isCareerGoal =
    profile.goal.includes('career') ||
    profile.goal.includes('exploring career')

  if (isCareerGoal) {
    return {
      id: 'career',
      title: 'See where your skills could lead',
      description:
        'Based on what you shared, explore role paths that match your evidence — not personality types.',
      href: '/discover/results#career-paths',
      cta: 'View career paths',
      kind: 'career',
    }
  }

  return {
    id: 'continue',
    title: 'Go deeper — add more stories',
    description:
      'One conversation rarely captures everything. Another session helps SKILZ refine your hypotheses with richer evidence.',
    href: '/discover',
    cta: 'Continue discovery',
    kind: 'continue',
  }
}

export function getSupportingSteps(state: SkilzState): NextStep[] {
  const primary = getPrimaryNextStep(state)
  const steps: NextStep[] = []

  if (primary.kind !== 'discover' && !state.discoveryComplete) {
    steps.push({
      id: 'discover-support',
      title: 'Finish discovery first',
      description: 'Complete at least one full conversation before validating skills.',
      href: '/discover',
      cta: 'Talk to SKILZ',
      kind: 'discover',
    })
  }

  if (primary.kind !== 'plan' && state.skills.length > 0 && state.plan.length === 0) {
    steps.push({
      id: 'plan-support',
      title: 'Build a development plan',
      description: 'Small weekly actions tailored to your skills.',
      href: '/discover/results',
      cta: 'Create plan',
      kind: 'plan',
    })
  }

  if (state.conversation.length > 0) {
    steps.push({
      id: 'reflect',
      title: 'Review your conversation',
      description: 'Re-read what you said — your own words are the best evidence.',
      href: '/skills',
      cta: 'View skills',
      kind: 'reflect',
    })
  }

  return steps.slice(0, 2)
}

/** Pick the skill most worth validating next. */
export function pickFocusSkill(state: SkilzState) {
  const { skills, attempts } = state
  if (skills.length === 0) return null

  const attempted = new Set(attempts.map((a) => a.skillSlug))
  const pending = skills.filter((s) => !attempted.has(s.slug))
  if (pending.length === 0) return skills[0]!

  const rank = { strong: 0, developing: 1, exploring: 2 }
  return [...pending].sort(
    (a, b) => rank[a.category] - rank[b.category] || b.confidenceScore - a.confidenceScore,
  )[0]!
}

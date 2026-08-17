import type { SkilzState } from '@/lib/data/types'
import { challengeForSkill } from '@/lib/data/seed'

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
      title: 'Start with a real conversation',
      description:
        'Most people guess at their strengths. SKILZ pulls stories from your life — what you enjoy, how you help others, what energizes you.',
      href: '/discover',
      cta: 'Talk to SKILZ',
      kind: 'discover',
    }
  }

  const unvalidated = skills.filter((s) => !attemptedSlugs.has(s.slug))
  if (unvalidated.length > 0) {
    const focus = unvalidated.find((s) => s.category === 'strong') ?? unvalidated[0]!
    const challenge = challengeForSkill(focus.slug)
    return {
      id: 'validate',
      title: `Prove "${focus.name}" with a quick challenge`,
      description: `${challenge.prompt} Real evidence beats self-assessment — this takes about ${challenge.estimatedTime}.`,
      href: `/challenge/${challenge.slug}`,
      cta: 'Start challenge',
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
      title: 'Turn insights into a weekly plan',
      description:
        'SKILZ builds small, doable steps from your top skills — not a generic career checklist.',
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

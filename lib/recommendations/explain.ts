import type { UserSkill, SkilzState, SkillInterestFeedback } from '@/lib/data/types'
import { skillDomainForSlug } from '@/lib/challenges/catalog'
import { SKILL_DOMAINS, type SkillDomainId } from '@/lib/discovery/catalog'
import { buildEvidenceLoopSummary } from '@/lib/evidence/synthesis'

export interface ExplainableReason {
  title: string
  bullets: string[]
}

/** Plain-language explanation for why an area is recommended — no raw scores. */
export function explainSkillRecommendation(
  skill: UserSkill,
  profileInterests: string[],
  state?: SkilzState,
): ExplainableReason {
  const domain = skillDomainForSlug(skill.slug)
  const bullets: string[] = []

  if (state) {
    const loop = buildEvidenceLoopSummary(skill, state)
    bullets.push(...loop.paragraphs.slice(0, 2))
  } else {
    if (skill.reasoning) bullets.push(skill.reasoning)
    if (skill.evidence.length > 0) {
      bullets.push(`From discovery: "${skill.evidence[0]!.text}"`)
    }
  }

  if (skill.evidence.length > 1 && bullets.length < 3) {
    bullets.push(`Also from your answers: "${skill.evidence[1]!.text}"`)
  }
  const interestMatch = profileInterests.find((i) => domainMatchesInterest(domain, i))
  if (interestMatch) {
    bullets.push(`This connects to your interest in ${interestMatch}.`)
  }
  if (skill.statusLabel === 'Strong potential' && !state?.attempts.some((a) => a.skillSlug === skill.slug)) {
    bullets.push('Try a mini-challenge to see if this area feels right when you actually do it.')
  } else if (skill.statusLabel === 'Worth exploring') {
    bullets.push('This is an early signal — a short activity can help you learn more.')
  }

  return {
    title: `Why explore ${skill.name}?`,
    bullets: bullets.slice(0, 4),
  }
}

function domainMatchesInterest(domain: SkillDomainId, interest: string): boolean {
  const map: Record<string, SkillDomainId[]> = {
    Technology: ['technical', 'analytical'],
    Design: ['creative', 'media'],
    Writing: ['communication', 'media'],
    Business: ['business', 'organization'],
    Science: ['analytical', 'hands-on'],
    Teaching: ['teaching', 'communication'],
    'Art & Music': ['creative', 'media'],
    Sports: ['hands-on', 'leadership'],
    Health: ['service', 'social'],
    Gaming: ['technical', 'media'],
    Community: ['social', 'service'],
    Travel: ['social', 'communication'],
    Agriculture: ['hands-on', 'analytical'],
    Engineering: ['hands-on', 'technical'],
  }
  return map[interest]?.includes(domain) ?? false
}

export function explainAreaRecommendation(
  areaName: string,
  matchedSkills: string[],
  profileInterests: string[],
): ExplainableReason {
  const bullets = [
    `Your profile shows potential in: ${matchedSkills.join(', ')}.`,
    profileInterests.length > 0
      ? `Combined with interests like ${profileInterests.slice(0, 2).join(' and ')}, this path is worth exploring — not a final verdict.`
      : 'This is a suggestion to explore — not a label of who you must become.',
    'Try a mini-challenge or starter project to see if it feels energizing.',
  ]
  return { title: `Why consider ${areaName}?`, bullets }
}

/** Adjust recommendation priority based on student feedback. */
export function skillRecommendationWeight(
  slug: string,
  feedback: Record<string, SkillInterestFeedback>,
): number {
  const f = feedback[slug]
  if (f === 'not-for-me') return -100
  if (f === 'learn-more') return 2
  if (f === 'enjoyed') return 1
  return 0
}

export function rankSkillsForRecommendations(state: SkilzState): UserSkill[] {
  return [...state.skills].sort((a, b) => {
    const fb =
      skillRecommendationWeight(b.slug, state.skillFeedback) -
      skillRecommendationWeight(a.slug, state.skillFeedback)
    if (fb !== 0) return fb
    const rank = { strong: 0, developing: 1, exploring: 2 }
    return rank[a.category] - rank[b.category] || b.confidenceScore - a.confidenceScore
  })
}

import {
  FULL_SKILL_CATALOG,
  INTEREST_DOMAIN_BOOSTS,
  SKILLS_BY_SLUG,
  SKILL_COUNT,
  type CatalogSkill,
  type SkillDomainId,
} from '@/lib/discovery/catalog'
import {
  DISCOVERY_QUESTION_COUNT,
  DISCOVERY_QUESTIONS,
  buildFinalQuestionOptions,
  type DiscoveryOption,
  type DiscoveryQuestion,
} from '@/lib/discovery/questions'

export interface DiscoveryAnswer {
  questionId: string
  optionId: string
  label: string
}

export interface DiscoveryEngineState {
  questionIndex: number
  scores: Record<string, number>
  answers: DiscoveryAnswer[]
}

export function createDiscoveryState(profile?: {
  interests?: string[]
}): DiscoveryEngineState {
  const scores = Object.fromEntries(FULL_SKILL_CATALOG.map((s) => [s.slug, 0]))

  if (profile?.interests?.length) {
    for (const interest of profile.interests) {
      const domains = INTEREST_DOMAIN_BOOSTS[interest]
      if (!domains) continue
      for (const domain of domains) {
        for (const skill of FULL_SKILL_CATALOG) {
          if (skill.domain === domain) scores[skill.slug] += 0.5
        }
      }
    }
  }

  return {
    questionIndex: 0,
    scores,
    answers: [],
  }
}

function applyDomainBoosts(
  scores: Record<string, number>,
  boosts: Partial<Record<SkillDomainId, number>> | undefined,
  sign: 1 | -1,
) {
  if (!boosts) return
  for (const [domain, weight] of Object.entries(boosts) as [SkillDomainId, number][]) {
    for (const skill of FULL_SKILL_CATALOG) {
      if (skill.domain === domain) {
        scores[skill.slug] += sign * weight
      }
    }
  }
}

function applySkillBoosts(
  scores: Record<string, number>,
  boosts: Record<string, number> | undefined,
) {
  if (!boosts) return
  for (const [slug, weight] of Object.entries(boosts)) {
    if (scores[slug] !== undefined) scores[slug] += weight
  }
}

export function applyDiscoveryAnswer(
  state: DiscoveryEngineState,
  question: DiscoveryQuestion,
  option: DiscoveryOption,
): DiscoveryEngineState {
  const scores = { ...state.scores }
  applyDomainBoosts(scores, option.domainBoosts, 1)
  applyDomainBoosts(scores, option.domainPenalties, -1)
  applySkillBoosts(scores, option.skillBoosts)

  return {
    questionIndex: state.questionIndex + 1,
    scores,
    answers: [
      ...state.answers,
      { questionId: question.id, optionId: option.id, label: option.label },
    ],
  }
}

export function getRankedSkills(state: DiscoveryEngineState): CatalogSkill[] {
  return [...FULL_SKILL_CATALOG].sort(
    (a, b) => (state.scores[b.slug] ?? 0) - (state.scores[a.slug] ?? 0),
  )
}

export function getActiveCandidates(state: DiscoveryEngineState): CatalogSkill[] {
  const ranked = getRankedSkills(state)
  if (ranked.length === 0) return []

  const topScore = state.scores[ranked[0]!.slug] ?? 0
  const margin = Math.max(2, topScore * 0.35)
  const cutoff = topScore - margin

  const active = ranked.filter((s) => (state.scores[s.slug] ?? 0) >= cutoff)
  return active.length >= 3 ? active : ranked.slice(0, Math.max(3, Math.min(15, ranked.length)))
}

export function getTopCandidates(state: DiscoveryEngineState, limit = 10): CatalogSkill[] {
  return getRankedSkills(state).slice(0, limit)
}

export function getCurrentQuestion(state: DiscoveryEngineState): DiscoveryQuestion | null {
  if (state.questionIndex >= DISCOVERY_QUESTION_COUNT) return null

  const base = DISCOVERY_QUESTIONS[state.questionIndex]
  if (!base) return null

  if (base.id === 'q20-identity') {
    const top = getTopCandidates(state, 4)
    const labels = Object.fromEntries(top.map((s) => [s.slug, s.name]))
    return {
      ...base,
      options: buildFinalQuestionOptions(
        top.map((s) => s.slug),
        labels,
      ),
    }
  }

  return base
}

export function isDiscoveryComplete(state: DiscoveryEngineState): boolean {
  return state.questionIndex >= DISCOVERY_QUESTION_COUNT
}

export function discoveryProgress(state: DiscoveryEngineState): {
  answered: number
  total: number
  activeSkillCount: number
  topSkills: CatalogSkill[]
} {
  return {
    answered: state.questionIndex,
    total: DISCOVERY_QUESTION_COUNT,
    activeSkillCount: getActiveCandidates(state).length,
    topSkills: getTopCandidates(state, 3),
  }
}

export function buildDiscoveryTranscript(
  state: DiscoveryEngineState,
  profile?: { name?: string },
): { role: 'assistant' | 'user'; content: string }[] {
  const lines: { role: 'assistant' | 'user'; content: string }[] = []

  if (profile?.name) {
    lines.push({
      role: 'assistant',
      content: `Hi ${profile.name}! I'll ask you ${DISCOVERY_QUESTION_COUNT} quick questions across different skill areas. Each answer helps narrow down which strengths fit you best.`,
    })
  } else {
    lines.push({
      role: 'assistant',
      content: `I'll ask you ${DISCOVERY_QUESTION_COUNT} quick questions across different skill areas. Each answer helps narrow down which strengths fit you best.`,
    })
  }

  for (let i = 0; i < state.answers.length; i++) {
    const q = DISCOVERY_QUESTIONS[i]
    const a = state.answers[i]
    if (!q || !a) continue

    const prompt =
      q.id === 'q20-identity' && i === DISCOVERY_QUESTION_COUNT - 1
        ? 'Which statement feels closest to who you are?'
        : q.prompt

    lines.push({ role: 'assistant', content: prompt })
    lines.push({ role: 'user', content: a.label })
  }

  return lines
}

export function getCandidateSlugsForAnalysis(state: DiscoveryEngineState): string[] {
  return getTopCandidates(state, 12).map((s) => s.slug)
}

export { DISCOVERY_QUESTION_COUNT, SKILL_COUNT, SKILLS_BY_SLUG }

import type { ChallengeAttempt, SkilzState, UserSkill } from '@/lib/data/types'

export interface EvidenceLoopSummary {
  headline: string
  paragraphs: string[]
  stage: 'discovery-only' | 'challenge-only' | 'reflection' | 'confirmed-interest' | 'set-aside'
}

function latestAttemptForSkill(
  attempts: ChallengeAttempt[],
  skillSlug: string,
): ChallengeAttempt | undefined {
  return [...attempts]
    .filter((a) => a.skillSlug === skillSlug)
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

function performanceLabel(attempt: ChallengeAttempt): string | null {
  const text = `${attempt.summary} ${attempt.strengths.join(' ')}`.toLowerCase()
  if (text.includes('strong') || text.includes('well') || text.includes('clear')) {
    return 'strong performance'
  }
  if (text.includes('good') || text.includes('solid')) return 'solid effort'
  return null
}

/** Combine discovery, challenge, reflection, and feedback into plain-language evidence. */
export function buildEvidenceLoopSummary(
  skill: UserSkill,
  state: SkilzState,
): EvidenceLoopSummary {
  const feedback = state.skillFeedback[skill.slug]
  const attempt = latestAttemptForSkill(state.attempts, skill.slug)
  const reflection = attempt?.reflection

  if (feedback === 'not-for-me') {
    return {
      stage: 'set-aside',
      headline: 'You chose to set this aside',
      paragraphs: [
        `Discovery suggested ${skill.name} as an area of potential, but you marked it as not for you. SKILZ will focus on other directions.`,
      ],
    }
  }

  const potentialPhrase =
    skill.statusLabel === 'Strong potential'
      ? `strong potential in ${skill.name}`
      : skill.statusLabel === 'Developing'
        ? `emerging potential in ${skill.name}`
        : `${skill.name} as an area worth exploring`

  if (!attempt) {
    return {
      stage: 'discovery-only',
      headline: `Your discovery suggests ${potentialPhrase}`,
      paragraphs: [
        skill.reasoning ||
          `Your answers pointed toward ${skill.name} — this is a possibility to test, not a final label.`,
        'Try a practical mini-challenge to see how this area feels when you actually do it.',
      ],
    }
  }

  const perf = performanceLabel(attempt)
  const parts: string[] = [
    `Your initial discovery suggested ${potentialPhrase}.`,
  ]

  if (perf) {
    parts.push(`After a practical challenge, you showed ${perf}.`)
  } else if (attempt.summary) {
    parts.push(`After a practical challenge: ${attempt.summary}`)
  }

  if (reflection?.enjoyed === true) {
    parts.push('You said you enjoyed the activity.')
  } else if (reflection?.enjoyed === false) {
    parts.push('You said the activity was not especially enjoyable — that is useful information too.')
  }

  if (reflection?.wantSimilar === true) {
    parts.push('You want to try more activities like this.')
  }

  if (feedback === 'enjoyed' || feedback === 'learn-more') {
    parts.push(
      feedback === 'enjoyed'
        ? 'Based on your feedback, this remains an area worth developing further.'
        : 'You asked to learn more — SKILZ will keep suggesting related activities and paths.',
    )
  } else if (reflection?.enjoyed === true || perf) {
    parts.push('This remains an area worth developing — not proven talent, but a signal to explore.')
  } else {
    parts.push('Keep testing with small activities to learn what fits you best.')
  }

  let stage: EvidenceLoopSummary['stage'] = 'challenge-only'
  if (feedback === 'enjoyed' || feedback === 'learn-more') stage = 'confirmed-interest'
  else if (reflection) stage = 'reflection'

  return {
    stage,
    headline: `What we know so far about ${skill.name}`,
    paragraphs: parts,
  }
}

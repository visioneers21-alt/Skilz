// Shared rules for when SKILZ has enough signal to analyze skills accurately,
// and helpers to clean voice transcripts before they reach the AI.

export const MIN_USER_EXCHANGES = 5
export const MIN_TOTAL_USER_WORDS = 80
export const MIN_ANSWER_WORDS = 8
export const MIN_CHALLENGE_WORDS = 25
export const MIN_CONFIDENCE_SCORE = 0.35
export const MIN_STRONG_CONFIDENCE = 0.65

export interface WireMessage {
  role: 'assistant' | 'user'
  content: string
}

export interface EligibilityResult {
  eligible: boolean
  userTurns: number
  totalUserWords: number
  avgWordsPerTurn: number
  missing: string[]
}

export class EligibilityError extends Error {
  code = 'NOT_ELIGIBLE'

  constructor(
    message: string,
    public eligibility?: EligibilityResult,
  ) {
    super(message)
    this.name = 'EligibilityError'
  }
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Clean up browser speech-to-text output before sending to the AI. */
export function normalizeSpeechText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\b(uh+|um+|like,\s|you know,\s)/gi, '')
    .replace(/\s+([,.!?])/g, '$1')
    .trim()
}

export function assessTranscriptEligibility(
  messages: WireMessage[],
): EligibilityResult {
  const userMessages = messages.filter((m) => m.role === 'user')
  const userTurns = userMessages.length
  const wordCounts = userMessages.map((m) => countWords(normalizeSpeechText(m.content)))
  const totalUserWords = wordCounts.reduce((a, b) => a + b, 0)
  const avgWordsPerTurn =
    userTurns > 0 ? Math.round(totalUserWords / userTurns) : 0

  const missing: string[] = []

  if (userTurns < MIN_USER_EXCHANGES) {
    missing.push(`${MIN_USER_EXCHANGES - userTurns} more answer${MIN_USER_EXCHANGES - userTurns === 1 ? '' : 's'}`)
  }
  if (totalUserWords < MIN_TOTAL_USER_WORDS) {
    missing.push(`about ${MIN_TOTAL_USER_WORDS - totalUserWords} more words of detail`)
  }
  if (userTurns >= 3 && avgWordsPerTurn < 12) {
    missing.push('more specific stories (not one-word replies)')
  }

  return {
    eligible: missing.length === 0,
    userTurns,
    totalUserWords,
    avgWordsPerTurn,
    missing,
  }
}

export function assessAnswerEligibility(text: string): {
  eligible: boolean
  words: number
  message: string | null
} {
  const normalized = normalizeSpeechText(text)
  const words = countWords(normalized)
  if (words < MIN_ANSWER_WORDS) {
    return {
      eligible: false,
      words,
      message: `Share a bit more detail (${MIN_ANSWER_WORDS}+ words helps SKILZ understand you).`,
    }
  }
  return { eligible: true, words, message: null }
}

export function assessChallengeEligibility(text: string): {
  eligible: boolean
  words: number
  message: string | null
} {
  const normalized = normalizeSpeechText(text)
  const words = countWords(normalized)
  if (words < MIN_CHALLENGE_WORDS) {
    return {
      eligible: false,
      words,
      message: `Give a fuller response (${MIN_CHALLENGE_WORDS}+ words) so feedback is accurate.`,
    }
  }
  return { eligible: true, words, message: null }
}

export interface AnalyzedSkill {
  name: string
  statusLabel: string
  confidenceScore: number
  reasoning: string
  evidence: string[]
  developmentAreas: string[]
}

/** Drop weak hypotheses and downgrade overconfident labels lacking evidence. */
export function refineSkillHypotheses(skills: AnalyzedSkill[]): AnalyzedSkill[] {
  return skills
    .filter((s) => s.confidenceScore >= MIN_CONFIDENCE_SCORE)
    .map((s) => {
      let statusLabel = s.statusLabel
      if (
        statusLabel === 'Strong potential' &&
        (s.confidenceScore < MIN_STRONG_CONFIDENCE || s.evidence.length < 2)
      ) {
        statusLabel = 'Developing'
      }
      if (statusLabel === 'Developing' && s.confidenceScore < 0.45) {
        statusLabel = 'Worth exploring'
      }
      return { ...s, statusLabel }
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 5)
}

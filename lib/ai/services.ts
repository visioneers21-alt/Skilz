// Client-side service abstractions over the SKILZ API routes.
//
// UI components call these services and never fetch directly, so the transport
// (currently REST routes backed by the AI SDK) can change without touching the
// interface. Each service maps raw API output into the app's domain types.

import type {
  ChatRole,
  Confidence,
  SkillStage,
  SkillStatusLabel,
  UserSkill,
} from '@/lib/data/types'
import { AUTH_REQUIRED_CODE } from '@/lib/auth/constants'
import { AuthRequiredError } from '@/lib/auth/errors'
import type { EligibilityResult } from '@/lib/ai/eligibility'
import { EligibilityError } from '@/lib/ai/eligibility'

export interface WireMessage {
  role: ChatRole
  content: string
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toConfidence(score: number): Confidence {
  if (score >= 0.65) return 'high'
  if (score >= 0.45) return 'medium'
  return 'low'
}

function stageFor(label: SkillStatusLabel): SkillStage {
  switch (label) {
    case 'Strong potential':
      return 'developing'
    case 'Developing':
      return 'exploring'
    case 'Validated':
      return 'validated'
    default:
      return 'discovered'
  }
}

function categoryFor(
  label: SkillStatusLabel,
): 'strong' | 'developing' | 'exploring' {
  if (label === 'Strong potential' || label === 'Validated') return 'strong'
  if (label === 'Developing') return 'developing'
  return 'exploring'
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 403 && data.code === AUTH_REQUIRED_CODE) {
    throw new AuthRequiredError(data.triesRemaining ?? 0)
  }
  if (res.status === 422 && data.code === 'NOT_ELIGIBLE') {
    throw new EligibilityError(data.error || 'Not enough detail yet', data.eligibility)
  }
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data as T
}

export { AuthRequiredError } from '@/lib/auth/errors'
export { EligibilityError } from '@/lib/ai/eligibility'
export type { EligibilityResult } from '@/lib/ai/eligibility'

export interface DiscoverStreamCallbacks {
  onStart?: () => void
  onToken: (text: string, fullReply: string) => void
  onDone: (result: {
    reply: string
    readyToConclude: boolean
    eligibility?: EligibilityResult
  }) => void
  onError: (error: Error) => void
}

/** AIConversationService — drives the adaptive discovery conversation. */
export const AIConversationService = {
  async next(
    messages: WireMessage[],
    profile?: { name?: string; interests?: string[]; goal?: string },
  ): Promise<{
    reply: string
    readyToConclude: boolean
    eligibility?: EligibilityResult
  }> {
    return new Promise((resolve, reject) => {
      void this.streamNext(messages, profile, {
        onToken: () => {},
        onDone: resolve,
        onError: reject,
      })
    })
  },

  async streamNext(
    messages: WireMessage[],
    profile: { name?: string; interests?: string[]; goal?: string } | undefined,
    callbacks: DiscoverStreamCallbacks,
  ): Promise<void> {
    const res = await fetch('/api/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messages, profile }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 403 && data.code === AUTH_REQUIRED_CODE) {
        callbacks.onError(new AuthRequiredError(data.triesRemaining ?? 0))
        return
      }
      if (res.status === 422 && data.code === 'NOT_ELIGIBLE') {
        callbacks.onError(new EligibilityError(data.error || 'Not enough detail yet', data.eligibility))
        return
      }
      callbacks.onError(new Error(data.error || 'Request failed'))
      return
    }

    if (!res.body) {
      callbacks.onError(new Error('No response stream'))
      return
    }

    callbacks.onStart?.()

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullReply = ''
    let started = false

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as
            | { type: 'token'; text: string }
            | { type: 'error'; error: string }
            | {
                type: 'done'
                reply: string
                readyToConclude: boolean
                eligibility: EligibilityResult
              }

          if (event.type === 'token') {
            if (!started) started = true
            fullReply += event.text
            callbacks.onToken(event.text, fullReply)
          } else if (event.type === 'error') {
            callbacks.onError(new Error(event.error))
            return
          } else if (event.type === 'done') {
            callbacks.onDone({
              reply: event.reply || fullReply.trim(),
              readyToConclude: event.readyToConclude,
              eligibility: event.eligibility,
            })
            return
          }
        }
      }

      if (fullReply.trim()) {
        callbacks.onDone({ reply: fullReply.trim(), readyToConclude: false })
      } else {
        callbacks.onError(new Error('Empty response'))
      }
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error('Stream failed'))
    }
  },
}

interface AnalyzedSkill {
  name: string
  statusLabel: SkillStatusLabel
  confidenceScore: number
  reasoning: string
  evidence: string[]
  developmentAreas: string[]
}

/** SkillAnalysisService — turns a transcript into evidence-backed hypotheses. */
export const SkillAnalysisService = {
  async analyze(
    transcript: WireMessage[],
    options?: { candidateSlugs?: string[]; structured?: boolean },
  ): Promise<UserSkill[]> {
    const { skills } = await postJson<{ skills: AnalyzedSkill[] }>(
      '/api/analyze',
      {
        transcript,
        candidateSlugs: options?.candidateSlugs,
        structured: options?.structured,
      },
    )
    const now = Date.now()
    return skills.map((s, i) => ({
      id: `sk_${slugify(s.name)}_${i}`,
      slug: slugify(s.name),
      name: s.name,
      summary: s.reasoning,
      stage: stageFor(s.statusLabel),
      statusLabel: s.statusLabel,
      confidence: toConfidence(s.confidenceScore),
      confidenceScore: s.confidenceScore,
      reasoning: s.reasoning,
      evidence: s.evidence.map((text, j) => ({
        id: `ev_${i}_${j}`,
        text,
        source: 'conversation' as const,
        createdAt: now,
      })),
      developmentAreas: s.developmentAreas,
      category: categoryFor(s.statusLabel),
      createdAt: now + i,
    }))
  },
}

/** ChallengeEvaluationService — evaluates a practical challenge response. */
export const ChallengeEvaluationService = {
  async evaluate(input: {
    skillName: string
    challengeTitle: string
    challengePrompt: string
    goal: string
    response: string
  }): Promise<{
    strengths: string[]
    improvements: string[]
    summary: string
  }> {
    return postJson('/api/challenge', input)
  },
}

/** SkillConversationService — post-discovery chat about identified skills. */
export interface SkillsChatStreamCallbacks {
  onStart?: () => void
  onToken: (text: string, fullReply: string) => void
  onDone: (result: { reply: string; readyToConclude: boolean }) => void
  onError: (error: Error) => void
}

export const SkillConversationService = {
  async streamNext(
    messages: WireMessage[],
    skills: {
      name: string
      statusLabel: string
      reasoning?: string
      developmentAreas?: string[]
    }[],
    profile: { name?: string; interests?: string[]; goal?: string } | undefined,
    callbacks: SkillsChatStreamCallbacks,
  ): Promise<void> {
    const res = await fetch('/api/skills-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messages, skills, profile }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (res.status === 403 && data.code === AUTH_REQUIRED_CODE) {
        callbacks.onError(new AuthRequiredError(data.triesRemaining ?? 0))
        return
      }
      callbacks.onError(new Error(data.error || 'Request failed'))
      return
    }

    if (!res.body) {
      callbacks.onError(new Error('No response stream'))
      return
    }

    callbacks.onStart?.()

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullReply = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as
            | { type: 'token'; text: string }
            | { type: 'error'; error: string }
            | { type: 'done'; reply: string; readyToConclude: boolean }

          if (event.type === 'token') {
            fullReply += event.text
            callbacks.onToken(event.text, fullReply)
          } else if (event.type === 'error') {
            callbacks.onError(new Error(event.error))
            return
          } else if (event.type === 'done') {
            callbacks.onDone({
              reply: event.reply || fullReply.trim(),
              readyToConclude: event.readyToConclude,
            })
            return
          }
        }
      }

      if (fullReply.trim()) {
        callbacks.onDone({ reply: fullReply.trim(), readyToConclude: false })
      } else {
        callbacks.onError(new Error('Empty response'))
      }
    } catch (err) {
      callbacks.onError(err instanceof Error ? err : new Error('Stream failed'))
    }
  },
}

/** SkillAdviceService — personalized guidance after discovery. */
export const SkillAdviceService = {
  async get(input: {
    skills: {
      name: string
      statusLabel: string
      reasoning?: string
      developmentAreas?: string[]
    }[]
    profile?: { name?: string; interests?: string[]; goal?: string }
  }): Promise<{
    summary: string
    highlights: { skillName: string; advice: string; nextStep: string }[]
  }> {
    return postJson('/api/advice', input)
  },
}

/** DevelopmentPlanService — assembles a personalized plan. */
export const DevelopmentPlanService = {
  async build(input: {
    skills: {
      name: string
      statusLabel: string
      developmentAreas?: string[]
    }[]
    focusSkill?: string
  }): Promise<{
    items: {
      title: string
      detail: string
      estimatedTime: string
      skillName: string
      bucket: 'this-week' | 'next' | 'then' | 'later'
    }[]
  }> {
    return postJson('/api/plan', input)
  },
}

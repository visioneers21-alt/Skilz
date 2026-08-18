// Core domain types shared across the SKILZ mock data layer and (later) the
// Neon/Drizzle persistence layer. These mirror the database schema in
// lib/db/schema.ts so the mock store can be swapped for real queries.

export type SkillStage =
  | 'discovered'
  | 'exploring'
  | 'developing'
  | 'practicing'
  | 'validated'
  | 'advanced'

export type SkillStatusLabel =
  | 'Worth exploring'
  | 'Developing'
  | 'Strong potential'
  | 'Validated'

export type Confidence = 'low' | 'medium' | 'high'

export type ChatRole = 'assistant' | 'user'

export interface Message {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

export interface SkillEvidence {
  id: string
  text: string
  source: 'conversation' | 'challenge'
  createdAt: number
}

export interface UserSkill {
  id: string
  /** stable slug, e.g. "communication" */
  slug: string
  name: string
  /** short "why this matters" summary */
  summary: string
  stage: SkillStage
  statusLabel: SkillStatusLabel
  confidence: Confidence
  /** 0..1 model confidence, stored alongside the human label */
  confidenceScore: number
  reasoning: string
  evidence: SkillEvidence[]
  developmentAreas: string[]
  category: 'strong' | 'developing' | 'exploring'
  createdAt: number
}

export interface PlanItem {
  id: string
  skillSlug: string
  skillName: string
  title: string
  detail: string
  estimatedTime: string
  bucket: 'this-week' | 'next' | 'then' | 'later'
  status: 'todo' | 'in-progress' | 'done'
}

export interface ChallengeReflection {
  enjoyed: boolean | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  wantSimilar: boolean | null
  learned: string
}

export type SkillInterestFeedback = 'enjoyed' | 'learn-more' | 'not-for-me'

export interface ChallengeAttempt {
  id: string
  challengeSlug: string
  skillSlug: string
  response: string
  mode: 'voice' | 'text'
  strengths: string[]
  improvements: string[]
  summary: string
  reflection?: ChallengeReflection
  createdAt: number
}

export interface ProgressEvent {
  id: string
  date: number
  title: string
  detail?: string
  type: 'discovery' | 'skill' | 'challenge' | 'plan'
}

export interface Profile {
  name: string
  ageRange: string
  education: string
  interests: string[]
  goal: string
  interactionPreference: 'voice' | 'text'
  onboarded: boolean
}

export interface SkilzState {
  profile: Profile
  conversation: Message[]
  skills: UserSkill[]
  plan: PlanItem[]
  attempts: ChallengeAttempt[]
  progress: ProgressEvent[]
  discoveryComplete: boolean
  dismissedSkillSlugs: string[]
  /** Student feedback on skills — improves future recommendations. */
  skillFeedback: Record<string, SkillInterestFeedback>
}

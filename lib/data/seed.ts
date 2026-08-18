import type { Profile, SkillStage, SkillStatusLabel } from './types'
import { challengeForSkill as resolveChallengeForSkill } from '@/lib/challenges/catalog'

export interface ChallengeDef {
  slug: string
  skillSlug: string
  title: string
  prompt: string
  goal: string
  estimatedTime: string
}

// A small, curated catalog. The AI proposes skills from (but is not limited to)
// this vocabulary so the UI always has sensible copy and matching challenges.
export const SKILL_CATALOG = [
  { slug: 'communication', name: 'Communication' },
  { slug: 'problem-solving', name: 'Problem Solving' },
  { slug: 'leadership', name: 'Leadership' },
  { slug: 'creativity', name: 'Creativity' },
  { slug: 'project-management', name: 'Project Management' },
  { slug: 'entrepreneurship', name: 'Entrepreneurship' },
  { slug: 'teaching', name: 'Teaching' },
  { slug: 'analytical-thinking', name: 'Analytical Thinking' },
  { slug: 'collaboration', name: 'Collaboration' },
  { slug: 'adaptability', name: 'Adaptability' },
] as const

export const CHALLENGES: ChallengeDef[] = [
  {
    slug: 'three-minute-explanation',
    skillSlug: 'communication',
    title: '3-Minute Explanation',
    prompt:
      'Explain a difficult topic to someone who has never heard about it before.',
    goal: 'Make the explanation simple, clear, and engaging.',
    estimatedTime: '3 min',
  },
  {
    slug: 'untangle-a-problem',
    skillSlug: 'problem-solving',
    title: 'Untangle a Problem',
    prompt:
      'Describe a messy problem you faced and walk through how you broke it down.',
    goal: 'Show a clear, step-by-step way of thinking.',
    estimatedTime: '5 min',
  },
  {
    slug: 'rally-the-group',
    skillSlug: 'leadership',
    title: 'Rally the Group',
    prompt:
      'Imagine your team is stuck and morale is low. What would you say to get everyone moving again?',
    goal: 'Motivate without pressure and set a clear direction.',
    estimatedTime: '4 min',
  },
  {
    slug: 'reframe-it',
    skillSlug: 'creativity',
    title: 'Reframe It',
    prompt:
      'Take an everyday object and describe three unexpected ways it could be used.',
    goal: 'Stretch beyond the obvious and connect distant ideas.',
    estimatedTime: '3 min',
  },
]

export function challengeForSkill(skillSlug: string, skillName?: string): ChallengeDef {
  return resolveChallengeForSkill(skillSlug, skillName)
}

export const STAGE_ORDER: SkillStage[] = [
  'discovered',
  'exploring',
  'developing',
  'practicing',
  'validated',
  'advanced',
]

export const STAGE_LABELS: Record<SkillStage, string> = {
  discovered: 'Discovered',
  exploring: 'Exploring',
  developing: 'Developing',
  practicing: 'Practicing',
  validated: 'Validated',
  advanced: 'Advanced',
}

export const STATUS_TONE: Record<
  SkillStatusLabel,
  { label: SkillStatusLabel; className: string }
> = {
  'Strong potential': {
    label: 'Strong potential',
    className: 'bg-primary/10 text-primary',
  },
  Validated: {
    label: 'Validated',
    className: 'bg-success/12 text-success',
  },
  Developing: {
    label: 'Developing',
    className: 'bg-accent text-accent-foreground',
  },
  'Worth exploring': {
    label: 'Worth exploring',
    className: 'bg-muted text-muted-foreground',
  },
}

export const EMPTY_PROFILE: Profile = {
  name: '',
  ageRange: '',
  education: '',
  interests: [],
  goal: '',
  interactionPreference: 'text',
  onboarded: false,
}

export const INTEREST_OPTIONS = [
  'Technology',
  'Engineering',
  'Design',
  'Writing',
  'Business',
  'Science',
  'Teaching',
  'Art & Music',
  'Sports',
  'Health',
  'Agriculture',
  'Gaming',
  'Community',
  'Travel',
]

export const GOAL_OPTIONS = [
  { value: 'unknown', label: "I don't know what I'm good at." },
  {
    value: 'develop',
    label: "I know some strengths but don't know how to develop them.",
  },
  { value: 'career', label: "I'm exploring career options (WAEC, university, work)." },
  { value: 'improve', label: 'I want to improve specific skills.' },
]

export const AGE_RANGES = ['Under 16', '16–20', '21–25', '26–34', '35+']

export const EDUCATION_LEVELS = [
  'Junior secondary (JSS)',
  'Senior secondary (SSS / Form 1–6)',
  'WAEC candidate',
  'University / college',
  'Self-taught',
  'Working professional',
]

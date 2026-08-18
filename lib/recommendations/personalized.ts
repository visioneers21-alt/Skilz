import type { SkilzState, UserSkill } from '@/lib/data/types'
import { SKILL_DOMAINS, type SkillDomainId } from '@/lib/discovery/catalog'
import { skillDomainForSlug, challengeForSkill, challengeHref } from '@/lib/challenges/catalog'
import { rankSkillsForRecommendations } from '@/lib/recommendations/explain'

export interface FieldRecommendation {
  id: string
  title: string
  emoji: string
  why: string
  matchedSkills: string[]
  starterProjects: string[]
  activities: string[]
  challengeHref?: string
  challengeTitle?: string
}

const DOMAIN_FIELDS: Record<
  SkillDomainId,
  { title: string; emoji: string; projects: string[]; activities: string[] }
> = {
  technical: {
    title: 'Technology & Digital Skills',
    emoji: '💻',
    projects: [
      'Build a simple calculator or quiz app idea on paper',
      'Help a friend fix a phone or computer problem and write down the steps',
      'Create a short “how technology works” explainer for classmates',
    ],
    activities: ['STEM club', 'Robotics or coding club', 'School ICT lab projects'],
  },
  analytical: {
    title: 'Data & Problem Solving',
    emoji: '📊',
    projects: [
      'Analyze results from a class survey and present findings',
      'Create a WAEC study plan for your weakest subject',
      'Research a local community problem and suggest solutions',
    ],
    activities: ['Math or science club', 'Debate club', 'Science fair'],
  },
  creative: {
    title: 'Design & Creativity',
    emoji: '🎨',
    projects: [
      'Redesign a school event poster or notice board',
      'Create a comic or zine about student life',
      'Sketch ideas for a product that solves a daily problem',
    ],
    activities: ['Art club', 'Drama or film club', 'School cultural day projects'],
  },
  communication: {
    title: 'Communication & Public Speaking',
    emoji: '🗣️',
    projects: [
      'Write a 1-minute speech for school assembly',
      'Record a short explainer video on a topic you know',
      'Interview a teacher about their career path',
    ],
    activities: ['Debate club', 'School magazine or radio', 'Student council'],
  },
  leadership: {
    title: 'Leadership & Community',
    emoji: '🚀',
    projects: [
      'Lead a small group project for class',
      'Organize a fundraiser or community clean-up',
      'Plan a club event from start to finish',
    ],
    activities: ['Student prefect roles', 'Peer mentoring', 'Youth leadership programs'],
  },
  business: {
    title: 'Business & Entrepreneurship',
    emoji: '💡',
    projects: [
      'Draft a simple business plan for a school snack or service idea',
      'Run a small fundraiser with clear costs and profits',
      'Interview a local business owner about how they started',
    ],
    activities: ['Entrepreneurship club', 'Market day at school', 'Young innovators groups'],
  },
  teaching: {
    title: 'Teaching & Mentoring',
    emoji: '📚',
    projects: [
      'Tutor a junior student in one WAEC subject',
      'Create flashcards for a topic your class finds difficult',
      'Explain one lesson to a friend who missed class',
    ],
    activities: ['Peer tutoring', 'Homework help group', 'STEM outreach volunteering'],
  },
  social: {
    title: 'People & Teamwork',
    emoji: '🤝',
    projects: [
      'Facilitate a group study session before a test',
      'Design a welcome guide for new students',
      'Help resolve a small conflict between classmates fairly',
    ],
    activities: ['Volunteering', 'Community service club', 'Peer support groups'],
  },
  organization: {
    title: 'Planning & Organization',
    emoji: '📋',
    projects: [
      'Plan a school event timeline with tasks and deadlines',
      'Create a shared study schedule for your class',
      'Improve how your club tracks meetings and decisions',
    ],
    activities: ['Event committee', 'Club secretary role', 'Class prefect duties'],
  },
  'hands-on': {
    title: 'Engineering & Making',
    emoji: '🔧',
    projects: [
      'Build a simple model or machine from available materials',
      'Fix something broken at home and document the process',
      'Design a solution for a problem in your neighborhood',
    ],
    activities: ['Maker or craft club', 'Agriculture or technical skills club', 'Sports teams'],
  },
  service: {
    title: 'Health & Community Care',
    emoji: '💚',
    projects: [
      'Create a wellness tips sheet for classmates',
      'Organize a neighborhood clean-up or health awareness day',
      'Volunteer with a local charity or community group',
    ],
    activities: ['First aid training', 'Community service club', 'Health awareness campaigns'],
  },
  media: {
    title: 'Content & Digital Media',
    emoji: '🎬',
    projects: [
      'Edit a short video about school life or a hobby',
      'Start a themed photo or story series on social media',
      'Write a blog-style post about a topic you care about',
    ],
    activities: ['Film or media club', 'School announcements team', 'Podcast or radio club'],
  },
}

export function buildFieldRecommendations(state: SkilzState, limit = 3): FieldRecommendation[] {
  const skills = rankSkillsForRecommendations(state).slice(0, 6)
  const byDomain = new Map<SkillDomainId, UserSkill[]>()

  for (const skill of skills) {
    const domain = skillDomainForSlug(skill.slug)
    const list = byDomain.get(domain) ?? []
    list.push(skill)
    byDomain.set(domain, list)
  }

  const fields: FieldRecommendation[] = []

  for (const [domain, matched] of byDomain) {
    const meta = DOMAIN_FIELDS[domain]
    const top = matched[0]!
    const challenge = challengeForSkill(top.slug, top.name)
    fields.push({
      id: domain,
      title: meta.title,
      emoji: meta.emoji,
      why: `You show potential in ${matched.map((s) => s.name).join(', ')} — possible areas to explore in ${SKILL_DOMAINS[domain]}.`,
      matchedSkills: matched.map((s) => s.name),
      starterProjects: meta.projects.slice(0, 3),
      activities: meta.activities.slice(0, 3),
      challengeHref: challengeHref(challenge.slug, top.slug),
      challengeTitle: challenge.title,
    })
  }

  return fields
    .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length)
    .slice(0, limit)
}

export function journeyStage(state: SkilzState): {
  stage: 'discover' | 'assess' | 'recommend' | 'explore' | 'track' | 'develop'
  index: number
} {
  const { discoveryComplete, skills, attempts, plan, skillFeedback } = state
  const hasReflection = attempts.some((a) => a.reflection)
  const hasFeedback = Object.keys(skillFeedback).length > 0
  const planProgress = plan.some((p) => p.status === 'done')

  if (!discoveryComplete || skills.length === 0) return { stage: 'discover', index: 0 }
  if (attempts.length === 0) return { stage: 'assess', index: 1 }
  if (!hasReflection && !hasFeedback) return { stage: 'assess', index: 1 }
  if (plan.length === 0) return { stage: 'recommend', index: 2 }
  if (!planProgress) return { stage: 'explore', index: 3 }
  return { stage: planProgress ? 'develop' : 'track', index: planProgress ? 5 : 4 }
}

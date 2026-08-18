import type { UserSkill } from '@/lib/data/types'
import { skillDomainForSlug } from '@/lib/challenges/catalog'
import { SKILL_DOMAINS, type SkillDomainId } from '@/lib/discovery/catalog'

/** Possible career directions to explore — not guaranteed outcomes. */
export const CAREER_AREAS_BY_DOMAIN: Record<
  SkillDomainId,
  { label: string; careers: string[]; hook: string }
> = {
  technical: {
    label: 'Technology & Digital Skills',
    careers: [
      'Software development',
      'Cybersecurity',
      'Data analysis',
      'Networking & IT support',
      'AI & robotics',
    ],
    hook: 'You show potential in technology and problem-solving — these are possible areas to explore.',
  },
  analytical: {
    label: 'Data, Research & Problem Solving',
    careers: [
      'Data analysis',
      'Research assistant',
      'Economics & finance',
      'Science & laboratory work',
      'Policy & planning support',
    ],
    hook: 'Pattern-finding and logical thinking suggest analytical paths worth exploring.',
  },
  creative: {
    label: 'Creative Industries',
    careers: [
      'Graphic design',
      'Animation',
      'Photography',
      'Fashion & crafts',
      'Content creation',
    ],
    hook: 'Creative signals point toward roles where ideas and visuals matter.',
  },
  communication: {
    label: 'Communication & Influence',
    careers: [
      'Journalism',
      'Public speaking & debate',
      'Teaching',
      'Law (possible path)',
      'Media presenting',
    ],
    hook: 'Clear communication opens doors in education, media, and leadership.',
  },
  leadership: {
    label: 'Leadership & Community',
    careers: [
      'Community leadership',
      'Project coordination',
      'Youth advocacy',
      'Team management',
      'Social entrepreneurship',
    ],
    hook: 'People-oriented strengths suit roles where you guide and motivate others.',
  },
  business: {
    label: 'Business & Entrepreneurship',
    careers: [
      'Entrepreneurship',
      'Marketing',
      'Accounting',
      'Business management',
      'Small business & trading',
    ],
    hook: 'Business-minded thinking fits growth, strategy, and local enterprise.',
  },
  teaching: {
    label: 'Teaching & Mentoring',
    careers: [
      'Teacher',
      'Tutor',
      'Coach',
      'Training facilitator',
      'Educational content creator',
    ],
    hook: 'Helping others learn is a transferable strength across many fields.',
  },
  social: {
    label: 'People & Community Work',
    careers: [
      'Counselling support',
      'Community work',
      'Customer relations',
      'Social services',
      'Peer mentoring',
    ],
    hook: 'Empathy and teamwork suit people-centered careers.',
  },
  organization: {
    label: 'Planning & Administration',
    careers: [
      'Project management',
      'Event planning',
      'School administration support',
      'Operations coordination',
      'Logistics',
    ],
    hook: 'Planning skills are always in demand — coordinators keep things moving.',
  },
  'hands-on': {
    label: 'Engineering & Making',
    careers: [
      'Civil engineering',
      'Electrical engineering',
      'Mechanical engineering',
      'Renewable energy',
      'Construction & trades',
    ],
    hook: 'Hands-on potential fits making, building, and solving practical problems.',
  },
  service: {
    label: 'Health & Care',
    careers: [
      'Nursing',
      'Public health support',
      'Community health worker',
      'Pharmacy assistant',
      'Nutrition & wellness',
    ],
    hook: 'Care-oriented strengths align with roles that help people directly.',
  },
  media: {
    label: 'Media & Content',
    careers: [
      'Video production',
      'Social media',
      'Podcasting',
      'Digital journalism',
      'Broadcasting',
    ],
    hook: 'Media and storytelling skills suit content-driven careers.',
  },
}

const DOMAIN_ROLES = Object.fromEntries(
  Object.entries(CAREER_AREAS_BY_DOMAIN).map(([domain, entry]) => [
    domain,
    { roles: entry.careers, hook: entry.hook },
  ]),
) as Record<string, { roles: string[]; hook: string }>

export interface CareerPath {
  id: string
  title: string
  roles: string[]
  hook: string
  matchedSkills: string[]
  score: number
  domainLabel?: string
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Suggest 2–4 possible career areas from the user's top skills. */
export function suggestCareerPaths(skills: UserSkill[], limit = 4): CareerPath[] {
  const scored = new Map<string, CareerPath>()

  for (const skill of skills.slice(0, 5)) {
    const domain = skillDomainForSlug(skill.slug)
    const entry = DOMAIN_ROLES[domain] ?? {
      roles: ['Cross-functional roles', 'Emerging fields'],
      hook: `You show potential in ${skill.name} — worth exploring paths connected to ${SKILL_DOMAINS[domain] ?? 'this area'}.`,
    }
    const domainMeta = CAREER_AREAS_BY_DOMAIN[domain]

    for (const role of entry.roles) {
      const id = slugify(role)
      const existing = scored.get(id)
      if (existing) {
        existing.score += skill.confidenceScore
        if (!existing.matchedSkills.includes(skill.name)) {
          existing.matchedSkills.push(skill.name)
        }
      } else {
        scored.set(id, {
          id,
          title: role,
          roles: entry.roles,
          hook: entry.hook,
          matchedSkills: [skill.name],
          score: skill.confidenceScore,
          domainLabel: domainMeta?.label,
        })
      }
    }
  }

  return [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** Group career suggestions by domain for the Explore page. */
export function suggestCareerAreas(skills: UserSkill[], limit = 4) {
  const seen = new Set<SkillDomainId>()
  const areas: {
    domain: SkillDomainId
    label: string
    careers: string[]
    hook: string
    matchedSkills: string[]
  }[] = []

  for (const skill of skills) {
    const domain = skillDomainForSlug(skill.slug)
    if (seen.has(domain)) {
      const area = areas.find((a) => a.domain === domain)
      if (area && !area.matchedSkills.includes(skill.name)) {
        area.matchedSkills.push(skill.name)
      }
      continue
    }
    seen.add(domain)
    const meta = CAREER_AREAS_BY_DOMAIN[domain]
    areas.push({
      domain,
      label: meta.label,
      careers: meta.careers,
      hook: meta.hook,
      matchedSkills: [skill.name],
    })
    if (areas.length >= limit) break
  }

  return areas
}

export function isCareerExplorer(goal: string): boolean {
  return goal.includes('career') || goal.includes('exploring career')
}

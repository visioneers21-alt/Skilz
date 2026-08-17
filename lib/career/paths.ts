import type { UserSkill } from '@/lib/data/types'

/** Lightweight skill → role cluster mapping (no job board required). */
const SKILL_PATHS: Record<string, { roles: string[]; hook: string }> = {
  communication: {
    roles: ['Customer success', 'UX writing', 'Training & enablement', 'Sales'],
    hook: 'You translate complex ideas for others — roles that need clarity win here.',
  },
  'problem-solving': {
    roles: ['Product management', 'Operations', 'Consulting', 'Engineering'],
    hook: 'Breaking down messy problems is a core skill in analytical roles.',
  },
  leadership: {
    roles: ['Team lead', 'Project manager', 'Community organizer', 'Founder'],
    hook: 'People follow your direction when stakes are unclear.',
  },
  creativity: {
    roles: ['Content creator', 'Marketing', 'Design', 'Innovation roles'],
    hook: 'You connect ideas others miss — creative and strategy roles benefit.',
  },
  'project-management': {
    roles: ['Program manager', 'Scrum master', 'Event planner', 'Operations'],
    hook: 'Keeping work moving is underrated — coordinators are always in demand.',
  },
  entrepreneurship: {
    roles: ['Startup founder', 'Freelancer', 'Side-business owner', 'Biz dev'],
    hook: 'You spot opportunities and act — building something is a natural fit.',
  },
  teaching: {
    roles: ['Educator', 'Coach', 'Technical trainer', 'Instructional design'],
    hook: 'Helping others learn is a transferable superpower across industries.',
  },
  'analytical-thinking': {
    roles: ['Data analyst', 'Research', 'Finance', 'Policy & strategy'],
    hook: 'Pattern-finding and evidence-based decisions open analytical paths.',
  },
  collaboration: {
    roles: ['HR / people ops', 'Nonprofit work', 'Cross-functional PM', 'Partnerships'],
    hook: 'Teams run on trust — collaboration-heavy roles suit you well.',
  },
  adaptability: {
    roles: ['Startup generalist', 'Emergency response', 'Change management', 'Consulting'],
    hook: 'Thriving in uncertainty is rare — fast-changing environments need this.',
  },
}

export interface CareerPath {
  id: string
  title: string
  roles: string[]
  hook: string
  matchedSkills: string[]
  score: number
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Suggest 2–4 career paths from the user's top skills. */
export function suggestCareerPaths(skills: UserSkill[], limit = 4): CareerPath[] {
  const scored = new Map<string, CareerPath>()

  for (const skill of skills.slice(0, 5)) {
    const entry = SKILL_PATHS[skill.slug] ?? {
      roles: ['Generalist roles', 'Cross-functional teams', 'Emerging fields'],
      hook: `${skill.name} shows up in many modern roles — worth exploring broadly.`,
    }

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
        })
      }
    }
  }

  return [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function isCareerExplorer(goal: string): boolean {
  return goal.includes('career') || goal.includes('exploring career')
}

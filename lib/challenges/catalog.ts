import type { ChallengeDef } from '@/lib/data/seed'
import {
  SKILLS_BY_SLUG,
  SKILL_DOMAINS,
  type SkillDomainId,
} from '@/lib/discovery/catalog'

export const DOMAIN_CHALLENGES: Record<SkillDomainId, ChallengeDef[]> = {
  communication: [
    {
      slug: 'explain-in-one-minute',
      skillSlug: '_domain',
      title: 'One-Minute Explanation',
      prompt:
        'Pick something you know well (a hobby, game, or school topic). Explain it in one minute as if teaching a friend who knows nothing about it.',
      goal: 'Show you can make ideas clear and easy to follow.',
      estimatedTime: '3 min',
    },
    {
      slug: 'persuade-the-room',
      skillSlug: '_domain',
      title: 'Mini Persuasion',
      prompt:
        'Your school wants to cancel a club you enjoy. Write or say 3 reasons why it should stay — keep it friendly and convincing.',
      goal: 'Practice structuring arguments people can understand.',
      estimatedTime: '4 min',
    },
  ],
  leadership: [
    {
      slug: 'rally-the-group',
      skillSlug: '_domain',
      title: 'Rally the Group',
      prompt:
        'Imagine your team is stuck and morale is low. What would you say to get everyone moving again?',
      goal: 'Motivate without pressure and set a clear direction.',
      estimatedTime: '4 min',
    },
    {
      slug: 'tough-decision',
      skillSlug: '_domain',
      title: 'Decision Under Pressure',
      prompt:
        'Your group has two good ideas but time for only one. Walk through how you would decide and get everyone on board.',
      goal: 'Show fair decision-making and leadership.',
      estimatedTime: '5 min',
    },
  ],
  creative: [
    {
      slug: 'reframe-it',
      skillSlug: '_domain',
      title: 'Reframe It',
      prompt:
        'Take an everyday object (a spoon, shoe, or water bottle). Describe three unexpected ways it could be used.',
      goal: 'Stretch beyond the obvious and connect distant ideas.',
      estimatedTime: '3 min',
    },
    {
      slug: 'story-hook',
      skillSlug: '_domain',
      title: 'Story Starter',
      prompt:
        'Write or tell the opening of a short story that starts with: "Nobody expected the door to open on its own."',
      goal: 'Show creative imagination and narrative skill.',
      estimatedTime: '4 min',
    },
  ],
  technical: [
    {
      slug: 'logic-puzzle',
      skillSlug: '_domain',
      title: 'Logic Puzzle',
      prompt:
        'Three switches control three lights in another room. You can only visit the room once. Explain step by step how you would figure out which switch controls which light.',
      goal: 'Show systematic, logical problem-solving.',
      estimatedTime: '5 min',
    },
    {
      slug: 'debug-the-plan',
      skillSlug: '_domain',
      title: 'Debug the Plan',
      prompt:
        'A simple app keeps crashing when users tap "Submit." List how you would investigate and fix it — even if you do not code yet.',
      goal: 'Show technical thinking and persistence.',
      estimatedTime: '4 min',
    },
  ],
  analytical: [
    {
      slug: 'untangle-a-problem',
      skillSlug: '_domain',
      title: 'Untangle a Problem',
      prompt:
        'Describe a messy problem you faced (school, home, or hobby). Walk through how you broke it into smaller parts.',
      goal: 'Show clear, step-by-step analytical thinking.',
      estimatedTime: '5 min',
    },
    {
      slug: 'spot-the-pattern',
      skillSlug: '_domain',
      title: 'Spot the Pattern',
      prompt:
        'Look at your last week: what repeated? Share one pattern you notice and what it might mean.',
      goal: 'Practice observation and evidence-based thinking.',
      estimatedTime: '4 min',
    },
  ],
  business: [
    {
      slug: 'mini-pitch',
      skillSlug: '_domain',
      title: 'Mini Pitch',
      prompt:
        'Invent a simple product or service for students at your school. Pitch it in 4–5 sentences: problem, solution, why people would want it.',
      goal: 'Show entrepreneurial and communication thinking.',
      estimatedTime: '4 min',
    },
    {
      slug: 'improve-a-process',
      skillSlug: '_domain',
      title: 'Improve a Process',
      prompt:
        'Pick something inefficient at school or home. Suggest one practical improvement.',
      goal: 'Show business-minded problem solving.',
      estimatedTime: '4 min',
    },
  ],
  teaching: [
    {
      slug: 'teach-a-friend',
      skillSlug: '_domain',
      title: 'Teach a Friend',
      prompt:
        'Explain how to do something you are good at as if teaching someone for the first time.',
      goal: 'Show patience and ability to break down knowledge.',
      estimatedTime: '4 min',
    },
    {
      slug: 'three-minute-explanation',
      skillSlug: '_domain',
      title: '3-Minute Lesson',
      prompt:
        'Pick a topic from school. Explain the main idea so a younger student could understand.',
      goal: 'Make complex ideas simple and engaging.',
      estimatedTime: '3 min',
    },
  ],
  social: [
    {
      slug: 'help-a-stranger',
      skillSlug: '_domain',
      title: 'Help Scenario',
      prompt:
        'A new student joins your class and looks lost. Describe what you would say and do in the first 5 minutes to help them feel welcome.',
      goal: 'Show empathy and social awareness.',
      estimatedTime: '4 min',
    },
    {
      slug: 'mediate-mini',
      skillSlug: '_domain',
      title: 'Mini Mediation',
      prompt:
        'Two friends disagree about which project idea to use. How would you help them find a fair solution?',
      goal: 'Show collaboration and emotional intelligence.',
      estimatedTime: '4 min',
    },
  ],
  organization: [
    {
      slug: 'plan-the-event',
      skillSlug: '_domain',
      title: 'Plan the Event',
      prompt:
        'Plan a small school event in bullet steps: goal, tasks, timeline, who does what.',
      goal: 'Show planning and organization skills.',
      estimatedTime: '5 min',
    },
    {
      slug: 'priority-stack',
      skillSlug: '_domain',
      title: 'Priority Stack',
      prompt:
        'You have 4 tasks due this week but only time for 2. Explain which 2 you would do first and why.',
      goal: 'Show prioritization under pressure.',
      estimatedTime: '3 min',
    },
  ],
  'hands-on': [
    {
      slug: 'build-without-instructions',
      skillSlug: '_domain',
      title: 'Build Without Instructions',
      prompt:
        'Describe something you built, fixed, or made with your hands. What went wrong? What did you learn?',
      goal: 'Show practical problem-solving and persistence.',
      estimatedTime: '4 min',
    },
    {
      slug: 'design-a-fix',
      skillSlug: '_domain',
      title: 'Design a Fix',
      prompt:
        'Something at home or school is broken or awkward to use. Describe a simple fix and how you would test it.',
      goal: 'Show hands-on engineering thinking.',
      estimatedTime: '5 min',
    },
  ],
  service: [
    {
      slug: 'customer-moment',
      skillSlug: '_domain',
      title: 'Help Like a Pro',
      prompt:
        'Imagine someone is frustrated waiting for help. Write what you would say to calm them and solve their problem.',
      goal: 'Show service mindset and patience.',
      estimatedTime: '4 min',
    },
    {
      slug: 'community-idea',
      skillSlug: '_domain',
      title: 'Community Idea',
      prompt:
        'Suggest one small project that would help people in your community. Who benefits? What is the first step?',
      goal: 'Show care-oriented thinking.',
      estimatedTime: '4 min',
    },
  ],
  media: [
    {
      slug: 'content-hook',
      skillSlug: '_domain',
      title: 'Content Hook',
      prompt:
        'Pick a topic you care about. Write the first 30 seconds of a video script that would make someone want to keep watching.',
      goal: 'Show storytelling and audience awareness.',
      estimatedTime: '4 min',
    },
    {
      slug: 'visual-story',
      skillSlug: '_domain',
      title: 'Visual Story',
      prompt:
        'Describe 5 photos you would take to tell a story about "a day in my life."',
      goal: 'Show media and visual communication skills.',
      estimatedTime: '4 min',
    },
  ],
}

const SLUG_DOMAIN_HINTS: Record<string, SkillDomainId> = {
  communication: 'communication',
  'problem-solving': 'analytical',
  leadership: 'leadership',
  creativity: 'creative',
  'project-management': 'organization',
  entrepreneurship: 'business',
  teaching: 'teaching',
  'analytical-thinking': 'analytical',
  collaboration: 'social',
  adaptability: 'social',
}

function inferDomain(skillSlug: string): SkillDomainId {
  const fromCatalog = SKILLS_BY_SLUG[skillSlug]?.domain
  if (fromCatalog) return fromCatalog
  for (const [hint, domain] of Object.entries(SLUG_DOMAIN_HINTS)) {
    if (skillSlug.includes(hint)) return domain
  }
  return 'analytical'
}

function stableIndex(key: string, max: number): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i) * (i + 1)) % 997
  return hash % max
}

export function challengeForSkill(skillSlug: string, skillName?: string): ChallengeDef {
  const domain = inferDomain(skillSlug)
  const pool = DOMAIN_CHALLENGES[domain]
  const template = pool[stableIndex(skillSlug, pool.length)]!
  const label = skillName ?? skillSlug.replace(/-/g, ' ')
  return {
    ...template,
    skillSlug,
    title: `${template.title}`,
    prompt: `${template.prompt}\n\n(This challenge helps you test potential in: ${label}.)`,
  }
}

export function allChallengeTemplates(): ChallengeDef[] {
  const seen = new Set<string>()
  const out: ChallengeDef[] = []
  for (const pool of Object.values(DOMAIN_CHALLENGES)) {
    for (const c of pool) {
      if (seen.has(c.slug)) continue
      seen.add(c.slug)
      out.push(c)
    }
  }
  return out
}

export function findChallengeTemplate(challengeSlug: string): ChallengeDef | undefined {
  return allChallengeTemplates().find((c) => c.slug === challengeSlug)
}

/** Build challenge page URL with skill context. */
export function challengeHref(challengeSlug: string, skillSlug: string): string {
  return `/challenge/${challengeSlug}?skill=${encodeURIComponent(skillSlug)}`
}

export function resolveChallengeForPage(
  challengeSlug: string,
  skillSlug: string,
  skillName?: string,
): ChallengeDef {
  const template = findChallengeTemplate(challengeSlug)
  if (!template) {
    return challengeForSkill(skillSlug, skillName)
  }
  const label = skillName ?? skillSlug.replace(/-/g, ' ')
  return {
    ...template,
    skillSlug,
    prompt: `${template.prompt}\n\n(This challenge helps you test potential in: ${label}.)`,
  }
}

export { inferDomain as skillDomainForSlug }

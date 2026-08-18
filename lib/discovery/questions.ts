import type { SkillDomainId } from '@/lib/discovery/catalog'

export const DISCOVERY_QUESTION_COUNT = 20

export interface DiscoveryOption {
  id: string
  label: string
  domainBoosts?: Partial<Record<SkillDomainId, number>>
  skillBoosts?: Record<string, number>
  domainPenalties?: Partial<Record<SkillDomainId, number>>
}

export interface DiscoveryQuestion {
  id: string
  prompt: string
  hint?: string
  options: DiscoveryOption[]
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: 'q1-natural',
    prompt: 'Which kind of activity feels most natural to you at school or in your community?',
    hint: 'Think about what you do without being asked — clubs, subjects, or helping others.',
    options: [
      { id: 'a', label: 'Explaining or presenting ideas to others', domainBoosts: { communication: 3, teaching: 2 } },
      { id: 'b', label: 'Building, fixing, or making things with my hands', domainBoosts: { 'hands-on': 3, technical: 1 } },
      { id: 'c', label: 'Analyzing data, patterns, or how things work', domainBoosts: { analytical: 3, technical: 2 } },
      { id: 'd', label: 'Creating visuals, stories, or original ideas', domainBoosts: { creative: 3, media: 2 } },
    ],
  },
  {
    id: 'q2-help',
    prompt: 'What do people most often ask you for help with?',
    options: [
      { id: 'a', label: 'Advice, emotional support, or mediating disagreements', domainBoosts: { social: 3, service: 2 } },
      { id: 'b', label: 'Organizing plans, deadlines, or group work', domainBoosts: { organization: 3, leadership: 2 } },
      { id: 'c', label: 'Tech problems, research, or figuring things out', domainBoosts: { technical: 3, analytical: 2 } },
      { id: 'd', label: 'Writing, design, or making content look good', domainBoosts: { creative: 2, communication: 2, media: 2 } },
    ],
  },
  {
    id: 'q3-energy',
    prompt: 'What kind of work gives you the most energy?',
    options: [
      { id: 'a', label: 'Leading or motivating a team toward a goal', domainBoosts: { leadership: 3, social: 1 } },
      { id: 'b', label: 'Deep focus on one complex problem', domainBoosts: { analytical: 3, technical: 1 } },
      { id: 'c', label: 'Helping someone learn or improve', domainBoosts: { teaching: 3, social: 2 } },
      { id: 'd', label: 'Starting something new — a project, idea, or venture', domainBoosts: { business: 3, creative: 1 }, skillBoosts: { entrepreneurship: 2, ideation: 2 } },
    ],
  },
  {
    id: 'q4-environment',
    prompt: 'Where do you do your best work?',
    hint: 'School lab, debate stage, quiet study, or out in the community.',
    options: [
      { id: 'a', label: 'Collaborating face-to-face with a group', domainBoosts: { social: 2, leadership: 1 }, skillBoosts: { collaboration: 2, teamwork: 2 } },
      { id: 'b', label: 'Quiet solo time with minimal interruptions', domainBoosts: { analytical: 2, creative: 2 } },
      { id: 'c', label: 'On my feet — moving, building, or doing physical tasks', domainBoosts: { 'hands-on': 3, service: 1 } },
      { id: 'd', label: 'In front of an audience or camera', domainBoosts: { communication: 2, media: 2, leadership: 1 } },
    ],
  },
  {
    id: 'q5-stuck',
    prompt: 'When you get stuck on a problem, you usually…',
    options: [
      { id: 'a', label: 'Break it into smaller steps and test each one', domainBoosts: { analytical: 2, organization: 1 }, skillBoosts: { 'problem-decomposition': 3, 'root-cause-analysis': 2 } },
      { id: 'b', label: 'Ask someone who might know or brainstorm together', domainBoosts: { social: 2, teaching: 1 } },
      { id: 'c', label: 'Try a completely different angle or creative workaround', domainBoosts: { creative: 3, business: 1 }, skillBoosts: { ideation: 2 } },
      { id: 'd', label: 'Look up documentation, tutorials, or research first', domainBoosts: { technical: 2, analytical: 2, teaching: 1 } },
    ],
  },
  {
    id: 'q6-proud',
    prompt: 'You feel most proud when you…',
    options: [
      { id: 'a', label: 'Deliver something polished that others can use', domainBoosts: { organization: 2, technical: 1, creative: 1 } },
      { id: 'b', label: 'Help someone succeed who was struggling', domainBoosts: { teaching: 2, service: 2, social: 2 } },
      { id: 'c', label: 'Win people over or close a deal', domainBoosts: { business: 2, communication: 2 }, skillBoosts: { sales: 2, negotiation: 2 } },
      { id: 'd', label: 'Uncover an insight others missed', domainBoosts: { analytical: 3 }, skillBoosts: { 'critical-thinking': 2, 'data-analysis': 2 } },
    ],
  },
  {
    id: 'q7-learning',
    prompt: 'How do you prefer to learn something new?',
    options: [
      { id: 'a', label: 'Hands-on trial and error', domainBoosts: { 'hands-on': 2, technical: 2 } },
      { id: 'b', label: 'Reading, courses, or structured study', domainBoosts: { analytical: 2, teaching: 1 } },
      { id: 'c', label: 'Watching someone demo it, then copying', domainBoosts: { teaching: 2, social: 1 } },
      { id: 'd', label: 'Making something and iterating from feedback', domainBoosts: { creative: 2, media: 2, business: 1 } },
    ],
  },
  {
    id: 'q8-group',
    prompt: 'In a group project, you naturally become the person who…',
    options: [
      { id: 'a', label: 'Keeps everyone on track and divides the work', domainBoosts: { organization: 2, leadership: 2 }, skillBoosts: { 'project-management': 3, delegation: 2 } },
      { id: 'b', label: 'Generates the big ideas and creative direction', domainBoosts: { creative: 3, business: 1 }, skillBoosts: { ideation: 2, 'brand-design': 1 } },
      { id: 'c', label: 'Checks the details, quality, and final output', domainBoosts: { analytical: 2, organization: 1 }, skillBoosts: { 'quality-assurance': 2, editing: 2 } },
      { id: 'd', label: 'Makes sure everyone feels heard and included', domainBoosts: { social: 3, service: 1 }, skillBoosts: { empathy: 2, collaboration: 2 } },
    ],
  },
  {
    id: 'q9-tools',
    prompt: 'Which tools would you reach for first?',
    options: [
      { id: 'a', label: 'A spreadsheet, notebook, or research database', domainBoosts: { analytical: 3, organization: 1 } },
      { id: 'b', label: 'Design software, camera, or creative apps', domainBoosts: { creative: 3, media: 2 } },
      { id: 'c', label: 'Code editor, terminal, or automation scripts', domainBoosts: { technical: 3, analytical: 1 } },
      { id: 'd', label: 'Calendar, checklist, or project board', domainBoosts: { organization: 3, leadership: 1 } },
    ],
  },
  {
    id: 'q10-conflict',
    prompt: 'When two people disagree, you tend to…',
    options: [
      { id: 'a', label: 'Listen to both sides and find common ground', domainBoosts: { social: 2, communication: 2 }, skillBoosts: { 'conflict-mediation': 3, 'active-listening': 2 } },
      { id: 'b', label: 'Focus on facts and what the evidence shows', domainBoosts: { analytical: 2, leadership: 1 }, skillBoosts: { 'critical-thinking': 2, 'evidence-evaluation': 2 } },
      { id: 'c', label: 'Propose a practical compromise to move forward', domainBoosts: { leadership: 2, business: 1 }, skillBoosts: { negotiation: 2, 'decision-making': 2 } },
      { id: 'd', label: 'Stay out of it unless someone asks for help', domainBoosts: { analytical: 1, 'hands-on': 1 } },
    ],
  },
  {
    id: 'q11-problems',
    prompt: 'Which problems excite you most?',
    options: [
      { id: 'a', label: 'How to reach more people with a message or product', domainBoosts: { business: 2, media: 2 }, skillBoosts: { marketing: 2, 'content-creation': 2 } },
      { id: 'b', label: 'How to make systems faster, safer, or smarter', domainBoosts: { technical: 3, analytical: 1 } },
      { id: 'c', label: 'How to improve someone\'s health, wellbeing, or daily life', domainBoosts: { service: 3, social: 2 } },
      { id: 'd', label: 'How to express an idea in a compelling way', domainBoosts: { communication: 2, creative: 2, media: 1 } },
    ],
  },
  {
    id: 'q12-described',
    prompt: 'Friends would most likely describe you as…',
    options: [
      { id: 'a', label: 'The reliable planner who always follows through', domainBoosts: { organization: 2, leadership: 1 }, skillBoosts: { accountability: 2, 'time-management': 2 } },
      { id: 'b', label: 'The creative one with unexpected ideas', domainBoosts: { creative: 3, media: 1 } },
      { id: 'c', label: 'The go-to helper when someone is in need', domainBoosts: { service: 2, social: 2, teaching: 1 } },
      { id: 'd', label: 'The curious one who digs until they understand', domainBoosts: { analytical: 3, technical: 1 } },
    ],
  },
  {
    id: 'q13-hobby',
    prompt: 'Outside school or work, you spend free time on…',
    options: [
      { id: 'a', label: 'Games, gadgets, coding, or tinkering', domainBoosts: { technical: 3, analytical: 1 } },
      { id: 'b', label: 'Art, music, writing, or content creation', domainBoosts: { creative: 2, media: 3 } },
      { id: 'c', label: 'Sports, crafts, cooking, or outdoor activities', domainBoosts: { 'hands-on': 3 } },
      { id: 'd', label: 'Volunteering, clubs, or community events', domainBoosts: { social: 2, service: 2, leadership: 1 } },
    ],
  },
  {
    id: 'q14-outcome',
    prompt: 'Which outcome matters most to you right now?',
    options: [
      { id: 'a', label: 'Building skills for a clear career path', domainBoosts: { business: 2, organization: 1, analytical: 1 } },
      { id: 'b', label: 'Making a positive impact on people\'s lives', domainBoosts: { service: 2, teaching: 2, social: 2 } },
      { id: 'c', label: 'Creating something original the world hasn\'t seen', domainBoosts: { creative: 3, business: 1, media: 1 } },
      { id: 'd', label: 'Mastering a technical or specialist craft', domainBoosts: { technical: 2, analytical: 2, 'hands-on': 1 } },
    ],
  },
  {
    id: 'q15-known-for',
    prompt: 'You\'d rather be known for…',
    options: [
      { id: 'a', label: 'Communicating clearly and persuasively', domainBoosts: { communication: 3 }, skillBoosts: { 'public-speaking': 2, 'persuasive-writing': 2 } },
      { id: 'b', label: 'Solving hard problems others give up on', domainBoosts: { analytical: 2, technical: 1 }, skillBoosts: { 'problem-decomposition': 2, 'software-development': 1 } },
      { id: 'c', label: 'Inspiring and leading people', domainBoosts: { leadership: 3, social: 1 } },
      { id: 'd', label: 'Designing beautiful or useful experiences', domainBoosts: { creative: 3 }, skillBoosts: { 'ux-design': 2, 'visual-design': 2 } },
    ],
  },
  {
    id: 'q16-scenario',
    prompt: 'Imagine someone is struggling with a task. You would most likely…',
    options: [
      { id: 'a', label: 'Walk them through it step by step', domainBoosts: { teaching: 3, communication: 1 }, skillBoosts: { tutoring: 2, 'explain-complex-topics': 2 } },
      { id: 'b', label: 'Take over and fix it quickly yourself', domainBoosts: { technical: 2, 'hands-on': 2, service: 1 } },
      { id: 'c', label: 'Ask questions until you find the root issue', domainBoosts: { analytical: 2, social: 1 }, skillBoosts: { 'root-cause-analysis': 2, 'active-listening': 2 } },
      { id: 'd', label: 'Suggest a simpler or smarter way to do it', domainBoosts: { creative: 2, business: 1, organization: 1 }, skillBoosts: { 'process-improvement': 2, ideation: 1 } },
    ],
  },
  {
    id: 'q17-deadline',
    prompt: 'When facing a tight deadline, you…',
    options: [
      { id: 'a', label: 'Prioritize ruthlessly and cut scope if needed', domainBoosts: { organization: 2, leadership: 1 }, skillBoosts: { prioritization: 3, 'project-management': 2 } },
      { id: 'b', label: 'Put in extra focused hours alone', domainBoosts: { analytical: 2, technical: 2, creative: 1 } },
      { id: 'c', label: 'Rally the team and divide urgent tasks', domainBoosts: { leadership: 3, social: 1 }, skillBoosts: { 'team-leadership': 2, motivation: 2 } },
      { id: 'd', label: 'Stay calm and support others who are stressed', domainBoosts: { social: 2, service: 2 }, skillBoosts: { 'emotional-intelligence': 2, empathy: 2 } },
    ],
  },
  {
    id: 'q18-compliment',
    prompt: 'Which compliment would mean the most to you?',
    options: [
      { id: 'a', label: '"You made that so easy to understand"', domainBoosts: { teaching: 2, communication: 2 } },
      { id: 'b', label: '"I never would have thought of that"', domainBoosts: { creative: 3, analytical: 1 } },
      { id: 'c', label: '"We couldn\'t have done this without you"', domainBoosts: { leadership: 2, social: 2, organization: 1 } },
      { id: 'd', label: '"That was exactly what I needed"', domainBoosts: { service: 3, social: 1 } },
    ],
  },
  {
    id: 'q19-afternoon',
    prompt: 'If you had a free afternoon with no obligations, you might…',
    options: [
      { id: 'a', label: 'Start a side project or business idea', domainBoosts: { business: 3, creative: 1 }, skillBoosts: { entrepreneurship: 2, 'product-strategy': 1 } },
      { id: 'b', label: 'Learn a new skill from a tutorial or book', domainBoosts: { teaching: 1, analytical: 2, technical: 1 } },
      { id: 'c', label: 'Meet up with friends or help someone out', domainBoosts: { social: 3, service: 1 } },
      { id: 'd', label: 'Make something — art, food, code, or video', domainBoosts: { creative: 2, media: 2, 'hands-on': 1, technical: 1 } },
    ],
  },
  {
    id: 'q20-identity',
    prompt: 'Which statement feels closest to who you are?',
    hint: 'Options are tailored to your answers so far.',
    options: [],
  },
]

export function buildFinalQuestionOptions(
  topSkillSlugs: string[],
  labels: Record<string, string>,
): DiscoveryOption[] {
  return topSkillSlugs.slice(0, 4).map((slug, i) => ({
    id: String.fromCharCode(97 + i),
    label: `I strongly relate to ${labels[slug] ?? slug}`,
    skillBoosts: { [slug]: 4 },
  }))
}

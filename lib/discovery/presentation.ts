/** Playful UI copy & visuals — separate from scoring logic in questions.ts */

export interface OptionUi {
  emoji: string
  title: string
  detail?: string
}

export interface QuestionUi {
  emoji: string
  title: string
  scene: string
  mascotLine: string
  options: Record<string, OptionUi>
}

export const CHEER_MESSAGES = [
  'Nice pick!',
  'Great choice!',
  'Ooh, interesting!',
  'Love it!',
  'Cool!',
  'Awesome!',
  'Got it!',
  'Super!',
] as const

export const MILESTONE_MESSAGES: Record<number, string> = {
  5: 'Chapter 1 done — nice work!',
  10: 'Halfway through your journey!',
  15: 'One chapter left — almost there!',
  20: 'Journey complete — time to see your potential!',
}

export const QUESTION_UI: Record<string, QuestionUi> = {
  'q1-natural': {
    emoji: '🌟',
    title: 'What feels most like YOU?',
    scene: 'Think about after school — clubs, homework, helping at home, or free time.',
    mascotLine: 'Pick the one that makes you go "yes, that\'s me!"',
    options: {
      a: { emoji: '🗣️', title: 'Talking & sharing ideas', detail: 'Shows, explains, presents' },
      b: { emoji: '🔧', title: 'Building & fixing stuff', detail: 'Hands-on maker energy' },
      c: { emoji: '🔍', title: 'Figuring out how things work', detail: 'Detective brain' },
      d: { emoji: '🎨', title: 'Drawing, writing, or inventing', detail: 'Creative spark' },
    },
  },
  'q2-help': {
    emoji: '🆘',
    title: 'What do friends ask YOU for?',
    scene: 'At school, in your club, or in your community — when someone needs help, they come to you because…',
    mascotLine: 'There are no wrong answers — just pick what happens most!',
    options: {
      a: { emoji: '💬', title: 'Feelings & friend advice', detail: 'Good listener' },
      b: { emoji: '📋', title: 'Plans, lists & organizing', detail: 'Gets things done' },
      c: { emoji: '💻', title: 'Tech, facts & puzzles', detail: 'Problem solver' },
      d: { emoji: '✏️', title: 'Making things look cool', detail: 'Design & words' },
    },
  },
  'q3-energy': {
    emoji: '⚡',
    title: 'What gives you super energy?',
    scene: 'Think about when time flies and you feel alive.',
    mascotLine: 'Which one charges you up like a power-up?',
    options: {
      a: { emoji: '🚀', title: 'Leading the team forward', detail: 'Captain energy' },
      b: { emoji: '🧩', title: 'Solving one tricky puzzle', detail: 'Focus mode' },
      c: { emoji: '📚', title: 'Teaching someone new', detail: 'Helper hero' },
      d: { emoji: '💡', title: 'Starting a brand-new idea', detail: 'Idea starter' },
    },
  },
  'q4-environment': {
    emoji: '🏠',
    title: 'Where do you shine brightest?',
    scene: 'At school, at home, or in your community — where do you do your best?',
    mascotLine: 'Tap the place where you feel most confident!',
    options: {
      a: { emoji: '👥', title: 'With a group, chatting & teaming up', detail: 'Team player' },
      b: { emoji: '🤫', title: 'Quiet corner, just me', detail: 'Solo zone' },
      c: { emoji: '🏃', title: 'Moving around, hands busy', detail: 'Active mode' },
      d: { emoji: '🎤', title: 'On stage or on camera', detail: 'Spotlight ready' },
    },
  },
  'q5-stuck': {
    emoji: '🤔',
    title: 'When you\'re stuck, you…',
    scene: 'WAEC prep, a tough assignment, or a tricky problem appears!',
    mascotLine: 'What\'s your go-to move?',
    options: {
      a: { emoji: '🪜', title: 'Break it into tiny steps', detail: 'Step by step' },
      b: { emoji: '🙋', title: 'Ask a friend or brainstorm', detail: 'Team up' },
      c: { emoji: '🌀', title: 'Try a wild new angle', detail: 'Creative twist' },
      d: { emoji: '📖', title: 'Look it up or watch a tutorial', detail: 'Research first' },
    },
  },
  'q6-proud': {
    emoji: '🏆',
    title: 'You feel proudest when you…',
    scene: 'That warm fuzzy "I did it!" moment.',
    mascotLine: 'Which win feels the best?',
    options: {
      a: { emoji: '✅', title: 'Finish something useful for others', detail: 'Delivered!' },
      b: { emoji: '🤝', title: 'Help someone who was struggling', detail: 'Helper win' },
      c: { emoji: '🎯', title: 'Persuade or win people over', detail: 'Charm & close' },
      d: { emoji: '💎', title: 'Discover something others missed', detail: 'Aha moment' },
    },
  },
  'q7-learning': {
    emoji: '📖',
    title: 'Best way for YOU to learn?',
    scene: 'New skill unlocked — how do you level up?',
    mascotLine: 'Everyone learns differently. What works for you?',
    options: {
      a: { emoji: '🛠️', title: 'Try it, mess up, try again', detail: 'Hands-on' },
      b: { emoji: '📝', title: 'Read, watch lessons, take notes', detail: 'Study mode' },
      c: { emoji: '👀', title: 'Watch someone, then copy', detail: 'Show me how' },
      d: { emoji: '🔄', title: 'Build something & improve it', detail: 'Make & iterate' },
    },
  },
  'q8-group': {
    emoji: '👫',
    title: 'In a group project, you become…',
    scene: 'Team assignment time! Your role is usually…',
    mascotLine: 'Pick the job you naturally take.',
    options: {
      a: { emoji: '📅', title: 'The planner who keeps everyone on track', detail: 'Organizer' },
      b: { emoji: '🌈', title: 'The idea machine', detail: 'Creative lead' },
      c: { emoji: '🔬', title: 'The quality checker', detail: 'Detail hero' },
      d: { emoji: '☮️', title: 'The peacemaker who includes everyone', detail: 'Team glue' },
    },
  },
  'q9-tools': {
    emoji: '🧰',
    title: 'Pick your power tool!',
    scene: 'You can grab ONE thing to start any project.',
    mascotLine: 'Which tool feels most like yours?',
    options: {
      a: { emoji: '📊', title: 'Spreadsheet, notebook, or research', detail: 'Data & notes' },
      b: { emoji: '🖌️', title: 'Design apps, camera, or art tools', detail: 'Creative kit' },
      c: { emoji: '⌨️', title: 'Code, terminal, or gadgets', detail: 'Tech kit' },
      d: { emoji: '📆', title: 'Calendar, checklist, or planner', detail: 'Plan kit' },
    },
  },
  'q10-conflict': {
    emoji: '⚖️',
    title: 'Two friends disagree. You…',
    scene: 'Drama in the group chat!',
    mascotLine: 'What would you probably do?',
    options: {
      a: { emoji: '🕊️', title: 'Listen & help them agree', detail: 'Peacemaker' },
      b: { emoji: '📌', title: 'Look at facts & evidence', detail: 'Fact finder' },
      c: { emoji: '🤝', title: 'Suggest a fair compromise', detail: 'Deal maker' },
      d: { emoji: '🚪', title: 'Stay out unless asked', detail: 'Quiet observer' },
    },
  },
  'q11-problems': {
    emoji: '🎯',
    title: 'Which puzzle excites you?',
    scene: 'Pick the mission that sounds fun!',
    mascotLine: 'Imagine you\'re the hero of this quest.',
    options: {
      a: { emoji: '📣', title: 'Reach more people with an idea', detail: 'Spread the word' },
      b: { emoji: '⚙️', title: 'Make systems faster & smarter', detail: 'Upgrade the machine' },
      c: { emoji: '💚', title: 'Help people feel better every day', detail: 'Care mission' },
      d: { emoji: '🎬', title: 'Express an idea in a cool way', detail: 'Story & style' },
    },
  },
  'q12-described': {
    emoji: '💬',
    title: 'Friends would call you…',
    scene: 'If your squad had to pick ONE nickname for you:',
    mascotLine: 'Which fits best?',
    options: {
      a: { emoji: '⏰', title: 'The reliable planner', detail: 'Always delivers' },
      b: { emoji: '🦄', title: 'The wild idea person', detail: 'Surprise genius' },
      c: { emoji: '🦸', title: 'The helper hero', detail: 'First to assist' },
      d: { emoji: '🔎', title: 'The curious explorer', detail: 'Dig until solved' },
    },
  },
  'q13-hobby': {
    emoji: '🎮',
    title: 'Free time? You\'re probably…',
    scene: 'No school, no chores — pure fun time!',
    mascotLine: 'What do you drift toward?',
    options: {
      a: { emoji: '🕹️', title: 'Games, gadgets, or coding', detail: 'Digital explorer' },
      b: { emoji: '🎵', title: 'Art, music, writing, or videos', detail: 'Creator mode' },
      c: { emoji: '⚽', title: 'Sports, crafts, cooking, outdoors', detail: 'Active maker' },
      d: { emoji: '🌍', title: 'Clubs, volunteering, community', detail: 'Community star' },
    },
  },
  'q14-outcome': {
    emoji: '🌈',
    title: 'What matters most right now?',
    scene: 'Big picture — what are you hoping for?',
    mascotLine: 'Pick the dream that feels closest.',
    options: {
      a: { emoji: '🛤️', title: 'A clear path for my future', detail: 'Career compass' },
      b: { emoji: '❤️', title: 'Making life better for people', detail: 'Impact heart' },
      c: { emoji: '🚀', title: 'Creating something totally new', detail: 'Original creator' },
      d: { emoji: '🎓', title: 'Mastering a special skill', detail: 'Expert mode' },
    },
  },
  'q15-known-for': {
    emoji: '⭐',
    title: 'You\'d love to be known for…',
    scene: 'Your reputation in one sentence.',
    mascotLine: 'Which would make you smile biggest?',
    options: {
      a: { emoji: '📢', title: 'Speaking clearly & persuading', detail: 'Voice of clarity' },
      b: { emoji: '🧠', title: 'Solving hard problems', detail: 'Brain on fire' },
      c: { emoji: '👑', title: 'Inspiring & leading people', detail: 'Natural leader' },
      d: { emoji: '✨', title: 'Designing beautiful experiences', detail: 'Experience maker' },
    },
  },
  'q16-scenario': {
    emoji: '🦸',
    title: 'Someone is struggling. You…',
    scene: 'A classmate is stuck on a task!',
    mascotLine: 'Your hero move is…',
    options: {
      a: { emoji: '👣', title: 'Walk them through step by step', detail: 'Patient guide' },
      b: { emoji: '⚡', title: 'Jump in and fix it fast', detail: 'Quick fixer' },
      c: { emoji: '❓', title: 'Ask questions to find the real problem', detail: 'Detective' },
      d: { emoji: '💡', title: 'Suggest a simpler, smarter way', detail: 'Shortcut finder' },
    },
  },
  'q17-deadline': {
    emoji: '⏳',
    title: 'Deadline panic! You…',
    scene: 'Due tomorrow and the clock is ticking!',
    mascotLine: 'What\'s your emergency mode?',
    options: {
      a: { emoji: '✂️', title: 'Cut extras & focus on must-dos', detail: 'Priority boss' },
      b: { emoji: '🌙', title: 'Lock in alone & power through', detail: 'Focus ninja' },
      c: { emoji: '📣', title: 'Rally the team & split tasks', detail: 'Team captain' },
      d: { emoji: '🧘', title: 'Stay calm & help stressed friends', detail: 'Calm anchor' },
    },
  },
  'q18-compliment': {
    emoji: '💝',
    title: 'Best compliment ever?',
    scene: 'Someone says something nice — which hits hardest?',
    mascotLine: 'Pick the one that would make your day.',
    options: {
      a: { emoji: '🎓', title: '"You made that so easy!"', detail: 'Great explainer' },
      b: { emoji: '🤯', title: '"I never thought of that!"', detail: 'Original thinker' },
      c: { emoji: '🙌', title: '"We couldn\'t do it without you!"', detail: 'Essential teammate' },
      d: { emoji: '🎁', title: '"That was exactly what I needed!"', detail: 'Perfect helper' },
    },
  },
  'q19-afternoon': {
    emoji: '☀️',
    title: 'Free afternoon — you might…',
    scene: 'Zero plans. Total freedom!',
    mascotLine: 'Honestly, what sounds fun?',
    options: {
      a: { emoji: '🏗️', title: 'Start a project or business idea', detail: 'Builder dreamer' },
      b: { emoji: '📺', title: 'Learn something from a video or book', detail: 'Curious learner' },
      c: { emoji: '🎉', title: 'Hang with friends or help someone', detail: 'Social butterfly' },
      d: { emoji: '🍳', title: 'Make art, food, code, or a video', detail: 'Maker magic' },
    },
  },
  'q20-identity': {
    emoji: '🎁',
    title: 'Final pick — which feels MOST like you?',
    scene: 'We narrowed 150 skills down to your top matches!',
    mascotLine: 'Trust your gut — this is the big reveal setup!',
    options: {},
  },
}

const FINAL_OPTION_EMOJIS = ['⭐', '🌟', '✨', '💫'] as const

export function getQuestionUi(questionId: string, optionLabels?: string[]): QuestionUi | null {
  const base = QUESTION_UI[questionId]
  if (!base) return null

  if (questionId === 'q20-identity' && optionLabels?.length) {
    return {
      ...base,
      options: Object.fromEntries(
        optionLabels.map((label, i) => {
          const key = String.fromCharCode(97 + i)
          const skillName = label.replace(/^I strongly relate to /, '')
          return [
            key,
            {
              emoji: FINAL_OPTION_EMOJIS[i] ?? '⭐',
              title: skillName,
              detail: 'Your top match',
            },
          ]
        }),
      ),
    }
  }

  return base
}

export function getOptionUi(
  questionId: string,
  optionId: string,
  fallbackLabel: string,
  optionLabels?: string[],
): OptionUi {
  const q = getQuestionUi(questionId, optionLabels)
  return (
    q?.options[optionId] ?? {
      emoji: '👉',
      title: fallbackLabel,
    }
  )
}

export function randomCheer(): string {
  return CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)]!
}

export function getMilestoneMessage(answeredCount: number): string | null {
  return MILESTONE_MESSAGES[answeredCount] ?? null
}

export function getIntroLines(name?: string): {
  headline: string
  subline: string
  steps: { emoji: string; text: string }[]
} {
  const who = name ? `${name}, ` : ''
  return {
    headline: `${who}ready to explore your potential?`,
    subline:
      'Four short story chapters about school, community, and what energizes you — tap what feels most like you.',
    steps: [
      { emoji: '📖', text: '4 chapters · about 5 minutes · works with limited internet' },
      { emoji: '👆', text: 'Tap what feels like you — not a test, no wrong answers' },
      { emoji: '✨', text: 'See areas of potential to explore — not a final label' },
    ],
  }
}

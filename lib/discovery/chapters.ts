import { DISCOVERY_QUESTION_COUNT } from '@/lib/discovery/questions'

export interface DiscoveryChapter {
  id: number
  title: string
  subtitle: string
  emoji: string
  /** First question index (0-based) in this chapter */
  startIndex: number
}

export const DISCOVERY_CHAPTERS: DiscoveryChapter[] = [
  {
    id: 1,
    title: 'School & everyday life',
    subtitle: 'Clubs, subjects, homework, and what you naturally reach for.',
    emoji: '🏫',
    startIndex: 0,
  },
  {
    id: 2,
    title: 'How you work with others',
    subtitle: 'Group projects, learning style, and how you handle disagreements.',
    emoji: '🤝',
    startIndex: 5,
  },
  {
    id: 3,
    title: 'What drives you',
    subtitle: 'Problems that excite you, free time, and what you want to be known for.',
    emoji: '🔥',
    startIndex: 10,
  },
  {
    id: 4,
    title: 'Your path forward',
    subtitle: 'How you help others, handle pressure, and what feels most like you.',
    emoji: '🧭',
    startIndex: 15,
  },
]

const QUESTIONS_PER_CHAPTER = DISCOVERY_QUESTION_COUNT / DISCOVERY_CHAPTERS.length

export function getChapterForQuestionIndex(questionIndex: number): DiscoveryChapter {
  const clamped = Math.min(questionIndex, DISCOVERY_QUESTION_COUNT - 1)
  const chapter =
    DISCOVERY_CHAPTERS.find(
      (ch, i) =>
        clamped >= ch.startIndex &&
        (DISCOVERY_CHAPTERS[i + 1] === undefined || clamped < DISCOVERY_CHAPTERS[i + 1]!.startIndex),
    ) ?? DISCOVERY_CHAPTERS[0]!
  return chapter
}

export function getChapterProgress(questionIndex: number): {
  chapter: DiscoveryChapter
  momentInChapter: number
  chapterSize: number
  chapterIndex: number
} {
  const chapter = getChapterForQuestionIndex(questionIndex)
  const chapterIndex = DISCOVERY_CHAPTERS.findIndex((c) => c.id === chapter.id)
  const momentInChapter = questionIndex - chapter.startIndex + 1
  return {
    chapter,
    momentInChapter,
    chapterSize: QUESTIONS_PER_CHAPTER,
    chapterIndex,
  }
}

export function shouldShowChapterIntro(questionIndex: number): boolean {
  return (
    questionIndex > 0 &&
    questionIndex < DISCOVERY_QUESTION_COUNT &&
    questionIndex % QUESTIONS_PER_CHAPTER === 0
  )
}

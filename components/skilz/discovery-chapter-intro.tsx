'use client'

import { Button } from '@/components/ui/button'
import type { DiscoveryChapter } from '@/lib/discovery/chapters'
import { DISCOVERY_CHAPTERS } from '@/lib/discovery/chapters'

interface DiscoveryChapterIntroProps {
  chapter: DiscoveryChapter
  onContinue: () => void
}

export function DiscoveryChapterIntro({ chapter, onContinue }: DiscoveryChapterIntroProps) {
  const chapterIndex = DISCOVERY_CHAPTERS.findIndex((c) => c.id === chapter.id)

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col justify-center animate-fade-up">
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-background to-background p-6 sm:p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Chapter {chapterIndex + 1} of {DISCOVERY_CHAPTERS.length}
        </p>
        <span className="mt-4 block text-5xl" aria-hidden>
          {chapter.emoji}
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{chapter.title}</h2>
        <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          {chapter.subtitle}
        </p>
        <p className="mx-auto mt-4 max-w-xs text-xs text-muted-foreground">
          Tap what feels most like you — there are no wrong answers.
        </p>
        <Button size="lg" className="mt-8 h-12 rounded-2xl px-10 font-bold" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}

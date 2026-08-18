'use client'

import { cn } from '@/lib/utils'
import { DISCOVERY_CHAPTERS } from '@/lib/discovery/chapters'

interface DiscoveryChapterProgressProps {
  chapterIndex: number
  momentInChapter: number
  chapterSize: number
  complete?: boolean
}

export function DiscoveryChapterProgress({
  chapterIndex,
  momentInChapter,
  chapterSize,
  complete,
}: DiscoveryChapterProgressProps) {
  return (
    <div className="flex gap-2">
      {DISCOVERY_CHAPTERS.map((chapter, i) => {
        const done = complete || i < chapterIndex
        const active = !complete && i === chapterIndex
        const pct = active ? (momentInChapter / chapterSize) * 100 : done ? 100 : 0

        return (
          <div key={chapter.id} className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-1">
              <span
                className={cn(
                  'truncate text-[10px] font-semibold uppercase tracking-wide',
                  active ? 'text-primary' : done ? 'text-foreground/70' : 'text-muted-foreground',
                )}
              >
                {chapter.emoji} {active ? chapter.title : `Ch.${i + 1}`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  done && 'bg-primary',
                  active && 'bg-primary/80',
                  !done && !active && 'bg-transparent',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

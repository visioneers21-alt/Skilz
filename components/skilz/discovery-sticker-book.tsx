'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sticker } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOptionUi } from '@/lib/discovery/presentation'
import type { DiscoveryAnswer } from '@/lib/discovery/engine'

export function DiscoveryStickerBook({
  answers,
  defaultOpen = false,
}: {
  answers: DiscoveryAnswer[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen || answers.length <= 3)

  if (answers.length === 0) return null

  return (
    <section className="rounded-2xl border border-border/70 bg-gradient-to-b from-muted/20 to-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/30"
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sticker className="size-4 text-primary" />
          Your sticker collection ({answers.length})
        </span>
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>

      <div
        className={cn(
          'grid transition-all duration-300',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <ul className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
            {answers.map((a, i) => {
              const ui = getOptionUi(a.questionId, a.optionId, a.label)
              return (
                <li
                  key={`${a.questionId}-${i}`}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-sm animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="text-lg" aria-hidden>{ui.emoji}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{ui.title}</span>
                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    #{i + 1}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

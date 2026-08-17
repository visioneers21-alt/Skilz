'use client'

import { cn } from '@/lib/utils'
import type { OptionUi } from '@/lib/discovery/presentation'

export interface ChoiceDisplay {
  id: string
  ui: OptionUi
}

interface DiscoveryChoicesProps {
  choices: ChoiceDisplay[]
  onSelect: (id: string) => void
  disabled?: boolean
  selectedId?: string | null
  stagger?: boolean
}

export function DiscoveryChoices({
  choices,
  onSelect,
  disabled,
  selectedId,
  stagger = true,
}: DiscoveryChoicesProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="listbox" aria-label="Answer choices">
      {choices.map((choice, index) => {
        const picked = selectedId === choice.id
        return (
          <button
            key={choice.id}
            type="button"
            role="option"
            aria-selected={picked}
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            style={stagger ? { animationDelay: `${index * 60}ms` } : undefined}
            className={cn(
              'group flex min-h-[4.5rem] items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200',
              'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'animate-fade-up active:scale-[0.98]',
              picked
                ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30 animate-discovery-pop'
                : 'border-border/80 bg-card hover:bg-accent/30',
              disabled && !picked && 'pointer-events-none opacity-50',
            )}
          >
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform duration-200',
                picked ? 'scale-110 bg-primary/15' : 'bg-muted group-hover:scale-105',
              )}
              aria-hidden
            >
              {choice.ui.emoji}
            </span>
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-sm font-bold leading-snug text-foreground">
                {choice.ui.title}
              </span>
              {choice.ui.detail && (
                <span className="mt-0.5 block text-xs text-muted-foreground">{choice.ui.detail}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

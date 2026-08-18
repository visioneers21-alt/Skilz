'use client'

import { cn } from '@/lib/utils'
import type { OptionUi } from '@/lib/discovery/presentation'

export interface ScenarioChoice {
  id: string
  ui: OptionUi
}

interface DiscoveryScenarioPickerProps {
  choices: ScenarioChoice[]
  onSelect: (id: string) => void
  disabled?: boolean
  selectedId?: string | null
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const

export function DiscoveryScenarioPicker({
  choices,
  onSelect,
  disabled,
  selectedId,
}: DiscoveryScenarioPickerProps) {
  return (
    <div className="space-y-2" role="listbox" aria-label="Pick what feels most like you">
      {choices.map((choice, index) => {
        const picked = selectedId === choice.id
        const keyLabel = OPTION_KEYS[index] ?? String(index + 1)

        return (
          <button
            key={choice.id}
            type="button"
            role="option"
            aria-selected={picked}
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            className={cn(
              'group flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200',
              'hover:border-primary/50 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'active:scale-[0.99]',
              picked
                ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/25'
                : 'border-border/70 bg-card/90',
              disabled && !picked && 'pointer-events-none opacity-50',
            )}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                picked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              {keyLabel}
            </span>
            <span className="text-2xl" aria-hidden>
              {choice.ui.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug">{choice.ui.title}</span>
              {choice.ui.detail && (
                <span className="mt-0.5 block text-xs text-muted-foreground">{choice.ui.detail}</span>
              )}
            </span>
          </button>
        )
      })}
      <p className="pt-1 text-center text-[11px] text-muted-foreground">
        Tap one option — your pick moves you to the next moment automatically.
      </p>
    </div>
  )
}

import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SkilzState } from '@/lib/data/types'
import { journeyStage } from '@/lib/recommendations/personalized'

const STEPS = [
  { key: 'discover', label: 'Discover', short: '1' },
  { key: 'assess', label: 'Try it', short: '2' },
  { key: 'recommend', label: 'Recommend', short: '3' },
  { key: 'explore', label: 'Explore', short: '4' },
  { key: 'track', label: 'Track', short: '5' },
  { key: 'develop', label: 'Develop', short: '6' },
] as const

export function JourneyStrip({
  state,
  className,
}: {
  state: SkilzState
  className?: string
}) {
  const { index } = journeyStage(state)

  return (
    <div className={className}>
      <ol className="flex gap-1 overflow-x-auto pb-1 no-scrollbar md:grid md:grid-cols-6 md:gap-2">
        {STEPS.map((step, i) => {
          const done = i < index
          const current = i === index
          return (
            <li key={step.key} className="flex min-w-[4.5rem] flex-col items-center gap-1.5 text-center md:min-w-0">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors md:size-9 md:text-xs',
                  done && 'border-primary bg-primary text-primary-foreground',
                  current && !done && 'border-primary bg-accent text-primary ring-2 ring-primary/20',
                  !done && !current && 'border-border bg-muted text-muted-foreground',
                )}
              >
                {done ? (
                  <Check className="size-3.5 md:size-4" aria-hidden="true" />
                ) : current ? (
                  <Circle className="size-2.5 fill-current md:size-3" aria-hidden="true" />
                ) : (
                  step.short
                )}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight md:text-xs',
                  current || done ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** @deprecated Use JourneyStrip with state prop */
export function LegacyJourneyStrip({
  discoveryComplete,
  hasChallenge,
  hasPlan,
  className,
}: {
  discoveryComplete: boolean
  hasChallenge: boolean
  hasPlan: boolean
  className?: string
}) {
  const activeIndex = hasPlan ? 3 : hasChallenge ? 2 : discoveryComplete ? 1 : 0
  const legacy = [
    { key: 'discover', label: 'Discover' },
    { key: 'validate', label: 'Validate' },
    { key: 'plan', label: 'Plan' },
    { key: 'grow', label: 'Grow' },
  ]
  return (
    <ol className={cn('grid grid-cols-4 gap-2', className)}>
      {legacy.map((step, i) => {
        const done = i < activeIndex
        const current = i === activeIndex
        return (
          <li key={step.key} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full border text-xs font-bold',
                done && 'border-primary bg-primary text-primary-foreground',
                current && !done && 'border-primary bg-accent text-primary',
                !done && !current && 'border-border bg-muted text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span className="text-xs font-medium">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

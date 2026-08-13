import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'discover', label: 'Discover' },
  { key: 'validate', label: 'Validate' },
  { key: 'plan', label: 'Plan' },
  { key: 'grow', label: 'Grow' },
] as const

export function JourneyStrip({
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
  const activeIndex = hasPlan
    ? 3
    : hasChallenge
      ? 2
      : discoveryComplete
        ? 1
        : 0

  return (
    <ol className={cn('grid grid-cols-4 gap-2', className)}>
      {STEPS.map((step, i) => {
        const done = i < activeIndex
        const current = i === activeIndex
        return (
          <li key={step.key} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                done && 'border-primary bg-primary text-primary-foreground',
                current && !done && 'border-primary bg-accent text-primary',
                !done && !current && 'border-border bg-muted text-muted-foreground',
              )}
            >
              {done ? (
                <Check className="size-4" aria-hidden="true" />
              ) : current ? (
                <Circle className="size-3 fill-current" aria-hidden="true" />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                current || done ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

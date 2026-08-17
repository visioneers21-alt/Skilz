'use client'

import { cn } from '@/lib/utils'
import { DISCOVERY_QUESTION_COUNT } from '@/lib/discovery/questions'

export function DiscoveryQuestMap({
  currentStep,
  complete,
}: {
  currentStep: number
  complete?: boolean
}) {
  const steps = Array.from({ length: DISCOVERY_QUESTION_COUNT }, (_, i) => i + 1)

  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-muted/40 via-background to-muted/40 p-3">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Quest map</span>
        <span>{complete ? 'Finish!' : `Stop ${Math.min(currentStep, DISCOVERY_QUESTION_COUNT)}`}</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
        {steps.map((step) => {
          const done = complete || step < currentStep
          const active = !complete && step === currentStep
          return (
            <div
              key={step}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-300',
                done && 'bg-primary text-primary-foreground scale-100',
                active && 'bg-accent text-accent-foreground ring-2 ring-primary scale-110 animate-discovery-pop',
                !done && !active && 'bg-muted text-muted-foreground',
              )}
              title={`Question ${step}`}
            >
              {done ? '✓' : step}
            </div>
          )
        })}
      </div>
    </div>
  )
}

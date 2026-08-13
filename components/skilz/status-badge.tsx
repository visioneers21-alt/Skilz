import { cn } from '@/lib/utils'
import { STATUS_TONE } from '@/lib/data/seed'
import type { SkillStatusLabel } from '@/lib/data/types'

export function StatusBadge({
  status,
  className,
}: {
  status: SkillStatusLabel
  className?: string
}) {
  const tone = STATUS_TONE[status] ?? STATUS_TONE['Worth exploring']
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone.className,
        className,
      )}
    >
      {tone.label}
    </span>
  )
}

export function ConfidenceLabel({
  confidence,
}: {
  confidence: 'low' | 'medium' | 'high'
}) {
  const label =
    confidence === 'high' ? 'High' : confidence === 'medium' ? 'Medium' : 'Low'
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              'h-3.5 w-1 rounded-full',
              (confidence === 'high' && i <= 2) ||
                (confidence === 'medium' && i <= 1) ||
                (confidence === 'low' && i === 0)
                ? 'bg-primary'
                : 'bg-border',
            )}
          />
        ))}
      </span>
      <span>{label}</span>
    </span>
  )
}

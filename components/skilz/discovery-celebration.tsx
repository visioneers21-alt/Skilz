'use client'

import { cn } from '@/lib/utils'

export function DiscoveryCelebration({
  message,
  emoji = '✨',
  visible,
}: {
  message: string
  emoji?: string
  visible: boolean
}) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center px-4 animate-fade-up"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border border-primary/30 bg-primary/95 px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg',
          'animate-discovery-pop',
        )}
      >
        <span className="text-xl" aria-hidden>{emoji}</span>
        {message}
      </div>
    </div>
  )
}

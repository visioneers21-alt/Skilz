'use client'

import { cn } from '@/lib/utils'

const MOOD = {
  idle: { face: '😊', bounce: false },
  excited: { face: '🤩', bounce: true },
  thinking: { face: '🤔', bounce: false },
  celebrate: { face: '🎉', bounce: true },
} as const

type MascotMood = keyof typeof MOOD

export function DiscoveryMascot({
  mood = 'idle',
  message,
  size = 'md',
}: {
  mood?: MascotMood
  message?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { face, bounce } = MOOD[mood]
  const sizeClass =
    size === 'lg' ? 'size-20 text-4xl' : size === 'sm' ? 'size-12 text-xl' : 'size-16 text-3xl'

  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-accent/40 to-primary/10 shadow-sm ring-2 ring-primary/15',
          sizeClass,
          bounce && 'animate-discovery-bounce',
        )}
        aria-hidden
      >
        <span className="select-none">{face}</span>
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-success animate-pulse" />
      </div>
      {message && (
        <div className="relative max-w-[85%] rounded-2xl rounded-tl-md border border-border/80 bg-card px-3.5 py-2.5 text-sm leading-snug shadow-sm animate-fade-up">
          <p className="font-medium text-foreground">{message}</p>
          <span
            className="absolute -left-1.5 top-3 size-2.5 rotate-45 border-b border-l border-border/80 bg-card"
            aria-hidden
          />
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ChallengeReflection } from '@/lib/data/types'

interface ChallengeReflectionFormProps {
  skillName?: string
  onSubmit: (reflection: ChallengeReflection, feedback: 'enjoyed' | 'learn-more' | 'not-for-me' | null) => void
  onSkip?: () => void
}

export function ChallengeReflectionForm({
  skillName,
  onSubmit,
  onSkip,
}: ChallengeReflectionFormProps) {
  const [enjoyed, setEnjoyed] = useState<boolean | null>(null)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null)
  const [wantSimilar, setWantSimilar] = useState<boolean | null>(null)
  const [learned, setLearned] = useState('')
  const [interest, setInterest] = useState<'enjoyed' | 'learn-more' | 'not-for-me' | null>(null)

  function handleSubmit() {
    onSubmit(
      { enjoyed, difficulty, wantSimilar, learned: learned.trim() },
      interest,
    )
  }

  return (
    <div className="space-y-6">
      <header className="text-center">
        <p className="text-2xl" aria-hidden>📝</p>
        <h2 className="mt-2 font-display text-xl font-bold">Quick reflection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your feelings matter as much as scores — this helps SKILZ learn what fits you
          {skillName ? ` (${skillName})` : ''}.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Did you enjoy this activity?</p>
        <div className="flex flex-wrap gap-2">
          <ToggleChip active={enjoyed === true} onClick={() => setEnjoyed(true)}>😊 Yes!</ToggleChip>
          <ToggleChip active={enjoyed === false} onClick={() => setEnjoyed(false)}>😐 Not really</ToggleChip>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">How difficult was it?</p>
        <div className="flex flex-wrap gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <ToggleChip key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d === 'easy' ? '🟢 Easy' : d === 'medium' ? '🟡 Medium' : '🔴 Hard'}
            </ToggleChip>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Would you try something similar?</p>
        <div className="flex flex-wrap gap-2">
          <ToggleChip active={wantSimilar === true} onClick={() => setWantSimilar(true)}>👍 Yes</ToggleChip>
          <ToggleChip active={wantSimilar === false} onClick={() => setWantSimilar(false)}>👎 Not sure</ToggleChip>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">What did you learn about yourself?</p>
        <Textarea
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          placeholder="Even one sentence helps — e.g. I like explaining ideas more than I thought."
          rows={3}
          className="resize-none text-sm"
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-semibold">How do you feel about this area?</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <ToggleChip active={interest === 'enjoyed'} onClick={() => setInterest('enjoyed')}>
            ❤️ I enjoyed this
          </ToggleChip>
          <ToggleChip active={interest === 'learn-more'} onClick={() => setInterest('learn-more')}>
            📚 Learn more
          </ToggleChip>
          <ToggleChip active={interest === 'not-for-me'} onClick={() => setInterest('not-for-me')}>
            🚫 Not for me
          </ToggleChip>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        {onSkip && (
          <Button type="button" variant="ghost" className="flex-1" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button type="button" className="flex-1" onClick={handleSubmit}>
          Save reflection
        </Button>
      </div>
    </div>
  )
}

function ToggleChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border bg-background hover:border-primary/40',
      )}
    >
      {children}
    </button>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  MIN_CHALLENGE_WORDS,
  assessChallengeEligibility,
  countWords,
  normalizeSpeechText,
} from '@/lib/ai/eligibility'
import { cn } from '@/lib/utils'

interface ChallengeResponseInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function ChallengeResponseInput({
  value,
  onChange,
  placeholder = 'Type your own response in your words…',
  rows = 6,
  className,
}: ChallengeResponseInputProps) {
  const [pasteBlocked, setPasteBlocked] = useState(false)

  const wordCount = useMemo(
    () => countWords(normalizeSpeechText(value)),
    [value],
  )

  const wordsNeeded = Math.max(0, MIN_CHALLENGE_WORDS - wordCount)
  const meetsMinimum = wordCount >= MIN_CHALLENGE_WORDS

  const blockPaste = () => {
    setPasteBlocked(true)
    window.setTimeout(() => setPasteBlocked(false), 4000)
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          e.preventDefault()
          blockPaste()
        }}
        onDrop={(e) => {
          e.preventDefault()
          blockPaste()
        }}
        onBeforeInput={(e) => {
          const inputType = (e.nativeEvent as InputEvent).inputType
          if (inputType === 'insertFromPaste' || inputType === 'insertFromDrop') {
            e.preventDefault()
            blockPaste()
          }
        }}
        placeholder={placeholder}
        rows={rows}
        autoComplete="off"
        autoCorrect="on"
        spellCheck
        autoFocus
        className={cn('resize-none text-base', className)}
        aria-describedby="challenge-word-count challenge-paste-hint"
      />

      <div
        id="challenge-word-count"
        className={cn(
          'flex flex-wrap items-center justify-between gap-2 text-xs',
          meetsMinimum ? 'text-success' : 'text-muted-foreground',
        )}
      >
        <span className="font-medium tabular-nums">
          {wordCount} / {MIN_CHALLENGE_WORDS} words
        </span>
        <span>
          {meetsMinimum
            ? 'Ready to submit'
            : `${wordsNeeded} more word${wordsNeeded === 1 ? '' : 's'} needed`}
        </span>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.min(wordCount, MIN_CHALLENGE_WORDS)}
        aria-valuemin={0}
        aria-valuemax={MIN_CHALLENGE_WORDS}
        aria-label="Response length progress"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-200',
            meetsMinimum ? 'bg-success' : 'bg-primary/70',
          )}
          style={{
            width: `${Math.min(100, (wordCount / MIN_CHALLENGE_WORDS) * 100)}%`,
          }}
        />
      </div>

      <p id="challenge-paste-hint" className="text-[11px] text-muted-foreground">
        Type your answer yourself — copy-paste is not allowed.
      </p>

      {pasteBlocked && (
        <p role="alert" className="text-xs font-medium text-destructive">
          Please type your own response. Copy-paste is not allowed.
        </p>
      )}
    </div>
  )
}

export function ChallengeWordCount({ text }: { text: string }) {
  const wordCount = useMemo(
    () => countWords(normalizeSpeechText(text)),
    [text],
  )
  const meetsMinimum = wordCount >= MIN_CHALLENGE_WORDS
  const wordsNeeded = Math.max(0, MIN_CHALLENGE_WORDS - wordCount)

  return (
    <div
      className={cn(
        'text-center text-xs tabular-nums',
        meetsMinimum ? 'text-success' : 'text-muted-foreground',
      )}
    >
      {wordCount} / {MIN_CHALLENGE_WORDS} words
      {!meetsMinimum && ` · ${wordsNeeded} more needed`}
      {meetsMinimum && ' · Ready to submit'}
    </div>
  )
}

export function isChallengeResponseEligible(text: string): {
  eligible: boolean
  words: number
  message: string | null
} {
  return assessChallengeEligibility(normalizeSpeechText(text))
}

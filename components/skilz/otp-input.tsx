'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'
import { OTP_LENGTH } from '@/lib/auth/constants'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  autoFocus?: boolean
  className?: string
}

export function OtpInput({
  value,
  onChange,
  disabled,
  id,
  autoFocus,
  className,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '')

  const focusAt = useCallback((index: number) => {
    const i = Math.max(0, Math.min(index, OTP_LENGTH - 1))
    refs.current[i]?.focus()
    refs.current[i]?.select()
  }, [])

  useEffect(() => {
    if (autoFocus) focusAt(0)
  }, [autoFocus, focusAt])

  function applyDigits(next: string[]) {
    onChange(next.join('').slice(0, OTP_LENGTH))
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>, startIndex = 0) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    const next = [...digits]
    for (let i = 0; i < pasted.length && startIndex + i < OTP_LENGTH; i++) {
      next[startIndex + i] = pasted[i]!
    }
    applyDigits(next)
    focusAt(Math.min(startIndex + pasted.length, OTP_LENGTH - 1))
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (digits[index]) {
        next[index] = ''
        applyDigits(next)
      } else if (index > 0) {
        next[index - 1] = ''
        applyDigits(next)
        focusAt(index - 1)
      }
      return
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(index - 1)
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(index + 1)
    }
  }

  function handleInput(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) {
      const next = [...digits]
      next[index] = ''
      applyDigits(next)
      return
    }

    const next = [...digits]
    let cursor = index
    for (const ch of cleaned) {
      if (cursor >= OTP_LENGTH) break
      next[cursor] = ch
      cursor++
    }
    applyDigits(next)
    if (cursor <= OTP_LENGTH - 1) focusAt(cursor)
    else focusAt(OTP_LENGTH - 1)
  }

  return (
    <div
      className={cn('flex justify-center gap-2 sm:gap-2.5', className)}
      role="group"
      aria-label={`${OTP_LENGTH}-digit verification code`}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          id={index === 0 ? id : undefined}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={index === 0 ? OTP_LENGTH : 1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          className={cn(
            'size-11 rounded-xl border border-input bg-background text-center text-lg font-semibold tabular-nums',
            'outline-none transition-colors',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'sm:size-12 sm:text-xl',
          )}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(e, index)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GUEST_TRY_LIMIT } from '@/lib/auth/constants'
import { useAuth } from '@/lib/auth/auth-context'

type AuthMode = 'login' | 'signup'

const COPY: Record<
  AuthMode,
  { title: string; subtitle: string; submit: string; alternate: string; alternateHref: string }
> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in with a one-time code sent to your email. No password needed.',
    submit: 'Send sign-in code',
    alternate: "Don't have an account?",
    alternateHref: '/signup',
  },
  signup: {
    title: 'Create your account',
    subtitle: `Start with ${GUEST_TRY_LIMIT} free AI sessions, then sign up to keep going.`,
    submit: 'Send verification code',
    alternate: 'Already have an account?',
    alternateHref: '/login',
  },
}

interface AuthFormProps {
  mode: AuthMode
  onSuccess?: () => void
  showGuestHint?: boolean
}

export function AuthForm({ mode, onSuccess, showGuestHint = true }: AuthFormProps) {
  const { sendOtp, verifyOtp, triesRemaining, authenticated } = useAuth()
  const copy = COPY[mode]

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  if (authenticated) return null

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendOtp(email.trim())
      setStep('code')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await verifyOtp(email.trim(), code.trim())
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold md:text-3xl">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>

      {showGuestHint && !authenticated && triesRemaining < GUEST_TRY_LIMIT && (
        <p className="mt-3 rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          {triesRemaining > 0
            ? `${triesRemaining} of ${GUEST_TRY_LIMIT} free AI sessions remaining.`
            : 'Your free sessions are used up — sign in to continue.'}
        </p>
      )}

      {sent && step === 'code' && (
        <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          Check your inbox at <span className="font-medium">{email}</span> for a 6-digit code.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="auth-email">Email</Label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : copy.submit}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="auth-code">Verification code</Label>
            <Input
              id="auth-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="mt-2 h-11 text-center text-lg tracking-[0.3em]"
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading || code.length < 4}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Verify and continue'}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep('email')
              setCode('')
              setError(null)
              setSent(false)
            }}
          >
            Use a different email
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {copy.alternate}{' '}
        <Link href={copy.alternateHref} className="font-medium text-primary hover:underline">
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </Link>
      </p>
    </div>
  )
}

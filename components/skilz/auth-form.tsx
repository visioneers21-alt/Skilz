'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { GoogleSignInButton } from '@/components/skilz/google-sign-in-button'
import { GUEST_TRY_LIMIT, OTP_LENGTH, OTP_RESEND_COOLDOWN_MS } from '@/lib/auth/constants'
import { SendOtpError, useAuth } from '@/lib/auth/auth-context'
import { OtpInput } from '@/components/skilz/otp-input'

type AuthMode = 'login' | 'signup'

const RESEND_COOLDOWN_SEC = Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000)

const OAUTH_ERRORS: Record<string, string> = {
  google_unavailable: 'Google sign-in is not configured yet. Use email instead.',
  google_denied: 'Google sign-in was cancelled.',
  google_failed: 'Could not sign in with Google. Try again or use email.',
  auth_unavailable: 'Sign-in is temporarily unavailable.',
}

const COPY: Record<
  AuthMode,
  {
    title: string
    subtitle: string
    submit: string
    alternate: string
    alternateHref: string
    redirect: string
  }
> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Enter the email you used to sign up. No verification code needed.',
    submit: 'Log in',
    alternate: "Don't have an account?",
    alternateHref: '/signup',
    redirect: '/dashboard',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Sign up free to see your potential profile and save your progress.',
    submit: 'Send verification code',
    alternate: 'Already have an account?',
    alternateHref: '/login',
    redirect: '/onboarding',
  },
}

interface AuthFormProps {
  mode: AuthMode
  onSuccess?: () => void
  showGuestHint?: boolean
  /** Override post-auth redirect for OAuth (e.g. stay on discovery). */
  redirectTo?: string
}

function resetToEmailStep(setters: {
  setStep: (step: 'email' | 'code') => void
  setCode: (code: string) => void
  setError: (error: string | null) => void
  setSent: (sent: boolean) => void
  setResendNotice: (notice: string | null) => void
  clearEmail?: boolean
  setEmail?: (email: string) => void
}) {
  setters.setStep('email')
  setters.setCode('')
  setters.setError(null)
  setters.setSent(false)
  setters.setResendNotice(null)
  if (setters.clearEmail && setters.setEmail) setters.setEmail('')
}

export function AuthForm({ mode, onSuccess, showGuestHint = true, redirectTo }: AuthFormProps) {
  const searchParams = useSearchParams()
  const { sendOtp, loginWithEmail, verifyOtp, triesRemaining, authenticated, loading: authLoading } = useAuth()
  const copy = COPY[mode]
  const afterAuthRedirect = redirectTo ?? copy.redirect

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendNotice, setResendNotice] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    void fetch('/api/auth/providers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.google) setGoogleEnabled(true)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError && OAUTH_ERRORS[oauthError]) {
      setError(OAUTH_ERRORS[oauthError]!)
    }
  }, [searchParams])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (!authLoading && authenticated) {
      onSuccess?.()
    }
  }, [authLoading, authenticated, onSuccess])

  if (authenticated) return null

  function startResendCooldown(seconds = RESEND_COOLDOWN_SEC) {
    setResendCooldown(seconds)
  }

  async function dispatchOtp(targetEmail: string, options?: { isResend?: boolean }) {
    const trimmed = targetEmail.trim()
    if (!trimmed) return

    if (options?.isResend) {
      setResendLoading(true)
      setResendNotice(null)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const alreadySignedIn = await sendOtp(trimmed)
      if (alreadySignedIn) {
        onSuccess?.()
        return
      }
      setStep('code')
      setSent(true)
      setCode('')
      startResendCooldown()
      if (options?.isResend) {
        setResendNotice(`A new code was sent to ${trimmed}.`)
      }
    } catch (err) {
      if (err instanceof SendOtpError && err.retryAfterSeconds) {
        startResendCooldown(err.retryAfterSeconds)
      }
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      if (options?.isResend) setResendLoading(false)
      else setLoading(false)
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'login') {
      setLoading(true)
      setError(null)
      try {
        await loginWithEmail(email.trim())
        onSuccess?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not log in')
      } finally {
        setLoading(false)
      }
      return
    }
    await dispatchOtp(email)
  }

  async function handleResend() {
    if (resendCooldown > 0 || resendLoading) return
    await dispatchOtp(email, { isResend: true })
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResendNotice(null)
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

  function handleDifferentEmail() {
    resetToEmailStep({
      setStep,
      setCode,
      setError,
      setSent,
      setResendNotice,
      clearEmail: true,
      setEmail,
    })
    setResendCooldown(0)
  }

  function handleBackToMethods() {
    resetToEmailStep({
      setStep,
      setCode,
      setError,
      setSent,
      setResendNotice,
    })
    setResendCooldown(0)
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold md:text-3xl">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === 'signup' && step === 'code'
          ? `Enter the 6-digit code sent to ${email || 'your email'}.`
          : copy.subtitle}
      </p>

      {showGuestHint && !authenticated && triesRemaining < GUEST_TRY_LIMIT && step === 'email' && (
        <p className="mt-3 rounded-lg bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
          {triesRemaining > 0
            ? `${triesRemaining} of ${GUEST_TRY_LIMIT} free AI sessions remaining.`
            : 'Your free sessions are used up — sign in to continue.'}
        </p>
      )}

      {mode === 'signup' && sent && step === 'code' && !resendNotice && (
        <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          Check your inbox at <span className="font-medium">{email}</span> for a 6-digit code.
        </p>
      )}

      {resendNotice && (
        <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
          {resendNotice}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 'email' || mode === 'login' ? (
        <div className="mt-6 space-y-4">
          {googleEnabled && (
            <>
              <GoogleSignInButton redirect={afterAuthRedirect} />
              <div className="relative py-1">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
                  or use email
                </span>
              </div>
            </>
          )}
          <form onSubmit={handleSendOtp} className="space-y-4">
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
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="auth-code">Verification code</Label>
              <div className="mt-3">
                <OtpInput
                  id="auth-code"
                  value={code}
                  onChange={setCode}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={loading || code.length < OTP_LENGTH}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Verify and continue'}
            </Button>
          </form>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-center text-sm font-medium">Need help signing in?</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full"
                disabled={resendCooldown > 0 || resendLoading}
                onClick={() => void handleResend()}
              >
                {resendLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
                ) : (
                  'Resend code'
                )}
              </Button>

              {googleEnabled && (
                <GoogleSignInButton
                  redirect={afterAuthRedirect}
                  label="Continue with Google instead"
                />
              )}

              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-muted-foreground"
                onClick={handleDifferentEmail}
              >
                Use a different email
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-muted-foreground"
                onClick={handleBackToMethods}
              >
                Back to all sign-in options
              </Button>
            </div>
          </div>
        </div>
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

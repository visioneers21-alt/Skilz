'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { GUEST_TRY_LIMIT } from '@/lib/auth/constants'

export interface AuthStatus {
  authenticated: boolean
  email: string | null
  triesUsed: number
  triesRemaining: number
}

export class SendOtpError extends Error {
  retryAfterSeconds?: number

  constructor(message: string, retryAfterSeconds?: number) {
    super(message)
    this.name = 'SendOtpError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

interface AuthContextValue extends AuthStatus {
  loading: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  refreshSession: () => Promise<void>
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, code: string) => Promise<void>
  logout: () => Promise<void>
}

const defaultStatus: AuthStatus = {
  authenticated: false,
  email: null,
  triesUsed: 0,
  triesRemaining: GUEST_TRY_LIMIT,
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(defaultStatus)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' })
      if (!res.ok) throw new Error('session fetch failed')
      const data = (await res.json()) as AuthStatus
      setStatus(data)
    } catch {
      setStatus(defaultStatus)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const openAuthModal = useCallback(() => setAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [])

  const sendOtp = useCallback(async (email: string) => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        retryAfterSeconds?: number
      }
      throw new SendOtpError(
        data.error || 'Could not send code',
        data.retryAfterSeconds,
      )
    }
  }, [])

  const verifyOtp = useCallback(
    async (email: string, code: string) => {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Invalid code')
      }
      await refreshSession()
      setAuthModalOpen(false)
    },
    [refreshSession],
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    await refreshSession()
  }, [refreshSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...status,
      loading,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      refreshSession,
      sendOtp,
      verifyOtp,
      logout,
    }),
    [
      status,
      loading,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      refreshSession,
      sendOtp,
      verifyOtp,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

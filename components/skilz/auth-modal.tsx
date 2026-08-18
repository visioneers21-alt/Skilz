'use client'

import { Suspense, useEffect } from 'react'
import { AuthForm } from '@/components/skilz/auth-form'
import { useAuth } from '@/lib/auth/auth-context'

export function AuthModal() {
  const { authModalOpen, closeAuthModal, authenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && authenticated) closeAuthModal()
  }, [loading, authenticated, closeAuthModal])

  if (!authModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
      >
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          Close
        </button>
        <Suspense fallback={null}>
          <AuthForm mode="signup" onSuccess={closeAuthModal} showGuestHint={false} />
        </Suspense>
      </div>
    </div>
  )
}

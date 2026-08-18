'use client'

import Link from 'next/link'
import { Compass, LayoutDashboard, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StartCta } from '@/components/landing/start-cta'
import { useAuth } from '@/lib/auth/auth-context'

export function LandingBottomBar() {
  const { authenticated, loading } = useAuth()

  if (loading) return null

  return (
    <div
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3">
        {authenticated ? (
          <>
            <StartCta
              size="default"
              className="h-11 flex-1 rounded-xl font-semibold"
            />
            <Button asChild variant="outline" className="h-11 shrink-0 rounded-xl">
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild className="h-11 flex-1 rounded-xl font-semibold">
              <Link href="/onboarding">
                <Compass className="size-4" />
                Start discovering
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 shrink-0 rounded-xl px-4">
              <Link href="/login">
                <LogIn className="size-4" />
                Log in
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

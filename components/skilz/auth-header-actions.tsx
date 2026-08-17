'use client'

import Link from 'next/link'
import { LogIn, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/skilz/theme-toggle'
import { useAuth } from '@/lib/auth/auth-context'

export function AuthHeaderActions() {
  const { authenticated, email, loading } = useAuth()

  if (loading) return null

  if (authenticated) {
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {email && (
          <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
        )}
        <Button asChild size="sm">
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">
          <LogIn className="size-4" />
          Log in
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  )
}

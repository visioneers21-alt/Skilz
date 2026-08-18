'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/skilz/theme-toggle'
import { SkilzLogo } from '@/components/skilz/logo'

/** Minimal chrome — no primary navigation; users follow the guided journey. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-6">
        <Link href="/dashboard" aria-label="SKILZ home">
          <SkilzLogo />
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-8">{children}</div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Layers, Map, User, LogIn, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SkilzLogo } from '@/components/skilz/logo'
import { ThemeToggle } from '@/components/skilz/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'

const NAV = [
  { href: '/dashboard', label: 'Home', mobileLabel: 'Home', icon: Home },
  { href: '/discover', label: 'Discover', mobileLabel: 'Discover', icon: Compass },
  { href: '/skills', label: 'My Skills', mobileLabel: 'Skills', icon: Layers },
  { href: '/plan', label: 'My Plan', mobileLabel: 'Plan', icon: Map },
  { href: '/profile', label: 'Profile', mobileLabel: 'Profile', icon: User },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

export function DesktopNav() {
  const pathname = usePathname()
  const { authenticated, email, loading, logout } = useAuth()
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-background/85 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-6 px-6">
        <Link href="/dashboard" aria-label="SKILZ home">
          <SkilzLogo />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {!loading && authenticated && email && (
            <>
              <span className="max-w-[140px] truncate text-sm text-muted-foreground">
                {email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => void logout()}>
                <LogOut className="size-4" />
                Log out
              </Button>
            </>
          )}
          {!loading && !authenticated && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogIn className="size-4" />
                Log in
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/discover">
              <Compass className="size-4" />
              Start discovery
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-end border-b border-border bg-background/95 px-4 py-2 backdrop-blur md:hidden">
      <ThemeToggle />
    </header>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon
                className={cn('size-5', active && 'fill-primary/10')}
                strokeWidth={active ? 2.4 : 2}
              />
              {item.mobileLabel}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

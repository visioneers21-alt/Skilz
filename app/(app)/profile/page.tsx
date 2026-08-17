'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mic, MessageSquare, RotateCcw, User, LogOut, Mail, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useSkilz } from '@/lib/data/store'
import { useAuth } from '@/lib/auth/auth-context'
import { GUEST_TRY_LIMIT } from '@/lib/auth/constants'
import { ThemeToggle } from '@/components/skilz/theme-toggle'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const { state, updateProfile, reset } = useSkilz()
  const { profile } = state
  const { authenticated, email, triesRemaining, openAuthModal, logout, loading: authLoading } =
    useAuth()
  const [name, setName] = useState(profile.name)
  const [saved, setSaved] = useState(false)

  function saveName() {
    const trimmed = name.trim()
    if (!trimmed) return
    updateProfile({ name: trimmed })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your preferences and account settings.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
            {profile.name.charAt(0).toUpperCase() || <User className="size-6" />}
          </span>
          <div>
            <p className="font-display text-lg font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.goal}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold">Display name</h2>
        <div>
          <Label htmlFor="name">Name</Label>
          <div className="mt-2 flex gap-2">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
            <Button onClick={saveName} disabled={!name.trim()}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold">Interaction style</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you prefer to talk with SKILZ during discovery and
          challenges.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => updateProfile({ interactionPreference: 'voice' })}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              profile.interactionPreference === 'voice'
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border hover:border-primary/40',
            )}
          >
            <Mic className="size-4 shrink-0" />
            Voice first
          </button>
          <button
            type="button"
            onClick={() => updateProfile({ interactionPreference: 'text' })}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              profile.interactionPreference === 'text'
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border hover:border-primary/40',
            )}
          >
            <MessageSquare className="size-4 shrink-0" />
            Text first
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Switch between light and dark mode. Your choice is saved on this device.
        </p>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Sun className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium">Theme</span>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold">Account</h2>
        {authLoading ? (
          <p className="text-sm text-muted-foreground">Loading account…</p>
        ) : authenticated ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {triesRemaining} of {GUEST_TRY_LIMIT} free AI sessions remaining on this device.
            </p>
            <Button size="sm" onClick={openAuthModal}>
              <Mail className="mr-2 size-4" />
              Sign in with email
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-bold">About you</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Age range</dt>
            <dd className="font-medium">{profile.ageRange || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Education</dt>
            <dd className="font-medium">{profile.education || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Interests</dt>
            <dd className="max-w-[60%] text-right font-medium">
              {profile.interests.length
                ? profile.interests.join(', ')
                : '—'}
            </dd>
          </div>
        </dl>
        <Button asChild variant="outline" size="sm">
          <Link href="/onboarding?edit=1">Update onboarding info</Link>
        </Button>
      </section>

      <Separator />

      <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
        <h2 className="font-display text-base font-bold text-destructive">
          Reset your data
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Clear all skills, conversations, and progress from this device. This
          cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={() => {
            if (
              window.confirm(
                'Reset all SKILZ data on this device? You will need to onboard again.',
              )
            ) {
              reset()
              router.push('/onboarding')
            }
          }}
        >
          <RotateCcw className="size-4" />
          Reset everything
        </Button>
      </section>
    </div>
  )
}

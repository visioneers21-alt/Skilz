'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSkilz } from '@/lib/data/store'
import { SkilzMark } from '@/components/skilz/logo'

export function OnboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { state, hydrated } = useSkilz()

  useEffect(() => {
    if (hydrated && !state.profile.onboarded) router.replace('/onboarding')
  }, [hydrated, state.profile.onboarded, router])

  if (!hydrated || !state.profile.onboarded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <SkilzMark className="size-11 animate-pulse text-xl" />
        <span className="sr-only">Loading SKILZ</span>
      </div>
    )
  }

  return <>{children}</>
}

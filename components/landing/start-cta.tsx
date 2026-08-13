'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSkilz } from '@/lib/data/store'

export function StartCta({
  size = 'lg',
  className,
}: {
  size?: 'default' | 'lg'
  className?: string
}) {
  const { state, hydrated } = useSkilz()
  const href = hydrated && state.profile.onboarded ? '/dashboard' : '/onboarding'
  const label =
    hydrated && state.profile.onboarded ? 'Continue your journey' : 'Start Discovering'

  return (
    <Button asChild size={size} className={className}>
      <Link href={href}>
        {label}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  )
}

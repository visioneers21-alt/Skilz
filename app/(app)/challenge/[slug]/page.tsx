import { Suspense } from 'react'
import ChallengePageClient from './challenge-client'

export default function ChallengePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading challenge…
        </div>
      }
    >
      <ChallengePageClient />
    </Suspense>
  )
}

import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkilzLogo } from '@/components/skilz/logo'

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <SkilzLogo />
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-8 text-muted-foreground" />
      </div>
      <div className="max-w-sm space-y-2">
        <h1 className="font-display text-2xl font-bold">You&apos;re offline</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          SKILZ needs an internet connection for AI feedback and sign-in. Your discovery
          progress is saved on this device — reconnect to continue.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Try again</Link>
      </Button>
    </div>
  )
}

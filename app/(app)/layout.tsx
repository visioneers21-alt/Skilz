import { DesktopNav, MobileNav } from '@/components/skilz/app-nav'
import { OnboardGuard } from '@/components/skilz/onboard-guard'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardGuard>
      <div className="min-h-dvh bg-background">
        <DesktopNav />
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-5 md:px-6 md:pb-12">
          {children}
        </div>
        <MobileNav />
      </div>
    </OnboardGuard>
  )
}

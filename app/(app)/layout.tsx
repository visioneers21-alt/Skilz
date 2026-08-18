import { OnboardGuard } from '@/components/skilz/onboard-guard'
import { AppShell } from '@/components/skilz/app-shell'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardGuard>
      <AppShell>{children}</AppShell>
    </OnboardGuard>
  )
}

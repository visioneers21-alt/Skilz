'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SkilzLogo } from '@/components/skilz/logo'
import { AuthForm } from '@/components/skilz/auth-form'
import { useAuth } from '@/lib/auth/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { authenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && authenticated) router.replace('/dashboard')
  }, [authenticated, loading, router])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-5 py-5">
        <SkilzLogo />
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 pb-12">
        <AuthForm mode="login" onSuccess={() => router.push('/dashboard')} />
      </main>
    </div>
  )
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SerwistProvider } from '@serwist/turbopack/react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { SkilzProvider } from '@/lib/data/store'
import { AuthProvider } from '@/lib/auth/auth-context'
import { AuthModal } from '@/components/skilz/auth-modal'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const APP_NAME = 'SKILZ'
const APP_DESCRIPTION =
  'An AI-assisted talent and career exploration platform for young people in Sierra Leone. Discover areas of potential, test interests through challenges, and explore realistic development pathways.'

export const metadata: Metadata = {
  title: 'SKILZ — Discover your potential · Sierra Leone',
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#2d2f3a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh bg-background font-sans antialiased">
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === 'development'}
          reloadOnOnline
        >
          <ThemeProvider>
            <SkilzProvider>
              <AuthProvider>
                {children}
                <AuthModal />
              </AuthProvider>
            </SkilzProvider>
            <Toaster position="top-center" />
          </ThemeProvider>
        </SerwistProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

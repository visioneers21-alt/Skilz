import Link from 'next/link'
import {
  Compass,
  Target,
  Sparkles,
  TrendingUp,
  Mic,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkilzLogo } from '@/components/skilz/logo'
import { StartCta } from '@/components/landing/start-cta'
import { AuthHeaderActions } from '@/components/skilz/auth-header-actions'

const STEPS = [
  {
    icon: Compass,
    title: 'Discover',
    body: 'Understand your interests, experiences, and potential strengths through conversation.',
  },
  {
    icon: Target,
    title: 'Validate',
    body: 'Test potential skills through short, practical challenges.',
  },
  {
    icon: Sparkles,
    title: 'Develop',
    body: 'Build a personalized development plan that fits you.',
  },
  {
    icon: TrendingUp,
    title: 'Grow',
    body: 'Track your progress and discover new opportunities.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <SkilzLogo />
        <AuthHeaderActions />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              An AI skills coach, not a personality test
            </span>
            <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Discover what you&apos;re capable of.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              SKILZ helps you discover your strengths, validate your abilities,
              and build a personalized path for growth.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <StartCta className="w-full sm:w-auto" />
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No test scores. No labels. Just a conversation that helps you grow.
            </p>
          </div>

          {/* Conversation preview */}
          <div className="mx-auto mt-14 max-w-lg">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-24px_rgba(30,20,80,0.28)]">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <SkilzLogo />
                <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Mic className="size-3.5" /> Live session
                </span>
              </div>
              <div className="space-y-3 pt-4">
                <ChatBubble side="ai">
                  What do you enjoy doing when nobody asks you to?
                </ChatBubble>
                <ChatBubble side="user">
                  I like helping my friends solve problems.
                </ChatBubble>
                <ChatBubble side="ai">
                  That&apos;s interesting. Tell me about a time you helped
                  someone through something difficult.
                </ChatBubble>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-y border-border bg-card/60 py-16 md:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary">How it works</p>
              <h2 className="mt-2 text-balance text-3xl font-bold md:text-4xl">
                From a conversation to a plan you can act on.
              </h2>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <div className="mt-5 flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-primary">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <div className="grid items-center gap-10 rounded-3xl border border-border bg-primary px-6 py-12 text-primary-foreground md:grid-cols-[1.4fr_1fr] md:px-12">
            <div>
              <ShieldCheck className="size-8 opacity-90" />
              <h2 className="mt-4 text-balance text-2xl font-bold text-primary-foreground md:text-3xl">
                SKILZ does not tell you who you are. It helps you discover what
                you could become.
              </h2>
              <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-primary-foreground/80">
                Every insight is framed as a possibility to explore — grounded in
                what you actually say, and always yours to test and challenge.
              </p>
            </div>
            <div className="flex md:justify-end">
              <StartCta className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <SkilzLogo showSubtitle />
          <p>Built by the VISSIONERS team.</p>
        </div>
      </footer>
    </div>
  )
}

function ChatBubble({
  side,
  children,
}: {
  side: 'ai' | 'user'
  children: React.ReactNode
}) {
  if (side === 'ai') {
    return (
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent px-4 py-2.5 text-sm leading-relaxed text-accent-foreground">
        {children}
      </div>
    )
  }
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
      {children}
    </div>
  )
}

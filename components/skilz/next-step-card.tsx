import Link from 'next/link'
import { ArrowRight, Compass, Map, Mic, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NextStep } from '@/lib/recommendations/next-steps'

const ICONS = {
  discover: Mic,
  validate: Trophy,
  plan: Map,
  reflect: Compass,
  career: Map,
  continue: Target,
} as const

export function NextStepCard({ step }: { step: NextStep }) {
  const Icon = ICONS[step.kind]

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="p-6 md:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Icon className="size-3.5" />
          Your next step
        </span>
        <h2 className="mt-4 text-balance text-xl font-bold md:text-2xl">{step.title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {step.description}
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href={step.href}>
            {step.cta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

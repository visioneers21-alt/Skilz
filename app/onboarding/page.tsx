'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { SkilzLogo } from '@/components/skilz/logo'
import { useSkilz } from '@/lib/data/store'
import {
  AGE_RANGES,
  EDUCATION_LEVELS,
  GOAL_OPTIONS,
  INTEREST_OPTIONS,
} from '@/lib/data/seed'
import { cn } from '@/lib/utils'

const STEPS = ['Name', 'About you', 'Interests', 'Your goal']

export default function OnboardingPage() {
  const router = useRouter()
  const [isEdit] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('edit') === '1',
  )
  const { state, hydrated, completeOnboarding, updateProfile } = useSkilz()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [education, setEducation] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [goal, setGoal] = useState('')

  useEffect(() => {
    if (!hydrated || !state.profile.onboarded || !isEdit) return
    setName(state.profile.name)
    setAgeRange(state.profile.ageRange)
    setEducation(state.profile.education)
    setInterests(state.profile.interests)
    const matchedGoal = GOAL_OPTIONS.find((g) => g.label === state.profile.goal)
    setGoal(matchedGoal?.value ?? '')
  }, [hydrated, isEdit, state.profile])

  useEffect(() => {
    if (hydrated && state.profile.onboarded && !isEdit) {
      router.replace('/dashboard')
    }
  }, [hydrated, state.profile.onboarded, isEdit, router])

  const canAdvance =
    (step === 0 && name.trim().length > 0) ||
    (step === 1 && ageRange && education) ||
    (step === 2 && interests.length > 0) ||
    (step === 3 && goal)

  function toggleInterest(item: string) {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    )
  }

  function finish() {
    const goalLabel = GOAL_OPTIONS.find((g) => g.value === goal)?.label ?? goal
    const profile = {
      name: name.trim(),
      ageRange,
      education,
      interests,
      goal: goalLabel,
    }
    if (isEdit) updateProfile(profile)
    else completeOnboarding(profile)
    router.push('/profile')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-5 py-5">
        <SkilzLogo />
        <span className="text-sm text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      <div className="mx-auto w-full max-w-lg px-5">
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
      </div>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8">
        <p className="text-sm font-semibold text-primary">{STEPS[step]}</p>

        {step === 0 && (
          <div className="mt-3">
            <h1 className="text-balance text-2xl font-bold md:text-3xl">
              First, what should SKILZ call you?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This keeps things personal. You get 3 free AI sessions before signing in.
            </p>
            <div className="mt-6">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Joel"
                className="mt-2 h-12 text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAdvance) setStep(1)
                }}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-3">
            <h1 className="text-balance text-2xl font-bold md:text-3xl">
              Tell us a little about you.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This helps SKILZ ask better questions.
            </p>
            <div className="mt-6">
              <Label>Age range</Label>
              <ChipGroup
                options={AGE_RANGES}
                selected={ageRange ? [ageRange] : []}
                onSelect={(v) => setAgeRange(v)}
              />
            </div>
            <div className="mt-6">
              <Label>Education level</Label>
              <ChipGroup
                options={EDUCATION_LEVELS}
                selected={education ? [education] : []}
                onSelect={(v) => setEducation(v)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-3">
            <h1 className="text-balance text-2xl font-bold md:text-3xl">
              What are you drawn to?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick anything that sparks your curiosity. Choose as many as you
              like.
            </p>
            <ChipGroup
              className="mt-6"
              options={INTEREST_OPTIONS}
              selected={interests}
              onSelect={toggleInterest}
              multi
            />
          </div>
        )}

        {step === 3 && (
          <div className="mt-3">
            <h1 className="text-balance text-2xl font-bold md:text-3xl">
              What brings you to SKILZ?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              There&apos;s no wrong answer.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGoal(option.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-medium transition-colors',
                    goal === option.value
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-card hover:border-primary/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border',
                      goal === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border',
                    )}
                  >
                    {goal === option.value && <Check className="size-3" />}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 pt-10">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              size="lg"
              className="flex-1"
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1"
              disabled={!canAdvance}
              onClick={finish}
            >
              {isEdit ? 'Save changes' : 'Enter SKILZ'}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

function ChipGroup({
  options,
  selected,
  onSelect,
  multi = false,
  className,
}: {
  options: string[]
  selected: string[]
  onSelect: (value: string) => void
  multi?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/40',
            )}
          >
            {multi && isSelected && <Check className="mr-1 inline size-3.5" />}
            {option}
          </button>
        )
      })}
    </div>
  )
}

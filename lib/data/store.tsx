'use client'

// SKILZ mock data layer.
//
// This is a clean, client-side store that stands in for the Neon/Drizzle
// persistence layer. All reads/writes go through the `useSkilz` actions, so
// swapping to server actions backed by lib/db later means changing only this
// file — components never touch storage directly.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  ChallengeAttempt,
  ChallengeReflection,
  Message,
  PlanItem,
  Profile,
  ProgressEvent,
  SkillInterestFeedback,
  SkilzState,
  UserSkill,
} from './types'
import { EMPTY_PROFILE } from './seed'
import { mergeSkills } from './merge-skills'

const STORAGE_KEY = 'skilz.state.v1'

const INITIAL_STATE: SkilzState = {
  profile: EMPTY_PROFILE,
  conversation: [],
  skills: [],
  plan: [],
  attempts: [],
  progress: [],
  discoveryComplete: false,
  dismissedSkillSlugs: [],
  skillFeedback: {},
}

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

interface SkilzContextValue {
  state: SkilzState
  hydrated: boolean
  // profile
  completeOnboarding: (profile: Partial<Profile>) => void
  updateProfile: (profile: Partial<Profile>) => void
  // conversation
  setConversation: (messages: Message[]) => void
  addProgressEvent: (event: Omit<ProgressEvent, 'id' | 'date'>) => void
  // skills
  saveSkills: (skills: UserSkill[]) => void
  dismissSkill: (slug: string) => void
  strengthenSkill: (slug: string, evidenceText: string) => void
  // plan
  setPlan: (items: PlanItem[]) => void
  togglePlanItem: (id: string) => void
  // challenges
  recordAttempt: (attempt: Omit<ChallengeAttempt, 'id' | 'createdAt'>) => string
  addChallengeReflection: (attemptId: string, reflection: ChallengeReflection) => void
  setSkillFeedback: (slug: string, feedback: SkillInterestFeedback) => void
  // lifecycle
  reset: () => void
}

const SkilzContext = createContext<SkilzContextValue | null>(null)

export function SkilzProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SkilzState>(INITIAL_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SkilzState>
        setState({
          ...INITIAL_STATE,
          ...parsed,
          skillFeedback: parsed.skillFeedback ?? {},
        })
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full / unavailable — non-fatal for a demo
    }
  }, [state, hydrated])

  const addProgressEvent = useCallback(
    (event: Omit<ProgressEvent, 'id' | 'date'>) => {
      setState((s) => ({
        ...s,
        progress: [
          ...s.progress,
          { ...event, id: uid('pe'), date: Date.now() },
        ],
      }))
    },
    [],
  )

  const completeOnboarding = useCallback((profile: Partial<Profile>) => {
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...profile, onboarded: true },
      progress:
        s.progress.length === 0
          ? [
              {
                id: uid('pe'),
                date: Date.now(),
                title: 'Started discovery',
                detail: 'Joined SKILZ and set up your profile.',
                type: 'discovery',
              },
            ]
          : s.progress,
    }))
  }, [])

  const updateProfile = useCallback((profile: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...profile } }))
  }, [])

  const setConversation = useCallback((messages: Message[]) => {
    setState((s) => ({ ...s, conversation: messages }))
  }, [])

  const saveSkills = useCallback((skills: UserSkill[]) => {
    setState((s) => {
      const merged = mergeSkills(s.skills, skills, s.dismissedSkillSlugs)
      const isFirstDiscovery = s.skills.length === 0
      return {
        ...s,
        skills: merged,
        discoveryComplete: true,
        progress: [
          ...s.progress,
          {
            id: uid('pe'),
            date: Date.now(),
            title: isFirstDiscovery ? 'Skills discovered' : 'Discovery updated',
            detail: isFirstDiscovery
              ? `${merged.length} potential strengths identified from your conversation.`
              : `${merged.length} skills now tracked with merged evidence.`,
            type: 'skill',
          },
        ],
      }
    })
  }, [])

  const dismissSkill = useCallback((slug: string) => {
    setState((s) => ({
      ...s,
      skills: s.skills.filter((sk) => sk.slug !== slug),
      dismissedSkillSlugs: [...new Set([...s.dismissedSkillSlugs, slug])],
      progress: [
        ...s.progress,
        {
          id: uid('pe'),
          date: Date.now(),
          title: 'Skill dismissed',
          detail: 'You marked a hypothesis as not fitting — SKILZ will respect that.',
          type: 'skill',
        },
      ],
    }))
  }, [])

  const strengthenSkill = useCallback(
    (slug: string, evidenceText: string) => {
      setState((s) => ({
        ...s,
        skills: s.skills.map((sk) => {
          if (sk.slug !== slug) return sk
          const nextScore = Math.min(0.98, sk.confidenceScore + 0.08)
          return {
            ...sk,
            confidenceScore: nextScore,
            confidence: nextScore >= 0.8 ? 'high' : nextScore >= 0.55 ? 'medium' : 'low',
            stage:
              sk.stage === 'discovered'
                ? 'practicing'
                : sk.stage === 'exploring'
                  ? 'developing'
                  : sk.stage === 'developing'
                    ? 'practicing'
                    : sk.stage === 'practicing'
                      ? 'validated'
                      : sk.stage,
            evidence: [
              ...sk.evidence,
              {
                id: uid('ev'),
                text: evidenceText,
                source: 'challenge',
                createdAt: Date.now(),
              },
            ],
          }
        }),
      }))
    },
    [],
  )

  const setPlan = useCallback((items: PlanItem[]) => {
    setState((s) => ({ ...s, plan: items }))
  }, [])

  const togglePlanItem = useCallback((id: string) => {
    setState((s) => {
      const item = s.plan.find((p) => p.id === id)
      if (!item) return s
      const markingDone = item.status !== 'done'
      return {
        ...s,
        plan: s.plan.map((p) =>
          p.id === id
            ? { ...p, status: p.status === 'done' ? 'todo' : 'done' }
            : p,
        ),
        progress: markingDone
          ? [
              ...s.progress,
              {
                id: uid('pe'),
                date: Date.now(),
                title: 'Completed a plan step',
                detail: item.title,
                type: 'plan',
              },
            ]
          : s.progress,
      }
    })
  }, [])

  const recordAttempt = useCallback(
    (attempt: Omit<ChallengeAttempt, 'id' | 'createdAt'>): string => {
      const attemptId = uid('att')
      setState((s) => ({
        ...s,
        attempts: [
          ...s.attempts,
          { ...attempt, id: attemptId, createdAt: Date.now() },
        ],
        progress: [
          ...s.progress,
          {
            id: uid('pe'),
            date: Date.now(),
            title: 'Attempted a challenge',
            detail: `${attempt.summary}`,
            type: 'challenge',
          },
        ],
      }))
      return attemptId
    },
    [],
  )

  const addChallengeReflection = useCallback(
    (attemptId: string, reflection: ChallengeReflection) => {
      setState((s) => ({
        ...s,
        attempts: s.attempts.map((a) =>
          a.id === attemptId ? { ...a, reflection } : a,
        ),
        progress: [
          ...s.progress,
          {
            id: uid('pe'),
            date: Date.now(),
            title: 'Reflected on a challenge',
            detail: reflection.learned || 'Shared how the activity felt.',
            type: 'challenge',
          },
        ],
      }))
    },
    [],
  )

  const setSkillFeedback = useCallback(
    (slug: string, feedback: SkillInterestFeedback) => {
      setState((s) => {
        if (feedback === 'not-for-me') {
          return {
            ...s,
            skillFeedback: { ...s.skillFeedback, [slug]: feedback },
            skills: s.skills.filter((sk) => sk.slug !== slug),
            dismissedSkillSlugs: [...new Set([...s.dismissedSkillSlugs, slug])],
            progress: [
              ...s.progress,
              {
                id: uid('pe'),
                date: Date.now(),
                title: 'Area set aside',
                detail: 'You marked an area as not for you — SKILZ will adjust recommendations.',
                type: 'skill',
              },
            ],
          }
        }
        return {
          ...s,
          skillFeedback: { ...s.skillFeedback, [slug]: feedback },
          progress: [
            ...s.progress,
            {
              id: uid('pe'),
              date: Date.now(),
              title: feedback === 'enjoyed' ? 'Enjoyed an area' : 'Wants to learn more',
              detail: 'Your feedback helps SKILZ suggest better next steps.',
              type: 'skill',
            },
          ],
        }
      })
    },
    [],
  )

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<SkilzContextValue>(
    () => ({
      state,
      hydrated,
      completeOnboarding,
      updateProfile,
      setConversation,
      addProgressEvent,
      saveSkills,
      dismissSkill,
      strengthenSkill,
      setPlan,
      togglePlanItem,
      recordAttempt,
      addChallengeReflection,
      setSkillFeedback,
      reset,
    }),
    [
      state,
      hydrated,
      completeOnboarding,
      updateProfile,
      setConversation,
      addProgressEvent,
      saveSkills,
      dismissSkill,
      strengthenSkill,
      setPlan,
      togglePlanItem,
      recordAttempt,
      addChallengeReflection,
      setSkillFeedback,
      reset,
    ],
  )

  return <SkilzContext.Provider value={value}>{children}</SkilzContext.Provider>
}

export function useSkilz() {
  const ctx = useContext(SkilzContext)
  if (!ctx) throw new Error('useSkilz must be used within SkilzProvider')
  return ctx
}

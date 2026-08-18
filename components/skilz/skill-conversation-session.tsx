'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatComposer } from '@/components/skilz/chat-composer'
import { ChatMessage, ChatTypingIndicator } from '@/components/skilz/chat-message'
import { ChatSessionHeader } from '@/components/skilz/chat-session-header'
import { StatusBadge } from '@/components/skilz/status-badge'
import { SkillConversationService } from '@/lib/ai/services'
import { useHandleAuthRequired } from '@/lib/auth/use-handle-auth-required'
import { useAuth } from '@/lib/auth/auth-context'
import { useSkilz } from '@/lib/data/store'
import type { Message } from '@/lib/data/types'

const SKILLS_TALK_DONE_KEY = 'skilz_skills_talk_done'
const SKILLS_CHAT_KEY = 'skilz_skills_chat_messages'

export function markSkillsTalkPending() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SKILLS_TALK_DONE_KEY)
}

export function isSkillsTalkDone(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SKILLS_TALK_DONE_KEY) === '1'
}

function loadSkillsChatMessages(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(SKILLS_CHAT_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Message[]
  } catch {
    return []
  }
}

function saveSkillsChatMessages(messages: Message[]) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SKILLS_CHAT_KEY, JSON.stringify(messages))
  } catch {
    /* ignore quota */
  }
}

function uid() {
  return `m_${Math.random().toString(36).slice(2, 9)}`
}

export function SkillConversationSession() {
  const router = useRouter()
  const { state, setConversation } = useSkilz()
  const { profile, skills } = state
  const { authenticated, loading: authLoading } = useAuth()
  const handleAuthRequired = useHandleAuthRequired()

  const [messages, setMessages] = useState<Message[]>(() => loadSkillsChatMessages())
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [readyToFinish, setReadyToFinish] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (authLoading) return
    if (!authenticated) {
      router.replace('/discover')
      return
    }
    if (skills.length === 0) {
      router.replace('/discover')
    }
  }, [authLoading, authenticated, skills.length, router])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, streaming])

  const streamReply = useCallback(
    async (history: Message[]) => {
      setStreaming(true)
      setStreamingText('')
      setError(null)

      const wire = history.map((m) => ({ role: m.role, content: m.content }))

      await SkillConversationService.streamNext(
        wire,
        skills.map((s) => ({
          name: s.name,
          statusLabel: s.statusLabel,
          reasoning: s.reasoning,
          developmentAreas: s.developmentAreas,
        })),
        {
          name: profile.name,
          interests: profile.interests,
          goal: profile.goal,
        },
        {
          onToken: (_text, full) => setStreamingText(full),
          onDone: ({ reply, readyToConclude }) => {
            const assistant: Message = {
              id: uid(),
              role: 'assistant',
              content: reply,
              createdAt: Date.now(),
            }
            setMessages((prev) => [...prev, assistant])
            setStreamingText('')
            setStreaming(false)
            if (readyToConclude) setReadyToFinish(true)
          },
          onError: async (err) => {
            setStreaming(false)
            setStreamingText('')
            setError(await handleAuthRequired(err, 'SKILZ could not respond. Please try again.'))
          },
        },
      )
    },
    [skills, profile, handleAuthRequired],
  )

  useEffect(() => {
    if (messages.length > 0) {
      saveSkillsChatMessages(messages)
      setConversation(messages)
      const userTurns = messages.filter((m) => m.role === 'user').length
      if (userTurns >= 3) setReadyToFinish(true)
    }
  }, [messages, setConversation])

  useEffect(() => {
    if (started.current || authLoading || !authenticated || skills.length === 0) return
    started.current = true

    if (messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last?.role === 'user') {
        void streamReply(messages)
      }
      return
    }

    void streamReply([])
  }, [authLoading, authenticated, skills.length, messages, streamReply])

  const sendMessage = useCallback(async () => {
    const text = draft.trim()
    if (!text || streaming) return

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
    }
    const next = [...messages, userMsg]
    setMessages(next)
    setDraft('')
    await streamReply(next)
  }, [draft, streaming, messages, streamReply])

  function finishAndGoHome() {
    sessionStorage.setItem(SKILLS_TALK_DONE_KEY, '1')
    router.push('/dashboard')
  }

  if (authLoading || !authenticated || skills.length === 0) {
    return null
  }

  const userTurns = messages.filter((m) => m.role === 'user').length
  const progress = Math.min(100, (userTurns / 3) * 100)

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col">
      <ChatSessionHeader
        title="Talk about your skills"
        subtitle="SKILZ helps you reflect on what fits"
        progress={progress}
        progressLabel={
          readyToFinish
            ? 'Ready to continue'
            : `${userTurns} of 3+ reflections`
        }
        statusMessage={
          readyToFinish
            ? 'Great conversation — head home when you\'re ready.'
            : 'Answer honestly — there are no wrong responses.'
        }
        statusTone={readyToFinish ? 'primary' : 'muted'}
        onEnd={finishAndGoHome}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.slice(0, 5).map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs"
          >
            <Sparkles className="size-3 text-primary" aria-hidden />
            {skill.name}
            <StatusBadge status={skill.statusLabel} className="scale-90" />
          </span>
        ))}
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            userInitial={profile.name || 'Y'}
          />
        ))}

        {streaming && streamingText && (
          <ChatMessage
            role="assistant"
            content={streamingText}
            streaming
          />
        )}

        {streaming && !streamingText && <ChatTypingIndicator />}

        <div ref={scrollRef} />
      </div>

      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {readyToFinish && (
        <div className="mb-4 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;ve reflected on your potential areas. Your home page has your full profile and next steps.
          </p>
          <Button size="lg" className="mt-3 w-full sm:w-auto" onClick={finishAndGoHome}>
            Go to home
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      <ChatComposer
        value={draft}
        onChange={setDraft}
        onSubmit={() => void sendMessage()}
        placeholder="Share what you think or feel…"
        disabled={streaming}
        hint={streaming ? 'SKILZ is thinking…' : 'Type your answer or tap send'}
      />
    </div>
  )
}

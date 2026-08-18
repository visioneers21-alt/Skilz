'use client'

import { Loader2 } from 'lucide-react'
import { SkillConversationSession } from '@/components/skilz/skill-conversation-session'
import { useSkilz } from '@/lib/data/store'

export default function SkillsTalkPage() {
  const { hydrated } = useSkilz()

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <SkillConversationSession />
}

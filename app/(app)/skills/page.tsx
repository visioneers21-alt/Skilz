'use client'

import Link from 'next/link'
import { Compass, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SkillCard } from '@/components/skilz/skill-card'
import { useSkilz } from '@/lib/data/store'

export default function SkillsPage() {
  const { state } = useSkilz()
  const { skills } = state

  const strong = skills.filter((s) => s.category === 'strong')
  const developing = skills.filter((s) => s.category === 'developing')
  const exploring = skills.filter((s) => s.category === 'exploring')

  if (skills.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Layers className="size-7" />
        </span>
        <h1 className="text-xl font-bold">No skills yet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Talk to SKILZ to discover potential strengths from a natural
          conversation.
        </p>
        <Button asChild size="lg">
          <Link href="/discover">
            <Compass className="size-4" />
            Start discovery
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">My Skills</h1>
        <p className="mt-1 text-muted-foreground">
          {skills.length} potential strength{skills.length === 1 ? '' : 's'}{' '}
          identified from your conversations.
        </p>
      </header>

      <Tabs defaultValue="all">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All ({skills.length})</TabsTrigger>
          {strong.length > 0 && (
            <TabsTrigger value="strong">Strong ({strong.length})</TabsTrigger>
          )}
          {developing.length > 0 && (
            <TabsTrigger value="developing">
              Developing ({developing.length})
            </TabsTrigger>
          )}
          {exploring.length > 0 && (
            <TabsTrigger value="exploring">
              Exploring ({exploring.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4 grid gap-3 sm:grid-cols-2">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </TabsContent>

        {strong.length > 0 && (
          <TabsContent value="strong" className="mt-4 grid gap-3 sm:grid-cols-2">
            {strong.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </TabsContent>
        )}

        {developing.length > 0 && (
          <TabsContent
            value="developing"
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            {developing.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </TabsContent>
        )}

        {exploring.length > 0 && (
          <TabsContent
            value="exploring"
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            {exploring.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadSkillsSnapshot } from '@/lib/export/skills-snapshot'
import type { Profile, UserSkill } from '@/lib/data/types'

export function SkillsSnapshotButton({
  profile,
  skills,
  variant = 'outline',
}: {
  profile: Profile
  skills: UserSkill[]
  variant?: 'outline' | 'ghost' | 'secondary'
}) {
  if (skills.length === 0) return null

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={() => downloadSkillsSnapshot(profile, skills)}
    >
      <Download className="size-4" />
      Export skills snapshot
    </Button>
  )
}

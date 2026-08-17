import type { Profile, UserSkill } from '@/lib/data/types'
import { suggestCareerPaths, isCareerExplorer } from '@/lib/career/paths'

/** Exportable markdown summary — useful for coaches, mentors, or job applications. */
export function buildSkillsSnapshot(profile: Profile, skills: UserSkill[]): string {
  const date = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const lines: string[] = [
    `# SKILZ Skills Snapshot — ${profile.name || 'You'}`,
    `_Generated ${date}_`,
    '',
    '## What this is',
    'Evidence-backed skill hypotheses from a guided conversation — not a personality test or fixed label.',
    '',
  ]

  if (profile.goal) {
    lines.push('## Your goal', profile.goal, '')
  }

  if (skills.length === 0) {
    lines.push('_No skills discovered yet. Complete a discovery session first._')
    return lines.join('\n')
  }

  lines.push('## Skills identified', '')

  for (const skill of skills) {
    lines.push(`### ${skill.name} — _${skill.statusLabel}_`)
    lines.push(skill.reasoning, '')
    if (skill.evidence.length > 0) {
      lines.push('**Evidence from your stories:**')
      for (const ev of skill.evidence) {
        lines.push(`- "${ev.text}" _(${ev.source})_`)
      }
      lines.push('')
    }
    if (skill.developmentAreas.length > 0) {
      lines.push(`**Grow next:** ${skill.developmentAreas.join(', ')}`, '')
    }
  }

  if (isCareerExplorer(profile.goal)) {
    const paths = suggestCareerPaths(skills, 3)
    if (paths.length > 0) {
      lines.push('## Paths worth exploring', '')
      for (const path of paths) {
        lines.push(`### ${path.title}`)
        lines.push(path.hook)
        lines.push(`_Matched skills: ${path.matchedSkills.join(', ')}_`, '')
      }
    }
  }

  lines.push(
    '---',
    '_Built with [SKILZ](https://skilz.app) — discover strengths through conversation, validate with challenges._',
  )

  return lines.join('\n')
}

export function downloadSkillsSnapshot(profile: Profile, skills: UserSkill[]) {
  const markdown = buildSkillsSnapshot(profile, skills)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `skilz-snapshot-${profile.name?.toLowerCase().replace(/\s+/g, '-') || 'me'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

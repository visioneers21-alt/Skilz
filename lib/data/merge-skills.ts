import type { UserSkill } from './types'

function confidenceLabel(score: number): UserSkill['confidence'] {
  if (score >= 0.65) return 'high'
  if (score >= 0.45) return 'medium'
  return 'low'
}

const STAGE_RANK: Record<UserSkill['stage'], number> = {
  discovered: 0,
  exploring: 1,
  developing: 2,
  practicing: 3,
  validated: 4,
  advanced: 5,
}

/** Merge new discovery results into existing skills instead of replacing them. */
export function mergeSkills(
  existing: UserSkill[],
  incoming: UserSkill[],
  dismissedSlugs: string[] = [],
): UserSkill[] {
  const dismissed = new Set(dismissedSlugs)
  const bySlug = new Map<string, UserSkill>()

  for (const skill of existing) {
    if (!dismissed.has(skill.slug)) bySlug.set(skill.slug, skill)
  }

  for (const skill of incoming) {
    if (dismissed.has(skill.slug)) continue

    const prev = bySlug.get(skill.slug)
    if (!prev) {
      bySlug.set(skill.slug, skill)
      continue
    }

    const seenEvidence = new Set(prev.evidence.map((e) => e.text.toLowerCase()))
    const mergedEvidence = [...prev.evidence]
    for (const ev of skill.evidence) {
      if (!seenEvidence.has(ev.text.toLowerCase())) {
        mergedEvidence.push(ev)
        seenEvidence.add(ev.text.toLowerCase())
      }
    }

    const confidenceScore = Math.min(0.98, Math.max(prev.confidenceScore, skill.confidenceScore))
    const stage =
      STAGE_RANK[skill.stage] > STAGE_RANK[prev.stage] ? skill.stage : prev.stage

    bySlug.set(skill.slug, {
      ...prev,
      summary: skill.summary || prev.summary,
      reasoning: skill.reasoning || prev.reasoning,
      statusLabel: confidenceScore >= prev.confidenceScore ? skill.statusLabel : prev.statusLabel,
      confidenceScore,
      confidence: confidenceLabel(confidenceScore),
      stage,
      evidence: mergedEvidence,
      developmentAreas: [...new Set([...prev.developmentAreas, ...skill.developmentAreas])],
      category:
        confidenceScore >= 0.65 ? 'strong' : confidenceScore >= 0.45 ? 'developing' : 'exploring',
    })
  }

  return [...bySlug.values()].sort((a, b) => b.confidenceScore - a.confidenceScore)
}

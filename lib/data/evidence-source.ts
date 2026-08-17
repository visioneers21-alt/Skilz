import type { Message } from '@/lib/data/types'

/** Find the user message that best matches an evidence quote. */
export function findEvidenceSource(
  evidenceText: string,
  conversation: Message[],
): Message | null {
  const needle = evidenceText.toLowerCase().slice(0, 40)
  if (!needle) return null

  const userMessages = conversation.filter((m) => m.role === 'user')
  for (const msg of userMessages) {
    if (msg.content.toLowerCase().includes(needle)) return msg
  }

  // Partial word overlap fallback
  const words = needle.split(/\s+/).filter((w) => w.length > 4)
  let best: Message | null = null
  let bestScore = 0
  for (const msg of userMessages) {
    const lower = msg.content.toLowerCase()
    const score = words.filter((w) => lower.includes(w)).length
    if (score > bestScore) {
      bestScore = score
      best = msg
    }
  }
  return bestScore >= 2 ? best : null
}

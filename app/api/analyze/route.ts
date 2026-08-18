import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ANALYSIS_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import { FULL_SKILL_CATALOG, SKILLS_BY_SLUG, SKILL_DOMAINS } from '@/lib/discovery/catalog'
import {
  assessStructuredDiscoveryEligibility,
  assessTranscriptEligibility,
  normalizeSpeechText,
  refineSkillHypotheses,
} from '@/lib/ai/eligibility'
import { requireAiAccess } from '@/lib/auth/guard'
import { aiErrorMessage, withAiRetry } from '@/lib/ai/with-ai-retry'

export const maxDuration = 30

const RequestSchema = z.object({
  transcript: z.array(
    z.object({
      role: z.enum(['assistant', 'user']),
      content: z.string(),
    }),
  ),
  candidateSlugs: z.array(z.string()).optional(),
  structured: z.boolean().optional(),
})

const SkillSchema = z.object({
  name: z.string().describe('Human-readable skill name, Title Case.'),
  statusLabel: z.enum([
    'Strong potential',
    'Developing',
    'Worth exploring',
  ]),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('0..1 — how strongly the conversation supports this hypothesis.'),
  reasoning: z
    .string()
    .describe('One sentence: why SKILZ identified this, grounded in what they said.'),
  evidence: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe('Short concrete signals paraphrased from the conversation.'),
  developmentAreas: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe('Specific sub-skills to grow, e.g. "Public speaking".'),
})

export async function POST(req: Request) {
  const denied = await requireAiAccess()
  if (denied) return denied

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const transcriptMessages = parsed.data.transcript.map((m) => ({
    ...m,
    content: m.role === 'user' ? normalizeSpeechText(m.content) : m.content,
  }))

  const userTurns = transcriptMessages.filter((m) => m.role === 'user').length
  const eligibility = parsed.data.structured
    ? assessStructuredDiscoveryEligibility(userTurns)
    : assessTranscriptEligibility(transcriptMessages)
  if (!eligibility.eligible) {
    return Response.json(
      {
        error: 'Not enough detail yet for an accurate analysis.',
        code: 'NOT_ELIGIBLE',
        eligibility,
      },
      { status: 422 },
    )
  }

  const transcript = transcriptMessages
    .map((m) => `${m.role === 'user' ? 'PERSON' : 'SKILZ'}: ${m.content}`)
    .join('\n')

  const candidateSkills =
    parsed.data.candidateSlugs?.length
      ? parsed.data.candidateSlugs
          .map((slug) => SKILLS_BY_SLUG[slug])
          .filter(Boolean)
      : []

  const vocabulary =
    candidateSkills.length > 0
      ? candidateSkills.map((s) => s.name)
      : FULL_SKILL_CATALOG.map((s) => s.name)

  const candidateBlock =
    candidateSkills.length > 0
      ? `\nRanked candidate skills from the person's ${userTurns} discovery answers (prioritize these):\n${candidateSkills.map((s, i) => `${i + 1}. ${s.name} (${SKILL_DOMAINS[s.domain]})`).join('\n')}\n`
      : ''

  const instructions = `${SKILZ_PERSONA}

Analyze the discovery Q&A transcript and identify 3 to 5 areas of POTENTIAL the person shows signs of. These are hypotheses to be tested, not diagnoses.
The student may be a secondary-school learner in Sierra Leone exploring subjects, WAEC paths, clubs, and career directions.
${candidateBlock}
Rules:
- Prefer skill names from this vocabulary when they fit: ${vocabulary.slice(0, 40).join(', ')}${vocabulary.length > 40 ? `, and ${vocabulary.length - 40} more related skills` : ''}.
- When candidate skills are listed above, choose primarily from that narrowed list unless answers clearly contradict it.
- Every skill MUST be grounded in something the person actually chose or said. Never invent evidence.
- Each evidence item must map to a specific answer or phrase from the transcript.
- confidenceScore calibration:
  * 0.75–1.0 = multiple clear, consistent signals across answers
  * 0.5–0.74 = one strong answer plus supporting hints
  * 0.35–0.49 = thin signal — use "Worth exploring" only
- Order from strongest to weakest signal.
- Only mark "Strong potential" when there are 2+ distinct concrete signals AND confidence >= 0.65.
- Keep evidence items short (a few words each) and phrased as observations.
- In reasoning, NEVER say "You are a [job title]". ALWAYS say "You show potential in…" or "Your responses suggest…".
- Frame skills as areas to explore (e.g. "Engineering & Technology"), not fixed identities.`

  try {
    const { output } = await withAiRetry(() =>
      generateText({
        model: ANALYSIS_MODEL,
        instructions,
        prompt: `Conversation transcript:\n\n${transcript}\n\nIdentify areas of potential (not final career labels).`,
        output: Output.object({
          schema: z.object({ skills: z.array(SkillSchema).min(3).max(5) }),
        }),
      }),
    )

    const refined = refineSkillHypotheses(output.skills)
    if (refined.length === 0) {
      return Response.json(
        {
          error: 'The conversation did not contain enough clear signals. Keep talking with SKILZ.',
          code: 'NOT_ELIGIBLE',
          eligibility,
        },
        { status: 422 },
      )
    }

    return Response.json({ skills: refined, eligibility })
  } catch (err) {
    console.error('[skilz] analyze route error:', err)
    return Response.json(
      { error: aiErrorMessage(err) },
      { status: 502 },
    )
  }
}

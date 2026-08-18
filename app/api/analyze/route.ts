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
import { requireAuthenticatedUser } from '@/lib/auth/guard'
import { aiErrorMessage, withAiRetry } from '@/lib/ai/with-ai-retry'

export const maxDuration = 60

const RequestSchema = z.object({
  transcript: z.array(
    z.object({
      role: z.enum(['assistant', 'user']),
      content: z.string(),
    }),
  ),
  /** Optional hints only — AI must verify against the full transcript. */
  candidateSlugs: z.array(z.string()).optional(),
  structured: z.boolean().optional(),
})

const SkillSchema = z.object({
  name: z.string().describe('Human-readable skill or potential area name, Title Case.'),
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
    .max(12)
    .describe('Up to 4 short concrete signals paraphrased from the conversation.'),
  developmentAreas: z
    .array(z.string())
    .min(1)
    .max(8)
    .describe('2–4 specific sub-skills or activities to grow.'),
})

export async function POST(req: Request) {
  const denied = await requireAuthenticatedUser()
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

  const vocabulary = FULL_SKILL_CATALOG.map((s) => s.name)

  const hintBlock =
    candidateSkills.length > 0
      ? `\nOptional unverified hints from a scoring engine (do NOT copy blindly — verify against the full transcript):\n${candidateSkills.map((s, i) => `${i + 1}. ${s.name} (${SKILL_DOMAINS[s.domain]})`).join('\n')}\n`
      : ''

  const instructions = `${SKILZ_PERSONA}

Analyze the discovery Q&A transcript and identify 3 to 5 areas of POTENTIAL the person shows signs of. These are hypotheses to be tested through challenges and exploration — not diagnoses or career labels.
The student may be a secondary-school learner in Sierra Leone exploring subjects, WAEC paths, clubs, and career directions.
${hintBlock}
How to analyze (important):
- Read the FULL transcript and look for patterns across many answers — not one answer = one skill.
- Synthesize themes: what they gravitate toward, how they solve problems, how they work with others, what energizes them, and what they want to be known for.
- Weight consistency: skills supported by several different answers are stronger than a single pick.
- Treat the final identity question as one signal among many, not the only signal.
- Name results as areas of potential (e.g. "Project Management", "Public Speaking", "Engineering & Technology") using this vocabulary when it fits: ${vocabulary.slice(0, 50).join(', ')}${vocabulary.length > 50 ? `, and ${vocabulary.length - 50} more related skills` : ''}.
- You may combine related signals into a broader area when that better reflects the person.

Rules:
- Every skill MUST be grounded in multiple concrete signals from what the person actually chose or said. Never invent evidence.
- Pick the 3–4 strongest evidence items per skill (do not list every answer).
- confidenceScore calibration:
  * 0.75–1.0 = clear, consistent patterns across several answers
  * 0.5–0.74 = one strong theme plus supporting hints
  * 0.35–0.49 = thin signal — use "Worth exploring" only
- Order from strongest to weakest signal.
- Only mark "Strong potential" when there are 2+ distinct concrete signals AND confidence >= 0.65.
- In reasoning, NEVER say "You are a [job title]". ALWAYS say "You show potential in…" or "Your responses suggest…".`

  try {
    const { output } = await withAiRetry(() =>
      generateText({
        model: ANALYSIS_MODEL,
        instructions,
        prompt: `Discovery conversation transcript:\n\n${transcript}\n\nSynthesize patterns across ALL answers and identify 3–5 areas of potential (not final career labels).`,
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

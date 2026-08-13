import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ANALYSIS_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import { SKILL_CATALOG } from '@/lib/data/seed'
import {
  assessTranscriptEligibility,
  normalizeSpeechText,
  refineSkillHypotheses,
} from '@/lib/ai/eligibility'
import { requireAiAccess } from '@/lib/auth/guard'

export const maxDuration = 30

const RequestSchema = z.object({
  transcript: z.array(
    z.object({
      role: z.enum(['assistant', 'user']),
      content: z.string(),
    }),
  ),
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

  const eligibility = assessTranscriptEligibility(transcriptMessages)
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

  const instructions = `${SKILZ_PERSONA}

Analyze the conversation transcript and identify 3 to 5 POTENTIAL skills the person shows signs of. These are hypotheses to be tested, not verdicts.

Rules:
- Prefer skill names from this vocabulary when they fit: ${SKILL_CATALOG.map((s) => s.name).join(', ')}. You may add one other clearly-supported skill.
- Every skill MUST be grounded in something the person actually said. Never invent evidence.
- Each evidence item must map to a specific phrase or story from the transcript.
- confidenceScore calibration:
  * 0.75–1.0 = multiple clear, specific behavioral examples
  * 0.5–0.74 = one solid example plus supporting hints
  * 0.35–0.49 = thin signal — use "Worth exploring" only
- Order from strongest to weakest signal.
- Only mark "Strong potential" when there are 2+ distinct concrete signals AND confidence >= 0.65.
- Keep evidence items short (a few words each) and phrased as observations.`

  try {
    const { output } = await generateText({
      model: ANALYSIS_MODEL,
      instructions,
      prompt: `Conversation transcript:\n\n${transcript}\n\nIdentify the potential skills.`,
      output: Output.object({
        schema: z.object({ skills: z.array(SkillSchema).min(3).max(5) }),
      }),
    })

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
      { error: 'Could not analyze the conversation.' },
      { status: 502 },
    )
  }
}

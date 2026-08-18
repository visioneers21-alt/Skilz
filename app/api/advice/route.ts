import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ANALYSIS_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import { requireAuthenticatedUser } from '@/lib/auth/guard'
import { aiErrorMessage, withAiRetry } from '@/lib/ai/with-ai-retry'

export const maxDuration = 45

const RequestSchema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string(),
        statusLabel: z.string(),
        reasoning: z.string().optional(),
        developmentAreas: z.array(z.string()).optional(),
      }),
    )
    .min(1)
    .max(6),
  profile: z
    .object({
      name: z.string().optional(),
      interests: z.array(z.string()).optional(),
      goal: z.string().optional(),
    })
    .optional(),
})

const AdviceSchema = z.object({
  summary: z
    .string()
    .describe('2–3 encouraging sentences summarizing their potential profile and what to do next.'),
  highlights: z
    .array(
      z.object({
        skillName: z.string(),
        advice: z.string().describe('One sentence of practical, encouraging guidance for this area.'),
        nextStep: z
          .string()
          .describe('One concrete next step they can take this week — challenge, club, project, or conversation.'),
      }),
    )
    .min(1)
    .max(5),
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

  const { skills, profile } = parsed.data
  const name = profile?.name?.trim() || 'there'
  const interests =
    profile?.interests?.length ? profile.interests.join(', ') : 'not specified'

  const skillBlock = skills
    .map(
      (s) =>
        `- ${s.name} (${s.statusLabel})${s.reasoning ? `: ${s.reasoning}` : ''}${
          s.developmentAreas?.length
            ? `\n  Grow: ${s.developmentAreas.join(', ')}`
            : ''
        }`,
    )
    .join('\n')

  const instructions = `${SKILZ_PERSONA}

The student "${name}" just finished the SKILZ discovery journey. Give warm, practical advice based on their potential profile.
They may be a secondary-school learner in Sierra Leone exploring subjects, clubs, and career directions.

Rules:
- Frame everything as potential to explore — never "You are a [job title]".
- Be specific to their profile; reference their actual skill areas.
- nextStep must be realistic without paid courses or invented URLs (mini-challenge, school club, small project, talk to a teacher, WAEC subject research, etc.).
- Keep language accessible for teens.
- Order highlights from strongest signal to worth exploring.`

  try {
    const { output } = await withAiRetry(() =>
      generateText({
        model: ANALYSIS_MODEL,
        instructions,
        prompt: `Interests: ${interests}
Goal: ${profile?.goal ?? 'exploring options'}

Identified areas of potential:
${skillBlock}

Write a short summary and practical advice for each area.`,
        output: Output.object({ schema: AdviceSchema }),
      }),
    )

    return Response.json(output)
  } catch (err) {
    console.error('[skilz] advice route error:', err)
    return Response.json({ error: aiErrorMessage(err) }, { status: 502 })
  }
}

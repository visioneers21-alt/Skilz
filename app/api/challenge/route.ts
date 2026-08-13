import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ANALYSIS_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import { assessChallengeEligibility, normalizeSpeechText } from '@/lib/ai/eligibility'
import { requireAiAccess } from '@/lib/auth/guard'

export const maxDuration = 30

const RequestSchema = z.object({
  skillName: z.string(),
  challengeTitle: z.string(),
  challengePrompt: z.string(),
  goal: z.string(),
  response: z.string().min(1),
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

  const { skillName, challengeTitle, challengePrompt, goal, response } =
    parsed.data

  const cleaned = normalizeSpeechText(response)
  const eligibility = assessChallengeEligibility(cleaned)
  if (!eligibility.eligible) {
    return Response.json(
      { error: eligibility.message, code: 'NOT_ELIGIBLE', eligibility },
      { status: 422 },
    )
  }

  const instructions = `${SKILZ_PERSONA}

You are giving feedback on a practical challenge that tests the skill "${skillName}".
Challenge: "${challengeTitle}" — ${challengePrompt}
Goal: ${goal}

Give honest, specific, encouraging feedback on the person's response.
- "strengths": 2-4 concrete things they did well, grounded in their actual words.
- "improvements": 2-3 specific, actionable things to work on. Phrase as forward-looking suggestions.
- "summary": one warm sentence tying it back to the skill and their growth.
Be kind but real. Do not inflate. Never claim the skill is now "proven".
If the response is too vague to evaluate fairly, say so in improvements and keep confidence low.`

  try {
    const { output } = await generateText({
      model: ANALYSIS_MODEL,
      instructions,
      prompt: `Their response:\n\n"""${cleaned}"""`,
      output: Output.object({
        schema: z.object({
          strengths: z.array(z.string()).min(1).max(4),
          improvements: z.array(z.string()).min(1).max(3),
          summary: z.string(),
        }),
      }),
    })

    return Response.json(output)
  } catch (err) {
    console.error('[skilz] challenge route error:', err)
    return Response.json(
      { error: 'Could not evaluate the challenge.' },
      { status: 502 },
    )
  }
}

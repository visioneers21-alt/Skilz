import { generateText, Output } from 'ai'
import { z } from 'zod'
import { ANALYSIS_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import { requireAiAccess } from '@/lib/auth/guard'
import { aiErrorMessage, withAiRetry } from '@/lib/ai/with-ai-retry'

export const maxDuration = 30

const RequestSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      statusLabel: z.string(),
      developmentAreas: z.array(z.string()).optional(),
    }),
  ),
  focusSkill: z.string().optional(),
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

  const { skills, focusSkill } = parsed.data
  const focus = focusSkill || skills[0]?.name || 'your top skill'

  const instructions = `${SKILZ_PERSONA}

Build a short, motivating personal development plan for a secondary-school student in Sierra Leone.
The current focus is "${focus}".
Return 4 to 6 plan items across these buckets, in order:
- "this-week": 1 concrete, doable task (ideally a SKILZ mini-challenge or small project).
- "next": 1-2 tasks that build directly on it.
- "then": 1 slightly more ambitious task.
- "later": 1 stretch goal tied to another identified skill.

Each item: a short "title", a one-sentence "detail", a realistic "estimatedTime" (e.g. "15 min", "This week"), the "skillName" it grows, and the "bucket".

IMPORTANT — recommend actions a student can realistically take WITHOUT paid courses or invented URLs:
- Try another SKILZ challenge
- Join a school club (STEM, debate, entrepreneurship, media)
- Build a small project (poster, app idea, community solution)
- Practice a skill with a friend or classmate
- Research a career path (library, teacher, online when available)
- Talk to a mentor, teacher, or senior student
- Enter a school competition or science fair
- Explore WAEC subject choices related to their interest
- Volunteer in the community
Do NOT invent external website links or fake programs. Keep steps small and encouraging.`

  const skillList = skills
    .map(
      (s) =>
        `- ${s.name} (${s.statusLabel})${
          s.developmentAreas?.length
            ? `: grow ${s.developmentAreas.join(', ')}`
            : ''
        }`,
    )
    .join('\n')

  try {
    const { output } = await withAiRetry(() =>
      generateText({
        model: ANALYSIS_MODEL,
        instructions,
        prompt: `Identified areas of potential:\n${skillList}\n\nBuild a practical development plan.`,
        output: Output.object({
          schema: z.object({
            items: z
              .array(
                z.object({
                  title: z.string(),
                  detail: z.string(),
                  estimatedTime: z.string(),
                  skillName: z.string(),
                  bucket: z.enum(['this-week', 'next', 'then', 'later']),
                }),
              )
              .min(4)
              .max(6),
          }),
        }),
      }),
    )

    return Response.json({ items: output.items })
  } catch (err) {
    console.error('[skilz] plan route error:', err)
    return Response.json({ error: aiErrorMessage(err) }, { status: 502 })
  }
}

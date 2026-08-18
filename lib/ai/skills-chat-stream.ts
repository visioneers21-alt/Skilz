import { streamText } from 'ai'
import { z } from 'zod'
import { CONVERSATION_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import { normalizeSpeechText } from '@/lib/ai/eligibility'

export const MIN_SKILLS_CHAT_TURNS = 3

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['assistant', 'user']),
      content: z.string(),
    }),
  ),
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

export type SkillsChatStreamEvent =
  | { type: 'token'; text: string }
  | { type: 'error'; error: string }
  | { type: 'done'; reply: string; readyToConclude: boolean }

function buildInstructions(
  skills: z.infer<typeof RequestSchema>['skills'],
  profile: z.infer<typeof RequestSchema>['profile'],
  userTurns: number,
) {
  const skillBlock = skills
    .map(
      (s) =>
        `- ${s.name} (${s.statusLabel})${s.reasoning ? `: ${s.reasoning}` : ''}${
          s.developmentAreas?.length ? ` · Grow: ${s.developmentAreas.slice(0, 3).join(', ')}` : ''
        }`,
    )
    .join('\n')

  return `${SKILZ_PERSONA}

The student just finished the structured discovery journey. You analyzed their answers and identified these areas of POTENTIAL (not fixed labels):

${skillBlock}

Your job now: have a short, warm conversation to help them understand and reflect on these skills.

How to behave:
- Ask exactly ONE question per turn. Keep it to 1–2 sentences.
- Reference their specific skill areas by name when relevant.
- Ask reflective questions: what they've tried before, what excites them, what feels surprising, which area they'd like to test first.
- Listen and build on their answers — do not lecture.
- Never say "You are a [job title]". Always frame as potential worth exploring.
- Plain text only — your message directly, no lists or markdown headers.
- After ${MIN_SKILLS_CHAT_TURNS} meaningful exchanges, start wrapping up with encouragement and suggest trying a mini-challenge or exploring one area further.

${profile?.name ? `Their name is ${profile.name}.` : ''}
${profile?.interests?.length ? `Interests: ${profile.interests.join(', ')}.` : ''}
${profile?.goal ? `Goal: ${profile.goal}.` : ''}

User turns so far: ${userTurns}. Aim for ${MIN_SKILLS_CHAT_TURNS}–5 exchanges before concluding.`
}

function friendlyAiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('API key') || msg.includes('API_KEY')) {
    return 'Invalid Google API key. Check GOOGLE_GENERATIVE_AI_API_KEY in your environment.'
  }
  if (msg.includes('404') || msg.includes('model')) {
    return 'Gemini model unavailable. Check GEMINI_MODEL in your environment.'
  }
  if (msg.includes('fetch failed') || msg.includes('timeout') || msg.includes('ECONNRESET')) {
    return 'Could not reach Google AI. Check your connection and try again.'
  }
  return msg.slice(0, 200)
}

export async function createSkillsChatStream(body: unknown): Promise<
  | { stream: ReadableStream<Uint8Array> }
  | Response
> {
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { messages, skills, profile } = parsed.data
  const normalizedMessages = messages.map((m) => ({
    ...m,
    content: m.role === 'user' ? normalizeSpeechText(m.content) : m.content,
  }))
  const userTurns = normalizedMessages.filter((m) => m.role === 'user').length
  const isOpeningTurn = normalizedMessages.length === 0

  const encoder = new TextEncoder()

  const errorStream = (message: string) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(`${JSON.stringify({ type: 'error', error: message })}\n`),
        )
        controller.close()
      },
    })

  let result: Awaited<ReturnType<typeof streamText>>
  let streamError: Error | null = null

  try {
    result = streamText({
      model: CONVERSATION_MODEL,
      instructions: buildInstructions(skills, profile, userTurns),
      reasoning: 'none',
      onError: ({ error }) => {
        streamError = error instanceof Error ? error : new Error(String(error))
        console.error('[skilz] skills-chat model error:', error)
      },
      ...(isOpeningTurn
        ? {
            prompt: `Open the skills reflection conversation. Briefly acknowledge they finished discovery, mention ${skills
              .slice(0, 3)
              .map((s) => s.name)
              .join(', ')} as areas of potential, and ask your first reflective question about which area feels most interesting or surprising to them.`,
          }
        : { messages: normalizedMessages }),
    })
  } catch (err) {
    console.error('[skilz] skills-chat stream setup error:', err)
    return { stream: errorStream(friendlyAiError(err)) }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (event: SkillsChatStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      }

      try {
        let reply = ''
        for await (const chunk of result.textStream) {
          reply += chunk
          push({ type: 'token', text: chunk })
        }

        if (!reply.trim()) {
          let detail = 'SKILZ is unavailable right now.'
          if (streamError) {
            detail = friendlyAiError(streamError)
          } else {
            try {
              await result.text
            } catch (err) {
              detail = friendlyAiError(err)
            }
          }
          push({ type: 'error', error: detail })
          controller.close()
          return
        }

        const readyToConclude = userTurns >= MIN_SKILLS_CHAT_TURNS

        push({
          type: 'done',
          reply: reply.trim(),
          readyToConclude,
        })
        controller.close()
      } catch (err) {
        console.error('[skilz] skills-chat stream error:', err)
        push({ type: 'error', error: friendlyAiError(err) })
        controller.close()
      }
    },
  })

  return { stream }
}

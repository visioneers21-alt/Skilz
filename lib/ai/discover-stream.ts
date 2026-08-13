import { streamText } from 'ai'
import { z } from 'zod'
import { CONVERSATION_MODEL, SKILZ_PERSONA } from '@/lib/ai/models'
import {
  MIN_USER_EXCHANGES,
  MIN_TOTAL_USER_WORDS,
  assessTranscriptEligibility,
  normalizeSpeechText,
  type EligibilityResult,
} from '@/lib/ai/eligibility'

export const maxDuration = 30

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['assistant', 'user']),
      content: z.string(),
    }),
  ),
  profile: z
    .object({
      name: z.string().optional(),
      interests: z.array(z.string()).optional(),
      goal: z.string().optional(),
    })
    .optional(),
})

function buildInstructions(
  profile: z.infer<typeof RequestSchema>['profile'],
  userTurns: number,
) {
  return `${SKILZ_PERSONA}

You are running a skills DISCOVERY conversation. Your job: ask one thoughtful question at a time, listen, and dig deeper into what the person actually enjoys and does well.

How to behave:
- Ask exactly ONE question per turn. Keep it to 1-2 sentences.
- Build on their previous answer — reference something specific they said before asking the next question.
- Explore concrete stories ("tell me about a time..."), not abstract self-ratings.
- If an answer is vague or under ${Math.round(MIN_TOTAL_USER_WORDS / MIN_USER_EXCHANGES)} words, ask a follow-up for a specific example before moving on.
- Rotate across themes: what they enjoy unprompted, how they help others, how they solve problems, how they learn, what energizes them.
- Warm, casual tone. No lists, no preamble like "Great question".
- Reply with plain text only — your question directly, nothing else.

${profile?.name ? `The person's name is ${profile.name}.` : ''}
${profile?.interests?.length ? `Their stated interests: ${profile.interests.join(', ')}.` : ''}
${profile?.goal ? `Their goal: ${profile.goal}.` : ''}

This is user turn ${userTurns}. Aim for ${MIN_USER_EXCHANGES} meaningful exchanges with rich detail before concluding.`
}

export type DiscoverStreamEvent =
  | { type: 'token'; text: string }
  | { type: 'error'; error: string }
  | {
      type: 'done'
      reply: string
      readyToConclude: boolean
      eligibility: EligibilityResult
    }

export async function createDiscoverStream(body: unknown): Promise<{
  stream: ReadableStream<Uint8Array>
  userTurns: number
  eligibility: EligibilityResult
} | Response> {
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { messages, profile } = parsed.data
  const normalizedMessages = messages.map((m) => ({
    ...m,
    content: m.role === 'user' ? normalizeSpeechText(m.content) : m.content,
  }))
  const userTurns = normalizedMessages.filter((m) => m.role === 'user').length
  const eligibility = assessTranscriptEligibility(normalizedMessages)
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
  try {
    result = streamText({
      model: CONVERSATION_MODEL,
      instructions: buildInstructions(profile, userTurns),
      ...(isOpeningTurn
        ? {
            prompt:
              'Begin the discovery session. Give a brief warm greeting and ask your first thoughtful question.',
          }
        : { messages: normalizedMessages }),
    })
  } catch (err) {
    console.error('[skilz] discover stream setup error:', err)
    return {
      stream: errorStream('SKILZ is unavailable right now.'),
      userTurns,
      eligibility,
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (event: DiscoverStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      }

      try {
        let reply = ''
        for await (const chunk of result.textStream) {
          reply += chunk
          push({ type: 'token', text: chunk })
        }

        if (!reply.trim()) {
          push({
            type: 'error',
            error: 'SKILZ is unavailable right now. Check your API key and model settings.',
          })
          controller.close()
          return
        }

        const readyToConclude =
          (userTurns >= MIN_USER_EXCHANGES && eligibility.eligible) || userTurns >= 8

        push({
          type: 'done',
          reply: reply.trim(),
          readyToConclude,
          eligibility,
        })
        controller.close()
      } catch (err) {
        console.error('[skilz] discover stream error:', err)
        push({
          type: 'error',
          error: 'SKILZ is unavailable right now.',
        })
        controller.close()
      }
    },
  })

  return { stream, userTurns, eligibility }
}

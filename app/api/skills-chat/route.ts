import { requireAuthenticatedUser } from '@/lib/auth/guard'
import { createSkillsChatStream } from '@/lib/ai/skills-chat-stream'

export const maxDuration = 30

export async function POST(req: Request) {
  const denied = await requireAuthenticatedUser()
  if (denied) return denied

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await createSkillsChatStream(body)
  if (result instanceof Response) return result

  return new Response(result.stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

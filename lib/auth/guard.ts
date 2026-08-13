import 'server-only'
import { AUTH_REQUIRED_CODE } from './constants'
import { consumeAiTry } from './usage'

export async function requireAiAccess(): Promise<Response | null> {
  const result = await consumeAiTry()
  if (result.allowed) return null

  return Response.json(
    {
      error: 'Sign in to keep using SKILZ.',
      code: AUTH_REQUIRED_CODE,
      triesRemaining: result.status.triesRemaining,
      triesUsed: result.status.triesUsed,
    },
    { status: 403 },
  )
}

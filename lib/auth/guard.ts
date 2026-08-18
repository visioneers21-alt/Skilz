import 'server-only'
import { AUTH_REQUIRED_CODE } from './constants'
import { consumeAiTry } from './usage'
import { getSessionUser } from './session'

export async function requireAuthenticatedUser(): Promise<Response | null> {
  const user = await getSessionUser()
  if (user) return null

  return Response.json(
    {
      error: 'Create an account to see your results.',
      code: AUTH_REQUIRED_CODE,
      triesRemaining: 0,
    },
    { status: 403 },
  )
}

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

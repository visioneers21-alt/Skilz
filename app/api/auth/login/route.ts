import { z } from 'zod'
import { isDatabaseConnected } from '@/lib/db'
import { isValidEmail } from '@/lib/auth/otp'
import { createSession, getSessionUser } from '@/lib/auth/session'
import { findUserByEmail } from '@/lib/auth/users'
import { friendlyDbError } from '@/lib/db/retry'

const RequestSchema = z.object({
  email: z.string().email(),
})

/** Sign in an existing user by email — no OTP (OTP is signup-only). */
export async function POST(req: Request) {
  if (!isDatabaseConnected) {
    return Response.json({ error: 'Database not configured' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success || !isValidEmail(parsed.data.email)) {
    return Response.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()

  try {
    const sessionUser = await getSessionUser()
    if (sessionUser) {
      return Response.json({
        ok: true,
        email: sessionUser.email,
        alreadyAuthenticated: true,
      })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return Response.json(
        {
          error: 'No account found for this email. Sign up first to verify your email.',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 },
      )
    }

    await createSession(user.id)
    return Response.json({ ok: true, email: user.email })
  } catch (err) {
    console.error('[skilz] login error:', err)
    const message = friendlyDbError(err)
    const status = message.includes('temporarily unavailable') ? 503 : 502
    return Response.json({ error: message }, { status })
  }
}

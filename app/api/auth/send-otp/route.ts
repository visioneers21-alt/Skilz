import { z } from 'zod'
import { isDatabaseConnected } from '@/lib/db'
import { createAndSendOtp, isValidEmail, OtpResendCooldownError } from '@/lib/auth/otp'
import { friendlyDbError } from '@/lib/db/retry'
import { getSessionUser } from '@/lib/auth/session'
import { userExists } from '@/lib/auth/users'
import { isBrevoConfigured } from '@/lib/email/brevo'

const RequestSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  if (!isDatabaseConnected) {
    return Response.json({ error: 'Database not configured' }, { status: 503 })
  }
  if (!isBrevoConfigured()) {
    return Response.json({ error: 'Email service not configured' }, { status: 503 })
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

  const sessionUser = await getSessionUser()
  if (sessionUser) {
    return Response.json({
      ok: true,
      alreadyAuthenticated: true,
      email: sessionUser.email,
    })
  }

  if (await userExists(email)) {
    return Response.json(
      {
        error: 'This email already has an account. Log in instead — no code needed.',
        code: 'USER_EXISTS',
      },
      { status: 409 },
    )
  }

  try {
    await createAndSendOtp(email)
    return Response.json({ ok: true })
  } catch (err) {
    if (err instanceof OtpResendCooldownError) {
      return Response.json(
        {
          error: err.message,
          retryAfterSeconds: err.retryAfterSeconds,
        },
        { status: 429 },
      )
    }
    console.error('[skilz] send-otp error:', err)
    const message = friendlyDbError(err)
    const status = message.includes('temporarily unavailable') ? 503 : 502
    return Response.json({ error: message }, { status })
  }
}

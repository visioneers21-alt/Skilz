import { z } from 'zod'
import { isDatabaseConnected } from '@/lib/db'
import { verifyOtp } from '@/lib/auth/otp'
import { createSession, findOrCreateUser, getSessionUser } from '@/lib/auth/session'

const RequestSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
})

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
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const code = parsed.data.code.trim()

  try {
    const sessionUser = await getSessionUser()
    if (sessionUser?.email === email) {
      return Response.json({ ok: true, email, alreadyAuthenticated: true })
    }

    const valid = await verifyOtp(email, code)
    if (!valid) {
      return Response.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    const userId = await findOrCreateUser(email)
    await createSession(userId)

    return Response.json({ ok: true, email })
  } catch (err) {
    console.error('[skilz] verify-otp error:', err)
    return Response.json({ error: 'Could not sign in' }, { status: 502 })
  }
}

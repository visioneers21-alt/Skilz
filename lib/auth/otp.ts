import 'server-only'
import { and, desc, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { otpCodes } from '@/lib/db/schema'
import { withDbRetry } from '@/lib/db/retry'
import { OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from './constants'
import { generateOtp, hashValue } from './crypto'
import { isBrevoConfigured, sendOtpEmail } from '@/lib/email/brevo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export class OtpResendCooldownError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super(`Wait ${retryAfterSeconds}s before requesting a new code`)
    this.name = 'OtpResendCooldownError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

function toTimestamp(value: Date | string): number {
  if (value instanceof Date) return value.getTime()
  return new Date(value).getTime()
}

export async function createAndSendOtp(email: string): Promise<void> {
  if (!db) throw new Error('Database not connected')
  if (!isBrevoConfigured()) throw new Error('Email service not configured')

  const normalized = email.trim().toLowerCase()

  const existing = await withDbRetry(() =>
    db!
      .select({ createdAt: otpCodes.createdAt })
      .from(otpCodes)
      .where(eq(otpCodes.email, normalized))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1),
  )

  if (existing[0]) {
    const elapsed = Date.now() - toTimestamp(existing[0].createdAt)
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000)
      throw new OtpResendCooldownError(retryAfterSeconds)
    }
  }

  const code = generateOtp()
  const codeHash = hashValue(code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await withDbRetry(async () => {
    await db!.delete(otpCodes).where(eq(otpCodes.email, normalized))
    await db!.insert(otpCodes).values({
      email: normalized,
      codeHash,
      expiresAt,
    })
  })

  await sendOtpEmail(normalized, code)
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  if (!db) throw new Error('Database not connected')

  const normalized = email.trim().toLowerCase()
  const codeHash = hashValue(code.trim())

  const rows = await withDbRetry(() =>
    db!
      .select({ id: otpCodes.id })
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, normalized),
          eq(otpCodes.codeHash, codeHash),
          gt(otpCodes.expiresAt, new Date()),
        ),
      )
      .limit(1),
  )

  if (!rows[0]) return false

  await withDbRetry(() => db!.delete(otpCodes).where(eq(otpCodes.email, normalized)))
  return true
}

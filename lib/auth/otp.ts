import 'server-only'
import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { otpCodes } from '@/lib/db/schema'
import { OTP_TTL_MS } from './constants'
import { generateOtp, hashValue } from './crypto'
import { isBrevoConfigured, sendOtpEmail } from '@/lib/email/brevo'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export async function createAndSendOtp(email: string): Promise<void> {
  if (!db) throw new Error('Database not connected')
  if (!isBrevoConfigured()) throw new Error('Email service not configured')

  const normalized = email.trim().toLowerCase()
  const code = generateOtp()
  const codeHash = hashValue(code)
  const expiresAt = new Date(Date.now() + OTP_TTL_MS)

  await db.delete(otpCodes).where(eq(otpCodes.email, normalized))
  await db.insert(otpCodes).values({
    email: normalized,
    codeHash,
    expiresAt,
  })

  await sendOtpEmail(normalized, code)
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  if (!db) throw new Error('Database not connected')

  const normalized = email.trim().toLowerCase()
  const codeHash = hashValue(code.trim())

  const rows = await db
    .select({ id: otpCodes.id })
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, normalized),
        eq(otpCodes.codeHash, codeHash),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!rows[0]) return false

  await db.delete(otpCodes).where(eq(otpCodes.email, normalized))
  return true
}

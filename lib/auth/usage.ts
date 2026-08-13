import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { guestUsage } from '@/lib/db/schema'
import { GUEST_TRY_LIMIT } from './constants'
import {
  getFallbackGuestTries,
  getGuestId,
  setFallbackGuestTries,
} from './cookies'
import { getSessionUser } from './session'

export interface UsageStatus {
  authenticated: boolean
  email: string | null
  triesUsed: number
  triesRemaining: number
}

export async function getUsageStatus(): Promise<UsageStatus> {
  const user = await getSessionUser()
  if (user) {
    return {
      authenticated: true,
      email: user.email,
      triesUsed: 0,
      triesRemaining: GUEST_TRY_LIMIT,
    }
  }

  const triesUsed = await readGuestTries()
  return {
    authenticated: false,
    email: null,
    triesUsed,
    triesRemaining: Math.max(0, GUEST_TRY_LIMIT - triesUsed),
  }
}

async function readGuestTries(): Promise<number> {
  if (!db) return getFallbackGuestTries()

  const guestId = await getGuestId()
  const rows = await db
    .select({ triesUsed: guestUsage.triesUsed })
    .from(guestUsage)
    .where(eq(guestUsage.id, guestId))
    .limit(1)

  return rows[0]?.triesUsed ?? 0
}

export type AiAccessResult =
  | { allowed: true; status: UsageStatus }
  | { allowed: false; status: UsageStatus }

/** Check auth / guest quota and consume one AI try when allowed. */
export async function consumeAiTry(): Promise<AiAccessResult> {
  const user = await getSessionUser()
  if (user) {
    return {
      allowed: true,
      status: {
        authenticated: true,
        email: user.email,
        triesUsed: 0,
        triesRemaining: GUEST_TRY_LIMIT,
      },
    }
  }

  if (db) {
    const guestId = await getGuestId()
    const now = new Date()

    const rows = await db
      .select({ triesUsed: guestUsage.triesUsed })
      .from(guestUsage)
      .where(eq(guestUsage.id, guestId))
      .limit(1)

    const current = rows[0]?.triesUsed ?? 0
    if (current >= GUEST_TRY_LIMIT) {
      return {
        allowed: false,
        status: {
          authenticated: false,
          email: null,
          triesUsed: current,
          triesRemaining: 0,
        },
      }
    }

    const next = current + 1
    if (rows[0]) {
      await db
        .update(guestUsage)
        .set({ triesUsed: next, updatedAt: now })
        .where(eq(guestUsage.id, guestId))
    } else {
      await db.insert(guestUsage).values({
        id: guestId,
        triesUsed: next,
        createdAt: now,
        updatedAt: now,
      })
    }

    return {
      allowed: true,
      status: {
        authenticated: false,
        email: null,
        triesUsed: next,
        triesRemaining: Math.max(0, GUEST_TRY_LIMIT - next),
      },
    }
  }

  const current = await getFallbackGuestTries()
  if (current >= GUEST_TRY_LIMIT) {
    return {
      allowed: false,
      status: {
        authenticated: false,
        email: null,
        triesUsed: current,
        triesRemaining: 0,
      },
    }
  }

  const next = current + 1
  await setFallbackGuestTries(next)
  return {
    allowed: true,
    status: {
      authenticated: false,
      email: null,
      triesUsed: next,
      triesRemaining: Math.max(0, GUEST_TRY_LIMIT - next),
    },
  }
}

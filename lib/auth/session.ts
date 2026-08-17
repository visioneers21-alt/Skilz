import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { authSessions, users } from '@/lib/db/schema'
import { SESSION_TTL_MS } from './constants'
import { hashValue, randomToken } from './crypto'
import { clearSessionCookie, getSessionToken, setSessionCookie } from './cookies'

export interface SessionUser {
  id: string
  email: string
}

async function lookupSession(token: string, touch = false): Promise<SessionUser | null> {
  if (!db) return null
  try {
    const tokenHash = hashValue(token)
    const rows = await db
      .select({
        userId: authSessions.userId,
        email: users.email,
        expiresAt: authSessions.expiresAt,
      })
      .from(authSessions)
      .innerJoin(users, eq(users.id, authSessions.userId))
      .where(eq(authSessions.tokenHash, tokenHash))
      .limit(1)

    const row = rows[0]
    if (!row?.email) return null

    if (row.expiresAt < new Date()) {
      await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash))
      return null
    }

    if (touch) {
      const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS)
      await db
        .update(authSessions)
        .set({ expiresAt: newExpiresAt })
        .where(eq(authSessions.tokenHash, tokenHash))
      await setSessionCookie(token)
    }

    return { id: row.userId, email: row.email }
  } catch (err) {
    console.error('[skilz] session lookup failed:', err)
    return null
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken()
  if (!token) return null
  return lookupSession(token, true)
}

export async function getSessionUserFromToken(token: string | null): Promise<SessionUser | null> {
  if (!token) return null
  return lookupSession(token, false)
}

export async function createSession(userId: string): Promise<void> {
  if (!db) throw new Error('Database not connected')

  const existingToken = await getSessionToken()
  if (existingToken) {
    const existing = await lookupSession(existingToken, false)
    if (existing?.id === userId) {
      await lookupSession(existingToken, true)
      return
    }
  }

  const token = randomToken()
  const tokenHash = hashValue(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.insert(authSessions).values({
    userId,
    tokenHash,
    expiresAt,
  })

  await setSessionCookie(token)
}

export async function destroySession(): Promise<void> {
  const token = await getSessionToken()
  if (token && db) {
    await db.delete(authSessions).where(eq(authSessions.tokenHash, hashValue(token)))
  }
  await clearSessionCookie()
}

export async function findOrCreateUser(email: string): Promise<string> {
  if (!db) throw new Error('Database not connected')
  const normalized = email.trim().toLowerCase()

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1)

  if (existing[0]) return existing[0].id

  const inserted = await db
    .insert(users)
    .values({ email: normalized })
    .returning({ id: users.id })

  return inserted[0]!.id
}

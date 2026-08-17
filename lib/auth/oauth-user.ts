import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { oauthAccounts, users } from '@/lib/db/schema'

export type OAuthProvider = 'google'

export interface OAuthProfile {
  provider: OAuthProvider
  providerAccountId: string
  email: string
  name?: string | null
  image?: string | null
}

/** Find or create a user from an OAuth sign-in, linking accounts by email when needed. */
export async function findOrCreateUserFromOAuth(profile: OAuthProfile): Promise<string> {
  if (!db) throw new Error('Database not connected')

  const email = profile.email.trim().toLowerCase()

  const linked = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, profile.provider),
        eq(oauthAccounts.providerAccountId, profile.providerAccountId),
      ),
    )
    .limit(1)

  if (linked[0]) {
    await maybeUpdateUserProfile(linked[0].userId, profile)
    return linked[0].userId
  }

  const existingByEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingByEmail[0]) {
    const userId = existingByEmail[0].id
    await db.insert(oauthAccounts).values({
      userId,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
    })
    await maybeUpdateUserProfile(userId, profile)
    return userId
  }

  const inserted = await db
    .insert(users)
    .values({
      email,
      name: profile.name ?? null,
      image: profile.image ?? null,
    })
    .returning({ id: users.id })

  const userId = inserted[0]!.id

  await db.insert(oauthAccounts).values({
    userId,
    provider: profile.provider,
    providerAccountId: profile.providerAccountId,
  })

  return userId
}

async function maybeUpdateUserProfile(userId: string, profile: OAuthProfile) {
  if (!db) return

  const rows = await db
    .select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const current = rows[0]
  if (!current) return

  const updates: { name?: string; image?: string } = {}
  if (!current.name && profile.name) updates.name = profile.name
  if (!current.image && profile.image) updates.image = profile.image

  if (Object.keys(updates).length > 0) {
    await db.update(users).set(updates).where(eq(users.id, userId))
  }
}

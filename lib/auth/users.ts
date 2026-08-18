import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  if (!db) return null
  const normalized = email.trim().toLowerCase()
  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1)
  const row = rows[0]
  if (!row?.email) return null
  return { id: row.id, email: row.email }
}

export async function userExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email)
  return user !== null
}

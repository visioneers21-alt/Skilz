// Neon PostgreSQL connection (server-only).
//
// The app runs on the mock data layer until DATABASE_URL is present. This file
// lazily creates a Drizzle client so nothing crashes when the database is not
// yet connected. Never import this from a client component — all database
// access must stay server-side.

import 'server-only'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

/** channel_binding=require breaks Neon HTTP driver on some Node setups. */
function normalizeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('channel_binding')
    return parsed.toString()
  } catch {
    return url.replace(/([?&])channel_binding=[^&]*&?/g, '$1').replace(/[?&]$/, '')
  }
}

export const isDatabaseConnected = Boolean(process.env.DATABASE_URL)

export const db = isDatabaseConnected
  ? drizzle(neon(normalizeDatabaseUrl(process.env.DATABASE_URL!)), { schema })
  : null

export { schema }

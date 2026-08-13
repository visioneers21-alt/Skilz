import 'server-only'
import { cookies } from 'next/headers'
import {
  GUEST_COOKIE,
  GUEST_TRIES_COOKIE,
  GUEST_TRY_LIMIT,
  SESSION_COOKIE,
  SESSION_TTL_MS,
} from './constants'
import { randomToken } from './crypto'

const BASE_COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
}

export async function getGuestId(): Promise<string> {
  const jar = await cookies()
  const existing = jar.get(GUEST_COOKIE)?.value
  if (existing) return existing

  const guestId = crypto.randomUUID()
  jar.set(GUEST_COOKIE, guestId, {
    ...BASE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
  })
  return guestId
}

export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(SESSION_COOKIE)?.value ?? null
}

export async function setSessionCookie(token: string) {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    ...BASE_COOKIE,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getFallbackGuestTries(): Promise<number> {
  const jar = await cookies()
  const raw = jar.get(GUEST_TRIES_COOKIE)?.value
  const n = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(n) ? Math.min(n, GUEST_TRY_LIMIT) : 0
}

export async function setFallbackGuestTries(tries: number) {
  const jar = await cookies()
  jar.set(GUEST_TRIES_COOKIE, String(Math.min(tries, GUEST_TRY_LIMIT)), {
    ...BASE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
  })
}

export function readGuestIdFromRequest(req: Request): string | null {
  return parseCookie(req.headers.get('cookie'), GUEST_COOKIE)
}

export function readSessionTokenFromRequest(req: Request): string | null {
  return parseCookie(req.headers.get('cookie'), SESSION_COOKIE)
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

export function createGuestSetCookie(): string {
  const guestId = randomToken().slice(0, 36)
  const attrs = [
    `${GUEST_COOKIE}=${guestId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 365}`,
  ]
  if (process.env.NODE_ENV === 'production') attrs.push('Secure')
  return attrs.join('; ')
}

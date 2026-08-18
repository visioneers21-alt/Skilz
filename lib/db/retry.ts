import 'server-only'

const TRANSIENT_PATTERNS = [
  /fetch failed/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /timeout/i,
  /other side closed/i,
  /connection/i,
  /Failed query/i,
  /503/,
  /502/,
  /network/i,
]

export function isTransientDbError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return TRANSIENT_PATTERNS.some((p) => p.test(msg))
}

/** Retry Neon HTTP queries that fail due to transient network blips. */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; delayMs?: number },
): Promise<T> {
  const attempts = options?.attempts ?? 3
  const delayMs = options?.delayMs ?? 400
  let lastError: unknown

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (!isTransientDbError(err) || i === attempts - 1) throw err
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)))
    }
  }

  throw lastError
}

export function friendlyDbError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/relation .* does not exist/i.test(msg) || /otp_codes/i.test(msg) && /does not exist/i.test(msg)) {
    return 'Database tables are missing. An admin needs to run: npm run db:push'
  }
  if (isTransientDbError(err)) {
    return 'Database temporarily unavailable. Please wait a moment and try again.'
  }
  if (msg.includes('Failed query')) {
    return 'Could not reach the database. Check your connection and try again.'
  }
  return msg.slice(0, 200)
}

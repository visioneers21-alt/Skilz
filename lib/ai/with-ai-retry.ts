import 'server-only'

const DEFAULT_ATTEMPTS = 3
const BASE_DELAY_MS = 800

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return true
  const msg = err.message.toLowerCase()
  if (msg.includes('type validation failed') || msg.includes('validation failed')) {
    return false
  }
  return (
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('rate') ||
    msg.includes('timeout') ||
    msg.includes('fetch') ||
    msg.includes('overloaded') ||
    msg.includes('unavailable')
  )
}

/** Retry transient Gemini / network failures before returning 502 to the client. */
export async function withAiRetry<T>(
  fn: () => Promise<T>,
  attempts = DEFAULT_ATTEMPTS,
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i === attempts - 1 || !isRetryable(err)) throw err
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * (i + 1)))
    }
  }
  throw lastError
}

export function aiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes('api key')) {
      return 'AI service is not configured. Check GOOGLE_GENERATIVE_AI_API_KEY.'
    }
    if (err.message.toLowerCase().includes('429')) {
      return 'AI is busy right now. Please wait a moment and try again.'
    }
  }
  return 'Could not reach the AI service. Check your connection and try again.'
}

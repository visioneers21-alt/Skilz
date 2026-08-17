/** Allow only same-origin relative paths for post-auth redirects. */
export function sanitizeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.includes('://')) return fallback
  return value
}

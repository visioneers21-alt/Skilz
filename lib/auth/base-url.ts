import 'server-only'

/** Resolve the public origin for OAuth redirect URIs. */
export function getRequestBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'http'

  if (host) return `${proto}://${host}`

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

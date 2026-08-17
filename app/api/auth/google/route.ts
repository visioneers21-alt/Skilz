import { NextResponse } from 'next/server'
import { getRequestBaseUrl } from '@/lib/auth/base-url'
import { randomToken } from '@/lib/auth/crypto'
import { setOAuthFlowCookies } from '@/lib/auth/cookies'
import { buildGoogleAuthUrl, isGoogleOAuthConfigured } from '@/lib/auth/google'
import { sanitizeRedirectPath } from '@/lib/auth/redirect-path'
import { isDatabaseConnected } from '@/lib/db'

export async function GET(request: Request) {
  const baseUrl = getRequestBaseUrl(request)

  if (!isDatabaseConnected) {
    return NextResponse.redirect(new URL('/login?error=auth_unavailable', baseUrl))
  }
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL('/login?error=google_unavailable', baseUrl))
  }

  const { searchParams } = new URL(request.url)
  const redirect = sanitizeRedirectPath(searchParams.get('redirect'), '/dashboard')
  const state = randomToken()

  const response = NextResponse.redirect(buildGoogleAuthUrl({ baseUrl, state }))
  setOAuthFlowCookies(response, state, redirect)
  return response
}

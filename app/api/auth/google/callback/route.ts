import { NextResponse } from 'next/server'
import { getRequestBaseUrl } from '@/lib/auth/base-url'
import {
  clearOAuthFlowCookies,
  readOAuthRedirectFromRequest,
  readOAuthStateFromRequest,
} from '@/lib/auth/cookies'
import { exchangeGoogleCode, isGoogleOAuthConfigured } from '@/lib/auth/google'
import { findOrCreateUserFromOAuth } from '@/lib/auth/oauth-user'
import { sanitizeRedirectPath } from '@/lib/auth/redirect-path'
import { createSession } from '@/lib/auth/session'
import { isDatabaseConnected } from '@/lib/db'

function loginErrorRedirect(request: Request, code: string) {
  const baseUrl = getRequestBaseUrl(request)
  const response = NextResponse.redirect(new URL(`/login?error=${code}`, baseUrl))
  clearOAuthFlowCookies(response)
  return response
}

export async function GET(request: Request) {
  const baseUrl = getRequestBaseUrl(request)

  if (!isDatabaseConnected || !isGoogleOAuthConfigured()) {
    return loginErrorRedirect(request, 'google_unavailable')
  }

  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  if (error) {
    return loginErrorRedirect(request, error === 'access_denied' ? 'google_denied' : 'google_failed')
  }

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const savedState = readOAuthStateFromRequest(request)
  const redirectPath = sanitizeRedirectPath(
    readOAuthRedirectFromRequest(request),
    '/dashboard',
  )

  if (!code || !state || !savedState || state !== savedState) {
    return loginErrorRedirect(request, 'google_failed')
  }

  try {
    const profile = await exchangeGoogleCode(code, baseUrl)
    const userId = await findOrCreateUserFromOAuth({
      provider: 'google',
      providerAccountId: profile.sub,
      email: profile.email,
      name: profile.name ?? null,
      image: profile.picture ?? null,
    })

    await createSession(userId)

    const response = NextResponse.redirect(new URL(redirectPath, baseUrl))
    clearOAuthFlowCookies(response)
    return response
  } catch (err) {
    console.error('[skilz] google callback error:', err)
    return loginErrorRedirect(request, 'google_failed')
  }
}

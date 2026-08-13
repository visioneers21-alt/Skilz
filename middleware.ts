import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { GUEST_COOKIE } from '@/lib/auth/constants'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (!request.cookies.get(GUEST_COOKIE)?.value) {
    response.cookies.set(GUEST_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

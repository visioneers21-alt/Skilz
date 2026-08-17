import { isGoogleOAuthConfigured } from '@/lib/auth/google'

export async function GET() {
  return Response.json({
    google: isGoogleOAuthConfigured(),
    email: true,
  })
}

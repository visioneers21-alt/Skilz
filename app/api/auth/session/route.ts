import { getUsageStatus } from '@/lib/auth/usage'
import { GUEST_TRY_LIMIT } from '@/lib/auth/constants'

export async function GET() {
  try {
    const status = await getUsageStatus()
    return Response.json(status)
  } catch (err) {
    console.error('[skilz] session status failed:', err)
    return Response.json({
      authenticated: false,
      email: null,
      triesUsed: 0,
      triesRemaining: GUEST_TRY_LIMIT,
    })
  }
}

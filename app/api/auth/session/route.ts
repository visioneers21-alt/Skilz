import { getUsageStatus } from '@/lib/auth/usage'

export async function GET() {
  const status = await getUsageStatus()
  return Response.json(status)
}

/**
 * GET /api/wh?cid=xxx — Widget HTML handler
 * No brackets in path = no Windows/Vercel upload issues
 */
import { NextRequest } from 'next/server'
import { handleWidgetRequest } from '@/lib/widget-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cid = request.nextUrl.searchParams.get('cid')
  if (!cid || cid.length < 10) {
    return new Response('Missing or invalid cid parameter', { status: 400 })
  }
  return handleWidgetRequest(cid)
}

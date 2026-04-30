import { NextRequest } from 'next/server'
import { handleWidgetRequest } from '@/lib/widget-handler'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params
  return handleWidgetRequest(clientId)
}

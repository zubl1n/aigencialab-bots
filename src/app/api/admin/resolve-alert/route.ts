import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let alertId: string | null = null
  let clientId: string | null = null

  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = await request.json()
    alertId  = body.alert_id
    clientId = body.client_id
  } else {
    const fd = await request.formData()
    alertId  = fd.get('alert_id') as string
    clientId = fd.get('client_id') as string
  }

  if (!alertId) {
    return NextResponse.json({ error: 'Missing alert_id' }, { status: 400 })
  }

  const { error } = await supabase
    .from('alerts')
    .update({
      status:      'resolved',
      dismissed:   true,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', alertId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    event: 'alert_resolved',
    module: 'admin',
    metadata: { alert_id: alertId, client_id: clientId },
  })

  const referer = request.headers.get('referer') ?? '/admin/alertas'
  return NextResponse.redirect(referer, { status: 303 })
}

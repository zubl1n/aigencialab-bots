/**
 * GET /api/admin/clients/:id
 * Returns full client data with subscriptions, billing, bot, leads, conversations, audit logs.
 * Requires service-role (admin-only route — protect via middleware).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing client id' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      subscriptions(*),
      bot_configs(*),
      billing_profiles(*),
      api_keys(id, key, active, created_at),
      leads(id, contact_name, email, status, created_at)
    `)
    .eq('id', id)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Fetch conversations (last 20)
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, channel, contact_name, status, created_at')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch admin audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('module', 'admin')
    .contains('metadata', { client_id: id })
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch open alerts for this client
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('client_id', id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    data: {
      ...client,
      conversations: conversations ?? [],
      auditLogs: auditLogs ?? [],
      alerts: alerts ?? [],
    },
  })
}

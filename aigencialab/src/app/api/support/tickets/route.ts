/**
 * POST /api/support/tickets — Create a ticket (client authenticated)
 * GET  /api/support/tickets — List tickets for authenticated client
 * Both use RLS: client sees only their own tickets
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendNewTicketAdminEmail } from '@/lib/emails'

export const dynamic = 'force-dynamic'

async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id ?? null
  } catch { return null }
}

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(_req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('id, subject, status, priority, unread_client, created_at, updated_at')
    .eq('client_id', userId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tickets: data ?? [] })
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.subject?.trim() || !body?.message?.trim()) {
    return NextResponse.json({ error: 'subject y message son requeridos' }, { status: 400 })
  }

  const priority = ['low', 'normal', 'high', 'urgent'].includes(body.priority) ? body.priority : 'normal'
  const supabase = adminClient()

  // Get client info
  const { data: client } = await supabase.from('clients')
    .select('email, company_name, company, contact_name')
    .eq('id', userId).maybeSingle()

  const company = client?.company_name || client?.company || ''
  const email   = client?.email ?? ''

  // Create ticket
  const { data: ticket, error } = await supabase.from('tickets').insert({
    client_id: userId,
    subject:   body.subject.trim(),
    status:    'open',
    priority,
    unread_admin:  true,
    unread_client: false,
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Save first message
  await supabase.from('ticket_messages').insert({
    ticket_id: ticket.id,
    author_id: userId,
    role: 'client',
    body: body.message.trim(),
  })

  // Email admin
  sendNewTicketAdminEmail({
    ticketId: ticket.id,
    company, email,
    subject:  body.subject.trim(),
    body:     body.message.trim(),
    priority,
  }).catch(console.error)

  return NextResponse.json({ ok: true, ticketId: ticket.id })
}

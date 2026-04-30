/**
 * GET  /api/support/tickets/[id] — Get ticket detail + messages
 * POST /api/support/tickets/[id] — Reply to ticket (client)
 * PATCH /api/support/tickets/[id] — Update status (admin)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendTicketReplyEmail, sendTicketStatusEmail } from '@/lib/emails'

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

// GET — ticket detail + all messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = adminClient()

  // Verify ownership
  const { data: ticket, error } = await supabase.from('tickets')
    .select('*')
    .eq('id', id)
    .eq('client_id', userId)
    .maybeSingle()

  if (error || !ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })

  // Mark as read by client
  await supabase.from('tickets').update({ unread_client: false }).eq('id', id)

  // Get messages
  const { data: messages } = await supabase.from('ticket_messages')
    .select('id, author_id, role, body, created_at, read_at')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ ticket, messages: messages ?? [] })
}

// POST — client replies to ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body?.message?.trim()) return NextResponse.json({ error: 'message requerido' }, { status: 400 })

  const supabase = adminClient()

  // Verify ownership + get client info
  const [{ data: ticket }, { data: client }] = await Promise.all([
    supabase.from('tickets').select('*').eq('id', id).eq('client_id', userId).maybeSingle(),
    supabase.from('clients').select('email, contact_name, company_name, company').eq('id', userId).maybeSingle(),
  ])

  if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  if (ticket.status === 'closed') return NextResponse.json({ error: 'Ticket cerrado' }, { status: 400 })

  // Add message
  await supabase.from('ticket_messages').insert({
    ticket_id: id,
    author_id: userId,
    role: 'client',
    body: body.message.trim(),
  })

  // Update ticket
  await supabase.from('tickets').update({
    updated_at: new Date().toISOString(),
    unread_admin: true,
    status: ticket.status === 'resolved' ? 'open' : ticket.status,
  }).eq('id', id)

  return NextResponse.json({ ok: true })
}

// PATCH — admin updates ticket status or sends reply
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin-only: requires service role via internal API
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const supabase = adminClient()

  // Get ticket + client info
  const { data: ticket } = await supabase.from('tickets').select('*').eq('id', id).maybeSingle()
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const { data: client } = await supabase.from('clients')
    .select('email, contact_name, company_name, company')
    .eq('id', ticket.client_id).maybeSingle()

  const email = client?.email ?? ''
  const name  = client?.contact_name || client?.company_name || client?.company || 'Cliente'

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  // Handle reply
  if (body?.reply) {
    await supabase.from('ticket_messages').insert({
      ticket_id: id,
      author_id: 'admin',
      role: 'agent',
      body: body.reply,
    })
    updates.unread_client = true
    if (body.status) updates.status = body.status

    if (email) {
      sendTicketReplyEmail({
        email, name, ticketId: id,
        subject: ticket.subject,
        agentName: body.agentName ?? 'Equipo AIgenciaLab',
        replyBody: body.reply,
        newStatus: body.status,
      }).catch(console.error)
    }
  }

  // Handle status change only
  if (body?.status && !body?.reply) {
    updates.status = body.status
    if (email) {
      sendTicketStatusEmail({
        email, name, ticketId: id,
        subject: ticket.subject,
        newStatus: body.status,
      }).catch(console.error)
    }
  }

  await supabase.from('tickets').update(updates).eq('id', id)
  return NextResponse.json({ ok: true })
}

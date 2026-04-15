/**
 * GET  /api/support/tickets  → list tickets for authenticated client
 * POST /api/support/tickets  → create a new support ticket
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAuthenticatedUser(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const anonSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: { user } } = await anonSupabase.auth.getUser()
    if (user) return user.id
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return user.id
  } catch {}

  return null
}

// GET /api/support/tickets
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUser(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  const supabase = getAdminSupabase()

  let query = supabase
    .from('support_tickets')
    .select('*', { count: 'exact' })
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('[support/tickets GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0 })
}

const createTicketSchema = z.object({
  subject:     z.string().min(3, 'El asunto debe tener al menos 3 caracteres').max(200),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(5000),
  priority:    z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
})

// POST /api/support/tickets
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUser(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createTicketSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = getAdminSupabase()

  // Verify the user has a client record first (FK constraint check)
  const { data: clientExists } = await supabase
    .from('clients')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (!clientExists) {
    return NextResponse.json(
      { error: 'Tu perfil de cliente no está configurado aún. Por favor completa tu configuración antes de abrir un ticket.' },
      { status: 422 }
    )
  }

  // Rate limiting: max 10 open tickets per client at a time
  const { count: openCount } = await supabase
    .from('support_tickets')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', userId)
    .in('status', ['open', 'in_progress'])

  if ((openCount ?? 0) >= 10) {
    return NextResponse.json(
      { error: 'Límite de tickets abiertos alcanzado (máx. 10). Resuelve tickets existentes primero.' },
      { status: 429 }
    )
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      client_id:   userId,
      subject:     parsed.data.subject,
      description: parsed.data.description,
      priority:    parsed.data.priority,
      status:      'open',
    })
    .select()
    .single()

  if (error) {
    console.error('[support/tickets POST]', error)
    return NextResponse.json({ error: 'Error al crear ticket' }, { status: 500 })
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    event: 'support_ticket_created',
    module: 'support',
    metadata: { client_id: userId, ticket_id: data.id, subject: parsed.data.subject, priority: parsed.data.priority },
  })

  return NextResponse.json({ data }, { status: 201 })
}

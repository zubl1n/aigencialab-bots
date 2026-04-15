/**
 * PATCH /api/support/tickets/:id  → update ticket status or response (admin)
 * GET   /api/support/tickets/:id  → ticket detail
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminSupabase()

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

const patchSchema = z.object({
  status:   z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  response: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getAdminSupabase()

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  if (parsed.data.response) {
    updatePayload.responded_at = new Date().toISOString()
    if (!parsed.data.status) updatePayload.status = 'in_progress'
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    event: 'support_ticket_updated',
    module: 'support',
    metadata: { ticket_id: id, changes: parsed.data },
  })

  return NextResponse.json({ data })
}

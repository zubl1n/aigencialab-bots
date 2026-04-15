/**
 * GET  /api/client/config  → reads real client config from DB (requires auth)
 * POST /api/client/config  → saves client config to DB (requires auth)
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
  // Try Authorization header (Bearer token)
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

  // Try cookie-based session (SSR)
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

// GET /api/client/config
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUser(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminSupabase()

  const [clientRes, botRes, subRes] = await Promise.all([
    supabase.from('clients')
      .select('id, email, company, company_name, contact_name, whatsapp, url, plan, status, rubro, channels, config, created_at')
      .eq('id', userId)
      .single(),
    supabase.from('bot_configs')
      .select('id, bot_name, name, active, widget_color, welcome_message, language, llm_config, instructions')
      .eq('client_id', userId)
      .maybeSingle(),
    supabase.from('subscriptions')
      .select('id, status, plan, trial_ends_at, current_period_end, mp_subscription_id')
      .eq('client_id', userId)
      .maybeSingle(),
  ])

  if (clientRes.error || !clientRes.data) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      client: clientRes.data,
      bot: botRes.data ?? null,
      subscription: subRes.data ?? null,
    },
  })
}

// Validation schema for POST
const updateSchema = z.object({
  company:      z.string().min(1).optional(),
  company_name: z.string().optional(),
  contact_name: z.string().optional(),
  whatsapp:     z.string().optional(),
  url:          z.string().optional(),
  rubro:        z.string().optional(),
  channels:     z.object({
    whatsapp: z.boolean(),
    web:      z.boolean(),
    email:    z.boolean(),
  }).optional(),
  // Bot config sub-object
  bot: z.object({
    bot_name:        z.string().optional(),
    welcome_message: z.string().optional(),
    widget_color:    z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
    language:        z.string().optional(),
    instructions:    z.string().optional(),
  }).optional(),
})

// POST /api/client/config
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

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { bot, ...clientFields } = parsed.data
  const supabase = getAdminSupabase()

  // Update client row
  if (Object.keys(clientFields).length > 0) {
    const { error: clientErr } = await supabase.from('clients')
      .update({ ...clientFields, updated_at: new Date().toISOString() })
      .eq('id', userId)
    if (clientErr) {
      console.error('[client/config] client update error:', clientErr)
      return NextResponse.json({ error: 'Error al guardar perfil' }, { status: 500 })
    }
  }

  // Update bot_configs row (upsert by client_id)
  if (bot && Object.keys(bot).length > 0) {
    const { error: botErr } = await supabase.from('bot_configs')
      .upsert({ client_id: userId, ...bot }, { onConflict: 'client_id' })
    if (botErr) {
      console.error('[client/config] bot upsert error:', botErr)
      return NextResponse.json({ error: 'Error al guardar configuración del bot' }, { status: 500 })
    }
  }

  // Audit log (non-blocking)
  Promise.resolve(supabase.from('audit_logs').insert({
    event: 'client_config_updated',
    module: 'client',
    metadata: { client_id: userId, fields: Object.keys(parsed.data) },
  })).catch((err: unknown) => console.error('[client/config] audit log error:', err))

  return NextResponse.json({ ok: true, message: 'Configuración guardada correctamente' })
}

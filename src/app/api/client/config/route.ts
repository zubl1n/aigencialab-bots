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
      .maybeSingle(),   // Use maybeSingle to avoid 406 when no record found
    supabase.from('bot_configs')
      // DB uses both 'name' and 'bot_name' depending on migration stage — select both
      .select('id, bot_name, name, active, widget_color, welcome_message, language, llm_config, instructions, system_prompt')
      .eq('client_id', userId)
      .maybeSingle(),
    supabase.from('subscriptions')
      .select('id, status, plan, trial_ends_at, current_period_end, mp_subscription_id')
      .eq('client_id', userId)
      .maybeSingle(),
  ])

  if (clientRes.error) {
    console.error('[client/config GET] DB error:', clientRes.error)
    return NextResponse.json({ error: 'Error al cargar configuración', details: clientRes.error.message }, { status: 500 })
  }

  if (!clientRes.data) {
    // User exists in auth but not in clients table — return empty state instead of 404
    return NextResponse.json({
      data: {
        client: null,
        bot: botRes.data ?? null,
        subscription: subRes.data ?? null,
        _notice: 'Client profile not yet created. Save your configuration to initialize it.',
      },
    })
  }

  // Normalize bot config: prefer bot_name over name
  const bot = botRes.data ? {
    ...botRes.data,
    bot_name: botRes.data.bot_name || botRes.data.name || 'Asistente IA',
  } : null

  return NextResponse.json({
    data: {
      client: clientRes.data,
      bot,
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

  // Update client row — exclude updated_at to avoid column not exist error
  if (Object.keys(clientFields).length > 0) {
    // First check if client record exists
    const { data: existing } = await supabase.from('clients')
      .select('id').eq('id', userId).maybeSingle()

    if (!existing) {
      // Client record doesn't exist — create it
      const { error: insertErr } = await supabase.from('clients').insert({
        id: userId,
        ...clientFields,
        plan: 'Starter',
        status: 'onboarding',
      })
      if (insertErr) {
        console.error('[client/config] client insert error:', insertErr)
        return NextResponse.json({ error: 'Error al crear perfil: ' + insertErr.message }, { status: 500 })
      }
    } else {
      // Update existing record — don't include updated_at column
      const { error: clientErr } = await supabase.from('clients')
        .update({ ...clientFields })
        .eq('id', userId)
      if (clientErr) {
        console.error('[client/config] client update error:', clientErr)
        return NextResponse.json({ error: 'Error al guardar perfil: ' + clientErr.message }, { status: 500 })
      }
    }
  }

  // Update bot_configs row — handle both 'name' and 'bot_name' columns
  if (bot && Object.keys(bot).length > 0) {
    const botPayload: Record<string, unknown> = { client_id: userId }

    // Map to actual DB column names (schema uses 'name' but code uses 'bot_name')
    if (bot.bot_name !== undefined) {
      botPayload.bot_name = bot.bot_name
      botPayload.name = bot.bot_name  // keep both in sync
    }
    if (bot.welcome_message !== undefined) botPayload.welcome_message = bot.welcome_message
    if (bot.widget_color !== undefined) botPayload.widget_color = bot.widget_color
    if (bot.language !== undefined) botPayload.language = bot.language
    if (bot.instructions !== undefined) {
      botPayload.instructions = bot.instructions
      botPayload.system_prompt = bot.instructions  // keep both in sync
    }

    const { error: botErr } = await supabase.from('bot_configs')
      .upsert(botPayload, { onConflict: 'client_id' })
    if (botErr) {
      console.error('[client/config] bot upsert error:', botErr)
      return NextResponse.json({ error: 'Error al guardar bot: ' + botErr.message }, { status: 500 })
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

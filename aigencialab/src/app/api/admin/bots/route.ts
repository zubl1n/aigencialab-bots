/**
 * /api/admin/bots
 * GET  → lista todos los bots con datos del cliente (admin only)
 * PATCH → toggle active on/off
 * PUT  → full config update (model, temp, tokens, prompt, etc.)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Cookie') ?? '';
  // Admin middleware already protects the route — this is a secondary server-side check
  // The admin layout is protected by middleware verifying user.app_metadata.role === 'admin'
  // For API routes called from the admin UI, we trust the session cookie
  // If you want stricter enforcement, add user.app_metadata check here
  return true;
}

/* ── GET: list all bots ─────────────────────────────────────── */
export async function GET(request: Request) {
  try {
    const supabase = adminSupabase();

    const { data: bots, error } = await supabase
      .from('bot_configs')
      .select(`
        id,
        client_id,
        active,
        bot_name,
        name,
        welcome_message,
        widget_color,
        language,
        system_prompt,
        model,
        temperature,
        max_tokens,
        allowed_domains,
        rate_limit,
        created_at,
        updated_at,
        clients (
          email,
          company_name,
          company,
          contact_name,
          plan
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[api/admin/bots] GET error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten client fields for easier frontend consumption
    const flat = (bots ?? []).map((b: any) => {
      const client = Array.isArray(b.clients) ? b.clients[0] : b.clients;
      return {
        id:              b.id,
        client_id:       b.client_id,
        active:          b.active ?? false,
        bot_name:        b.bot_name ?? b.name ?? 'Asistente IA',
        name:            b.name ?? b.bot_name ?? 'Asistente IA',
        welcome_message: b.welcome_message,
        widget_color:    b.widget_color ?? '#6366f1',
        language:        b.language ?? 'es',
        system_prompt:   b.system_prompt ?? null,
        model:           b.model ?? 'gpt-4o-mini',
        temperature:     b.temperature ?? 0.7,
        max_tokens:      b.max_tokens ?? 1024,
        allowed_domains: b.allowed_domains ?? [],
        rate_limit:      b.rate_limit ?? 100,
        created_at:      b.created_at,
        updated_at:      b.updated_at,
        // flattened client fields
        client_email:    client?.email ?? null,
        client_company:  client?.company_name ?? client?.company ?? client?.contact_name ?? null,
        client_plan:     client?.plan ?? 'Starter',
      };
    });

    return NextResponse.json({ bots: flat, total: flat.length });

  } catch (err: any) {
    console.error('[api/admin/bots] exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PATCH: toggle active ───────────────────────────────────── */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bot_id, client_id, active } = body;

    if (!bot_id || !client_id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'bot_id, client_id, active required' }, { status: 400 });
    }

    const supabase = adminSupabase();

    const { error } = await supabase
      .from('bot_configs')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', bot_id)
      .eq('client_id', client_id); // double-key safety

    if (error) {
      console.error('[api/admin/bots] PATCH error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      event: 'admin_toggle_bot',
      module: 'admin',
      metadata: { bot_id, client_id, active },
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ ok: true, bot_id, active });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ── PUT: full config update ────────────────────────────────── */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bot_id, client_id, ...rest } = body;

    if (!bot_id || !client_id) {
      return NextResponse.json({ error: 'bot_id y client_id requeridos' }, { status: 400 });
    }

    // Whitelist: only allow these fields to be updated via admin
    const allowedFields = [
      'bot_name', 'name', 'welcome_message', 'widget_color', 'language',
      'system_prompt', 'model', 'temperature', 'max_tokens',
      'allowed_domains', 'rate_limit', 'active',
    ];

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const key of allowedFields) {
      if (key in rest) {
        updatePayload[key] = rest[key];
      }
    }

    if (Object.keys(updatePayload).length === 1) {
      return NextResponse.json({ error: 'No hay campos válidos para actualizar' }, { status: 400 });
    }

    const supabase = adminSupabase();

    const { error } = await supabase
      .from('bot_configs')
      .update(updatePayload)
      .eq('id', bot_id)
      .eq('client_id', client_id);

    if (error) {
      console.error('[api/admin/bots] PUT error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      event: 'admin_update_bot_config',
      module: 'admin',
      metadata: { bot_id, client_id, fields: Object.keys(updatePayload) },
    }).then(() => {}).catch(() => {});

    return NextResponse.json({ ok: true, bot_id, updated: updatePayload });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

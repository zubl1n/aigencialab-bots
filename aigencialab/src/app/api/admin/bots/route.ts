/**
 * /api/admin/bots
 * GET   → list all bots with client data (two separate queries, no nested relations)
 * PATCH → toggle active on/off
 * PUT   → full config update (model, temp, tokens, prompt, etc.)
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

/* ── GET: list all bots ─────────────────────────────────────── */
export async function GET() {
  try {
    const supabase = adminSupabase();

    // Query 1: bot_configs — only columns that exist
    const { data: bots, error: botsErr } = await supabase
      .from('bot_configs')
      .select('id, client_id, active, bot_name, name, welcome_message, widget_color, language, system_prompt, model, temperature, max_tokens, allowed_domains, rate_limit, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (botsErr) {
      console.error('[api/admin/bots] GET bots error:', botsErr);
      return NextResponse.json({ error: botsErr.message }, { status: 500 });
    }

    const botList = bots ?? [];

    if (botList.length === 0) {
      return NextResponse.json({ bots: [], total: 0 });
    }

    // Query 2: clients for those IDs (separate flat query)
    const clientIds = [...new Set(botList.map(b => b.client_id).filter(Boolean))];
    const { data: clients, error: clientsErr } = await supabase
      .from('clients')
      .select('id, email, company_name, company, contact_name, plan')
      .in('id', clientIds);

    if (clientsErr) {
      console.error('[api/admin/bots] GET clients error:', clientsErr);
      // Still return bots without client data rather than failing
    }

    const clientMap: Record<string, any> = {};
    (clients ?? []).forEach(c => { clientMap[c.id] = c; });

    // Merge
    const flat = botList.map(b => {
      const cl = clientMap[b.client_id] ?? {};
      return {
        id:              b.id,
        client_id:       b.client_id,
        active:          b.active ?? false,
        bot_name:        b.bot_name ?? b.name ?? 'Asistente IA',
        name:            b.name ?? b.bot_name ?? 'Asistente IA',
        welcome_message: b.welcome_message ?? '¡Hola! ¿En qué puedo ayudarte?',
        widget_color:    b.widget_color ?? '#6366f1',
        language:        b.language ?? 'es',
        system_prompt:   b.system_prompt ?? '',
        model:           b.model ?? 'gpt-4o-mini',
        temperature:     b.temperature ?? 0.7,
        max_tokens:      b.max_tokens ?? 1024,
        allowed_domains: b.allowed_domains ?? [],
        rate_limit:      b.rate_limit ?? 100,
        created_at:      b.created_at,
        updated_at:      b.updated_at,
        client_email:    cl.email ?? null,
        client_company:  cl.company_name ?? cl.company ?? cl.contact_name ?? null,
        client_plan:     cl.plan ?? 'Starter',
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

    if (!bot_id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'bot_id y active requeridos' }, { status: 400 });
    }

    const supabase = adminSupabase();

    const updateData: Record<string, any> = { active };
    // updated_at only if column exists (added in migration)
    try {
      updateData.updated_at = new Date().toISOString();
    } catch {}

    const { error } = await supabase
      .from('bot_configs')
      .update(updateData)
      .eq('id', bot_id);

    if (error) {
      console.error('[api/admin/bots] PATCH error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log — non-blocking, void suppresses PromiseLike TS warning
    void Promise.resolve(
      supabase.from('audit_logs').insert({
        event:    'admin_toggle_bot',
        module:   'admin',
        metadata: { bot_id, client_id, active },
      })
    ).catch(() => {});

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

    if (!bot_id) {
      return NextResponse.json({ error: 'bot_id requerido' }, { status: 400 });
    }

    const allowedFields = [
      'bot_name', 'name', 'welcome_message', 'widget_color',
      'language', 'system_prompt', 'model', 'temperature',
      'max_tokens', 'allowed_domains', 'rate_limit', 'active',
    ];

    const payload: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in rest) payload[key] = rest[key];
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 });
    }

    try { payload.updated_at = new Date().toISOString(); } catch {}

    const supabase = adminSupabase();

    const { error } = await supabase
      .from('bot_configs')
      .update(payload)
      .eq('id', bot_id);

    if (error) {
      console.error('[api/admin/bots] PUT error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    void Promise.resolve(
      supabase.from('audit_logs').insert({
        event:    'admin_update_bot_config',
        module:   'admin',
        metadata: { bot_id, client_id, fields: Object.keys(payload) },
      })
    ).catch(() => {});

    return NextResponse.json({ ok: true, bot_id, updated: Object.keys(payload) });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

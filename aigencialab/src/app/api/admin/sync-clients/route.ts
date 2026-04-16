/**
 * GET /api/admin/sync-clients
 * Syncs all auth.users that don't have a row in public.clients.
 * Runs the backfill via RPC or direct inserts using service role.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Get all auth users
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) throw authErr;

    const authUsers = authData?.users ?? [];
    let inserted = 0;
    let skipped  = 0;
    const errors: string[] = [];

    for (const u of authUsers) {
      const meta = u.user_metadata ?? {};
      const plan = meta.plan ?? 'Starter';
      const contactName = meta.full_name ?? meta.name ?? u.email?.split('@')[0] ?? 'Cliente';
      const companyName = meta.company_name ?? meta.company ?? contactName;

      // Upsert client row
      const { error: cErr } = await supabase.from('clients').upsert({
        id:           u.id,
        email:        u.email,
        contact_name: contactName,
        company_name: companyName,
        company:      companyName,
        plan,
        status:       'pending',
        trial_ends_at: new Date(new Date(u.created_at).getTime() + 14 * 86400000).toISOString(),
        created_at:   u.created_at,
      }, { onConflict: 'id', ignoreDuplicates: true });

      if (cErr) { errors.push(`${u.email}: ${cErr.message}`); continue; }

      // Upsert subscription
      await supabase.from('subscriptions').upsert({
        client_id:     u.id,
        plan,
        status:        'trialing',
        trial_ends_at: new Date(new Date(u.created_at).getTime() + 14 * 86400000).toISOString(),
      }, { onConflict: 'client_id', ignoreDuplicates: true });

      // Upsert bot_config
      await supabase.from('bot_configs').upsert({
        client_id:       u.id,
        bot_name:        'Asistente IA',
        name:            'Asistente IA',
        active:          false,
        widget_color:    '#6366f1',
        welcome_message: '¡Hola! ¿En qué puedo ayudarte?',
        language:        'es',
      }, { onConflict: 'client_id', ignoreDuplicates: true });

      // Upsert billing_profile
      await supabase.from('billing_profiles').upsert({
        client_id: u.id,
      }, { onConflict: 'client_id', ignoreDuplicates: true });

      inserted++;
    }

    // Redirect back to admin/clientes with success message
    const url = new URL(request.url);
    const redirectBase = `${url.protocol}//${url.host}`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${redirectBase}/admin/clientes?sync=ok&inserted=${inserted}&errors=${errors.length}`,
      },
    });

  } catch (err: any) {
    console.error('[sync-clients]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

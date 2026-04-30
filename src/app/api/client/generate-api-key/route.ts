/**
 * POST /api/client/generate-api-key
 * Generates or regenerates the API key for the authenticated client.
 * Returns the new key as JSON.
 */
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function generateKey(): string {
  // Format: agl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (prefix + 32 hex chars)
  return 'agl_' + crypto.randomBytes(24).toString('hex');
}

export async function POST(request: Request) {
  try {
    // 1. Get authenticated user from session cookies
    const cookieStore = await cookies();
    const userSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user }, error: authErr } = await userSupabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Generate new key
    const newKey = generateKey();

    // 3. Upsert into api_keys table (admin client to bypass RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: upsertErr } = await adminSupabase
      .from('api_keys')
      .upsert(
        {
          client_id:  user.id,
          key:        newKey,
          active:     true,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      );

    if (upsertErr) {
      // If api_keys table doesn't have unique on client_id, try delete + insert
      if (upsertErr.message.includes('unique') || upsertErr.code === '23505') {
        await adminSupabase.from('api_keys').delete().eq('client_id', user.id);
        const { error: insertErr } = await adminSupabase.from('api_keys').insert({
          client_id:  user.id,
          key:        newKey,
          active:     true,
          created_at: new Date().toISOString(),
        });
        if (insertErr) throw insertErr;
      } else {
        throw upsertErr;
      }
    }

    // 4. Audit log
    void Promise.resolve(
      adminSupabase.from('audit_logs').insert({
        event:    'api_key_generated',
        module:   'client',
        metadata: { client_id: user.id },
      })
    ).catch(() => {});

    return NextResponse.json({ ok: true, key: newKey });

  } catch (err: any) {
    console.error('[generate-api-key]', err);
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 });
  }
}

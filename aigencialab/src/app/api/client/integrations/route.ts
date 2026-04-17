/**
 * GET  /api/client/integrations  — List client's active integrations
 * POST /api/client/integrations  — Toggle an integration on/off
 *
 * Table: client_integrations
 *   id uuid PK
 *   client_id uuid FK → clients.id
 *   integration_key text (e.g. 'hubspot', 'google_calendar', 'shopify')
 *   enabled boolean default false
 *   config jsonb (optional: webhook_url, api_key, etc.)
 *   created_at timestamptz
 *   updated_at timestamptz
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch { return null; }
}

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(_req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = adminClient();
  const { data, error } = await supabase
    .from('client_integrations')
    .select('id, integration_key, enabled, config, updated_at')
    .eq('client_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build a map: integration_key → { enabled, config, updated_at }
  const integrationMap: Record<string, { enabled: boolean; config: any; updated_at: string }> = {};
  for (const row of (data ?? [])) {
    integrationMap[row.integration_key] = {
      enabled: row.enabled,
      config:  row.config ?? {},
      updated_at: row.updated_at,
    };
  }

  return NextResponse.json({ integrations: integrationMap });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.integration_key) {
    return NextResponse.json({ error: 'integration_key is required' }, { status: 400 });
  }

  const { integration_key, enabled, config } = body as {
    integration_key: string;
    enabled: boolean;
    config?: Record<string, any>;
  };

  const supabase = adminClient();

  const { data, error } = await supabase
    .from('client_integrations')
    .upsert(
      {
        client_id: userId,
        integration_key,
        enabled: !!enabled,
        config: config ?? {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id,integration_key' }
    )
    .select('id, integration_key, enabled, config, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log (non-blocking)
  try {
    await supabase.from('audit_logs').insert({
      event: enabled ? 'integration_enabled' : 'integration_disabled',
      module: 'connect',
      metadata: { client_id: userId, integration_key },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, integration: data });
}

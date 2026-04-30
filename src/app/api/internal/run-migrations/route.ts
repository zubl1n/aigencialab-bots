/**
 * GET /api/internal/run-migrations
 * One-shot migration runner — executes DDL via service role.
 * PROTECTED: only callable with X-Migration-Key header matching MIGRATION_SECRET env.
 * DELETE THIS FILE after migration is confirmed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const MIGRATION_SECRET = process.env.MIGRATION_SECRET ?? 'aigencialab-migrate-2026';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const STEPS = [
  {
    name: 'create client_integrations table',
    sql: `CREATE TABLE IF NOT EXISTS public.client_integrations (
      id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id        uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
      integration_key  text NOT NULL,
      enabled          boolean NOT NULL DEFAULT false,
      config           jsonb DEFAULT '{}',
      created_at       timestamptz NOT NULL DEFAULT now(),
      updated_at       timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT uq_client_integration UNIQUE (client_id, integration_key)
    )`,
  },
  {
    name: 'create index on client_integrations.client_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id
      ON public.client_integrations (client_id)`,
  },
  {
    name: 'enable RLS on client_integrations',
    sql: `ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY`,
  },
  {
    name: 'drop existing RLS policy',
    sql: `DROP POLICY IF EXISTS "clients_own_integrations" ON public.client_integrations`,
  },
  {
    name: 'create RLS policy clients_own_integrations',
    sql: `CREATE POLICY "clients_own_integrations"
      ON public.client_integrations FOR ALL
      USING (client_id = auth.uid())
      WITH CHECK (client_id = auth.uid())`,
  },
  {
    name: 'create set_updated_at function',
    sql: `CREATE OR REPLACE FUNCTION public.set_updated_at()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN NEW.updated_at = now(); RETURN NEW; END; $$`,
  },
  {
    name: 'drop old trigger',
    sql: `DROP TRIGGER IF EXISTS trg_client_integrations_updated_at ON public.client_integrations`,
  },
  {
    name: 'create updated_at trigger',
    sql: `CREATE TRIGGER trg_client_integrations_updated_at
      BEFORE UPDATE ON public.client_integrations
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`,
  },
  {
    name: 'add impl_paid_at to subscriptions',
    sql: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS impl_paid_at timestamptz`,
  },
  {
    name: 'add billing_start_date to subscriptions',
    sql: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_start_date date`,
  },
  {
    name: 'add last_billing_at to subscriptions',
    sql: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_billing_at timestamptz`,
  },
  {
    name: 'add mp_preference_id to subscriptions',
    sql: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mp_preference_id text`,
  },
  {
    name: 'add unread_client to tickets',
    sql: `ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS unread_client boolean DEFAULT false`,
  },
  {
    name: 'add client_id to tickets (if missing)',
    sql: `ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id)`,
  },
];

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-migration-key');
  if (key !== MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = adminClient();
  const results: { step: string; ok: boolean; error?: string }[] = [];

  for (const step of STEPS) {
    try {
      const { error } = await supabase.rpc('exec_sql', { query: step.sql });
      if (error) {
        // Try direct query via pg extension
        const { error: e2 } = await (supabase as any).from('_').select().throwOnError();
        results.push({ step: step.name, ok: false, error: error.message });
      } else {
        results.push({ step: step.name, ok: true });
      }
    } catch (err: any) {
      results.push({ step: step.name, ok: false, error: err.message });
    }
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  return NextResponse.json({ passed, failed, results });
}

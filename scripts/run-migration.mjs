/**
 * run-migration.mjs
 * Executes migration SQL using Supabase REST API by calling
 * individual DDL statements via the /rest/v1/rpc endpoint approach.
 * 
 * This uses the pg internal query endpoint that Supabase exposes
 * via the service role key for DDL operations.
 */

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];
const MGMT_URL    = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

// Split the migration into individual statements
const SQL_STATEMENTS = [
  // 1. Create client_integrations table
  `CREATE TABLE IF NOT EXISTS public.client_integrations (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    integration_key  text NOT NULL,
    enabled          boolean NOT NULL DEFAULT false,
    config           jsonb DEFAULT '{}',
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_client_integration UNIQUE (client_id, integration_key)
  )`,

  // 2. Index for fast lookup
  `CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id
    ON public.client_integrations (client_id)`,

  // 3. Enable RLS
  `ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY`,

  // 4. RLS policy - drop and recreate
  `DROP POLICY IF EXISTS "clients_own_integrations" ON public.client_integrations`,

  `CREATE POLICY "clients_own_integrations"
    ON public.client_integrations
    FOR ALL
    USING (client_id = auth.uid())
    WITH CHECK (client_id = auth.uid())`,

  // 5. Auto-update trigger function
  `CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$`,

  // 6. Trigger
  `DROP TRIGGER IF EXISTS trg_client_integrations_updated_at ON public.client_integrations`,

  `CREATE TRIGGER trg_client_integrations_updated_at
    BEFORE UPDATE ON public.client_integrations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()`,

  // 7. Add impl_paid_at column to subscriptions
  `ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS impl_paid_at timestamptz`,

  `ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS billing_start_date date`,

  `ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS last_billing_at timestamptz`,

  `ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS mp_preference_id text`,

  // 8. Add unread_client column to tickets (for sidebar badge)
  `ALTER TABLE public.tickets
    ADD COLUMN IF NOT EXISTS unread_client boolean DEFAULT false`,
];

async function runStatement(sql, idx) {
  const trimmed = sql.trim();
  if (!trimmed) return { ok: true, skipped: true };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method:  'POST',
      headers: {
        'apikey':        SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ query: trimmed }),
    });

    if (res.ok) {
      return { ok: true };
    }

    // Try the alternate approach: pg extension query
    const resAlt = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ query: trimmed }),
    });
    
    const text = await resAlt.text();
    if (resAlt.ok) {
      return { ok: true, via: 'mgmt' };
    }
    return { ok: false, error: text };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

console.log('🚀 Starting migration...\n');
let passed = 0;
let failed = 0;

for (let i = 0; i < SQL_STATEMENTS.length; i++) {
  const stmt = SQL_STATEMENTS[i];
  const preview = stmt.trim().split('\n')[0].substring(0, 60);
  const result  = await runStatement(stmt, i);
  
  if (result.ok) {
    console.log(`✅ [${i+1}/${SQL_STATEMENTS.length}] ${preview}...`);
    passed++;
  } else {
    console.log(`❌ [${i+1}/${SQL_STATEMENTS.length}] ${preview}...`);
    console.log(`   Error: ${result.error?.substring(0, 200)}`);
    failed++;
  }
}

console.log(`\n📊 Result: ${passed} passed, ${failed} failed`);

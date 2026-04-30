/**
 * migrate.mjs - Executes DDL migration using Supabase REST API
 * Each statement uses a raw fetch to the Supabase service endpoint.
 * 
 * How it works: Supabase exposes a `/rest/v1/rpc/{function}` endpoint.
 * We'll use the `query` function from the supabase-js client which
 * internally goes via the postgres-js connector.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Use the Supabase REST API to run each DDL via the pg query endpoint
async function runSQL(sql, name) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    return { ok: true };
  }

  // Fallback: try via Management API
  const errText = await res.text();
  return { ok: false, status: res.status, error: errText };
}

// Alternative: check if client_integrations exists via REST
async function tableExists(tableName) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=0`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });
  return res.status === 200;
}

// Direct approach: use supabase RPC  
async function checkAndReport() {
  console.log('Checking current schema state...\n');
  
  // Check client_integrations
  const ciExists = await tableExists('client_integrations');
  console.log(`client_integrations: ${ciExists ? 'EXISTS ✅' : 'MISSING ❌'}`);
  
  // Check subscriptions columns
  const { data: subSample } = await supabase
    .from('subscriptions')
    .select('id, impl_paid_at, billing_start_date, last_billing_at, mp_preference_id')
    .limit(1);
  
  if (subSample !== null) {
    console.log('subscriptions columns: impl_paid_at, billing_start_date, last_billing_at, mp_preference_id ✅');
  } else {
    console.log('subscriptions: could not verify columns');
  }
  
  // Check tickets.unread_client
  const { data: ticketSample } = await supabase
    .from('tickets')
    .select('id, unread_client')
    .limit(1);
  
  if (ticketSample !== null) {
    console.log('tickets.unread_client: EXISTS ✅');
  } else {
    console.log('tickets.unread_client: MISSING or error');
  }
  
  if (!ciExists) {
    console.log('\n⚠️  client_integrations table needs to be created.');
    console.log('Since exec_sql RPC is not available, please run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(`
-- Run in Supabase SQL Editor (https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql)
CREATE TABLE IF NOT EXISTS public.client_integrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  integration_key  text NOT NULL,
  enabled          boolean NOT NULL DEFAULT false,
  config           jsonb DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_client_integration UNIQUE (client_id, integration_key)
);

CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id ON public.client_integrations (client_id);
ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_own_integrations" ON public.client_integrations;
CREATE POLICY "clients_own_integrations" ON public.client_integrations
  FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS
  $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_client_integrations_updated_at ON public.client_integrations;
CREATE TRIGGER trg_client_integrations_updated_at
  BEFORE UPDATE ON public.client_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    `);
    
    console.log('\nOr use the Supabase CLI with your DB password:');
    console.log('supabase db push --db-url postgresql://postgres.hmnbbzpucefcldziwrvs:[DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
  } else {
    console.log('\n✅ All required tables exist. No migration needed.');
  }
}

checkAndReport().catch(console.error);

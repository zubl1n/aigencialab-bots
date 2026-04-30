/**
 * scripts/run-v2-migration.mjs
 * Runs the V2 SQL migration against Supabase using the service role API.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dir, '../.env.local');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const SQL = `
-- AIgenciaLab V2 Migrations
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS impl_paid_at TIMESTAMPTZ;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS billing_start_date DATE;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'CLP';
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'CL';

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS impl_paid_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_start_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_billing_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;

CREATE TABLE IF NOT EXISTS fx_cache (
  pair TEXT PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan_slug TEXT NOT NULL,
  status TEXT DEFAULT 'onboarding',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  client_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'training',
  embed_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  team_size TEXT,
  message TEXT,
  channels_interest TEXT,
  plan_interest TEXT DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  admin_response TEXT
);

ALTER TABLE fx_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fx_cache' AND policyname='service_role_only_fx') THEN
    CREATE POLICY "service_role_only_fx" ON fx_cache USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='workspaces' AND policyname='owner_access_workspaces') THEN
    CREATE POLICY "owner_access_workspaces" ON workspaces USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='workspaces' AND policyname='service_role_workspaces') THEN
    CREATE POLICY "service_role_workspaces" ON workspaces USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agents' AND policyname='workspace_agents') THEN
    CREATE POLICY "workspace_agents" ON agents USING (
      client_id = auth.uid()
      OR workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
      OR auth.role() = 'service_role'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_requests' AND policyname='service_role_contact') THEN
    CREATE POLICY "service_role_contact" ON contact_requests USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets' AND policyname='client_own_tickets') THEN
    CREATE POLICY "client_own_tickets" ON tickets USING (
      client_id = auth.uid() OR auth.role() = 'service_role'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets' AND policyname='client_insert_tickets') THEN
    CREATE POLICY "client_insert_tickets" ON tickets FOR INSERT WITH CHECK (client_id = auth.uid());
  END IF;
END $$;
`;

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    // Try the pg_rest endpoint approach
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json().catch(() => null);
}

// Fallback: split into individual statements and run via pg REST
async function runStatements(sql) {
  // Split on semicolons, remove empty
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 5 && !s.startsWith('--'));

  let success = 0;
  let failed = 0;
  
  for (const stmt of statements) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: stmt + ';' }),
    });
    
    if (res.ok) {
      console.log(`  ✅ OK: ${stmt.slice(0, 60).replace(/\n/g, ' ')}...`);
      success++;
    } else {
      const text = await res.text();
      console.warn(`  ⚠️ Skip/warn: ${stmt.slice(0, 60).replace(/\n/g, ' ')}`);
      console.warn(`     → ${text.slice(0, 100)}`);
      failed++;
    }
  }
  return { success, failed };
}

async function main() {
  console.log('🚀 Running AIgenciaLab V2 migrations...');
  console.log(`📡 Supabase: ${SUPABASE_URL}\n`);

  // Try the pg_rest direct approach via management API pattern
  // Use Supabase's direct SQL execution via the REST API
  const statements = SQL
    .split(';')
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(s => s.length > 5 && !s.startsWith('--'));

  let success = 0;
  let skipped = 0;

  for (const stmt of statements) {
    // Use PostgREST RPC if available
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    break; // Just test connectivity
  }

  console.log('✅ Supabase reachable. Please execute MIGRATION_V2.sql manually in Supabase SQL editor.');
  console.log(`\n📋 File: ${resolve(__dir, '../MIGRATION_V2.sql')}`);
  console.log('\n🔗 Open: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new');
}

main().catch(e => {
  console.error('Error:', e.message);
});

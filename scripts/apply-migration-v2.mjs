/**
 * scripts/apply-migration-v2.mjs
 * Ejecuta las migraciones V2 contra Supabase usando el cliente JS (@supabase/supabase-js).
 * Cada sentencia se ejecuta como RPC para evitar restricciones de la REST API.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const lines = readFileSync(resolve(__dir, '../.env.local'), 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'hmnbbzpucefcldziwrvs';

// ── Statements to run ─────────────────────────────────────────────────────────
const STATEMENTS = [
  // billing_profiles new columns
  `ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT`,
  `ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS impl_paid_at TIMESTAMPTZ`,
  `ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS billing_start_date DATE`,
  `ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'CLP'`,
  `ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'CL'`,

  // subscriptions new columns
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS impl_paid_at TIMESTAMPTZ`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_start_date DATE`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_billing_at TIMESTAMPTZ`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mp_payment_id TEXT`,
  `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mp_preference_id TEXT`,

  // New tables
  `CREATE TABLE IF NOT EXISTS fx_cache (
    pair TEXT PRIMARY KEY,
    rate NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    plan_slug TEXT NOT NULL,
    status TEXT DEFAULT 'onboarding',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id),
    client_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT DEFAULT 'training',
    embed_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS contact_requests (
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
  )`,

  `CREATE TABLE IF NOT EXISTS tickets (
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
  )`,

  // RLS
  `ALTER TABLE fx_cache ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE agents ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE tickets ENABLE ROW LEVEL SECURITY`,
];

// Supabase JS client can't run arbitrary DDL — we use the Postgres REST endpoint
// via the Management API pattern: POST /query on the REST API
async function execSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

async function main() {
  console.log('🚀 AIgenciaLab V2 — Ejecutando migraciones SQL...');
  console.log(`📡 Supabase project: ${PROJECT_REF}\n`);

  let pass = 0, skip = 0, fail = 0;

  for (const stmt of STATEMENTS) {
    const label = stmt.trim().slice(0, 70).replace(/\s+/g, ' ');
    try {
      const { ok, status, data } = await execSQL(stmt);

      if (ok) {
        console.log(`  ✅ OK    : ${label}`);
        pass++;
      } else {
        const msg = data?.message ?? JSON.stringify(data).slice(0, 100);
        // IF NOT EXISTS errors are safe to skip
        if (msg.includes('already exists') || msg.includes('duplicate') || status === 422) {
          console.log(`  ⏭️  EXISTS : ${label}`);
          skip++;
        } else {
          console.warn(`  ❌ FAIL  : ${label}`);
          console.warn(`         → ${msg}`);
          fail++;
        }
      }
    } catch (e) {
      console.error(`  💥 ERROR : ${label}`);
      console.error(`         → ${e.message}`);
      fail++;
    }
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`✅ OK: ${pass}  ⏭️  EXISTS: ${skip}  ❌ FAIL: ${fail}`);

  if (fail > 0) {
    console.log('\n⚠️  Algunos statements fallaron. Verifica en Supabase SQL editor.');
    process.exit(1);
  } else {
    console.log('\n✅ Todas las migraciones aplicadas correctamente.');
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});

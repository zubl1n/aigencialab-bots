#!/usr/bin/env node
/**
 * run-migration-v3.mjs — Execute V3 migration via Supabase REST API
 * Uses service_role key to execute SQL statements individually
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  // Try loading from .env.local
  try {
    const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
    const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\r\n]+)"?/);
    if (match) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = match[1];
    }
  } catch {}
}

const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

// Read SQL file
const sqlContent = readFileSync(join(__dirname, 'MIGRATION_V3_PLAN_SYSTEM.sql'), 'utf8');

// Split into individual statements (split on semicolons NOT inside DO blocks)
// Since we have DO $$ blocks, we'll run the entire thing as one big statement
console.log('🚀 Running V3 migration via Supabase REST API...\n');

try {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
    },
    body: JSON.stringify({}),
  });
  
  // The rpc endpoint won't work for raw SQL. Let's use the pg-meta SQL endpoint instead
  // Supabase exposes POST /pg/query for the SQL editor
  const sqlRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'x-connection-encrypted': 'true',
    },
    body: JSON.stringify({ query: sqlContent }),
  });
  
  if (sqlRes.ok) {
    const data = await sqlRes.json();
    console.log('✅ Migration V3 applied successfully!');
    console.log('📊 Result:', JSON.stringify(data).slice(0, 200));
  } else {
    const errText = await sqlRes.text();
    console.log(`⚠️  REST API returned ${sqlRes.status}`);
    console.log('Response:', errText.slice(0, 500));
    console.log('\n📋 The SQL file has been generated at: MIGRATION_V3_PLAN_SYSTEM.sql');
    console.log('→ Run it manually at: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new');
  }
} catch (err) {
  console.log('⚠️  Could not execute via API:', err.message);
  console.log('\n📋 The SQL file has been generated at: MIGRATION_V3_PLAN_SYSTEM.sql');
  console.log('→ Run it manually at: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new');
}

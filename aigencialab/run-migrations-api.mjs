#!/usr/bin/env node
/**
 * run-migrations-api.mjs
 * Ejecuta migraciones via Supabase Management API (no requiere DB password)
 * Usa el endpoint /pg/queries del dashboard API
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read env
let ANON_KEY = '', SERVICE_KEY = '', SUPABASE_URL = '';
try {
  const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
  const skMatch  = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\r\n]+)"?/);
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\r\n]+)"?/);
  const anMatch  = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="?([^"\r\n]+)"?/);
  if (skMatch)  SERVICE_KEY   = skMatch[1].trim().replace(/\\r\\n/, '');
  if (urlMatch) SUPABASE_URL  = urlMatch[1].trim().replace(/\\r\\n/, '');
  if (anMatch)  ANON_KEY      = anMatch[1].trim().replace(/\\r\\n/, '');
} catch (e) { console.error('No .env.local found'); process.exit(1); }

const PROJECT_REF = 'hmnbbzpucefcldziwrvs';

// Split SQL into individual runnable statements (avoiding DO blocks splitting)
function splitSQL(sql) {
  // Remove comments
  const clean = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  // Split on semicolons but be careful with DO $$ blocks
  const stmts = [];
  let current = '';
  let depth = 0;
  
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (clean.slice(i, i+2) === '$$') {
      depth = depth === 0 ? 1 : 0;
      current += '$$';
      i++;
      continue;
    }
    if (ch === ';' && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) stmts.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) stmts.push(current.trim());
  return stmts.filter(s => s.length > 5);
}

// Execute SQL via Supabase REST API using rpc exec_sql if available, or query endpoint
async function executeSQL(sql) {
  // Method 1: Try the pg/query endpoint (internal dashboard API)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (res.ok) return { ok: true };
  
  // Method 2: Direct table operations via REST if exec_sql not available
  const errData = await res.text();
  return { ok: false, error: errData };
}

// Alternative: run each statement as individual Supabase queries  
async function runStmtViaRPC(stmt) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  
  // Try Supabase Management API
  const managementKey = process.env.SUPABASE_MANAGEMENT_KEY;
  if (!managementKey) return { ok: false, error: 'No management key' };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${managementKey}`,
    },
    body: JSON.stringify({ query: stmt }),
  });
  
  if (res.ok) return { ok: true };
  return { ok: false, error: await res.text() };
}

const migrations = [
  { name: 'V3 Plan System',    file: 'MIGRATION_V3_PLAN_SYSTEM.sql' },
  { name: 'B1 Ticket Messages', file: 'PATCH_B1_ticket_messages.sql' },
];

console.log('\n🚀 Ejecutando migraciones via Supabase API...\n');
console.log('URL:', SUPABASE_URL);

let allOk = true;

for (const m of migrations) {
  const sqlPath = join(__dirname, m.file);
  let sql;
  try { sql = readFileSync(sqlPath, 'utf8'); }
  catch { console.log(`⚠️  Archivo no encontrado: ${m.file}`); continue; }

  const stmts = splitSQL(sql);
  console.log(`\n📋 ${m.name} — ${stmts.length} statements`);
  
  let ok = 0, failed = 0;
  for (const stmt of stmts) {
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 60);
    const result = await executeSQL(stmt);
    if (result.ok) {
      ok++;
      process.stdout.write('.');
    } else {
      // Check if it's just "already exists" error - those are fine
      const err = result.error ?? '';
      if (err.includes('already exists') || err.includes('PGRST116') || err.includes('42P07') || err.includes('42710')) {
        process.stdout.write('~');
        ok++;
      } else {
        failed++;
        allOk = false;
        console.log(`\n⚠️  ${preview}...`);
        console.log(`   Error: ${err.slice(0, 120)}`);
      }
    }
  }
  console.log(`\n✅ ${ok} OK · ${failed} failed`);
}

if (!allOk) {
  console.log('\n⚠️  Algunas migraciones fallaron. Ejecuta manualmente:');
  console.log('→ https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
  console.log('→ Pega: MIGRATION_V3_PLAN_SYSTEM.sql y luego PATCH_B1_ticket_messages.sql\n');
} else {
  console.log('\n✅ Todas las migraciones aplicadas correctamente.\n');
}

/**
 * apply-migrations-pg.mjs
 * Aplica SQL via Supabase REST rpc o via postgres direct
 * Usa el endpoint /rest/v1/ con service_role para ejecutar DDL
 */

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI'

import { readFileSync } from 'fs'

// ── Supabase pg-meta endpoint (available on supabase projects) ──
async function runSQL(sql) {
  const url = `${SUPABASE_URL}/pg/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
    signal: AbortSignal.timeout(30000),
  })
  return { status: res.status, ok: res.ok, body: await res.text() }
}

// Simpler: call our own Next.js API route that runs the SQL
// This works because we have service_role access in the app itself
async function runSQLViaApp(sql) {
  const url = 'http://localhost:3000/api/admin/run-sql'
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': 'migrations' },
      body: JSON.stringify({ sql }),
      signal: AbortSignal.timeout(10000),
    })
    return { status: res.status, ok: res.ok, body: await res.text() }
  } catch { return { status: 0, ok: false, body: 'App not running' } }
}

// ── Parse SQL into individual statements ─────────────────────
function splitStatements(sql) {
  // Remove comment lines
  const noComments = sql.split('\n')
    .filter(l => !l.trim().startsWith('--'))
    .join('\n')
  // Split on semicolons
  return noComments.split(';').map(s => s.trim()).filter(s => s.length > 10)
}

const sql = readFileSync('supabase/migrations/20260415003000_conversation_stats.sql', 'utf8')
const statements = splitStatements(sql)

console.log(`🚀 Applying ${statements.length} SQL statements...\n`)

// Try pg-meta endpoint
let success = 0, skipped = 0, failed = 0
for (const stmt of statements) {
  const preview = stmt.slice(0, 60).replace(/\n/g, ' ')
  process.stdout.write(`  ${preview}… `)
  
  const result = await runSQL(stmt + ';')
  if (result.ok) {
    console.log('✅')
    success++
  } else {
    let parsed
    try { parsed = JSON.parse(result.body) } catch { parsed = { message: result.body } }
    const msg = parsed?.message || parsed?.error || result.body || ''
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('does not exist')) {
      console.log('⏭  (already exists / idempotent)')
      skipped++
    } else {
      console.log(`❌ ${result.status}: ${msg.slice(0, 120)}`)
      failed++
    }
  }
}

console.log(`\n📊 Results: ${success} applied · ${skipped} skipped · ${failed} failed`)
if (failed === 0) console.log('✅ All migrations OK')
else console.log('⚠️  Some statements failed — check the Supabase SQL Editor')

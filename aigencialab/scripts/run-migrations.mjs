/**
 * run-migrations.mjs
 * Ejecuta las migraciones pendientes directamente contra Supabase via REST API
 * Uso: node run-migrations.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL   || 'https://hmnbbzpucefcldziwrvs.supabase.co'
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY  || ''

if (!SUPABASE_SERVICE_ROLE) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set')
  process.exit(1)
}

async function runSQL(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res.ok) {
    // Try the query endpoint instead
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({ query: sql }),
    })
    const text2 = await res2.text()
    return { ok: res2.ok, status: res2.status, text: text2 }
  }
  const text = await res.text()
  return { ok: true, status: res.status, text }
}

// Migrations to run (in order)
const MIGRATION_FILES = [
  'supabase/migrations/20260415003000_conversation_stats.sql',
]

console.log('🚀 Running Supabase migrations via REST API...\n')

for (const file of MIGRATION_FILES) {
  try {
    const sql = readFileSync(file, 'utf8')
      .split('\n')
      .filter(l => !l.trim().startsWith('--'))  // strip comments
      .join('\n')

    console.log(`📄 ${file}`)
    const result = await runSQL(sql)
    if (result.ok) {
      console.log(`   ✅ Applied successfully`)
    } else {
      console.log(`   ⚠️  Status ${result.status}: ${result.text?.slice(0, 200)}`)
    }
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`)
  }
}

console.log('\n✅ Migration run complete.')

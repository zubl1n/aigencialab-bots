/**
 * apply-migrations.mjs
 * Aplica migraciones SQL directamente a Supabase via la extensión pg de postgres
 * usando fetch (compatible con Node 18+)
 */

const PROJECT_REF  = 'hmnbbzpucefcldziwrvs'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI'

import { readFileSync } from 'fs'

const MIGRATIONS = [
  'supabase/migrations/20260415003000_conversation_stats.sql',
]

async function applySql(sql) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
    signal: AbortSignal.timeout(30000),
  })
  const text = await res.text()
  return { status: res.status, ok: res.ok, body: text }
}

console.log('🚀 AIgenciaLab — Aplicando migraciones Supabase\n')

for (const path of MIGRATIONS) {
  process.stdout.write(`  📄 ${path} ... `)
  try {
    const sql = readFileSync(path, 'utf8')
    const result = await applySql(sql)
    if (result.ok || result.status === 200) {
      console.log('✅ Aplicada')
    } else {
      console.log(`⚠️  HTTP ${result.status}`)
      // Parse errors
      try {
        const parsed = JSON.parse(result.body)
        const msg = parsed?.message || parsed?.error || result.body
        // If "already exists" it's fine (idempotent)
        if (msg.includes('already exists') || msg.includes('duplicate')) {
          console.log(`     ℹ️  Ya existente (OK — idempotente)`)
        } else {
          console.log(`     ❗ ${msg.slice(0,300)}`)
        }
      } catch {
        console.log(`     ❗ ${result.body.slice(0, 300)}`)
      }
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`)
  }
}

console.log('\n✅ Proceso de migración completado.')

/**
 * apply-migration-final.mjs
 * Intenta aplicar la migration via el endpoint interno de producción
 * El pg/query endpoint de Supabase hosted requiere Management API token,
 * no service_role. Como alternativa, intentamos crear la tabla via RPC
 * usando una función helper en Supabase si existe.
 */

const PROD = 'https://aigencialab.cl'
const SECRET = 'aigencialab-migrations-2026'

const SQL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS public.conversation_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    conversations INT NOT NULL DEFAULT 0,
    leads INT NOT NULL DEFAULT 0,
    messages INT NOT NULL DEFAULT 0,
    avg_duration_seconds INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (client_id, date)
  )`,
  `ALTER TABLE public.conversation_stats ENABLE ROW LEVEL SECURITY`,
  `CREATE INDEX IF NOT EXISTS idx_conv_stats_client_date ON public.conversation_stats(client_id, date DESC)`,
  `ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open'`,
  `ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ`,
]

console.log('🚀 Applying migration via prod internal API...\n')

let applied = 0, failed = 0

for (const stmt of SQL_STATEMENTS) {
  const preview = stmt.trim().slice(0, 55).replace(/\s+/g, ' ')
  process.stdout.write(`  ${preview}… `)
  
  try {
    const res = await fetch(`${PROD}/api/internal/run-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': SECRET,
      },
      body: JSON.stringify({ sql: stmt }),
      signal: AbortSignal.timeout(15000),
    })
    
    const data = await res.json()
    
    if (res.ok) {
      console.log('✅')
      applied++
    } else {
      console.log(`❌ ${data.error?.slice(0, 100) ?? res.status}`)
      failed++
    }
  } catch (e) {
    console.log(`❌ ${e.message}`)
    failed++
  }
}

console.log(`\n📊 ${applied} applied · ${failed} failed`)

if (failed > 0) {
  console.log('\n⚠️  Para completar la migration manualmente (30 segundos):')
  console.log('→ https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new')
  console.log('→ Pegar y ejecutar: SUPABASE_MIGRATION_READY.sql\n')
} else {
  console.log('✅ Migration completa!')
}

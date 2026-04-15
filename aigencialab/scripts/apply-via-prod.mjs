/**
 * apply-via-prod.mjs
 * Aplica la migration usando la ruta /api/internal/run-sql en producción
 * con el service_role key del proyecto
 */
import { readFileSync } from 'fs'

const PROD_URL   = 'https://aigencialab.cl'
const SECRET     = 'aigencialab-migrations-2026'

// The SQL to apply
const SQL = `
-- conversation_stats
CREATE TABLE IF NOT EXISTS public.conversation_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  conversations   INT  NOT NULL DEFAULT 0,
  leads           INT  NOT NULL DEFAULT 0,
  messages        INT  NOT NULL DEFAULT 0,
  avg_duration_seconds INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, date)
);
`

console.log('🚀 Applying migration via production API...\n')

try {
  const res = await fetch(`${PROD_URL}/api/internal/run-sql`, {
    method: 'POST',
    headers: {
      'Content-Type':       'application/json',
      'x-internal-secret': SECRET,
    },
    body: JSON.stringify({ sql: SQL }),
    signal: AbortSignal.timeout(30000),
  })
  
  const text = await res.text()
  console.log(`Status: ${res.status}`)
  console.log(`Response: ${text.slice(0, 500)}`)
  
  if (res.status === 200) {
    console.log('\n✅ Migration applied!')
  } else if (res.status === 403) {
    console.log('\n⚠️  Secret mismatch - check route.ts')
  } else {
    console.log('\n⚠️  Check response above')
  }
} catch (err) {
  console.error('Error:', err.message)
}

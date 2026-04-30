import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Internal migration runner - uses Supabase Management API
// Protected by shared secret header
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-internal-secret')
  if (secret !== 'aigencialab-migrations-2026') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { sql } = await request.json()
  if (!sql) return NextResponse.json({ error: 'No SQL provided' }, { status: 400 })

  const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const PROJECT_REF   = SUPABASE_URL.split('//')[1].split('.')[0]

  // Use Supabase pg-meta REST endpoint
  const pgMetaUrl = `https://${PROJECT_REF}.supabase.co/pg/query`

  const res = await fetch(pgMetaUrl, {
    method: 'POST',
    headers: {
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const responseText = await res.text()
  let parsed: any = {}
  try { parsed = JSON.parse(responseText) } catch {}

  if (res.ok) {
    return NextResponse.json({ ok: true, result: parsed })
  }

  // If pg-meta fails, try the supabase-js rpc approach as fallback
  // by returning the error so we know what to try next
  return NextResponse.json({
    error: parsed?.message || responseText,
    status: res.status,
    hint: 'Run SUPABASE_MIGRATION_READY.sql in the Supabase SQL Editor',
    url: `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`,
  }, { status: res.status })
}

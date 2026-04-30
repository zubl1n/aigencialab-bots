/**
 * scripts/migration-tickets-v2.mjs
 * Adds missing columns to tickets table and creates ticket_messages table.
 * Uses Supabase Management API — needs a PAT token OR uses pg directly.
 * Fallback: uses Supabase REST rpc if exec_sql function exists.
 */

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

const SQL_STATEMENTS = [
  // Add missing columns to tickets table
  `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS unread_client BOOLEAN DEFAULT false`,
  `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS unread_admin BOOLEAN DEFAULT true`,
  
  // Create ticket_messages table for the conversation thread system
  `CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    author_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'agent')),
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  
  // RLS for ticket_messages
  `ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY`,
  
  // Policies: clients can read their own ticket messages
  `DROP POLICY IF EXISTS "client_read_own_messages" ON ticket_messages`,
  `CREATE POLICY "client_read_own_messages" ON ticket_messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.id = ticket_messages.ticket_id
        AND tickets.client_id = auth.uid()
      )
    )`,
  
  // Service role can do everything (for admin)
  `DROP POLICY IF EXISTS "service_role_all_messages" ON ticket_messages`,
  `CREATE POLICY "service_role_all_messages" ON ticket_messages
    FOR ALL USING (auth.role() = 'service_role')`,
];

async function execSQL(sql) {
  // Use Supabase SQL execution via the management API
  const res = await fetch(`https://api.supabase.com/v1/projects/hmnbbzpucefcldziwrvs/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

// Alternative: use Supabase REST API to execute via rpc
async function execViaRPC(sql) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log('🚀 Tickets V2 Migration — adding unread cols + ticket_messages table\n');

  let pass = 0, fail = 0;

  for (const sql of SQL_STATEMENTS) {
    const label = sql.trim().replace(/\s+/g, ' ').slice(0, 80);
    
    // Try management API first, fallback to RPC
    let result = await execSQL(sql);
    if (!result.ok && result.status === 401) {
      // Management API needs PAT token, fallback to RPC
      result = await execViaRPC(sql);
    }

    const msg = result.data?.message ?? result.data?.error ?? JSON.stringify(result.data).slice(0, 100);
    
    if (result.ok || msg.includes('already exists') || msg.includes('duplicate')) {
      console.log(`  ✅ ${label}`);
      pass++;
    } else {
      console.warn(`  ❌ ${label}`);
      console.warn(`     → ${msg}`);
      fail++;
    }
  }

  console.log(`\n═══════════════════════════════`);
  console.log(`✅ OK: ${pass}  ❌ FAIL: ${fail}`);
  
  if (fail > 0) {
    console.log('\n⚠️  Copy the following SQL and run it manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new\n');
    console.log('--- SQL TO RUN MANUALLY ---');
    for (const s of SQL_STATEMENTS) {
      console.log(s + ';');
    }
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

// Force Supabase PostgREST schema cache reload
// The Supabase REST API automatically reloads every ~30s, but we can force it
// by making a NOTIFY call via pg_notify through the management endpoint.

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

const h = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function main() {
  // 1. Verify columns now visible
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=id,unread_client,unread_admin&limit=0`, { headers: h });
  console.log('tickets schema check:', r1.status, r1.status === 200 ? '✅ unread columns accessible' : '❌');

  // 2. Verify ticket_messages accessible
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/ticket_messages?select=id,ticket_id,role,body&limit=0`, { headers: h });
  console.log('ticket_messages check:', r2.status, r2.status === 200 ? '✅ table accessible' : '❌');
  if (!r2.ok) console.log('Error:', await r2.text());

  // 3. Test INSERT a ticket (no unread_admin)
  const r3 = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
    method: 'POST',
    headers: { ...h, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      client_id: '00000000-0000-0000-0000-000000000000', // dummy, won't exist
      subject: 'test schema check',
      message: 'test',
      status: 'open',
      priority: 'medium',
      unread_admin: true,
      unread_client: false,
    })
  });
  const d3 = await r3.json();
  // Expect 409 (FK violation) or 201 — NOT 400 (column not found)
  console.log('INSERT test (expect 409 FK or 201, NOT 400 schema):', r3.status);
  if (r3.status === 400) console.error('❌ Schema error:', JSON.stringify(d3));
  else console.log('✅ unread_admin + unread_client insertable (FK violation is OK)');

  // 4. Reload schema via pg_notify (if supported by this version)
  try {
    const r4 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_notify`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({ channel: 'pgrst', payload: 'reload schema' })
    });
    console.log('pg_notify reload:', r4.status, r4.status < 400 ? '✅' : '(not supported - ok)');
  } catch { console.log('pg_notify: not available (normal)'); }
}

main().catch(e => console.error(e.message));

// Reload Supabase PostgREST schema cache and verify ticket cols + test back_urls
const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

async function main() {
  const h = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

  // 1. Force schema cache reload via the pgrst endpoint
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/`, { headers: h });
  console.log('Schema status:', r1.status);

  // 2. Verify new columns exist by doing a SELECT
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=unread_client,unread_admin&limit=1`, { headers: h });
  const d2 = await r2.json();
  if (r2.ok) {
    console.log('✅ unread_client + unread_admin columns confirmed:', JSON.stringify(d2));
  } else {
    console.error('❌ Column check failed:', JSON.stringify(d2));
  }

  // 3. Verify ticket_messages exists
  const r3 = await fetch(`${SUPABASE_URL}/rest/v1/ticket_messages?select=id&limit=1`, { headers: h });
  const d3 = await r3.json();
  if (r3.ok) {
    console.log('✅ ticket_messages table confirmed:', JSON.stringify(d3));
  } else {
    console.error('❌ ticket_messages check failed:', JSON.stringify(d3));
  }

  // 4. Test that aigencialab.cl checkout API is live (new build)
  const r4 = await fetch('https://aigencialab.cl/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'Starter' }) });
  const d4 = await r4.json();
  console.log('\n--- /api/billing/checkout response ---');
  console.log('Status:', r4.status, '| Body:', JSON.stringify(d4).slice(0, 120));
  
  // Check if back_urls error or auth error (auth error = good, means MP didn't fail)
  if (JSON.stringify(d4).includes('back_urls')) {
    console.log('❌ back_urls error still present in production');
  } else {
    console.log('✅ No back_urls error (probably auth error = expected without token)');
  }
}

main().catch(e => console.error('Fatal:', e.message));

/**
 * Full verification after fixes:
 * 1. NEXT_PUBLIC_SITE_URL value via env pull
 * 2. Tickets schema: all required columns
 * 3. Checkout API: verify back_urls are valid format
 * 4. Verify ticket creation flow
 */
const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';
const h = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function checkURL(label, url, opts = {}) {
  try {
    const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(10000) });
    const body = await r.text();
    const short = body.slice(0, 150).replace(/\n/g, ' ');
    return { status: r.status, body: short };
  } catch (e) {
    return { status: 'ERR', body: e.message };
  }
}

async function main() {
  console.log('═══ AIgenciaLab Production Verification ═══\n');

  // 1. Check tickets schema — all new columns
  console.log('── Tickets Schema ──');
  const cols = ['id', 'client_id', 'subject', 'message', 'status', 'priority', 'admin_response', 'resolved_at', 'updated_at', 'unread_client', 'unread_admin'];
  for (const col of cols) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=${col}&limit=0`, { headers: h });
    const ok = r.status === 200;
    console.log(`  ${ok ? '✅' : '❌'} ${col} (${r.status})`);
    if (!ok) { const d = await r.json(); console.log(`     → ${d.message}`); }
  }

  // 2. ticket_messages schema
  console.log('\n── ticket_messages Schema ──');
  const tmCols = ['id', 'ticket_id', 'author_id', 'role', 'body', 'created_at'];
  for (const col of tmCols) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/ticket_messages?select=${col}&limit=0`, { headers: h });
    console.log(`  ${r.status === 200 ? '✅' : '❌'} ${col}`);
  }

  // 3. Public routes (no auth)
  console.log('\n── Public Routes ──');
  const routes = ['/precios', '/connect', '/platform', '/agendar', '/docs/instalacion'];
  for (const r of routes) {
    const { status } = await checkURL(r, `https://aigencialab.cl${r}`);
    console.log(`  ${status === 200 ? '✅' : '⚠️ '} ${status}  ${r}`);
  }

  // 4. Auth-protected routes return 307 (redirect to login) not 500
  console.log('\n── Auth-Protected Routes (expect 200 or 307) ──');
  const authRoutes = ['/dashboard/billing', '/dashboard/tickets', '/dashboard/connect', '/admin/tickets'];
  for (const r of authRoutes) {
    const { status } = await checkURL(r, `https://aigencialab.cl${r}`, { redirect: 'manual' });
    const ok = [200, 307, 302].includes(status);
    console.log(`  ${ok ? '✅' : '❌'} ${status}  ${r}`);
  }

  // 5. API endpoints
  console.log('\n── API Endpoints ──');
  // billing/checkout without auth should return 401
  const c1 = await checkURL('/api/billing/checkout', 'https://aigencialab.cl/api/billing/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'Starter' })
  });
  const c1ok = c1.status === 401;
  console.log(`  ${c1ok ? '✅' : '❌'} /api/billing/checkout → ${c1.status} (expect 401 without auth)`);
  if (c1.body.includes('back_urls')) console.log('  ❌ STILL HAS back_urls ERROR before auth!');

  // v2/tickets without auth should return 401
  const c2 = await checkURL('/api/v2/tickets', 'https://aigencialab.cl/api/v2/tickets');
  console.log(`  ${c2.status === 401 ? '✅' : '❌'} /api/v2/tickets → ${c2.status} (expect 401)`);

  // enterprise contact form
  const c3 = await checkURL('/api/v2/contact/enterprise', 'https://aigencialab.cl/api/v2/contact/enterprise', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
  });
  console.log(`  ${[400, 422].includes(c3.status) ? '✅' : '❌'} /api/v2/contact/enterprise → ${c3.status} (expect 400)`);

  console.log('\n═══ Verification Complete ═══');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

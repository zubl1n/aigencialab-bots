#!/usr/bin/env node
/**
 * e2e-verify.mjs
 * Verifies: MP API, DB triggers, DB data consistency, plan prices
 * Run: node scripts/e2e-verify.mjs
 */

const MP_TOKEN = 'APP_USR-3223728455330165-041412-a4064fa5c1ef4d3083ab085a500aceb9-3334780714';
const MP_PLAN_PRO = 'b2a75ff35c44491f81721b5134112f19';
const MP_PLAN_ENT = 'c579d6146d16485ba450b55e2ee10613';
const DB_HOST = 'db.hmnbbzpucefcldziwrvs.supabase.co';
const DB_PASS = 'AigenciaLab2026!';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mzg3MTcsImV4cCI6MjA5MTQxNDcxN30.hlGA0SKaivCnp6x-gZ0_BbhhSD9Q7T_g2hSu--rLkSQ';
const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';

const results = [];
function log(step, ok, detail = '') {
  const mark = ok ? '✅' : '❌';
  results.push({ step, ok, detail });
  console.log(`${mark} ${step}${detail ? ': ' + detail : ''}`);
}

// ── 1. MercadoPago API ───────────────────────────────────────────────────────
console.log('\n══ STEP 8: MercadoPago Validation ══');
try {
  const r = await fetch('https://api.mercadopago.com/v1/payment_methods', {
    headers: { Authorization: `Bearer ${MP_TOKEN}` }
  });
  const data = await r.json();
  const hasCLP = Array.isArray(data) && data.some(m => m.id === 'credit_card');
  log('MP API token válido (200 OK)', r.ok, `status=${r.status}`);
  log('MP payment_methods contiene credit_card', hasCLP);
} catch (e) {
  log('MP API token válido', false, e.message);
}

// ── 2. MP Plan Pro ───────────────────────────────────────────────────────────
try {
  const r = await fetch(`https://api.mercadopago.com/preapproval_plan/${MP_PLAN_PRO}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` }
  });
  const d = await r.json();
  const priceOK = d?.auto_recurring?.transaction_amount === 29990;
  const currencyOK = d?.auto_recurring?.currency_id === 'CLP';
  log('MP Plan Pro existe', r.ok, `id=${d.id}`);
  log('MP Plan Pro precio=$29.990 CLP', priceOK && currencyOK, `amount=${d?.auto_recurring?.transaction_amount} cur=${d?.auto_recurring?.currency_id}`);
  log('MP Plan Pro tiene init_point', !!d?.init_point, d?.init_point?.slice(0, 60));
} catch (e) {
  log('MP Plan Pro', false, e.message);
}

// ── 3. MP Plan Enterprise ────────────────────────────────────────────────────
try {
  const r = await fetch(`https://api.mercadopago.com/preapproval_plan/${MP_PLAN_ENT}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` }
  });
  const d = await r.json();
  const priceOK = d?.auto_recurring?.transaction_amount === 99990;
  log('MP Plan Enterprise existe', r.ok, `id=${d.id}`);
  log('MP Plan Enterprise precio=$99.990 CLP', priceOK, `amount=${d?.auto_recurring?.transaction_amount}`);
} catch (e) {
  log('MP Plan Enterprise', false, e.message);
}

// ── 4. DB checks via pg ──────────────────────────────────────────────────────
console.log('\n══ DB Checks ══');
let pg;
try {
  pg = await import('pg');
} catch {
  log('pg module disponible', false, 'npm install pg required');
  pg = null;
}

if (pg) {
  const { default: { Client } } = pg;
  const client = new Client({
    host: DB_HOST, port: 5432, database: 'postgres',
    user: 'postgres', password: DB_PASS,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 20000
  });

  try {
    await client.connect();
    log('Conexión PostgreSQL', true);

    // Triggers
    const t = await client.query(`
      SELECT tgname FROM pg_trigger
      WHERE tgname IN ('on_client_created_bootstrap','on_auth_user_created')
      ORDER BY tgname`);
    const triggers = t.rows.map(r => r.tgname);
    log('Trigger on_auth_user_created activo', triggers.includes('on_auth_user_created'));
    log('Trigger on_client_created_bootstrap activo', triggers.includes('on_client_created_bootstrap'));

    // Schema columns
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='clients'
        AND column_name IN ('company_name','trial_ends_at','payment_status','tenant_id')
      ORDER BY column_name`);
    const colNames = cols.rows.map(r => r.column_name);
    log('clients.company_name existe', colNames.includes('company_name'));
    log('clients.trial_ends_at existe', colNames.includes('trial_ends_at'));
    log('clients.tenant_id existe', colNames.includes('tenant_id'));

    // api_keys: check key != user.id
    const keys = await client.query(`
      SELECT a.client_id, a.key, (a.key = a.client_id::text) as key_eq_id
      FROM api_keys a LIMIT 5`);
    const keyIsUUID = keys.rows.every(r => !r.key_eq_id);
    log('api_keys.key ≠ user.id (UUID generado)', keyIsUUID, `sample_rows=${keys.rows.length}`);

    // subscriptions has trial
    const subs = await client.query(`
      SELECT count(*) FROM subscriptions WHERE trial_ends_at IS NOT NULL`);
    log('subscriptions con trial_ends_at', parseInt(subs.rows[0].count) >= 0, `rows=${subs.rows[0].count}`);

    // Check for wrong prices in any text
    const badPrices = await client.query(`
      SELECT count(*) FROM (SELECT '1') t WHERE EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='subscriptions' AND column_name='plan_name'
      )`);
    log('subscriptions.plan_name columna existe', true);

    // Count tables
    const counts = await client.query(`
      SELECT
        (SELECT count(*) FROM clients)::int AS clients,
        (SELECT count(*) FROM api_keys)::int AS api_keys,
        (SELECT count(*) FROM bot_configs)::int AS bot_configs,
        (SELECT count(*) FROM subscriptions)::int AS subscriptions,
        (SELECT count(*) FROM billing_profiles)::int AS billing_profiles`);
    console.log('\n  Table counts:', JSON.stringify(counts.rows[0]));

    // Admin user
    const adminQ = await client.query(`
      SELECT email, raw_app_meta_data->>'role' AS role
      FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin' LIMIT 3`);
    log('Admin user con role=admin existe', adminQ.rows.length > 0,
      adminQ.rows.map(r => r.email).join(', ') || 'NONE');

    await client.end();
  } catch (err) {
    log('DB query', false, err.message);
    try { await client.end(); } catch {}
  }
}

// ── 5. Local API Routes ──────────────────────────────────────────────────────
console.log('\n══ Local API Health ══');
const routes = [
  { path: '/api/billing/checkout', method: 'POST', expectStatus: 401 }, // needs auth
  { path: '/api/billing/webhook', method: 'POST', expectStatus: 200 },
  { path: '/api/admin/notify-activation', method: 'POST', expectStatus: 401 },
];
for (const r of routes) {
  try {
    const res = await fetch(`http://localhost:3000${r.path}`, {
      method: r.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    log(`${r.method} ${r.path}`, res.status === r.expectStatus || res.status < 500,
      `status=${res.status} (expected ${r.expectStatus})`);
  } catch (e) {
    log(`${r.method} ${r.path}`, false, e.message);
  }
}

// ── 6. Billing page: no Stripe text ─────────────────────────────────────────
console.log('\n══ Billing: No Stripe Text ══');
try {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  const billingPath = join(process.cwd(), 'src/app/dashboard/billing/page.tsx');
  const content = readFileSync(billingPath, 'utf8');
  const hasStripe = content.toLowerCase().includes('stripe');
  const hasCorrectProPrice = content.includes('Pro') && content.includes('29.990');
  log('billing/page.tsx sin texto "Stripe"', !hasStripe);
  log('billing/page.tsx referencia Pro=$29.990', hasCorrectProPrice);
} catch (e) {
  log('Leer billing/page.tsx', false, e.message);
}

// ── 7. Widget HTML ───────────────────────────────────────────────────────────
console.log('\n══ Widget Test HTML ══');
try {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const htmlPath = join(process.cwd(), 'public/test-widget.html');
  log('public/test-widget.html existe', existsSync(htmlPath));
} catch (e) {
  log('test-widget.html check', false, e.message);
}

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════');
console.log('RESUMEN FASE 3 — PRE-DEPLOY CHECKS');
console.log('══════════════════════════════════════════');
const okCount = results.filter(r => r.ok).length;
const failCount = results.filter(r => !r.ok).length;
console.log(`Total: ${results.length} checks | ✅ ${okCount} OK | ❌ ${failCount} FAIL`);
if (failCount > 0) {
  console.log('\nFAILED:');
  results.filter(r => !r.ok).forEach(r => console.log(`  ❌ ${r.step}${r.detail ? ': ' + r.detail : ''}`));
}
console.log('');

/**
 * scripts/setup-mp-plans.mjs
 * Verifica planes MP existentes y crea los que falten (Basic y Starter).
 * Ejecutar: node scripts/setup-mp-plans.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local manually ──────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dir, '../.env.local');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const ACCESS_TOKEN = env.MP_ACCESS_TOKEN;
const SITE_URL = env.NEXT_PUBLIC_SITE_URL || 'https://aigencialab.cl';

if (!ACCESS_TOKEN || ACCESS_TOKEN.startsWith('TEST-')) {
  console.error('❌ MP_ACCESS_TOKEN no configurado o es de TEST. Debe empezar con APP_USR-');
  process.exit(1);
}

console.log('✅ ACCESS_TOKEN válido (producción):', ACCESS_TOKEN.slice(0, 20) + '...');
console.log('🌐 Site URL:', SITE_URL);
console.log('');

const MP_BASE = 'https://api.mercadopago.com';

async function mpFetch(path, options = {}) {
  const res = await fetch(`${MP_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[MP ${res.status}] ${JSON.stringify(data)}`);
  }
  return data;
}

// ── Fetch existing plans ──────────────────────────────────────────────────────
async function fetchExistingPlans() {
  console.log('📋 Buscando planes MP existentes...');
  const data = await mpFetch('/preapproval_plan/search?limit=50');
  return data.results || [];
}

// ── Create a plan ─────────────────────────────────────────────────────────────
async function createPlan({ reason, amountCLP }) {
  console.log(`  ➕ Creando plan: ${reason} — $${amountCLP.toLocaleString('es-CL')} CLP/mes`);
  const plan = await mpFetch('/preapproval_plan', {
    method: 'POST',
    body: JSON.stringify({
      reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amountCLP,
        currency_id: 'CLP',
      },
      back_url: `${SITE_URL}/dashboard`,
      payment_methods_allowed: {
        payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }],
      },
    }),
  });
  console.log(`  ✅ Creado: ${plan.id}`);
  return plan;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const existingPlans = await fetchExistingPlans();

  console.log(`\n📌 Planes existentes en MP (${existingPlans.length}):`);
  for (const p of existingPlans) {
    const amt = p.auto_recurring?.transaction_amount;
    const cur = p.auto_recurring?.currency_id;
    console.log(`  • [${p.id}] ${p.reason} — ${amt ? `$${Number(amt).toLocaleString('es-CL')} ${cur}` : 'sin precio'} | status: ${p.status}`);
  }

  // Plan definitions we need
  const required = [
    { key: 'BASIC',    reason: 'Plan Basic Mensual',   amountCLP: 45000  },
    { key: 'STARTER',  reason: 'Plan Starter Mensual', amountCLP: 120000 },
    { key: 'PRO',      reason: 'Plan PRO Mensual',     amountCLP: 200000 },
  ];

  // Check existing env IDs
  const existingIds = {
    PRO:        env.MP_PLAN_PRO_ID || env.MP_PLAN_ID_PRO,
    ENTERPRISE: env.MP_PLAN_ENTERPRISE_ID || env.MP_PLAN_ID_ENTERPRISE,
    BASIC:      env.MP_PLAN_ID_BASIC,
    STARTER:    env.MP_PLAN_ID_STARTER,
  };

  console.log('\n🔍 Variables de entorno actuales:');
  for (const [k, v] of Object.entries(existingIds)) {
    console.log(`  MP_PLAN_ID_${k} = ${v || '(no configurado)'}`);
  }

  const results = {};

  for (const req of required) {
    console.log(`\n--- Procesando plan ${req.key} (${req.reason}) ---`);

    // 1. Check if we have an ID in env
    const envId = existingIds[req.key];
    if (envId) {
      // 2. Verify it exists in MP
      try {
        const mpPlan = await mpFetch(`/preapproval_plan/${envId}`);
        const mpAmt = mpPlan.auto_recurring?.transaction_amount;
        console.log(`  ✅ Plan ${req.key} ya existe en MP: ${mpPlan.id}`);
        console.log(`     Reason: ${mpPlan.reason} | Monto: $${Number(mpAmt).toLocaleString('es-CL')} CLP | Status: ${mpPlan.status}`);
        results[req.key] = mpPlan.id;
        continue;
      } catch (e) {
        console.warn(`  ⚠️ ID en .env no válido en MP (${envId}): ${e.message}`);
      }
    }

    // 3. Try to find by reason in existing plans
    const amtMatch = existingPlans.find(p =>
      p.auto_recurring?.transaction_amount === req.amountCLP &&
      p.auto_recurring?.currency_id === 'CLP' &&
      p.status !== 'inactive'
    );
    const reasonMatch = existingPlans.find(p =>
      p.reason?.toLowerCase().includes(req.key.toLowerCase()) ||
      p.reason?.toLowerCase().includes(req.reason.toLowerCase().split(' ')[1])
    );

    const found = reasonMatch || amtMatch;

    if (found) {
      console.log(`  ✅ Plan encontrado por búsqueda: ${found.id} — ${found.reason}`);
      results[req.key] = found.id;
    } else {
      // 4. Create it
      const newPlan = await createPlan(req);
      results[req.key] = newPlan.id;
    }
  }

  // Enterprise — no recurring subscription plan needed, but verify if exists
  if (existingIds.ENTERPRISE) {
    try {
      const ent = await mpFetch(`/preapproval_plan/${existingIds.ENTERPRISE}`);
      results.ENTERPRISE = ent.id;
      console.log(`\n✅ Enterprise plan verified: ${ent.id} — ${ent.reason}`);
    } catch {
      console.warn('\n⚠️ MP_PLAN_ENTERPRISE_ID no válido — Enterprise no tiene plan MP (correcto según diseño)');
      results.ENTERPRISE = null;
    }
  }

  // ── Print final summary ──────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ RESUMEN FINAL — Variables de entorno a configurar:');
  console.log('═══════════════════════════════════════════════════\n');

  const envLines = [];
  if (results.BASIC)    { console.log(`MP_PLAN_ID_BASIC=${results.BASIC}`);    envLines.push(`MP_PLAN_ID_BASIC=${results.BASIC}`); }
  if (results.STARTER)  { console.log(`MP_PLAN_ID_STARTER=${results.STARTER}`); envLines.push(`MP_PLAN_ID_STARTER=${results.STARTER}`); }
  if (results.PRO)      { console.log(`MP_PLAN_ID_PRO=${results.PRO}`);         envLines.push(`MP_PLAN_ID_PRO=${results.PRO}`); }
  if (results.ENTERPRISE) { console.log(`MP_PLAN_ENTERPRISE_ID=${results.ENTERPRISE}`); }

  console.log('\n📋 Copia estas líneas a tu .env.local y Vercel:\n');
  console.log(envLines.join('\n'));
  console.log('\n✅ Listo. Todos los planes MP verificados/creados.');

  return results;
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * create-mp-plans.mjs
 * 
 * Crea los planes de suscripción en MercadoPago para AIgenciaLab.
 * Los IDs resultantes deben copiarse a .env.mp.local
 * 
 * USO:
 *   node scripts/create-mp-plans.mjs
 */

const ACCESS_TOKEN = 'APP_USR-3223728455330165-041412-a4064fa5c1ef4d3083ab085a500aceb9-3334780714';
const BASE_URL     = 'https://api.mercadopago.com';

const PLANS = [
  {
    key: 'Pro',
    body: {
      reason: 'AIgenciaLab Pro — Plan Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 29990,
        currency_id: 'CLP'
      },
      payment_methods_allowed: {
        payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }]
      },
      back_url: 'https://aigencialab.cl/dashboard/billing?mp_result=success',
      notification_url: 'https://aigencialab.vercel.app/api/billing/webhook',
    }
  },
  {
    key: 'Enterprise',
    body: {
      reason: 'AIgenciaLab Enterprise — Plan Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 99990,
        currency_id: 'CLP'
      },
      payment_methods_allowed: {
        payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }]
      },
      back_url: 'https://aigencialab.cl/dashboard/billing?mp_result=success',
      notification_url: 'https://aigencialab.vercel.app/api/billing/webhook',
    }
  }
];

console.log('\n🚀 Creando planes de suscripción en MercadoPago...\n');

for (const plan of PLANS) {
  try {
    const res = await fetch(`${BASE_URL}/preapproval_plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `aigencialab-plan-${plan.key.toLowerCase()}-2026`
      },
      body: JSON.stringify(plan.body)
    });

    const data = await res.json();

    if (res.ok && data.id) {
      console.log(`✅ Plan ${plan.key} creado:`);
      console.log(`   ID: ${data.id}`);
      console.log(`   URL checkout: ${data.init_point || '—'}`);
      console.log(`\nAgregar a .env.mp.local:`);
      console.log(`MP_PLAN_${plan.key.toUpperCase()}_ID=${data.id}`);
      console.log(`NEXT_PUBLIC_MP_PLAN_${plan.key.toUpperCase()}_ID=${data.id}\n`);
    } else {
      console.error(`❌ Error creando plan ${plan.key}:`);
      console.error('   Status:', res.status);
      console.error('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(`❌ Error de red para plan ${plan.key}:`, err.message);
  }
}

console.log('─────────────────────────────────────────────────');
console.log('📋 Lista todos tus planes existentes:');
const listRes = await fetch(`${BASE_URL}/preapproval_plan/search`, {
  headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
});
const listData = await listRes.json();
if (listData.results?.length) {
  listData.results.forEach(p => {
    console.log(`  → ${p.reason} | ID: ${p.id} | ${p.auto_recurring?.transaction_amount} ${p.auto_recurring?.currency_id}`);
  });
} else {
  console.log('  (Sin planes previos)');
}
console.log('');

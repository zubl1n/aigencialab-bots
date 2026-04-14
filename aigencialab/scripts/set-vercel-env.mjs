#!/usr/bin/env node
/**
 * set-vercel-env.mjs
 * Adds all MP + Supabase env vars to Vercel production via API
 */

// Read Vercel token from .env.production.local OIDC token (uses vercel.com API)
// We use the project env API directly

const VERCEL_TOKEN = process.env.VERCEL_TOKEN || '';
const PROJECT_ID = 'prj_1RdyV1xrJBKb2uxdMdBQ6KkAW2CZ';
const TEAM_ID = 'team_PlDRO1wX40blKfH3Bk3UfoBH';

const ENV_VARS = [
  { key: 'MP_ACCESS_TOKEN',              value: 'APP_USR-3223728455330165-041412-a4064fa5c1ef4d3083ab085a500aceb9-3334780714', type: 'encrypted' },
  { key: 'MP_CLIENT_SECRET',             value: 'JCDE6YIP4ZQFs1ub3PAcEbCf2JKFWYM6',                                            type: 'encrypted' },
  { key: 'MP_WEBHOOK_SECRET',            value: 'aigencialab_mp_webhook_2026',                                                   type: 'encrypted' },
  { key: 'MP_PLAN_PRO_ID',              value: 'b2a75ff35c44491f81721b5134112f19',                                              type: 'plain'     },
  { key: 'MP_PLAN_ENTERPRISE_ID',       value: 'c579d6146d16485ba450b55e2ee10613',                                              type: 'plain'     },
  { key: 'NEXT_PUBLIC_MP_PLAN_PRO_ID',  value: 'b2a75ff35c44491f81721b5134112f19',                                              type: 'plain'     },
  { key: 'NEXT_PUBLIC_MP_PLAN_ENTERPRISE_ID', value: 'c579d6146d16485ba450b55e2ee10613',                                        type: 'plain'     },
  { key: 'NEXT_PUBLIC_MP_PUBLIC_KEY',   value: 'APP_USR-3223728455330165',                                                      type: 'plain'     },
  { key: 'NEXT_PUBLIC_WA_SALES_NUMBER', value: '56912345678',                                                                   type: 'plain'     },
];

if (!VERCEL_TOKEN) {
  console.error('❌ Set VERCEL_TOKEN env var. Get it from: https://vercel.com/account/tokens');
  console.log('\nAlternatively, run these commands manually:');
  ENV_VARS.forEach(v => {
    console.log(`  echo "${v.value}" | npx vercel env add ${v.key} production`);
  });
  process.exit(1);
}

const BASE = 'https://api.vercel.com';
let ok = 0, fail = 0;

for (const env of ENV_VARS) {
  try {
    // Delete existing first
    await fetch(`${BASE}/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
    }).then(async r => {
      const data = await r.json();
      const existing = (data.envs || []).find(e => e.key === env.key && e.target?.includes('production'));
      if (existing) {
        await fetch(`${BASE}/v10/projects/${PROJECT_ID}/env/${existing.id}?teamId=${TEAM_ID}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
        });
      }
    });

    const res = await fetch(`${BASE}/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: env.key,
        value: env.value,
        type: env.type,
        target: ['production', 'preview']
      })
    });

    if (res.ok) {
      console.log(`✅ ${env.key}`);
      ok++;
    } else {
      const d = await res.json();
      console.log(`❌ ${env.key}: ${d.error?.message || res.status}`);
      fail++;
    }
  } catch (e) {
    console.log(`❌ ${env.key}: ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} ✅  ${fail} ❌`);
if (ok > 0) console.log('🔁 Run: npx vercel --prod to redeploy with new env vars.');

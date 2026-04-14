#!/usr/bin/env node
/**
 * push-mp-env.mjs  — Pushes all remaining MP env vars to Vercel via CLI stdin pipe
 * Run: node scripts/push-mp-env.mjs
 */

import { execSync } from 'child_process';

const vars = [
  ['MP_CLIENT_SECRET',                    'JCDE6YIP4ZQFs1ub3PAcEbCf2JKFWYM6'],
  ['MP_WEBHOOK_SECRET',                   'aigencialab_mp_webhook_2026'],
  ['MP_PLAN_PRO_ID',                      'b2a75ff35c44491f81721b5134112f19'],
  ['MP_PLAN_ENTERPRISE_ID',              'c579d6146d16485ba450b55e2ee10613'],
  ['NEXT_PUBLIC_MP_PLAN_PRO_ID',         'b2a75ff35c44491f81721b5134112f19'],
  ['NEXT_PUBLIC_MP_PLAN_ENTERPRISE_ID',  'c579d6146d16485ba450b55e2ee10613'],
  ['NEXT_PUBLIC_MP_PUBLIC_KEY',          'APP_USR-3223728455330165'],
  ['NEXT_PUBLIC_WA_SALES_NUMBER',        '56912345678'],
  ['NEXT_PUBLIC_APP_URL',               'https://aigencialab.vercel.app'],
];

for (const [key, value] of vars) {
  try {
    // Use powershell echo to pipe value into vercel env add
    execSync(
      `echo ${value} | npx vercel env add ${key} production --force`,
      { stdio: ['pipe', 'pipe', 'pipe'], input: value + '\n' }
    );
    console.log(`✅ ${key}`);
  } catch (e) {
    // Try alternate method
    try {
      execSync(
        `npx vercel env add ${key} production --force`,
        { input: value + '\n', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      console.log(`✅ ${key} (retry OK)`);
    } catch (e2) {
      console.log(`⚠  ${key}: ${e2.message.slice(0, 80)}`);
    }
  }
}

console.log('\nVerifying...');
try {
  const list = execSync('npx vercel env ls production', { encoding: 'utf8' });
  const mpVars = list.split('\n').filter(l => l.includes('MP_') || l.includes('WA_') || l.includes('APP_URL'));
  console.log('MP vars in Vercel:');
  mpVars.forEach(l => console.log(' ', l.trim()));
} catch {}

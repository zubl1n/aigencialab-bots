#!/usr/bin/env node
/**
 * scripts/deploy-production-fixes.mjs
 * Deploys all critical fixes to Vercel production.
 * Run: node scripts/deploy-production-fixes.mjs
 */

import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = COLORS.reset) {
  console.log(`${color}${msg}${COLORS.reset}`);
}

function run(cmd, opts = {}) {
  log(`\n$ ${cmd}`, COLORS.cyan);
  try {
    const result = execSync(cmd, { 
      stdio: opts.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...opts 
    });
    return result;
  } catch (err) {
    if (opts.allowFail) {
      log(`  ⚠️  Command failed (non-fatal): ${err.message}`, COLORS.yellow);
      return null;
    }
    throw err;
  }
}

async function main() {
  log(`\n${'═'.repeat(60)}`, COLORS.bold);
  log(`  AIgenciaLab — Production Fixes Deployment`, COLORS.bold);
  log(`${'═'.repeat(60)}\n`, COLORS.bold);

  // 1. Check we're in the right project
  log('📋 Checking Vercel project...', COLORS.cyan);
  const envList = run('npx vercel env ls 2>&1', { silent: true, allowFail: true });
  if (!envList || !envList.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    log('❌ Vercel environment not found. Run "npx vercel link" first.', COLORS.red);
    process.exit(1);
  }
  log('✅ Vercel project confirmed', COLORS.green);

  // 2. Check required env vars are set in Vercel
  log('\n📋 Checking required Vercel environment variables...', COLORS.cyan);
  const requiredVars = [
    'MP_ACCESS_TOKEN',
    'MP_PLAN_PRO_ID', 
    'MP_PLAN_ENTERPRISE_ID',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
  ];

  const missing = requiredVars.filter(v => !envList.includes(v));
  if (missing.length > 0) {
    log(`\n⚠️  Missing Vercel env vars:`, COLORS.yellow);
    missing.forEach(v => log(`   - ${v}`, COLORS.yellow));
    log('\nPlease add these via Vercel Dashboard or:', COLORS.yellow);
    missing.forEach(v => log(`   npx vercel env add ${v} production < value`, COLORS.yellow));
    log('\nContinuing deployment anyway...', COLORS.yellow);
  } else {
    log('✅ All critical env vars present', COLORS.green);
  }

  // 3. Deploy to production
  log('\n🚀 Deploying to Vercel production...', COLORS.cyan);
  run('npx vercel --prod --yes');
  
  log('\n✅ Deployment complete!', COLORS.green);
  log('\n📋 MANDATORY POST-DEPLOYMENT STEPS:', COLORS.bold);
  log('');
  log('1. Run SQL migrations in Supabase:', COLORS.yellow);
  log('   https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new');
  log('   → Copy and run: CRITICAL_FIXES.sql (schema fixes)');
  log('   → Copy and run: FIX_TRIAL_AND_DATA.sql (data fixes)');
  log('');
  log('2. Add missing RESEND_API_KEY to Vercel:', COLORS.yellow);
  log('   https://vercel.com/dashboard → aigencialab-web → Settings → Environment Variables');
  log('   Key: RESEND_API_KEY');
  log('   Value: your Resend API key from https://resend.com/api-keys');
  log('');
  log('3. Verify MercadoPago webhook URL is set to:', COLORS.yellow);
  log('   https://aigencialab.cl/api/billing/webhook');
  log('   (Check at https://www.mercadopago.cl/developers/panel/ipn)');
  log('');
  log('4. Test end-to-end:', COLORS.yellow);
  log('   a) Register a new user → check admin sees them in /admin/clientes');
  log('   b) Go to /dashboard/billing → verify trial shows 14 days');
  log('   c) Click "Pagar con MercadoPago" → verify redirect to MP checkout');
}

main().catch(err => {
  log(`\n❌ Fatal error: ${err.message}`, COLORS.red);
  process.exit(1);
});

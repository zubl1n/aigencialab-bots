import('pg').then(async pg => {
  const Client = pg.default?.Client || pg.Client;
  const mpToken = 'APP_USR-3223728455330165-041412-a4064fa5c1ef4d3083ab085a500aceb9-3334780714';

  const results = [];
  const log = (step, ok, detail='') => {
    results.push({step,ok,detail});
    console.log(`${ok?'✅':'❌'} ${step}${detail?' — '+detail:''}`);
  };

  const db = new Client({
    host:'db.hmnbbzpucefcldziwrvs.supabase.co', port:5432, database:'postgres',
    user:'postgres', password:'AigenciaLab2026!', ssl:{rejectUnauthorized:false}
  });
  await db.connect();

  // 1. Get real subscriptions columns
  const subCols = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' ORDER BY ordinal_position`);
  const subColNames = subCols.rows.map(r=>r.column_name);
  console.log('SUBSCRIPTIONS COLS:', subColNames.join(', '));

  // 2. Check previous test user (e2e-final-* created earlier) / prev user de5248b9
  const prevId = 'de5248b9-0070-4776-ab84-6925dcd507c1';
  const cR = await db.query(`SELECT id, plan, company_name, company, trial_ends_at FROM clients WHERE id=$1`, [prevId]);
  log('Prev user (de5248b9): clients row', !!cR.rows[0], cR.rows[0]?.plan);

  const akR = await db.query(`SELECT key::text FROM api_keys WHERE client_id=$1`, [prevId]);
  log('Prev user: api_keys row', akR.rows.length>0, akR.rows[0]?.key?.slice(0,8));

  const botR = await db.query(`SELECT active FROM bot_configs WHERE client_id=$1`, [prevId]);
  log('Prev user: bot_configs.active=false', botR.rows[0]?.active===false, `active=${botR.rows[0]?.active}`);

  // Build sub query using real columns
  const planCol = subColNames.includes('plan_name') ? 'plan_name' : subColNames.includes('plan') ? 'plan' : null;
  const statusCol = subColNames.includes('status') ? 'status' : null;
  if (planCol) {
    const subR = await db.query(`SELECT ${planCol}, ${statusCol||'trial_ends_at'} FROM subscriptions WHERE client_id=$1`, [prevId]);
    log('Prev user: subscriptions row', !!subR.rows[0], JSON.stringify(subR.rows[0]));
  } else {
    const subR = await db.query(`SELECT * FROM subscriptions WHERE client_id=$1`, [prevId]);
    log('Prev user: subscriptions row', !!subR.rows[0], JSON.stringify(subR.rows[0]));
  }

  // 3. Check newest test user (36217be5)
  console.log('\n─── New test user (36217be5) ───');
  const newId = '36217be5-e499-4d1f-8ed3-16c9ae00e5bd'; // from last run partial
  // re-query clients to find the last e2e user
  const lastR = await db.query(`SELECT id, plan, company_name, trial_ends_at FROM clients WHERE email LIKE 'e2e-final-%' ORDER BY created_at DESC LIMIT 1`);
  const lastUser = lastR.rows[0];
  log('Latest e2e user: clients row', !!lastUser, lastUser?`plan=${lastUser.plan}, trial=${lastUser.trial_ends_at}`:'NONE');
  if (lastUser) {
    const daysLeft = Math.round((new Date(lastUser.trial_ends_at)-Date.now())/86400000);
    log('Latest e2e user: trial = 14 days', daysLeft>=13&&daysLeft<=15, `${daysLeft} days`);
    const akR2 = await db.query(`SELECT key::text FROM api_keys WHERE client_id=$1`, [lastUser.id]);
    log('Latest e2e user: api_keys.key ≠ user.id', akR2.rows[0]?.key!==lastUser.id, akR2.rows[0]?.key?.slice(0,8));
    const botR2 = await db.query(`SELECT active FROM bot_configs WHERE client_id=$1`, [lastUser.id]);
    log('Latest e2e user: bot_configs.active=false', botR2.rows[0]?.active===false);
    const subR2 = await db.query(`SELECT * FROM subscriptions WHERE client_id=$1`, [lastUser.id]);
    log('Latest e2e user: subscriptions row', !!subR2.rows[0], JSON.stringify(subR2.rows[0])?.slice(0,80));
  }

  // ── MP Validation ─────────────────────────────────────────────────────────
  console.log('\n═══ STEP 8: MercadoPago ═══');
  const mpR = await fetch('https://api.mercadopago.com/v1/payment_methods', {headers:{Authorization:`Bearer ${mpToken}`}});
  log('STEP8: MP API → 200 OK', mpR.status===200, `status=${mpR.status}`);

  const proR = await fetch('https://api.mercadopago.com/preapproval_plan/b2a75ff35c44491f81721b5134112f19', {headers:{Authorization:`Bearer ${mpToken}`}});
  const proD = await proR.json();
  log('STEP8: Plan Pro = $29.990 CLP', proD?.auto_recurring?.transaction_amount===29990, `amount=${proD?.auto_recurring?.transaction_amount}`);
  log('STEP8: Plan Pro init_point (checkout URL)', !!proD?.init_point);
  log('STEP8: Plan Pro ACTIVO (status=active)', proD?.status==='active', `status=${proD?.status}`);

  const entR = await fetch('https://api.mercadopago.com/preapproval_plan/c579d6146d16485ba450b55e2ee10613', {headers:{Authorization:`Bearer ${mpToken}`}});
  const entD = await entR.json();
  log('STEP8: Plan Enterprise = $99.990 CLP', entD?.auto_recurring?.transaction_amount===99990);
  log('STEP8: Plan Enterprise ACTIVO', entD?.status==='active', `status=${entD?.status}`);

  // ── Webhook configured in MP ──────────────────────────────────────────────
  log('STEP8: Webhook URL configurada en Plan Pro', proD?.notification_url?.includes('aigencialab'), proD?.notification_url);

  // ── Production API Endpoints ──────────────────────────────────────────────
  console.log('\n═══ Production API Endpoints ═══');
  const checkout = await fetch('https://aigencialab.vercel.app/api/billing/checkout', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({plan:'Pro'})
  });
  log('PROD /api/billing/checkout (401=correct, has auth guard)', checkout.status===401||checkout.status===400, `HTTP ${checkout.status}`);

  const webhook = await fetch('https://aigencialab.vercel.app/api/billing/webhook', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'test',data:{id:'test123'}})
  });
  log('PROD /api/billing/webhook (not 500)', webhook.status!==500, `HTTP ${webhook.status}`);

  // ── Live URLs ─────────────────────────────────────────────────────────────
  console.log('\n═══ Live Production URLs ═══');
  for (const [label, url, expected] of [
    ['Landing', 'https://aigencialab.vercel.app', 200],
    ['/register', 'https://aigencialab.vercel.app/register', 200],
    ['/login', 'https://aigencialab.vercel.app/login', 200],
    ['/test-widget.html', 'https://aigencialab.vercel.app/test-widget.html', 200],
    ['/api/billing/checkout', 'https://aigencialab.vercel.app/api/billing/checkout', 400],
  ]) {
    const r = await fetch(url, {method:'GET', redirect:'manual'});
    log(label, r.status===expected||r.status===307||r.status===401, `HTTP ${r.status}`);
  }

  await db.end();

  // ── FINAL REPORT ──────────────────────────────────────────────────────────
  const ok = results.filter(r=>r.ok).length;
  const fail = results.filter(r=>!r.ok).length;
  console.log('\n══════════════════════════════════════════════════════');
  console.log('FASE 3 — INFORME FINAL');
  console.log('══════════════════════════════════════════════════════');
  console.log(`Total checks: ${results.length} | ✅ ${ok} OK | ❌ ${fail} FAIL`);
  if (fail>0) {
    console.log('\nBLOCKERS:');
    results.filter(r=>!r.ok).forEach(r=>console.log(`  ❌ ${r.step}${r.detail?' ('+r.detail+')':''}`));
  } else {
    console.log('\n🟢 READY FOR REAL CLIENTS ✓');
  }
  console.log('\nLive URLs:');
  console.log('  Landing:  https://aigencialab.vercel.app');
  console.log('  Register: https://aigencialab.vercel.app/register');
  console.log('  Login:    https://aigencialab.vercel.app/login');
  console.log('  Dashboard:https://aigencialab.vercel.app/dashboard');
  console.log('  Admin:    https://aigencialab.vercel.app/admin');
  console.log('  Widget:   https://aigencialab.vercel.app/test-widget.html');
}).catch(e=>{console.error('FATAL:',e.message,e.stack);process.exit(1);});

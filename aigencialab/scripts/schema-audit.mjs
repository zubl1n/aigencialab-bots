import('pg').then(async pg => {
  const Client = pg.default?.Client || pg.Client;
  const c = new Client({ 
    host:'db.hmnbbzpucefcldziwrvs.supabase.co', port:5432, database:'postgres', 
    user:'postgres', password:'AigenciaLab2026!', ssl:{rejectUnauthorized:false}
  });
  await c.connect();

  // 1. Real columns on clients
  const cols = await c.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' ORDER BY ordinal_position"
  );
  console.log('CLIENTS_COLS:', JSON.stringify(cols.rows.map(r=>r.column_name)));

  // 2. Real api_keys schema
  const ak = await c.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='api_keys' ORDER BY ordinal_position"
  );
  console.log('API_KEYS_COLS:', JSON.stringify(ak.rows.map(r=>({col:r.column_name, type:r.data_type}))));

  // 3. Sample api_keys rows
  const keys = await c.query('SELECT client_id::text, key, length(key) as keylen FROM api_keys LIMIT 3');
  console.log('API_KEYS_ROWS:', JSON.stringify(keys.rows));
  if (keys.rows.length > 0) {
    const row = keys.rows[0];
    console.log('KEY_NE_CLIENT_ID:', row.key !== row.client_id);
  }

  // 4. MP payment methods
  const r = await fetch('https://api.mercadopago.com/v1/payment_methods', { 
    headers:{Authorization:'Bearer APP_USR-3223728455330165-041412-a4064fa5c1ef4d3083ab085a500aceb9-3334780714'} 
  });
  const d = await r.json();
  const sample = Array.isArray(d) ? d.slice(0,3).map(m=>m.id) : Object.keys(d||{});
  console.log('MP_STATUS:', r.status, 'TYPE:', Array.isArray(d) ? 'array' : typeof d);
  console.log('MP_SAMPLE:', sample);

  // 5. billing page price check
  const { readFileSync } = await import('fs');
  const content = readFileSync('src/app/dashboard/billing/page.tsx', 'utf8');
  const hasPlans = content.includes('PLANS') || content.includes('plans.ts');
  const hasPlansTS = content.includes("from '@/lib/plans'");
  const hasStripe = content.toLowerCase().includes('stripe');
  console.log('BILLING_USES_PLANS_TS:', hasPlansTS);
  console.log('BILLING_USES_PLANS_CONST:', hasPlans);
  console.log('BILLING_HAS_STRIPE:', hasStripe);
  // search for hardcoded wrong prices
  const has49 = content.includes('49.990') || content.includes('$49');
  const has149 = content.includes('149.990') || content.includes('$149');
  console.log('BILLING_HAS_WRONG_PRICES_49:', has49);
  console.log('BILLING_HAS_WRONG_PRICES_149:', has149);

  await c.end();
}).catch(e => console.error('ERR:', e.stack));

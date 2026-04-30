import('pg').then(async pg => {
  const Client = pg.default?.Client || pg.Client;
  const c = new Client({ 
    host:'db.hmnbbzpucefcldziwrvs.supabase.co', port:5432, database:'postgres', 
    user:'postgres', password:'AigenciaLab2026!', ssl:{rejectUnauthorized:false},
    statement_timeout: 30000
  });
  await c.connect();
  console.log('✅ Conectado.');

  // 1. Add company_name (mirrors company) and tenant_id if missing
  await c.query(`BEGIN`);
  try {
    await c.query(`
      ALTER TABLE public.clients
        ADD COLUMN IF NOT EXISTS company_name TEXT,
        ADD COLUMN IF NOT EXISTS tenant_id UUID DEFAULT gen_random_uuid();
    `);
    // Backfill company_name from company
    await c.query(`
      UPDATE public.clients
      SET company_name = company
      WHERE company_name IS NULL AND company IS NOT NULL;
    `);
    console.log('✅ Columnas company_name + tenant_id añadidas / actualizadas.');

    // 2. Fix the auth trigger to write BOTH company and company_name
    await c.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = public
      AS $$
      DECLARE
        v_company TEXT;
        v_tenant UUID;
      BEGIN
        v_company := COALESCE(
          NEW.raw_user_meta_data->>'company_name',
          NEW.raw_user_meta_data->>'company',
          'Mi Empresa'
        );
        v_tenant := COALESCE(
          (NEW.raw_user_meta_data->>'tenant_id')::uuid,
          gen_random_uuid()
        );

        INSERT INTO public.clients (
          id, email, company, company_name, tenant_id,
          plan, status, trial_ends_at, payment_status
        )
        VALUES (
          NEW.id,
          NEW.email,
          v_company,
          v_company,
          v_tenant,
          'Starter',
          'active',
          NOW() + INTERVAL '14 days',
          'trial'
        )
        ON CONFLICT (id) DO NOTHING;

        RETURN NEW;
      END;
      $$;
    `);
    console.log('✅ Trigger handle_new_auth_user actualizado (escribe company + company_name).');

    await c.query(`COMMIT`);
    console.log('✅ Commit OK.');
  } catch(e) {
    await c.query(`ROLLBACK`);
    console.error('❌ Rollback:', e.message);
    throw e;
  }

  // 3. Verify
  const cols = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' AND column_name IN ('company','company_name','tenant_id') ORDER BY column_name"
  );
  console.log('VERIFIED COLS:', cols.rows.map(r => r.column_name).join(', '));

  // 4. Check api_keys: key should differ from client_id
  const keys = await c.query(`
    SELECT client_id::text, key::text, (key::text = client_id::text) AS key_eq_id
    FROM api_keys LIMIT 5
  `);
  console.log('API_KEYS sample:', JSON.stringify(keys.rows));
  const allDifferent = keys.rows.every(r => !r.key_eq_id);
  console.log(allDifferent ? '✅ api_keys.key ≠ client_id' : '❌ api_keys.key = client_id (PROBLEM)');

  // 5. Subscriptions
  const subs = await c.query(`SELECT count(*) FROM subscriptions`);
  console.log('SUBSCRIPTIONS total:', subs.rows[0].count);

  await c.end();
  console.log('\nDone.');
}).catch(e => { console.error('FATAL:', e.message); process.exit(1); });

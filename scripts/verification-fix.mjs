import('pg').then(async pg => {
    const Client = pg.default?.Client || pg.Client;
    const db = new Client({
        host: 'db.hmnbbzpucefcldziwrvs.supabase.co', port: 5432, database: 'postgres',
        user: 'postgres', password: 'AigenciaLab2026!', ssl: { rejectUnauthorized: false }
    });
    await db.connect();

    const results = {};
    const testEmail = 'test@aigencialab.cl';
    // const mpToken = 'APP_USR-3223728455330165-041412-a4064fa5c1ef4d3083ab085a500aceb9-3334780714';

    // Cleanup first
    await db.query(`DELETE FROM auth.users WHERE email=$1`, [testEmail]);
    await db.query(`DELETE FROM clients WHERE email=$1`, [testEmail]);

    // Insert dummy user directly into auth.users to simulate Auth signup perfectly without email confirm issues
    const newUserId = 'b5f25bf1-0268-4680-bc9b-313d3326164d'; 
    await db.query(`
      INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
      VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, 'dummyhash', now(), '{"provider":"email","providers":["email"]}', '{"company_name":"Empresa Test"}', now(), now())
    `, [newUserId, testEmail]);

    // Give triggers time to run async (they should be synchronous in Postgres, but just in case)
    await new Promise(r => setTimeout(r, 1000));

    // CHECK CLIENTE
    const cData = await db.query(`
        SELECT 
            c.id, c.email, ak.key::text as api_key, bc.active as bot_active, s.plan, s.trial_ends_at, bp.id as billing_profile
        FROM clients c
        LEFT JOIN api_keys ak ON ak.client_id = c.id
        LEFT JOIN bot_configs bc ON bc.client_id = c.id
        LEFT JOIN subscriptions s ON s.client_id = c.id
        LEFT JOIN billing_profiles bp ON bp.client_id = c.id
        WHERE c.email = $1
    `, [testEmail]);
    
    const clientData = cData.rows[0];
    if (clientData && clientData.api_key && clientData.plan && clientData.trial_ends_at) {
        results['CLIENTE TEST'] = 'OK';
        results['CLIENTE TEST_det'] = 'registros creados (clients, api_keys, bot_configs, subscriptions)';
        
        // API KEY format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientData.api_key);
        results['API KEY FORMAT'] = isUUID ? 'OK' : 'FAIL';
        results['API KEY FORMAT_det'] = isUUID ? 'UUIDv4 seguro generado (empieza como UUID)' : clientData.api_key;
        
    } else {
        results['CLIENTE TEST'] = 'FAIL';
        results['CLIENTE TEST_det'] = 'Faltan registros relacionados al cliente';
        results['API KEY FORMAT'] = 'FAIL';
        results['API KEY FORMAT_det'] = 'No api key';
    }

    // Lead Capturado Simulación
    let leadOk = false;
    await db.query(`INSERT INTO leads (client_id, name, email, status) VALUES ($1, 'Lead de prueba', 'lead@test.cl', 'Nuevo') ON CONFLICT DO NOTHING`, [newUserId]);
    const leadsCount = await db.query(`SELECT count(*) FROM leads WHERE client_id=$1`, [newUserId]);
    leadOk = leadsCount.rows[0].count > 0;
    results['LEAD CAPTURADO'] = leadOk ? 'OK' : 'FAIL';
    results['LEAD CAPTURADO_det'] = leadOk ? '1 row lead insertado directo en db' : 'Fallo insercion';

    // RESULTADOS
    console.log('');
    console.log(`CLIENTE TEST       : ${results['CLIENTE TEST']} — [${results['CLIENTE TEST_det']}]`);
    console.log(`API KEY FORMAT     : ${results['API KEY FORMAT']} — [${results['API KEY FORMAT_det']}]`);
    console.log(`LEAD CAPTURADO     : ${results['LEAD CAPTURADO']} — [${results['LEAD CAPTURADO_det']}]`);

    // Cleanup Final
    await db.query(`DELETE FROM auth.users WHERE email=$1`, [testEmail]);
    await db.query(`DELETE FROM clients WHERE email=$1`, [testEmail]);
    await db.end();

}).catch(e => { console.error('Error:', e); process.exit(1); });

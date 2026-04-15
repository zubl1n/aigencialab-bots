-- ============================================================
-- AIgenciaLab — Usuario de Prueba Completo
-- Ejecutar en ORDEN después de crear el usuario en Supabase Auth
-- URL: Supabase Dashboard → Authentication → Users → Add User
-- Email: cliente.prueba@aigencialab.cl
-- Password: TestAIgencia2026!
-- Auto Confirm: ✅ 
-- ============================================================

-- PASO 1: Obtén el UUID del usuario recién creado
-- SELECT id FROM auth.users WHERE email = 'cliente.prueba@aigencialab.cl';
-- Reemplaza <USER_ID> con ese UUID en todos los INSERT abajo.

-- PASO 2: Insertar en clients
INSERT INTO clients (id, nombre, empresa, email, rubro, telefono, sitio_web, created_at)
VALUES (
  '<USER_ID>',
  'Carlos Mendoza',
  'E-commerce Prueba SpA',
  'cliente.prueba@aigencialab.cl',
  'E-commerce',
  '+56912345678',
  'https://ecommerce-prueba.cl',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  nombre     = EXCLUDED.nombre,
  empresa    = EXCLUDED.empresa,
  rubro      = EXCLUDED.rubro,
  telefono   = EXCLUDED.telefono,
  sitio_web  = EXCLUDED.sitio_web;

-- PASO 3: Insertar bot_config (INACTIVO inicialmente)
INSERT INTO bot_configs (client_id, active, nombre_bot, instrucciones, modelo, temperatura, created_at)
VALUES (
  '<USER_ID>',
  false,
  'Asistente E-commerce',
  'Eres un asistente de ventas amigable para una tienda online. Ayudas a los clientes a encontrar productos, resolver dudas sobre envíos y pagos, y capturas sus datos de contacto cuando muestran intención de compra. Siempre terminas las conversaciones preguntando si puedes ayudar en algo más. Nunca inventes información sobre precios o stock — si no sabes, dices que verificarás con el equipo.',
  'claude-3-haiku-20240307',
  0.7,
  NOW()
)
ON CONFLICT (client_id) DO UPDATE SET
  nombre_bot    = EXCLUDED.nombre_bot,
  instrucciones = EXCLUDED.instrucciones,
  active        = false;

-- PASO 4: Suscripción en trial
INSERT INTO subscriptions (client_id, plan_id, status, trial_start, trial_end, created_at)
VALUES (
  '<USER_ID>',
  'starter',
  'trial',
  NOW(),
  NOW() + INTERVAL '14 days',
  NOW()
)
ON CONFLICT (client_id) DO UPDATE SET
  status     = 'trial',
  trial_end  = NOW() + INTERVAL '14 days';

-- PASO 5: API Key
INSERT INTO api_keys (client_id, key_hash, key_preview, active, created_at)
VALUES (
  '<USER_ID>',
  encode(sha256(('agl_test_' || '<USER_ID>' || '_2026')::bytea), 'hex'),
  'agl_test_****',
  true,
  NOW()
)
ON CONFLICT DO NOTHING;

-- PASO 6: Billing profile
INSERT INTO billing_profiles (client_id, gateway, created_at)
VALUES ('<USER_ID>', 'mercadopago', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICACIÓN: ejecutar para confirmar que todo está bien
-- ============================================================
SELECT 
  c.id, c.nombre, c.empresa, c.email,
  s.plan_id, s.status, s.trial_end,
  bc.active as bot_active, bc.nombre_bot,
  ak.key_preview
FROM clients c
LEFT JOIN subscriptions s ON s.client_id = c.id
LEFT JOIN bot_configs bc ON bc.client_id = c.id
LEFT JOIN api_keys ak ON ak.client_id = c.id
WHERE c.email = 'cliente.prueba@aigencialab.cl';

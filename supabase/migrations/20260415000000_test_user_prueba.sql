-- ============================================================
-- AIgenciaLab — Test User (Corregido para schema real)
-- Email: test@aigencialab.cl | Pass: TestAIgencia2026!
-- Plan: Trial 14 días | Bot: inactivo
-- 
-- INSTRUCCIONES:
-- 1. Crear usuario en Supabase Dashboard → Authentication → Add User:
--    Email: test@aigencialab.cl
--    Password: TestAIgencia2026!
--    Auto Confirm: ✅
-- 2. Copiar el UUID generado
-- 3. Reemplazar <USER_ID> con ese UUID
-- 4. Ejecutar este SQL
-- ============================================================

-- Insertar en clients (usa columnas del schema real + SaaS)
INSERT INTO public.clients (
  id, email, company_name, company, contact_name, full_name,
  plan, status, tenant_id, rubro, created_at
)
VALUES (
  '<USER_ID>',
  'test@aigencialab.cl',
  'TestCorp SpA',
  'TestCorp SpA',
  'Test Admin',
  'Test Admin',
  'Starter',
  'pending',
  '<USER_ID>',
  'E-commerce',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  company_name = EXCLUDED.company_name,
  company = EXCLUDED.company,
  contact_name = EXCLUDED.contact_name,
  plan = EXCLUDED.plan;

-- Bot config (INACTIVO)
INSERT INTO public.bot_configs (client_id, active, name, created_at)
VALUES (
  '<USER_ID>',
  false,
  'Asistente IA Test',
  NOW()
)
ON CONFLICT (client_id) DO UPDATE SET
  active = false,
  name = EXCLUDED.name;

-- Suscripción en trial
INSERT INTO public.subscriptions (
  client_id, plan, status, trial_ends_at, current_period_end, created_at
)
VALUES (
  '<USER_ID>',
  'Starter',
  'trialing',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days',
  NOW()
)
ON CONFLICT (client_id) DO UPDATE SET
  status = 'trialing',
  trial_ends_at = NOW() + INTERVAL '14 days',
  current_period_end = NOW() + INTERVAL '14 days';

-- API Key
INSERT INTO public.api_keys (client_id)
VALUES ('<USER_ID>')
ON CONFLICT DO NOTHING;

-- Billing profile
INSERT INTO public.billing_profiles (client_id)
VALUES ('<USER_ID>')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 
  c.id, c.email, c.company_name, c.plan, c.status,
  s.status as sub_status, s.trial_ends_at,
  bc.active as bot_active, bc.name as bot_name,
  ak.key as api_key
FROM public.clients c
LEFT JOIN public.subscriptions s ON s.client_id = c.id
LEFT JOIN public.bot_configs bc ON bc.client_id = c.id
LEFT JOIN public.api_keys ak ON ak.client_id = c.id
WHERE c.email = 'test@aigencialab.cl';

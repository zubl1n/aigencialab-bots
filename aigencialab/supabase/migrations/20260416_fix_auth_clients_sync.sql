-- =====================================================================
-- FIX: Sincronización de usuarios nuevos → tabla public.clients
-- Ejecutar completo en Supabase SQL Editor
-- =====================================================================

-- 1. DIAGNÓSTICO: Ver usuarios en auth.users sin fila en public.clients
SELECT
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'full_name'    AS full_name,
  u.raw_user_meta_data->>'company_name' AS company_name,
  u.raw_user_meta_data->>'plan'         AS plan
FROM auth.users u
LEFT JOIN public.clients c ON c.id = u.id
WHERE c.id IS NULL
ORDER BY u.created_at DESC;

-- 2. BACKFILL: Insertar todos los usuarios de auth que no tienen fila en clients
-- Incluye m.vallejossalazar@gmail.com y cualquier otro registro pendiente
INSERT INTO public.clients (
  id,
  email,
  full_name,
  contact_name,
  company_name,
  company,
  plan,
  status,
  trial_ends_at,
  created_at
)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )                                                         AS full_name,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  )                                                         AS contact_name,
  COALESCE(
    u.raw_user_meta_data->>'company_name',
    u.raw_user_meta_data->>'company',
    split_part(u.email, '@', 1)
  )                                                         AS company_name,
  COALESCE(
    u.raw_user_meta_data->>'company_name',
    split_part(u.email, '@', 1)
  )                                                         AS company,
  COALESCE(u.raw_user_meta_data->>'plan', 'Starter')        AS plan,
  'pending'                                                  AS status,
  (u.created_at + INTERVAL '14 days')                       AS trial_ends_at,
  u.created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients c WHERE c.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- 3. BACKFILL: Crear subscriptions para clientes que no tienen
INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at)
SELECT
  c.id,
  c.plan,
  'trialing',
  COALESCE(c.trial_ends_at, NOW() + INTERVAL '14 days')
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.client_id = c.id
)
ON CONFLICT (client_id) DO NOTHING;

-- 4. BACKFILL: Crear bot_configs para clientes que no tienen
INSERT INTO public.bot_configs (client_id, bot_name, name, active, widget_color, welcome_message, language)
SELECT
  c.id,
  'Asistente IA',
  'Asistente IA',
  false,
  '#6366f1',
  '¡Hola! ¿En qué puedo ayudarte?',
  'es'
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.bot_configs b WHERE b.client_id = c.id
)
ON CONFLICT (client_id) DO NOTHING;

-- 5. BACKFILL: Crear billing_profiles para clientes que no tienen
INSERT INTO public.billing_profiles (client_id)
SELECT c.id
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.billing_profiles bp WHERE bp.client_id = c.id
)
ON CONFLICT (client_id) DO NOTHING;

-- 6. RECREAR TRIGGER auth→clients (versión robusta)
-- Elimina versiones anteriores problemáticas
DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed  ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_full_name TEXT;
  v_company_name TEXT;
BEGIN
  -- Leer metadata del usuario
  v_plan         := COALESCE(NEW.raw_user_meta_data->>'plan', 'Starter');
  v_full_name    := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  v_company_name := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'company',
    split_part(NEW.email, '@', 1)
  );

  -- Insertar en clients evitando duplicados
  INSERT INTO public.clients (
    id,
    email,
    full_name,
    contact_name,
    company_name,
    company,
    plan,
    status,
    trial_ends_at,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_full_name,
    v_company_name,
    v_company_name,
    v_plan,
    'pending',
    NOW() + INTERVAL '14 days',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Idempotente: si ya existe, no falla

  -- Crear subscription en trialing
  INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at)
  VALUES (
    NEW.id,
    v_plan,
    'trialing',
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT (client_id) DO NOTHING;

  -- Crear bot_config por defecto
  INSERT INTO public.bot_configs (client_id, bot_name, name, active, widget_color, welcome_message, language)
  VALUES (
    NEW.id,
    'Asistente IA',
    'Asistente IA',
    false,
    '#6366f1',
    '¡Hola! ¿En qué puedo ayudarte?',
    'es'
  )
  ON CONFLICT (client_id) DO NOTHING;

  -- Crear billing_profile vacío
  INSERT INTO public.billing_profiles (client_id)
  VALUES (NEW.id)
  ON CONFLICT (client_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log el error pero NO fallar el registro del usuario
  RAISE WARNING '[handle_new_auth_user] Error para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- Crear el trigger en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- 7. VERIFICACIÓN: Contar usuarios vs clientes
SELECT
  (SELECT COUNT(*) FROM auth.users)    AS total_auth_users,
  (SELECT COUNT(*) FROM public.clients) AS total_clients,
  (SELECT COUNT(*) FROM public.subscriptions) AS total_subs,
  (SELECT COUNT(*) FROM public.bot_configs) AS total_bots;

-- 8. Ver clientes recientes para confirmar sync
SELECT id, email, company_name, plan, status, created_at
FROM public.clients
ORDER BY created_at DESC
LIMIT 10;

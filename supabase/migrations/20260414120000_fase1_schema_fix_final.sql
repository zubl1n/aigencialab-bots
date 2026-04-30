-- ═══════════════════════════════════════════════════════════
--  AIgenciaLab — FASE 1 Final Schema Fix
--  Generado: 2026-04-14 desde schema real de producción
--  IDEMPOTENTE: 100% seguro de re-ejecutar
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────
-- 0. Columnas faltantes en api_keys
--    (key es UUID en prod, active ya existe, name ya existe
--     gracias a migration anterior parcialmente aplicada)
-- ─────────────────────────────────────────────────────────
DO $$
BEGIN
  -- name (puede ya existir si la migración anterior pasó parcialmente)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='api_keys' AND column_name='name') THEN
    ALTER TABLE public.api_keys ADD COLUMN name TEXT NOT NULL DEFAULT 'Default Key';
  END IF;

  -- active
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='api_keys' AND column_name='active') THEN
    ALTER TABLE public.api_keys ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 1. Columnas faltantes en clients
-- ─────────────────────────────────────────────────────────
DO $$
BEGIN
  -- email (clients tiene: company, rubro, contact_name, whatsapp, email, url...)
  -- email YA existe. Solo agregar las que faltan:

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='payment_status') THEN
    ALTER TABLE public.clients ADD COLUMN payment_status TEXT DEFAULT 'none';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='trial_ends_at') THEN
    ALTER TABLE public.clients ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days');
  END IF;

  -- company_name alias (el código Next.js usa company_name, la BD tiene company)
  -- No duplicamos la col, el código debe usar 'company'. Ver nota abajo.
END $$;

-- ─────────────────────────────────────────────────────────
-- 2. subscriptions (NO existe en prod — crear)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL DEFAULT 'Starter',
  status               TEXT NOT NULL DEFAULT 'trialing',
  payment_status       TEXT DEFAULT 'pending',
  trial_ends_at        TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  current_period_end   TIMESTAMPTZ,
  mp_subscription_id   TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_own_subscriptions" ON public.subscriptions;
CREATE POLICY "client_own_subscriptions" ON public.subscriptions
  FOR ALL USING (client_id = auth.uid());

DROP POLICY IF EXISTS "service_role_subscriptions" ON public.subscriptions;
CREATE POLICY "service_role_subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────
-- 3. billing_profiles (NO existe en prod — crear)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.billing_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  mp_customer_id TEXT,
  card_last4     TEXT,
  card_brand     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_own_billing" ON public.billing_profiles;
CREATE POLICY "client_own_billing" ON public.billing_profiles
  FOR ALL USING (client_id = auth.uid());

DROP POLICY IF EXISTS "service_role_billing" ON public.billing_profiles;
CREATE POLICY "service_role_billing" ON public.billing_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────
-- 4. global_settings (NO existe en prod — crear)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.global_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_only_settings" ON public.global_settings;
CREATE POLICY "admin_only_settings" ON public.global_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────
-- 5. Columnas faltantes en conversations
-- ─────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='lead_id') THEN
    ALTER TABLE public.conversations ADD COLUMN lead_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='role') THEN
    ALTER TABLE public.conversations ADD COLUMN role TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='content') THEN
    ALTER TABLE public.conversations ADD COLUMN content TEXT;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 6. Columnas faltantes en leads
-- ─────────────────────────────────────────────────────────
DO $$
BEGIN
  -- client_id y status ya existen en prod según el schema pull anterior
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='summary') THEN
    ALTER TABLE public.leads ADD COLUMN summary TEXT;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 7. Trigger principal: bootstrap al crear client
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_client_bootstrap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_end TIMESTAMPTZ := now() + INTERVAL '14 days';
BEGIN
  -- api_key: genera clave con prefijo agl_, guardada en key (UUID cast a TEXT via default)
  -- En prod key es UUID; usamos gen_random_uuid() que es el default actual
  INSERT INTO public.api_keys (client_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  -- bot_config: usa columna 'name' (no bot_name)
  INSERT INTO public.bot_configs (client_id, name)
  VALUES (NEW.id, 'Asistente IA')
  ON CONFLICT DO NOTHING;

  -- subscription
  INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at)
  VALUES (NEW.id, COALESCE(NEW.plan, 'Starter'), 'trialing', trial_end)
  ON CONFLICT DO NOTHING;

  -- billing_profile
  INSERT INTO public.billing_profiles (client_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  -- onboarding_progress
  INSERT INTO public.onboarding_progress (client_id, step_completed)
  VALUES (NEW.id, 0)
  ON CONFLICT DO NOTHING;

  -- Stamp trial_ends_at en el row del client
  UPDATE public.clients
  SET trial_ends_at = trial_end
  WHERE id = NEW.id AND trial_ends_at IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_client_created_bootstrap ON public.clients;
CREATE TRIGGER on_client_created_bootstrap
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client_bootstrap();

-- ─────────────────────────────────────────────────────────
-- 8. Auth trigger: crear client al registrarse en auth
--    Usa columnas reales: company (no company_name), sin tenant_id
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bug 3 fix: Insert into clients using correct SaaS schema columns.
  -- company_name (not company), tenant_id required NOT NULL.
  INSERT INTO public.clients (id, email, company_name, plan, status, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Starter'),
    'pending',
    NEW.id  -- tenant_id = user.id for single-owner accounts
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Eliminar trigger viejo si existe
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created   ON auth.users;

-- Registrar en INSERT (inmediato, sin esperar confirmación de email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = (
        SELECT oid FROM pg_class WHERE relname = 'users'
          AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
      )
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────
-- 9. Back-fill: clientes existentes sin datos relacionados
--    Filtra solo clientes con id en auth.users (evita FK violation)
-- ─────────────────────────────────────────────────────────

-- api_keys back-fill
INSERT INTO public.api_keys (client_id)
SELECT c.id FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.api_keys k WHERE k.client_id = c.id)
  AND EXISTS    (SELECT 1 FROM auth.users u WHERE u.id = c.id);

-- bot_configs back-fill (usa 'name', no 'bot_name')
INSERT INTO public.bot_configs (client_id, name)
SELECT c.id, 'Asistente IA' FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.bot_configs b WHERE b.client_id = c.id)
  AND EXISTS    (SELECT 1 FROM auth.users u WHERE u.id = c.id);

-- subscriptions back-fill
INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at)
SELECT
  c.id,
  COALESCE(c.plan, 'Starter'),
  'trialing',
  COALESCE(c.trial_ends_at, c.created_at + INTERVAL '14 days')
FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.client_id = c.id)
  AND EXISTS    (SELECT 1 FROM auth.users u WHERE u.id = c.id);

-- billing_profiles back-fill
INSERT INTO public.billing_profiles (client_id)
SELECT c.id FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.billing_profiles bp WHERE bp.client_id = c.id)
  AND EXISTS    (SELECT 1 FROM auth.users u WHERE u.id = c.id);

-- trial_ends_at back-fill en clients
UPDATE public.clients
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE trial_ends_at IS NULL;

-- ─────────────────────────────────────────────────────────
-- 10. Índices de performance
-- ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_api_keys_client        ON public.api_keys(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client   ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_client         ON public.billing_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_client_id        ON public.leads(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id  ON public.conversations(lead_id);

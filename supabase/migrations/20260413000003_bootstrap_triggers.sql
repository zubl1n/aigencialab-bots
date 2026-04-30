-- ═══════════════════════════════════════════════════════════
-- AIgenciaLab — Full Bootstrap Migration
-- File: 20260413000003_bootstrap_triggers.sql
-- Covers: api_keys, bot_configs, subscriptions, trial_ends_at,
--         payment_status — all triggered on clients INSERT
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────
-- 0. Helper: ensure columns exist
-- ─────────────────────────────────
DO $$
BEGIN
  -- clients.trial_ends_at (Bug 9 — trial badge source)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='trial_ends_at') THEN
    ALTER TABLE public.clients ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;

  -- clients.payment_status (alerts in admin)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='payment_status') THEN
    ALTER TABLE public.clients ADD COLUMN payment_status TEXT DEFAULT 'none';
  END IF;
END $$;

-- ─────────────────────────────────
-- 1. api_keys table
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  key          TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL DEFAULT 'Default Key',
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients read own api_keys"    ON public.api_keys;
DROP POLICY IF EXISTS "Service role full api_keys"   ON public.api_keys;

CREATE POLICY "Clients read own api_keys"
  ON public.api_keys FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Service role full api_keys"
  ON public.api_keys FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────
-- 2. subscriptions table
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan                  TEXT NOT NULL DEFAULT 'Starter',
  status                TEXT NOT NULL DEFAULT 'trialing',  -- trialing | active | cancelled | past_due
  trial_ends_at         TIMESTAMPTZ,
  current_period_start  TIMESTAMPTZ DEFAULT now(),
  current_period_end    TIMESTAMPTZ,
  mp_subscription_id    TEXT,                              -- MercadoPago subscription ID
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients read own subscriptions"  ON public.subscriptions;
DROP POLICY IF EXISTS "Service role full subscriptions" ON public.subscriptions;

CREATE POLICY "Clients read own subscriptions"
  ON public.subscriptions FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Service role full subscriptions"
  ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────
-- 3. billing_profiles table
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.billing_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  card_last4        TEXT,
  card_brand        TEXT,    -- visa | mastercard | etc.
  mp_customer_id    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients read own billing_profiles"  ON public.billing_profiles;
DROP POLICY IF EXISTS "Service role full billing_profiles" ON public.billing_profiles;

CREATE POLICY "Clients read own billing_profiles"
  ON public.billing_profiles FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Service role full billing_profiles"
  ON public.billing_profiles FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────
-- 4. Trigger function: bootstrap all rows on client INSERT
-- ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_client_bootstrap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_end TIMESTAMPTZ := now() + INTERVAL '14 days';
  new_key   TEXT        := 'agl_' || replace(gen_random_uuid()::text, '-', '');
BEGIN
  -- 4a. api_keys: generate a real unique key (NOT user.id)
  INSERT INTO public.api_keys (client_id, key, name)
  VALUES (NEW.id, new_key, 'Default Key')
  ON CONFLICT DO NOTHING;

  -- 4b. bot_configs: ensure one exists (active=false)
  INSERT INTO public.bot_configs (
    client_id, bot_name, active, widget_color, language, welcome_message
  ) VALUES (
    NEW.id, 'Asistente IA', false, '#0066CC', 'es', '¡Hola! ¿En qué puedo ayudarte?'
  )
  ON CONFLICT (client_id) DO NOTHING;

  -- 4c. subscriptions: Starter plan + 14-day trial
  INSERT INTO public.subscriptions (
    client_id, plan, status, trial_ends_at, current_period_start
  ) VALUES (
    NEW.id, COALESCE(NEW.plan, 'Starter'), 'trialing', trial_end, now()
  )
  ON CONFLICT DO NOTHING;

  -- 4d. Stamp trial_ends_at on clients row for quick sidebar access
  UPDATE public.clients
  SET trial_ends_at = trial_end
  WHERE id = NEW.id AND trial_ends_at IS NULL;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────
-- 5. Attach trigger to clients
-- ─────────────────────────────────
DROP TRIGGER IF EXISTS on_client_created_bootstrap ON public.clients;
CREATE TRIGGER on_client_created_bootstrap
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_client_bootstrap();

-- ─────────────────────────────────
-- 6. Back-fill existing clients
-- ─────────────────────────────────

-- api_keys back-fill
INSERT INTO public.api_keys (client_id, key, name)
SELECT 
  c.id,
  'agl_' || replace(gen_random_uuid()::text, '-', ''),
  'Default Key'
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.api_keys k WHERE k.client_id = c.id
);

-- bot_configs back-fill
INSERT INTO public.bot_configs (client_id, bot_name, active, widget_color, language, welcome_message)
SELECT 
  c.id, 'Asistente IA', false, '#0066CC', 'es', '¡Hola! ¿En qué puedo ayudarte?'
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.bot_configs b WHERE b.client_id = c.id
);

-- subscriptions back-fill
INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at, current_period_start)
SELECT
  c.id,
  COALESCE(c.plan, 'Starter'),
  'trialing',
  COALESCE(c.trial_ends_at, c.created_at + INTERVAL '14 days'),
  c.created_at
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.client_id = c.id
);

-- trial_ends_at back-fill on clients
UPDATE public.clients c
SET trial_ends_at = c.created_at + INTERVAL '14 days'
WHERE c.trial_ends_at IS NULL;

-- ─────────────────────────────────
-- 7. Auth hook: on auth.users INSERT → create clients row
--    (if not already handled by existing trigger)
-- ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clients (
    id,
    email,
    company_name,
    plan,
    status,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Starter'),
    'pending',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attach to auth.users (only if not already attached)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
    AND tgrelid = (SELECT oid FROM pg_class WHERE relname = 'users'
                   AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END $$;

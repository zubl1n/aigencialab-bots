-- ═══════════════════════════════════════════════════════════
--  AIgenciaLab — Fix Schema Migration
--  Idempotent: uses IF NOT EXISTS / DROP IF EXISTS everywhere
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────
-- 0. Add missing columns to clients
-- ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='trial_ends_at') THEN
    ALTER TABLE public.clients ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='payment_status') THEN
    ALTER TABLE public.clients ADD COLUMN payment_status TEXT DEFAULT 'none';
  END IF;
END $$;

-- ─────────────────────────────────
-- 1. Fix api_keys: change key column from UUID to TEXT with proper prefix
-- ─────────────────────────────────
DO $$
BEGIN
  -- Change column type if it's uuid
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='api_keys' AND column_name='key' AND data_type='uuid'
  ) THEN
    ALTER TABLE public.api_keys ALTER COLUMN key TYPE TEXT USING 'ak_' || replace(key::text, '-', '');
    ALTER TABLE public.api_keys ALTER COLUMN key SET DEFAULT concat('ak_', replace(gen_random_uuid()::text, '-', ''));
  END IF;
END $$;

-- Ensure key column has UNIQUE + NOT NULL if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.api_keys'::regclass AND contype = 'u' AND conname LIKE '%key%'
  ) THEN
    -- Key may already be unique from CREATE TABLE, just ensure it
    BEGIN
      ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_key_unique UNIQUE (key);
    EXCEPTION WHEN duplicate_table THEN NULL;
              WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- ─────────────────────────────────
-- 2. subscriptions table
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan                 TEXT NOT NULL DEFAULT 'Starter' CHECK (plan IN ('Starter','Pro','Enterprise')),
  status               TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','canceled')),
  payment_status       TEXT DEFAULT 'pending',
  trial_ends_at        TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  current_period_end   TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_own_subscriptions" ON public.subscriptions;
CREATE POLICY "client_own_subscriptions" ON public.subscriptions
  FOR ALL USING (client_id = auth.uid());

-- ─────────────────────────────────
-- 3. billing_profiles table
-- ─────────────────────────────────
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

-- ─────────────────────────────────
-- 4. Add missing columns to leads (status + client_id + summary + contact_name)
-- ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='client_id') THEN
    ALTER TABLE public.leads ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='status') THEN
    ALTER TABLE public.leads ADD COLUMN status TEXT DEFAULT 'new';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='summary') THEN
    ALTER TABLE public.leads ADD COLUMN summary TEXT;
  END IF;
END $$;

-- ─────────────────────────────────
-- 5. Add lead_id + role to conversations (for chat thread per lead)
-- ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='lead_id') THEN
    ALTER TABLE public.conversations ADD COLUMN lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='role') THEN
    ALTER TABLE public.conversations ADD COLUMN role TEXT CHECK (role IN ('user','assistant'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='content') THEN
    ALTER TABLE public.conversations ADD COLUMN content TEXT;
  END IF;
END $$;

-- ─────────────────────────────────
-- 6. Trigger: auto-create child rows on clients INSERT
-- ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_client()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.api_keys (client_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  INSERT INTO public.bot_configs (client_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  INSERT INTO public.subscriptions (client_id, plan) VALUES (NEW.id, COALESCE(NEW.plan, 'Starter'))
    ON CONFLICT DO NOTHING;
  INSERT INTO public.billing_profiles (client_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  INSERT INTO public.onboarding_progress (client_id, step_completed) VALUES (NEW.id, 0)
    ON CONFLICT DO NOTHING;
  -- Stamp trial_ends_at on the client row
  UPDATE public.clients SET trial_ends_at = now() + interval '14 days'
    WHERE id = NEW.id AND trial_ends_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_client_created ON public.clients;
CREATE TRIGGER on_client_created
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

-- ─────────────────────────────────
-- 7. Auth trigger: create clients row on auth.users INSERT
--    (fires immediately on signup, not email confirmation)
-- ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (id, email, company_name, plan, status, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Starter'),
    'pending',
    NEW.id
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old confirmation trigger (only fires on email_confirmed_at update)
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create new trigger that fires on INSERT (immediate, no email wait)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ─────────────────────────────────
-- 8. Back-fill existing clients
-- ─────────────────────────────────

-- api_keys (fix key format for existing uuid-style keys)
UPDATE public.api_keys
  SET key = concat('ak_', replace(key, '-', ''))
  WHERE key NOT LIKE 'ak_%' AND key NOT LIKE 'agl_%';

-- subscriptions back-fill
INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at)
SELECT
  c.id,
  COALESCE(c.plan, 'Starter'),
  'trialing',
  COALESCE(c.trial_ends_at, c.created_at + INTERVAL '14 days')
FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.client_id = c.id);

-- billing_profiles back-fill
INSERT INTO public.billing_profiles (client_id)
SELECT c.id
FROM public.clients c
WHERE NOT EXISTS (SELECT 1 FROM public.billing_profiles bp WHERE bp.client_id = c.id);

-- trial_ends_at back-fill
UPDATE public.clients
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE trial_ends_at IS NULL;

-- ─────────────────────────────────
-- 9. Indexes for performance
-- ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_api_keys_client ON public.api_keys(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_client ON public.billing_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON public.leads(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);

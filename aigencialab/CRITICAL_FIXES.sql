-- ═══════════════════════════════════════════════════════════════════════
-- AIgenciaLab — CRITICAL PRODUCTION FIXES MIGRATION
-- Copiar y pegar COMPLETO en:
-- → Supabase Dashboard > SQL Editor > New Query > Run
-- URL: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
-- 
-- Este script es IDEMPOTENTE (se puede ejecutar múltiples veces)
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. clients table: add missing columns ──────────────────────────────
DO $$
BEGIN
  -- full_name (some code uses this, some uses contact_name)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='full_name') THEN
    ALTER TABLE public.clients ADD COLUMN full_name TEXT;
  END IF;
  
  -- company_name (canonical name for the company)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='company_name') THEN
    ALTER TABLE public.clients ADD COLUMN company_name TEXT;
  END IF;
  
  -- trial_ends_at on clients for billing page fallback
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='trial_ends_at') THEN
    ALTER TABLE public.clients ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;
  
  -- payment_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='payment_status') THEN
    ALTER TABLE public.clients ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
  
  -- phone (used by admin clientes page)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='phone') THEN
    ALTER TABLE public.clients ADD COLUMN phone TEXT;
  END IF;
  
  -- url (website)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='url') THEN
    ALTER TABLE public.clients ADD COLUMN url TEXT;
  END IF;
  
  -- rubro
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='rubro') THEN
    ALTER TABLE public.clients ADD COLUMN rubro TEXT;
  END IF;
  
  -- config (JSONB for arbitrary config)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='config') THEN
    ALTER TABLE public.clients ADD COLUMN config JSONB DEFAULT '{}';
  END IF;
  
  -- channels
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='channels') THEN
    ALTER TABLE public.clients ADD COLUMN channels JSONB DEFAULT '{"whatsapp": false, "web": false, "email": false}';
  END IF;
  
  -- faqs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='faqs') THEN
    ALTER TABLE public.clients ADD COLUMN faqs JSONB DEFAULT '[]';
  END IF;
  
  -- products
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='products') THEN
    ALTER TABLE public.clients ADD COLUMN products JSONB DEFAULT '[]';
  END IF;
END $$;

-- ── 2. bot_configs: ensure both name AND bot_name columns exist ─────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='bot_name') THEN
    ALTER TABLE public.bot_configs ADD COLUMN bot_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='name') THEN
    ALTER TABLE public.bot_configs ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='instructions') THEN
    ALTER TABLE public.bot_configs ADD COLUMN instructions TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='system_prompt') THEN
    ALTER TABLE public.bot_configs ADD COLUMN system_prompt TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='llm_config') THEN
    ALTER TABLE public.bot_configs ADD COLUMN llm_config JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='widget_color') THEN
    ALTER TABLE public.bot_configs ADD COLUMN widget_color TEXT DEFAULT '#6366f1';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='welcome_message') THEN
    ALTER TABLE public.bot_configs ADD COLUMN welcome_message TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bot_configs' AND column_name='language') THEN
    ALTER TABLE public.bot_configs ADD COLUMN language TEXT DEFAULT 'es';
  END IF;
END $$;

-- ── 3. subscriptions: ensure all columns exist ──────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='trial_ends_at') THEN
    ALTER TABLE public.subscriptions ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='current_period_end') THEN
    ALTER TABLE public.subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='mp_subscription_id') THEN
    ALTER TABLE public.subscriptions ADD COLUMN mp_subscription_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='subscriptions' AND column_name='payment_status') THEN
    ALTER TABLE public.subscriptions ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
  
  -- Unique constraint on client_id for upserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.subscriptions'::regclass 
    AND conname = 'subscriptions_client_id_key'
  ) THEN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_client_id_key UNIQUE (client_id);
  END IF;
END $$;

-- ── 4. billing_profiles: ensure all columns exist ───────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='mp_customer_id') THEN
    ALTER TABLE public.billing_profiles ADD COLUMN mp_customer_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='payment_status') THEN
    ALTER TABLE public.billing_profiles ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='card_last4') THEN
    ALTER TABLE public.billing_profiles ADD COLUMN card_last4 TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='billing_profiles' AND column_name='card_brand') THEN
    ALTER TABLE public.billing_profiles ADD COLUMN card_brand TEXT;
  END IF;
  
  -- Unique constraint on client_id for upserts
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.billing_profiles'::regclass 
    AND conname = 'billing_profiles_client_id_key'
  ) THEN
    ALTER TABLE public.billing_profiles ADD CONSTRAINT billing_profiles_client_id_key UNIQUE (client_id);
  END IF;
END $$;

-- ── 5. support_tickets: ensure exists ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_own_tickets" ON public.support_tickets;
CREATE POLICY "client_own_tickets" ON public.support_tickets
  FOR ALL USING (client_id = auth.uid());
DROP POLICY IF EXISTS "service_role_tickets" ON public.support_tickets;
CREATE POLICY "service_role_tickets" ON public.support_tickets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_support_tickets_client ON public.support_tickets(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- ── 6. audit_logs: ensure module column exists ────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='audit_logs' AND column_name='module') THEN
    ALTER TABLE public.audit_logs ADD COLUMN module TEXT DEFAULT 'system';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='audit_logs' AND column_name='metadata') THEN
    ALTER TABLE public.audit_logs ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- ── 7. alerts: ensure exists ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('critical','high','medium','info')),
  title       TEXT NOT NULL,
  detail      TEXT,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  dismissed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_alerts" ON public.alerts;
CREATE POLICY "service_role_alerts" ON public.alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_alerts_type   ON public.alerts(type, status);
CREATE INDEX IF NOT EXISTS idx_alerts_client ON public.alerts(client_id, created_at DESC);

-- ── 8. api_keys: ensure exists ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  key        TEXT NOT NULL UNIQUE DEFAULT 'ak_' || replace(gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_own_keys" ON public.api_keys;
CREATE POLICY "client_own_keys" ON public.api_keys
  FOR SELECT USING (client_id = auth.uid());
DROP POLICY IF EXISTS "service_role_keys" ON public.api_keys;
CREATE POLICY "service_role_keys" ON public.api_keys
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 9. conversation_stats: ensure exists ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  conversations   INT  NOT NULL DEFAULT 0,
  leads           INT  NOT NULL DEFAULT 0,
  messages        INT  NOT NULL DEFAULT 0,
  avg_duration_seconds INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, date)
);
ALTER TABLE public.conversation_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_own_stats" ON public.conversation_stats;
CREATE POLICY "client_own_stats" ON public.conversation_stats
  FOR SELECT USING (client_id = auth.uid());
DROP POLICY IF EXISTS "service_role_stats" ON public.conversation_stats;
CREATE POLICY "service_role_stats" ON public.conversation_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 10. Service role RLS bypass for clients table ──────────────────────
DROP POLICY IF EXISTS "service_role_clients_all" ON public.clients;
CREATE POLICY "service_role_clients_all" ON public.clients
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_bot_configs" ON public.bot_configs;
CREATE POLICY "service_role_bot_configs" ON public.bot_configs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_subscriptions" ON public.subscriptions;
CREATE POLICY "service_role_subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_billing" ON public.billing_profiles;
CREATE POLICY "service_role_billing" ON public.billing_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 11. client self-read RLS policies ─────────────────────────────────
DROP POLICY IF EXISTS "client_read_own" ON public.clients;
CREATE POLICY "client_read_own" ON public.clients
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "client_update_own" ON public.clients;
CREATE POLICY "client_update_own" ON public.clients
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "client_insert_own" ON public.clients;
CREATE POLICY "client_insert_own" ON public.clients
  FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "client_read_own_bot" ON public.bot_configs;
CREATE POLICY "client_read_own_bot" ON public.bot_configs
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "client_read_own_sub" ON public.subscriptions;
CREATE POLICY "client_read_own_sub" ON public.subscriptions
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "client_read_own_billing" ON public.billing_profiles;
CREATE POLICY "client_read_own_billing" ON public.billing_profiles
  FOR SELECT USING (client_id = auth.uid());

-- ── 12. invoices table (referenced in billing page) ──────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'CLP',
  status       TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending','failed')),
  mp_payment_id TEXT,
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url      TEXT
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_own_invoices" ON public.invoices;
CREATE POLICY "client_own_invoices" ON public.invoices
  FOR SELECT USING (client_id = auth.uid());
DROP POLICY IF EXISTS "service_role_invoices" ON public.invoices;
CREATE POLICY "service_role_invoices" ON public.invoices
  FOR ALL TO service_role USING (true) WITH CHECK (true);

SELECT 'Critical fixes migration applied successfully ✅' AS result;

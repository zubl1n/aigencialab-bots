-- ============================================================
-- AIgenciaLab — Migración de Módulos v2
-- Ejecutar en: Supabase → SQL Editor → New query
-- Fecha: 2026-04-21
-- ============================================================

-- ── 1. Tabla de Agendamientos ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name     TEXT NOT NULL,
  contact_email    TEXT,
  contact_phone    TEXT,
  service          TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_min     INTEGER NOT NULL DEFAULT 30,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('confirmed','pending','cancelled','completed')),
  channel          TEXT NOT NULL DEFAULT 'chat_web',
  notes            TEXT,
  session_id       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments(appointment_date);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_own_appointments" ON public.appointments;
CREATE POLICY "client_own_appointments"
  ON public.appointments FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Vista: solo para service_role (API interna)
DROP POLICY IF EXISTS "service_role_all_appointments" ON public.appointments;
CREATE POLICY "service_role_all_appointments"
  ON public.appointments FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ── 2. Tabla Agent Flows (orquestación multi-agente) ─────────
CREATE TABLE IF NOT EXISTS public.agent_flows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  primary_agent_id UUID,
  agent_nodes      JSONB NOT NULL DEFAULT '[]',
  handoff_rules    JSONB NOT NULL DEFAULT '[]',
  active           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.agent_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_agent_flows"
  ON public.agent_flows FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 3. Tabla Omnichannel Flows (Flow Builder) ────────────────
CREATE TABLE IF NOT EXISTS public.omnichannel_flows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  channels         TEXT[] NOT NULL DEFAULT '{"chat_web"}',
  nodes            JSONB NOT NULL DEFAULT '[]',
  edges            JSONB NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft','active','paused','archived')),
  version          INTEGER NOT NULL DEFAULT 1,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.omnichannel_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_omnichannel_flows"
  ON public.omnichannel_flows FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 4. Integration Workflows (Make, Zapier, API custom) ─────
CREATE TABLE IF NOT EXISTS public.integration_workflows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  platform         TEXT NOT NULL CHECK (platform IN ('make','zapier','n8n','custom')),
  webhook_url      TEXT,
  trigger_events   TEXT[] NOT NULL DEFAULT '{}',
  payload_template JSONB,
  active           BOOLEAN NOT NULL DEFAULT FALSE,
  last_triggered   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.integration_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_integration_workflows"
  ON public.integration_workflows FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 5. Ecommerce Integrations ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecommerce_integrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK (platform IN ('shopify','woocommerce','custom')),
  store_url        TEXT NOT NULL,
  api_key          TEXT,
  api_secret_hash  TEXT,     -- almacenar HASHED nunca en plain text
  webhook_secret   TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('connected','error','pending','disconnected')),
  last_sync        TIMESTAMPTZ,
  sync_config      JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ecommerce_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_ecommerce_integrations"
  ON public.ecommerce_integrations FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 6. Abandoned Carts ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id    UUID REFERENCES public.ecommerce_integrations(id) ON DELETE SET NULL,
  external_cart_id  TEXT,
  customer_name     TEXT NOT NULL,
  customer_email    TEXT,
  customer_phone    TEXT,
  cart_value        NUMERIC(12,2) NOT NULL DEFAULT 0,
  cart_items        JSONB NOT NULL DEFAULT '[]',
  abandoned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recovery_status   TEXT NOT NULL DEFAULT 'pending'
                    CHECK (recovery_status IN ('pending','in_progress','recovered','lost')),
  recovered_at      TIMESTAMPTZ,
  recovered_value   NUMERIC(12,2),
  last_contacted_at TIMESTAMPTZ,
  contact_attempts  INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS abandoned_carts_client_id_idx ON public.abandoned_carts(client_id);
CREATE INDEX IF NOT EXISTS abandoned_carts_status_idx ON public.abandoned_carts(recovery_status);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_abandoned_carts"
  ON public.abandoned_carts FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 7. Recovery Sequences ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recovery_sequences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Secuencia de Recuperación',
  status          TEXT NOT NULL DEFAULT 'paused'
                  CHECK (status IN ('active','paused','archived')),
  steps           JSONB NOT NULL DEFAULT '[]',
  stats           JSONB NOT NULL DEFAULT '{"sent":0,"recovered":0,"revenue":0}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.recovery_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_recovery_sequences"
  ON public.recovery_sequences FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 8. Human Handoff Sessions ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.human_handoff_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id  UUID,
  session_id       TEXT,
  contact_name     TEXT,
  contact_phone    TEXT,
  channel          TEXT NOT NULL DEFAULT 'chat_web',
  reason           TEXT,
  transcript       JSONB NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'waiting'
                   CHECK (status IN ('waiting','active','closed')),
  agent_id         UUID,            -- human agent assigned
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS handoff_client_id_idx ON public.human_handoff_sessions(client_id);
CREATE INDEX IF NOT EXISTS handoff_status_idx ON public.human_handoff_sessions(status);

ALTER TABLE public.human_handoff_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "client_own_handoff_sessions"
  ON public.human_handoff_sessions FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- ── 9. Bot Config: agregar columna business_type si no existe ─
ALTER TABLE public.bot_configs
  ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS auto_appointments BOOLEAN DEFAULT FALSE;

-- ── 10. Trigger: updated_at automático ──────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  -- appointments
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'appointments_updated_at') THEN
    CREATE TRIGGER appointments_updated_at
      BEFORE UPDATE ON public.appointments
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  -- omnichannel_flows
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'omnichannel_flows_updated_at') THEN
    CREATE TRIGGER omnichannel_flows_updated_at
      BEFORE UPDATE ON public.omnichannel_flows
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  -- ecommerce_integrations
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ecommerce_integrations_updated_at') THEN
    CREATE TRIGGER ecommerce_integrations_updated_at
      BEFORE UPDATE ON public.ecommerce_integrations
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- ── Verificación final ───────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'appointments','agent_flows','omnichannel_flows',
    'integration_workflows','ecommerce_integrations',
    'abandoned_carts','recovery_sequences','human_handoff_sessions'
  )
ORDER BY tablename;

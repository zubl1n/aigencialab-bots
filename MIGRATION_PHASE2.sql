-- ═══════════════════════════════════════════════════════════════════════
-- AIgenciaLab — MIGRATION: support_tickets + client_settings fixes
-- Ejecutar en: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
-- ═══════════════════════════════════════════════════════════════════════

-- 1. support_tickets (nueva tabla — BLOQUE 6)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  description  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','in_progress','resolved','closed')),
  priority     TEXT NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('low','medium','high','urgent')),
  response     TEXT,
  responded_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Clients can see only their own tickets
DROP POLICY IF EXISTS "client_own_tickets" ON public.support_tickets;
CREATE POLICY "client_own_tickets" ON public.support_tickets
  FOR ALL USING (client_id = auth.uid());

-- Service role has full access (admin)
DROP POLICY IF EXISTS "service_role_tickets" ON public.support_tickets;
CREATE POLICY "service_role_tickets" ON public.support_tickets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tickets_client   ON public.support_tickets(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status   ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.support_tickets(priority);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. clients — ensure updated_at column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='updated_at') THEN
    ALTER TABLE public.clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 3. conversation_stats (if not exists from previous migration)
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
CREATE INDEX IF NOT EXISTS idx_conv_stats_client_date ON public.conversation_stats(client_id, date DESC);

-- 4. alerts (ensure exists with all required columns)
CREATE TABLE IF NOT EXISTS public.alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'info'
              CHECK (type IN ('critical','high','medium','info')),
  title       TEXT NOT NULL,
  detail      TEXT,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','resolved')),
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

-- 5. audit_logs — ensure module column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='audit_logs' AND column_name='module') THEN
    ALTER TABLE public.audit_logs ADD COLUMN module TEXT DEFAULT 'system';
  END IF;
END $$;

SELECT 'Migration Phase 2 applied successfully ✅' AS result;

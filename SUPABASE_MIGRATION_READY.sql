-- ═══════════════════════════════════════════════════════════════════════
-- AIgenciaLab — MIGRATION COMPLETA LISTA PARA EJECUTAR
-- Copiar y pegar COMPLETO en:
-- → Supabase Dashboard > SQL Editor > New Query > Run
-- URL: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
-- ═══════════════════════════════════════════════════════════════════════

-- 1. conversation_stats
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

-- 2. alerts (ensure exists with all columns)
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

-- 3. Add columns to alerts if missing (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='alerts' AND column_name='status') THEN
    ALTER TABLE public.alerts ADD COLUMN status TEXT NOT NULL DEFAULT 'open'
      CHECK (status IN ('open','resolved'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='alerts' AND column_name='resolved_at') THEN
    ALTER TABLE public.alerts ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;
END $$;

-- 4. audit_logs (ensure module column exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='audit_logs' AND column_name='module') THEN
    ALTER TABLE public.audit_logs ADD COLUMN module TEXT DEFAULT 'system';
  END IF;
END $$;

SELECT 'Migration applied successfully ✅' AS result;

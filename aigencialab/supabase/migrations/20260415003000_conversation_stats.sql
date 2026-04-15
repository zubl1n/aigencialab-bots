-- ═══════════════════════════════════════════════════════════
-- AIgenciaLab — conversation_stats + analytics infrastructure
-- Idempotente (seguro de re-ejecutar)
-- ═══════════════════════════════════════════════════════════

-- conversation_stats: daily aggregates per client
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

-- alerts table (ensure exists with correct columns)
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

CREATE INDEX IF NOT EXISTS idx_alerts_type    ON public.alerts(type, status);
CREATE INDEX IF NOT EXISTS idx_alerts_client  ON public.alerts(client_id, created_at DESC);

-- Add status column to alerts if missing (older schema had dismissed bool only)
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

-- Seed some daily stats for the test client (useful for dev)
-- Disabled: only run manually with a real client_id
-- INSERT INTO public.conversation_stats (client_id, date, conversations, leads, messages)
-- SELECT id, CURRENT_DATE - i, floor(random()*20+5)::int, floor(random()*5+1)::int, floor(random()*80+20)::int
-- FROM public.clients, generate_series(0,29) i
-- WHERE email = 'test@aigencialab.cl'
-- ON CONFLICT (client_id, date) DO NOTHING;

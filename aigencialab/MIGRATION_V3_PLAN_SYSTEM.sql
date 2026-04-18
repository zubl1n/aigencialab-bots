-- ════════════════════════════════════════════════════════════
-- AIgenciaLab — Migration V3: Plan System & New Tables
-- Run in Supabase SQL Editor or via API
-- Generated: 2026-04-18
-- ════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════
-- 1. Fix crítico: columna issue en tickets + new columns
-- ════════════════════════════════════════════════════════
ALTER TABLE public.tickets
  ALTER COLUMN issue SET DEFAULT '';

-- Add new columns safely (IF NOT EXISTS)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='title') THEN
    ALTER TABLE public.tickets ADD COLUMN title TEXT DEFAULT 'Sin título';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='category') THEN
    ALTER TABLE public.tickets ADD COLUMN category TEXT DEFAULT 'general';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='assigned_to') THEN
    ALTER TABLE public.tickets ADD COLUMN assigned_to UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='resolved_at') THEN
    ALTER TABLE public.tickets ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='sla_deadline') THEN
    ALTER TABLE public.tickets ADD COLUMN sla_deadline TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='internal_notes') THEN
    ALTER TABLE public.tickets ADD COLUMN internal_notes JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='attachments') THEN
    ALTER TABLE public.tickets ADD COLUMN attachments TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- 2. Plan usage tracking
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.plan_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  period DATE NOT NULL,
  conversations_count INT DEFAULT 0,
  leads_count INT DEFAULT 0,
  bots_count INT DEFAULT 0,
  api_calls_count INT DEFAULT 0,
  storage_mb DECIMAL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, period)
);

-- ════════════════════════════════════════════════════════
-- 3. CRM Contacts
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  source TEXT DEFAULT 'bot',
  score INTEGER DEFAULT 10 CHECK (score >= 0 AND score <= 100),
  stage TEXT DEFAULT 'new',
  status TEXT DEFAULT 'active',
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  estimated_value INTEGER DEFAULT 0,
  custom_fields JSONB DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- 4. CRM Activities
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  contact_id UUID,
  actor_id UUID,
  type TEXT NOT NULL DEFAULT 'note',
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- 5. Health scores (cache)
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.client_health (
  client_id UUID PRIMARY KEY,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  factors JSONB DEFAULT '{}',
  risk_level TEXT DEFAULT 'low',
  churn_probability DECIMAL DEFAULT 0,
  last_calculated TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- 6. Canned responses (respuestas predefinidas para tickets)
-- ════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.canned_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  variables TEXT[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- 7. Índices críticos para performance
-- ════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_client ON public.crm_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_score ON public.crm_contacts(score DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON public.crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_plan_usage_client ON public.plan_usage(client_id, period DESC);
CREATE INDEX IF NOT EXISTS idx_client_health_risk ON public.client_health(risk_level, score);

-- ════════════════════════════════════════════════════════
-- 8. RLS Policies — Los clientes solo ven sus propios datos
-- ════════════════════════════════════════════════════════
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clients_own_contacts') THEN
    CREATE POLICY clients_own_contacts ON public.crm_contacts FOR ALL USING (auth.uid() = client_id);
  END IF;
END $$;

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clients_own_activities') THEN
    CREATE POLICY clients_own_activities ON public.crm_activities FOR ALL USING (auth.uid() = client_id);
  END IF;
END $$;

ALTER TABLE public.plan_usage ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clients_own_usage') THEN
    CREATE POLICY clients_own_usage ON public.plan_usage FOR SELECT USING (auth.uid() = client_id);
  END IF;
END $$;

ALTER TABLE public.client_health ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'clients_read_own_health') THEN
    CREATE POLICY clients_read_own_health ON public.client_health FOR SELECT USING (auth.uid() = client_id);
  END IF;
END $$;

-- ════════════════════════════════════════════════════════
-- Done! All tables and indexes created.
-- ════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
--  EJECUTAR EN SUPABASE SQL EDITOR:
--  https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
--
--  Este script agrupa las 2 migraciones de la sesión 2026-04-18:
--    1. Fix NOT NULL tickets.issue
--    2. Leads popup fields (offer + popup_landing source)
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- MIGRACIÓN 1: Fix tickets.issue NOT NULL
-- ────────────────────────────────────────────────────────────────

-- Hacer issue nullable (era requerido en el schema v1, ya no se usa en v2)
ALTER TABLE public.tickets 
  ALTER COLUMN issue DROP NOT NULL;

ALTER TABLE public.tickets 
  ALTER COLUMN issue SET DEFAULT '';

UPDATE public.tickets 
  SET issue = '' 
  WHERE issue IS NULL;

-- Extender status constraint para aceptar valores v1 y v2
DO $$
BEGIN
  ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
  ALTER TABLE public.tickets ADD CONSTRAINT tickets_status_check 
    CHECK (status IN (
      'open', 'in_progress', 'resolved', 'closed',
      'Abierto', 'En progreso', 'Esperando cliente', 'Resuelto'
    ));
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- Extender priority constraint para aceptar valores v1 y v2
DO $$
BEGIN
  ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;
  ALTER TABLE public.tickets ADD CONSTRAINT tickets_priority_check 
    CHECK (priority IN (
      'low', 'normal', 'medium', 'high', 'urgent',
      'critico', 'alto', 'medio', 'bajo'
    ));
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────────
-- MIGRACIÓN 2: Leads popup fields
-- ────────────────────────────────────────────────────────────────

-- Agregar columna offer
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS offer TEXT;

-- Extender source para incluir popup_landing
DO $$
BEGIN
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_source_check;
  ALTER TABLE public.leads ADD CONSTRAINT leads_source_check 
    CHECK (source IN ('audit', 'manual', 'whatsapp', 'landing', 'popup_landing'));
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_offer ON public.leads(offer) WHERE offer IS NOT NULL;

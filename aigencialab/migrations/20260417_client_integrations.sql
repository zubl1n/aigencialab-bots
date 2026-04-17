-- ============================================================
-- Migration: Add client_integrations table
-- Description: Persists the state of each integration per client
--              (enabled/disabled + optional config/credentials)
-- Date: 2026-04-17
-- Run in: Supabase SQL Editor (as service role)
-- ============================================================

-- 1. Create the client_integrations table
CREATE TABLE IF NOT EXISTS public.client_integrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  integration_key  text NOT NULL,
  enabled          boolean NOT NULL DEFAULT false,
  config           jsonb DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  -- One row per client per integration
  CONSTRAINT uq_client_integration UNIQUE (client_id, integration_key)
);

-- 2. Index for fast lookup by client
CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id
  ON public.client_integrations (client_id);

-- 3. RLS — clients can only see and modify their own integrations
ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_own_integrations"
  ON public.client_integrations
  FOR ALL
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Service role can bypass RLS (used by API routes)
-- (Service role automatically bypasses RLS in Supabase)

-- 4. Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_integrations_updated_at ON public.client_integrations;
CREATE TRIGGER trg_client_integrations_updated_at
  BEFORE UPDATE ON public.client_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Add impl_paid_at to subscriptions if it doesn't exist
-- (needed for real MRR history calculation added in admin/page.tsx)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS impl_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_start_date date,
  ADD COLUMN IF NOT EXISTS last_billing_at timestamptz,
  ADD COLUMN IF NOT EXISTS mp_preference_id text;

-- 6. Add messages_count and is_lead helpers to conversations if missing
-- (These are computed in API, but useful as materialized columns for perf)
-- ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS messages_count integer DEFAULT 0;
-- ^ Commented out: we compute this in the API to avoid staleness

-- Done!
SELECT 'Migration applied successfully' AS status;

-- Migration: Auto-create api_keys row on clients INSERT
-- Also ensures trial_ends_at is in clients table
-- IDEMPOTENT: safe to run on existing DBs

-- 1. Ensure api_keys table exists
CREATE TABLE IF NOT EXISTS public.api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  key          TEXT NOT NULL UNIQUE DEFAULT concat('agl_', replace(gen_random_uuid()::text, '-', '')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- 1b. Add optional columns defensively (table may already exist without them)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='api_keys' AND column_name='name') THEN
    ALTER TABLE public.api_keys ADD COLUMN name TEXT NOT NULL DEFAULT 'Default Key';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='api_keys' AND column_name='active') THEN
    ALTER TABLE public.api_keys ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own api_keys" ON public.api_keys;
CREATE POLICY "Clients can view own api_keys"
  ON public.api_keys FOR SELECT
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Service role full access api_keys" ON public.api_keys;
CREATE POLICY "Service role full access api_keys"
  ON public.api_keys FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Function: auto-create api_key on client INSERT
CREATE OR REPLACE FUNCTION public.handle_new_client_api_key()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.api_keys (client_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Trigger
DROP TRIGGER IF EXISTS on_client_created_api_key ON public.clients;
CREATE TRIGGER on_client_created_api_key
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_client_api_key();

-- 4. Back-fill existing clients that don't have an api_key yet
--    Only for clients whose id exists in auth.users (avoids FK violation on orphaned rows)
INSERT INTO public.api_keys (client_id)
SELECT c.id
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.api_keys k WHERE k.client_id = c.id
)
AND EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = c.id
);

-- 5. Ensure trial_ends_at is in clients table (add if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients' AND column_name='trial_ends_at'
  ) THEN
    ALTER TABLE public.clients
      ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days');
    UPDATE public.clients
    SET trial_ends_at = created_at + INTERVAL '14 days'
    WHERE trial_ends_at IS NULL;
  END IF;
END $$;

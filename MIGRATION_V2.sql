-- ============================================================
-- AIgenciaLab v2 Migrations
-- REGLA ABSOLUTA: NUNCA DROP. Solo ADD COLUMN / CREATE TABLE.
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ── billing_profiles: new columns ────────────────────────────────────
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS impl_paid_at TIMESTAMPTZ;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS billing_start_date DATE;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS currency_preference TEXT DEFAULT 'CLP';
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'CL';

-- ── subscriptions: new columns ────────────────────────────────────────
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS impl_paid_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_start_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS last_billing_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;

-- ── fx_cache ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fx_cache (
  pair TEXT PRIMARY KEY,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── workspaces ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan_slug TEXT NOT NULL,
  status TEXT DEFAULT 'onboarding',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── agents ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  client_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'training',
  embed_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── contact_requests ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  team_size TEXT,
  message TEXT,
  channels_interest TEXT,
  plan_interest TEXT DEFAULT 'enterprise',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- ── tickets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  admin_response TEXT
);

-- ── RLS Policies ──────────────────────────────────────────────────────
ALTER TABLE fx_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- fx_cache: service role only
DROP POLICY IF EXISTS "service_role_only_fx" ON fx_cache;
CREATE POLICY "service_role_only_fx" ON fx_cache
  USING (auth.role() = 'service_role');

-- workspaces: owner access
DROP POLICY IF EXISTS "owner_access_workspaces" ON workspaces;
CREATE POLICY "owner_access_workspaces" ON workspaces
  USING (auth.uid() = user_id);

-- workspaces: service role full access
DROP POLICY IF EXISTS "service_role_workspaces" ON workspaces;
CREATE POLICY "service_role_workspaces" ON workspaces
  USING (auth.role() = 'service_role');

-- agents: workspace owner access
DROP POLICY IF EXISTS "workspace_agents" ON agents;
CREATE POLICY "workspace_agents" ON agents
  USING (
    client_id = auth.uid()
    OR workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- contact_requests: service role only
DROP POLICY IF EXISTS "service_role_contact" ON contact_requests;
CREATE POLICY "service_role_contact" ON contact_requests
  USING (auth.role() = 'service_role');

-- tickets: client own + service role
DROP POLICY IF EXISTS "client_own_tickets" ON tickets;
CREATE POLICY "client_own_tickets" ON tickets
  USING (
    client_id = auth.uid()
    OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "client_insert_tickets" ON tickets;
CREATE POLICY "client_insert_tickets" ON tickets
  FOR INSERT WITH CHECK (client_id = auth.uid());

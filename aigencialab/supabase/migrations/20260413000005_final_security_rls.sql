-- Final Security and RLS Hardening for Production
-- ═══════════════════════════════════════════════════════════════

-- ── 1. RLS Policies for Leads ─────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view their own leads" ON public.leads;
CREATE POLICY "Clients can view their own leads" ON public.leads
    FOR ALL USING (client_id = auth.uid());

-- ── 2. RLS Policies for Tickets ───────────────────────────────
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view their own tickets" ON public.tickets;
CREATE POLICY "Clients can view their own tickets" ON public.tickets
    FOR ALL USING (client_id = auth.uid());

-- ── 3. RLS Policies for Alerts ────────────────────────────────
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view their own alerts" ON public.alerts;
CREATE POLICY "Clients can view their own alerts" ON public.alerts
    FOR ALL USING (client_id = auth.uid());

-- ── 4. RLS Policies for Audit Logs ────────────────────────────
-- Clients should only see logs related to their own actions (if module is client-related)
-- For now, let's keep it restricted to service_role or admin
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view their own audit logs" ON public.audit_logs;
CREATE POLICY "Clients can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());

-- ── 5. Admin Access ───────────────────────────────────────────
-- Admin role (handled via custom claims or public.admins table)
-- Assuming we have an 'is_admin' column or similar in auth.users or a separate role
-- For this setup, we'll assume a specific UUID or role check if available.
-- Given the current schema, we'll add a helper for admin checks if needed.

-- ── 6. Global Settings (Fase 6) ────────────────────────────────
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage global settings" ON public.global_settings;
-- Only service_role by default unless we define admin users
-- For demo purposes, we'll allow read to authenticated users
CREATE POLICY "Authenticated users can view global settings" ON public.global_settings
    FOR SELECT USING (auth.role() = 'authenticated');

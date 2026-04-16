-- ═══════════════════════════════════════════════════════════════════════
-- AIgenciaLab — FIX TRIAL DATES & POPULATE MISSING DATA
-- Copiar y pegar en Supabase SQL Editor DESPUÉS de CRITICAL_FIXES.sql
-- URL: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
-- ═══════════════════════════════════════════════════════════════════════

-- ── Fix trial_ends_at: Set all future-dated trials to 14 days from now ─
-- (Any client with trial_ends_at > 30 days from now is considered wrong)
UPDATE public.clients
SET trial_ends_at = now() + INTERVAL '14 days'
WHERE trial_ends_at > now() + INTERVAL '30 days'
  AND (status = 'pending' OR status = 'onboarding' OR status = 'trialing');

UPDATE public.subscriptions
SET 
  trial_ends_at = now() + INTERVAL '14 days',
  status = 'trialing'
WHERE trial_ends_at > now() + INTERVAL '30 days'
  AND status IN ('trialing', 'pending');

-- ── For clients WITHOUT a subscription row, create one ─────────────────
INSERT INTO public.subscriptions (client_id, plan, status, trial_ends_at)
SELECT c.id, COALESCE(c.plan, 'Starter'), 'trialing', COALESCE(c.trial_ends_at, now() + INTERVAL '14 days')
FROM public.clients c
LEFT JOIN public.subscriptions s ON s.client_id = c.id
WHERE s.client_id IS NULL
ON CONFLICT (client_id) DO NOTHING;

-- ── For clients WITHOUT a bot_configs row, create default ──────────────
INSERT INTO public.bot_configs (client_id, bot_name, name, active, widget_color, welcome_message, language)
SELECT c.id, 'Asistente IA', 'Asistente IA', false, '#6366f1', '¡Hola! ¿En qué puedo ayudarte?', 'es'
FROM public.clients c
LEFT JOIN public.bot_configs b ON b.client_id = c.id
WHERE b.client_id IS NULL
ON CONFLICT (client_id) DO NOTHING;

-- ── Sync company_name from company field where company_name is null ─────
UPDATE public.clients
SET company_name = company
WHERE company_name IS NULL AND company IS NOT NULL;

-- ── Sync contact_name to full_name where full_name is null ─────────────
UPDATE public.clients
SET full_name = contact_name
WHERE full_name IS NULL AND contact_name IS NOT NULL;

-- ── Verify results ─────────────────────────────────────────────────────
SELECT 
  'clients' AS tbl, 
  count(*) AS total,
  count(*) FILTER (WHERE trial_ends_at > now() + INTERVAL '30 days') AS bad_trial_dates,
  count(*) FILTER (WHERE company_name IS NULL AND company IS NULL) AS no_name
FROM public.clients
UNION ALL
SELECT 
  'subscriptions', 
  count(*),
  count(*) FILTER (WHERE trial_ends_at > now() + INTERVAL '30 days'),
  0
FROM public.subscriptions
UNION ALL
SELECT 'bot_configs', count(*), 0, 0 FROM public.bot_configs;

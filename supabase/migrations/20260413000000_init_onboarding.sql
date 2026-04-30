-- 1. Tables Creation

-- Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    company_name TEXT NOT NULL,
    website TEXT,
    plan TEXT CHECK (plan IN ('Starter', 'Pro', 'Enterprise')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    tenant_id UUID NOT NULL, -- usually equals id for single owner
    created_at TIMESTAMPTZ DEFAULT NOW(),
    logo_url TEXT
);

-- Bot Configs Table
CREATE TABLE IF NOT EXISTS public.bot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    bot_name TEXT DEFAULT 'Asistente IA',
    active BOOLEAN DEFAULT false,
    widget_color TEXT DEFAULT '#0066CC',
    language TEXT DEFAULT 'es',
    welcome_message TEXT DEFAULT '¡Hola! ¿En qué puedo ayudarte hoy?',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    key UUID DEFAULT gen_random_uuid(),
    scope TEXT DEFAULT 'widget' CHECK (scope IN ('widget', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Onboarding Progress Table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
    client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
    step_completed INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ
);

-- 2. RLS Policies

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Clients: each client only sees their own record
CREATE POLICY "Clients can view own data" ON public.clients
    FOR ALL USING (id = auth.uid());

-- Bot Configs: each client only sees their own records
CREATE POLICY "Clients can view own bot configs" ON public.bot_configs
    FOR ALL USING (client_id = auth.uid());

-- API Keys: each client only sees their own records
CREATE POLICY "Clients can view own api keys" ON public.api_keys
    FOR ALL USING (client_id = auth.uid());

-- Onboarding Progress: each client only sees their own records
CREATE POLICY "Clients can view own onboarding progress" ON public.onboarding_progress
    FOR ALL USING (client_id = auth.uid());

-- 3. Automation: Create records on user confirmation

CREATE OR REPLACE FUNCTION public.handle_new_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- We use raw_user_meta_data to get the company name, etc. passed during signUp
  INSERT INTO public.clients (id, email, company_name, website, plan, tenant_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Nueva Empresa'),
    NEW.raw_user_meta_data->>'website',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Starter'),
    NEW.id
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.bot_configs (client_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.api_keys (client_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.onboarding_progress (client_id, step_completed) VALUES (NEW.id, 0) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger should fire when email is confirmed
-- Note: Check if trigger already exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user_confirmation();

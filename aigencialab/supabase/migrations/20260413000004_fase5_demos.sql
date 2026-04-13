-- Migration for Fase 5: Agents & Demos
-- ═══════════════════════════════════════════════════════════════

-- 1. Extend bot_configs table
ALTER TABLE public.bot_configs ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;
ALTER TABLE public.bot_configs ADD COLUMN IF NOT EXISTS llm_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.bot_configs ADD COLUMN IF NOT EXISTS daily_conv_limit INTEGER DEFAULT 100;

-- 2. Create demo_leads table (isolated from real client leads)
CREATE TABLE IF NOT EXISTS public.demo_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES public.bot_configs(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    company TEXT,
    industry TEXT,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. RLS for demo_leads
ALTER TABLE public.demo_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can view all demo leads" ON public.demo_leads;
CREATE POLICY "Admin can view all demo leads" ON public.demo_leads
    FOR ALL USING (true); 

-- 4. Create Demo Clients
INSERT INTO public.clients (id, email, company_name, website, plan, status, tenant_id)
VALUES 
    ('d1e00000-0000-4000-8000-000000000001', 'demo-atencion@aigencialab.cl', 'Demo Atención', 'https://aigencialab.cl/demos/agente-atencion', 'Enterprise', 'active', 'd1e00000-0000-4000-8000-000000000001'),
    ('d1e00000-0000-4000-8000-000000000002', 'demo-ventas@aigencialab.cl', 'Demo Ventas', 'https://aigencialab.cl/demos/agente-ventas', 'Enterprise', 'active', 'd1e00000-0000-4000-8000-000000000002'),
    ('d1e00000-0000-4000-8000-000000000003', 'demo-soporte@aigencialab.cl', 'Demo Soporte', 'https://aigencialab.cl/demos/agente-soporte', 'Enterprise', 'active', 'd1e00000-0000-4000-8000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Demo Bots
-- Agente de Atención
INSERT INTO public.bot_configs (id, client_id, bot_name, active, widget_color, welcome_message, is_demo, llm_config)
VALUES (
    'b0000000-0000-4000-a000-000000000001',
    'd1e00000-0000-4000-8000-000000000001',
    'Nova · Atención al Cliente',
    true,
    '#10b981',
    '¡Hola! Soy Nova, tu asistente de atención. ¿En qué puedo ayudarte hoy?',
    true,
    '{"system_prompt": "Eres Nova, una asistente de atención al cliente empática, resolutiva y clara. Tu objetivo es resolver dudas frecuentes (FAQs) y ayudar con el estado de pedidos. Cuando el usuario menciona un problema no resuelto o muestra frustración, ofrece crear un ticket de soporte capturando su nombre y email. Si pregunta por horarios: Lunes a Viernes 9:00 a 18:00. Si pregunta por devoluciones: 30 días con boleta."}'
) ON CONFLICT (id) DO UPDATE SET bot_name = EXCLUDED.bot_name, llm_config = EXCLUDED.llm_config;

-- Agente de Ventas
INSERT INTO public.bot_configs (id, client_id, bot_name, active, widget_color, welcome_message, is_demo, llm_config)
VALUES (
    'b0000000-0000-4000-a000-000000000002',
    'd1e00000-0000-4000-8000-000000000002',
    'Atlas · Consultor Comercial',
    true,
    '#2563eb',
    'Bienvenido. Soy Atlas. ¿Buscas automatizar procesos en tu empresa?',
    true,
    '{"system_prompt": "Eres Atlas, un consultor de ventas comercial experto en IA, no agresivo y orientado a aportar valor. Tu objetivo es calificar al lead y ofrecer una demo personalizada. Cuando el usuario muestre intención de compra o interés serio, ofrece agendar una demo capturando su Nombre, Email y Empresa. Resalta que AigenciaLab reduce el overhead operativo en un 40%."}'
) ON CONFLICT (id) DO UPDATE SET bot_name = EXCLUDED.bot_name, llm_config = EXCLUDED.llm_config;

-- Agente de Soporte Técnico
INSERT INTO public.bot_configs (id, client_id, bot_name, active, widget_color, welcome_message, is_demo, llm_config)
VALUES (
    'b0000000-0000-4000-a000-000000000003',
    'd1e00000-0000-4000-8000-000000000003',
    'Cipher · Soporte Técnico',
    true,
    '#6366f1',
    'Cipher reportándose. ¿Tienes algún problema técnico con la plataforma?',
    true,
    '{"system_prompt": "Eres Cipher, un técnico especialista preciso y orientado a la solución paso a paso. Tu tono es profesional y ligeramente tecnológico. Tu objetivo es diagnosticar problemas y proporcionar documentación. Si el problema persiste, escala a un ingeniero humano capturando los detalles del error y el email del usuario."}'
) ON CONFLICT (id) DO UPDATE SET bot_name = EXCLUDED.bot_name, llm_config = EXCLUDED.llm_config;

-- 6. Insert Demo API Keys
INSERT INTO public.api_keys (client_id, key, scope)
VALUES 
    ('d1e00000-0000-4000-8000-000000000001', 'demo-atencion-key-2026', 'widget'),
    ('d1e00000-0000-4000-8000-000000000002', 'demo-ventas-key-2026', 'widget'),
    ('d1e00000-0000-4000-8000-000000000003', 'demo-soporte-key-2026', 'widget')
ON CONFLICT DO NOTHING;

-- 7. Add Origin tracking to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'direct';

-- 8. Update Registration Trigger to handle origin
CREATE OR REPLACE FUNCTION public.handle_new_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (id, email, company_name, website, plan, tenant_id, origin)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Nueva Empresa'),
    NEW.raw_user_meta_data->>'website',
    COALESCE(NEW.raw_user_meta_data->>'plan', 'Starter'),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'origin', 'direct')
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.bot_configs (client_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.api_keys (client_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.onboarding_progress (client_id, step_completed) VALUES (NEW.id, 0) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

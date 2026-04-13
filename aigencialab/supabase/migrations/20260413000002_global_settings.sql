-- Global settings for AIgenciaLab
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    plans JSONB DEFAULT '[
        {"name": "Starter", "price": 49, "max_bots": 1, "max_convs": 500, "max_leads": 100},
        {"name": "Pro", "price": 149, "max_bots": 3, "max_convs": 2500, "max_leads": 500},
        {"name": "Enterprise", "price": 499, "max_bots": 10, "max_convs": 10000, "max_leads": 2000}
    ]'::jsonb,
    email_templates JSONB DEFAULT '{
        "welcome": {"subject": "Bienvenido a AIgenciaLab", "body": "Hola, gracias por unirte..."},
        "activation": {"subject": "Tu Bot está listo", "body": "Felicidades, tu bot ha sido activado..."},
        "alert": {"subject": "Nueva alerta en tu bot", "body": "Se ha detectado un evento..."}
    }'::jsonb,
    webhooks JSONB DEFAULT '[]'::jsonb,
    feature_flags JSONB DEFAULT '{"new_dashboard": true, "beta_gemini": false}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial record
INSERT INTO public.settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

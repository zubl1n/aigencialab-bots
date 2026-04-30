-- ============================================================
-- AIgenciaLab — DEPLOY CHECKLIST (ejecutar antes de vercel --prod)
-- ============================================================

-- 1. VERIFICAR env vars en Vercel (Settings → Environment Variables)
--    NEXT_PUBLIC_SUPABASE_URL          ← Dashboard > Project Settings > API
--    NEXT_PUBLIC_SUPABASE_ANON_KEY     ← Dashboard > Project Settings > API
--    SUPABASE_SERVICE_ROLE_KEY         ← Dashboard > Project Settings > API (secret)
--    MP_ACCESS_TOKEN                   ← MercadoPago Developers > Credenciales
--    MP_WEBHOOK_SECRET                 ← MercadoPago webhooks config
--    MP_PLAN_ID_STARTER                ← MP Dashboard > Suscripciones > Planes
--    MP_PLAN_ID_PRO                    ← MP Dashboard > Suscripciones > Planes
--    MP_PLAN_ID_BUSINESS               ← MP Dashboard > Suscripciones > Planes
--    NEXT_PUBLIC_SITE_URL              = https://aigencialab.cl
--    ADMIN_NOTIFICATION_EMAIL          = admin@aigencialab.cl
--    RESEND_API_KEY                    ← resend.com > API Keys
--    RESEND_FROM_EMAIL                 = noreply@aigencialab.cl
--    NEXT_PUBLIC_WIDGET_BASE_URL       = https://aigencialab.cl

-- 2. SUPABASE: ejecutar migrations pendientes
--    supabase db push
--    O copiar y ejecutar manualmente en SQL Editor:
--    • supabase/migrations/20260415003000_conversation_stats.sql
--    • supabase/migrations/20260415000000_test_user_prueba.sql (reemplazar <USER_ID>)

-- 3. MERCADOPAGO: configurar webhook
--    URL: https://aigencialab.cl/api/billing/webhook
--    Eventos: subscription_preapproval, payment

-- 4. RESEND: verificar dominio
--    resend.com > Domains > Add Domain: aigencialab.cl
--    Agregar registros DNS (MX + DKIM + DMARC)

-- 5. DEPLOY
--    vercel --prod

-- 6. VERIFICAR RUTAS POST-DEPLOY
SELECT 'Verificar estas rutas en producción:' AS instruccion;
SELECT '/' AS ruta, 'Landing + OG image + StickyBanner' AS descripcion
UNION ALL SELECT '/precios', 'Precios desde PLANS_LIST (USD por defecto)'
UNION ALL SELECT '/register', 'Registro con plan pre-seleccionado'
UNION ALL SELECT '/audit', 'Formulario de auditoría'
UNION ALL SELECT '/blog', 'Listado de artículos'
UNION ALL SELECT '/casos-exito', 'Casos de uso'
UNION ALL SELECT '/sitemap.xml', 'SEO: 70+ URLs'
UNION ALL SELECT '/robots.txt', 'SEO: bloquea /admin /dashboard'
UNION ALL SELECT '/admin/clientes', 'Admin: lista con CSV export'
UNION ALL SELECT '/admin/alertas', 'Admin: alertas con filtros + resolve'
UNION ALL SELECT '/admin/clientes/[id]', 'Admin: detalle + bot-editor + widget snippet'
UNION ALL SELECT '/api/billing/webhook', 'POST desde MercadoPago'
UNION ALL SELECT '/api/admin/export/clients', 'GET → CSV clientes'
UNION ALL SELECT '/api/widget/CLIENT_ID/script.js', 'Widget embebible'
UNION ALL SELECT '/widget/CLIENT_ID', 'Preview chat widget';

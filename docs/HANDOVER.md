# AIgenciaLab Handover Documentation (Abril 2026)

## 1. Arquitectura del Sistema
AIgenciaLab opera como una plataforma SaaS multi-inquilino (multi-tenant) construida sobre Next.js y Supabase.

- **Frontend (Marketing/Dashboard):** Next.js 14+ (App Router).
- **Backend-as-a-Service:** Supabase (Auth, DB, Storage).
- **IA Engine:** Supabase Edge Functions que interactúan con OpenAI (GPT-4o) y motores de búsqueda para RAG.
- **Widget de Cliente:** Script Vanilla JS cargado vía `<script>` que inyecta un Shadow DOM para aislamiento visual.

## 2. Variables de Entorno (Vercel)
| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de la instancia de Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key anónima para operaciones cliente. |
| `SUPABASE_SERVICE_ROLE_KEY` | Key de administración (SOLO SERVER SIDE). |
| `OPENAI_API_KEY` | Key para inferencia de agentes (usada en Edge Functions). |
| `RESEND_API_KEY` | Para envío de correos transaccionales (Bienvenida/Activación). |
| `STRIPE_SECRET_KEY` | (Opcional) Para gestión de pagos. |

## 3. Base de Datos (Supabase Schema)
### Tablas Principales:
- `clients`: Perfil de empresa y plan suscrito.
- `bot_configs`: Configuración técnica del bot (nombre, colores, prompt, activo).
- `leads`: CRM de prospectos capturados.
- `conversations`: Registro de chats por sesión.
- `messages`: Mensajes individuales (id, contenido, dirección in/out).
- `api_keys`: Keys por cliente para validar el widget.

### Seguridad (RLS):
Todas las tablas tienen **Row Level Security** activado. Las políticas aseguran que un `client_id` solo acceda a datos donde `auth.uid() = client_id`.

## 4. Roles y Permisos
- **Admin (AIgenciaLab):** Rol con acceso al directorio `/admin`. Puede activar/suspender clientes y ver métricas globales.
- **Cliente (User):** Rol estándar al registrarse. Acceso a `/dashboard` para configurar su bot y ver sus leads/chats.

## 5. Extensibilidad
### Añadir un nuevo tipo de Bot:
1. Crear el prompt base en `bot-config` Edge Function.
2. Añadir la opción en el enum de `bot_configs.bot_type` (si se requiere segmentación).
3. Actualizar el wizard de onboarding en `/dashboard/onboarding`.

### Flujo de Despliegue:
1. `git push origin main` → Gatilla build automático en Vercel.
2. Las Edge Functions de Supabase se despliegan vía Supabase CLI: `supabase functions deploy`.

## 6. Contactos de Soporte
- **Infraestructura:** Supabase Support / Vercel Enterprise.
- **Pagos:** Stripe Dashboard.
- **Emails:** Resend Dashboard.

---
*AIgenciaLab v1.0.0 — Cumplimiento Ley 21.663 / 19.628*

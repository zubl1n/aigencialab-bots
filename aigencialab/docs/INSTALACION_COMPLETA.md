# 📖 INSTALACIÓN COMPLETA — AigenciaLab.cl
### Stack: Next.js 14 + Supabase + Vercel · SOP v1.0

---

## REQUISITOS PREVIOS

| Herramienta | Versión mínima | Verificar con |
|-------------|---------------|--------------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | 2.x | `git --version` |
| Cuenta Supabase | — | supabase.com |
| Cuenta Vercel | — | vercel.com |

---

## 1. CLONAR Y PREPARAR EL PROYECTO LOCAL

```bash
# Ir a la carpeta del proyecto
cd aigencialab

# Instalar dependencias
npm install

# Copiar variables de entorno de ejemplo
cp .env.example .env.local
```

Luego editar `.env.local` con tus valores reales (ver sección 3).

---

## 2. CREAR PROYECTO EN SUPABASE (5 minutos)

1. Ir a **https://supabase.com** → **Start your project** → Login con GitHub
2. **New Project**:
   - Nombre: `aigencialab-prod`
   - Password: uno fuerte (guárdalo)
   - Region: `East US (N. Virginia)` ← más cercano a Chile
3. Esperar ~2 minutos a que termine de provisionar
4. Ir a **Settings → API**:
   - Copiar **Project URL** → pegar en `NEXT_PUBLIC_SUPABASE_URL`
   - Copiar **anon/public key** → pegar en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copiar **service_role key** → pegar en `SUPABASE_SERVICE_ROLE_KEY`
5. Ir a **SQL Editor → New Query**:
   - Pegar el contenido completo de `supabase/migrations/001_initial_schema.sql`
   - Ejecutar (▶ Run)
   - Verificar: aparecen 7 tablas en **Table Editor**

---

## 3. VARIABLES DE ENTORNO `.env.local`

```bash
# ── SUPABASE (obligatorias) ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# ── SITE CONFIG ──────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000          # cambiar a https://aigencialab.cl en producción
NEXT_PUBLIC_SITE_NAME=AigenciaLab.cl
NEXT_PUBLIC_WA_SALES_NUMBER=56912345678            # número real de WhatsApp de ventas

# ── GOOGLE PAGESPEED (opcional) ──────────────────────────────
# Sin key: 100 auditorías/día gratuitas
# Con key: ilimitadas — obtener en console.cloud.google.com
GOOGLE_PSI_API_KEY=

# ── WHATSAPP META CLOUD API ──────────────────────────────────
WA_APP_SECRET=                    # App Secret de Meta (para validar firma webhook)
WA_VERIFY_TOKEN=aigencialab_wh_2024   # Tu token personalizado de verificación

# ── RESEND (email, optional) ─────────────────────────────────
# Gratis: 3.000 emails/mes — registrar en resend.com
RESEND_API_KEY=re_XXXX
RESEND_FROM_EMAIL=hola@aigencialab.cl
RESEND_TO_EMAIL=tumail@gmail.com   # donde recibes notificaciones de leads
```

---

## 4. LEVANTAR EN LOCAL

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador:
# http://localhost:3000          ← Landing principal
# http://localhost:3000/audit    ← Auditoría gratuita
# http://localhost:3000/login    ← Login dashboard
# http://localhost:3000/dashboard ← Panel (requiere login)
```

---

## 5. CREAR USUARIO ADMIN EN SUPABASE

1. Ir a **Supabase → Authentication → Users → Add user**
2. Email: `admin@aigencialab.cl` (o el que prefieras)
3. Password: seguro
4. Confirmar → el usuario puede hacer login en `/login`

---

## 6. VERIFICACIÓN LOCAL (checklist)

- [ ] `npm run dev` arranca sin errores en consola
- [ ] Landing carga en `http://localhost:3000`
- [ ] Auditoría en `/audit` realiza análisis y muestra reporte
- [ ] Lead aparece en Supabase → Table Editor → `leads`
- [ ] Login en `/login` con usuario Supabase → redirige a `/dashboard`
- [ ] Dashboard muestra KPIs reales desde Supabase
- [ ] Leads page muestra tabla con datos
- [ ] Onboarding crea cliente → aparece en Supabase → `clients`
- [ ] Export CSV en `/api/leads/export` descarga archivo

---

## 7. ERRORES COMUNES

| Error | Solución |
|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | `.env.local` no existe o no tiene la variable |
| `Invalid API key` Supabase | Usaste `anon key` donde se necesita `service_role` (o viceversa) |
| `Failed to fetch` en auditoría | Variable `NEXT_PUBLIC_SUPABASE_URL` incorrecta |
| Login redirige al login | Usuario no creado en Supabase Auth |
| `relation "leads" does not exist` | SQL schema no ejecutado en Supabase |
| Dashboard en blanco | Error en query → revisar F12 y logs del servidor |
| Webhook WhatsApp 403 | `WA_VERIFY_TOKEN` diferente al configurado en Meta |

*AigenciaLab.cl · Instalación Completa · SOP v1.0*

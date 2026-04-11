# 🏗️ Arquitectura Enterprise SaaS — AigenciaLab.cl
### Documento de Arquitectura Cloud + Estrategia Comercial
### v2.0 · Chile 2026

---

## 1. Arquitectura Defensiva y Continuidad Operativa

### 1.1 Sanitización AI — Middleware Anti-Prompt Injection

```
┌──────────────────────────────────────────────────────────────┐
│                    REQUEST PIPELINE                          │
│                                                              │
│  User Input → [Sanitizer] → [Rate Limiter] → [AI Engine]    │
│                    ↓                                         │
│         ┌─────────────────┐                                  │
│         │ VALIDATION LAYER│                                  │
│         ├─────────────────┤                                  │
│         │ 1. Regex Filter │ ← Elimina <script>, SQL inject  │
│         │ 2. Token Limit  │ ← Max 500 tokens por mensaje    │
│         │ 3. Blocklist    │ ← "ignore previous", "act as"   │
│         │ 4. Context Lock │ ← System prompt inmutable        │
│         │ 5. Output Guard │ ← Filtra datos sensibles (RUT)  │
│         └─────────────────┘                                  │
└──────────────────────────────────────────────────────────────┘
```

**Implementación en cada agente:**
```javascript
// middleware/sanitizer.js
function sanitizeInput(text) {
  const BLOCKED = [
    /ignore\s+(previous|all|above)/i,
    /act\s+as/i, /you\s+are\s+now/i,
    /system\s*prompt/i, /reveal\s+(your|the)/i,
    /<script/i, /javascript:/i,
    /UNION\s+SELECT/i, /DROP\s+TABLE/i,
    /\b\d{7,8}-[\dkK]\b/  // RUT chileno
  ];
  for (const rx of BLOCKED) {
    if (rx.test(text)) return { blocked: true, reason: 'INPUT_REJECTED' };
  }
  return { blocked: false, clean: text.slice(0, 2000) }; // hard limit
}
```

### 1.2 Aislamiento Multi-Tenant + RBAC

```
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE MULTI-TENANT                      │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │Tenant A │  │Tenant B │  │Tenant C │  ← Row Level Sec.  │
│  │(PYME)   │  │(Retail) │  │(Clinic) │                     │
│  └────┬────┘  └────┬────┘  └────┬────┘                    │
│       │            │            │                           │
│  ┌────▼────────────▼────────────▼────┐                     │
│  │        tenants (tabla maestra)     │                     │
│  │  id | name | plan | api_key       │                     │
│  └───────────────────────────────────┘                     │
│                                                             │
│  RLS Policy:                                                │
│  SELECT * FROM leads                                        │
│  WHERE tenant_id = auth.jwt() -> 'tenant_id'               │
└─────────────────────────────────────────────────────────────┘
```

**Esquema de Base de Datos:**
```sql
-- Tabla de tenants (clientes de AigenciaLab)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT CHECK (plan IN ('starter','pro','enterprise')),
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'),
  domain TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Roles y permisos por tenant
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','manager','agent','viewer')),
  status TEXT DEFAULT 'active',
  last_login TIMESTAMPTZ,
  UNIQUE(tenant_id, email)
);

-- Leads (multi-tenant isolated)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  company TEXT, contact_name TEXT, url TEXT,
  score INTEGER DEFAULT 0, tier TEXT, source TEXT,
  whatsapp TEXT, email TEXT, rubro TEXT,
  assigned_to UUID REFERENCES tenant_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON leads
  USING (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);
```

**Roles RBAC:**

| Rol | Dashboard | Leads | Config | Usuarios | Agentes | Facturación |
|-----|-----------|-------|--------|----------|---------|-------------|
| **Admin** | ✅ Total | ✅ CRUD | ✅ | ✅ CRUD | ✅ Config | ✅ |
| **Manager** | ✅ Total | ✅ CRUD | ✅ Read | ❌ | ✅ Read | ✅ Read |
| **Agent** | ✅ Parcial | ✅ Solo asignados | ❌ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ Read | ✅ Read | ❌ | ❌ | ❌ | ❌ |

### 1.3 Infraestructura Event-Driven (Webhooks)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EVENT-DRIVEN ARCHITECTURE                        │
│                   (POLLING PROHIBIDO ⛔)                            │
│                                                                     │
│  WooCommerce ───webhook──→ ┌──────────────────┐                    │
│  (PHP/WordPress)           │                  │                    │
│    order.created ─────────→│  Vercel Edge     │──→ Supabase        │
│    order.updated ─────────→│  Functions       │──→ Agent Engine    │
│    stock.updated ─────────→│  (Node.js 20)    │──→ Notifications   │
│    product.created ───────→│                  │                    │
│                            │  HMAC-SHA256     │                    │
│  Shopify ──webhook───────→│  Verification    │                    │
│    orders/create ─────────→│                  │                    │
│    inventory_levels/ ─────→└──────────────────┘                    │
│    update                                                           │
│                                                                     │
│  REGLA: Toda ingesta es PUSH (webhooks). Nunca PULL (polling).     │
└─────────────────────────────────────────────────────────────────────┘
```

**Webhook Handlers:**
```
/api/webhooks/woocommerce   ← WordPress + WooCommerce events
/api/webhooks/shopify       ← Shopify event subscription
/api/webhooks/whatsapp      ← Meta Cloud API (mensajes)
/api/webhooks/instagram     ← Instagram DM via Messenger API
```

**Validación de firma (WooCommerce):**
```javascript
// api/webhooks/woocommerce/route.ts
import { createHmac } from 'crypto';

export async function POST(req) {
  const signature = req.headers.get('x-wc-webhook-signature');
  const body = await req.text();
  const expected = createHmac('sha256', process.env.WC_WEBHOOK_SECRET)
    .update(body).digest('base64');
  if (signature !== expected) return new Response('Forbidden', { status: 403 });
  
  const event = JSON.parse(body);
  // Route to handler based on topic header
  const topic = req.headers.get('x-wc-webhook-topic');
  // order.created → update inventory + notify agent
  // stock.updated → sync dashboard metrics
}
```

### 1.4 Omnicanalidad Unificada (RAG Centralizado)

```
┌───────────────────────────────────────────────────────────────────┐
│                  ORQUESTADOR OMNICANAL                            │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Webchat  │ │WhatsApp  │ │Instagram │ │ Email    │            │
│  │ Widget   │ │ Business │ │ Direct   │ │          │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │            │            │            │                    │
│  ┌────▼────────────▼────────────▼────────────▼────┐              │
│  │          SESSION MANAGER (Redis/Supabase)       │              │
│  │    session_id | channel | user_id | context     │              │
│  │    Persiste estado entre canales                │              │
│  └─────────────────────┬──────────────────────────┘              │
│                        │                                          │
│  ┌─────────────────────▼──────────────────────────┐              │
│  │            RAG ENGINE (Base de Conocimiento)    │              │
│  │                                                 │              │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐  │              │
│  │  │  FAQs   │  │ Catálogo │  │  Políticas   │  │              │
│  │  │  PDF    │  │ Productos│  │  Devolución  │  │              │
│  │  └─────────┘  └──────────┘  └──────────────┘  │              │
│  │                                                 │              │
│  │  Vector Store: pgvector (Supabase)              │              │
│  │  Embedding: text-embedding-3-small              │              │
│  │  Chunk size: 512 tokens, overlap: 50            │              │
│  └─────────────────────────────────────────────────┘              │
└───────────────────────────────────────────────────────────────────┘
```

**Persistencia de sesión cross-channel:**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  user_identifier TEXT, -- phone, email, or browser fingerprint
  channel TEXT, -- 'webchat', 'whatsapp', 'instagram', 'email'
  context JSONB DEFAULT '{}',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  -- When user switches channel, find by user_identifier
  UNIQUE(tenant_id, user_identifier)
);
```

### 1.5 Entorno Sandbox (Staging)

```
┌─────────────────────────────────────────────────────────────┐
│              PROTOCOLO DE DESPLIEGUE                        │
│                                                             │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐        │
│  │ Development│ →  │  Sandbox   │ →  │ Production │        │
│  │ localhost  │    │  staging   │    │  .cl       │        │
│  └────────────┘    └──────┬─────┘    └────────────┘        │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │  REGLAS:    │                          │
│                    │ • DB aislada│                          │
│                    │ • Datos fake│                          │
│                    │ • Webhooks  │                          │
│                    │   mock      │                          │
│                    │ • Rate limit│                          │
│                    │   relajado  │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**Configuración Vercel:**
```json
{
  "env": {
    "SUPABASE_URL": "@supabase-production-url",
    "SUPABASE_KEY": "@supabase-production-key"
  },
  "preview": {
    "env": {
      "SUPABASE_URL": "@supabase-sandbox-url",
      "SUPABASE_KEY": "@supabase-sandbox-key",
      "SANDBOX_MODE": "true"
    }
  }
}
```

---

## 2. Estructura Comercial SaaS

### Estandarización en UF (Unidad de Fomento)

> Todos los valores están en **UF** para proteger contra inflación y estandarizar la facturación B2B en Chile.  
> Referencia: 1 UF ≈ $38.000 CLP (abril 2026)

### Growth Hack: Drop-Down Pricing (60% OFF Setup)

```
╔═══════════════════════════════════════════════════════════╗
║  ESTRATEGIA DE CAPTACIÓN ACELERADA                       ║
║                                                           ║
║  El 60% de descuento en Setup es la PALANCA de cierre.   ║
║  La rentabilidad viene del MRR (retainer mensual).        ║
║                                                           ║
║  Setup UF 25 → UF 10 (60% OFF)  ← Hook de venta         ║
║  MRR UF 8/mes × 12 meses = UF 96/año ← Rentabilidad     ║
║                                                           ║
║  LTV estimado (24 meses): UF 192 + Setup = UF 202        ║
║  CAC target: < UF 15 (ROI 13:1)                          ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 3. Tiers de Suscripción

### 🟢 Plan Starter (Entry-Level PYME)

| Concepto | Valor Normal | **Valor Lanzamiento** |
|----------|:----------:|:--------------------:|
| **Setup** (Implementación) | UF 15 | **UF 6** (60% OFF) |
| **MRR** (Mensualidad) | — | **UF 5/mes** |

**Incluye:**
- ✅ 1 Agente Omnicanal (Webchat + WhatsApp)
- ✅ Ingesta de FAQs (texto/PDF estático, hasta 50 preguntas)
- ✅ Widget embebible para cualquier web (1 línea de código)
- ✅ Dashboard básico con métricas de conversación
- ✅ Almacenamiento: 500 conversaciones/mes
- ✅ SLA Soporte: 48 horas hábiles (email)
- ❌ Sin sincronización ecommerce
- ❌ Sin dashboard multi-tenant

**Ideal para:** Consultorios, restaurantes, servicios profesionales, tiendas locales.

---

### 🟡 Plan Pro (Core Ecommerce)

| Concepto | Valor Normal | **Valor Lanzamiento** |
|----------|:----------:|:--------------------:|
| **Setup** (Implementación) | UF 35 | **UF 14** (60% OFF) |
| **MRR** (Mensualidad) | — | **UF 12/mes** |

**Incluye todo lo de Starter, más:**
- ✅ Agente de Ventas & Inventario con IA predictiva
- ✅ Sincronización Webhooks bidireccional (WooCommerce/Shopify)
- ✅ Dashboard **"Harmonic Office"** — gestión operativa completa
- ✅ 3 canales simultáneos (Webchat + WhatsApp + Instagram)
- ✅ Base de Conocimiento RAG (catálogo de productos automático)
- ✅ Almacenamiento: 5.000 conversaciones/mes
- ✅ Exportación CSV + Generador de propuestas PDF
- ✅ 3 usuarios con roles (Admin, Agent, Viewer)
- ✅ SLA Preventivo: 24 horas (email + WhatsApp)
- ✅ Onboarding guiado (2 horas)

**Ideal para:** Ecommerce, retail, distribuidoras, tiendas online.

---

### 🔴 Plan Enterprise (Infraestructura Dedicada)

| Concepto | Valor Normal | **Valor Lanzamiento** |
|----------|:----------:|:--------------------:|
| **Setup** (Implementación) | UF 80 | **UF 32** (60% OFF) |
| **MRR** (Mensualidad) | — | **UF 28/mes** |

**Incluye todo lo de Pro, más:**
- ✅ Ecosistema completo: Ventas + Logística + Ciberseguridad + Analytics Predictivo
- ✅ Dashboard Multi-Tenant avanzado con RBAC completo
- ✅ Entorno **Sandbox dedicado** para pruebas de estrés
- ✅ Middleware Anti-Prompt Injection (blindaje IA)
- ✅ Omnicanalidad 5 canales (Webchat + WA + IG + Email + SMS)
- ✅ RAG avanzado con pgvector (100K+ documentos)
- ✅ Almacenamiento: Ilimitado
- ✅ Usuarios ilimitados con roles granulares
- ✅ API REST dedicada + Webhooks custom
- ✅ Consultoría de escalabilidad (4 horas/mes)
- ✅ SLA Tier 2: **4 horas** (slack + teléfono directo)
- ✅ Backup diario + DR (Disaster Recovery)
- ✅ IP dedicada + dominio custom del agente

**Ideal para:** Cadenas retail, clínicas corporativas, empresas con +50 empleados.

---

## 4. Resumen Financiero (Proyección Anual)

```
┌────────────────────────────────────────────────────────────────┐
│  UNIT ECONOMICS — AigenciaLab.cl                              │
│                                                                │
│  Plan       │ Setup (60%OFF) │ MRR    │ ARR      │ LTV (24m) │
│  ───────────┼────────────────┼────────┼──────────┼───────────│
│  Starter    │ UF 6           │ UF 5   │ UF 60    │ UF 126    │
│  Pro        │ UF 14          │ UF 12  │ UF 144   │ UF 302    │
│  Enterprise │ UF 32          │ UF 28  │ UF 336   │ UF 704    │
│                                                                │
│  MIX TARGET (20 clientes en 6 meses):                         │
│  12 Starter + 6 Pro + 2 Enterprise                            │
│  = Setup: UF 180 + MRR mensual: UF 188                       │
│  = Facturación Año 1: ~UF 2.436 (~$92M CLP)                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | HTML + Vanilla JS (landing) | Zero dependencies, SEO perfecto, CDN edge |
| **Dashboard** | Next.js 14 (app router) | SSR + ISR, Vercel native |
| **Backend** | Vercel Edge Functions | Latency < 50ms, auto-scaling |
| **Base de Datos** | Supabase (PostgreSQL 15) | RLS, pgvector, real-time subscriptions |
| **Auth** | Supabase Auth + JWT | Multi-tenant RBAC via custom claims |
| **AI/RAG** | OpenAI API + pgvector | text-embedding-3-small + GPT-4o-mini |
| **Messaging** | WhatsApp Cloud API (Meta) | Oficial, sin intermediarios |
| **Ecommerce** | Webhooks (WooCommerce/Shopify) | Event-driven, zero polling |
| **CDN/Deploy** | Vercel (Pro plan) | Edge network, preview deployments |
| **Monitoring** | Vercel Analytics + Sentry | Error tracking + performance |
| **Compliance** | Ley N°21.663 + N°19.628 | Ciberseguridad + datos personales Chile |

---

*AigenciaLab.cl · Arquitectura Enterprise SaaS · v2.0 · Chile 2026*
*Confidencial — Solo uso interno*

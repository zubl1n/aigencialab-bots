# 🚀 Migración Backend: localStorage → Producción Real
### Guía SaaS Escalable · AigenciaLab.cl · Versión 1.0

---

## CUÁNDO MIGRAR

Migra de `localStorage` a un backend real cuando:
- [ ] Tienes más de **5 clientes** activos
- [ ] Necesitas **multi-usuario** en el dashboard
- [ ] El cliente requiere **datos persistentes** entre dispositivos
- [ ] Necesitas **APIs en tiempo real** (webhooks, sincronización)
- [ ] Tienes más de **10.000 eventos/mes** en el pipeline

---

## ARQUITECTURA RECOMENDADA

```
ACTUAL (localStorage)           →    PRODUCCIÓN (Backend Real)
┌──────────────────────┐            ┌────────────────────────────┐
│ Browser localStorage │            │ Frontend (estático actual)  │
│ ─ AigenciaLab_leads      │    →       │ ─ HTML/CSS/JS (sin cambios) │
│ ─ AigenciaLab_pipeline   │            ├────────────────────────────┤
│ ─ AigenciaLab_tickets    │            │ API Layer                   │
│ ─ AigenciaLab_logs       │            │ ─ Supabase (recomendado)    │
└──────────────────────┘            │ ─ Firebase (alternativa)    │
                                    │ ─ Node.js custom             │
                                    ├────────────────────────────┤
                                    │ Database                    │
                                    │ ─ PostgreSQL (Supabase)     │
                                    │ ─ Firestore (Firebase)      │
                                    └────────────────────────────┘
```

---

## OPCIÓN A — SUPABASE (⭐ Recomendado, Open Source)

**Por qué Supabase:**
- Gratuito hasta 500MB y 50.000 rows
- PostgreSQL (robusto, familiar)
- SDK JavaScript sin dependencias pesadas
- Auth incluido, RLS (Row Level Security)
- Hecho para startups SaaS

### Paso 1: Crear proyecto Supabase

1. Ir a https://supabase.com → Crear cuenta
2. New Project → Nombre: `AigenciaLab-prod` → Password seguro → Santiago (US-East-1 más cercano)
3. Guardar: **Project URL** y **anon/public key**

### Paso 2: Crear tablas en Supabase

```sql
-- Ejecutar en Supabase SQL Editor

-- Leads (auditoría + pipeline)
CREATE TABLE leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company     text NOT NULL,
  contact     text,
  url         text,
  rubro       text,
  whatsapp    text,
  email       text,
  score       integer DEFAULT 0,
  tier        text DEFAULT 'cold',
  prob        integer DEFAULT 0,
  notes       text,
  real_data   boolean DEFAULT false,
  source      text DEFAULT 'manual',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  client_id   uuid   -- Para multi-tenant
);

-- Tickets de soporte
CREATE TABLE tickets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_num  text UNIQUE,
  company     text NOT NULL,
  issue       text NOT NULL,
  priority    text DEFAULT 'medio',
  status      text DEFAULT 'Abierto',
  assigned_to text,
  channel     text DEFAULT 'WhatsApp',
  notes       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  client_id   uuid
);

-- Alertas de negocio
CREATE TABLE alerts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL,
  title       text NOT NULL,
  detail      text,
  dismissed   boolean DEFAULT false,
  wa_text     text,
  created_at  timestamptz DEFAULT now(),
  client_id   uuid
);

-- Logs de auditoría (Ley 21.663)
CREATE TABLE audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event       text NOT NULL,
  module      text,
  user_id     uuid,
  ip_hash     text,  -- hash, no IP directa (privacidad Ley 19.628)
  metadata    jsonb,
  created_at  timestamptz DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts   ENABLE ROW LEVEL SECURITY;
```

### Paso 3: Crear adaptador Supabase para el frontend

Crear archivo `platform/adapters/supabase-adapter.js`:

```javascript
/* supabase-adapter.js — Reemplaza localStorage por Supabase */
(function() {
  'use strict';

  // Configuración — reemplazar con tus credenciales
  var SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  var CLIENT_ID    = 'UUID-DEL-CLIENTE-AQUI'; // UUID del cliente en Supabase

  // SDK ultra-ligero de Supabase (solo necesitamos fetch)
  var API = SUPABASE_URL + '/rest/v1/';
  var HEADERS = {
    'apikey':        SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation'
  };

  function sbFetch(table, method, body, query) {
    var url = API + table + (query ? '?' + query : '');
    return fetch(url, { method: method || 'GET', headers: HEADERS, body: body ? JSON.stringify(body) : null })
      .then(function(r) { return r.json(); });
  }

  // Reemplaza las funciones de localStorage en cada módulo
  window.AigenciaLabDB = {
    /* LEADS */
    getLeads:     function() { return sbFetch('leads', 'GET', null, 'client_id=eq.' + CLIENT_ID + '&order=created_at.desc'); },
    saveLead:     function(lead) { return sbFetch('leads', 'POST', Object.assign(lead, { client_id: CLIENT_ID })); },
    updateLead:   function(id, data) { return sbFetch('leads', 'PATCH', data, 'id=eq.' + id); },
    deleteLead:   function(id) { return sbFetch('leads', 'DELETE', null, 'id=eq.' + id); },

    /* TICKETS */
    getTickets:   function() { return sbFetch('tickets', 'GET', null, 'client_id=eq.' + CLIENT_ID + '&order=created_at.desc'); },
    saveTicket:   function(t) { return sbFetch('tickets', 'POST', Object.assign(t, { client_id: CLIENT_ID })); },
    updateTicket: function(id, data) { return sbFetch('tickets', 'PATCH', data, 'id=eq.' + id); },

    /* ALERTS */
    getAlerts:    function() { return sbFetch('alerts', 'GET', null, 'client_id=eq.' + CLIENT_ID + '&dismissed=eq.false&order=created_at.desc'); },
    saveAlert:    function(a) { return sbFetch('alerts', 'POST', Object.assign(a, { client_id: CLIENT_ID })); },
    dismissAlert: function(id) { return sbFetch('alerts', 'PATCH', { dismissed: true }, 'id=eq.' + id); },

    /* AUDIT LOG */
    log: function(event, module, metadata) {
      return sbFetch('audit_logs', 'POST', { event: event, module: module, metadata: metadata });
    }
  };

  console.log('✅ AigenciaLabDB adaptador Supabase activo');
})();
```

### Paso 4: Actualizar los módulos para usar el adaptador

Antes de cargar `dashboard.js`, agregar en `platform/index.html`:
```html
<!-- Solo si se usa backend real -->
<script src="adapters/supabase-adapter.js"></script>
```

En cada módulo, reemplazar las llamadas a `localStorage.getItem()` por `AigenciaLabDB.getLeads()`, etc.

---

## OPCIÓN B — FIREBASE (Google)

**Cuándo usar Firebase:** si el cliente ya usa Google Workspace o necesita escalado masivo.

```javascript
// firebase-adapter.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

var firebaseConfig = {
  apiKey:            "AIzaSyXXXXXXXXXXXXX",
  authDomain:        "AigenciaLab-prod.firebaseapp.com",
  projectId:         "AigenciaLab-prod",
  storageBucket:     "AigenciaLab-prod.appspot.com",
  messagingSenderId: "XXXXXXXXXX",
  appId:             "1:XXXXXXXXXX:web:XXXXXXXX"
};
var app = initializeApp(firebaseConfig);
var db  = getFirestore(app);

// API equivalente
window.AigenciaLabDB = {
  getLeads:  function() { return getDocs(collection(db, 'leads')).then(function(snap) { return snap.docs.map(function(d) { return d.data(); }); }); },
  saveLead:  function(lead) { return addDoc(collection(db, 'leads'), lead); },
  // ... etc
};
```

---

## OPCIÓN C — NODE.JS + POSTGRESQL (Full Custom)

Para empresas con equipo técnico propio:

```
STACK:
  Frontend: HTML/CSS/JS actual (sin cambios)
  API:      Node.js + Express + Prisma ORM
  DB:       PostgreSQL (Railway.app o Render.com — gratis)
  Auth:     JWT + bcrypt
  Hosting:  Railway / Render / DigitalOcean
```

```javascript
// server.js — API mínima
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(require('cors')({ origin: 'https://AigenciaLab.cl' }));

// Leads
app.get('/api/leads', auth, async (req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(leads);
});
app.post('/api/leads', auth, async (req, res) => {
  const lead = await prisma.lead.create({ data: req.body });
  res.json(lead);
});

// Webhook AigenciaLabOnAuditLead
window.AigenciaLabOnAuditLead = async function(lead) {
  await fetch('https://api.AigenciaLab.cl/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + USER_JWT },
    body: JSON.stringify(lead)
  });
};

app.listen(3000, () => console.log('API AigenciaLab en :3000'));
```

---

## CHECKLIST DE MIGRACIÓN

- [ ] Backup completo de localStorage antes de migrar (`backupAll()`)
- [ ] Supabase/Firebase creado y tablas creadas
- [ ] Adaptador `supabase-adapter.js` agregado al HEAD del dashboard
- [ ] Variables de entorno configuradas en Netlify/Vercel (no hardcoded)
- [ ] RLS activado en Supabase (un cliente no puede ver datos de otro)
- [ ] Auth activado (Netlify Identity o Supabase Auth)
- [ ] Tests de lectura/escritura en staging antes de producción
- [ ] Migración de datos históricos desde JSON backup a Supabase
- [ ] Monitoreo de errores activo (Sentry.io — gratis hasta 5k errors/mes)

---

## SEPARACIÓN FRONTEND / AGENTES / BASE DE CLIENTES

Para arquitectura multi-tenant enterprise:

```
AigenciaLab-platform/
├── frontend/        ← HTML/CSS/JS actual (CDN estático)
├── api/             ← Node.js o Supabase Edge Functions
│   ├── routes/
│   │   ├── leads.js
│   │   ├── tickets.js
│   │   └── alerts.js
│   └── middleware/
│       ├── auth.js   ← JWT verification
│       └── tenant.js ← Multi-tenant isolation
├── agents/          ← Microservicios por agente (Node.js/Python)
│   ├── ventas-agent/
│   ├── atencion-agent/
│   └── backoffice-agent/
└── clients/         ← Base de datos por cliente (PostgreSQL schemas)
    ├── client_001/
    ├── client_002/
    └── client_003/
```

---

*AigenciaLab.cl · Guía de Migración Backend · v1.0 · Compatibilidad total con pila actual*


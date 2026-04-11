# 🛡️ Arquitectura Defensiva & Stack de Agentes — AigenciaLab.cl

## 1. Middleware Anti-Prompt Injection

```javascript
// middleware/sanitizer.js — Inyectar en cada endpoint de agente
const BLOCKED_PATTERNS = [
  /ignore\s+(previous|all|above|system)/i,
  /act\s+as/i, /you\s+are\s+now/i, /pretend\s+(to|you)/i,
  /system\s*prompt/i, /reveal\s+(your|the)/i,
  /forget\s+(everything|all)/i, /new\s+instructions/i,
  /<script/i, /javascript:/i, /on(load|error|click)\s*=/i,
  /UNION\s+SELECT/i, /DROP\s+TABLE/i, /INSERT\s+INTO/i,
  /\b\d{7,8}-[\dkK]\b/  // RUT chileno — nunca debe llegar al LLM
];

function sanitize(input) {
  if (!input || typeof input !== 'string') return { blocked: true };
  const clean = input.trim().slice(0, 2000); // Hard limit
  for (const rx of BLOCKED_PATTERNS) {
    if (rx.test(clean)) return { blocked: true, reason: 'PROMPT_INJECTION_DETECTED', pattern: rx.source };
  }
  return { blocked: false, clean };
}

// Uso en endpoint:
// const result = sanitize(req.body.message);
// if (result.blocked) return res.status(400).json({ error: 'Mensaje rechazado' });
```

## 2. Multi-Tenant con Supabase RLS

```sql
-- Refactorización de la tabla leads existente
ALTER TABLE leads ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_leads_tenant ON leads(tenant_id);

-- RLS Policy (activar en Supabase Dashboard)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_read ON leads FOR SELECT
  USING (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);
CREATE POLICY tenant_write ON leads FOR INSERT
  WITH CHECK (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);

-- RBAC via JWT custom claims
-- En Supabase Auth, agregar al JWT:
-- { "tenant_id": "uuid", "role": "admin|manager|agent|viewer" }
```

## 3. Event-Driven Webhooks (Zero Polling)

```javascript
// api/webhooks/woocommerce.js — Vercel Serverless Function
import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Validate HMAC signature
  const sig = req.headers['x-wc-webhook-signature'];
  const body = JSON.stringify(req.body);
  const expected = createHmac('sha256', process.env.WC_SECRET).update(body).digest('base64');
  if (sig !== expected) return res.status(403).json({ error: 'Invalid signature' });

  const topic = req.headers['x-wc-webhook-topic'];

  switch (topic) {
    case 'order.created':
      await supabase.from('orders').insert({
        tenant_id: req.headers['x-tenant-id'],
        wc_order_id: req.body.id,
        status: req.body.status,
        total: req.body.total,
        items: req.body.line_items,
        customer: req.body.billing
      });
      break;
    case 'product.updated':
      await supabase.from('inventory').upsert({
        tenant_id: req.headers['x-tenant-id'],
        product_id: req.body.id,
        sku: req.body.sku,
        stock: req.body.stock_quantity,
        price: req.body.price,
        name: req.body.name
      }, { onConflict: 'tenant_id,product_id' });
      break;
  }

  return res.status(200).json({ received: true });
}
```

## 4. Stack de Agentes Ampliado

### 4.1 Agente de Ventas & Inventario (Core)

```javascript
// agents/sales-inventory.js
(function(){
  const CONFIG = {
    supabaseUrl: 'https://hmnbbzpucefcldziwrvs.supabase.co',
    supabaseKey: '{{ANON_KEY}}',
    tenantId: '{{TENANT_ID}}'
  };

  async function checkStock(productQuery) {
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/inventory?name=ilike.*${productQuery}*&tenant_id=eq.${CONFIG.tenantId}`, {
      headers: { apikey: CONFIG.supabaseKey, Authorization: `Bearer ${CONFIG.supabaseKey}` }
    });
    return await res.json();
  }

  async function createOrder(customer, items) {
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        apikey: CONFIG.supabaseKey,
        Authorization: `Bearer ${CONFIG.supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenant_id: CONFIG.tenantId,
        customer_name: customer.name,
        customer_email: customer.email,
        items: items,
        status: 'pending',
        total: items.reduce((a,i) => a + i.price * i.qty, 0)
      })
    });
    return await res.json();
  }

  // Chat handler con verificación de stock en vivo
  async function handleMessage(msg) {
    const sanitized = sanitize(msg);
    if (sanitized.blocked) return 'Lo siento, no puedo procesar esa consulta.';

    // Detect intent
    if (/stock|disponib|quedan|hay/i.test(msg)) {
      const product = msg.replace(/.*(?:stock|disponib|quedan|hay)\s+(?:de\s+)?/i, '').trim();
      const items = await checkStock(product);
      if (items.length === 0) return `No encontré "${product}" en inventario.`;
      return items.map(i => `📦 ${i.name}: ${i.stock} unidades (${formatCLP(i.price)})`).join('\n');
    }

    if (/pedir|comprar|ordenar/i.test(msg)) {
      return '🛒 Para crear un pedido, por favor proporciona:\n1. Producto\n2. Cantidad\n3. Tu email de contacto';
    }

    return '¿En qué puedo ayudarte? Puedo:\n• Consultar stock 📦\n• Crear pedidos 🛒\n• Información de precios 💰';
  }
})();
```

### 4.2 Agente de Logística

```javascript
// agents/logistics.js — Trazabilidad de despachos
const CARRIERS = {
  starken: { name: 'Starken', trackUrl: 'https://www.starken.cl/seguimiento?codigo=' },
  chilexpress: { name: 'Chilexpress', trackUrl: 'https://www.chilexpress.cl/Views/ChilexpressCL/Resultado-Seguimiento.aspx?o=' },
  bluexpress: { name: 'Blue Express', trackUrl: 'https://www.blue.cl/seguimiento/?n_seguimiento=' }
};

async function getShipmentStatus(orderId) {
  const { data } = await supabase
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .eq('tenant_id', TENANT_ID)
    .single();

  if (!data) return { error: 'Envío no encontrado' };

  return {
    orderId: data.order_id,
    carrier: CARRIERS[data.carrier]?.name || data.carrier,
    tracking: data.tracking_number,
    status: data.status, // 'preparing','dispatched','in_transit','delivered'
    trackingUrl: CARRIERS[data.carrier]?.trackUrl + data.tracking_number,
    estimatedDelivery: data.eta,
    lastUpdate: data.updated_at
  };
}

// Dashboard widget rendering
function renderLogisticsWidget(containerId) {
  // Renders shipment status cards in the dashboard
  // States: 📦 Preparando → 🚚 Despachado → 🛣️ En Tránsito → ✅ Entregado
}
```

### 4.3 Agente de BI (Predicción de Demanda)

```javascript
// agents/bi-predictor.js — Lee datos históricos y predice demanda
async function predictDemand(tenantId, productId, daysAhead = 30) {
  // Fetch historical orders
  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, items')
    .eq('tenant_id', tenantId)
    .gte('created_at', new Date(Date.now() - 90*24*60*60*1000).toISOString())
    .order('created_at');

  // Calculate daily averages
  const dailySales = {};
  orders.forEach(o => {
    const day = o.created_at.slice(0, 10);
    const qty = o.items.filter(i => i.product_id === productId).reduce((a,i) => a + i.qty, 0);
    dailySales[day] = (dailySales[day] || 0) + qty;
  });

  const avgDaily = Object.values(dailySales).reduce((a,b) => a+b, 0) / Math.max(Object.keys(dailySales).length, 1);
  const trend = calculateTrend(Object.entries(dailySales)); // Linear regression
  const predicted = Math.round((avgDaily + trend) * daysAhead);

  return {
    avgDailyUnits: Math.round(avgDaily * 10) / 10,
    trend: trend > 0 ? 'growing' : 'declining',
    trendPct: Math.round(trend / Math.max(avgDaily, 0.1) * 100),
    predictedUnits30d: predicted,
    reorderPoint: Math.round(avgDaily * 7), // 1 week safety stock
    recommendation: predicted > getCurrentStock(productId) ?
      `⚠️ REABASTECER: necesitarás ~${predicted} unidades en ${daysAhead} días` :
      `✅ Stock suficiente para ${daysAhead} días`
  };
}

function calculateTrend(dataPoints) {
  // Simple linear regression
  const n = dataPoints.length;
  if (n < 3) return 0;
  let sumX=0, sumY=0, sumXY=0, sumXX=0;
  dataPoints.forEach((p, i) => { sumX+=i; sumY+=p[1]; sumXY+=i*p[1]; sumXX+=i*i; });
  return (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
}
```

### 4.4 Agente de Ciberseguridad

```javascript
// agents/security-monitor.js — Monitoreo del sitio del cliente
const SECURITY_CHECKS = [
  { name: 'SSL Certificate', check: async (url) => {
    try {
      const res = await fetch(url);
      return { pass: res.url.startsWith('https'), detail: res.url };
    } catch(e) { return { pass: false, detail: e.message }; }
  }},
  { name: 'Security Headers', check: async (url) => {
    const res = await fetch(url);
    const required = ['x-content-type-options','x-frame-options','strict-transport-security'];
    const missing = required.filter(h => !res.headers.get(h));
    return { pass: missing.length === 0, detail: missing.length ? `Faltan: ${missing.join(', ')}` : 'Todos presentes' };
  }},
  { name: 'Exposed .env/.git', check: async (url) => {
    const paths = ['/.env', '/.git/HEAD', '/wp-config.php.bak'];
    for (const p of paths) {
      try {
        const res = await fetch(url + p, { redirect: 'manual' });
        if (res.status === 200) return { pass: false, detail: `CRÍTICO: ${p} expuesto` };
      } catch(e) {}
    }
    return { pass: true, detail: 'No se encontraron archivos sensibles' };
  }},
  { name: 'XSS Basic', check: async (url) => {
    // Check if site reflects script tags
    try {
      const res = await fetch(`${url}?q=<script>alert(1)</script>`);
      const body = await res.text();
      return { pass: !body.includes('<script>alert(1)'), detail: body.includes('<script>alert(1)') ? 'VULNERABLE a XSS reflejado' : 'Protegido' };
    } catch(e) { return { pass: true, detail: 'No se pudo verificar' }; }
  }}
];

async function runSecurityAudit(clientUrl) {
  const results = [];
  for (const check of SECURITY_CHECKS) {
    const result = await check.check(clientUrl);
    results.push({ name: check.name, ...result });
  }
  const score = Math.round(results.filter(r => r.pass).length / results.length * 100);
  return {
    url: clientUrl,
    score,
    grade: score >= 90 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'F',
    checks: results,
    scannedAt: new Date().toISOString(),
    recommendation: score < 70 ? '🚨 Se requieren acciones inmediatas de seguridad' : '✅ Postura de seguridad aceptable'
  };
}
```

---

## 5. Esquema de Base de Datos Multi-Tenant Completo

```sql
-- Tabla maestra de tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT CHECK (plan IN ('starter','pro','enterprise')),
  domain TEXT,
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventario multi-tenant
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  sku TEXT, name TEXT, description TEXT,
  price NUMERIC(12,2), stock INTEGER DEFAULT 0,
  category TEXT, image_url TEXT,
  synced_from TEXT, -- 'woocommerce', 'shopify', 'manual'
  last_sync TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, product_id)
);

-- Órdenes multi-tenant
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  wc_order_id TEXT, shopify_order_id TEXT,
  customer_name TEXT, customer_email TEXT,
  items JSONB, total NUMERIC(12,2),
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'agent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Despachos
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  carrier TEXT, tracking_number TEXT,
  status TEXT DEFAULT 'preparing',
  eta TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Token Usage (para monitoreo de costos API)
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  agent_name TEXT,
  tokens_in INTEGER, tokens_out INTEGER,
  model TEXT DEFAULT 'gpt-4o-mini',
  cost_usd NUMERIC(8,6),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS en todas las tablas
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Policy template para cada tabla
CREATE POLICY isolation ON inventory USING (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);
CREATE POLICY isolation ON orders USING (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);
CREATE POLICY isolation ON shipments USING (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);
CREATE POLICY isolation ON token_usage USING (tenant_id = (current_setting('request.jwt.claims')::jsonb->>'tenant_id')::uuid);
```

---

*AigenciaLab.cl · Documentación Técnica Interna · v2.0*

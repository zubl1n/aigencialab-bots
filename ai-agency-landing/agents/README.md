# AiGency.cl — Guía de Integración de Agentes IA (Enterprise v2)

Documentación técnica para implementar los 7 agentes de IA. Incluye 3 agentes Core + 4 agentes Enterprise.
Sin dependencias externas. Stack: Vanilla JS. Compliance: Ley N°21.663 + Ley N°19.628.

---

## Estructura de Archivos

```
agents/
├── agent-ventas.js          ← Agente de Ventas (WhatsApp/Web) [Core]
├── agent-atencion.js        ← Agente de Atención al Cliente [Core]
├── agent-backoffice.js      ← Procesamiento de Documentos [Core]
├── agent-ecommerce.js       ← Sales & Inventory Sync [Enterprise]
├── agent-logistics.js       ← Logística & Trazabilidad [Enterprise]
├── agent-bi.js              ← Business Intelligence [Enterprise]
├── agent-cybersecurity.js   ← Ciberseguridad & Compliance [Enterprise]
└── README.md                ← Esta guía
```

---

## 🔒 Cumplimiento Legal

| Ley | Alcance | Implementación |
|-----|---------|----------------|
| **Ley N°21.663** (Ciberseguridad) | Cifrado, notificación ANCI 72h, DPO | AES-256 + TLS 1.3, protocolo de incidentes |
| **Ley N°19.628** (Protección de Datos) | Consentimiento, minimización, derecho acceso | Solo localStorage, sin telemetría, sin terceros |

Todos los agentes usan `localStorage` por defecto. Para producción: reemplaza con `setStorageAdapter()`.

---

## 🛒 Agente Ecommerce — Sales & Inventory Sync

### Implementación

```html
<script src="agents/agent-ecommerce.js"></script>
<script>
  AgentEcommerce.init({
    companyName: 'Mi Tienda SpA',
    platforms: ['woocommerce', 'shopify'],
    onStockSync:    function(e) { console.log('Stock sync:', e); },
    onOrderCreate:  function(o) { myCRM.createDeal(o); },
    onCartRecovery: function(c) { sendWhatsApp(c.customer, c.total); }
  });
</script>
```

### API

| Módulo | Método | Descripción |
|--------|--------|-------------|
| `products` | `.getAll()` | Lista todos los productos |
| `products` | `.updateStock(sku, qty, platform)` | Actualiza stock bidireccional |
| `products` | `.getLowStock(threshold?)` | Productos bajo mínimo |
| `products` | `.syncAll(sourceData, platform)` | Sync masivo desde ecommerce |
| `orders` | `.getAll()` | Lista órdenes |
| `orders` | `.create(data)` | Crea orden |
| `orders` | `.updateStatus(id, status)` | Actualiza estado |
| `carts` | `.getAbandoned(minutes?)` | Carritos abandonados |
| `carts` | `.recover(id, channel?)` | Enviar recuperación |
| `upsell` | `.suggest(sku)` | Sugerencias de upselling |
| `webhooks` | `.on(event, handler)` | Registrar handler |
| `webhooks` | `.simulateIncoming(platform, event, data)` | Simular webhook |

### Webhooks Entrantes (Producción)

```
POST /webhooks/woocommerce  → wc_order_created, wc_stock_updated
POST /webhooks/shopify      → orders/create, inventory_levels/update
POST /webhooks/transbank    → transaction_completed
```

---

## 🚚 Agente Logística — Trazabilidad & Última Milla

### Implementación

```html
<script src="agents/agent-logistics.js"></script>
<script>
  AgentLogistics.init({
    companyName: 'Mi Empresa',
    slaHours: 72,
    couriers: ['Starken', 'Chilexpress', 'Blue Express'],
    onDelivery:   function(s) { notifyClient(s); },
    onIncident:   function(i, s) { escalateTeam(i); },
    onSLABreach:  function(s) { alertOps(s); }
  });
</script>
```

### API

| Módulo | Método | Descripción |
|--------|--------|-------------|
| `shipments` | `.create(data)` | Crear envío |
| `shipments` | `.updateStatus(id, status, location?)` | Actualizar tracking |
| `shipments` | `.getActive()` | Envíos no entregados |
| `shipments` | `.track(id)` | Tracking completo con historial |
| `incidents` | `.create(shipId, type, desc)` | Crear incidencia |
| `incidents` | `.resolve(shipId, incId)` | Resolver incidencia |
| `sla` | `.check()` | Envíos con SLA vencido |
| `sla` | `.getAtRisk(hours?)` | Envíos cerca de vencer |
| `stats` | `.onTimeRate()` | Tasa de entrega a tiempo (%) |
| `stats` | `.byCourier()` | Envíos por courier |
| `stats` | `.avgDeliveryDays()` | Tiempo promedio de entrega |

---

## 📈 Agente Business Intelligence

### Implementación

```html
<script src="agents/agent-bi.js"></script>
<script>
  AgentBI.init({
    companyName: 'Mi Empresa',
    forecastDays: 30,
    churnThreshold: 65,
    onChurnAlert:  function(c) { retentionTeam.alert(c); },
    onRestockAlert:function(p) { purchaseOrder.create(p); }
  });
</script>
```

### API

| Módulo | Método | Descripción |
|--------|--------|-------------|
| `forecast` | `.generate(data?, days?)` | Generar pronóstico de demanda |
| `forecast` | `.getLast()` | Último forecast generado |
| `churn` | `.detect()` | Clientes en riesgo (>threshold) |
| `churn` | `.getAll()` | Todos los clientes con score |
| `segments` | `.get()` | Segmentación automática |
| `restock` | `.suggest()` | Sugerencias de reabastecimiento |
| `reports` | `.generateSummary()` | Resumen ejecutivo |

### Esquema de Forecast

```js
{
  generatedAt: '2026-04-10T...',
  days: 30,
  accuracy: '91.7%',
  data: [{
    date: '2026-04-20',
    predicted: 1850000,
    confidenceLow: 1517000,    // Banda inferior (82%)
    confidenceHigh: 2183000    // Banda superior (118%)
  }]
}
```

---

## 🛡️ Agente Ciberseguridad & Compliance

### Implementación

```html
<script src="agents/agent-cybersecurity.js"></script>
<script>
  AgentCybersecurity.init({
    companyName: 'Mi Empresa',
    anciNotifyHours: 72,
    onThreat:          function(t) { secOps.alert(t); },
    onIncident:        function(i) { secOps.escalate(i); },
    onComplianceChange:function(c) { auditLog.record(c); }
  });
</script>
```

### API

| Módulo | Método | Descripción |
|--------|--------|-------------|
| `threats` | `.detect(source?)` | Simular detección |
| `threats` | `.getAll()` | Historial de amenazas |
| `threats` | `.getStats()` | Estadísticas por tipo/severidad |
| `scanner` | `.run()` | Ejecutar escaneo de vulnerabilidades |
| `scanner` | `.getVulnerabilities()` | Vulnerabilidades activas |
| `compliance` | `.getControls()` | Controles de cumplimiento |
| `compliance` | `.getScore()` | Score de compliance (0-100) |
| `compliance` | `.updateControl(id, data)` | Actualizar estado de control |
| `incidents` | `.create(data)` | Crear incidente de seguridad |
| `incidents` | `.notifyANCI(id)` | Notificar a ANCI (72h) |
| `incidents` | `.resolve(id, resolution)` | Resolver incidente |
| `blacklist` | `.add(ip, reason)` | Agregar IP a blacklist |
| `blacklist` | `.get()` | IPs bloqueadas |

---

## 💬 Agente de Ventas (`agent-ventas.js`) — Core

*(Documentación existente — ver sección anterior del README original)*

```html
<script src="agents/agent-ventas.js"></script>
<script>
  AgentVentas
    .init({ companyName: 'Mi Empresa', agentName: 'Sofía', whatsapp: '+56912345678' })
    .createWidget();
</script>
```

---

## 🎧 Agente Atención al Cliente (`agent-atencion.js`) — Core

```html
<script src="agents/agent-atencion.js"></script>
<script>
  AgentAtencion
    .init({ companyName: 'Mi Empresa', agentName: 'Valentina' })
    .createWidget();
</script>
```

---

## ⚙️ Agente Backoffice (`agent-backoffice.js`) — Core

```html
<script src="agents/agent-backoffice.js"></script>
<script>
  AgentBackoffice
    .init({ companyName: 'Mi Empresa', exportTargets: ['defontana', 'sheets'] })
    .createDropZone('#processor');
</script>
```

---

## 🔌 Patrón Universal de Integración

Todos los agentes comparten el mismo patrón:

```js
// 1. Inicializar
Agent.init({ companyName: 'Mi Empresa', ...config });

// 2. Usar la API
var data = Agent.products.getAll();  // o shipments, churn, threats, etc.

// 3. Exportar datos
Agent.exportCSV();

// 4. Reemplazar almacenamiento para producción
Agent.setStorageAdapter({
  load:  function()    { return fetch('/api/data').then(r => r.json()); },
  save:  function(all) { return fetch('/api/data', { method: 'PUT', body: JSON.stringify(all) }); },
  get:   function(col) { return fetch('/api/data/' + col).then(r => r.json()); },
  set:   function(col, data) { return fetch('/api/data/' + col, { method: 'PUT', body: JSON.stringify(data) }); },
  clear: function()    { return fetch('/api/data', { method: 'DELETE' }); }
});
```

---

## 📦 Checklist de Seguridad (Ley N°21.663 + N°19.628)

- `[ ]` Habilitar HTTPS + TLS 1.3 en tu servidor
- `[ ]` Implementar CSP (`Content-Security-Policy`) en headers
- `[ ]` Usar `setStorageAdapter()` con backend seguro en producción
- `[ ]` Configurar rotación de tokens de API
- `[ ]` Definir política de retención y eliminación de datos
- `[ ]` Registrar tu organización en ANCI si procesas datos de +10.000 usuarios
- `[ ]` Tener protocolo de notificación de incidentes (72 hrs a ANCI)
- `[ ]` Designar un DPO (Data Protection Officer)
- `[ ]` Implementar consentimiento explícito para datos personales (Ley 19.628)

---

*AiGency.cl — Automatización Enterprise B2B para Chile · 7 Agentes IA · Stack 100% Free*

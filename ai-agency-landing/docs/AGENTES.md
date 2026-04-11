# 🤖 Manual de Agentes IA — AigenciaLab.cl
### Guía técnica y comercial por agente · Versión 1.0

---

## ÍNDICE DE AGENTES

| # | Agente | Rubro ideal | Puerto/Archivo |
|---|--------|-------------|----------------|
| 1 | [Agente de Ventas](#1-agente-de-ventas) | Ecommerce, Retail, Servicios | `agents/ventas/` |
| 2 | [Agente de Atención](#2-agente-de-atención) | Todos los rubros | `agents/atencion/` |
| 3 | [Agente Backoffice](#3-agente-backoffice) | Manufactura, Servicios | `agents/backoffice/` |
| 4 | [Agente Ecommerce](#4-agente-ecommerce) | Ecommerce, Retail | `agents/ecommerce/` |
| 5 | [Agente Logística](#5-agente-logística) | Courier, Retail, Manufactura | `agents/logistica/` |
| 6 | [Agente BI Predictivo](#6-agente-bi-predictivo) | Todos los rubros Enterprise | `agents/bi/` |
| 7 | [Agente Ciberseguridad](#7-agente-ciberseguridad) | Todos (crítico para fintech/salud) | `agents/ciberseguridad/` |

---

## 1. AGENTE DE VENTAS

### ¿Qué hace?
Responde consultas de productos, precios y disponibilidad por WhatsApp y web. Califica leads automáticamente y agenda demostraciones o reuniones de ventas.

### ¿Para qué empresa sirve?
Ecommerce (WooCommerce/Shopify), Clínicas, Inmobiliarias, Servicios profesionales, SaaS. Cualquier negocio con ciclo de ventas consultivo.

### Funcionalidades clave
- Respuesta automática 24/7 a consultas de ventas
- Calificación de leads (BANT: Budget, Authority, Need, Timeline)
- Envío de catálogos y fichas de producto
- Agenda de demos y reuniones (integra con Calendly)
- Follow-up automático a los 24h, 48h y 7 días
- Propuesta comercial automática (integra con `mod-proposal.js`)

### Variables de configuración
```javascript
// agents/ventas/config.js
var AGENT_CONFIG = {
  name:         'Nova Ventas',
  company:      'AigenciaLab.cl',          // ← Cambiar por empresa del cliente
  products:     [],                    // ← Array de productos/servicios
  wa_number:    '56912345678',         // ← WhatsApp Business del cliente
  calendly_url: 'https://calendly.com/tuempresa', // ← Link de agenda
  follow_up:    [24, 48, 168],         // ← Horas para follow-up (1d, 2d, 7d)
  crm_webhook:  null,                  // ← URL para enviar leads a CRM externo
};
```

### Integración Web (Chat Widget)
```html
<!-- Agregar antes de </body> en cualquier página -->
<script>
  window.AigenciaLabAgent = { agent: 'ventas', company: 'TuEmpresa' };
</script>
<script src="https://tudominio.cl/agents/ventas/widget.js"></script>
```

### Integración WhatsApp
Requiere **WhatsApp Business API** (Meta Cloud API o proveedor como Twilio/360dialog):
1. Obtener `PHONE_NUMBER_ID` y `ACCESS_TOKEN` de Meta Business
2. Configurar en `agents/ventas/whatsapp.js`:
```javascript
var WA_CONFIG = {
  phone_number_id: 'XXXXXXXXXXXXXX',
  access_token:    'EAAG...',
  verify_token:    'AigenciaLab_secret_2024',
  webhook_url:     'https://tudominio.cl/agents/ventas/webhook'
};
```

### Fallback si falla
1. Si el agente no responde → Mensaje automático: *"Hola! Estamos procesando tu consulta. Te contactaremos en menos de 30 min."*
2. Si la API de WhatsApp cae → El agente activa modo de respuesta por email
3. Si el CRM externo falla → El lead se guarda en `localStorage` automáticamente

### Endpoints
```
POST /agents/ventas/webhook    ← Recibe mensajes de WhatsApp
GET  /agents/ventas/leads      ← Lista leads activos (autenticado)
POST /agents/ventas/qualify    ← Calificación manual de lead
```

---

## 2. AGENTE DE ATENCIÓN

### ¿Qué hace?
Gestiona soporte al cliente por WhatsApp, web y email. Responde FAQs, genera tickets, escala a humano y mide satisfacción (CSAT).

### ¿Para qué empresa sirve?
Todos los rubros. Especialmente valioso para Clínicas (agendamiento), Ecommerce (tracking/devoluciones), Retail (consultas de producto).

### Funcionalidades clave
- Respuesta a FAQs en < 2 segundos
- Generación automática de tickets de soporte
- Escalado inteligente al humano correcto
- Encuesta de satisfacción CSAT post-atención
- Base de conocimiento editable sin programar
- Integración con `mod-support.js` del dashboard

### Variables de configuración
```javascript
// agents/atencion/config.js
var SUPPORT_CONFIG = {
  name:            'Nova Soporte',
  sla_first_resp:  2,        // minutos — tiempo máximo de primera respuesta
  sla_resolution:  24,       // horas — tiempo máximo de resolución
  escalation_wa:   '56912345678', // WhatsApp del supervisor
  csat_enabled:    true,
  languages:       ['es'],
  faqs_source:     'localStorage', // 'localStorage' | 'api' | 'json'
  faq_json_url:    null,           // URL del JSON de FAQs si usa API
};
```

### Gestión de FAQs
Las FAQs se editan desde el wizard de Onboarding (`/onboarding/`) o directamente en JSON:
```json
[
  { "q": "¿Cuáles son los horarios?", "a": "Lunes a viernes 9:00-18:00. Agente IA disponible 24/7." },
  { "q": "¿Hacen envíos a todo Chile?", "a": "Sí, despacho en 2-5 días hábiles a todo el país." }
]
```

---

## 3. AGENTE BACKOFFICE

### ¿Qué hace?
Automatiza procesos administrativos: conciliación de facturas SII, reportes automáticos, gestión de documentos y alertas de vencimientos.

### ¿Para qué empresa sirve?
Manufactura, Servicios profesionales, Retail grande. Cualquier empresa con más de 100 documentos/mes.

### Funcionalidades clave
- Descarga y procesamiento automático de facturas desde SII.cl
- Conciliación automática con ERP (SAP B1, Defontana, Buk)
- Reportes PDF automáticos mensuales
- Alertas de vencimiento de documentos, contratos y pagos
- OC (Órdenes de Compra) automáticas basadas en umbrales de stock

### Integración ERP
```javascript
// agents/backoffice/config.js
var ERP_CONFIG = {
  provider:    'defontana',          // 'defontana' | 'sap' | 'buk' | 'custom'
  api_url:     'https://api.defontana.com/v2/',
  api_key:     'XXXXXXXXXXXXXX',
  company_rut: '76.123.456-7',
  sii_rut:     '76.123.456-7',     // RUT para descarga facturas SII
  report_day:  1,                   // Día del mes para reporte automático
};
```

---

## 4. AGENTE ECOMMERCE

### ¿Qué hace?
Sincroniza stock entre WooCommerce/Shopify y el ERP, recupera carritos abandonados por WhatsApp y gestiona devoluciones.

### Integración WooCommerce
```javascript
var WC_CONFIG = {
  site_url:       'https://tienda.cl',
  consumer_key:   'ck_xxxxxxxxxxxxxxxxxxxx',
  consumer_secret:'cs_xxxxxxxxxxxxxxxxxxxx',
  sync_interval:  300,  // segundos (5 min)
  low_stock:      5,    // alerta si stock <= 5 unidades
};
```

### Integración Shopify
```javascript
var SHOPIFY_CONFIG = {
  shop_domain:   'tu-tienda.myshopify.com',
  access_token:  'shpat_xxxxxxxxxxxxxxxxxxxx',
  api_version:   '2024-01',
};
```

### Flujo recuperación de carritos
```
1. Cliente abandon carrito → WooCommerce webhook dispara evento
2. Agente espera 30 minutos
3. Envía WhatsApp con enlace de carrito + oferta (5% descuento)
4. Si no abre en 24h → Segundo mensaje (sin descuento)
5. Métricas de recuperación → dashboard BI
```

---

## 5. AGENTE LOGÍSTICA

### ¿Qué hace?
Trackea envíos en Starken, Chilexpress y Blue Express. Responde automáticamente "¿dónde está mi paquete?" y alerta SLA vencidos.

### Couriers soportados
| Courier | Método | Documentación |
|---------|--------|---------------|
| Starken | Web scraping / API privada | Código de seguimiento |
| Chilexpress | API REST v2 | `api.chilexpress.cl` |
| Blue Express | API REST | `api.blueexpress.cl` |
| Correos Chile | Web scraping | Número de OT |

### Variables de configuración
```javascript
var LOGISTICS_CONFIG = {
  couriers: {
    chilexpress: { api_key: 'XXXXXX', channel_code: 'SXXX' },
    starken:     { username: 'user@empresa.cl', password: 'pass' },
  },
  sla_hours:     72,         // horas para alertar SLA vencido
  notify_client: true,       // notificar al cliente por WhatsApp
  notify_team:   true,       // notificar al equipo por Slack
  slack_webhook: null,       // URL webhook si se activa
};
```

---

## 6. AGENTE BI PREDICTIVO

### ¿Qué hace?
Analiza historial de ventas y predice demanda, detecta riesgo de churn y genera reportes automáticos con insights accionables.

### Modelos IA incluidos
- **Forecast de demanda:** Serie temporal simple (media móvil 4 semanas)
- **Riesgo de churn:** Regresión logística basada en actividad del cliente
- **Segmentación RFM:** Recency, Frequency, Monetary
- **Alerta de stock:** Umbral dinámico basado en velocidad de venta

### Fuentes de datos
```javascript
var BI_CONFIG = {
  data_source:    'localStorage', // 'localStorage' | 'woocommerce' | 'api'
  refresh_hours:  24,             // actualización automática
  forecast_weeks: 4,              // semanas a predecir
  churn_days:     90,             // días sin actividad = riesgo churn
  report_format:  'pdf',          // 'pdf' | 'email' | 'slack'
};
```

---

## 7. AGENTE CIBERSEGURIDAD

### ¿Qué hace?
Monitorea el sitio web y APIs en busca de ataques (SQL injection, XSS, brute force), genera alertas en tiempo real y crea logs para cumplimiento Ley 21.663.

### Detecciones activas
- SQL Injection en parámetros de URL y formularios
- XSS (Cross-Site Scripting) en inputs
- Brute Force en login (>5 intentos en 1 min)
- Escaneo de puertos
- Headers HTTP inseguros
- Certificados SSL próximos a vencer

### Compliance Ley N°21.663 (Chile)
El agente genera automáticamente:
- Log de incidentes con timestamp certificado
- Reporte ejecutivo mensual para el CISO
- Alertas ante accesos no autorizados a datos personales (Ley 19.628)
- Trazabilidad de accesos al dashboard

### Acciones automáticas
```javascript
var SECURITY_CONFIG = {
  block_on_sqli:     true,   // bloquear IP en SQL injection detectado
  alert_email:       'ciso@empresa.cl',
  alert_wa:          '56912345678',
  log_retention_days:365,    // retención log (mín. legal: 1 año)
  brute_force_limit: 5,      // intentos antes de bloquear
};
```

---

## FALLBACKS Y CONTINUIDAD

Si cualquier agente falla, el sistema aplica el siguiente protocolo:

1. **Nivel 1 (< 30 seg caída):** Reintento automático cada 10 segundos
2. **Nivel 2 (< 5 min):** Mensaje automático al cliente: *"Estamos procesando tu consulta, te respondemos en breve"*
3. **Nivel 3 (> 5 min):** Alerta WhatsApp al supervisor técnico
4. **Nivel 4 (> 30 min):** Derivación a email de soporte con contexto completo

---

*AigenciaLab.cl · Manual de Agentes · v1.0 · Ley N°21.663 · Ley N°19.628*


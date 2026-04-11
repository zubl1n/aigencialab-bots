# 🔍 Auditoría Gratuita — README Técnico
### Motor de Análisis Real · AiGency.cl · `/audit/`

---

## ¿QUÉ HACE?

El módulo de auditoría gratuita analiza **en tiempo real** el sitio web de un prospecto y genera un reporte personalizado con:

- **Score de Madurez Digital** (0-100)
- **4 métricas reales:** Velocidad, SEO, UX, Atención IA
- **Core Web Vitals** (cuando hay datos de PageSpeed)
- **Problemas específicos por rubro** (10 rubros configurados)
- **Ahorro estimado en pesos chilenos**
- **CTA directo a WhatsApp de ventas**

El resultado se inyecta automáticamente en el **Pipeline de Leads** del dashboard.

---

## ARCHIVOS

```
audit/
├── index.html   ← Formulario + analizando + reporte (3 pasos)
├── audit.css    ← Estilos dark premium responsive
├── audit.js     ← Motor de análisis real (este archivo)
└── README.md    ← Este archivo
```

---

## MOTORES DE ANÁLISIS (en cascada)

### Motor 1: Google PageSpeed Insights (REAL)
- **API:** `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`
- **Sin key:** 100 requests/día (suficiente para demos y ventas)
- **Con key:** Sin límite (recomendado para producción)
- **Datos obtenidos:** Performance score, LCP, FCP, TBT, Speed Index, Accessibility

### Motor 2: Análisis HTML via proxy CORS (REAL)
- **Proxy:** `https://api.allorigins.win/get?url=`
- **Análisis:** título SEO (largo), meta description, H1, imágenes sin ALT, WhatsApp visible, chatbot, ecommerce, SSL, GTM
- **Fallback:** Si el proxy falla, Motor 3 activa

### Motor 3: Análisis por Rubro (SIEMPRE disponible)
- Basado en benchmarks reales de cada industria en Chile
- Funciona sin internet, para demos offline
- 10 rubros configurados con issues y oportunidades específicas

---

## CONFIGURACIÓN RÁPIDA

```javascript
// audit.js — líneas 18-25 (editar estas variables)
var CFG = {
  WA_SALES:    '56912345678',   // ← NÚMERO REAL DEL EQUIPO DE VENTAS
  PSI_API_KEY: '',              // ← API Key Google (opcional, aumenta límite)
  CORS_PROXY:  'https://api.allorigins.win/get?url=',
  USE_REAL_API: true,           // false = solo análisis simulado
  PIPELINE_KEY: 'aigency_pipeline_leads',
  STORAGE_KEY:  'aigency_audit_leads'
};
```

---

## CÓMO PROBAR LOCALMENTE

```bash
# 1. Levantar servidor
npx http-server . -p 8085 --cors -c-1

# 2. Abrir en navegador
http://localhost:8085/audit/

# 3. Ingresar datos de prueba
URL:     https://falabella.cl  (sitio real para ver datos reales)
Rubro:   Ecommerce — Retail general
WA:      912345678
Nombre:  Test Usuario
Email:   (dejar vacío)

# 4. Verificar
- Análisis debe durar 10-30 segundos (API real)
- Core Web Vitals deben aparecer si PageSpeed responde
- Badge "📡 Análisis real de tu sitio" debe aparecer en verde
- Pipeline del dashboard debe recibir el lead automáticamente
```

---

## CÓMO EDITAR REGLAS DE SCORE

Los scores se calculan en `buildAnalysis()` en `audit.js`:

```javascript
/* Ponderación general (líneas ~180-192):
   Velocidad × 35% + SEO × 30% + UX × 25% + Atención IA × 10% */

// Para cambiar la ponderación:
generalScore = Math.round(
  speedScore * 0.35 +  // ← Cambiar peso velocidad
  seoScore   * 0.30 +  // ← Cambiar peso SEO
  uxScore    * 0.25 +  // ← Cambiar peso UX
  atencScore * 0.10    // ← Cambiar peso atención
);

// Para cambiar umbrales de tier:
if      (generalScore >= 70) { tier = 'Optimizado';       // ← Cambiar umbral
else if (generalScore >= 50) { tier = 'En Desarrollo';
else if (generalScore >= 35) { tier = 'Necesita Mejoras';
else                          { tier = 'Crítico';
```

---

## CÓMO EDITAR TEXTOS DEL REPORTE

Los issues y oportunidades por rubro se editan en `RUBRO_CFG` al inicio de `audit.js`:

```javascript
// Ejemplo: Editar issues de Ecommerce Moda
ecommerce_moda: {
  issues: [
    { sev: 'critical', icon: '🛒', title: 'Mi nuevo título', desc: 'Mi descripción personalizada.' },
    // ... más issues
  ],
  savingsMin: 850000,   // ← Ahorro mínimo estimado (CLP/mes)
  savingsMax: 2800000,  // ← Ahorro máximo estimado (CLP/mes)
}
```

---

## CÓMO CONECTAR APIs REALES EN PRODUCCIÓN

### Obtener Google PageSpeed API Key (gratis)

1. Ir a https://console.cloud.google.com
2. Crear proyecto → Buscar "PageSpeed Insights API" → Habilitar
3. Credenciales → Crear clave API → Copiar
4. En `audit.js` línea 19: `PSI_API_KEY: 'AIzaSyXXXXXX'`
5. En Netlify → Settings → Environment variables → `PSI_API_KEY = AIzaSy...`

### Proxy CORS alternativo si allorigins falla

```javascript
// Opciones (en orden de confiabilidad)
'https://api.allorigins.win/get?url='
'https://corsproxy.io/?'
'https://api.codetabs.com/v1/proxy?quest='
'http://localhost:8085/proxy?url='  // ← Para desarrollo con proxy propio
```

### Hook para backend propio

```javascript
// Al activar un cliente real:
window.AiGencyOnAuditLead = async function(lead) {
  // Enviar al CRM propio o Supabase
  await fetch('https://api.tudominio.cl/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'TU_KEY' },
    body: JSON.stringify(lead)
  });
};
```

---

## USO COMERCIAL — GUÍA PARA EJECUTIVOS

### ¿Cuándo usar la auditoría?

| Situación | Cómo usar |
|-----------|-----------|
| Reunión de prospección en frío | Abrir `/audit/` con el prospecto presente, analizar su sitio en vivo |
| Envío de propuesta digital | Compartir link `https://aigency.cl/audit/?ref=vendedor-nombre` |
| Seguimiento post-primer contacto | Enviar resultado en PDF por WhatsApp |
| Demo para directivo escéptico | Analizar sitio de la competencia del prospecto para comparar |

### Argumentos de venta basados en el reporte

- **Score < 40 (Crítico):** *"Tu sitio está perdiendo el 60% de los clientes que llegan. Esto se resuelve en 2 semanas."*
- **Score 40-60 (Mejorable):** *"Estás a mitad de camino. Con los 3 módulos que te mostramos puedes doblar tu conversión."*
- **Sin WhatsApp detectado:** *"El 78% de los chilenos contacta empresas por WhatsApp. No tenerlo cuesta \$X al mes en leads perdidos."*
- **SEO deficiente:** *"Google no está mostrando tu sitio. Hay dinero que está yendo directo a la competencia."*

---

## TROUBLESHOOTING

| Problema | Causa | Solución |
|----------|-------|----------|
| Análisis en blanco | PageSpeed bloqueado por CORS | Fallback por rubro activa automáticamente |
| Badge dice "Estimado" | PageSpeed API no respondió | Normal — usar con key para más fiabilidad |
| Lead no aparece en Pipeline | localStorage distinto entre tabs | Abrir Pipeline en la misma tab o recargar |
| Informe tarda > 30 seg | API PageSpeed lenta | Normal para sitios externos — esperar |
| Core Web Vitals vacíos | URL sin HTTPS o no indexada | Solo aparecen para sitios públicos con HTTPS |

---

*AiGency.cl · Módulo Auditoría · v2.0 Real API · Ley N°19.628*

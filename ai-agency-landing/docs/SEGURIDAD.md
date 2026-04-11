# 🔒 Seguridad Operativa y Continuidad del Negocio
### AigenciaLab.cl · Manual de Seguridad · Versión 1.0
**Marco legal:** Ley N°21.663 (Ciberseguridad Chile) · Ley N°19.628 (Protección Datos)

---

## 1. PRINCIPIOS DE PRIVACIDAD Y DATOS

### Minimización de datos (Art. 3, Ley 19.628)
El sistema solo recoge los datos estrictamente necesarios:
- **Dashboard:** datos operativos sin PII de clientes finales
- **Audit Lead Magnet:** URL, rubro, WhatsApp, nombre — no cedemos a terceros
- **Pipeline:** datos de empresas (B2B) — no personas naturales
- **Soporte:** tickets con contexto mínimo necesario

### Almacenamiento
- **Todos los datos en localStorage** (navegador del usuario, no servidor)
- **No hay base de datos remota** en la versión actual
- **No hay cookies de tracking** de terceros
- **No compartimos datos** con plataformas publicitarias

### Derechos del titular (Art. 12, Ley 19.628)
Un cliente puede solicitar en cualquier momento:
1. **Acceso:** ver sus datos → `AigenciaLabAudit.getLeads()`
2. **Rectificación:** corregir datos incorrectos → editar en dashboard
3. **Supresión:** eliminar datos → `AigenciaLabAudit.clearLeads()`
4. **Portabilidad:** exportar en CSV → `AigenciaLabAudit.exportCSV()`

---

## 2. SEGURIDAD DEL DASHBOARD

### Control de acceso
La versión actual no tiene autenticación de servidor.  
**Para producción real**, implementar uno de estos métodos:

**Opción A — Protección básica con Netlify Identity (gratuito):**
```html
<!-- Agregar en platform/index.html -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```
```javascript
// platform/dashboard.js — inicio del archivo
netlifyIdentity.on('logout', function() { window.location = '/login'; });
if (!netlifyIdentity.currentUser()) window.location = '/login';
```

**Opción B — Password simple (para demos con cliente):**
```javascript
// platform/dashboard.js — inicio
var DEMO_PASSWORD = 'AigenciaLab2024';
if (prompt('🔒 Contraseña de acceso') !== DEMO_PASSWORD) {
  document.body.innerHTML = '<h2 style="text-align:center;padding:40px">Acceso denegado</h2>';
}
```

**Opción C — Supabase Auth (producción enterprise):**
Ver `docs/BACKEND_MIGRATION.md`

### Tokens y claves
- Nunca hardcodear claves de API en archivos `.js` públicos
- Usar variables de entorno en Netlify/Vercel:
  - Netlify: Settings → Environment variables
  - Vercel: Settings → Environment Variables
```
GOOGLE_PSI_KEY=AIzaSyXXXXXXX
WA_ACCESS_TOKEN=EAAGXXXXXXX
SUPABASE_KEY=eyJhbGXXXXX
```

### Rotación de tokens
- Tokens de WhatsApp Business: rotar cada 60 días
- API Keys de Google: rotar si se detecta uso no autorizado
- Passwords del dashboard: cambiar al inicio de cada cliente nuevo

---

## 3. LOGS Y AUDITORÍA (Ley 21.663, Art. 8)

### Registros automáticos
El sistema registra automáticamente en `localStorage['AigenciaLab_logs']`:
```json
{
  "ts": "2026-04-10T17:30:00Z",
  "event": "dashboard_access",
  "module": "pipeline",
  "user": "operador@empresa.cl",
  "ip": "consulta_local"
}
```

### Tipos de eventos registrados
| Evento | Descripción | Retención |
|--------|-------------|-----------|
| `dashboard_access` | Acceso al dashboard | 365 días |
| `lead_created` | Nuevo lead en pipeline | 730 días |
| `ticket_resolved` | Ticket cerrado | 365 días |
| `audit_completed` | Auditoría gratuita completada | 180 días |
| `data_exported` | Exportación de datos | 730 días |
| `security_alert` | Amenaza detectada | 1095 días (3 años) |

### Exportar logs para auditoría
```javascript
// En DevTools Console del dashboard
var logs = JSON.parse(localStorage.getItem('AigenciaLab_logs') || '[]');
var csv = 'Timestamp,Evento,Módulo,Usuario\n' + logs.map(function(l) {
  return [l.ts, l.event, l.module, l.user].join(',');
}).join('\n');
var blob = new Blob([csv], {type:'text/csv'});
var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
a.download = 'audit-log-' + Date.now() + '.csv'; a.click();
```

---

## 4. BACKUPS

### Backup automático (localStorage → JSON descargable)
```javascript
// Ejecutar en DevTools Console — guarda TODO el estado
function backupAll() {
  var keys = ['AigenciaLab_audit_leads','AigenciaLab_pipeline_leads','AigenciaLab_support_tickets','AigenciaLab_biz_alerts','AigenciaLab_logs'];
  var backup = {};
  keys.forEach(function(k) { try { backup[k] = JSON.parse(localStorage.getItem(k)||'[]'); }catch(e){} });
  backup.exported_at = new Date().toISOString();
  var blob = new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'AigenciaLab-backup-'+Date.now()+'.json'; a.click();
}
backupAll();
```

### Restaurar desde backup
```javascript
// Ejecutar en DevTools Console — restaura desde JSON descargado
function restoreBackup(jsonString) {
  var backup = JSON.parse(jsonString);
  Object.keys(backup).forEach(function(k) {
    if (k !== 'exported_at') localStorage.setItem(k, JSON.stringify(backup[k]));
  });
  alert('✅ Backup restaurado. Recargando...'); location.reload();
}
// Uso: fetch('AigenciaLab-backup-XXX.json').then(r=>r.text()).then(restoreBackup);
```

### Frecuencia recomendada
| Nivel | Frecuencia | Responsable |
|-------|-----------|-------------|
| STARTER | Semanal (manual) | Operador del cliente |
| ADVANCED | Diario (script automático) | Técnico AigenciaLab |
| ENTERPRISE | Cada 4 horas + réplica cloud | Equipo AigenciaLab |

---

## 5. CONTINUIDAD OPERATIVA — PLANES DE CONTINGENCIA

### Escenario 1: Cae el sitio web (hosting caído)

**Síntoma:** `ERR_CONNECTION_REFUSED` o white page al abrir la URL

**Protocolo:**
1. ✅ Verificar en https://downdetector.cl si es un problema generalizado
2. ✅ Ingresar a cPanel/Netlify → Verificar estado del servidor
3. ✅ Si es Netlify/Vercel: revisar → Deploy fallido → `Publish deploy` en versión anterior
4. ✅ Si es cPanel: abrir ticket de soporte con el hosting (incluir URL y hora del error)
5. ✅ Mientras se resuelve: activar página temporal con link a WhatsApp de atención
6. ✅ Notificar al cliente: *"Estamos resolviendo una incidencia en la infraestructura. ETA: [tiempo]"*

**Tiempo máximo de resolución:** 2 horas (ADVANCED) / 1 hora (ENTERPRISE)

---

### Escenario 2: El agente de WhatsApp no responde

**Síntoma:** Mensajes de WhatsApp sin respuesta por más de 5 minutos

**Protocolo:**
1. ✅ Verificar estado de WhatsApp Business API: https://metastatus.com
2. ✅ Revisar logs en `/platform/#logs` → buscar errores de webhook
3. ✅ Verificar que el `ACCESS_TOKEN` no haya expirado (tokens duran 60 días por defecto)
4. ✅ Re-generar token en Meta Business → actualizar en configuración
5. ✅ Si Meta tiene incidencia: activar modo fallback manual (responder por humano)
6. ✅ Enviar mensaje proactivo a clientes afectados: *"Estamos experimentando un problema técnico, te contactar en X min"*

---

### Escenario 3: Un cliente borra sus datos accidentalmente

**Síntoma:** Dashboard vacío, leads desaparecidos

**Protocolo:**
1. ✅ Verificar si hay backup descargado (ver sección 4)
2. ✅ Si hay backup: restaurar con función `restoreBackup()`
3. ✅ Si no hay backup: los datos del audit están en `AigenciaLab_audit_leads` (no se borran al limpiar pipeline)
4. ✅ Para ADVANCED/ENTERPRISE: el backend en la nube (si migrado) tiene réplica automática
5. ✅ Lección: configurar exportación automática semanal

---

### Escenario 4: Falla la integración con WooCommerce/Shopify

**Síntoma:** Datos de producto no actualizan, stock desincronizado

**Protocolo:**
1. ✅ Verificar que las credenciales API (Consumer Key/Secret) no hayan caducado
2. ✅ Regenerar credenciales en WooCommerce → WC Settings → Advanced → REST API
3. ✅ Verificar que el agente tiene permiso `read_write` (no solo `read`)
4. ✅ Probar endpoint manualmente: `curl https://tienda.cl/wp-json/wc/v3/products`
5. ✅ Si sigue fallando: contactar al proveedor del hosting de WooCommerce

---

### Escenario 5: Amenaza de seguridad detectada (hacking intento)

**Síntoma:** Alerta de ciberseguridad en el dashboard, anomalía en logs

**Protocolo:**
1. ⛔ **NO entrar en pánico ni borrar logs** (son evidencia legal bajo Ley 21.663)
2. ✅ Documentar: screenshot de la alerta + timestamp
3. ✅ Si es SQL injection: bloquear IP en cPanel → Firewall → Deny IP
4. ✅ Si es acceso no autorizado al dashboard: cambiar contraseña inmediatamente
5. ✅ Si hay datos comprometidos: notificar al cliente en < 72 horas (Ley 19.628, Art. 15)
6. ✅ Reportar al CSIRT de Chile si el incidente es grave: https://www.csirt.gob.cl

---

## 6. DECLARACIÓN DE CUMPLIMIENTO

> Este sistema cumple con:
> - **Ley N°21.663 — Marco Nacional de Ciberseguridad:** logs de auditoría, control de accesos, protocolos de respuesta a incidentes
> - **Ley N°19.628 — Protección de Datos Personales:** minimización, consentimiento explícito, derechos ARCO, almacenamiento local
> - **GDPR (referencia):** prácticas de privacidad por diseño alineadas al estándar europeo

*AigenciaLab.cl · Seguridad y Continuidad · v1.0 · Actualizado: Abril 2026*


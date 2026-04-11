# ⚙️ Onboarding de Nuevo Cliente — Menos de 2 Horas
### Proceso estándar AigenciaLab.cl · SOP-ONBOARD-001 · v1.0

```
⏱️ OBJETIVO: Cliente configurado y con su primer agente activo en < 2 horas
📋 RESPONSABLE: Ejecutivo comercial + Técnico junior
🔒 CUMPLIMIENTO: Ley N°19.628 · Ley N°21.663
```

---

## ✅ CHECKLIST FASE 1 — COMERCIAL (30 minutos)

### 1.1 Datos de la Empresa
- [ ] Nombre legal completo y RUT
- [ ] Nombre de fantasía y URL del sitio web
- [ ] Rubro e industria específica
- [ ] Región y comuna principal
- [ ] Número de empleados (rango approx.)
- [ ] Volumen mensual de ventas/atenciones

### 1.2 Objetivo y Problema Principal
- [ ] ¿Qué problema quieren resolver primero? (ej: "no respondemos WhatsApp de noche")
- [ ] ¿Qué KPI quieren mejorar? (ej: tiempo de respuesta, ventas, leads)
- [ ] ¿Tienen equipo técnico interno?
- [ ] Presupuesto aprobado y plan seleccionado (STARTER / ADVANCED / ENTERPRISE)

### 1.3 Contactos Clave
- [ ] **Decisor técnico:** nombre + WhatsApp + email
- [ ] **Decisor comercial:** nombre + WhatsApp + email
- [ ] **Usuario operativo** (quien usará el dashboard): nombre + email
- [ ] **Contacto de emergencia** para incidentes críticos

### 1.4 Contrato y Documentos
- [ ] Contrato de servicios firmado (ambas partes)
- [ ] Flujo de datos firmado (cumplimiento Ley 19.628)
- [ ] Correo de bienvenida enviado con credenciales de acceso

---

## ✅ CHECKLIST FASE 2 — TÉCNICO (60 minutos)

### 2.1 Dominios y Accesos
- [ ] Dominio principal del cliente confirmado (ej: `retailsur.cl`)
- [ ] Acceso FTP o cPanel del hosting (si integramos en su servidor)
- [ ] Credenciales WooCommerce/Shopify (Consumer Key + Secret) si aplica
- [ ] API Key de WhatsApp Business (Meta Cloud API o proveedor)
- [ ] Activo en plataforma: URL del dashboard asignado al cliente

### 2.2 WhatsApp Business — Configuración Completa Paso a Paso
- [ ] Número de WhatsApp Business confirmado (+56 9 XXXX XXXX)
- [ ] Número verificado en Meta Business Manager
- [ ] Webhooks configurados y testeados (envíos + recepciones OK)
- [ ] Plantillas de mensajes aprobadas por Meta (si aplica)

**Guía completa (para personas sin experiencia técnica):**

#### PASO 1: Crear cuenta en Meta for Developers
1. Ir a https://developers.facebook.com/
2. Click "Iniciar sesión" con tu cuenta de Facebook personal
3. Click "Mis aplicaciones" → "Crear aplicación"
4. Seleccionar tipo: **"Empresa"** → Click "Siguiente"
5. Nombre de la app: `AigenciaLab - [NombreCliente]`
6. Click "Crear aplicación"

#### PASO 2: Agregar WhatsApp a la App
1. En el panel de la app, buscar **"WhatsApp"** en "Agregar productos"
2. Click **"Configurar"** en WhatsApp
3. Se mostrará la pantalla de "Primeros pasos" con un número de prueba

#### PASO 3: Obtener las credenciales
En la página de WhatsApp → "Primeros pasos":
1. **Phone Number ID:** Se muestra como "ID del número de teléfono" (ej: `123456789012345`)
2. **Token temporal:** Click "Generar token de acceso" (dura 24h, solo para pruebas)
3. **Token permanente:** 
   - Ir a "Configuración del sistema" de tu Meta Business Manager
   - Click "Generar nuevo token de acceso permanente"
   - Seleccionar permisos: `whatsapp_business_messaging`, `whatsapp_business_management`

#### PASO 4: Configurar el Webhook
1. En WhatsApp → **"Configuración"** → **"Webhooks"**
2. Click **"Editar"**
3. Ingresar:
   - **URL de callback:** `https://app.aigencialab.cl/api/whatsapp/webhook`
   - **Token de verificación:** `aigencialab_wh_2024`
4. Click **"Verificar y guardar"** → Debe mostrar ✅
5. **Suscripciones:** Activar el campo **"messages"** → Click "Probar"

#### PASO 5: Verificar el número real
1. En WhatsApp → **"Números de teléfono"** → Click "Agregar número"
2. Ingresar el número real del cliente (+56 9 XXXX XXXX)
3. Meta enviará un SMS o llamada con código de verificación
4. Ingresar el código → Número verificado ✅

**Credenciales a guardar (enviar al técnico):**
```
PHONE_NUMBER_ID: _____________________
ACCESS_TOKEN:    _____________________
VERIFY_TOKEN:    aigencialab_wh_2024
WEBHOOK_URL:     https://app.aigencialab.cl/api/whatsapp/webhook
```

### 2.3 Canales Adicionales (según plan)
- [ ] **Chat Web:** Código widget instalado en `</body>` del sitio
- [ ] **Email:** Alias de soporte configurado (ej: `soporte@tienda.cl` → agente)
- [ ] **Instagram DM:** Cuenta business conectada a Meta Business Suite
- [ ] **Slack:** Webhook URL de canal `#alertas-ia` configurado

### 2.4 Datos del Agente
- [ ] FAQs iniciales cargadas (mínimo 10 preguntas/respuestas)
- [ ] Catálogo de productos cargado (CSV o manual en onboarding wizard)
- [ ] Horarios de atención configurados
- [ ] Mensaje de bienvenida personalizado ("Hola! Soy [Nombre], agente de [Empresa]...")
- [ ] Tono de voz definido (formal / amigable / técnico)
- [ ] Protocolo de escalado definido (¿a qué número escala si no puede responder?)

### 2.5 Dashboard de Monitoreo
- [ ] Acceso al Dashboard creado: `AigenciaLab.cl/platform/` o URL personalizada
- [ ] Usuario y contraseña entregados al cliente (en persona o por canal seguro)
- [ ] Módulos activados según plan:
  - [ ] STARTER: Overview + 1 agente + Logs
  - [ ] ADVANCED: + Pipeline + Soporte + Alertas
  - [ ] ENTERPRISE: + BI Predictivo + Ciberseguridad + Propuestas PDF

---

## ✅ CHECKLIST FASE 3 — ACTIVACIÓN Y PRUEBAS (30 minutos)

### 3.1 Pruebas funcionales
- [ ] Enviar mensaje de prueba al WhatsApp del agente → responde en < 5 segundos
- [ ] Probar pregunta fuera de FAQs → escala correctamente al humano
- [ ] Verificar que el dashboard muestra datos en tiempo real
- [ ] Crear ticket de prueba en módulo de Soporte → aparece en panel
- [ ] Verificar que las alertas de negocio se activan (esperar 30-45 seg)

### 3.2 Prueba de Estrés (solo ADVANCED y ENTERPRISE)
- [ ] Enviar 10 mensajes simultáneos → todos reciben respuesta
- [ ] Simular caída de API → fallback activo, mensaje de contingencia enviado
- [ ] Probar recuperación de carrito → mensaje de WhatsApp llega en < 31 minutos

### 3.3 Entrega al Cliente
- [ ] Demo en vivo de 20 minutos con el usuario operativo
- [ ] Manual de usuario entregado (PDF o link a docs)
- [ ] Accesos al dashboard entregados por canal seguro
- [ ] Confimación: cliente puede navegar el dashboard sin ayuda
- [ ] Agendar revisión de a 30 días (QBR: Quarterly Business Review)

---

## 📄 CONFIGURACIÓN RÁPIDA — COMANDOS Y DATOS CLAVE

### Formulario de configuración (Self-Service)
El cliente puede completar buena parte del onboarding solo en:

```
https://AigenciaLab.cl/onboarding/
```

Al finalizar el wizard descarga un archivo `AigenciaLab-config-empresa.json` que el técnico importa directamente.

### Carga de FAQs manual
```javascript
// Abrir DevTools del dashboard (F12) → Console
var faqs = [
  { q: "¿Cuáles son los horarios?", a: "Lunes a viernes 9-18h." },
  { q: "¿Hacen despacho a todo Chile?", a: "Sí, en 2-5 días hábiles." }
];
localStorage.setItem('AigenciaLab_agent_faqs', JSON.stringify(faqs));
location.reload();
```

### Carga de productos vía CSV
Formato esperado (sin encabezado):
```csv
Producto,Precio,Stock,Descripción
Notebook Pro 15",1299990,50,Core i7 16GB RAM SSD 512GB
Monitor 4K 27",649990,30,Panel IPS 144Hz
```

Subir en: `/onboarding/` → Paso 2 → "Cargar CSV"

---

## ⚠️ SLA Y PROMESAS AL CLIENTE

| Plan | 1a Respuesta (agente) | Resolución soporte | Uptime garantizado |
|------|--------------------|-------------------|-------------------|
| STARTER | < 3 segundos 24/7 | < 24 horas | 99.5% |
| ADVANCED | < 2 segundos 24/7 | < 4 horas | 99.9% |
| ENTERPRISE | < 1 segundo 24/7 | < 1 hora | 99.9% + penalidades |

---

## 🚨 PROTOCOLO DE EMERGENCIA

Si el agente falla durante las primeras 48h (período crítico):

1. **T+0:** Alerta automática a `#incidentes-slack` del equipo
2. **T+5 min:** Técnico junior verifica logs en `/platform/#logs`
3. **T+15 min:** Si no se resuelve → escala a técnico senior
4. **T+30 min:** Notificación proactiva al cliente: *"Estamos atendiendo una incidencia técnica, solución estimada en X horas"*
5. **T+60 min:** Activar modo fallback: responder manualmente desde WhatsApp humano

---

*AigenciaLab.cl · SOP-ONBOARD-001 · Ley N°19.628 · Ley N°21.663*


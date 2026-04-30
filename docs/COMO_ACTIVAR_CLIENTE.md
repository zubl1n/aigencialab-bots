# ⚙️ CÓMO ACTIVAR UN CLIENTE (ONBOARDING)
### AigenciaLab.cl · SOP Onboarding v1.0 · Tiempo: < 2 horas

---

## VISIÓN GENERAL

```
FASE 1 (30 min) → Datos empresa + contrato
FASE 2 (45 min) → Configuración técnica + WhatsApp
FASE 3 (30 min) → Pruebas + entrega de accesos
FASE 4 (15 min) → Capacitación rápida del operador cliente
```

---

## FASE 1 — COMERCIAL (30 minutos)

### Información a recopilar antes de abrir el wizard:

- [ ] Nombre legal empresa + RUT
- [ ] Nombre comercial + URL del sitio web
- [ ] Rubro específico (usar lista del wizard)
- [ ] Nombre y cargo del contacto técnico
- [ ] WhatsApp del contacto (+56...)
- [ ] Email del contacto
- [ ] Plan contratado (STARTER / ADVANCED / ENTERPRISE)
- [ ] Número de WhatsApp Business que usará el agente
- [ ] ¿Tienen Meta Business Manager? (necesario para el webhook)
- [ ] Lista inicial de FAQs (mínimo 5 preguntas/respuestas)
- [ ] Catálogo de productos en CSV (si aplica)

### Contrato y documentos:
- [ ] Contrato de servicios firmado digitalmente (PDF)
- [ ] Formulario de tratamiento de datos (Ley 19.628) firmado
- [ ] Correo de bienvenida enviado al cliente

---

## FASE 2 — TÉCNICA CON EL WIZARD (45 minutos)

### Paso 1: Abrir el onboarding
1. Ir a `https://aigencialab.cl/dashboard` → Login
2. Sidebar → **⚙️ Nuevo Cliente**

### Paso 2: Completar los 5 pasos del wizard

**Paso 1 — Datos empresa:**
- Empresa, rubro, contacto, WhatsApp, email, URL, plan
- Verificar que los datos coincidan con el contrato

**Paso 2 — Agente IA:**
- Nombre del agente (sugerido: "Nova" o el que prefiera el cliente)
- Tono: Amigable para B2C, Formal para B2B
- Keyword de escalado (default: "humano")
- Mensaje de bienvenida personalizado

**Paso 3 — WhatsApp Business API:**
- Seguir `docs/COMO_CONECTAR_WHATSAPP.md` para obtener las credenciales
- Phone Number ID + Access Token del cliente
- Si no tienen Meta Business aún: dejar en blanco y activar después

**Paso 4 — FAQs y Catálogo:**
- Cargar las FAQs (mínimo 5, recomendado 15+)
- Subir CSV de productos si es ecommerce
  - Formato: `Nombre,Precio,Stock` (sin encabezado)
  - Ejemplo: `Notebook Pro 15",1299990,50`

**Paso 5 — Revisar y Activar:**
- Verificar todos los datos
- Click **🚀 Activar Cliente Ahora**
- El sistema:
  1. Guarda en Supabase (tabla `clients`)
  2. Envía email de bienvenida al cliente (si Resend configurado)
  3. Crea registro de audit_log

---

## FASE 3 — PRUEBAS (30 minutos)

### Prueba 1 — Agente respondiendo FAQs

Enviar al número de WhatsApp del cliente (con las credenciales Meta configuradas):
```
"Hola"
→ Esperar mensaje de bienvenida del agente

"¿Cuáles son los horarios?"
→ Debe responder con la FAQ correspondiente

"humano" (o el keyword configurado)
→ Debe decir que transfiere a un ejecutivo
→ Verificar que aparece ticket en /dashboard/tickets
```

### Prueba 2 — Dashboard del cliente
1. Ir a `/dashboard/clients` → verificar que aparece el nuevo cliente
2. Ir a `/dashboard/chats` → verificar que la conversación de prueba aparece
3. Ir a `/dashboard/tickets` → verificar el ticket de escalado automático

### Prueba 3 — Auditoría del sitio del cliente
1. Ir a `/audit`
2. Ingresar URL del cliente + su rubro
3. Verificar que el score es realista
4. Compartir el reporte con el cliente como primer entregable de valor

---

## FASE 4 — CAPACITACIÓN RÁPIDA (15 minutos)

### Mostrar al operador del cliente:

1. **Dashboard Overview**: cómo ver KPIs, leads y alertas
2. **Conversaciones**: cómo ver chats y responder cuando necesita humano
3. **Tickets**: cómo cambiar estado de un ticket
4. **WhatsApp respuesta manual**: abrir WhatsApp Business directamente cuando les notifique el agente

### Entregar al cliente:
- [ ] URL del dashboard: `https://aigencialab.cl/dashboard`
- [ ] Email y password de acceso (si tienen acceso propio)
- [ ] Número de WhatsApp de soporte AigenciaLab: `+56XXXXXXXX`
- [ ] Documento de uso básico del agente (resumen de FAQs configuradas)

---

## CONFIGURACIÓN POST-ACTIVACIÓN

### Verificar en Supabase que el cliente está correcto:
```sql
SELECT id, company, plan, status, wa_phone_id,
       jsonb_array_length(faqs) as faqs_count
FROM clients
WHERE company ILIKE '%nombre del cliente%';
```

### Si hay que corregir datos:
```sql
-- Corregir un dato específico del cliente
UPDATE clients
SET contact_name = 'Nuevo Nombre',
    email = 'nuevo@email.cl',
    updated_at = now()
WHERE company = 'Nombre de la empresa';

-- Agregar una FAQ
UPDATE clients
SET faqs = faqs || '[{"q":"Nueva pregunta","a":"Nueva respuesta"}]'::jsonb
WHERE id = 'UUID-DEL-CLIENTE';

-- Activar canal WhatsApp
UPDATE clients
SET channels = '{"whatsapp":true,"web":false,"email":false}'::jsonb
WHERE id = 'UUID-DEL-CLIENTE';
```

---

## SLA Y COMPROMISOS POR PLAN

| Promesa | STARTER | ADVANCED | ENTERPRISE |
|---------|---------|----------|-----------|
| Tiempo onboarding | < 4h | < 2h | < 1h |
| Respuesta agente | < 3 seg | < 2 seg | < 1 seg |
| Soporte técnico | Email 48h | Email 4h | WhatsApp 1h |
| Uptime | 99.5% | 99.9% | 99.9% + penalidades |

---

## CHECKLIST FINAL DE ENTREGA

- [ ] Cliente guardado en Supabase con status `active`
- [ ] FAQs cargadas (mínimo 5)
- [ ] WhatsApp respondiendo (si aplica)
- [ ] Ticket de escalado funcionando
- [ ] Email de bienvenida recibido por el cliente
- [ ] Accesos al dashboard entregados
- [ ] Primera auditoría de su sitio compartida
- [ ] Próxima revisión agendada (30 días)

*AigenciaLab.cl · Onboarding SOP v1.0 · Ley N°19.628 · Ley N°21.663*

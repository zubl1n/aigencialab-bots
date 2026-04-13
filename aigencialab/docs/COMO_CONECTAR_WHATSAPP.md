# 💬 CÓMO CONECTAR WHATSAPP BUSINESS API
### AigenciaLab.cl · Meta Cloud API · SOP v1.0

---

## RESUMEN DEL FLUJO

```
Cliente escribe a WA → Meta → webhook → /api/whatsapp/webhook
                                       ↓
                                  FAQ engine
                                       ↓
                              Supabase (guardar msg)
                                       ↓
                            /api/whatsapp/send → Meta → respuesta a cliente
```

---

## PASO 1 — CREAR APP EN META DEVELOPERS (15 min)

1. Ir a **https://developers.facebook.com**
2. Login con cuenta de Facebook Business
3. **My Apps → Create App**
4. Tipo: **Business**
5. Nombre: `AigenciaLab`  
6. Business Account: tu cuenta Business Manager
7. **Add Product → WhatsApp → Set Up**

---

## PASO 2 — CONFIGURAR NÚMERO DE TELÉFONO (10 min)

1. En tu app → **WhatsApp → API Setup**
2. Usar el número de prueba gratuito de Meta (para testing) O agregar un número propio:
   - **Add Phone Number** → ingresar el número Business del cliente
   - Verificar con OTP
3. Copiar el **Phone Number ID** (número de 15 dígitos)
   ```
   Ejemplo: 123456789012345
   ```
4. Generar **Temporary Access Token** (válido 24h) o un **System User Token** (permanente):
   - Para producción: **Business Settings → System Users → Add → Admin**
   - En System User → Agregar activo: tu app → con rol "Admin"
   - **Generate New Token** → marcar permisos: `whatsapp_business_messaging` + `whatsapp_business_management`

---

## PASO 3 — CONFIGURAR WEBHOOK (5 min)

1. En tu app → **WhatsApp → Configuration → Webhooks**
2. **Callback URL**: `https://aigencialab.cl/api/whatsapp/webhook`
3. **Verify Token**: `aigencialab_wh_2024` (debe coincidir con `WA_VERIFY_TOKEN` en `.env.local`)
4. Click **Verify and Save**
   - Si falla: tu URL no está desplegada aún en Vercel — despliega primero
5. **Suscribir campos**: click **Manage** → activar `messages`

---

## PASO 4 — PROBAR EL WEBHOOK

```bash
# Probar recepción manual (simula mensaje de Meta)
curl -X POST https://aigencialab.cl/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "PHONE_NUMBER_ID",
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "56912345678",
            "id": "msg_test_001",
            "type": "text",
            "text": { "body": "Hola, ¿cuánto cuesta?" }
          }]
        }
      }]
    }]
  }'
```

Respuesta esperada: `{"status":"ok"}`

---

## PASO 5 — AGREGAR CREDENCIALES AL CLIENTE

En el Onboarding Wizard (`/dashboard/onboarding`, Paso 3):
1. **Phone Number ID**: pegar el ID del paso 2
2. **Access Token**: pegar el token del paso 2

Quedan guardados en `clients.wa_phone_id` y `clients.wa_token_enc` en Supabase.

---

## PASO 6 — OBTENER APP SECRET (para validar firma)

1. Tu app Meta → **Settings → Basic**
2. Copiar **App Secret**
3. Pegar en `.env.local` → `WA_APP_SECRET`
4. Pegar en Vercel → Environment Variables → `WA_APP_SECRET`

Esto permite que el webhook valide que los mensajes vienen realmente de Meta (protección contra ataques).

---

## PASO 7 — CONFIGURAR PLANTILLAS DE MENSAJES (para outbound)

Solo para mensajes proactivos al cliente (notificaciones, recordatorios):

1. Tu app → **WhatsApp → Message Templates → Create**
2. Ejemplo:
   - Nombre: `bienvenida_cliente`  
   - Categoría: `UTILITY`
   - Idioma: `Español (es)`
   - Cuerpo: `Hola {{1}}, tu pedido {{2}} está en camino. Tiempo estimado: {{3}} horas.`
3. Enviar para revisión → Meta aprueba en 24-48h

Para mensajes de respuesta (dentro de las 24h de que el cliente escribió): no se requiere plantilla.

---

## MODO TESTING VS PRODUCCIÓN

| Aspecto | Testing | Producción |
|---------|---------|-----------|
| Números | 5 números de prueba gratis | Cualquier número |
| Límite mensajes | Ilimitado (entre el equipo) | 1.000 conv. gratis/mes |
| Plantillas | Opcionales | Obligatorias para outbound |
| App Status | Development | Live (pasar a Live en Meta dashboard) |

**Para pasar a Live:**
1. Top de la app Meta → cambiar de **Development** a **Live**
2. Requiere: Privacy Policy URL + Terms of Service URL en tu app

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Webhook 403 | `WA_VERIFY_TOKEN` incorrecto | Verificar que sea exactamente `aigencialab_wh_2024` |
| Webhook 401 | `WA_APP_SECRET` incorrecto | Copiar App Secret desde Settings → Basic |
| "Invalid Access Token" | Token expirado o revocado | Generar nuevo System User Token |
| No llegan mensajes | Webhook no suscrito a "messages" | WhatsApp → Configuration → Manage → activar `messages` |
| 400 al enviar | Número sin prefijo de país | El número debe ser `56912345678` (sin +) |

---

## COSTOS ESTIMADOS META CLOUD API

| Período | Conversaciones | Costo |
|---------|---------------|-------|
| Primeros 1.000/mes | Servicio (cliente escribe) | GRATIS |
| +1.001 | Servicio | ~$0.0125 USD c/u |
| Marketing (outbound) | Cualquier cantidad | ~$0.054 USD c/u |

Para un MVP con < 500 clientes activos: **costo $0 o < $10 USD/mes**.

*AigenciaLab.cl · WhatsApp Setup · Meta Cloud API · SOP v1.0*

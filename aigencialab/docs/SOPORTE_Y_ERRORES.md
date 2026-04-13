# 🔧 SOPORTE Y RESOLUCIÓN DE ERRORES
### AigenciaLab.cl · Manual de Soporte Técnico · SOP v1.0

---

## DIAGNÓSTICO RÁPIDO (< 5 minutos)

Antes de cualquier otra acción, ejecutar este checklist:

```
✅ ¿La URL aigencialab.cl carga? → Si no: problema de hosting
✅ ¿F12 → Console tiene errores rojos? → Ver tabla de errores abajo
✅ ¿Supabase Dashboard está Online? → status.supabase.com
✅ ¿Vercel deployment exitoso? → vercel.com → proyecto → Deployments
✅ ¿Variables de entorno correctas en Vercel? → Settings → Env Vars
```

---

## ERRORES POR MÓDULO

### 🔍 Auditoría (`/audit`)

| Error | Causa | Solución |
|-------|-------|----------|
| "Error del servidor" al enviar formulario | Variable Supabase incorrecta | Verificar `SUPABASE_SERVICE_ROLE_KEY` en Vercel |
| Score siempre es 0 | Error en build engine | Ver logs Vercel → Functions |
| PageSpeed no responde | API sobrepasó límite (100/día sin key) | Agregar `GOOGLE_PSI_API_KEY` en .env |
| Lead no aparece en Supabase | Schema no ejecutado | Ejecutar `001_initial_schema.sql` en Supabase SQL Editor |

### 🎯 Dashboard (`/dashboard`)

| Error | Causa | Solución |
|-------|-------|----------|
| Redirige siempre al login | Cookie de sesión perdida | Hacer login nuevamente |
| Tabla leads vacía | Sin datos en Supabase | Completar una auditoría primero |
| "relation does not exist" | Schema no ejecutado | Ejecutar el SQL schema en Supabase |
| KPIs muestran 0 | `service_role` key incorrecta | Verificar `SUPABASE_SERVICE_ROLE_KEY` |

### 💬 WhatsApp Webhook

| Error | HTTP | Causa | Solución |
|-------|------|-------|----------|
| 403 en GET | 403 | `WA_VERIFY_TOKEN` no coincide | Verificar que sea `aigencialab_wh_2024` |
| 401 en POST | 401 | `WA_APP_SECRET` incorrecto | Copiar desde Meta → Settings → Basic |
| No llegan mensajes | — | Webhook no suscrito | Meta → Configuration → Manage → activar `messages` |
| Respuesta no llega al cliente | — | `wa_phone_id` o token incorrecto | Verificar en Supabase → clients → wa_phone_id |
| "Invalid phone number" | — | Formato incorrecto | El número debe ser solo dígitos: `56912345678` |

### 📧 Emails (Resend)

| Error | Causa | Solución |
|-------|-------|----------|
| Emails no llegan | `RESEND_API_KEY` no configurada | Crear cuenta resend.com y agregar key |
| "Unauthorized" Resend | API key revocada | Generar nueva key en Resend dashboard |
| Email va a spam | Dominio no verificado | Resend → Domains → Verificar `aigencialab.cl` |

---

## LOGS Y DEBUGGING

### Ver logs en Vercel (producción):

1. Vercel → Proyecto → **Functions** tab
2. Seleccionar función (ej: `/api/audit`)
3. Ver logs en tiempo real

```bash
# Con Vercel CLI:
vercel logs https://aigencialab.cl --follow
```

### Ver logs en local:

```bash
# El servidor de desarrollo muestra todos los logs:
npm run dev
# Revisar la consola del terminal
```

### Tabla `audit_logs` en Supabase (todos los eventos):

```sql
SELECT event, module, metadata, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 50;
```

---

## PLANES DE CONTINGENCIA

### Escenario A: Vercel caído (raro, pero posible)

1. Verificar status.vercel.com
2. Si es una incidencia de Vercel: esperar (SLA 99.99% de Vercel)
3. Alternativa temporal: levantar local con `npm run dev` + ngrok para exponer
4. Comunicar al cliente: "Mantenimiento técnico, ETA: X horas"

### Escenario B: Supabase caído

1. Verificar status.supabase.com
2. Supabase Free: sin SLA garantizado. Si es crítico → migrar a plan Pro ($25/mes)
3. Los datos NO se pierden aunque el proyecto quede pausado
4. Supabase pause proyectos Free sin actividad por 7 días → reactivar en dashboard haciendo click "Restore"

> ⚠️ **Para evitar pausa automática:** configurar un cron job semanal (ej: GitHub Actions gratuito) que haga un ping a la API.

```yaml
# .github/workflows/keep-alive.yml
name: Supabase Keep Alive
on:
  schedule:
    - cron: '0 8 * * 1'  # Cada lunes 8am UTC
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}/rest/v1/ -H "apikey:${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}"
```

### Escenario C: WhatsApp no responde (Meta incidencia)

1. Verificar metastatus.com
2. Activar respuesta manual: el equipo responde directamente desde WhatsApp Business app
3. Los tickets de escalado siguen funcionando (Supabase no depende de Meta)
4. Una vez restaurado Meta: los mensajes acumulados llegan (webhook recibe batch)

### Escenario D: Cliente borra datos por error (Supabase)

```sql
-- Los datos se pueden recuperar si hay backup
-- Si no hay backup, verificar si quedó en audit_logs
SELECT metadata FROM audit_logs
WHERE event = 'client_created'
ORDER BY created_at DESC;

-- También buscar en leads si el cliente vino de auditoría
SELECT * FROM leads WHERE company ILIKE '%nombre empresa%';
```

---

## MONITOREO PROACTIVO

### Configurar alerta semanal (GitHub Actions):

```yaml
# .github/workflows/health-check.yml
name: Health Check Semanal
on:
  schedule:
    - cron: '0 10 * * 1'  # Lunes 10am

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Landing
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://aigencialab.cl)
          if [ "$STATUS" != "200" ]; then echo "❌ Landing DOWN: $STATUS"; exit 1; fi
          echo "✅ Landing OK"

      - name: Check Audit API
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://aigencialab.cl/api/audit \
            -H "Content-Type: application/json" \
            -d '{"rubro":"otro","name":"health-check","whatsapp":"912345678"}')
          if [ "$STATUS" != "200" ]; then echo "❌ Audit API DOWN: $STATUS"; exit 1; fi
          echo "✅ Audit API OK"
```

---

## CONTACTOS DE ESCALADO

| Nivel | Quién | Cuándo |
|-------|-------|--------|
| L1 | Técnico junior | Errores comunes de esta guía |
| L2 | Técnico senior | Errores de infra, DB, WhatsApp API |
| L3 | Desarrollador original | Bugs en código, cambios de arquitectura |
| Externo | Supabase Support (plan Pro) | Pérdida de datos, DB corrupta |
| Externo | Meta Support | Cuenta WhatsApp bloqueada |

---

## MANTENIMIENTO MENSUAL

**Primera semana de cada mes:**
- [ ] Revisar uso de Supabase (< 400MB de 500MB)
- [ ] Revisar uso de Resend (< 2.500 de 3.000 emails gratuitos)
- [ ] Revisar logs de audit_logs → borrar entradas > 1 año
- [ ] Hacer backup manual de Supabase DB
- [ ] Revisar expiración de tokens de WhatsApp de cada cliente

```sql
-- Auditoría mensual de datos
SELECT
  (SELECT count(*) FROM leads)          as total_leads,
  (SELECT count(*) FROM clients WHERE status='active') as clientes_activos,
  (SELECT count(*) FROM tickets WHERE status != 'Resuelto') as tickets_abiertos,
  (SELECT count(*) FROM messages WHERE timestamp > now()-interval '30d') as msgs_ultimo_mes;
```

*AigenciaLab.cl · Soporte & Errores · SOP v1.0 · Actualizado: Abril 2026*

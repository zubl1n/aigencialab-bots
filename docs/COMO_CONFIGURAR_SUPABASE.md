# 🔒 CÓMO CONFIGURAR SUPABASE
### AigenciaLab.cl · Guía Completa de Base de Datos · SOP v1.0

---

## 1. CREAR PROYECTO (5 minutos)

1. **https://supabase.com** → New Project
2. Nombre: `aigencialab-prod`
3. Password DB: genera uno con 1Password o similar y guárdalo
4. Región: `East US (N. Virginia)` — la más cercana a Santiago con menor latencia

---

## 2. EJECUTAR EL SCHEMA SQL

1. Ir a **SQL Editor** (ícono de código en la barra lateral)
2. Click **New Query**
3. Copiar y pegar el contenido de `supabase/migrations/001_initial_schema.sql`
4. Click **▶ Run** (o Ctrl+Enter)
5. Verifica que aparezcan **7 tablas** en Table Editor:
   - `leads`, `clients`, `conversations`, `messages`, `tickets`, `alerts`, `audit_logs`

---

## 3. OBTENER CREDENCIALES

1. **Settings → API**:

| Variable | Dónde encontrarla | Para qué se usa |
|----------|------------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" | Conexión desde el browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon / public" | Conexión anonima (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" | API routes server (admin) |

> ⚠️ `service_role` tiene acceso TOTAL. Nunca exponerla en el frontend ni en el cliente del browser.

---

## 4. CREAR USUARIO ADMIN

1. **Authentication → Users → Add user**
2. Email: `admin@aigencialab.cl`
3. Password: al menos 12 caracteres
4. Send Confirmation Email: No (confirmar directamente)
5. Probar login en `http://localhost:3000/login`

Para múltiples operadores:
- Crear un usuario por persona en Authentication
- Cada uno usa sus propias credenciales para acceder al dashboard

---

## 5. SUPABASE STORAGE (logos de clientes)

1. **Storage → New Bucket**
2. Nombre: `client-assets`
3. **Public bucket**: Sí (para que las imágenes sean accesibles desde la web)
4. En el onboarding del cliente, los logos se subirán a este bucket

---

## 6. ROW LEVEL SECURITY (RLS)

Las 7 tablas tienen RLS activado. Las API routes del proyecto usan `service_role` (bypasa RLS), lo que significa:

- **Las API routes** pueden leer/escribir cualquier dato → ✅ correcto
- **El cliente browser directo** NO puede acceder a datos sin autenticarse → ✅ seguro

Si en el futuro se agrega acceso directo desde el browser:
```sql
-- Ejemplo: política para que solo el admin vea leads
CREATE POLICY "Admin can view leads"
ON leads FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');
```

---

## 7. BACKUPS AUTOMÁTICOS

**Plan gratuito de Supabase:** sin backups automáticos.

**Backup manual (recomendado cada semana):**

```bash
# Instalar supabase CLI
npm install -g supabase

# Login
supabase login

# Exportar DB
supabase db dump --project-ref TU_PROJECT_REF -f backup_$(date +%Y%m%d).sql
```

**Alternativa simple desde la UI:**
1. Supabase → Table Editor → `leads` → Export to CSV
2. Repetir para cada tabla importante
3. Guardar en Google Drive

---

## 8. CONSULTAS SQL ÚTILES (para soporte)

```sql
-- Ver leads nuevos esta semana
SELECT company, contact_name, score, tier, created_at
FROM leads
WHERE created_at > now() - interval '7 days'
ORDER BY score DESC;

-- Leads calientes sin seguimiento
SELECT company, whatsapp, score, created_at
FROM leads
WHERE tier = 'hot' AND updated_at = created_at
ORDER BY score DESC;

-- Clientes activos con WhatsApp configurado
SELECT company, contact_name, plan, wa_phone_id
FROM clients
WHERE status = 'active' AND wa_phone_id IS NOT NULL;

-- Tickets críticos abiertos
SELECT ticket_num, company, issue, created_at
FROM tickets
WHERE priority = 'critico' AND status != 'Resuelto'
ORDER BY created_at;

-- Mensajes que necesitan humano
SELECT c.contact_wa, m.content, m.timestamp
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE c.status = 'needs_human'
ORDER BY m.timestamp DESC
LIMIT 20;

-- Estadísticas de auditorías por rubro
SELECT rubro, count(*) as total, avg(score)::int as score_promedio
FROM leads
WHERE source = 'audit'
GROUP BY rubro
ORDER BY total DESC;

-- Limpiar logs de auditoría (>1 año)
DELETE FROM audit_logs
WHERE created_at < now() - interval '1 year';
```

---

## 9. MONITOREO Y ALERTAS

Supabase provee dashboards de uso en **Settings → Usage**:
- **Database size**: alertar si supera 400MB (límite free: 500MB)
- **API requests**: ilimitadas en free tier
- **Auth users**: alertar si supera 45.000 (límite free: 50.000)

Si el proyecto crece y necesita más espacio → pasar a **Pro: $25 USD/mes** (8GB DB, backups diarios, soporte técnico).

*AigenciaLab.cl · Supabase Config · SOP v1.0 · Ley N°21.663 · Ley N°19.628*

# 🚀 CÓMO DESPLEGAR EN VERCEL
### AigenciaLab.cl · Guía de Deploy en Producción · SOP v1.0

---

## OPCIÓN A — DEPLOY DESDE GITHUB (recomendado)

### Paso 1: Subir código a GitHub

```bash
# En la carpeta aigencialab/
git init
git add .
git commit -m "feat: AigenciaLab v1.0 producción"
git branch -M main

# Crear repositorio en github.com y conectar
git remote add origin https://github.com/TU_USUARIO/aigencialab.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ir a **https://vercel.com** → Login con GitHub
2. **Add New Project** → Seleccionar repositorio `aigencialab`
3. Framework: **Next.js** (detectado automáticamente)
4. Root Directory: `./` (ya es el root)
5. **NO tocar Build Settings** — Vercel las detecta solo
6. Hacer click en **Deploy** → esperar ~2 minutos

### Paso 3: Agregar Variables de Entorno en Vercel

1. En el proyecto Vercel → **Settings → Environment Variables**
2. Agregar **cada una** de las variables de `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL         → tu URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY    → tu anon key
SUPABASE_SERVICE_ROLE_KEY        → tu service role key
NEXT_PUBLIC_SITE_URL             → https://aigencialab.cl
NEXT_PUBLIC_WA_SALES_NUMBER      → 56912345678
GOOGLE_PSI_API_KEY               → (opcional)
WA_APP_SECRET                    → tu Meta app secret
WA_VERIFY_TOKEN                  → aigencialab_wh_2024
RESEND_API_KEY                   → re_xxxx
RESEND_FROM_EMAIL                → hola@aigencialab.cl
RESEND_TO_EMAIL                  → tu@email.com
```

> ⚠️ Marcar: Environment = **Production + Preview + Development**

3. **Redeploy** para que tomen efecto: Deployments → ... → Redeploy

---

## OPCIÓN B — DEPLOY DIRECTO (sin GitHub)

```bash
# Instalar Vercel CLI
npm i -g vercel

# En carpeta aigencialab/
vercel

# Seguir el wizard interactivo:
# ✓ Set up and deploy → yes
# ✓ Which scope → tu cuenta
# ✓ Link to existing project → no
# ✓ Project name → aigencialab
# ✓ Root directory → ./
# ✓ Override settings → no

# Para producción:
vercel --prod
```

---

## CONECTAR DOMINIO PERSONALIZADO

### Si tienes el dominio en Namecheap/GoDaddy/NIC.cl:

1. Vercel → Settings → **Domains** → Add → `aigencialab.cl`
2. Vercel te mostrará uno de estos:
   - **Registro A:** apuntar `@` a `76.76.21.21`
   - **CNAME:** apuntar `www` a `cname.vercel-dns.com`
3. Ir al panel de tu registrador de dominios:
   - **NIC.cl:** Gestionar DNS → Agregar registros A y CNAME
   - **Namecheap:** Advanced DNS → Add Host Records
4. Esperar 5-30 minutos para propagación DNS
5. SSL/HTTPS: Vercel lo activa **automáticamente** (Let's Encrypt)

### Verificar:
- `https://aigencialab.cl` → abre la landing ✓
- `https://aigencialab.cl/audit` → formulario de auditoría ✓
- Candado verde HTTPS en el navegador ✓

---

## ACTUALIZACIONES CONTINUAS

### Con GitHub (automático):
```bash
# Cada push a main se despliega automáticamente en Vercel
git add .
git commit -m "fix: ..."
git push
# → Vercel detecta el push y despliega en ~90 segundos
```

### Sin GitHub (manual):
```bash
vercel --prod
```

---

## ROLLBACK EN CASO DE PROBLEMA

1. Vercel → Deployments
2. Buscar el último deploy exitoso
3. Click en **...** → **Promote to Production**
4. En 30 segundos está restaurado

---

## CHECKLIST POST-DEPLOY

- [ ] `https://aigencialab.cl` carga correctamente
- [ ] `https://aigencialab.cl/audit` muestra el formulario
- [ ] Auditar una URL real → reporte con datos de PageSpeed
- [ ] Lead aparece en Supabase Dashboard
- [ ] `https://aigencialab.cl/login` acepta credenciales de admin
- [ ] Dashboard → Leads muestra datos de test
- [ ] `/api/leads/export` descarga CSV
- [ ] HTTPS activo (candado verde)
- [ ] Variables de entorno correctas en Vercel → Settings

*AigenciaLab.cl · Deploy Vercel · SOP v1.0*

# 🚀 AigenciaLab.cl — Manual de Instalación y Despliegue
### Standard Operating Procedure (SOP) — Versión 1.0
**Clasificación:** Interno · Solo personal técnico y partners autorizados  
**Cobertura legal:** Ley N°21.663 (Ciberseguridad) · Ley N°19.628 (Datos personales)

---

## 📋 CHECKLIST RÁPIDA ANTES DE EMPEZAR

- [ ] ¿Tienes acceso al repositorio o carpeta del proyecto?
- [ ] ¿Tienes Node.js instalado? (solo para servidor local)  
- [ ] ¿Tienes cuenta en Netlify, Vercel o cPanel?
- [ ] ¿Tienes el número de WhatsApp de ventas del cliente?
- [ ] ¿Tienes la clave de Google PageSpeed API (opcional)?

---

## 1. ESTRUCTURA DEL PROYECTO

```
ai-agency-landing/              ← Sitio estático servido en aigencialab.cl (Vercel)
├── index.html                  ← Landing page principal (Tech-Noir)
├── style.css                   ← Estilos de la landing
├── main.js                     ← Scripts de la landing (ROI, chat Nova)
├── vercel.json                 ← Config de Vercel (trailing slash, headers)
├── package.json                ← Sin build script (static deploy)
│
├── audit/                      ← 🔍 Auditoría Gratuita (Lead Magnet REAL)
│   ├── index.html              ← Formulario + reporte
│   ├── audit.css               ← Estilos premium Tech-Noir
│   └── audit.js                ← Motor con PageSpeed API + SEO + Supabase
│
├── demos/                      ← 🎮 3 Demos interactivos de agentes
│   ├── demo-shared.css         ← CSS compartido premium (626 líneas)
│   ├── agente-ventas/
│   │   ├── index.html
│   │   └── app.js
│   ├── agente-atencion/
│   │   ├── index.html
│   │   └── app.js
│   └── agente-backoffice/
│       ├── index.html
│       └── app.js
│
├── docs/                       ← 📚 Documentación técnica completa
│   ├── INSTALACION.md          ← Este archivo
│   ├── AGENTES.md              ← Manual por agente
│   ├── ONBOARDING_CLIENTE.md   ← SOP onboarding clientes
│   ├── SEGURIDAD.md            ← Compliance Ley 21.663 + 19.628
│   └── BACKEND_MIGRATION.md    ← Migración a Supabase
│
└── tarjeta-presentacion.html   ← Tarjeta de presentación imprimible con QR

aigencialab/                    ← Dashboard Next.js en app.aigencialab.cl (Vercel)
├── src/
│   ├── app/
│   │   ├── dashboard/          ← Páginas del dashboard admin
│   │   │   ├── page.tsx        ← KPIs + últimos leads
│   │   │   ├── leads/          ← Pipeline de leads (Supabase real-time)
│   │   │   ├── clients/        ← Gestión de clientes
│   │   │   └── tickets/        ← Soporte y tickets
│   │   └── api/
│   │       └── whatsapp/
│   │           └── webhook/    ← POST/GET webhook Meta WhatsApp
│   └── lib/
│       ├── supabase/           ← Cliente Supabase (anon + service_role)
│       ├── whatsapp.ts         ← Envío de mensajes WA Cloud API
│       └── types.ts            ← Tipos compartidos
└── next.config.ts
```

---

## 2. INSTALACIÓN LOCAL (para desarrollo y pruebas)

### Opción A — Con Node.js (recomendado)

```bash
# 1. Abrir terminal en la carpeta del proyecto
cd AigenciaLab-landing

# 2. Levantar servidor local
npx http-server . -p 8085 --cors -c-1

# 3. Abrir en el navegador
http://localhost:8085

# 4. URLs de cada módulo:
http://localhost:8085/                        ← Landing principal
http://localhost:8085/audit/                  ← Auditoría gratuita
http://localhost:8085/platform/               ← Dashboard
http://localhost:8085/onboarding/             ← Onboarding cliente
http://localhost:8085/pwa/                    ← Dashboard móvil
```

### Opción B — Live Server (VS Code)

1. Instalar extensión **"Live Server"** en VS Code
2. Click derecho en `index.html` → **"Open with Live Server"**
3. Se abre automáticamente en `http://127.0.0.1:5500`

### Opción C — Python (sin instalar nada adicional)

```bash
# Python 3
python -m http.server 8085

# Abrir en: http://localhost:8085
```

---

## 3. CONFIGURACIÓN ANTES DE DESPLEGAR

### 3.1 Número de WhatsApp de Ventas

> ⚠️ OBLIGATORIO — Cambiar en 3 archivos antes de desplegar al cliente

**Archivo 1:** `audit/audit.js` — línea 18
```javascript
WA_SALES: '56912345678',  // ← Cambiar al número real (sin + ni espacios)
```

**Archivo 2:** `platform/modules/mod-support.js` — línea 9
```javascript
var WA_SALES = '56912345678'; // ← Cambiar aquí también
```

**Archivo 3:** `platform/modules/mod-alerts.js` — línea 4
```javascript
var WA_SALES = '56912345678'; // ← Cambiar aquí también
```

### 3.2 Google PageSpeed API Key (opcional, gratis)

Sin key: 100 requests/día (suficiente para demos)  
Con key: sin límite + datos más detallados

```javascript
// audit/audit.js — línea 19
PSI_API_KEY: 'AIzaSyXXXXXXXXXXXXXXXXXXXXX',   // ← Tu Google API Key
```

**Cómo obtener la key:**
1. Ir a https://console.developers.google.com
2. Crear proyecto → Habilitar "PageSpeed Insights API"
3. Ir a Credenciales → Crear clave API
4. Copiar y pegar en el archivo

### 3.3 Variables del Dashboard

```javascript
// platform/dashboard.js — Cambiar datos de empresa
var COMPANY_NAME = 'AigenciaLab.cl';    // Nombre en dashboards
var CONTACT_WA   = '56912345678';   // WhatsApp ventas
```

---

## 4. DESPLIEGUE EN PRODUCCIÓN

### 4.1 Netlify (⭐ RECOMENDADO — Gratis con dominio custom)

```
TIEMPO ESTIMADO: 5 minutos
NIVEL: Básico
COSTO: $0 (plan gratuito) o $19 USD/mes (Pro con analytics)
```

**Pasos:**
1. Ir a https://netlify.com → Crear cuenta gratuita
2. Dashboard → **"Add new site"** → **"Deploy manually"**
3. Arrastrar la carpeta `AigenciaLab-landing/` al área de upload
4. Esperar 30 segundos → Netlify genera una URL (ej: `amazing-cloud-123.netlify.app`)
5. **Settings → Domain management → Add custom domain**
6. Ingresar tu dominio (ej: `AigenciaLab.cl`)
7. Configurar DNS según instrucciones de Netlify (Registro A o CNAME)
8. ✅ SSL automático (HTTPS) — se activa solo en 2-3 horas

**Actualizar el sitio:**
1. Volver al dashboard de Netlify
2. Arrastrar la nueva versión de la carpeta
3. ✅ Listo — despliegue en ~30 segundos

---

### 4.2 Vercel (Alternativa — también gratis)

```
TIEMPO ESTIMADO: 5 minutos
NIVEL: Básico
COSTO: $0 (plan gratuito)
```

**Pasos:**
1. Ir a https://vercel.com → Crear cuenta
2. **"Add New Project"** → **"Browse"** → Subir carpeta del proyecto
3. Click **Deploy** → Esperar ~1 minuto
4. Vercel genera URL (ej: `AigenciaLab-abc123.vercel.app`)
5. **Settings → Domains → Add** → Ingresar dominio personalizado
6. Configurar DNS según instrucciones

---

### 4.3 GitHub Pages (para proyectos versionados)

```
TIEMPO ESTIMADO: 10 minutos
NIVEL: Intermedio (requiere Git)
COSTO: $0
```

**Pasos:**
1. Crear repositorio en GitHub (público o privado con plan Pro)
2. ```bash
   git init
   git add .
   git commit -m "Initial deploy AigenciaLab v3"
   git remote add origin https://github.com/TU_USUARIO/AigenciaLab.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Source:** `Deploy from branch: main /root`
4. URL: `https://TU_USUARIO.github.io/AigenciaLab`
5. Para dominio custom: Crear archivo `CNAME` con el dominio y configurar DNS

---

### 4.4 Hosting cPanel Tradicional (Sernatur, Hosting.cl, etc.)

```
TIEMPO ESTIMADO: 15 minutos
NIVEL: Básico
COSTO: Según plan de hosting
```

**Pasos:**
1. Acceder a cPanel del hosting (ej: `tudominio.cl/cpanel`)
2. Ir a **"Administrador de Archivos"**
3. Navegar a `public_html/`
4. Click **Upload** → Subir archivo ZIP del proyecto
5. **Extraer** el ZIP en `public_html/`
6. Verificar que `index.html` esté directo en `public_html/`
7. SSL: **cPanel → Let's Encrypt SSL** → Activar (gratis)

**Alternativa con FTP:**
1. Software: FileZilla (gratuito)
2. Servidor: `ftp.tudominio.cl`
3. Puerto: 21
4. Usuario/Contraseña: los del cPanel
5. Subir todos los archivos a `/public_html/`

---

## 5. CONFIGURACIÓN DE DOMINIO Y SSL

### Configuración DNS básica

```
Tipo    Nombre    Valor
A       @         IP del servidor (ej: 75.119.197.40)
CNAME   www       tudominio.cl
```

### SSL / HTTPS

- **Netlify/Vercel:** Automático — no hacer nada
- **cPanel:** Usar Let's Encrypt (gratis dentro de cPanel)
- **VPS:** Instalar Certbot: `sudo certbot --nginx -d tudominio.cl`

---

## 6. CONECTAR FORMULARIOS

El formulario de la landing puede enviarse por:

### Opción A — Netlify Forms (gratis, sin código)

Agregar al `<form>` en `index.html`:
```html
<form name="contacto" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contacto">
  <!-- ... campos existentes ... -->
</form>
```

### Opción B — Formspree (gratis hasta 50 envíos/mes)

```html
<form action="https://formspree.io/f/TU_ID_FORMSPREE" method="POST">
```

1. Registrarse en https://formspree.io
2. Crear formulario → Copiar ID
3. Reemplazar `TU_ID_FORMSPREE`
4. Recibir notificaciones por email

---

## 7. ACTIVAR BACKUPS

### Opción gratuita — GitHub automático

```bash
# Crear script backup.sh
git add . && git commit -m "backup $(date +%Y%m%d%H%M)" && git push
```

### Netlify — Deploy histórico automático

Netlify guarda todos los deploys automáticamente.  
En caso de problema: **Deploys → (versión anterior) → "Publish deploy"**

### Backup manual mensual

1. Descargar toda la carpeta del proyecto
2. Comprimir como ZIP: `AigenciaLab-backup-AAAA-MM-DD.zip`
3. Guardar en Google Drive o OneDrive

---

## 8. ERRORES COMUNES Y SOLUCIONES

| Error | Causa probable | Solución |
|-------|---------------|----------|
| Página en blanco | Ruta de archivo incorrecta | Abrir DevTools (F12) → Console → Ver error rojo |
| Módulo no carga | Script bloqueado | Verificar que los `.js` estén en la carpeta correcta |
| API PageSpeed falla | CORS o límite excedido | El sistema usa fallback automático con datos por rubro |
| WhatsApp no abre | Número mal configurado | Verificar que empiece con 56 (sin +) |
| Dashboard no navega | Error en dashboard.js | F12 → Console → Capturar error y reportar |
| PWA no se instala | HTTP (sin HTTPS) | Desplegar en Netlify/Vercel para obtener HTTPS |
| localStorage lleno | >5MB de datos | `localStorage.clear()` en DevTools Console |
| CORS en PageSpeed | Sin key o dominio bloqueado | El fallback por rubro se activa automáticamente |

---

## 9. CHECKLIST DE VERIFICACIÓN POST-DESPLIEGUE

- [ ] Landing carga en < 3 segundos
- [ ] Todos los botones de WhatsApp abren el número correcto
- [ ] Calculadora ROI muestra resultados al hacer click
- [ ] Auditoría gratuita procesa y muestra reporte
- [ ] Dashboard accesible en `/platform/`
- [ ] Pipeline de leads funcional (nav CRM & Ventas)
- [ ] Módulo de Soporte/Tickets accesible
- [ ] Onboarding wizard llega al paso 5 y descarga JSON
- [ ] PWA instalable en Android (Chrome → Instalar app)
- [ ] HTTPS activo (candado verde en el navegador)
- [ ] Sin errores en DevTools Console (F12)

---

*AigenciaLab.cl · Documentación Técnica · Versión 1.0 · Ley N°21.663 · Ley N°19.628*


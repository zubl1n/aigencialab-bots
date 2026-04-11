# 🤖 Cómo Instalar tu Agente IA en tu Sitio Web
### Guía paso a paso — Nivel: Cualquier persona puede hacerlo
### AigenciaLab.cl · v2.0

---

> **¿Qué es esto?** Este manual te enseña a poner un chatbot inteligente de ventas o atención al cliente en tu página web. Es como pegar un sticker: copias un código y lo pegas en tu sitio. ¡Listo!

---

## ✅ ANTES DE EMPEZAR

Necesitas tener:
- [ ] Tu sitio web funcionando (puede ser WordPress, Shopify, Wix o cualquier otra)
- [ ] Acceso al panel de administración de tu sitio
- [ ] Tu número de WhatsApp Business (ej: +56 9 1234 5678)

**⏱ Tiempo estimado: 5 minutos**

---

## PASO 1: Elige tu Agente

| Agente | ¿Para qué sirve? | Archivo |
|--------|-------------------|---------|
| **🛒 Agente de Ventas** | Responde consultas, califica prospectos, agenda demos | `agent-ventas.js` |
| **🎧 Agente de Atención** | Soporte 24/7, FAQs, tickets, encuestas CSAT | `agent-atencion.js` |
| **📋 Agente Backoffice** | Procesos internos, facturas, reportes | `agent-backoffice.js` |

> 💡 **Recomendación:** Si es tu primera vez, empieza con el **Agente de Ventas**. Es el que genera ingresos directos.

---

## PASO 2: Copia el Código en tu Sitio Web

### Opción A: WordPress

1. Ve a tu panel de WordPress: `tu-sitio.cl/wp-admin`
2. En el menú izquierdo, busca **"Apariencia"** → **"Editor de temas"**
3. En la lista de archivos de la derecha, busca el archivo llamado **`footer.php`**
4. Dale click a `footer.php`
5. Busca la línea que dice `</body>` (está casi al final)
6. **JUSTO ANTES de `</body>`**, pega este código:

```html
<!-- Agente IA de Ventas — AigenciaLab.cl -->
<script src="https://aigencialab.cl/agents/agent-ventas.js"></script>
<script>
  AgentVentas.init({
    companyName: 'Tu Empresa SpA',     // ← Cambia por el nombre de tu empresa
    agentName:   'Sofía',              // ← Cambia por el nombre que quieras para tu agente
    whatsapp:    '+56912345678',       // ← Cambia por tu número de WhatsApp
    products:    ['Producto 1', 'Producto 2'],  // ← Cambia por tus productos
    pricingFrom: 'desde $29.990/mes',  // ← Cambia por tu precio
    onNewLead:   function(lead) {
      console.log('Nuevo lead:', lead.name, lead.score + '/100');
    }
  });
  AgentVentas.createWidget();
</script>
```

7. Dale a **"Actualizar archivo"** (botón azul abajo)
8. ¡Listo! Ve a tu sitio web y verás un botón 💬 en la esquina inferior derecha

### Opción B: Shopify

1. Ve a tu panel de Shopify: `tu-tienda.myshopify.com/admin`
2. Ve a **"Tienda Online"** → **"Temas"**
3. Dale click a **"Acciones"** → **"Editar código"**
4. En la lista de archivos, busca **`theme.liquid`**
5. Busca la línea `</body>` (usa Ctrl+F para encontrarla)
6. **JUSTO ANTES de `</body>`**, pega el mismo código del Paso A (punto 6)
7. Dale a **"Guardar"** (arriba a la derecha)

### Opción C: Cualquier Web (HTML normal)

1. Abre el archivo HTML principal de tu sitio (normalmente `index.html`)
2. Busca la etiqueta `</body>` al final del archivo
3. **JUSTO ANTES de `</body>`**, pega el código del Paso A (punto 6)
4. Guarda el archivo y súbelo a tu servidor

### Opción D: Wix, Squarespace u otros constructores

1. En tu editor, busca la opción **"Código personalizado"** o **"Custom Code"**
2. Agrega el código del Paso A como un **"Header/Footer Script"**
3. Selecciona que se inyecte **"Antes de </body>"**
4. Guarda los cambios

---

## PASO 3: Personaliza tu Agente

Estos son los campos que puedes cambiar en el código:

| Campo | Qué hace | Ejemplo |
|-------|----------|---------|
| `companyName` | El nombre de tu empresa que dice el agente | `'Moda Urbana SpA'` |
| `agentName` | Cómo se llama tu agente IA | `'Sofía'`, `'Carlos'`, `'Nova'` |
| `whatsapp` | Tu número de WhatsApp para derivar leads | `'+56987654321'` |
| `products` | Lista de tus productos o servicios principales | `['Plan Básico', 'Plan Pro']` |
| `pricingFrom` | Precio inicial que muestra el agente | `'UF 12/mes'` |
| `primaryColor` | Color del botón del chat | `'#FF6B00'` (naranja) |
| `autoOpen` | ¿Se abre solo el chat? | `true` o `false` |

---

## PASO 4: Verifica que Funciona

1. Abre tu sitio web en una **ventana de incógnito** (Ctrl+Shift+N en Chrome)
2. Deberías ver un botón **💬** azul en la esquina inferior derecha
3. Dale click → Escribe "hola" → El agente debería responder
4. Prueba preguntas como:
   - "¿Cuánto cuestan?"
   - "Quiero una demo"
   - "¿Es seguro?"
5. Si todo funciona, **¡felicidades!** 🎉

### ❌ ¿No funciona? Solución rápida:

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| No aparece el botón 💬 | El código no se pegó correctamente | Verifica que esté ANTES de `</body>` |
| Aparece error en consola | URL del script incorrecta | Verifica que la URL sea exacta: `https://aigencialab.cl/agents/agent-ventas.js` |
| El agente no responde | JavaScript deshabilitado | Pide a tu cliente que habilite JavaScript |
| Botón aparece pero chat vacío | Conflicto de CSS | Agrega `style="all:initial"` al div del widget |

---

## 📱 PASO 5: Configurar WhatsApp Business (para recibir leads en tu celular)

> **¿Para qué?** Cuando un prospecto quiera hablar con un humano, el agente lo derivará a tu WhatsApp directamente.

### 5.1 WhatsApp Business Básico (Gratis, para empezar)

1. Descarga **WhatsApp Business** desde Google Play o App Store
2. Regístralo con el número de tu empresa (+56 9 XXXX XXXX)
3. Completa el perfil de empresa:
   - **Nombre:** Tu empresa
   - **Categoría:** Tu rubro
   - **Dirección:** Tu dirección
   - **Horario:** Tu horario de atención
4. Pon este número en el campo `whatsapp` del código del Paso 2
5. ¡Listo! Los leads llegarán como mensajes directos

### 5.2 WhatsApp Cloud API (Avanzado, para automatización completa)

> **¿Para qué?** Si quieres que el agente responda AUTOMÁTICAMENTE en WhatsApp sin intervención humana.

#### Paso A: Crear cuenta en Meta for Developers
1. Ir a **https://developers.facebook.com/**
2. Inicia sesión con tu cuenta de Facebook
3. Click **"Mis aplicaciones"** → **"Crear aplicación"**
4. Tipo: **"Empresa"** → Click **"Siguiente"**
5. Nombre: `AigenciaLab - [Tu Empresa]` → Click **"Crear"**

#### Paso B: Activar WhatsApp en tu App
1. En el panel, busca **"WhatsApp"** → Click **"Configurar"**
2. Te aparecerá la página de "Primeros pasos"
3. Aquí verás tu **Phone Number ID** (un número largo)
4. Click **"Generar token de acceso"** para obtener tu ACCESS_TOKEN

#### Paso C: Configurar el Webhook
1. En WhatsApp → **"Configuración"** → **"Webhooks"**
2. Click **"Editar"**
3. Pega estos datos:
   - **URL:** `https://app.aigencialab.cl/api/whatsapp/webhook`
   - **Token:** `aigencialab_wh_2024`
4. Click **"Verificar y guardar"**
5. Activa la suscripción **"messages"**

#### Paso D: Verificar tu número real
1. En **"Números de teléfono"** → **"Agregar número"**
2. Ingresa tu número de empresa
3. Confirma el código SMS que te llega
4. ¡Listo! Tu agente ahora responde automáticamente en WhatsApp

#### Datos que necesitas entregar al equipo técnico:
```
╔══════════════════════════════════════════════════╗
║  PHONE_NUMBER_ID: ___________________________   ║
║  ACCESS_TOKEN:    ___________________________   ║
║  VERIFY_TOKEN:    aigencialab_wh_2024            ║
║  WEBHOOK URL:     https://app.aigencialab.cl/    ║
║                   api/whatsapp/webhook           ║
╚══════════════════════════════════════════════════╝
```

---

## 🔒 SEGURIDAD Y PRIVACIDAD

Tu agente cumple con las leyes chilenas:

| Ley | Qué hace | Cumplimiento |
|-----|----------|-------------|
| **Ley N°21.663** | Ciberseguridad | ✅ Datos cifrados SSL/TLS. Sin servidores externos no autorizados. |
| **Ley N°19.628** | Protección de datos personales | ✅ Datos almacenados solo en el navegador del usuario (localStorage). Sin cookies de terceros. |

---

## 🛠️ PARA EL EQUIPO TÉCNICO

### Variables de entorno (Vercel Dashboard)

Si estás usando el dashboard de AigenciaLab en `app.aigencialab.cl`, estas son las variables:

```
NEXT_PUBLIC_SUPABASE_URL     = https://hmnbbzpucefcldziwrvs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = (la anon key del proyecto)
SUPABASE_SERVICE_ROLE_KEY    = (la service role key)
WA_VERIFY_TOKEN              = aigencialab_wh_2024
WA_PHONE_NUMBER_ID           = (el phone number ID de Meta)
WA_ACCESS_TOKEN              = (el access token permanente)
```

### Estructura de archivos de agentes

```
agents/
├── agent-ventas.js       ← Widget de ventas (13KB, standalone)
├── agent-atencion.js     ← Widget de soporte (14KB, standalone)
├── agent-backoffice.js   ← Widget backoffice (17KB, standalone)
├── agent-ecommerce.js    ← Integración WooCommerce/Shopify
├── agent-logistics.js    ← Tracking Chilexpress/Starken
├── agent-bi.js           ← BI predictivo
├── agent-cybersecurity.js← Monitor ciberseguridad
└── README.md             ← Documentación técnica
```

### API pública de cada agente

```javascript
// Ventas
AgentVentas.init(config)           // Inicializar
AgentVentas.createWidget('#el')    // Montar widget
AgentVentas.sendMessage('hola')    // Enviar mensaje programáticamente
AgentVentas.getLeads()             // Obtener todos los leads
AgentVentas.exportCSV()            // Exportar CSV
AgentVentas.resetDB()              // Limpiar localStorage

// Atención
AgentAtencion.init(config)
AgentAtencion.createWidget()
AgentAtencion.addFAQ(['palabras'], 'respuesta')  // Agregar FAQ runtime
AgentAtencion.setStorageAdapter(adapter)          // Conectar a backend propio
```

---

## ❓ PREGUNTAS FRECUENTES

**¿El agente funciona en celulares?**
Sí, es 100% responsive. Se adapta a cualquier pantalla.

**¿Puedo tener el agente en más de una página?**
Sí. El código se pega una vez y funciona en todas las páginas de tu sitio.

**¿Los datos del chat se guardan?**
Solo en el navegador del usuario (localStorage). No se envían a ningún servidor externo a menos que tú configures un webhook.

**¿Puedo cambiar los colores?**
Sí. Usa el campo `primaryColor` en la configuración (acepta cualquier código de color CSS).

**¿Funciona con WordPress, Shopify, Wix?**
Sí, con todos. Solo necesita que permitan agregar JavaScript personalizado.

**¿Cuánto tarda en instalarse?**
5 minutos si ya tienes acceso a tu panel de admin.

---

*AigenciaLab.cl · Manual de Instalación de Agente · v2.0 · Chile 2026*
*Ley N°21.663 · Ley N°19.628*

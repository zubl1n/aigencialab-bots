# 🤖 AigenciaLab Bots — Motores de Inteligencia Artificial Corporativa

Este repositorio es el núcleo central de los Agentes Autónomos de **AigenciaLab**. Contiene exclusivamente la lógica cliente (widgets) y servidor (Edge Functions Gemini) necesarios para instalar agentes de ventas o atención en sitios web de clientes.

*(La aplicación web principal, el dashboard de administración, el ecosistema de Onboarding y herramientas comerciales se mantienen de forma privada y no forman parte de este repositorio).*

---

## 📁 Estructura del Repositorio

El código está optimizado para su fácil distribución e instalación en infraestructuras de terceros.

### 1. `/agents/` (Widgets Frontend)
Esta carpeta contiene el código Vanilla JS (`.js`) que los clientes deben insertar en su página web. 
- **`agent-ventas.js`**: Widget interactivo de ventas. Evalúa interés, califica y actúa como filtro comercial experto.
- **`agent-atencion.js`**: Widget enfocado en consultas de soporte técnico, seguimiento de tickets e información recurrente.

### 2. `/supabase/` (Cerebro IA Backend)
Contiene la infraestructura de procesamiento seguro. Para no exponer tokens de Inteligencia Artificial (Google Gemini o OpenAI) en los navegadores de los usuarios finales, todas las peticiones reales, memoria compartida y Function Calls pasan por aquí.
- **`/functions/gemini-agent/`**: Servidor en Deno / TypeScript que conecta con Gemini 1.5 Flash. Realiza registro autónomo de "leads" hacia la base de datos central.

### 3. `/docs/` (Snippets de Implementación)
- **`GEMINI_INTEGRATION_SNIPPET.html`**: Ejemplos básicos en código fuente sobre cómo se incrusta el bot en una web estándar de e-commerce, incluyendo cómo habilitar o deshabilitar el "modo Gemini".

---

## 🚀 Despliegue en un Cliente Nuevo

Para conectar el Cerebro de Inteligencia Artificial en el negocio de un cliente que haya contratado los servicios de AigenciaLab:

### Paso 1: Configurar la función en Supabase (Backend)

1. Ve a los Ajustes de Supabase (Settings > Edge Functions).
2. Añade la variable `GEMINI_API_KEY` con tu clave de [Google AI Studio](https://aistudio.google.com/).
3. Despliega la función `gemini-agent` a tu proyecto de base de datos ejecutando esto en tu terminal:

```bash
npx supabase functions deploy gemini-agent --project-ref <tu-proyecto-id>
```

### Paso 2: Instalación del Widget (Frontend)

Entrega al cliente este snippet y pídele que lo coloque justo antes de la etiqueta `</body>` en su código.

```html
<script src="https://aigencialab.cl/agents/agent-ventas.js"></script>
<script>
  AgentVentas.init({
    companyName: 'El E-commerce del Cliente SpA',
    agentName: 'Nova',
    geminiEndpoint: 'https://<tu-proyecto-id>.supabase.co/functions/v1/gemini-agent'
  });
  AgentVentas.createWidget();
</script>
```

*(Si quitas el parámetro `geminiEndpoint`, el agente caerá en un modo "simulador offline" basado en reglas locales, ideal para demos que no requieran coste de API de IA).*

---
© AigenciaLab 2026. Módulo Comercial de Agentes Inteligentes.

# 🤖 AigenciaLab — Motores de Inteligencia Artificial

Este directorio contiene la arquitectura completa de los Agentes de Ventas y Atención de AigenciaLab.cl.

## Estructura de Directorios Desplegados

```text
📁 aigencialab/
├── 📁 agents/
│   ├── agent-ventas.js    # Widget del Agente de Ventas + Integración Frontend
│   └── agent-atencion.js  # Widget del Agente de Atención al Cliente
│
├── 📁 supabase/
│   └── 📁 functions/
│       └── 📁 gemini-agent/
│           ├── index.ts        # Edge Function de Deno (El "Cerebro" de IA Real)
│           ├── config.json     # Configuración de despliegue
│           └── import_map.json # Dependencias (Supabase-js / Deno)
│
└── 📁 docs/
    └── GEMINI_INTEGRATION_SNIPPET.html # Snippets listos para embeber en los clientes
```

## 🚀 Despliegue del "Cerebro" (Supabase Edge Function)

El frontend web interactúa de manera autónoma, pero el verdadero procesamiento con **Google Gemini 1.5 Flash** ocurre en el backend mediante Supabase Edge Functions para proteger tus API Keys.

### 1. Variables de Entorno (Supabase)
Antes de desplegar, añade estos *Secrets* en tu panel de Supabase:
- `GEMINI_API_KEY`: Tu clave de [Google AI Studio](https://aistudio.google.com/).
- `SUPABASE_SERVICE_ROLE_KEY`: Necesario para que la IA inserte leads saltándose validaciones y usando la herramienta `registrar_lead_calificado`.

### 2. Comando de Despliegue
Ejecuta el siguiente comando en la raíz del proyecto usando Supabase CLI:

```bash
npx supabase functions deploy gemini-agent --project-ref hmnbbzpucefcldziwrvs
```

### 3. Activar en el Frontend
Una vez que el Edge Function esté desplegada, simplemente pasa la URL en la inicialización dentro de la web de tu cliente:

```javascript
AgentVentas.init({
  geminiEndpoint: 'https://hmnbbzpucefcldziwrvs.supabase.co/functions/v1/gemini-agent',
  companyName: 'Empresa Cliente SpA'
});
// ¡El agente ahora es autónomo y guarda leads automáticamente en Supabase!
```

---

*Nota: Mientras `geminiEndpoint` no esté definido, los widgets de `/agents/` funcionarán utilizando el modo **Legacy / Flow Pattern**, lo que es ideal para simulaciones y demostraciones presenciales rápidas y sin latencia.*

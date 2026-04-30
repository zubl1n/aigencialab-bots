# AigenciaLab UI/UX Mockups Módulo

Este directorio contiene los mockups diseñados con **excelente calidad UI/UX, modernos, sobrios y enfocados en la conversión y la percepción de valor (premium)** para la plataforma SaaS de AigenciaLab. 

Como se solicitó, los archivos están listos para ser implementados sin haber alterado tu código de producción.

## Archivos Incluidos

1. **`EnhancedDashboardMockup.tsx`**: Un dashboard premium en modo oscuro profundo (`#0A0A0B`) con efectos de *glassmorphism* (`backdrop-blur`), bordes sutiles y tarjetas de métricas elegantes. Destaca el estado del Agente con un hero block visualmente impactante y gráficos de actividad minimalistas.
2. **`EnhancedBotConfigMockup.tsx`**: La interfaz de configuración del bot, rediseñada para sentirse como una verdadera plataforma de Inteligencia Artificial (soberbia y técnica pero amigable). Incluye secciones de Identidad, Knowledge Base (RAG) con carga de archivos y configuraciones técnicas avanzadas (temperature, model selector).
3. **`EnhancedLeadsTableMockup.tsx`**: El directorio de Leads y CRM simplificado. Incorpora un diseño de tabla inmersivo, sin bordes pesados, con score inteligente de IA usando indicadores circulares SVG y badges de estado colorizados pero elegantes.

## Características de Diseño (Design System)

- **Paleta de Colores Sobrios**: Fondo principal oscuro/negro (`bg-[#0A0A0B]`), grises neutros de la paleta Zinc (`text-zinc-400`), y acentos vibrantes controlados (`indigo-500`, `emerald-400`).
- **Glassmorphism Inteligente**: Uso de `bg-zinc-900/40`, `border-zinc-800/60` y `backdrop-blur-sm` para generar profundidad sin ensuciar la interfaz.
- **Tipografía y Micro-Interacciones**: Textos tracking-wide para labels, transiciones suaves de opacidad (`hover:border-indigo-500/50`) y animaciones sutiles (el `animate-ping` en los estados online).

## Instrucciones de Implementación

Para utilizar estos diseños en tu app de producción (`src/app/dashboard/...`):

1. **Visualizar**: Puedes importar estos componentes temporalmente en alguna ruta o reemplazar el contenido en los componentes respectivos:
   - Para el Dashboard: Sustituir el retorno de `DashboardContent.tsx` por la estructura en `EnhancedDashboardMockup.tsx`.
   - Para el Bot de Configuración: Adaptar `EnhancedBotConfigMockup.tsx` sobre la ruta actual del agente.
2. **Conectar Lógica (Tu trabajo actual de Supabase)**: Estos mockups **no contienen la lógica de negocio activa** (ej. Supabase `fetchData`). Debes mapear tu estado (ej., `metrics`, `activities`, `leads`) hacia las props o el JSX que he construido en los componentes. Las clases de CSS (Tailwind) son totalmente compatibles con tu configuración actual de Next.js.
3. **Dependencias**: Se utiliza **Lucide React** (`lucide-react`) para la iconografía, el cual ya tienes instalado en tu proyecto.

¡Tu SaaS ahora se sentirá como una herramienta Enterprise de nivel mundial!

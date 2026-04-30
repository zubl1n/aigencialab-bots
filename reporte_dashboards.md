# Reporte Técnico de Dashboards: AIgenciaLab

Este documento presenta un desglose técnico y funcional experto del estado actual (100% detallado) de los Dashboards dentro de la plataforma **AIgenciaLab**, abarcando tanto el panel de Administración Global (Admin Dashboard) como el panel de Cliente (Client Dashboard). 

Ambas interfaces están construidas sobre Next.js, aprovechan Tailwind CSS para estilos con enfoque en *glassmorphism* avanzado e integran el cliente de Supabase para manejo de datos asíncronos y eventos *real-time*.

---

## 1. Dashboard de Administración (Admin Global)
**Ubicación de archivo:** `src/app/admin/page.tsx`

El dashboard administrativo es el centro de comando (Command Center) diseñado para proveer una visión macroscópica unificada de la plataforma. Está protegido y opera utilizando el key de `service_role` para un acceso total (Bypass de RLS) para consolidación de reportes.

### Funcionalidades y Componentes Principales

#### 1.1 Cabecera y Alertas Inmediatas (Header)
*   **Fecha Actual Dinámica:** Muestra la fecha formateada en locale `es-CL`.
*   **Alerta de Tickets:** Si existen tickets pendientes de soporte (estado `open` o `in_progress`), se despliega un botón animado (`animate-pulse`) en color ámbar para redirigir directamente al administrador a `/admin/tickets`.
*   **Exportación CSV:** Botón utilitario que apunta al endpoint `/api/admin/export/clients` para descargar la sabana de clientes en CSV.
*   **Redirección Directa a Clientes:** Enlace principal a la tabla integral de gestión de clientes.

#### 1.2 Tarjetas de Métricas de Alto Nivel (Stat Cards)
El sistema consolida seis métricas neurálgicas en tiempo real, extraídas de forma paralela usando `Promise.all`:
1.  **MRR Total y ARR (Suscripciones Activas):** 
    *   Calcula el MRR (Ingreso Mensual Recurrente) en base a los planes nativos en CLP (Basic: $45.000, Starter: $120.000, Pro: $200.000).
    *   Suma el ARR (Annual Recurring Revenue) y muestra el total de clientes pagos.
2.  **Clientes Totales:** 
    *   Desglose del universo total en: Clientes en Trial, Pagos y Suspendidos.
3.  **Bots Activos (Status de Infraestructura):** 
    *   Muestra el recuento de bots operativos (`active = true`) versus el total de configuraciones de bots existentes (`bot_configs`).
4.  **Captación de Leads (Tráfico):** 
    *   Volumen de Leads capturados el día de hoy (desde las 00:00).
    *   Total de Leads acumulados históricamente por la red.
5.  **Tasa de Conversión (Trial a Pago):** 
    *   Métrica del porcentaje global de clientes que han pasado la barrera del pago calculado matemáticamente.
6.  **Tickets Abiertos:** 
    *   Recuento de requerimientos urgentes. Si es > 0 la tarjeta reacciona visualmente con estilos `alert` en degradado rojo advirtiendo la necesidad de intervención.

#### 1.3 Módulo Analítico (Charts)
Incluye gráficas especializadas (`AdminCharts`) que se alimentan de tres datasets procesados en el lado del servidor:
*   **Histórico MRR:** Análisis retrospectivo mensualizando ingresos activos en los **últimos 6 meses**, correlacionando cruces de fechas con la fecha de pago (`impl_paid_at`).
*   **Signups Semanales:** Curva de los últimos **8 períodos semanales** listando clientes ingresados en el lapso.
*   **Distribución de Planes:** Un dataset distribuido que clasifica el volumen entre `Basic`, `Starter`, `Pro` y `Enterprise`.

#### 1.4 Actividad Reciente Integral (Audit Trail)
*   Lee la tabla reservada `audit_logs` filtrando el módulo `admin`, mostrando los **últimos 12 logs** más importantes de todo el ecosistema.
*   Se categorizan visualmente ($ para Pagos, 🤖 para Bot, A para Admin, S para Sistemas).
*   Al pasar el cursor, habilita la opción silenciosa de examinar al cliente específico involucrado.

#### 1.5 Módulo de Navegación Rápida (Quick Nav)
Una grilla inferior de 8 accesos directos hacia los submódulos de gestión profunda:
*   Clientes (`/admin/clientes`), Bots (`/admin/bots`), Pagos (`/admin/pagos`), Tickets (`/admin/tickets`), Leads (`/admin/leads`), Alertas (`/admin/alertas`), Auditorías (`/admin/auditorias`), Configuración (`/admin/settings`).

---

## 2. Dashboard del Cliente (Client Dashboard)
**Ubicación de archivo:** `src/app/dashboard/DashboardContent.tsx`

Renderiza en cliente (`'use client'`) e implementa WebSockets dinámicos de Supabase (canalización *real-time*). Proporciona herramientas de negocio y control del Agente IA exclusivas y filtradas para su cuenta comercial (`client_id`).

### Funcionalidades y Componentes Principales

#### 2.1 Hero de Status del Agente IA (Real-time Engine)
Al conectarse, implementa un websocket (`supabase.channel`) en la tabla `bot_configs` para escuchar cambios. Visualmente se muta según tres estados:
*   **Activo (Active - Emerald):** El bot está calificado y operacional. Carga pulsos verdes e invita al cliente a "Ver instalación".
*   **Pendiente (Pending - Slate):** El sistema indica explícitamente que la IA está bajo revisión e invita al prospecto a esperar o a ver en el módulo soporte. 
*   **Error (Error - Red):** Aviso crítico detectando caída de configuración del Bot. Otorga botón de rescate redireccionando hacia "Soporte".

#### 2.2 Panel de Impacto del ROI (Métricas de Valor)
Provee 4 tarjetas (`MetricCard`) orientadas a demostrar eficacia para el cliente individual:
1.  **Leads Totales:** Suma completa en tabla filtrada.
2.  **Conversaciones Semanales:** Interacciones del bot en la semana actual. Posee render dinámico vs semana pasada (Delta Trend).
3.  **Tasa de Conversión (CVR) Estimada:** Proyecta la relación entre conversaciones entabladas y Leads formalmente capturados.
4.  **Valor Económico Estimado:** Una ecuación propia que asume `(Total Leads) x $15.000 CLP`, mostrada en una cifra "K", demostrando el valor real prospecto.

#### 2.3 Sección de Analítica y Gráficos (Analytics)
*   **Gráfico de Volumen:** Muestra curvas en los **últimos 7 días** a nivel conversacional del widget mediante el `AnalyticsChart` (cargado de manera *Dymanic* con esqueleto visual).

#### 2.4 Snippet de Instalación Express y Actividad Local
*   **Tu Snippet:** Presenta una inyección de código nativa con un script apuntando al `/widget/widget.js`. Expone la `API KEY` privada validada localmente. Otorga botón de copiado con feedback.
*   **Actividad Reciente Limitada:** Un listado con los **últimos 3 LEADS** recién capturados de su entorno, mostrados junto a su status y antigüedad precisa («Hace X mins»). Contiene un anclaje para "Ver todos los leads".

#### 2.5 Resumen Billing & Suscripción (Subscription Card)
Lectura de la base de datos `subscriptions` para arrojar los términos del servicio vigente:
*   Muestra **Plan Actual** y **Estado de la Cuenta** (Activo, Trial, o Pendiente).
*   Visualiza Fechas Claves: Si están en **Trial** muestra el límite (`trial_ends_at`); Si es activo revela el **Próximo Cohorte** (`current_period_end`).
*   Informa sobre los hitos de pago: Implementación Paga (`impl_paid_at`) e Inicio de Billing formal (`billing_start_date`).

#### 2.6 Grilla de Herramientas de Cliente (Accesos Rápidos)
Colección visual (`glassmorphism`) para la administración local del ecosistema a modo panel SaaS:
1.  **Configurar Agente (`/bot`):** Modificar Prompts, modelo y comportamiento de la IA.
2.  **Mis Leads (`/leads`):** CRM básico con el prospectivo total acumulado.
3.  **Conversaciones (`/conversations`):** Acceso al registro bruto e inbox de interacciones del bot.
4.  **Instalación (`/installation`):** Guías para embed y link in bio.
5.  **Connect (`/connect`):** (Integraciones con Webhooks / terceros).
6.  **Soporte (`/support`):** Botón paramétrico que notifica cuántos tickets activos se posee antes del click.
7.  **Documentación:** Link oficial al sistema formativo de `/docs/instalacion`.

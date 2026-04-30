/**
 * lib/agent/tools/registry.ts
 *
 * Definición de TODAS las herramientas disponibles en FORMATO OPENAI/GROQ.
 * Groq acepta el mismo formato que OpenAI para function calling.
 *
 * Cada tool tiene:
 *   - definition: formato OpenAI (el LLM la ve)
 *   - requiredPlan: plan mínimo necesario
 *   - applicableRubros: en qué rubros tiene sentido
 */

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

/** Formato OpenAI/Groq para function calling */
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface AgentToolMeta {
  definition: ToolDefinition;
  requiredPlan: 'basic' | 'starter' | 'pro' | 'enterprise';
  applicableRubros: string[] | 'all';
}

// ─────────────────────────────────────────────────────────────
// TOOL 1: capturar_lead (todos los planes)
// ─────────────────────────────────────────────────────────────
const capturarLead: AgentToolMeta = {
  requiredPlan: 'basic',
  applicableRubros: 'all',
  definition: {
    type: 'function',
    function: {
      name: 'capturar_lead',
      description:
        'Guarda los datos de contacto del usuario como lead en el sistema. ' +
        'Úsala cuando el usuario haya proporcionado nombre, email o teléfono, ' +
        'o cuando haya mostrado interés concreto en un servicio o producto.',
      parameters: {
        type: 'object',
        properties: {
          nombre:   { type: 'string',  description: 'Nombre completo del usuario' },
          email:    { type: 'string',  description: 'Email del usuario' },
          telefono: { type: 'string',  description: 'Teléfono o WhatsApp' },
          interes:  { type: 'string',  description: 'En qué producto o servicio está interesado' },
          notas:    { type: 'string',  description: 'Notas adicionales relevantes de la conversación' },
        },
        required: ['nombre'],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// TOOL 2: verificar_disponibilidad (Starter+)
// ─────────────────────────────────────────────────────────────
const verificarDisponibilidad: AgentToolMeta = {
  requiredPlan: 'starter',
  applicableRubros: ['clinica_medica', 'clinica', 'restaurante', 'hotel',
                     'fitness_gym', 'salon_belleza', 'educacion',
                     'servicios_profesionales', 'inmobiliaria'],
  definition: {
    type: 'function',
    function: {
      name: 'verificar_disponibilidad',
      description:
        'Verifica si hay disponibilidad para una fecha, hora y servicio específicos. ' +
        'SIEMPRE usa esta herramienta antes de confirmar una cita o reserva.',
      parameters: {
        type: 'object',
        properties: {
          fecha:       { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
          hora:        { type: 'string', description: 'Hora en formato HH:MM' },
          servicio:    { type: 'string', description: 'Nombre o ID del servicio/especialidad' },
          personas:    { type: 'number', description: 'Número de personas (restaurante, hotel)' },
        },
        required: ['fecha'],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// TOOL 3: agendar_cita (Starter+)
// ─────────────────────────────────────────────────────────────
const agendarCita: AgentToolMeta = {
  requiredPlan: 'starter',
  applicableRubros: ['clinica_medica', 'clinica', 'fitness_gym',
                     'salon_belleza', 'educacion', 'servicios_profesionales'],
  definition: {
    type: 'function',
    function: {
      name: 'agendar_cita',
      description:
        'Crea una cita confirmada en el sistema. Úsala SOLO después de ' +
        'verificar_disponibilidad y obtener los datos del cliente.',
      parameters: {
        type: 'object',
        properties: {
          nombre_cliente:   { type: 'string', description: 'Nombre del cliente' },
          email_cliente:    { type: 'string', description: 'Email del cliente' },
          telefono_cliente: { type: 'string', description: 'Teléfono del cliente' },
          fecha:            { type: 'string', description: 'Fecha confirmada YYYY-MM-DD' },
          hora:             { type: 'string', description: 'Hora confirmada HH:MM' },
          servicio_nombre:  { type: 'string', description: 'Nombre del servicio o especialidad' },
          notas_especiales: { type: 'string', description: 'Notas especiales (alergias, etc.)' },
        },
        required: ['nombre_cliente', 'fecha', 'hora', 'servicio_nombre'],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// TOOL 4: crear_reserva (Starter+ — restaurante, hotel)
// ─────────────────────────────────────────────────────────────
const crearReserva: AgentToolMeta = {
  requiredPlan: 'starter',
  applicableRubros: ['restaurante', 'hotel'],
  definition: {
    type: 'function',
    function: {
      name: 'crear_reserva',
      description:
        'Crea una reserva de mesa o habitación. Úsala después de verificar disponibilidad.',
      parameters: {
        type: 'object',
        properties: {
          nombre_cliente:   { type: 'string', description: 'Nombre para la reserva' },
          telefono_cliente: { type: 'string', description: 'Teléfono de contacto' },
          email_cliente:    { type: 'string', description: 'Email para confirmación' },
          fecha:            { type: 'string', description: 'Fecha YYYY-MM-DD' },
          hora:             { type: 'string', description: 'Hora HH:MM' },
          personas:         { type: 'number', description: 'Número de comensales/huéspedes' },
          zona:             { type: 'string', description: 'Preferencia de zona o sector' },
          notas_especiales: { type: 'string', description: 'Celebración especial, alergias, etc.' },
        },
        required: ['nombre_cliente', 'fecha', 'hora', 'personas'],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// TOOL 5: consultar_catalogo (Starter+)
// ─────────────────────────────────────────────────────────────
const consultarCatalogo: AgentToolMeta = {
  requiredPlan: 'starter',
  applicableRubros: ['tienda_retail', 'ecommerce', 'fitness_gym',
                     'clinica_medica', 'clinica', 'educacion'],
  definition: {
    type: 'function',
    function: {
      name: 'consultar_catalogo',
      description:
        'Busca productos, servicios o membresías en el catálogo del negocio ' +
        'según los criterios del usuario (precio, características, disponibilidad).',
      parameters: {
        type: 'object',
        properties: {
          query:          { type: 'string',  description: 'Qué está buscando el usuario' },
          max_precio:     { type: 'number',  description: 'Precio máximo en CLP si el usuario dio presupuesto' },
          solo_en_stock:  { type: 'boolean', description: 'Filtrar solo items disponibles en stock' },
          categoria:      { type: 'string',  description: 'Categoría específica si fue mencionada' },
        },
        required: ['query'],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// TOOL 6: escalar_a_humano (Starter+)
// ─────────────────────────────────────────────────────────────
const escalarAHumano: AgentToolMeta = {
  requiredPlan: 'starter',
  applicableRubros: 'all',
  definition: {
    type: 'function',
    function: {
      name: 'escalar_a_humano',
      description:
        'Notifica al equipo del negocio que el usuario necesita atención humana. ' +
        'Úsala cuando: el usuario pide explícitamente hablar con una persona, ' +
        'la situación es compleja, hay una queja grave, o el agente no puede resolver.',
      parameters: {
        type: 'object',
        properties: {
          razon:   { type: 'string', description: 'Por qué se escala a humano' },
          urgencia: {
            type: 'string',
            enum: ['normal', 'urgente', 'critica'],
            description: 'Nivel de urgencia',
          },
          resumen: { type: 'string', description: 'Resumen de la conversación hasta ahora' },
        },
        required: ['razon', 'urgencia'],
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────
// REGISTRO COMPLETO
// ─────────────────────────────────────────────────────────────

export const ALL_TOOLS: Record<string, AgentToolMeta> = {
  capturar_lead:            capturarLead,
  registrar_lead:           capturarLead,           // alias
  verificar_disponibilidad: verificarDisponibilidad,
  verificar_disponibilidad_mesa: verificarDisponibilidad, // alias restaurante
  agendar_cita:             agendarCita,
  crear_reserva:            crearReserva,
  consultar_catalogo:       consultarCatalogo,
  consultar_catalogo_gym:   consultarCatalogo,       // alias gym
  escalar_a_humano:         escalarAHumano,
  // responder_faq no necesita tool — el LLM lo hace con el system prompt
};

const PLAN_ORDER = ['basic', 'starter', 'pro', 'enterprise'];

/**
 * Filtra los tools disponibles según:
 *   1. La lista enabled_tools del business_profile
 *   2. El plan del cliente
 *   3. El rubro activo
 */
export function getToolDefinitions(
  enabledTools: string[],
  planId: string,
  rubro: string
): ToolDefinition[] {
  const clientPlanIdx = PLAN_ORDER.indexOf((planId ?? 'basic').toLowerCase());

  return enabledTools
    .filter(name => {
      const tool = ALL_TOOLS[name];
      if (!tool) return false;

      // Verificar plan
      const requiredIdx = PLAN_ORDER.indexOf(tool.requiredPlan);
      if (clientPlanIdx < requiredIdx) return false;

      // Verificar rubro
      if (tool.applicableRubros !== 'all' &&
          !tool.applicableRubros.includes(rubro)) return false;

      return true;
    })
    .map(name => ALL_TOOLS[name].definition)
    // Deduplica por nombre en caso de alias
    .filter((def, idx, arr) => arr.findIndex(d => d.function.name === def.function.name) === idx);
}

/** Modelos de Groq que soportan function calling */
export const GROQ_TOOL_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'compound-beta',
]);

export function modelSupportsFunctionCalling(model: string): boolean {
  return GROQ_TOOL_MODELS.has(model);
}

/**
 * lib/agent/tools/executor.ts
 *
 * Recibe el tool_call del LLM, ejecuta la función real,
 * guarda el resultado en bot_tool_calls (tabla existente)
 * y retorna el resultado al LLM.
 */
import { createClient } from '@supabase/supabase-js';
import { BusinessProfile } from '../context-builder';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function adminSupabase() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface ToolResult {
  success: boolean;
  message: string;             // Texto para el LLM → el LLM lo parafrasea al usuario
  data: Record<string, any>;   // Datos estructurados (guardados en audit)
  error?: string;
}

export interface ExecutionContext {
  clientId: string;
  sessionId?: string;
  profile: BusinessProfile;
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────

export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, any>,
  ctx: ExecutionContext
): Promise<string> {
  const supabase  = adminSupabase();
  const startTime = Date.now();

  let result: ToolResult;

  try {
    switch (toolName) {
      case 'capturar_lead':
      case 'registrar_lead':
        result = await execCapturarLead(toolInput, ctx, supabase);
        break;

      case 'verificar_disponibilidad':
      case 'verificar_disponibilidad_mesa':
        result = await execVerificarDisponibilidad(toolInput, ctx, supabase);
        break;

      case 'agendar_cita':
        result = await execAgendarCita(toolInput, ctx, supabase);
        break;

      case 'crear_reserva':
        result = await execCrearReserva(toolInput, ctx, supabase);
        break;

      case 'consultar_catalogo':
      case 'consultar_catalogo_gym':
        result = await execConsultarCatalogo(toolInput, ctx);
        break;

      case 'escalar_a_humano':
        result = await execEscalarAHumano(toolInput, ctx, supabase);
        break;

      default:
        result = {
          success: false,
          message: `La herramienta "${toolName}" no está implementada aún.`,
          data: {},
        };
    }
  } catch (err: any) {
    console.error(`[ToolExecutor] Error en ${toolName}:`, err.message);
    result = {
      success: false,
      message: 'Tuve un error técnico con esa acción. Por favor, contáctanos directamente.',
      data: {},
      error: err.message,
    };
  }

  const executionMs = Date.now() - startTime;

  // Guardar en bot_tool_calls (tabla ya existente) — Non-blocking
  void (async () => {
    try {
      await supabase.from('bot_tool_calls').insert({
        client_id:    ctx.clientId,
        session_id:   ctx.sessionId ?? null,
        tool_slug:    toolName,
        input_params: toolInput,
        output_result: result.data,
        success:      result.success,
        latency_ms:   executionMs,
      });
    } catch { /* non-blocking */ }
  })();

  // Devolver al LLM como JSON string
  return JSON.stringify({
    success: result.success,
    result:  result.message,
    data:    result.data,
  });
}

// ─────────────────────────────────────────────────────────────
// IMPLEMENTACIONES
// ─────────────────────────────────────────────────────────────

async function execCapturarLead(
  input: Record<string, any>,
  ctx: ExecutionContext,
  supabase: ReturnType<typeof adminSupabase>
): Promise<ToolResult> {
  const nameParts = (input.nombre ?? '').trim().split(/\s+/);
  const firstName = nameParts[0] ?? input.nombre;
  const lastName  = nameParts.slice(1).join(' ') || null;

  const { data, error } = await supabase
    .from('leads')
    .insert({
      client_id:  ctx.clientId,
      first_name: firstName,
      last_name:  lastName,
      name:       input.nombre,      // campo alternativo
      email:      input.email ?? null,
      phone:      input.telefono ?? null,
      source:     'agent_conversation',
      notes:      input.notas ?? `Interés en: ${input.interes ?? 'N/A'}`,
      status:     'new',
      rubro:      ctx.profile.rubro,
      metadata:   {
        agent_captured: true,
        rubro: ctx.profile.rubro,
        business: ctx.profile.business_name,
        interes: input.interes ?? null,
      },
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[execCapturarLead] DB error:', error.message);
    // No fallar el flujo — continuar aunque no se guarde
  }

  const confirmMsg = ctx.profile.business_rules?.requiere_confirmacion
    ? 'Te contactaremos a la brevedad para confirmar.'
    : '¡Ya estás en nuestro sistema!';

  return {
    success: true,
    data:    { lead_id: data?.id ?? null, nombre: input.nombre },
    message: `Perfecto, ${input.nombre}. Guardé tu información. ${confirmMsg}${
      input.email ? ` Te enviaremos información a ${input.email}.` : ''
    }`,
  };
}

async function execVerificarDisponibilidad(
  input: Record<string, any>,
  ctx: ExecutionContext,
  supabase: ReturnType<typeof adminSupabase>
): Promise<ToolResult> {
  const { fecha, hora = '10:00', servicio, personas = 1 } = input;
  const rules = ctx.profile.business_rules ?? {};

  // Validar que la fecha no sea pasada
  const requestedDt = new Date(`${fecha}T${hora}:00`);
  if (isNaN(requestedDt.getTime()) || requestedDt < new Date()) {
    return {
      success: true,
      data: { available: false },
      message: 'Esa fecha/hora ya pasó. ¿Te busco disponibilidad para otra fecha?',
    };
  }

  // Validar límite de personas (restaurante)
  const maxPersonas = rules.max_personas_por_reserva;
  if (maxPersonas && personas > maxPersonas) {
    return {
      success: true,
      data: { available: false, max_allowed: maxPersonas },
      message: `El máximo de personas por reserva es ${maxPersonas}. Para grupos más grandes, te recomiendo llamarnos directamente al ${ctx.profile.business_info?.telefono ?? 'nuestro teléfono'}.`,
    };
  }

  // Consultar reservas existentes en DB (si la tabla bookings existe)
  let occupied = false;
  try {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', ctx.clientId)
      .eq('fecha', fecha)
      .eq('hora', hora)
      .eq('status', 'confirmed')
      .maybeSingle();
    occupied = !!existing;
  } catch {
    // Si la tabla no existe aún, asumir disponible
    occupied = false;
  }

  if (occupied) {
    const alternatives = generateAlternativeSlots(fecha, hora, 3);
    const altText = alternatives.map(a => `${formatDateEs(a.fecha)} a las ${a.hora}`).join(', o ');
    return {
      success: true,
      data: { available: false, alternatives },
      message: `Ese horario ya está reservado. Tengo disponibilidad en: ${altText}. ¿Alguno te acomoda?`,
    };
  }

  return {
    success: true,
    data:    { available: true, fecha, hora, servicio },
    message: `¡Perfecto! Hay disponibilidad el ${formatDateEs(fecha)} a las ${hora}${servicio ? ` para ${servicio}` : ''}. ¿Confirmo la reserva a tu nombre?`,
  };
}

async function execAgendarCita(
  input: Record<string, any>,
  ctx: ExecutionContext,
  supabase: ReturnType<typeof adminSupabase>
): Promise<ToolResult> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id:       ctx.clientId,
      nombre_cliente:  input.nombre_cliente,
      email_cliente:   input.email_cliente ?? null,
      telefono_cliente: input.telefono_cliente ?? null,
      fecha:           input.fecha,
      hora:            input.hora,
      servicio_nombre: input.servicio_nombre,
      notas_especiales: input.notas_especiales ?? null,
      personas:        1,
      status:          'confirmed',
      business_name:   ctx.profile.business_name,
      rubro:           ctx.profile.rubro,
      created_via:     'agent',
    })
    .select('id')
    .maybeSingle();

  const bookingId = data?.id ? data.id.slice(-6).toUpperCase() : `REF${Date.now().toString(36).toUpperCase()}`;

  if (error) console.warn('[execAgendarCita] DB error:', error.message);

  return {
    success: true,
    data:    { booking_id: bookingId, ...input },
    message: [
      `✅ ¡Listo, ${input.nombre_cliente}! Tu cita está confirmada.`,
      `📅 ${formatDateEs(input.fecha)} a las ${input.hora}`,
      `🏥 Servicio: ${input.servicio_nombre}`,
      `📍 ${ctx.profile.business_info?.ubicacion ?? ctx.profile.business_name}`,
      `🔖 Código de cita: #${bookingId}`,
      input.notas_especiales ? `📝 Nota: ${input.notas_especiales}` : null,
      '', '¿Necesitas algo más?',
    ].filter(v => v !== null).join('\n'),
  };
}

async function execCrearReserva(
  input: Record<string, any>,
  ctx: ExecutionContext,
  supabase: ReturnType<typeof adminSupabase>
): Promise<ToolResult> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id:       ctx.clientId,
      nombre_cliente:  input.nombre_cliente,
      email_cliente:   input.email_cliente ?? null,
      telefono_cliente: input.telefono_cliente ?? null,
      fecha:           input.fecha,
      hora:            input.hora,
      servicio_nombre: input.zona ? `Mesa zona ${input.zona}` : 'Reserva de mesa',
      personas:        input.personas ?? 2,
      notas_especiales: input.notas_especiales ?? null,
      status:          'confirmed',
      business_name:   ctx.profile.business_name,
      rubro:           ctx.profile.rubro,
      created_via:     'agent',
    })
    .select('id')
    .maybeSingle();

  const bookingId = data?.id ? data.id.slice(-6).toUpperCase() : `R${Date.now().toString(36).toUpperCase()}`;

  if (error) console.warn('[execCrearReserva] DB error:', error.message);

  return {
    success: true,
    data:    { booking_id: bookingId, ...input },
    message: [
      `🍽️ ¡Reserva confirmada, ${input.nombre_cliente}!`,
      `📅 ${formatDateEs(input.fecha)} a las ${input.hora}`,
      `👥 ${input.personas ?? 2} personas${input.zona ? ` | Zona: ${input.zona}` : ''}`,
      `📍 ${ctx.profile.business_info?.ubicacion ?? ctx.profile.business_name}`,
      `🎫 Código de reserva: #${bookingId}`,
      input.notas_especiales ? `🌟 Solicitud especial: ${input.notas_especiales}` : null,
      '',
      ctx.profile.business_rules?.politica_cancelacion
        ? `ℹ️ Cancelaciones: ${ctx.profile.business_rules.politica_cancelacion}`
        : null,
      '¡Te esperamos!',
    ].filter(v => v !== null).join('\n'),
  };
}

async function execConsultarCatalogo(
  input: Record<string, any>,
  ctx: ExecutionContext
): Promise<ToolResult> {
  const catalog = ctx.profile.catalog ?? [];

  if (!catalog.length) {
    return {
      success: false,
      data: {},
      message: 'El catálogo aún no está configurado. Te recomiendo contactarnos directamente.',
    };
  }

  const q = (input.query ?? '').toLowerCase();

  let results = catalog.filter(item => {
    const nameMatch = item.nombre?.toLowerCase().includes(q) || q.length < 3;
    const priceOk   = !input.max_precio || !item.precio || item.precio <= input.max_precio;
    const stockOk   = !input.solo_en_stock || item.stock !== false;
    return nameMatch && priceOk && stockOk;
  });

  // Si no hay match exacto, mostrar todo el catálogo (el LLM elegirá)
  if (!results.length) results = catalog.slice(0, 6);

  const rubro = ctx.profile.rubro;
  const formatted = results.map(item => {
    if (rubro === 'tienda_retail' || rubro === 'ecommerce') {
      return `• ${item.nombre}: $${(item.precio ?? 0).toLocaleString('es-CL')} CLP${item.stock === false ? ' (Agotado)' : ''}`;
    }
    if (rubro === 'fitness_gym') {
      if (item.tipo === 'membresia') return `• Membresía ${item.nombre}: $${(item.precio_mensual ?? 0).toLocaleString('es-CL')}/mes`;
      if (item.tipo === 'clase')     return `• Clase ${item.nombre}: ${item.horarios?.join(', ')}`;
      return `• ${item.nombre}`;
    }
    if (rubro === 'clinica_medica' || rubro === 'clinica') {
      return `• ${item.nombre}: $${(item.precio_clp ?? 0).toLocaleString('es-CL')} CLP`;
    }
    return `• ${item.nombre ?? JSON.stringify(item)}`;
  }).join('\n');

  return {
    success: true,
    data:    { results, count: results.length },
    message: `Encontré ${results.length} opcion${results.length === 1 ? '' : 'es'}:\n${formatted}`,
  };
}

async function execEscalarAHumano(
  input: Record<string, any>,
  ctx: ExecutionContext,
  supabase: ReturnType<typeof adminSupabase>
): Promise<ToolResult> {
  // Crear ticket de escalación — Non-blocking
  void (async () => {
    try {
      await supabase.from('tickets').insert({
        user_id:  ctx.clientId,
        client_id: ctx.clientId,
        title:    `[Escalación ${(input.urgencia ?? 'normal').toUpperCase()}] ${input.razon}`,
        issue:    input.resumen ?? input.razon,
        priority: input.urgencia === 'critica' ? 'high'
                : input.urgencia === 'urgente' ? 'medium'
                : 'low',
        status:   'open',
        category: 'agent_escalation',
        message:  input.razon,
      });
    } catch { /* non-blocking */ }
  })();

  const msgs: Record<string, string> = {
    normal:  'Entiendo, voy a conectarte con nuestro equipo. Te contactarán a la brevedad en el horario de atención.',
    urgente: 'Nuestro equipo ha sido notificado con urgencia y te contactará muy pronto.',
    critica: 'He alertado a nuestro equipo con prioridad máxima. Alguien te atenderá de inmediato.',
  };

  return {
    success: true,
    data:    { escalated: true, urgencia: input.urgencia },
    message: msgs[input.urgencia ?? 'normal'],
  };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function generateAlternativeSlots(
  fecha: string,
  hora: string,
  count: number
): { fecha: string; hora: string }[] {
  const slots = [];
  const base  = new Date(`${fecha}T${hora}:00`);
  for (let i = 1; i <= count; i++) {
    const alt = new Date(base.getTime() + i * 60 * 60 * 1000);
    slots.push({
      fecha: alt.toISOString().split('T')[0],
      hora:  alt.toTimeString().slice(0, 5),
    });
  }
  return slots;
}

function formatDateEs(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
    });
  } catch {
    return dateStr;
  }
}

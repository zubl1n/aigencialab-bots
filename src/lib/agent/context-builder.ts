/**
 * lib/agent/context-builder.ts
 *
 * NÚCLEO del motor multi-rubro.
 * Carga business_profiles desde Supabase y construye el system prompt
 * dinámico que se inyecta en cada llamada al LLM.
 *
 * PRIORIDAD:
 *   1. business_profiles.system_prompt_template (nuevo sistema)
 *   2. bot_rubros.system_prompt_template (fallback por rubro_slug)
 *   3. bot_configs.system_prompt (fallback existente)
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function adminSupabase() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

export interface BusinessProfile {
  id: string;
  client_id: string;
  bot_config_id: string | null;
  business_name: string;
  rubro: string;
  agent_name: string;
  agent_personality: string;
  agent_objective: string;
  system_prompt_template: string;
  business_rules: Record<string, any>;
  catalog: any[];
  business_info: Record<string, any>;
  enabled_tools: string[];
  is_active: boolean;
  is_demo: boolean;
}

export interface AgentContext {
  systemPrompt: string;
  availableTools: string[];
  profile: BusinessProfile;
  source: 'business_profile' | 'bot_rubro_fallback';
}

// ─────────────────────────────────────────────────────────────
// CARGA DESDE DB
// ─────────────────────────────────────────────────────────────

export async function loadBusinessProfile(
  clientId: string,
  rubroSlug?: string
): Promise<BusinessProfile | null> {
  const supabase = adminSupabase();

  let query = supabase
    .from('business_profiles')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (rubroSlug) {
    query = query.eq('rubro', rubroSlug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[ContextBuilder] Error loading business_profile:', error.message);
    return null;
  }

  return data as BusinessProfile | null;
}

/** Fallback: cargar template desde bot_rubros (tabla existente) */
async function loadRubroTemplate(rubroSlug: string): Promise<string | null> {
  const supabase = adminSupabase();
  const { data } = await supabase
    .from('bot_rubros')
    .select('system_prompt_template, name')
    .eq('slug', rubroSlug)
    .maybeSingle();
  return data?.system_prompt_template ?? null;
}

// ─────────────────────────────────────────────────────────────
// CONSTRUCTOR DE SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────

export function buildSystemPrompt(profile: BusinessProfile): string {
  const template = profile.system_prompt_template;
  if (!template) return '';

  const catalogText  = formatCatalog(profile.rubro, profile.catalog ?? []);
  const infoText     = formatBusinessInfo(profile.business_info ?? {});
  const rulesText    = formatRules(profile.business_rules ?? {});

  return template
    // Nuevas variables
    .replace(/\{\{business_name\}\}/g,  profile.business_name)
    .replace(/\{\{agent_name\}\}/g,     profile.agent_name)
    .replace(/\{\{objective\}\}/g,      profile.agent_objective)
    .replace(/\{\{personality\}\}/g,    profile.agent_personality)
    .replace(/\{\{business_info\}\}/g,  infoText)
    .replace(/\{\{catalogo\}\}/g,       catalogText)
    .replace(/\{\{reglas_adicionales\}\}/g, rulesText)
    // Variables legacy de bot_rubros para compatibilidad
    .replace(/\{\{bot_name\}\}/g,       profile.agent_name)
    .replace(/\{\{company_name\}\}/g,   profile.business_name)
    .replace(/\{\{faqs_block\}\}/g,     '');
}

function formatBusinessInfo(info: Record<string, any>): string {
  return [
    info.descripcion  && `${info.descripcion}`,
    info.ubicacion    && `📍 Ubicación: ${info.ubicacion}`,
    info.horario      && `🕐 Horario: ${info.horario}`,
    info.telefono     && `📞 Teléfono: ${info.telefono}`,
    info.sitio_web    && `🌐 Web: ${info.sitio_web}`,
    info.email_contacto && `✉️ Email: ${info.email_contacto}`,
  ].filter(Boolean).join('\n');
}

function formatCatalog(rubro: string, catalog: any[]): string {
  if (!catalog || catalog.length === 0) return 'Catálogo pendiente de configuración.';

  switch (rubro) {
    case 'tienda_retail':
    case 'ecommerce':
      return catalog.map(p =>
        `• ${p.nombre}: $${(p.precio ?? 0).toLocaleString('es-CL')} CLP` +
        ` | ${p.stock !== false ? '✅ En stock' : '❌ Agotado'}` +
        (p.tallas?.length  ? ` | Tallas: ${p.tallas.join(', ')}` : '') +
        (p.colores?.length ? ` | Colores: ${p.colores.join(', ')}` : '') +
        (p.nota ? ` | ⚠️ ${p.nota}` : '')
      ).join('\n');

    case 'clinica_medica':
    case 'clinica':
      return catalog.map(s =>
        `• ${s.nombre}` +
        (s.duracion_min ? ` (${s.duracion_min} min)` : '') +
        (s.precio_clp   ? ` | $${s.precio_clp.toLocaleString('es-CL')} CLP` : '') +
        (s.disponible === false ? ' | ⚠️ No disponible hoy' : '')
      ).join('\n');

    case 'restaurante':
      return catalog.map((z: any) => {
        if (z.zona && z.mesas) {
          const mesas = z.mesas.map((m: any) => `${m.id}(${m.capacidad}p)`).join(', ');
          return `• ${z.zona}${z.descripcion ? ` — ${z.descripcion}` : ''}: ${mesas}`;
        }
        return `• ${JSON.stringify(z)}`;
      }).join('\n');

    case 'fitness_gym':
      return catalog.map(item => {
        if (item.tipo === 'membresia') {
          return `• 💳 Membresía ${item.nombre}: $${(item.precio_mensual ?? 0).toLocaleString('es-CL')}/mes | Incluye: ${(item.incluye ?? []).join(', ')}`;
        }
        if (item.tipo === 'clase') {
          return `• 🏃 Clase ${item.nombre} (${item.duracion_min}min, nivel: ${item.nivel}) | Horarios: ${(item.horarios ?? []).join(', ')}`;
        }
        if (item.tipo === 'servicio') {
          return `• ⭐ ${item.nombre}: $${(item.precio_sesion ?? 0).toLocaleString('es-CL')}/sesión (${item.duracion_min}min)`;
        }
        return `• ${item.nombre}`;
      }).join('\n');

    default:
      return catalog.map(item =>
        `• ${item.nombre ?? JSON.stringify(item)}`
      ).join('\n');
  }
}

function formatRules(rules: Record<string, any>): string {
  const lines: string[] = [];

  if (rules.promocion_activa)         lines.push(`🏷️ PROMOCIÓN VIGENTE: ${rules.promocion_activa}`);
  if (rules.politica_cancelacion)     lines.push(`ℹ️ Cancelaciones: ${rules.politica_cancelacion}`);
  if (rules.politica_cambios)         lines.push(`🔄 Cambios: ${rules.politica_cambios}`);
  if (rules.mensaje_fuera_horario)    lines.push(`🕐 Fuera de horario: ${rules.mensaje_fuera_horario}`);
  if (rules.max_personas_por_reserva) lines.push(`👥 Máximo por reserva: ${rules.max_personas_por_reserva} personas`);
  if (rules.clase_prueba_gratis)      lines.push(`🎁 Clase de prueba GRATUITA disponible para nuevos miembros.`);
  if (rules.anticipo_requerido === false) lines.push(`💳 No se requiere anticipo para reservar.`);
  if (rules.respuesta_fallback)       lines.push(`\n📌 Si no puedes responder algo: "${rules.respuesta_fallback}"`);

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: buildAgentContext
// ─────────────────────────────────────────────────────────────

export async function buildAgentContext(
  clientId: string,
  rubroSlug?: string,
  existingBotSystemPrompt?: string
): Promise<AgentContext | null> {

  // 1. Intentar cargar business_profile (nuevo sistema)
  const profile = await loadBusinessProfile(clientId, rubroSlug);

  if (profile && profile.system_prompt_template.trim()) {
    const systemPrompt = buildSystemPrompt(profile);
    return {
      systemPrompt,
      availableTools: profile.enabled_tools ?? [],
      profile,
      source: 'business_profile',
    };
  }

  // 2. Fallback: bot_rubros template (sistema existente)
  if (rubroSlug && rubroSlug !== 'general') {
    const template = await loadRubroTemplate(rubroSlug);
    if (template) {
      // Crear un profile mínimo para el formatter
      const minimalProfile: BusinessProfile = {
        id: 'fallback',
        client_id: clientId,
        bot_config_id: null,
        business_name:        profile?.business_name ?? 'el negocio',
        rubro:                rubroSlug,
        agent_name:           profile?.agent_name ?? 'Asistente IA',
        agent_personality:    profile?.agent_personality ?? 'profesional y amigable',
        agent_objective:      profile?.agent_objective ?? 'ayudar a los usuarios',
        system_prompt_template: template,
        business_rules:       profile?.business_rules ?? {},
        catalog:              profile?.catalog ?? [],
        business_info:        profile?.business_info ?? {},
        enabled_tools:        profile?.enabled_tools ?? ['capturar_lead'],
        is_active: true,
        is_demo:   profile?.is_demo ?? false,
      };

      return {
        systemPrompt: buildSystemPrompt(minimalProfile),
        availableTools: minimalProfile.enabled_tools,
        profile: minimalProfile,
        source: 'bot_rubro_fallback',
      };
    }
  }

  // 3. Sin contexto encontrado → el caller usará bot_configs.system_prompt
  return null;
}

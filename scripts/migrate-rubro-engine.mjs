/**
 * migrate.mjs — Run rubro engine migration directly via Supabase JS client
 * Usage: node migrate.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helper: execute raw SQL via PostgREST pg_dump workaround ──────────────────
// Supabase JS client doesn't expose raw SQL — we use the REST API directly
async function sql(query, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/moddatetime`, {
    method: 'HEAD', // just a probe — we use fetch for real SQL below
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  // Use the Supabase DB REST API for DDL via pg_stat_statements workaround
  // Actually, use the direct pg connection via supabase-js .rpc() if exec_sql exists
  const { data, error } = await supabase.rpc('exec_sql', { sql: query }).maybeSingle();
  if (error && error.code !== 'PGRST202') { // PGRST202 = function not found
    console.error(`  ✗ ${label}:`, error.message);
    return false;
  }
  console.log(`  ✓ ${label}`);
  return true;
}

// ── Fallback: use fetch to postgrest DDL endpoint ─────────────────────────────
async function execSQL(sqlStr, label) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ query: sqlStr }),
    });
    console.log(`  ${res.ok ? '✓' : '✗'} ${label} — HTTP ${res.status}`);
    return res.ok;
  } catch (e) {
    console.error(`  ✗ ${label}:`, e.message);
    return false;
  }
}

// ── Use supabase-js table operations for DML (INSERT) ────────────────────────
async function upsertRubros() {
  const rubros = [
    {
      slug: 'general',
      name: 'General / Atención al Cliente',
      icon: '💬',
      description: 'Asistente genérico de atención al cliente.',
      system_prompt_template: 'Eres {{bot_name}}, el asistente virtual de {{company_name}}.\nResponde siempre en español de manera amable y concisa.\nSi no sabes algo, dilo honestamente. No inventes información.\n\n{{faqs_block}}',
      tools_allowed: [],
      default_faqs: [],
    },
    {
      slug: 'inmobiliaria',
      name: 'Inmobiliaria / Propiedades',
      icon: '🏠',
      description: 'Agente especializado en captación de leads inmobiliarios y coordinación de visitas.',
      system_prompt_template: `Eres {{bot_name}}, agente comercial digital de {{company_name}}, una empresa inmobiliaria.

TU MISIÓN PRINCIPAL: Captar leads calificados y coordinar visitas a propiedades.

CAPACIDADES:
- Consultar propiedades disponibles por tipo, precio y ubicación [consultar_propiedades]
- Agendar visitas con un ejecutivo [agendar_visita]
- Registrar datos del interesado como lead [registrar_lead]
- Responder FAQs sobre requisitos de arriendo y venta

PROTOCOLO:
1. Pregunta su presupuesto y preferencias
2. Muéstrale opciones disponibles [consultar_propiedades]
3. Propón coordinar una visita [agendar_visita]
4. Registra sus datos [registrar_lead]

REGLAS: Ofrece máximo 2-3 propiedades por vez. Horario: Lunes a Viernes 9-18h.

{{faqs_block}}`,
      tools_allowed: ['consultar_propiedades', 'agendar_visita', 'registrar_lead'],
      default_faqs: [
        { q: '¿Cuáles son los requisitos para arrendar?', a: 'Necesitas 3 últimas liquidaciones de sueldo, DICOM al día y codeudor solidario.' },
        { q: '¿Tienen propiedades en Las Condes?', a: 'Sí, tenemos disponibilidad en Las Condes, Vitacura y Providencia.' },
      ],
    },
    {
      slug: 'clinica',
      name: 'Clínica Médica / Salud',
      icon: '🏥',
      description: 'Asistente para clínicas: agendamiento de citas, PAD/convenios y triaje básico.',
      system_prompt_template: `Eres {{bot_name}}, asistente digital de {{company_name}}, una clínica médica.

TU MISIÓN: Facilitar el agendamiento de citas y resolver consultas frecuentes de pacientes.

CAPACIDADES:
- Verificar disponibilidad de médicos y especialidades [verificar_disponibilidad]
- Agendar citas médicas [agendar_cita]
- Informar sobre convenios ISAPRE y FONASA
- Realizar triaje básico (síntomas → especialidad sugerida)

PROTOCOLO DE AGENDAMIENTO:
1. Preguntar nombre completo y RUT del paciente
2. Identificar especialidad requerida
3. Verificar disponibilidad [verificar_disponibilidad]
4. Confirmar horario [agendar_cita]

IMPORTANTE: Si el paciente describe síntomas graves, deriva INMEDIATAMENTE a urgencias. NO diagnostiques ni prescribas.

{{faqs_block}}`,
      tools_allowed: ['verificar_disponibilidad', 'agendar_cita', 'consultar_medicos', 'cancelar_cita'],
      default_faqs: [
        { q: '¿Tienen convenio con FONASA?', a: 'Sí, aceptamos FONASA A, B, C y D en la mayoría de nuestras especialidades.' },
        { q: '¿Cuántos días de anticipación necesito?', a: 'Puedes agendar desde 1 día hasta 60 días de anticipación según la especialidad.' },
      ],
    },
    {
      slug: 'ecommerce',
      name: 'Tienda Online / E-commerce',
      icon: '🛍️',
      description: 'Asistente para tiendas: catálogo, stock, pedidos y soporte post-venta.',
      system_prompt_template: `Eres {{bot_name}}, asistente de ventas de {{company_name}}, una tienda online.

TU MISIÓN: Ayudar a los clientes a encontrar productos, completar compras y resolver dudas post-venta.

CAPACIDADES:
- Buscar productos por nombre, categoría o características [consultar_catalogo]
- Verificar stock disponible [verificar_stock]
- Rastrear pedidos existentes [rastrear_pedido]
- Aplicar códigos de descuento [aplicar_descuento]

FLUJO DE VENTA:
1. Entender qué busca el cliente
2. Consultar catálogo [consultar_catalogo]
3. Verificar stock [verificar_stock]
4. Presentar máximo 3 opciones con precio
5. Guiar al pago: "¿Te gustaría ir al carrito?"

POLÍTICAS: Despacho 2-5 días hábiles. Cambios: 15 días con empaque original.

{{faqs_block}}`,
      tools_allowed: ['consultar_catalogo', 'verificar_stock', 'rastrear_pedido', 'aplicar_descuento'],
      default_faqs: [
        { q: '¿Hacen despacho a todo Chile?', a: 'Sí, despachamos a todo Chile vía Starken o Chilexpress.' },
        { q: '¿Puedo cambiar un producto?', a: 'Sí, tienes 15 días desde la compra con boleta y empaque original.' },
      ],
    },
    {
      slug: 'restaurante',
      name: 'Restaurante / Food & Beverage',
      icon: '🍽️',
      description: 'Asistente para restaurantes: reservas, menú, pedidos y eventos.',
      system_prompt_template: `Eres {{bot_name}}, el anfitrión digital de {{company_name}}, un restaurante.

TU MISIÓN: Tomar reservas, presentar el menú y resolver dudas de los comensales.

CAPACIDADES:
- Consultar disponibilidad de mesas [verificar_disponibilidad_mesa]
- Tomar y confirmar reservas [crear_reserva]
- Presentar el menú del día [consultar_menu]
- Cancelar reservas [cancelar_reserva]

FLUJO DE RESERVA:
1. Preguntar: fecha, hora, número de personas
2. Verificar disponibilidad [verificar_disponibilidad_mesa]
3. Registrar: nombre, teléfono, solicitudes especiales
4. Confirmar reserva [crear_reserva]

REGLAS: Máximo 12 personas por reserva online. Cancelación con 2h de anticipación mínimo.

{{faqs_block}}`,
      tools_allowed: ['verificar_disponibilidad_mesa', 'crear_reserva', 'consultar_menu', 'cancelar_reserva'],
      default_faqs: [
        { q: '¿Tienen opciones vegetarianas?', a: 'Sí, contamos con menú vegetariano y vegano disponible todos los días.' },
        { q: '¿Puedo reservar para un evento privado?', a: 'Sí, salón privado para hasta 30 personas. Contáctanos para cotizar.' },
      ],
    },
    {
      slug: 'educacion',
      name: 'Centro Educativo / Academia',
      icon: '📚',
      description: 'Asistente para academias: inscripciones, horarios, cursos y consultas académicas.',
      system_prompt_template: `Eres {{bot_name}}, el asistente académico de {{company_name}}.

TU MISIÓN: Orientar a estudiantes y apoderados sobre cursos e inscripciones.

CAPACIDADES:
- Informar sobre cursos y programas disponibles [consultar_cursos]
- Verificar disponibilidad de cupos [verificar_cupos]
- Gestionar solicitudes de inscripción [registrar_inscripcion]

{{faqs_block}}`,
      tools_allowed: ['consultar_cursos', 'verificar_cupos', 'registrar_inscripcion'],
      default_faqs: [
        { q: '¿Entregan certificado al terminar?', a: 'Sí, todos nuestros cursos incluyen certificado de participación y aprobación.' },
      ],
    },
  ];

  console.log('\n📦 Upserting bot_rubros...');
  const { data, error } = await supabase
    .from('bot_rubros')
    .upsert(rubros, { onConflict: 'slug' })
    .select('slug, name');
  
  if (error) {
    console.error('  ✗ Rubros upsert failed:', error.message);
    console.error('  Code:', error.code, '| Details:', error.details);
    return false;
  }
  console.log(`  ✓ Inserted/updated ${data?.length ?? 0} rubros:`, data?.map(r => r.slug).join(', '));
  return true;
}

async function upsertTools() {
  const tools = [
    { slug: 'consultar_propiedades', name: 'Consultar Propiedades', description: 'Busca propiedades disponibles según filtros', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { tipo: { type: 'string', enum: ['venta', 'arriendo', 'ambos'] }, presupuesto_max: { type: 'number' }, comuna: { type: 'string' }, dormitorios: { type: 'number' } }, required: ['tipo'] } },
    { slug: 'agendar_visita', name: 'Agendar Visita', description: 'Agenda una visita a una propiedad', category: 'calendar', is_simulated: true,
      parameters: { type: 'object', properties: { fecha: { type: 'string' }, hora: { type: 'string' }, nombre: { type: 'string' }, email: { type: 'string' }, telefono: { type: 'string' }, propiedad_id: { type: 'string' } }, required: ['fecha', 'hora', 'nombre', 'email'] } },
    { slug: 'registrar_lead', name: 'Registrar Lead', description: 'Guarda datos de un prospecto en el CRM', category: 'crm', is_simulated: true,
      parameters: { type: 'object', properties: { nombre: { type: 'string' }, email: { type: 'string' }, telefono: { type: 'string' }, interes: { type: 'string' }, presupuesto: { type: 'string' } }, required: ['nombre'] } },
    { slug: 'verificar_disponibilidad', name: 'Verificar Disponibilidad', description: 'Consulta disponibilidad para cita médica', category: 'calendar', is_simulated: true,
      parameters: { type: 'object', properties: { especialidad: { type: 'string' }, fecha_desde: { type: 'string' }, fecha_hasta: { type: 'string' } }, required: ['especialidad'] } },
    { slug: 'agendar_cita', name: 'Agendar Cita Médica', description: 'Crea una nueva cita médica', category: 'calendar', is_simulated: true,
      parameters: { type: 'object', properties: { especialidad: { type: 'string' }, fecha: { type: 'string' }, hora: { type: 'string' }, paciente_nombre: { type: 'string' }, paciente_rut: { type: 'string' }, paciente_email: { type: 'string' } }, required: ['especialidad', 'fecha', 'hora', 'paciente_nombre'] } },
    { slug: 'consultar_medicos', name: 'Consultar Médicos', description: 'Lista médicos disponibles por especialidad', category: 'crm', is_simulated: true,
      parameters: { type: 'object', properties: { especialidad: { type: 'string' } }, required: ['especialidad'] } },
    { slug: 'cancelar_cita', name: 'Cancelar Cita', description: 'Cancela una cita médica existente', category: 'calendar', is_simulated: true,
      parameters: { type: 'object', properties: { cita_id: { type: 'string' }, paciente_rut: { type: 'string' } }, required: ['paciente_rut'] } },
    { slug: 'consultar_catalogo', name: 'Consultar Catálogo', description: 'Busca productos en el catálogo de la tienda', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { query: { type: 'string' }, categoria: { type: 'string' }, precio_max: { type: 'number' }, en_oferta: { type: 'boolean' } }, required: ['query'] } },
    { slug: 'verificar_stock', name: 'Verificar Stock', description: 'Verifica stock de un producto', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { producto_id: { type: 'string' }, variante: { type: 'string' }, cantidad: { type: 'number' } }, required: ['producto_id'] } },
    { slug: 'rastrear_pedido', name: 'Rastrear Pedido', description: 'Consulta el estado de un pedido', category: 'crm', is_simulated: true,
      parameters: { type: 'object', properties: { pedido_id: { type: 'string' }, email: { type: 'string' } }, required: ['pedido_id'] } },
    { slug: 'aplicar_descuento', name: 'Aplicar Descuento', description: 'Verifica y aplica un código de descuento', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { codigo: { type: 'string' }, monto_total: { type: 'number' } }, required: ['codigo', 'monto_total'] } },
    { slug: 'verificar_disponibilidad_mesa', name: 'Verificar Disponibilidad Mesa', description: 'Consulta disponibilidad de mesas en el restaurante', category: 'reservation', is_simulated: true,
      parameters: { type: 'object', properties: { fecha: { type: 'string' }, hora: { type: 'string' }, personas: { type: 'number' }, sector: { type: 'string' } }, required: ['fecha', 'hora', 'personas'] } },
    { slug: 'crear_reserva', name: 'Crear Reserva', description: 'Registra una reserva en el restaurante', category: 'reservation', is_simulated: true,
      parameters: { type: 'object', properties: { fecha: { type: 'string' }, hora: { type: 'string' }, personas: { type: 'number' }, nombre: { type: 'string' }, telefono: { type: 'string' }, solicitudes_especiales: { type: 'string' } }, required: ['fecha', 'hora', 'personas', 'nombre'] } },
    { slug: 'consultar_menu', name: 'Consultar Menú', description: 'Devuelve el menú del día o por categoría', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { categoria: { type: 'string', enum: ['entrantes', 'fondos', 'postres', 'bebidas', 'menu_dia', 'todo'] } }, required: [] } },
    { slug: 'cancelar_reserva', name: 'Cancelar Reserva', description: 'Cancela una reserva del restaurante', category: 'reservation', is_simulated: true,
      parameters: { type: 'object', properties: { nombre: { type: 'string' }, telefono: { type: 'string' } }, required: ['nombre'] } },
    { slug: 'consultar_cursos', name: 'Consultar Cursos', description: 'Lista cursos disponibles por área o nivel', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { area: { type: 'string' }, nivel: { type: 'string' }, modalidad: { type: 'string' } }, required: [] } },
    { slug: 'verificar_cupos', name: 'Verificar Cupos', description: 'Consulta cupos disponibles en un curso', category: 'catalog', is_simulated: true,
      parameters: { type: 'object', properties: { curso_id: { type: 'string' } }, required: ['curso_id'] } },
    { slug: 'registrar_inscripcion', name: 'Registrar Inscripción', description: 'Registra una solicitud de inscripción a un curso', category: 'crm', is_simulated: true,
      parameters: { type: 'object', properties: { curso_id: { type: 'string' }, nombre: { type: 'string' }, email: { type: 'string' }, telefono: { type: 'string' } }, required: ['curso_id', 'nombre', 'email'] } },
  ];

  console.log('\n🔧 Upserting bot_tools_catalog...');
  const { data, error } = await supabase
    .from('bot_tools_catalog')
    .upsert(tools, { onConflict: 'slug' })
    .select('slug');

  if (error) {
    console.error('  ✗ Tools upsert failed:', error.message);
    return false;
  }
  console.log(`  ✓ Inserted/updated ${data?.length ?? 0} tools:`, data?.map(t => t.slug).join(', '));
  return true;
}

async function main() {
  console.log('🚀 AIgenciaLab — Rubro Engine Migration');
  console.log('Project:', SUPABASE_URL);
  console.log('');

  // Test connection
  const { data: test, error: testErr } = await supabase.from('clients').select('count').limit(1);
  if (testErr) {
    console.error('❌ Connection failed:', testErr.message);
    process.exit(1);
  }
  console.log('✅ Supabase connection OK');

  // Check if tables exist
  const { error: tableCheck } = await supabase.from('bot_rubros').select('count').limit(1);
  if (tableCheck?.code === '42P01') {
    console.log('\n⚠️  Tables do not exist yet. You need to run the DDL SQL in Supabase SQL Editor first.');
    console.log('   File: supabase/migrations/20260419_rubro_engine.sql');
    console.log('   Copy ONLY the CREATE TABLE and ALTER TABLE statements (lines 1-80)');
    console.log('   Then rerun this script for the seed data.\n');
    
    // Try building them via a different approach
    console.log('🔄 Attempting to create tables via the internal API route...');
    process.exit(1);
  }

  if (tableCheck) {
    console.log('⚠️  bot_rubros check error (non-critical):', tableCheck.message);
  } else {
    console.log('✅ bot_rubros table exists');
  }

  const r1 = await upsertRubros();
  const r2 = await upsertTools();

  if (r1 && r2) {
    console.log('\n✅ Migration complete!');
  } else {
    console.log('\n⚠️  Migration partially failed — check errors above.');
  }
}

main().catch(console.error);

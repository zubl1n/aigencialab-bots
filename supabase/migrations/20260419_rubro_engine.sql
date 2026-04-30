-- ════════════════════════════════════════════════════════════════
-- MIGRATION: Dynamic Rubro Engine (Agent Versatility)
-- Run in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- 1. Rubros (industry templates)
CREATE TABLE IF NOT EXISTS bot_rubros (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  icon        text DEFAULT '🤖',
  system_prompt_template text NOT NULL,
  tools_allowed          jsonb DEFAULT '[]',
  default_faqs           jsonb DEFAULT '[]',
  metadata               jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- 2. Tool catalog (all possible tools the agent can call)
CREATE TABLE IF NOT EXISTS bot_tools_catalog (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  category    text NOT NULL,       -- 'calendar', 'catalog', 'crm', 'reservation'
  parameters  jsonb NOT NULL,      -- JSON Schema {type:'object', properties:{...}, required:[...]}
  return_schema jsonb DEFAULT '{}',
  is_simulated boolean DEFAULT false, -- true = runs local simulation, false = real API
  created_at  timestamptz DEFAULT now()
);

-- 3. Per-client tool config (which tools enabled + their specific config)
CREATE TABLE IF NOT EXISTS bot_tool_configs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tool_slug   text NOT NULL,
  enabled     boolean DEFAULT true,
  config      jsonb DEFAULT '{}',  -- webhook_url, api_key, calendar_id, etc.
  created_at  timestamptz DEFAULT now(),
  UNIQUE(client_id, tool_slug)
);

-- 4. Tool call audit log (every tool execution recorded)
CREATE TABLE IF NOT EXISTS bot_tool_calls (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid REFERENCES clients(id) ON DELETE SET NULL,
  conversation_id uuid,
  session_id    text,
  tool_slug     text NOT NULL,
  input_params  jsonb DEFAULT '{}',
  output_result jsonb DEFAULT '{}',
  success       boolean DEFAULT true,
  latency_ms    int,
  created_at    timestamptz DEFAULT now()
);

-- 5. Add rubro_slug to bot_configs
ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS rubro_slug text DEFAULT 'general';
ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS tools_enabled jsonb DEFAULT '[]';
ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS model text DEFAULT 'llama-3.1-8b-instant';
ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS temperature float DEFAULT 0.7;
ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS max_tokens int DEFAULT 512;

-- ════════════════════════════════════════════════════════════════
-- SEED: Rubros
-- ════════════════════════════════════════════════════════════════
INSERT INTO bot_rubros (slug, name, icon, description, system_prompt_template, tools_allowed, default_faqs) VALUES

('general', 'General / Atención al Cliente', '💬',
 'Asistente genérico de atención al cliente.',
 E'Eres {{bot_name}}, el asistente virtual de {{company_name}}.\nResponde siempre en español de manera amable y concisa.\nSi no sabes algo, dilo honestamente. No inventes información.\n\n{{faqs_block}}',
 '[]',
 '[]'),

('inmobiliaria', 'Inmobiliaria / Propiedades', '🏠',
 'Agente especializado en captación de leads inmobiliarios y coordinación de visitas.',
 E'Eres {{bot_name}}, agente comercial digital de {{company_name}}, una empresa inmobiliaria.\n\nTU MISIÓN PRINCIPAL: Captar leads calificados y coordinar visitas a propiedades.\n\nCAPACIDADES:\n- Consultar propiedades disponibles por tipo (venta/arriendo), precio y ubicación\n- Verificar disponibilidad de un ejecutivo para visitas\n- Registrar datos del interesado (nombre, email, teléfono, presupuesto)\n- Responder FAQs sobre requisitos de arriendo y venta\n\nCUANDO EL USUARIO MUESTRE INTERÉS EN UNA PROPIEDAD:\n1. Pregunta su presupuesto y preferencias\n2. Muéstrale opciones disponibles [USA consultar_propiedades]\n3. Propón coordinar una visita [USA agendar_visita]\n4. Registra sus datos como lead\n\nREGLAS:\n- Siempre ofrece 2-3 propiedades máximo por vez\n- Si pregunta algo que no sabes, deriva al equipo humano\n- Horario de atención: Lunes a Viernes 9-18h\n\n{{faqs_block}}',
 '["consultar_propiedades","agendar_visita","registrar_lead"]',
 '[{"q":"¿Cuáles son los requisitos para arrendar?","a":"Necesitas 3 últimas liquidaciones de sueldo, DICOM al día y codeudor solidario."},{"q":"¿Tienen propiedades en Las Condes?","a":"Sí, tenemos disponibilidad en Las Condes, Vitacura y Providencia."}]'),

('clinica', 'Clínica Médica / Salud', '🏥',
 'Asistente para clínicas: agendamiento de citas, PAD/convenios y triaje básico.',
 E'Eres {{bot_name}}, asistente digital de {{company_name}}, una clínica médica.\n\nTU MISIÓN: Facilitar el agendamiento de citas y resolver consultas frecuentes de pacientes.\n\nCAPACIDADES:\n- Verificar disponibilidad de médicos y especialidades\n- Agendar, modificar y cancelar citas médicas [agendar_cita]\n- Informar sobre convenios ISAPRE y FONASA\n- Realizar triaje básico (síntomas → especialidad sugerida)\n\nPROTOCOLO DE AGENDAMIENTO:\n1. Preguntar nombre completo y RUT del paciente\n2. Identificar especialidad requerida (si tiene dudas, hacer triaje)\n3. Verificar disponibilidad [verificar_disponibilidad]\n4. Confirmar horario y medios de pago\n5. Enviar confirmación\n\nSITUACIONES DE URGENCIA:\n- Si el paciente describe síntomas graves, deriva INMEDIATAMENTE a urgencias\n- No diagnostica ni prescribe medicamentos\n\n{{faqs_block}}',
 '["verificar_disponibilidad","agendar_cita","consultar_medicos","cancelar_cita"]',
 '[{"q":"¿Tienen convenio con FONASA?","a":"Sí, aceptamos FONASA A, B, C y D en la mayoría de nuestras especialidades."},{"q":"¿Cuántos días de anticipación necesito para agendar?","a":"Puedes agendar desde 1 día hasta 60 días de anticipación según la especialidad."}]'),

('ecommerce', 'Tienda Online / E-commerce', '🛍️',
 'Asistente para tiendas: catálogo, stock, pedidos y soporte post-venta.',
 E'Eres {{bot_name}}, asistente de ventas de {{company_name}}, una tienda online.\n\nTU MISIÓN: Ayudar a los clientes a encontrar productos, completar compras y resolver dudas post-venta.\n\nCAPACIDADES:\n- Buscar productos por nombre, categoría o características\n- Verificar stock disponible en tiempo real\n- Informar precios, descuentos y promociones vigentes\n- Guiar al check-out y resolver dudas de pago\n- Rastrear pedidos existentes\n\nFLUJO DE VENTA:\n1. Entender qué busca el cliente\n2. Consultar catálogo [consultar_catalogo]\n3. Verificar stock [verificar_stock]\n4. Presentar máximo 3 opciones con precio\n5. Guiar al pago: "¿Te gustaría ir al carrito?"\n\nPOLÍTICAS:\n- Despacho: 2-5 días hábiles\n- Cambios: 15 días desde compra con empaque original\n- Garantía: según fabricante\n\n{{faqs_block}}',
 '["consultar_catalogo","verificar_stock","rastrear_pedido","aplicar_descuento"]',
 '[{"q":"¿Hacen despacho a todo Chile?","a":"Sí, despachamos a todo Chile vía Starken o Chilexpress."},{"q":"¿Puedo cambiar un producto?","a":"Sí, tienes 15 días desde la compra para cambios con boleta y empaque original."}]'),

('restaurante', 'Restaurante / Food & Beverage', '🍽️',
 'Asistente para restaurantes: reservas, menú, pedidos y eventos.',
 E'Eres {{bot_name}}, el anfitrión digital de {{company_name}}, un restaurante.\n\nTU MISIÓN: Tomar reservas, presentar el menú y resolver dudas de los comensales.\n\nCAPACIDADES:\n- Consultar disponibilidad de mesas por fecha, hora y número de personas\n- Tomar y confirmar reservas\n- Presentar el menú del día y especialidades\n- Gestionar solicitudes especiales (cumpleaños, alergias, vegetariano)\n- Informar sobre eventos y promociones\n\nFLUJO DE RESERVA:\n1. Preguntar: fecha, hora, número de personas\n2. Verificar disponibilidad [verificar_disponibilidad_mesa]\n3. Registrar datos: nombre, teléfono, solicitudes especiales\n4. Confirmar reserva [crear_reserva]\n5. Recordar: "¿Tienes alguna alergia o requerimiento especial?"\n\nREGLAS:\n- Máximo 12 personas por reserva online (más, llamar directo)\n- Cancelación con al menos 2 horas de anticipación\n\n{{faqs_block}}',
 '["verificar_disponibilidad_mesa","crear_reserva","consultar_menu","cancelar_reserva"]',
 '[{"q":"¿Tienen opciones vegetarianas?","a":"Sí, contamos con menú vegetariano y vegano disponible todos los días."},{"q":"¿Puedo reservar para un evento privado?","a":"Sí, ofrecemos el salón privado para hasta 30 personas. Contáctanos para cotizar."}]'),

('educacion', 'Centro Educativo / Academia', '📚',
 'Asistente para academias: inscripciones, horarios, cursos y consultas académicas.',
 E'Eres {{bot_name}}, el asistente académico de {{company_name}}.\n\nTU MISIÓN: Orientar a estudiantes y apoderados, gestionar inscripciones y resolver consultas.\n\nCAPACIDADES:\n- Informar sobre cursos, programas y requisitos de ingreso\n- Verificar disponibilidad de cupos\n- Gestionar inscripciones y matrículas\n- Informar horarios, precios y modalidades (presencial/online)\n- Derivar consultas académicas al docente correspondiente\n\n{{faqs_block}}',
 '["consultar_cursos","verificar_cupos","registrar_inscripcion"]',
 '[{"q":"¿Entregan certificado al terminar?","a":"Sí, todos nuestros cursos incluyen certificado de participación y aprobación."}]')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  system_prompt_template = EXCLUDED.system_prompt_template,
  tools_allowed = EXCLUDED.tools_allowed,
  default_faqs = EXCLUDED.default_faqs;

-- ════════════════════════════════════════════════════════════════
-- SEED: Tools Catalog
-- ════════════════════════════════════════════════════════════════
INSERT INTO bot_tools_catalog (slug, name, description, category, parameters, is_simulated) VALUES

('consultar_propiedades', 'Consultar Propiedades', 'Busca propiedades disponibles según filtros del usuario', 'catalog',
 '{"type":"object","properties":{"tipo":{"type":"string","enum":["venta","arriendo","ambos"],"description":"Tipo de operación"},"presupuesto_max":{"type":"number","description":"Presupuesto máximo en UF"},"comuna":{"type":"string","description":"Comuna o sector"},"dormitorios":{"type":"number","description":"Número mínimo de dormitorios"},"banos":{"type":"number","description":"Número mínimo de baños"}},"required":["tipo"]}',
 true),

('agendar_visita', 'Agendar Visita a Propiedad', 'Agenda una visita con un ejecutivo inmobiliario', 'calendar',
 '{"type":"object","properties":{"propiedad_id":{"type":"string","description":"ID de la propiedad"},"fecha":{"type":"string","format":"date","description":"Fecha deseada YYYY-MM-DD"},"hora":{"type":"string","description":"Hora en formato HH:MM"},"nombre":{"type":"string"},"email":{"type":"string"},"telefono":{"type":"string"}},"required":["fecha","hora","nombre","email"]}',
 true),

('verificar_disponibilidad', 'Verificar Disponibilidad', 'Consulta disponibilidad para agendar hora médica', 'calendar',
 '{"type":"object","properties":{"especialidad":{"type":"string","description":"Especialidad médica"},"fecha_desde":{"type":"string","format":"date"},"fecha_hasta":{"type":"string","format":"date"},"medico_id":{"type":"string","description":"ID del médico (opcional)"}},"required":["especialidad"]}',
 true),

('agendar_cita', 'Agendar Cita Médica', 'Crea una nueva cita médica para el paciente', 'calendar',
 '{"type":"object","properties":{"especialidad":{"type":"string"},"medico_id":{"type":"string"},"fecha":{"type":"string","format":"date"},"hora":{"type":"string"},"paciente_rut":{"type":"string"},"paciente_nombre":{"type":"string"},"paciente_email":{"type":"string"},"motivo":{"type":"string"}},"required":["especialidad","fecha","hora","paciente_nombre"]}',
 true),

('consultar_medicos', 'Consultar Médicos Disponibles', 'Lista médicos activos por especialidad', 'crm',
 '{"type":"object","properties":{"especialidad":{"type":"string","description":"Especialidad a consultar"}},"required":["especialidad"]}',
 true),

('cancelar_cita', 'Cancelar Cita', 'Cancela una cita médica existente', 'calendar',
 '{"type":"object","properties":{"cita_id":{"type":"string"},"paciente_rut":{"type":"string"},"motivo":{"type":"string"}},"required":["cita_id","paciente_rut"]}',
 true),

('consultar_catalogo', 'Consultar Catálogo', 'Busca productos en el catálogo de la tienda', 'catalog',
 '{"type":"object","properties":{"query":{"type":"string","description":"Término de búsqueda"},"categoria":{"type":"string","description":"Categoría del producto"},"precio_max":{"type":"number","description":"Precio máximo en CLP"},"en_oferta":{"type":"boolean","description":"Solo productos en oferta"}},"required":["query"]}',
 true),

('verificar_stock', 'Verificar Stock', 'Verifica disponibilidad de stock de un producto', 'catalog',
 '{"type":"object","properties":{"producto_id":{"type":"string"},"variante":{"type":"string","description":"Color, talla u otra variante"},"cantidad":{"type":"number","default":1}},"required":["producto_id"]}',
 true),

('rastrear_pedido', 'Rastrear Pedido', 'Consulta el estado de un pedido existente', 'crm',
 '{"type":"object","properties":{"pedido_id":{"type":"string"},"email":{"type":"string","description":"Email del comprador"}},"required":["pedido_id"]}',
 true),

('aplicar_descuento', 'Aplicar Descuento', 'Verifica y aplica un código de descuento', 'catalog',
 '{"type":"object","properties":{"codigo":{"type":"string"},"monto_total":{"type":"number"}},"required":["codigo","monto_total"]}',
 true),

('verificar_disponibilidad_mesa', 'Verificar Disponibilidad de Mesa', 'Consulta disponibilidad de mesas en el restaurante', 'reservation',
 '{"type":"object","properties":{"fecha":{"type":"string","format":"date"},"hora":{"type":"string"},"personas":{"type":"number"},"sector":{"type":"string","enum":["interior","terraza","cualquiera"],"default":"cualquiera"}},"required":["fecha","hora","personas"]}',
 true),

('crear_reserva', 'Crear Reserva', 'Registra una reserva en el restaurante', 'reservation',
 '{"type":"object","properties":{"fecha":{"type":"string","format":"date"},"hora":{"type":"string"},"personas":{"type":"number"},"nombre":{"type":"string"},"telefono":{"type":"string"},"email":{"type":"string"},"sector":{"type":"string"},"solicitudes_especiales":{"type":"string"}},"required":["fecha","hora","personas","nombre"]}',
 true),

('consultar_menu', 'Consultar Menú', 'Obtiene el menú del día o por categoría', 'catalog',
 '{"type":"object","properties":{"categoria":{"type":"string","enum":["entrantes","fondos","postres","bebidas","menu_dia","todo"],"default":"todo"},"solo_disponible":{"type":"boolean","default":true}},"required":[]}',
 true),

('cancelar_reserva', 'Cancelar Reserva', 'Cancela una reserva del restaurante', 'reservation',
 '{"type":"object","properties":{"reserva_id":{"type":"string"},"nombre":{"type":"string"},"telefono":{"type":"string"}},"required":["nombre"]}',
 true),

('registrar_lead', 'Registrar Lead', 'Guarda los datos de contacto de un prospecto', 'crm',
 '{"type":"object","properties":{"nombre":{"type":"string"},"email":{"type":"string"},"telefono":{"type":"string"},"interes":{"type":"string"},"presupuesto":{"type":"string"},"notas":{"type":"string"}},"required":["nombre"]}',
 true),

('consultar_cursos', 'Consultar Cursos', 'Muestra cursos disponibles por área o nivel', 'catalog',
 '{"type":"object","properties":{"area":{"type":"string"},"nivel":{"type":"string","enum":["basico","intermedio","avanzado","todos"],"default":"todos"},"modalidad":{"type":"string","enum":["presencial","online","hibrido","todos"],"default":"todos"}},"required":[]}',
 true),

('verificar_cupos', 'Verificar Cupos', 'Consulta cupos disponibles en un curso', 'catalog',
 '{"type":"object","properties":{"curso_id":{"type":"string"},"fecha_inicio":{"type":"string"}},"required":["curso_id"]}',
 true),

('registrar_inscripcion', 'Registrar Inscripción', 'Registra una solicitud de inscripción a un curso', 'crm',
 '{"type":"object","properties":{"curso_id":{"type":"string"},"nombre":{"type":"string"},"email":{"type":"string"},"telefono":{"type":"string"},"nivel_actual":{"type":"string"},"comentarios":{"type":"string"}},"required":["curso_id","nombre","email"]}',
 true)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  parameters = EXCLUDED.parameters;

-- RLS Policies
ALTER TABLE bot_rubros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rubros_public_read" ON bot_rubros FOR SELECT USING (true);

ALTER TABLE bot_tools_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tools_catalog_public_read" ON bot_tools_catalog FOR SELECT USING (true);

ALTER TABLE bot_tool_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tool_configs_owner" ON bot_tool_configs FOR ALL USING (client_id = auth.uid());

ALTER TABLE bot_tool_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tool_calls_owner" ON bot_tool_calls FOR SELECT USING (client_id = auth.uid());

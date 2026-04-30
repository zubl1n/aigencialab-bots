-- ═══════════════════════════════════════════════════════════════
--  AigenciaLab.cl — Schema inicial Supabase Postgres
--  Ejecutar en: Supabase Dashboard → SQL Editor → New Query
--  Ley N°21.663 (Ciberseguridad) · Ley N°19.628 (Datos personales)
-- ═══════════════════════════════════════════════════════════════

-- ── Extensiones ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. LEADS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company         text,
  contact_name    text,
  url             text,
  rubro           text,
  whatsapp        text,
  email           text,
  score           integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  tier            text DEFAULT 'cold' CHECK (tier IN ('cold','warm','hot')),
  prob            integer DEFAULT 0,
  psi_data        jsonb,
  seo_data        jsonb,
  notes           text,
  source          text DEFAULT 'audit' CHECK (source IN ('audit','manual','whatsapp','landing')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 2. CLIENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company         text NOT NULL,
  rubro           text,
  contact_name    text,
  whatsapp        text,
  email           text,
  url             text,
  logo_url        text,
  faqs            jsonb DEFAULT '[]'::jsonb,
  products        jsonb DEFAULT '[]'::jsonb,
  channels        jsonb DEFAULT '{"whatsapp":false,"web":false,"email":false}'::jsonb,
  plan            text DEFAULT 'starter' CHECK (plan IN ('starter','advanced','enterprise')),
  status          text DEFAULT 'onboarding' CHECK (status IN ('active','onboarding','paused','churned')),
  wa_phone_id     text,
  wa_token_enc    text,
  config          jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 3. CONVERSATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE,
  channel         text DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp','web','email')),
  contact_wa      text,
  contact_name    text,
  status          text DEFAULT 'open' CHECK (status IN ('open','resolved','needs_human')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 4. MESSAGES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  direction       text CHECK (direction IN ('in','out')),
  content         text NOT NULL,
  wa_message_id   text,
  read            boolean DEFAULT false,
  metadata        jsonb DEFAULT '{}'::jsonb,
  timestamp       timestamptz DEFAULT now()
);

-- ── 5. TICKETS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       uuid REFERENCES clients(id) ON DELETE SET NULL,
  ticket_num      text UNIQUE,
  company         text,
  issue           text NOT NULL,
  priority        text DEFAULT 'medio' CHECK (priority IN ('critico','alto','medio','bajo')),
  status          text DEFAULT 'Abierto' CHECK (status IN ('Abierto','En progreso','Esperando cliente','Resuelto')),
  assigned_to     text,
  channel         text DEFAULT 'WhatsApp',
  notes           text,
  sla_deadline    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── 6. ALERTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       uuid REFERENCES clients(id) ON DELETE CASCADE,
  type            text NOT NULL,
  title           text NOT NULL,
  detail          text,
  dismissed       boolean DEFAULT false,
  wa_text         text,
  created_at      timestamptz DEFAULT now()
);

-- ── 7. AUDIT_LOGS (Ley 21.663) ───────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event           text NOT NULL,
  module          text,
  user_id         uuid,
  ip_hash         text,
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now()
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_dismissed ON alerts(dismissed);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event, created_at DESC);

-- ── Triggers: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated    BEFORE UPDATE ON leads    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated  BEFORE UPDATE ON clients  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_convs_updated    BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated  BEFORE UPDATE ON tickets  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Ticket auto-number ────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1001;
CREATE OR REPLACE FUNCTION set_ticket_num()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_num IS NULL THEN
    NEW.ticket_num := 'TKT-' || nextval('ticket_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_ticket_num BEFORE INSERT ON tickets FOR EACH ROW EXECUTE FUNCTION set_ticket_num();

-- ── Row Level Security (RLS) ──────────────────────────────────
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- Política: acceso solo con service_role (server-side) o usuario autenticado
-- Las API routes usan supabaseAdmin (service_role) → bypass RLS
-- Para el dashboard protegido usaremos session de Supabase Auth

-- ── Seed de datos de prueba ───────────────────────────────────
INSERT INTO leads (company, contact_name, url, rubro, whatsapp, email, score, tier, prob, source, notes) VALUES
  ('RetailSur SpA',   'María González',  'https://retailsur.cl',   'ecommerce_retail', '+56987654321', 'maria@retailsur.cl',  87, 'hot',  82, 'audit',   'Completó auditoría real · LCP: 3.2s'),
  ('ClinicaPro Ltda', 'Dr. Ana Martínez','https://clinicapro.cl',  'clinica',          '+56976543210', 'ana@clinicapro.cl',   74, 'hot',  68, 'manual',  'Interés en agendamiento IA'),
  ('LogiFast Chile',  'Carlos Herrera',  'https://logifast.cl',    'courier',          '+56965432109', 'carlos@logifast.cl',  55, 'warm', 44, 'whatsapp','Consultó por tracking WhatsApp'),
  ('Moda Urbana',     'Sofia Torres',    'https://modaurbana.cl',  'ecommerce_moda',   '+56954321098', 'sofia@modaurbana.cl', 48, 'warm', 38, 'audit',   'Score real: sin WhatsApp visible'),
  ('AgriSur SA',      'Pedro Fuentes',   'https://agrisur.cl',     'manufactura',      '+56943210987', '',                    30, 'cold', 18, 'landing', 'Descargó brochure desde landing');

INSERT INTO clients (company, rubro, contact_name, whatsapp, email, url, plan, status, faqs, config) VALUES
  ('RetailSur SpA', 'ecommerce_retail', 'María González', '+56987654321', 'maria@retailsur.cl', 'https://retailsur.cl', 'advanced', 'active',
   '[{"q":"¿Hacen envíos a todo Chile?","a":"Sí, despacho en 2-5 días hábiles."},{"q":"¿Cuáles son los métodos de pago?","a":"Tarjeta, transferencia y MercadoPago."}]'::jsonb,
   '{"agent_name":"Nova","tone":"amigable","escalate_keyword":"humano"}'::jsonb);

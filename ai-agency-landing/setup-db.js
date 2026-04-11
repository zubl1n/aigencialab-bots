const https = require('https');

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

// Each SQL statement separately
const statements = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  
  `CREATE TABLE IF NOT EXISTS leads (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company text, contact_name text, url text, rubro text,
    whatsapp text, email text,
    score integer DEFAULT 0, tier text DEFAULT 'cold',
    prob integer DEFAULT 0, psi_data jsonb, seo_data jsonb,
    notes text, source text DEFAULT 'audit',
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company text NOT NULL, rubro text, contact_name text,
    whatsapp text, email text, url text, logo_url text,
    faqs jsonb DEFAULT '[]', products jsonb DEFAULT '[]',
    channels jsonb DEFAULT '{}', plan text DEFAULT 'starter',
    status text DEFAULT 'onboarding', wa_phone_id text, wa_token_enc text,
    config jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    channel text DEFAULT 'whatsapp', contact_wa text, contact_name text,
    status text DEFAULT 'open',
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
    direction text, content text NOT NULL,
    wa_message_id text, read boolean DEFAULT false,
    metadata jsonb DEFAULT '{}', timestamp timestamptz DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
    ticket_num text UNIQUE, company text, issue text NOT NULL,
    priority text DEFAULT 'medio', status text DEFAULT 'Abierto',
    assigned_to text, channel text DEFAULT 'WhatsApp',
    notes text, sla_deadline timestamptz,
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS alerts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    type text NOT NULL, title text NOT NULL, detail text,
    dismissed boolean DEFAULT false, wa_text text,
    created_at timestamptz DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    event text NOT NULL, module text, user_id uuid,
    ip_hash text, metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE leads ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE clients ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE conversations ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE messages ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE tickets ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE alerts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`,

  // RLS policies: allow service_role full access, allow anon INSERT on leads (for audit form)
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON leads FOR ALL USING (true) WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "anon_insert_leads" ON leads FOR INSERT WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON clients FOR ALL USING (true) WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON conversations FOR ALL USING (true) WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON messages FOR ALL USING (true) WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON tickets FOR ALL USING (true) WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON alerts FOR ALL USING (true) WITH CHECK (true)`,
  `CREATE POLICY IF NOT EXISTS "service_role_all" ON audit_logs FOR ALL USING (true) WITH CHECK (true)`,
];

// Execute each via the Supabase pg endpoint
async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const url = new URL(SUPABASE_URL + '/pg/query');
    const options = {
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'x-connection-encrypted': 'true'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const label = sql.substring(0, 60).replace(/\n/g, ' ');
    try {
      const r = await runSQL(sql);
      if (r.status < 300) {
        console.log('✅ ' + (i+1) + '/' + statements.length + ': ' + label);
      } else {
        console.log('⚠️ ' + (i+1) + ' status=' + r.status + ': ' + label);
        console.log('   ' + r.body.substring(0, 200));
      }
    } catch (e) {
      console.log('❌ ' + (i+1) + ': ' + e.message);
    }
  }
  
  // Insert seed data
  console.log('\n--- Inserting seed data ---');
  const seedSQL = `INSERT INTO leads (company, contact_name, url, rubro, whatsapp, email, score, tier, prob, source, notes) VALUES
    ('RetailSur SpA', 'Maria Gonzalez', 'https://retailsur.cl', 'ecommerce_retail', '+56987654321', 'maria@retailsur.cl', 87, 'hot', 82, 'audit', 'Score alto'),
    ('ClinicaPro Ltda', 'Dr. Ana Martinez', 'https://clinicapro.cl', 'clinica', '+56976543210', 'ana@clinicapro.cl', 74, 'hot', 68, 'manual', 'Agendamiento IA'),
    ('LogiFast Chile', 'Carlos Herrera', 'https://logifast.cl', 'courier', '+56965432109', 'carlos@logifast.cl', 55, 'warm', 44, 'whatsapp', 'Tracking'),
    ('Moda Urbana', 'Sofia Torres', 'https://modaurbana.cl', 'ecommerce_moda', '+56954321098', 'sofia@modaurbana.cl', 48, 'warm', 38, 'audit', 'Sin WhatsApp'),
    ('AgriSur SA', 'Pedro Fuentes', '', 'manufactura', '+56943210987', '', 30, 'cold', 18, 'landing', 'Brochure')
    ON CONFLICT DO NOTHING`;
  const r1 = await runSQL(seedSQL);
  console.log(r1.status < 300 ? '✅ Seed leads inserted' : '⚠️ Seed: ' + r1.body.substring(0, 200));
  
  const clientSQL = `INSERT INTO clients (company, rubro, contact_name, whatsapp, email, url, plan, status) VALUES
    ('RetailSur SpA', 'ecommerce_retail', 'Maria Gonzalez', '+56987654321', 'maria@retailsur.cl', 'https://retailsur.cl', 'advanced', 'active')
    ON CONFLICT DO NOTHING`;
  const r2 = await runSQL(clientSQL);
  console.log(r2.status < 300 ? '✅ Seed client inserted' : '⚠️ Client: ' + r2.body.substring(0, 200));
  
  console.log('\nDone!');
})();

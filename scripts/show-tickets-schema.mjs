// Get complete column list from information_schema via Supabase REST
const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';
const h = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` };

const r = await fetch(
  `${SUPABASE_URL}/rest/v1/information_schema.columns?table_schema=eq.public&table_name=eq.tickets&select=column_name,data_type,is_nullable,column_default&order=ordinal_position`,
  { headers: h }
);
const cols = await r.json();
console.log('tickets table actual columns:');
for (const c of cols) {
  console.log(`  ${c.column_name.padEnd(25)} ${c.data_type.padEnd(20)} default: ${c.column_default ?? 'NULL'}`);
}

// Also check tickets_messages
const r2 = await fetch(
  `${SUPABASE_URL}/rest/v1/information_schema.columns?table_schema=eq.public&table_name=eq.ticket_messages&select=column_name,data_type&order=ordinal_position`,
  { headers: h }
);
const cols2 = await r2.json();
console.log('\nticket_messages columns:', cols2.map(c => c.column_name).join(', '));

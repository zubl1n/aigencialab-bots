// Check what columns tickets table actually has, and add missing ones
const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI';

const h = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function main() {
  // Fetch one row to see what columns exist
  const r = await fetch(`${SUPABASE_URL}/rest/v1/tickets?limit=1`, { headers: h });
  const data = await r.json();
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('Existing ticket columns:', Object.keys(data[0]).join(', '));
  } else {
    console.log('No tickets yet, empty table. Status:', r.status);
    // Try to get schema from a SELECT with known columns
    const r2 = await fetch(
      `${SUPABASE_URL}/rest/v1/tickets?select=id,subject,status,priority,created_at,updated_at&limit=1`,
      { headers: h }
    );
    const d2 = await r2.json();
    console.log('Basic select status:', r2.status, JSON.stringify(d2));
  }

  // Test which specific columns are missing by trying to select them
  const testCols = ['message', 'admin_response', 'resolved_at', 'unread_client', 'unread_admin'];
  for (const col of testCols) {
    const rt = await fetch(`${SUPABASE_URL}/rest/v1/tickets?select=${col}&limit=0`, { headers: h });
    const dt = await rt.json();
    if (rt.ok) {
      console.log(`✅ Column '${col}' EXISTS`);
    } else {
      console.log(`❌ Column '${col}' MISSING:`, dt?.message?.slice(0, 60));
    }
  }
}

main().catch(e => console.error(e.message));

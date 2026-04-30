/**
 * apply-migration-supabase-sdk.mjs
 * Usa @supabase/supabase-js con service_role para crear tablas
 * ejecutando cada statement via la función stored procedure si existe,
 * o via PostgreSQL directamente usando pg driver si está disponible.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzODcxNywiZXhwIjoyMDkxNDE0NzE3fQ.6i4tf8Pl5GphWyM-FNg_v0lVM6cnCP6ErEvBaYx4-RI'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// Test connection by checking existing tables
console.log('🔌 Testing Supabase connection...')
const { data: tables, error: tablesErr } = await supabase
  .from('clients')
  .select('id')
  .limit(1)

if (tablesErr && tablesErr.code !== 'PGRST116') {
  console.error('❌ Connection failed:', tablesErr.message)
  process.exit(1)
}
console.log('✅ Connected to Supabase\n')

// Check if conversation_stats already exists
const { data: existing } = await supabase
  .from('conversation_stats')
  .select('id')
  .limit(1)

if (existing !== null) {
  console.log('ℹ️  conversation_stats table already exists')
} else {
  console.log('📋 conversation_stats table needs to be created')
  console.log('\n⚠️  Supabase REST API cannot run DDL directly.')
  console.log('   Please run SUPABASE_MIGRATION_READY.sql in the SQL Editor:')
  console.log('   → https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new\n')
}

// Check alerts table
const { data: alertsExisting } = await supabase
  .from('alerts')
  .select('id')
  .limit(1)

if (alertsExisting !== null) {
  console.log('ℹ️  alerts table already exists')
  
  // Try to add missing columns by inserting a test row (will reveal schema)
  const { error: insertErr } = await supabase
    .from('alerts')
    .insert({
      type: 'info',
      title: '_migration_test',
      status: 'resolved',
      dismissed: true,
      resolved_at: new Date().toISOString(),
    })
    .select()
  
  if (insertErr) {
    if (insertErr.message.includes('status') || insertErr.message.includes('resolved_at')) {
      console.log('⚠️  alerts table missing columns (status/resolved_at)')
      console.log('   → Run SUPABASE_MIGRATION_READY.sql to add them')
    } else if (insertErr.code === '23503') {
      // FK violation ok (no client_id) - table exists and has columns
      console.log('✅ alerts table schema looks correct')
    } else {
      console.log(`   Schema check: ${insertErr.message}`)
    }
  } else {
    // Clean up test row
    await supabase.from('alerts').delete().eq('title', '_migration_test')
    console.log('✅ alerts table schema verified (status + resolved_at columns exist)')
  }
} else {
  console.log('📋 alerts table needs to be created')
}

// Check audit_logs
const { data: auditExisting } = await supabase
  .from('audit_logs')
  .select('module')
  .limit(1)

if (auditExisting !== null) {
  console.log('✅ audit_logs table exists with module column')
} else {
  console.log('ℹ️  audit_logs check (table may exist without module column)')
}

console.log('\n✅ Schema check complete.')

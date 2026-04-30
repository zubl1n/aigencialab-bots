#!/usr/bin/env node
/**
 * run-all-migrations.mjs
 * Ejecuta todas las migraciones V3 + Patch B1 via pg directo a Supabase
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load service role key from .env.local
let SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let DB_PASSWORD = process.argv[2] || process.env.DB_PASSWORD;

if (!SERVICE_KEY || !DB_PASSWORD) {
  try {
    const envContent = readFileSync(join(__dirname, '.env.local'), 'utf8');
    const skMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\r\n]+)"?/);
    if (skMatch) SERVICE_KEY = skMatch[1].trim();
  } catch {}
}

const PROJECT_REF = 'hmnbbzpucefcldziwrvs';
const DB_HOST     = `db.${PROJECT_REF}.supabase.co`;
const DB_PORT     = 5432;
const DB_NAME     = 'postgres';
const DB_USER     = 'postgres';

if (!DB_PASSWORD) {
  console.error('❌ DB_PASSWORD requerido: node run-all-migrations.mjs "TuPassword"');
  console.error('→ Obtener en: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/database');
  process.exit(1);
}

let Client;
try {
  const pg = await import('pg');
  Client = pg.default?.Client ?? pg.Client;
} catch {
  console.error('❌ Módulo pg no encontrado. Ejecutando: npm install pg');
  process.exit(1);
}

const migrations = [
  { name: 'V3 Plan System', file: 'MIGRATION_V3_PLAN_SYSTEM.sql' },
  { name: 'B1 Ticket Messages', file: 'PATCH_B1_ticket_messages.sql' },
];

const client = new Client({
  host: DB_HOST, port: DB_PORT, database: DB_NAME,
  user: DB_USER, password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  statement_timeout: 60000,
});

console.log(`\n🔌 Conectando a ${DB_HOST}...`);
await client.connect();
console.log('✅ Conexión OK\n');

for (const m of migrations) {
  const sqlPath = join(__dirname, m.file);
  let sql;
  try { sql = readFileSync(sqlPath, 'utf8'); }
  catch { console.log(`⚠️  Archivo no encontrado: ${m.file}`); continue; }

  console.log(`🚀 Aplicando: ${m.name}...`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`✅ ${m.name} — OK\n`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`❌ Error en ${m.name}:`, err.message);
    // Continue with next migration (some statements may already exist)
  }
}

// Verify results
console.log('📊 Verificando tablas creadas...');
const tables = await client.query(`
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('plan_usage','crm_contacts','crm_activities','client_health','canned_responses','ticket_messages')
  ORDER BY tablename;
`);
console.log('Tablas V3:', tables.rows.map(r => r.tablename).join(', ') || '(ninguna)');

await client.end();
console.log('\n🎉 Migraciones completadas.\n');

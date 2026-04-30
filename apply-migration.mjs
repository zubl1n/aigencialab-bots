#!/usr/bin/env node
/**
 * apply-migration.mjs
 *
 * Aplica la migración más reciente de AIgenciaLab a Supabase producción.
 * Archivo objetivo: 20260414120000_fase1_schema_fix_final.sql
 *
 * USO:
 *   node apply-migration.mjs <DB_PASSWORD>
 *   node apply-migration.mjs "miPassword123!"
 *
 * O con variable de entorno:
 *   $env:DB_PASSWORD="miPassword123!"; node apply-migration.mjs
 *
 * OBTENER EL PASSWORD:
 *   https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/settings/database
 *   → Sección "Database password" → Reset o copiar
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'hmnbbzpucefcldziwrvs';
const DB_HOST     = `db.${PROJECT_REF}.supabase.co`;
const DB_PORT     = 5432;
const DB_NAME     = 'postgres';
const DB_USER     = 'postgres';

const dbPassword = process.argv[2] || process.env.DB_PASSWORD;

if (!dbPassword) {
  console.error(`
❌ Falta el DB password.

CÓMO OBTENERLO:
  https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database
  → Sección "Database password" → botón "Reset" si no lo recuerdas

LUEGO ejecutar:
  node apply-migration.mjs "TuPasswordAqui"

O en PowerShell:
  $env:DB_PASSWORD="TuPassword"; node apply-migration.mjs
`);
  process.exit(1);
}

// ── dynamic import de pg ──────────────────────────────────────────────────────
let Client;
try {
  const pg = await import('pg');
  Client = pg.default?.Client ?? pg.Client;
} catch {
  console.error('❌ Módulo `pg` no encontrado. Ejecuta: npm install pg');
  process.exit(1);
}

// ── leer el migration más reciente ───────────────────────────────────────────
const MIGRATION_FILE = '20260414120000_fase1_schema_fix_final.sql';
const migrationPath  = join(__dirname, 'supabase', 'migrations', MIGRATION_FILE);

let sqlMain;
try {
  sqlMain = readFileSync(migrationPath, 'utf8');
} catch {
  console.error(`❌ No se encontró: ${migrationPath}`);
  process.exit(1);
}

// ── SQL extra: set admin role para el primer usuario (recomendado) ────────────
const sqlSetAdmin = `
-- Stampa role=admin en el primer usuario registrado (el dueño del sistema)
-- Ajusta el email si es necesario
DO $$
DECLARE
  admin_email TEXT := (SELECT email FROM auth.users ORDER BY created_at ASC LIMIT 1);
BEGIN
  IF admin_email IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
    WHERE email = admin_email
      AND (raw_app_meta_data->>'role') IS DISTINCT FROM 'admin';

    RAISE NOTICE 'Admin role set for: %', admin_email;
  END IF;
END $$;
`;

// ── conexión ─────────────────────────────────────────────────────────────────
const client = new Client({
  host:                   DB_HOST,
  port:                   DB_PORT,
  database:               DB_NAME,
  user:                   DB_USER,
  password:               dbPassword,
  ssl:                    { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  statement_timeout:       60000,
});

console.log(`\n🔌 Conectando a ${DB_HOST}...`);

try {
  await client.connect();
  console.log('✅ Conexión exitosa\n');

  // ── 1. Aplicar migración principal ─────────────────────────────────────────
  console.log(`🚀 Aplicando migración: ${MIGRATION_FILE}...\n`);
  await client.query('BEGIN');
  try {
    await client.query(sqlMain);
    await client.query('COMMIT');
    console.log('✅ Migración principal aplicada\n');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }

  // ── 2. Setear admin role (recomendado) ─────────────────────────────────────
  console.log('👑 Configurando role=admin para el primer usuario...');
  await client.query('BEGIN');
  try {
    await client.query(sqlSetAdmin);
    await client.query('COMMIT');
    console.log('✅ Admin role configurado\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.warn('⚠  No se pudo setear admin role (continúa):', err.message, '\n');
  }

  // ── 3. Verificación de estado ──────────────────────────────────────────────
  console.log('📊 Verificando estado de la BD...\n');

  const counts = await client.query(`
    SELECT
      (SELECT count(*) FROM public.clients)::int          AS clients,
      (SELECT count(*) FROM public.api_keys)::int         AS api_keys,
      (SELECT count(*) FROM public.bot_configs)::int      AS bot_configs,
      (SELECT count(*) FROM public.subscriptions)::int    AS subscriptions,
      (SELECT count(*) FROM public.billing_profiles)::int AS billing_profiles;
  `);

  const triggers = await client.query(`
    SELECT tgname FROM pg_trigger
    WHERE tgname IN ('on_client_created_bootstrap','on_auth_user_created')
    ORDER BY tgname;
  `);

  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='clients'
      AND column_name IN ('company_name','trial_ends_at','payment_status','tenant_id')
    ORDER BY column_name;
  `);

  const adminUser = await client.query(`
    SELECT email, raw_app_meta_data->>'role' AS role
    FROM auth.users
    WHERE raw_app_meta_data->>'role' = 'admin'
    LIMIT 3;
  `);

  // Tabla de conteos
  console.log('┌─────────────────────┬────────┐');
  console.log('│ Tabla               │ Filas  │');
  console.log('├─────────────────────┼────────┤');
  Object.entries(counts.rows[0]).forEach(([table, count]) => {
    console.log(`│ ${table.padEnd(19)} │ ${String(count).padEnd(6)} │`);
  });
  console.log('└─────────────────────┴────────┘\n');

  console.log('🔔 Triggers activos:');
  if (triggers.rows.length === 0) {
    console.log('   ⚠  Ninguno encontrado — verifica manualmente');
  } else {
    triggers.rows.forEach(r => console.log(`   ✅ ${r.tgname}`));
  }

  console.log('\n📋 Columnas en clients:');
  console.log('  ', cols.rows.map(r => r.column_name).join(', ') || '(ninguna requerida encontrada)');

  console.log('\n👑 Usuarios admin:');
  if (adminUser.rows.length === 0) {
    console.log('   ⚠  Ninguno — configura manualmente en Supabase Dashboard');
    console.log(`   → https://supabase.com/dashboard/project/${PROJECT_REF}/auth/users`);
  } else {
    adminUser.rows.forEach(r => console.log(`   ✅ ${r.email} (role=${r.role})`));
  }

  console.log('\n🎉 Todo listo. La base de datos está actualizada.\n');

} catch (err) {
  console.error('\n❌ Error durante la migración:');
  console.error(err.message);
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    console.error('\n💡 Verifica el DB password y que el host sea accesible.');
    console.error(`   Host: ${DB_HOST}`);
  }
  if (err.code === '42703') {
    console.error('\n💡 Error de columna — la migración puede ya estar parcialmente aplicada (seguro re-ejecutar).');
  }
  process.exit(1);
} finally {
  await client.end();
}

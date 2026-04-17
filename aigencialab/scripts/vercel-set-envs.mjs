/**
 * scripts/vercel-set-envs.mjs
 * Uses Vercel REST API to upsert env vars cleanly (no trailing newlines).
 * Reads the Vercel token from the local ~/.config/vercel/auth.json
 */
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Read Vercel token from local auth config
function getToken() {
  const paths = [
    join(homedir(), 'AppData', 'Roaming', 'com.vercel.cli', 'Data', 'auth.json'),
    join(homedir(), '.config', 'vercel', 'auth.json'),
    join(process.env.APPDATA ?? '', 'com.vercel.cli', 'Data', 'auth.json'),
    join(process.env.APPDATA ?? '', 'vercel', 'auth.json'),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      const json = JSON.parse(readFileSync(p, 'utf-8'));
      return json.token;
    }
  }
  return null;
}

const PROJECT_ID = 'prj_XbCl7aJDC44S6A4eVk88gzHhHMaL';
const TEAM_ID    = 'team_PlDRO1wX40blKfH3Bk3UfoBH';

const VARS = [
  { key: 'MP_PLAN_ID_BASIC',   value: '5bb6d59c25ae4e49b367893c34ba5e57' },
  { key: 'MP_PLAN_ID_STARTER', value: 'aee893642ffc4c76a794c98207417486' },
  { key: 'MP_PLAN_ID_PRO',     value: 'f63d26863e8f4a6796cc58738a80cc7a' },
  { key: 'RESEND_API_KEY',     value: 're_DJk8KEDA_13j4ioC6F2wDrgBsCCJT4GUz' },
  { key: 'MP_WEBHOOK_SECRET',  value: 'aigencialab_mp_webhook_2026' },
];

const TARGET = ['production', 'preview', 'development'];

async function upsertEnv(token, key, value) {
  const base = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`;
  
  // First, list existing to find IDs
  const listRes = await fetch(base, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const existing = (listData.envs ?? []).filter(e => e.key === key);

  // Delete existing ones
  for (const env of existing) {
    await fetch(
      `https://api.vercel.com/v10/projects/${PROJECT_ID}/env/${env.id}?teamId=${TEAM_ID}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`  ✗ Deleted ${key} (${env.target})`);
  }

  // Create fresh with all targets
  const createRes = await fetch(base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,          // exact string — no trailing newline
      type: 'plain',
      target: TARGET,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(createData.error?.message ?? JSON.stringify(createData));
  }
  return createData;
}

async function main() {
  const token = getToken();
  if (!token) {
    console.error('❌ No Vercel token found. Run: vercel login');
    process.exit(1);
  }
  console.log('🔑 Token found. Upserting env vars...\n');

  for (const { key, value } of VARS) {
    try {
      await upsertEnv(token, key, value);
      console.log(`✅ ${key} = ${value.slice(0, 8)}... → [production, preview, development]`);
    } catch (e) {
      console.error(`❌ ${key}: ${e.message}`);
    }
  }
  console.log('\n✅ Done. Trigger a redeploy to apply new envs.');
}

main().catch(e => { console.error(e); process.exit(1); });

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

function getToken() {
  const p = join(homedir(), 'AppData', 'Roaming', 'com.vercel.cli', 'Data', 'auth.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')).token : null;
}

const PROJECT_ID = 'prj_XbCl7aJDC44S6A4eVk88gzHhHMaL';
const TEAM_ID    = 'team_PlDRO1wX40blKfH3Bk3UfoBH';
const token = getToken();
const BASE = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`;

// The CORRECT, clean value — no trailing \r\n
const SITE_URL = 'https://aigencialab.cl';

async function main() {
  console.log(`🔧 Fixing NEXT_PUBLIC_SITE_URL → exact value: "${SITE_URL}" (${SITE_URL.length} chars)\n`);

  // 1. List all envs to find IDs for NEXT_PUBLIC_SITE_URL
  const listRes = await fetch(BASE, { headers: { Authorization: `Bearer ${token}` } });
  const { envs } = await listRes.json();
  const existing = envs.filter(e => e.key === 'NEXT_PUBLIC_SITE_URL');

  console.log(`Found ${existing.length} existing entries for NEXT_PUBLIC_SITE_URL:`);
  for (const e of existing) {
    console.log(`  id=${e.id} target=[${e.target}] type=${e.type}`);
    // Delete it
    const del = await fetch(
      `https://api.vercel.com/v10/projects/${PROJECT_ID}/env/${e.id}?teamId=${TEAM_ID}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`  ✗ Deleted → ${del.status}`);
  }

  // 2. Create clean value for all targets
  const createRes = await fetch(BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'NEXT_PUBLIC_SITE_URL',
      value: SITE_URL,         // EXACT clean string — no newlines
      type: 'plain',
      target: ['production', 'preview', 'development'],
    }),
  });
  const created = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Create failed: ${JSON.stringify(created)}`);
  }
  console.log(`\n✅ NEXT_PUBLIC_SITE_URL set to "${SITE_URL}" on [production, preview, development]`);

  // 3. Verify by pulling and checking length
  console.log('\n🔍 Verifying...');
  const verifyRes = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const { envs: newEnvs } = await verifyRes.json();
  const found = newEnvs.filter(e => e.key === 'NEXT_PUBLIC_SITE_URL');
  for (const e of found) {
    console.log(`  Found: id=${e.id} target=[${e.target}] type=${e.type}`);
  }
  console.log('\n✅ Done. Trigger redeploy to apply.');
}

main().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });

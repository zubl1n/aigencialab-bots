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

// Fetch all env vars
const res = await fetch(
  `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&decrypt=true&limit=50`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const { envs } = await res.json();

// Show the relevant ones
const keys = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL', 'MP_PLAN_ID_BASIC','MP_PLAN_ID_STARTER','MP_PLAN_ID_PRO','RESEND_API_KEY','MP_ACCESS_TOKEN','MP_WEBHOOK_SECRET'];
console.log('=== Vercel Env Vars (decrypted) ===\n');
for (const e of envs) {
  if (keys.includes(e.key)) {
    // Show exact value with escape chars visible
    const raw = e.value ?? '';
    const hasNewline = raw.includes('\n') || raw.includes('\r');
    const hasTailingSlash = raw.endsWith('/');
    console.log(`${e.key.padEnd(32)} [${e.target.join(',')}]`);
    console.log(`  value (${raw.length} chars): "${raw.replace(/\n/g,'\\n').replace(/\r/g,'\\r')}"`);
    if (hasNewline)      console.log(`  ⚠️  TRAILING NEWLINE DETECTED`);
    if (hasTailingSlash) console.log(`  ⚠️  TRAILING SLASH DETECTED`);
    console.log();
  }
}

/**
 * scripts/fix-vercel-envs.mjs
 * Removes and re-adds env vars that may have trailing newlines from echo-pipe.
 * Uses the Vercel CLI programmatically via child_process.
 */
import { execSync } from 'child_process';

const VARS = [
  ['MP_PLAN_ID_BASIC',    '5bb6d59c25ae4e49b367893c34ba5e57'],
  ['MP_PLAN_ID_STARTER',  'aee893642ffc4c76a794c98207417486'],
  ['MP_PLAN_ID_PRO',      'f63d26863e8f4a6796cc58738a80cc7a'],
  ['RESEND_API_KEY',      're_DJk8KEDA_13j4ioC6F2wDrgBsCCJT4GUz'],
  ['MP_WEBHOOK_SECRET',   'aigencialab_mp_webhook_2026'],
];

const ENVS = ['production', 'preview', 'development'];

for (const [key, value] of VARS) {
  console.log(`\n→ Processing ${key}`);
  
  // Remove from all environments (ignore errors if not exists)
  for (const env of ENVS) {
    try {
      execSync(`vercel env rm ${key} ${env} --yes`, { stdio: 'pipe' });
      console.log(`  ✓ Removed from ${env}`);
    } catch {
      console.log(`  ⚡ Not in ${env} (skip)`);
    }
  }

  // Re-add clean value to all 3 environments in one command
  // Write value to temp file to avoid shell escaping/newline issues
  const fs = await import('fs');
  const tmpFile = `tmp_env_${key}.txt`;
  fs.writeFileSync(tmpFile, value, { encoding: 'utf8' }); // no newline
  
  try {
    execSync(`vercel env add ${key} production < ${tmpFile}`, { stdio: 'pipe' });
    execSync(`vercel env add ${key} preview < ${tmpFile}`, { stdio: 'pipe' });
    execSync(`vercel env add ${key} development < ${tmpFile}`, { stdio: 'pipe' });
    console.log(`  ✅ Added ${key} = ${value.slice(0, 8)}...`);
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

console.log('\n✅ All done. Run: vercel redeploy <url> to apply.');

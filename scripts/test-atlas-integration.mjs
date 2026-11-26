// Builds and starts a local app with synthetic Supabase/OpenAI services.
// No real user data or credentials are sent; this overwrites the local .next build.
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const port = 43191;
const base = `http://127.0.0.1:${port}`;
const fakeToken = 'a'.repeat(64), fakeSecret = 'b'.repeat(64);
const env = { ...process.env, NEXT_PUBLIC_SUPABASE_URL:'http://mock-supabase.local', NEXT_PUBLIC_SUPABASE_ANON_KEY:'mock-anon',
  SUPABASE_SERVICE_ROLE_KEY:'mock-service', OPENAI_API_KEY:'mock-key', PRELAUNCH_PREVIEW:'true', PRELAUNCH_MODE:'true',
  PRELAUNCH_ADMIN_TOKEN:fakeToken, PRELAUNCH_SESSION_SECRET:fakeSecret, ATLAS_GENERATION_ENABLED:'true',
  ATLAS_GENERATION_MODEL:'mock-model', ATLAS_GENERATION_PAID_DAILY_LIMIT:'2' };
function run(cmd, args, options = {}) {
  return new Promise((ok, fail) => {
    const proc = spawn(cmd, args, { env, stdio: 'inherit', ...options });
    proc.once('error', fail); proc.once('exit', code => code === 0 ? ok() : fail(new Error(`${cmd} failed: ${code}`)));
  });
}
await run('pnpm', ['exec','next','build']);
const server = spawn('pnpm', ['exec','next','start','-H','127.0.0.1','-p',String(port)], {
  env: { ...env, NODE_OPTIONS:`--require=${resolve('tests/support/mock-atlas-services.cjs')}` }, stdio:'ignore'
});
try {
  let ready = false;
  for (let i=0; i<40; i++) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${server.exitCode}`);
    try { await fetch(base); ready = true; break; } catch { await delay(250); }
  }
  if (!ready) throw new Error('Test server did not start');
  const auth = await fetch(`${base}/api/prelaunch/session`, {method:'POST',redirect:'manual',
    headers:{'Origin':`https://127.0.0.1:${port}`,'Content-Type':'application/x-www-form-urlencoded'},body:`token=${fakeToken}`});
  assert.equal(auth.status,303);
  const cookie = auth.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  async function post(payload, authorized = true, token = 'valid-test-token') {
    return fetch(`${base}/api/atlas/study-materials`, {method:'POST',headers:{cookie,'content-type':'application/json',...(authorized ? {authorization:`Bearer ${token}`} : {})},body:JSON.stringify(payload)});
  }
  async function reserveQuestion(authorized = true) {
    return fetch(`${base}/api/atlas/reserve-question`, {method:'POST',headers:{cookie,...(authorized ? {authorization:'Bearer valid-test-token'} : {})}});
  }
  const notes = {notes:'Synthetic study notes for testing.',confirmed:true};
  assert.equal((await post(notes,false)).status,401);
  assert.equal((await reserveQuestion(false)).status,401);
  assert.equal((await post({...notes,confirmed:false})).status,400);
  const generated = await post(notes);
  assert.equal(generated.status,200);
  assert.equal((await generated.json()).materials.summary[0], 'A key point');
  const explained = await post({mode:'explain',level:'beginner',notes:'synthetic topic',confirmed:true});
  assert.equal(explained.status,200);
  assert.equal((await explained.json()).explanation.analogy, 'An analogy');
  assert.equal((await reserveQuestion()).status,200);
  assert.equal((await post(notes)).status,429);
  assert.equal((await reserveQuestion()).status,429);
  const failed = await post({notes:'synthetic provider failure for testing',confirmed:true},true,'failure-test-token');
  assert.equal(failed.status,502);
  assert.doesNotMatch(JSON.stringify(await failed.json()), /private provider details/);
  const refused = await post({notes:'synthetic refusal for testing',confirmed:true},true,'failure-test-token');
  assert.equal(refused.status,502);
  assert.doesNotMatch(JSON.stringify(await refused.json()), /private refusal details/);
  assert.equal((await post(notes,true,'failure-test-token')).status,200);
  assert.equal((await post(notes,true,'failure-test-token')).status,429);
  console.log('Atlas integration checks passed with simulated services.');
} finally {
  server.kill('SIGTERM');
}

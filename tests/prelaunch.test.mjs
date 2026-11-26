import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canConsiderLaunch, issueAdminSession, isPrelaunchAdmin } from '../lib/prelaunch.ts';

test('public launch requires both the configured mode and the launch threshold', () => {
  const launch = Date.parse('2027-02-01T05:00:00.000Z');
  assert.equal(canConsiderLaunch('false', launch - 1), false);
  assert.equal(canConsiderLaunch('true', launch + 1), false);
  assert.equal(canConsiderLaunch(undefined, launch + 1), false);
  assert.equal(canConsiderLaunch('false', launch), true);
});
test('preview sessions require the credential and remain bound to their host', async () => {
  const beforeToken = process.env.PRELAUNCH_ADMIN_TOKEN;
  const beforeSecret = process.env.PRELAUNCH_SESSION_SECRET;
  process.env.PRELAUNCH_ADMIN_TOKEN = 'a'.repeat(64);
  process.env.PRELAUNCH_SESSION_SECRET = 'b'.repeat(64);
  try {
    assert.equal(await issueAdminSession('wrong', 'preview.example'), null);
    const cookie = await issueAdminSession('a'.repeat(64), 'preview.example');
    assert.ok(cookie);
    assert.equal(await isPrelaunchAdmin(cookie, 'preview.example'), true);
    assert.equal(await isPrelaunchAdmin(cookie, 'other.example'), false);
  } finally {
    if (beforeToken === undefined) delete process.env.PRELAUNCH_ADMIN_TOKEN; else process.env.PRELAUNCH_ADMIN_TOKEN = beforeToken;
    if (beforeSecret === undefined) delete process.env.PRELAUNCH_SESSION_SECRET; else process.env.PRELAUNCH_SESSION_SECRET = beforeSecret;
  }
});

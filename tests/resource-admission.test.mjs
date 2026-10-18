import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { createAdmissionGate } from '../services/api/admission.mjs';
import { createTestEnvironment } from './helpers/environment.mjs';

let environment;
let gate;
let releaseProbe;
let probeStarted = false;
let failProbe = false;
let session;

async function request(path) {
  return fetch(`${environment.origin}/api${path}`, {
    headers: session ? { Cookie: session.cookie } : {},
  });
}

before(async () => {
  gate = createAdmissionGate(1);
  environment = await createTestEnvironment({
    platform: true,
    resourceStatusGate: gate,
    resourceStatusOperation: async () => {
      probeStarted = true;
      await new Promise((resolve) => (releaseProbe = resolve));
      if (failProbe) throw new Error('synthetic delayed provider failure');
      return { databaseReady: true, syntheticDataOnly: true };
    },
  });
  const response = await fetch(`${environment.origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dispatch@alpha.example',
      password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
    }),
  });
  assert.equal(response.status, 200);
  session = { cookie: response.headers.get('set-cookie').split(';')[0] };
});

after(async () => {
  releaseProbe?.();
  await environment?.close();
});

test('status admission rejects excess checks while unrelated API work proceeds and always releases', async () => {
  const first = request('/resources/status');
  const deadline = Date.now() + 5000;
  while (!probeStarted && Date.now() < deadline) await delay(10);
  assert.equal(
    probeStarted,
    true,
    'authorized status operation reached delayed synthetic provider',
  );
  assert.equal(gate.active, 1);

  const excess = await request('/resources/status');
  assert.equal(excess.status, 503);
  assert.deepEqual(await excess.json(), { error: 'The operation could not be completed' });
  const unrelated = await request('/health');
  assert.equal(unrelated.status, 200);
  const requests = await request('/requests');
  assert.equal(requests.status, 200);

  releaseProbe();
  assert.equal((await first).status, 200);
  assert.equal(gate.active, 0);

  probeStarted = false;
  failProbe = true;
  releaseProbe = null;
  const failed = request('/resources/status');
  const failureDeadline = Date.now() + 5000;
  while (!probeStarted && Date.now() < failureDeadline) await delay(10);
  assert.equal(probeStarted, true);
  releaseProbe();
  assert.equal((await failed).status, 500);
  assert.equal(gate.active, 0);

  failProbe = false;
  probeStarted = false;
  releaseProbe = null;
  const recovered = request('/resources/status');
  const recoveryDeadline = Date.now() + 5000;
  while (!probeStarted && Date.now() < recoveryDeadline) await delay(10);
  assert.equal(probeStarted, true);
  releaseProbe();
  assert.equal((await recovered).status, 200);
  assert.equal(gate.active, 0);
});

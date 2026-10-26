import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { performance } from 'node:perf_hooks';
import { createTestEnvironment } from './helpers/environment.mjs';
import { hashPassword, passwordWorkGate, verifyPassword } from '../services/api/passwords.mjs';

const legacyPassword = 'legacy-synthetic-password';
const legacyHash =
  '0123456789abcdef0123456789abcdef:ad645fca2dce51e7d268069e7daf3e81cddee7e2e683040315c194a466b26c45706d432d86835ba6ee064d53401cf6577f2e8cf8857c4d90247ca943cdda208b';
let environment;
let pool;

before(async () => {
  environment = await createTestEnvironment({ platform: true });
  ({ pool } = await import('../services/api/database.mjs'));
});

after(async () => {
  await environment?.close();
});

async function login(email, password) {
  return fetch(`${environment.origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(3000),
  });
}

test(
  'asynchronous password derivation keeps the existing stored hash format readable',
  { timeout: 12000 },
  async () => {
    assert.equal(await verifyPassword(legacyPassword, legacyHash), true);
    assert.equal(await verifyPassword('incorrect legacy password', legacyHash), false);

    const currentHash = await hashPassword('new-synthetic-password');
    assert.match(currentHash, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
    assert.equal(await verifyPassword('new-synthetic-password', currentHash), true);
    assert.equal(await verifyPassword('incorrect new password', currentHash), false);
    assert.equal(passwordWorkGate.active, 0);
  },
);

test(
  'a malformed stored hash rejects login generically and emits no credential data',
  { timeout: 12000 },
  async () => {
    const email = 'dispatch@alpha.example';
    const { rows } = await pool.query('SELECT id,password_hash FROM users WHERE email=$1', [email]);
    const { id, password_hash: originalHash } = rows[0];
    await pool.query('UPDATE users SET password_hash=$2 WHERE id=$1', [id, 'salt:ab']);
    const messages = [];
    const originalLogger = console.error;
    console.error = (...parts) => messages.push(parts.join(' '));
    try {
      const response = await login(
        email,
        process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
      );
      assert.equal(response.status, 401);
      assert.deepEqual(await response.json(), { error: 'Email or password is incorrect' });
      assert.equal(messages.length, 1);
      assert.equal(messages[0], 'Stored password hash failed format validation');
      assert.doesNotMatch(messages.join(' '), /salt:ab|dispatch@alpha\.example/);
    } finally {
      console.error = originalLogger;
      await pool.query('UPDATE users SET password_hash=$2 WHERE id=$1', [id, originalHash]);
    }
  },
);

test(
  'password-work overload is retryable and releases capacity for a healthy login',
  { timeout: 12000 },
  async () => {
    const releases = [passwordWorkGate.tryAcquire(), passwordWorkGate.tryAcquire()];
    assert.ok(releases.every(Boolean));
    try {
      const overloaded = await login(
        'dispatch@alpha.example',
        process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
      );
      assert.equal(overloaded.status, 503);
      assert.equal(overloaded.headers.get('retry-after'), '1');
      assert.equal(overloaded.headers.get('set-cookie'), null);
      assert.deepEqual(await overloaded.json(), { error: 'The operation could not be completed' });
    } finally {
      for (const release of releases) release();
    }

    const recovered = await login(
      'dispatch@alpha.example',
      process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
    );
    assert.equal(recovered.status, 200);
    assert.equal(passwordWorkGate.active, 0);
  },
);

test(
  'async auth burst leaves the database health endpoint responsive within its measured budget',
  { timeout: 15000 },
  async (t) => {
    const requests = Array.from({ length: 12 }, (_, index) =>
      login(`q2-load-${index}@synthetic.example`, 'synthetic-invalid-password'),
    );
    const deadline = Date.now() + 2000;
    while (passwordWorkGate.active < 2 && Date.now() < deadline)
      await new Promise((resolve) => setTimeout(resolve, 1));
    assert.equal(passwordWorkGate.active, 2, 'two async scrypt operations were admitted');

    const started = performance.now();
    const health = await fetch(`${environment.origin}/api/health`, {
      signal: AbortSignal.timeout(1000),
    });
    const elapsed = performance.now() - started;
    assert.equal(health.status, 200);
    // Ten times the 23.5 ms maximum synthetic DB read is a deliberately broad
    // local responsiveness ceiling; it leaves headroom for loopback/test noise.
    assert.ok(elapsed < 250, `health completed in ${elapsed.toFixed(1)}ms during password work`);

    const responses = await Promise.all(requests);
    const statuses = await Promise.all(responses.map(async (response) => response.status));
    assert.ok(
      statuses.some((status) => status === 503),
      `expected overload among ${statuses}`,
    );
    assert.ok(
      statuses.every((status) => status === 401 || status === 503),
      JSON.stringify(statuses),
    );
    assert.equal(passwordWorkGate.active, 0);
    t.diagnostic(
      `health=${elapsed.toFixed(1)}ms; status distribution=${JSON.stringify(
        Object.fromEntries(
          [...new Set(statuses)].map((status) => [
            status,
            statuses.filter((x) => x === status).length,
          ]),
        ),
      )}`,
    );
  },
);

import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from '../../../../tests/helpers/environment.mjs';
process.env.CIVICMAPS_ROUTING_MODE = 'ingress';
process.env.CIVICMAPS_INGRESS_TOKEN = 'assessment-ingress-token-'.repeat(3);
const env = await createTestEnvironment({ platform: true });
const { runRoutingOnce } = await import('../../../../services/api/routing.mjs');
const id = randomUUID(),
  host = 'platform.dev.civicmaps.com.au';
async function request(path, body, ip = '192.0.2.1') {
  return new Promise((resolve, reject) => {
    const r = http.request(
      env.origin + path,
      {
        method: body ? 'POST' : 'GET',
        headers: {
          host,
          'x-forwarded-host': host,
          'x-forwarded-proto': 'https',
          'x-civicmaps-ingress': process.env.CIVICMAPS_INGRESS_TOKEN,
          'x-forwarded-for': ip,
          'content-type': 'application/json',
        },
      },
      (res) => {
        res.resume();
        res.on('end', () => resolve({ status: res.statusCode }));
      },
    );
    r.on('error', reject);
    r.end(body ? JSON.stringify(body) : undefined);
  });
}
try {
  await env.pool.query(
    "INSERT INTO service_routes(id,hostname,service,target,state,checked_at) VALUES($1,$2,'platform','assessment','ready',clock_timestamp()-interval '61 seconds')",
    [id, host],
  );
  await runRoutingOnce({
    async reconcile() {
      throw Error('one transient network failure');
    },
  });
  assert.equal(
    (await env.pool.query('SELECT state FROM service_routes WHERE id=$1', [id])).rows[0].state,
    'failed',
  );
  assert.equal(
    (
      await request('/api/platform/auth/login', {
        email: 'operator@platform.example',
        password: 'CivicMAPS-local-2026!',
      })
    ).status,
    503,
  );
  let retried = false;
  assert.equal(
    await runRoutingOnce({
      async reconcile() {
        retried = true;
        return {};
      },
    }),
    false,
  );
  assert.equal(retried, false);
  console.log(
    'CONFIRMED A1: one failed Platform probe persists failed; login503; next healthy worker cycle does not retry.',
  );
  await env.pool.query(
    "UPDATE service_routes SET state='ready',checked_at=clock_timestamp() WHERE id=$1",
    [id],
  );
  for (let n = 1; n <= 20; n++)
    assert.equal(
      (
        await request(
          '/api/platform/auth/login',
          { email: 'absent@example.test', password: 'incorrect' },
          '192.0.2.' + n,
        )
      ).status,
      401,
    );
  assert.equal(
    (
      await request(
        '/api/platform/auth/login',
        { email: 'operator@platform.example', password: 'CivicMAPS-local-2026!' },
        '198.51.100.1',
      )
    ).status,
    429,
  );
  console.log(
    'CONFIRMED A2:20 failed logins from distinct forwarded client IPs block unrelated valid operator login429 behind loopback ingress.',
  );
} finally {
  await env.close();
}

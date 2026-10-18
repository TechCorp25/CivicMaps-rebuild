import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from './helpers/environment.mjs';

let environment, pool, origin;
const sessions = {};
const officerId = '00000000-0000-4000-8000-000000000002';
const betaOfficer = '00000000-0000-4000-8000-000000000005';
async function call(path, input, account = 'dispatch', key = randomUUID()) {
  const session = sessions[account];
  const response = await fetch(`${origin}/api${path}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
      'Idempotency-Key': key,
    },
    body: input === undefined ? undefined : JSON.stringify(input),
  });
  return { status: response.status, data: await response.json(), response };
}
async function create(notes = '') {
  const result = await call('/requests', {
    address: 'Synthetic test location',
    latitude: -37.814,
    longitude: 144.963,
    notes,
  });
  assert.equal(result.status, 201);
  return result.data;
}
before(async () => {
  environment = await createTestEnvironment({ platform: false });
  ({ pool, origin } = environment);
  for (const [account, email] of Object.entries({
    dispatch: 'dispatch@alpha.example',
    officer: 'officer@alpha.example',
    supervisor: 'supervisor@alpha.example',
    beta: 'dispatch@beta.example',
  })) {
    const result = await call(
      '/auth/login',
      { email, password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!' },
      'anonymous',
    );
    assert.equal(result.status, 200);
    sessions[account] = {
      ...result.data,
      cookie: result.response.headers.get('set-cookie').split(';')[0],
    };
  }
});
after(async () => {
  await environment?.close();
});

test('authentication denies missing and invalid credentials; cookie is HttpOnly and Strict', async () => {
  assert.equal((await call('/requests', undefined, 'anonymous')).status, 401);
  assert.equal(
    (
      await call(
        '/auth/login',
        { email: 'dispatch@alpha.example', password: 'incorrect' },
        'anonymous',
      )
    ).status,
    401,
  );
  const login = await call(
    '/auth/login',
    {
      email: 'dispatch@alpha.example',
      password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
    },
    'anonymous',
  );
  assert.match(login.response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.response.headers.get('set-cookie'), /SameSite=Strict/);
});
test('creation is persisted and client ownership or number fields are rejected', async () => {
  const request = await create('Persisted note');
  const independent = new pg.Pool({ connectionString: environment.connectionString });
  try {
    assert.equal(
      (await independent.query('SELECT notes FROM service_requests WHERE id=$1', [request.id]))
        .rows[0].notes,
      'Persisted note',
    );
  } finally {
    await independent.end();
  }
  assert.equal(
    (
      await call('/requests', {
        address: 'A',
        latitude: 0,
        longitude: 0,
        notes: '',
        tenant_id: 'tenant-beta',
      })
    ).status,
    400,
  );
  assert.equal(
    (await call('/requests', { address: 'A', latitude: 0, longitude: 0, notes: '', number: 1 }))
      .status,
    400,
  );
  assert.equal(
    (await call('/requests', { address: 'A', latitude: null, longitude: 0, notes: '' })).status,
    400,
  );
  const event = await call(`/requests/${request.id}/audit`);
  assert.equal(event.data.length, 1);
  assert.equal(event.data[0].action, 'created');
});
test('scope denies cross-tenant list, audit, mutation and officer assignment', async () => {
  const request = await create();
  const beta = await call('/requests', undefined, 'beta');
  assert.ok(!beta.data.requests.some((item) => item.id === request.id));
  assert.equal((await call(`/requests/${request.id}/audit`, undefined, 'beta')).status, 404);
  assert.equal(
    (
      await call(
        `/requests/${request.id}/actions`,
        { action: 'close', version: 1, reason: 'Test' },
        'beta',
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await call(`/requests/${request.id}/actions`, {
        action: 'assign',
        version: 1,
        officerId: betaOfficer,
      })
    ).status,
    403,
  );
  const officers = await call('/officers');
  assert.ok(officers.data.every((item) => item.id !== betaOfficer));
});
test('database row controls deny unset context and each mismatched scope dimension', async () => {
  await create();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    assert.equal((await client.query('SELECT * FROM service_requests')).rowCount, 0);
    assert.equal((await client.query('SELECT * FROM users')).rowCount, 0);
    const scope = {
      tenant: 'tenant-alpha',
      jurisdiction: 'jurisdiction-alpha',
      plane: 'plane-alpha',
      organisation: 'organisation-alpha',
      branch: 'parking',
      actor: '00000000-0000-4000-8000-000000000001',
      context: '10000000-0000-4000-8000-000000000001',
    };
    for (const [name, value] of Object.entries(scope))
      await client.query('SELECT set_config($1,$2,true)', [`civicmaps.${name}`, value]);
    assert.ok((await client.query('SELECT * FROM service_requests')).rowCount > 0);
    for (const [name, value] of Object.entries(scope)) {
      await client.query('SELECT set_config($1,$2,true)', [`civicmaps.${name}`, 'different']);
      assert.equal((await client.query('SELECT * FROM service_requests')).rowCount, 0, name);
      assert.equal((await client.query('SELECT * FROM audit_events')).rowCount, 0, name);
      await client.query('SELECT set_config($1,$2,true)', [`civicmaps.${name}`, value]);
    }
    await assert.rejects(client.query('DELETE FROM audit_events'), /permission denied/);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
test('officer and supervisor permissions are enforced on server', async () => {
  const input = { address: 'A', latitude: 0, longitude: 0, notes: '' };
  assert.equal((await call('/requests', input, 'officer')).status, 403);
  assert.equal((await call('/requests', input, 'supervisor')).status, 403);
  const request = await create();
  assert.equal(
    (
      await call(
        `/requests/${request.id}/actions`,
        { action: 'close', version: 1, reason: 'No permission' },
        'supervisor',
      )
    ).status,
    403,
  );
  assert.equal((await call(`/requests/${request.id}/audit`, undefined, 'officer')).status, 404);
});
test('dispatch to acknowledgement, attendance and closure records all transitions', async () => {
  const request = await create();
  const path = `/requests/${request.id}/actions`;
  let result = await call(path, { action: 'assign', version: 1, officerId });
  assert.equal(result.status, 200);
  assert.equal((await call(path, { action: 'attend', version: 2 }, 'officer')).status, 409);
  result = await call(path, { action: 'acknowledge', version: 2 }, 'officer');
  assert.equal(result.data.status, 'ACKNOWLEDGED');
  result = await call(path, { action: 'attend', version: 3 }, 'officer');
  assert.equal(result.data.status, 'ATTENDED');
  result = await call(path, { action: 'close', version: 4, reason: 'Synthetic exercise ended' });
  assert.equal(result.data.status, 'CLOSED');
  assert.equal((await call(path, { action: 'assign', version: 5, officerId })).status, 409);
  const audit = await call(`/requests/${request.id}/audit`);
  assert.deepEqual(
    audit.data.map((event) => event.action),
    ['created', 'assign', 'acknowledge', 'attend', 'close'],
  );
});
test('action reasons reject malformed JSON before mutation and preserve allowed audit values', async () => {
  const request = await create();
  const path = `/requests/${request.id}/actions`;
  for (const reason of [{ malformed: true }, ['malformed'], 42, true, 'x'.repeat(1001)]) {
    assert.equal(
      (await call(path, { action: 'assign', version: 1, officerId, reason })).status,
      400,
    );
  }
  assert.deepEqual(
    (await pool.query('SELECT status,version FROM service_requests WHERE id=$1', [request.id]))
      .rows[0],
    { status: 'RECEIVED', version: 1 },
  );
  assert.equal((await call(`/requests/${request.id}/audit`)).data.length, 1);

  assert.equal(
    (await call(path, { action: 'assign', version: 1, officerId, reason: null })).status,
    200,
  );
  assert.equal(
    (await call(path, { action: 'acknowledge', version: 2, reason: 'Accepted note' }, 'officer'))
      .status,
    200,
  );
  const audit = await call(`/requests/${request.id}/audit`);
  assert.equal(audit.data[1].details.reason, null);
  assert.equal(audit.data[2].details.reason, 'Accepted note');
});
test('parallel duplicate retries create exactly one request and audit event', async () => {
  const key = randomUUID();
  const input = { address: 'Duplicate retry', latitude: 0, longitude: 0, notes: '' };
  const results = await Promise.all([
    call('/requests', input, 'dispatch', key),
    call('/requests', input, 'dispatch', key),
  ]);
  assert.ok(results.every((result) => result.status === 201));
  assert.equal(results[0].data.id, results[1].data.id);
  assert.equal((await call(`/requests/${results[0].data.id}/audit`)).data.length, 1);
  assert.equal(
    (await call('/requests', { ...input, notes: 'different' }, 'dispatch', key)).status,
    409,
  );
});
test('competing updates with the same version cannot both commit', async () => {
  const request = await create();
  const path = `/requests/${request.id}/actions`;
  const results = await Promise.all([
    call(path, { action: 'assign', version: 1, officerId }),
    call(path, { action: 'close', version: 1, reason: 'Concurrent close' }),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal((await call(`/requests/${request.id}/audit`)).data.length, 2);
});
test('missing CSRF and hostile browser origins are denied without persistence', async () => {
  const input = { address: 'Must not persist', latitude: 0, longitude: 0, notes: '' };
  for (const headers of [
    { Cookie: sessions.dispatch.cookie },
    {
      Cookie: sessions.dispatch.cookie,
      'x-csrf-token': sessions.dispatch.csrfToken,
      Origin: 'https://outside.example',
    },
  ]) {
    const response = await fetch(`${origin}/api/requests`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() },
      body: JSON.stringify(input),
    });
    assert.equal(response.status, 403);
  }
  assert.equal(
    (await pool.query('SELECT id FROM service_requests WHERE address=$1', [input.address]))
      .rowCount,
    0,
  );
});
test('deactivation and logout revoke existing sessions', async () => {
  await pool.query('UPDATE users SET active=false WHERE id=$1', [officerId]);
  try {
    assert.equal((await call('/requests', undefined, 'officer')).status, 401);
  } finally {
    await pool.query('UPDATE users SET active=true WHERE id=$1', [officerId]);
  }
  assert.equal((await call('/auth/logout', {}, 'beta')).status, 200);
  assert.equal((await call('/requests', undefined, 'beta')).status, 401);
});

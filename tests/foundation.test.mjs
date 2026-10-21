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
async function insertQueueFixtures(activeCount, closedCount) {
  const source = (
    await pool.query(
      "SELECT capture_binding_id,capture_binding_version FROM service_requests WHERE tenant_id='tenant-alpha' AND branch_id='parking' ORDER BY number DESC LIMIT 1",
    )
  ).rows[0];
  assert.ok(source);
  const rows = [
    ...Array.from({ length: activeCount }, (_, index) => ({
      status: 'RECEIVED',
      address: `Scoped queue active ${index}`,
      assigned: index % 2 === 0,
    })),
    ...Array.from({ length: closedCount }, (_, index) => ({
      status: 'CLOSED',
      address: `Scoped queue closed ${index}`,
      assigned: index % 2 === 0,
    })),
  ];
  const values = [];
  const tuples = rows.map((row, index) => {
    const offset = index * 14;
    values.push(
      randomUUID(),
      'tenant-alpha',
      'jurisdiction-alpha',
      'plane-alpha',
      'organisation-alpha',
      'parking',
      row.address,
      -37.814,
      144.963,
      '',
      row.status,
      row.assigned ? officerId : null,
      source.capture_binding_id,
      source.capture_binding_version,
    );
    return `(${Array.from({ length: 14 }, (_, field) => `$${offset + field + 1}`).join(',')})`;
  });
  await pool.query(
    `INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status,assigned_officer_id,capture_binding_id,capture_binding_version) VALUES ${tuples.join(',')}`,
    values,
  );
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
test('request pages and counts stay complete and scoped to each authorised actor', async () => {
  await create('Queue pagination baseline');
  const dispatchBefore = (await call('/requests?status=all')).data.counts;
  const officerBefore = (await call('/requests?status=all', undefined, 'officer')).data.counts;
  await insertQueueFixtures(110, 6);

  const first = await call('/requests?status=all');
  assert.equal(first.status, 200);
  assert.equal(first.data.requests.length, 100);
  assert.ok(first.data.nextCursor);
  assert.equal(Number(first.data.counts.total) - Number(dispatchBefore.total), 116);
  assert.equal(Number(first.data.counts.active) - Number(dispatchBefore.active), 110);
  assert.equal(Number(first.data.counts.closed) - Number(dispatchBefore.closed), 6);

  const second = await call(`/requests?status=all&before=${first.data.nextCursor}`);
  assert.equal(second.status, 200);
  assert.equal(second.data.requests.length, Number(first.data.counts.total) - 100);
  assert.equal(second.data.nextCursor, null);
  const all = [...first.data.requests, ...second.data.requests];
  assert.equal(new Set(all.map((request) => request.id)).size, Number(first.data.counts.total));
  assert.ok(
    all.some((request) => request.address === 'Scoped queue active 109'),
    'active records older than the first 100 remain discoverable',
  );

  const active = await call('/requests?status=active');
  assert.equal(active.data.requests.length, 100);
  assert.equal(Number(active.data.counts.active) - Number(dispatchBefore.active), 110);
  const activeNext = await call(`/requests?status=active&before=${active.data.nextCursor}`);
  assert.equal(activeNext.data.requests.length, Number(active.data.counts.active) - 100);
  assert.ok(activeNext.data.requests.every((request) => request.status !== 'CLOSED'));
  const closed = await call('/requests?status=closed');
  assert.equal(closed.data.requests.length, 6);
  assert.ok(closed.data.requests.every((request) => request.status === 'CLOSED'));

  const officer = await call('/requests?status=all', undefined, 'officer');
  assert.equal(Number(officer.data.counts.total) - Number(officerBefore.total), 58);
  assert.ok(officer.data.requests.every((request) => request.assigned_officer_id === officerId));
  assert.equal((await call('/requests?status=invalid')).status, 400);
  assert.equal((await call('/requests?before=0')).status, 400);
  assert.equal((await call('/requests?before=9223372036854775808')).status, 400);
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

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
  const requestBody =
    input && path === '/requests'
      ? {
          ...input,
          destinationContextId:
            input.destinationContextId ?? '10000000-0000-4000-8000-000000000001',
          packageData: input.packageData ?? {
            schemaVersion: 1,
            fields: {
              serviceType: 'parking',
              vehicleColour: 'Unknown',
              allegedOffence: 'Synthetic test report',
            },
          },
        }
      : input;
  const response = await fetch(`${origin}/api${path}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
      'Idempotency-Key': key,
    },
    body: input === undefined ? undefined : JSON.stringify(requestBody),
  });
  return { status: response.status, data: await response.json(), response };
}
async function create(notes = '', address = 'Synthetic test location') {
  const result = await call('/requests', {
    address,
    latitude: -37.814,
    longitude: 144.963,
    notes,
  });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  // Existing lifecycle tests intentionally exercise historical rows with no captured intake schema.
  await pool.query(
    'UPDATE service_requests SET package_id=NULL,package_schema_version=NULL,package_payload=NULL,assignment_state=NULL,assignment_exception=NULL WHERE id=$1',
    [result.data.id],
  );
  return result.data;
}
async function addAlphaOfficer() {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO users SELECT $1,$2,name,password_hash,'OFFICER',tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id,true FROM users WHERE id=$3",
    [id, `${id}@synthetic.example`, officerId],
  );
  await pool.query(
    'INSERT INTO council_principal_owners(user_id,municipality_id) SELECT $1,municipality_id FROM council_principal_owners WHERE user_id=$2',
    [id, officerId],
  );
  await pool.query(
    "INSERT INTO operating_context_grants(user_id,binding_id,effective_from) VALUES ($1,'10000000-0000-4000-8000-000000000001','2020-01-01')",
    [id],
  );
  return id;
}
async function addGrantScopedOfficerWithDifferentLegacyScope() {
  const id = randomUUID();
  await pool.query(
    `INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id,active)
     SELECT $1,$2,name,password_hash,'OFFICER','legacy-tenant','legacy-jurisdiction',
       'legacy-plane','legacy-organisation','legacy-branch',team_id,true FROM users WHERE id=$3`,
    [id, `${id}@synthetic.example`, officerId],
  );
  await pool.query(
    'INSERT INTO council_principal_owners(user_id,municipality_id) SELECT $1,municipality_id FROM council_principal_owners WHERE user_id=$2',
    [id, officerId],
  );
  await pool.query(
    "INSERT INTO operating_context_grants(user_id,binding_id,effective_from) VALUES ($1,'10000000-0000-4000-8000-000000000001','2020-01-01')",
    [id],
  );
  return id;
}
async function addAlphaOfficerWithoutOperatingGrant() {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO users SELECT $1,$2,name,password_hash,'OFFICER',tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id,true FROM users WHERE id=$3",
    [id, `${id}@synthetic.example`, officerId],
  );
  await pool.query(
    'INSERT INTO council_principal_owners(user_id,municipality_id) SELECT $1,municipality_id FROM council_principal_owners WHERE user_id=$2',
    [id, officerId],
  );
  return id;
}
async function insertQueueFixtures(activeCount = 105, closedCount = 110) {
  const source = (
    await pool.query(
      "SELECT capture_binding_id,capture_binding_version FROM service_requests WHERE tenant_id='tenant-alpha' AND branch_id='parking' ORDER BY number DESC LIMIT 1",
    )
  ).rows[0];
  assert.ok(source, 'a real alpha request must establish the source binding');
  const rows = [
    ...Array.from({ length: activeCount }, (_, index) => ({
      id: randomUUID(),
      status: 'RECEIVED',
      address: `Scoped queue active ${index}`,
      assignedOfficer: index % 2 === 0 ? officerId : null,
    })),
    ...Array.from({ length: closedCount }, (_, index) => ({
      id: randomUUID(),
      status: 'CLOSED',
      address: `Scoped queue closed ${index}`,
      assignedOfficer: index % 2 === 0 ? officerId : null,
    })),
  ];
  const values = [];
  const tuples = rows.map((row, index) => {
    const offset = index * 14;
    values.push(
      row.id,
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
      row.assignedOfficer,
      source.capture_binding_id,
      source.capture_binding_version,
    );
    return `(${Array.from({ length: 14 }, (_, field) => `$${offset + field + 1}`).join(',')})`;
  });
  await pool.query(
    `INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status,assigned_officer_id,capture_binding_id,capture_binding_version) VALUES ${tuples.join(',')}`,
    values,
  );
  return rows;
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
  for (const account of Object.keys(sessions)) {
    const session = await call('/auth/session', undefined, account);
    assert.equal(session.status, 200, `newly issued ${account} session remains usable`);
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
  sessions.dispatch = {
    ...login.data,
    cookie: login.response.headers.get('set-cookie').split(';')[0],
  };
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
  assert.equal(second.data.counts, undefined);
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
  assert.equal(activeNext.data.counts, undefined);
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
test('queue filters, counts and keyset pages retain older active work and scope', async () => {
  const fixtures = await insertQueueFixtures();
  const all = await call('/requests?status=all');
  assert.equal(all.status, 200);
  assert.equal(all.data.requests.length, 100);
  assert.ok(all.data.requests.every((request) => request.status === 'CLOSED'));
  assert.ok(BigInt(all.data.counts.total) >= 215n);
  assert.ok(BigInt(all.data.counts.active) >= 105n);
  assert.ok(BigInt(all.data.counts.closed) >= 110n);
  assert.ok(all.data.nextCursor);
  const closed = await call('/requests?status=closed');
  assert.equal(closed.status, 200);
  assert.ok(closed.data.requests.every((request) => request.status === 'CLOSED'));
  assert.ok(closed.data.nextCursor);

  const first = await call('/requests?status=active');
  assert.equal(first.status, 200);
  assert.equal(first.data.requests.length, 100);
  assert.ok(first.data.requests.every((request) => request.status !== 'CLOSED'));
  assert.ok(
    first.data.requests.every(
      (request) =>
        request.tenant_id === 'tenant-alpha' &&
        request.jurisdiction_id === 'jurisdiction-alpha' &&
        request.data_plane_id === 'plane-alpha' &&
        request.organisation_id === 'organisation-alpha' &&
        request.branch_id === 'parking',
    ),
  );
  assert.ok(
    first.data.requests.some((request) =>
      fixtures.slice(0, 105).some((row) => row.id === request.id),
    ),
  );

  const newer = await create('Inserted between queue pages');
  const second = await call(`/requests?status=active&before=${first.data.nextCursor}`);
  assert.equal(second.status, 200);
  const firstIds = new Set(first.data.requests.map((request) => request.id));
  assert.ok(second.data.requests.every((request) => !firstIds.has(request.id)));
  assert.ok(
    second.data.requests.every((request) => BigInt(request.number) < BigInt(first.data.nextCursor)),
  );
  assert.ok(!second.data.requests.some((request) => request.id === newer.id));
  const fetched = new Set(
    [...first.data.requests, ...second.data.requests].map((request) => request.id),
  );
  assert.ok(fixtures.slice(0, 105).every((row) => fetched.has(row.id)));

  const officer = await call('/requests?status=active', undefined, 'officer');
  assert.equal(officer.status, 200);
  assert.ok(officer.data.requests.length > 0);
  assert.ok(officer.data.requests.every((request) => request.assigned_officer_id === officerId));
  assert.ok(BigInt(officer.data.counts.total) < BigInt(first.data.counts.total));
  const beta = await call('/requests?status=all', undefined, 'beta');
  assert.equal(beta.status, 200);
  assert.equal(beta.data.counts.total, '0');
  assert.deepEqual(beta.data.requests, []);

  assert.equal((await call('/requests?status=unknown')).status, 400);
  assert.equal((await call('/requests?status=active&before=0')).status, 400);
  assert.equal((await call('/requests?status=active&before=9223372036854775808')).status, 400);
});
test('department intake requires authorised branch, validated fields and retains unassigned exception', async () => {
  const destinations = await call('/intake-destinations');
  assert.equal(destinations.status, 200);
  assert.deepEqual(
    destinations.data.map((item) => item.branchId),
    ['parking'],
  );
  const request = await call('/requests', {
    address: 'Synthetic intake location',
    latitude: -37.814,
    longitude: 144.963,
    notes: 'Additional synthetic context',
  });
  assert.equal(request.status, 201);
  assert.equal(request.data.package_id, 'parking');
  assert.deepEqual(request.data.package_payload, {
    serviceType: 'parking',
    vehicleColour: 'Unknown',
    allegedOffence: 'Synthetic test report',
  });
  assert.equal(request.data.status, 'RECEIVED');
  assert.equal(request.data.assigned_officer_id, null);
  assert.equal(request.data.assignment_state, 'unassigned');
  assert.match(request.data.assignment_exception, /service-area and signed-on duty/);
  const unverifiedAssignment = await call(`/requests/${request.data.id}/actions`, {
    action: 'assign',
    version: 1,
    officerId,
  });
  assert.equal(unverifiedAssignment.status, 503);
  const invalid = await call('/requests', {
    address: 'Synthetic intake location',
    latitude: -37.814,
    longitude: 144.963,
    notes: '',
    packageData: { schemaVersion: 1, fields: { vehicleColour: 'Blue' } },
  });
  assert.equal(invalid.status, 400);
  const forged = await call('/requests', {
    address: 'Synthetic cross-council attempt',
    latitude: 0,
    longitude: 0,
    notes: '',
    destinationContextId: '10000000-0000-4000-8000-000000000002',
    packageData: {
      schemaVersion: 1,
      fields: { serviceType: 'parking', vehicleColour: 'Blue', allegedOffence: 'Reported' },
    },
  });
  assert.equal(forged.status, 403);
  const audit = await call(`/requests/${request.data.id}/audit`);
  assert.equal(audit.data[0].details.assignmentState, 'unassigned');
});
test('manual reassignment records its reason and retains immutable from/to audit history', async () => {
  const request = await create();
  const replacement = await addAlphaOfficer();
  await call(`/requests/${request.id}/actions`, { action: 'assign', version: 1, officerId });
  const missingReason = await call(`/requests/${request.id}/actions`, {
    action: 'assign',
    version: 2,
    officerId: replacement,
  });
  assert.equal(missingReason.status, 400);
  const reassigned = await call(`/requests/${request.id}/actions`, {
    action: 'assign',
    version: 2,
    officerId: replacement,
    reason: 'Competing duties leave insufficient time.',
  });
  assert.equal(reassigned.status, 200);
  const history = await call(`/requests/${request.id}/audit`);
  assert.equal(history.data[2].details.fromOfficerId, officerId);
  assert.equal(history.data[2].details.toOfficerId, replacement);
  assert.equal(history.data[2].details.reason, 'Competing duties leave insufficient time.');
});
test('assignment follows the effective context grant instead of legacy user scope columns', async () => {
  const request = await create();
  const grantScopedOfficer = await addGrantScopedOfficerWithDifferentLegacyScope();
  const directory = await call('/officers');
  assert.ok(directory.data.some((item) => item.id === grantScopedOfficer));
  const result = await call(`/requests/${request.id}/actions`, {
    action: 'assign',
    version: 1,
    officerId: grantScopedOfficer,
  });
  assert.equal(result.status, 200, JSON.stringify(result.data));
  assert.equal(result.data.assigned_officer_id, grantScopedOfficer);
});
test('matching legacy scope columns without an effective grant do not authorize assignment', async () => {
  const request = await create();
  const ungrantedOfficer = await addAlphaOfficerWithoutOperatingGrant();
  const directory = await call('/officers');
  assert.ok(!directory.data.some((item) => item.id === ungrantedOfficer));
  const result = await call(`/requests/${request.id}/actions`, {
    action: 'assign',
    version: 1,
    officerId: ungrantedOfficer,
  });
  assert.equal(result.status, 403);
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

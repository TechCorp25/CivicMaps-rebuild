import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import { createTestEnvironment } from './helpers/environment.mjs';

let env, pool;
const sessions = {};
const municipality = '20000000-0000-4000-8000-000000000001';
const binding = '10000000-0000-4000-8000-000000000001';
const actor = '00000000-0000-4000-8000-000000000001';
const input = { address: 'Synthetic entitlement test', latitude: 0, longitude: 0, notes: '' };
async function call(path, body, who = 'dispatch', key = randomUUID()) {
  const session = sessions[who];
  const requestBody =
    body && path === '/requests'
      ? {
          ...body,
          destinationContextId: body.destinationContextId ?? binding,
          packageData: body.packageData ?? {
            schemaVersion: 1,
            fields: {
              serviceType: 'parking',
              vehicleColour: 'Unknown',
              allegedOffence: 'Synthetic test report',
            },
          },
        }
      : body;
  const response = await fetch(`${env.origin}/api${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(requestBody),
  });
  return { status: response.status, data: await response.json(), response };
}
async function toggle(enabled) {
  const m = (
    await pool.query('SELECT version FROM platform_municipalities WHERE id=$1', [municipality])
  ).rows[0];
  return call(
    `/platform/municipalities/${municipality}/packs`,
    { pack: 'parking-services', enabled, version: m.version, confirmed: true },
    'operator',
  );
}
async function directScope(client) {
  await client.query(
    "SELECT set_config('civicmaps.actor',$1,true),set_config('civicmaps.context',$2,true)",
    [actor, binding],
  );
  for (const [name, value] of Object.entries({
    tenant: 'tenant-alpha',
    organisation: 'organisation-alpha',
    jurisdiction: 'jurisdiction-alpha',
    plane: 'plane-alpha',
    branch: 'parking',
  }))
    await client.query('SELECT set_config($1,$2,true)', [`civicmaps.${name}`, value]);
  await client.query('SET LOCAL ROLE civicmaps_local_app');
}
async function waitForLock(marker) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (
      (
        await pool.query(
          "SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE $1",
          [`%${marker}%`],
        )
      ).rowCount
    )
      return;
    await setTimeout(20);
  }
  assert.fail(`Expected database lock wait: ${marker}`);
}
before(async () => {
  env = await createTestEnvironment({ platform: true });
  pool = env.pool;
  for (const [who, email] of Object.entries({
    dispatch: 'dispatch@alpha.example',
    officer: 'officer@alpha.example',
    operator: 'operator@platform.example',
    beta: 'dispatch@beta.example',
  })) {
    const r = await call(
      who === 'operator' ? '/platform/auth/login' : '/auth/login',
      { email, password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!' },
      'anonymous',
    );
    assert.equal(r.status, 200);
    sessions[who] = { ...r.data, cookie: r.response.headers.get('set-cookie').split(';')[0] };
  }
});
after(async () => {
  await env?.close();
});

test('stable catalogue preserves labels and aliases without granting unrelated registrations parking', async () => {
  const list = await call('/platform/municipalities', undefined, 'operator');
  assert.equal(list.data.packCatalogue.length, 9);
  assert.deepEqual(list.data.packCatalogue[0], {
    id: 'parking-services',
    label: 'Parking Services Branch',
  });
  const profile = await call('/auth/session');
  assert.equal(profile.data.entitlements.packId, 'parking-services');
  assert.equal(profile.data.actor.branch_id, 'parking');
  for (const packs of [['Local Laws', 'local-laws'], ['unknown']]) {
    const r = await call(
      '/platform/municipalities',
      {
        name: 'Test Council',
        slug: `test-${randomUUID().replaceAll('-', '')}`,
        packs,
        firstName: 'Test',
        lastName: 'Admin',
        email: `${randomUUID()}@synthetic.example`,
      },
      'operator',
    );
    assert.equal(r.status, 400);
  }
  const r = await call(
    '/platform/municipalities',
    {
      name: 'Test Council',
      slug: `test-${randomUUID().replaceAll('-', '')}`,
      packs: ['Local Laws'],
      firstName: 'Test',
      lastName: 'Admin',
      email: `${randomUUID()}@synthetic.example`,
    },
    'operator',
  );
  assert.equal(r.status, 201);
  assert.deepEqual(r.data.municipality.packs, ['local-laws']);
  await pool.query(
    "UPDATE pack_catalogue SET label='Parking test display label' WHERE id='parking-services'",
  );
  assert.equal((await call('/auth/session')).data.entitlements.label, 'Parking test display label');
  assert.equal((await call('/auth/session')).data.entitlements.packId, 'parking-services');
  await pool.query(
    "UPDATE pack_catalogue SET label='Parking Services Branch' WHERE id='parking-services'",
  );
});

test('freshly seeded workload IDs drive pack detail and disable audit counts', async () => {
  const m = (await pool.query("SELECT id,version FROM platform_municipalities WHERE slug='yarra'"))
    .rows[0];
  const detail = await call(`/platform/municipalities/${m.id}`, undefined, 'operator');
  assert.deepEqual(detail.data.workloads, [{ pack: 'parks-gardens', open_count: 214 }]);
  const disabled = await call(
    `/platform/municipalities/${m.id}/packs`,
    { pack: 'parks-gardens', enabled: false, version: m.version, confirmed: true },
    'operator',
  );
  assert.equal(disabled.status, 200);
  const events = (await call(`/platform/municipalities/${m.id}`, undefined, 'operator')).data
    .events;
  assert.equal(events.find((e) => e.action === 'pack_disabled').details.openCount, 214);
});

test('unmapped contexts fail closed without rewriting bindings or affecting other councils', async () => {
  await pool.query("DELETE FROM branch_pack_mapping WHERE branch_id='parking'");
  try {
    const profile = await call('/auth/session');
    assert.equal(profile.data.entitlements.mode, 'unavailable');
    assert.deepEqual(profile.data.entitlements.capabilities, []);
    assert.equal((await call('/requests')).status, 403);
    assert.equal((await call('/requests', input)).status, 403);
  } finally {
    await pool.query("INSERT INTO branch_pack_mapping VALUES('parking','parking-services')");
  }
});

test('disable denies stale sessions and receipt replay while retaining authorised request/audit scope; re-enable adds audited version', async () => {
  const key = randomUUID();
  const created = await call('/requests', input, 'dispatch', key);
  assert.equal(created.status, 201);
  await pool.query(
    'UPDATE service_requests SET package_id=NULL,package_schema_version=NULL,package_payload=NULL,assignment_state=NULL,assignment_exception=NULL WHERE id=$1',
    [created.data.id],
  );
  const id = created.data.id;
  const assigned = await call(`/requests/${id}/actions`, {
    action: 'assign',
    version: 1,
    officerId: '00000000-0000-4000-8000-000000000002',
  });
  assert.equal(assigned.status, 200);
  const other = await call('/requests', input);
  assert.equal(other.status, 201);
  const before = (
    await pool.query('SELECT pack_version FROM platform_municipalities WHERE id=$1', [municipality])
  ).rows[0].pack_version;
  assert.equal((await toggle(false)).status, 200);
  const profile = await call('/auth/session');
  assert.equal(profile.data.entitlements.mode, 'review');
  assert.deepEqual(profile.data.entitlements.capabilities, [
    'requests.read',
    'requests.audit.read',
  ]);
  assert.equal((await call('/requests', input, 'dispatch', key)).status, 403);
  for (const action of ['assign', 'close'])
    assert.equal(
      (
        await call(`/requests/${id}/actions`, {
          action,
          version: 2,
          officerId: '00000000-0000-4000-8000-000000000002',
          reason: 'test',
        })
      ).status,
      403,
    );
  for (const action of ['acknowledge', 'attend'])
    assert.equal(
      (await call(`/requests/${id}/actions`, { action, version: 2 }, 'officer')).status,
      403,
    );
  for (const path of ['/officers', '/resources/status'])
    assert.equal((await call(path)).status, 403);
  assert.ok((await call('/requests')).data.requests.some((r) => r.id === id));
  assert.deepEqual(
    (await call('/requests', undefined, 'officer')).data.requests.map((r) => r.id),
    [id],
  );
  assert.equal((await call(`/requests/${id}/audit`, undefined, 'officer')).status, 200);
  assert.equal((await call(`/requests/${other.data.id}/audit`, undefined, 'officer')).status, 404);
  assert.ok(!(await call('/requests', undefined, 'beta')).data.requests.some((r) => r.id === id));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await directScope(client);
    assert.equal(
      (
        await client.query("UPDATE service_requests SET notes='bypass' WHERE id=$1 RETURNING id", [
          id,
        ])
      ).rowCount,
      0,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
  assert.equal((await toggle(true)).status, 200);
  const history = (
    await pool.query(
      'SELECT * FROM municipality_pack_history WHERE municipality_id=$1 ORDER BY version',
      [municipality],
    )
  ).rows;
  assert.equal(history.at(-1).version, before + 2);
  assert.equal(history.at(-1).operator_id, sessions.operator.actor.id);
  assert.equal(
    (await pool.query('SELECT count(*) FROM service_requests WHERE id=$1', [id])).rows[0].count,
    '1',
  );
  assert.equal((await call('/requests', input, 'dispatch', key)).status, 201);
});

test('a direct application write holds disable until commit; a write waiting behind disable observes denial', async () => {
  const created = await call('/requests', input);
  assert.equal(created.status, 201);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await directScope(client);
    await client.query("UPDATE service_requests SET notes='committed before disable' WHERE id=$1", [
      created.data.id,
    ]);
    const disabling = toggle(false);
    await waitForLock('FOR UPDATE OF m');
    await client.query('COMMIT');
    assert.equal((await disabling).status, 200);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
  assert.equal((await toggle(true)).status, 200);
  const blocker = await pool.connect(),
    writer = await pool.connect();
  try {
    await blocker.query('BEGIN');
    await blocker.query(
      "UPDATE platform_municipalities SET packs=packs-'parking-services' WHERE id=$1",
      [municipality],
    );
    await writer.query('BEGIN');
    await directScope(writer);
    const writing = writer.query('SELECT civicmaps_entitlement_state() /* f08_waiting_writer */');
    await waitForLock('f08_waiting_writer');
    await blocker.query('COMMIT');
    const state = (await writing).rows[0].civicmaps_entitlement_state;
    assert.equal(state.enabled, false);
    assert.equal(
      (
        await writer.query(
          "UPDATE service_requests SET notes='must not commit' WHERE id=$1 RETURNING id",
          [created.data.id],
        )
      ).rowCount,
      0,
    );
    await writer.query('COMMIT');
    assert.equal(
      (await pool.query('SELECT notes FROM service_requests WHERE id=$1', [created.data.id]))
        .rows[0].notes,
      'committed before disable',
    );
    assert.equal((await call('/requests', input)).status, 403);
  } finally {
    await blocker.query('ROLLBACK');
    await writer.query('ROLLBACK');
    blocker.release();
    writer.release();
  }
  assert.equal((await toggle(true)).status, 200);
});

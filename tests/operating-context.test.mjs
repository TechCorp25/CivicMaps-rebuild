import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from './helpers/environment.mjs';
import { resolveContext } from '../services/api/operating-context.mjs';
let environment, pool, origin;
const alpha = '10000000-0000-4000-8000-000000000001';
const beta = '10000000-0000-4000-8000-000000000002';
const shared = '10000000-0000-4000-8000-000000000003';
const dispatcher = '00000000-0000-4000-8000-000000000001';
const sharedUser = '00000000-0000-4000-8000-000000000006';
const payload = { address: 'Synthetic context case', latitude: 0, longitude: 0, notes: '' };
before(async () => {
  environment = await createTestEnvironment({ platform: true });
  ({ pool, origin } = environment);
});
after(async () => environment?.close());
async function call(path, session, { data, context, key = randomUUID() } = {}) {
  const response = await fetch(`${origin}/api${path}`, {
    method: data === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
      ...(context === undefined ? {} : { 'x-civicmaps-context': context }),
      'Idempotency-Key': key,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  return { status: response.status, data: await response.json(), response };
}
async function login(email) {
  const r = await call('/auth/login', null, {
    data: { email, password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!' },
  });
  assert.equal(r.status, 200);
  return { ...r.data, cookie: r.response.headers.get('set-cookie').split(';')[0] };
}
async function account(bindings = []) {
  const id = randomUUID();
  const email = `${id}@synthetic.example`;
  await pool.query(
    `INSERT INTO users SELECT $1,$2,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id,true FROM users WHERE id=$3`,
    [id, email, dispatcher],
  );
  for (const binding of bindings)
    await pool.query(
      "INSERT INTO operating_context_grants(user_id,binding_id,effective_from) VALUES ($1,$2,'2020-01-01')",
      [id, binding],
    );
  return { id, session: await login(email) };
}
async function binding({
  from = '2020-01-01',
  to = null,
  revoked = null,
  association = randomUUID(),
  version = 1,
} = {}) {
  const id = randomUUID();
  await pool.query(
    `INSERT INTO operating_context_bindings SELECT $1,$2,$3,municipality_id,tenant_id,organisation_id,jurisdiction_id,data_plane_id,branch_id,$4,$5,$6,now() FROM operating_context_bindings WHERE id=$7`,
    [id, association, version, from, to, revoked, alpha],
  );
  return id;
}
test('single context restores resolved scope; selectors and platform sessions cannot forge it', async () => {
  const session = await login('dispatch@alpha.example');
  const restored = await call('/auth/session', session);
  assert.equal(restored.status, 200);
  assert.equal(restored.data.actor.context_id, alpha);
  assert.equal(restored.data.actor.context_version, 1);
  for (const context of [beta, randomUUID(), 'invalid', ''])
    assert.equal((await call('/requests', session, { context })).status, 403);
  assert.equal(
    (await call('/requests', session, { data: { ...payload, tenant_id: 'tenant-beta' } })).status,
    400,
  );
  const operator = await call('/platform/auth/login', null, {
    data: {
      email: 'operator@platform.example',
      password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
    },
  });
  const cookie = operator.response.headers.get('set-cookie').split(';')[0];
  assert.equal((await call('/auth/contexts', { cookie })).status, 401);
});
test('shared-service organisation needs explicit contexts and keeps each origin isolated', async () => {
  const session = await login('shared@alpha.example');
  const contexts = await call('/auth/contexts', session);
  assert.equal(contexts.status, 200);
  assert.deepEqual(contexts.data.map((b) => b.id).sort(), [alpha, shared].sort());
  assert.ok(contexts.data.every((b) => b.organisation_id === 'organisation-alpha'));
  assert.equal((await call('/requests', session)).status, 403);
  const key = randomUUID();
  const first = await call('/requests', session, { context: alpha, data: payload, key });
  const second = await call('/requests', session, { context: shared, data: payload, key });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.data.id, second.data.id);
  assert.equal(first.data.capture_binding_id, alpha);
  assert.equal(second.data.capture_binding_id, shared);
  assert.equal(second.data.jurisdiction_id, 'jurisdiction-beta');
  assert.equal(second.data.organisation_id, 'organisation-alpha');
  assert.equal(
    (await call('/requests', session, { context: shared, data: payload, key })).data.id,
    second.data.id,
  );
  for (const [context, other] of [
    [alpha, second.data],
    [shared, first.data],
  ]) {
    const listed = await call('/requests', session, { context });
    assert.ok(!listed.data.requests.some((r) => r.id === other.id));
    assert.equal((await call(`/requests/${other.id}/audit`, session, { context })).status, 404);
    assert.equal(
      (
        await call(`/requests/${other.id}/actions`, session, {
          context,
          data: { action: 'assign', version: 1, officerId: '00000000-0000-4000-8000-000000000002' },
        })
      ).status,
      404,
    );
  }
  assert.deepEqual((await call('/officers', session, { context: shared })).data, []);
  assert.equal(
    (
      await call(`/requests/${second.data.id}/actions`, session, {
        context: shared,
        data: { action: 'assign', version: 1, officerId: '00000000-0000-4000-8000-000000000002' },
      })
    ).status,
    403,
  );
  assert.equal(
    (await call('/requests', await login('dispatch@beta.example'), { context: shared })).status,
    403,
  );
  // An explicit grant makes an officer eligible in the shared realm despite their Alpha home fields.
  const officerId = '00000000-0000-4000-8000-000000000002';
  await pool.query("INSERT INTO operating_context_grants VALUES ($1,$2,'2020-01-01',NULL,NULL)", [
    officerId,
    shared,
  ]);
  assert.deepEqual(
    (await call('/officers', session, { context: shared })).data.map((o) => o.id),
    [officerId],
  );
  const assigned = await call(`/requests/${second.data.id}/actions`, session, {
    context: shared,
    data: { action: 'assign', version: 1, officerId },
  });
  assert.equal(assigned.status, 200);
  const officer = await login('officer@alpha.example');
  const queue = await call('/requests', officer, { context: shared });
  assert.equal(queue.status, 200);
  assert.deepEqual(
    queue.data.requests.map((r) => r.id),
    [second.data.id],
  );
});
test('missing grants, future/expired/revoked bindings and grants fail closed on existing sessions', async () => {
  const missing = await account();
  assert.equal((await call('/requests', missing.session)).status, 403);
  const cases = [{ from: '9999-01-01' }, { to: '2021-01-01' }, { revoked: new Date() }];
  for (const options of cases) {
    const id = await binding(options);
    const user = await account([id]);
    assert.equal((await call('/requests', user.session, { context: id })).status, 403);
  }
  const id = await binding();
  const user = await account([id]);
  assert.equal((await call('/requests', user.session, { context: id })).status, 200);
  await pool.query(
    'UPDATE operating_context_grants SET revoked_at=clock_timestamp() WHERE user_id=$1 AND binding_id=$2',
    [user.id, id],
  );
  assert.equal((await call('/requests', user.session, { context: id })).status, 403);
  const future = await account();
  await pool.query("INSERT INTO operating_context_grants VALUES ($1,$2,'9999-01-01',NULL,NULL)", [
    future.id,
    alpha,
  ]);
  assert.equal((await call('/requests', future.session)).status, 403);
  const expired = await account();
  await pool.query(
    "INSERT INTO operating_context_grants VALUES ($1,$2,'2020-01-01','2021-01-01',NULL)",
    [expired.id, alpha],
  );
  assert.equal((await call('/requests', expired.session)).status, 403);
});
test('revocation prevents old receipt replay and preserves the stored origin', async () => {
  const id = await binding();
  const user = await account([id]);
  const key = randomUUID();
  const created = await call('/requests', user.session, { context: id, data: payload, key });
  assert.equal(created.status, 201);
  await pool.query(
    'UPDATE operating_context_bindings SET revoked_at=clock_timestamp() WHERE id=$1',
    [id],
  );
  assert.equal(
    (await call('/requests', user.session, { context: id, data: payload, key })).status,
    403,
  );
  const persisted = await pool.query(
    'SELECT capture_binding_id,capture_binding_version FROM service_requests WHERE id=$1',
    [created.data.id],
  );
  assert.deepEqual(persisted.rows[0], { capture_binding_id: id, capture_binding_version: 1 });
  await assert.rejects(
    pool.query("UPDATE service_requests SET tenant_id='forged' WHERE id=$1", [created.data.id]),
    /immutable/,
  );
  await assert.rejects(
    pool.query('UPDATE service_requests SET capture_binding_id=$2 WHERE id=$1', [
      created.data.id,
      alpha,
    ]),
    /immutable/,
  );
  await assert.rejects(
    pool.query("UPDATE operating_context_bindings SET tenant_id='forged' WHERE id=$1", [id]),
    /immutable/,
  );
  await assert.rejects(
    pool.query('DELETE FROM operating_context_grants WHERE user_id=$1', [user.id]),
    /cannot be deleted/,
  );
});
test('a replacement binding version preserves historical capture and scope-safe access', async () => {
  const association = randomUUID();
  const old = await binding({ association });
  const user = await account([old]);
  const key = randomUUID();
  const created = await call('/requests', user.session, { data: payload, key });
  assert.equal(created.status, 201);
  await pool.query(
    'UPDATE operating_context_bindings SET revoked_at=clock_timestamp() WHERE id=$1',
    [old],
  );
  const next = await binding({ association, version: 2 });
  await pool.query("INSERT INTO operating_context_grants VALUES ($1,$2,'2020-01-01',NULL,NULL)", [
    user.id,
    next,
  ]);
  const list = await call('/requests', user.session);
  assert.equal(list.status, 200);
  assert.ok(
    list.data.requests.some((r) => r.id === created.data.id && r.capture_binding_id === old),
  );
  const restored = await call('/auth/session', user.session);
  assert.equal(restored.data.actor.context_version, 2);
  const retry = await call('/requests', user.session, { data: payload, key });
  assert.equal(retry.status, 409);
  assert.equal(
    (await pool.query('SELECT id FROM service_requests WHERE capture_binding_id=$1', [next]))
      .rowCount,
    0,
  );
  const fresh = await call('/requests', user.session, { data: payload });
  assert.equal(fresh.data.capture_binding_version, 2);
});
async function waitForLock(client, pid) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const r = await client.query('SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1', [
      pid,
    ]);
    if (r.rows[0]?.wait_event_type === 'Lock') return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.fail('Expected database row-lock wait');
}
test('committed revocation wins over a request waiting to resolve the binding', async () => {
  const id = await binding();
  const user = await account([id]);
  const lock = await pool.connect();
  let response;
  try {
    await lock.query('BEGIN');
    await lock.query(
      'UPDATE operating_context_bindings SET revoked_at=clock_timestamp() WHERE id=$1',
      [id],
    );
    response = call('/requests', user.session, { context: id, data: payload });
    const deadline = Date.now() + 5000;
    let waiting = false;
    while (Date.now() < deadline) {
      const r = await pool.query(
        "SELECT pid FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%FOR SHARE OF b,g%'",
      );
      if (r.rowCount) {
        waiting = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.ok(waiting, 'Resolver must wait for structural update');
    await lock.query('COMMIT');
    assert.equal((await response).status, 403);
    assert.equal(
      (await pool.query('SELECT id FROM service_requests WHERE capture_binding_id=$1', [id]))
        .rowCount,
      0,
    );
  } finally {
    await lock.query('ROLLBACK');
    lock.release();
    if (response) await response;
  }
});
test('binding and grant revocation wait for an already resolved transaction', async () => {
  const id = await binding();
  const user = await account([id]);
  const reader = await pool.connect();
  const writer = await pool.connect();
  let change;
  try {
    await reader.query('BEGIN');
    await resolveContext(reader, { id: user.id }, id);
    const {
      rows: [{ pid }],
    } = await writer.query('SELECT pg_backend_pid() AS pid');
    change = writer.query(
      'UPDATE operating_context_grants SET revoked_at=clock_timestamp() WHERE user_id=$1 AND binding_id=$2',
      [user.id, id],
    );
    await waitForLock(pool, pid);
    await reader.query('COMMIT');
    await change;
    assert.equal((await call('/requests', user.session, { context: id })).status, 403);
  } finally {
    await reader.query('ROLLBACK');
    reader.release();
    if (change) await change;
    writer.release();
  }
});
test('app roles cannot author structures or expose other context grants', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    assert.equal((await client.query('SELECT * FROM operating_context_grants')).rowCount, 0);
    await client.query("SELECT set_config('civicmaps.context',$1,true)", [alpha]);
    const grants = await client.query('SELECT * FROM operating_context_grants');
    assert.ok(grants.rows.every((g) => g.binding_id === alpha));
    await assert.rejects(
      client.query('UPDATE operating_context_grants SET revoked_at=now() WHERE user_id=$1', [
        sharedUser,
      ]),
      /permission denied/,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
  const changes = await pool.query(
    "SELECT action FROM operating_context_changes WHERE table_name='operating_context_bindings'",
  );
  assert.ok(changes.rows.some((r) => r.action === 'UPDATE'));
});

test('effective periods include the lower bound and exclude the upper bound using database time', async () => {
  const user = await account();
  const id = randomUUID();
  await pool.query(
    `INSERT INTO operating_context_bindings
    SELECT $1,$1,1,municipality_id,tenant_id,organisation_id,jurisdiction_id,data_plane_id,branch_id,
    clock_timestamp(),NULL,NULL,now() FROM operating_context_bindings WHERE id=$2`,
    [id, alpha],
  );
  await pool.query(
    `INSERT INTO operating_context_grants VALUES ($1,$2,clock_timestamp(),NULL,NULL)`,
    [user.id, id],
  );
  assert.equal((await call('/requests', user.session, { context: id })).status, 200);
  const expired = await account();
  await pool.query(
    `INSERT INTO operating_context_grants VALUES ($1,$2,'2020-01-01',clock_timestamp(),NULL)`,
    [expired.id, id],
  );
  assert.equal((await call('/requests', expired.session, { context: id })).status, 403);
  const ended = randomUUID();
  await pool.query(
    `INSERT INTO operating_context_bindings
    SELECT $1,$1,1,municipality_id,tenant_id,organisation_id,jurisdiction_id,data_plane_id,branch_id,
    '2020-01-01',clock_timestamp(),NULL,now() FROM operating_context_bindings WHERE id=$2`,
    [ended, alpha],
  );
  const denied = await account([ended]);
  assert.equal((await call('/requests', denied.session, { context: ended })).status, 403);
});

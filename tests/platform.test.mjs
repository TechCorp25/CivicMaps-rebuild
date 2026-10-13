import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from './helpers/environment.mjs';

let environment, pool, origin, operator, council;
const password = process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!';
async function call(path, data, session = operator, key = randomUUID(), extraHeaders = {}) {
  const response = await fetch(`${origin}/api${path}`, {
    method: data === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
      ...extraHeaders,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  return { status: response.status, data: await response.json(), response };
}
function input() {
  const suffix = randomUUID().replaceAll('-', '');
  return {
    name: 'Synthetic acceptance council',
    slug: `test-${suffix}`,
    packs: ['Local Laws'],
    firstName: 'Test',
    lastName: 'Admin',
    email: `${suffix}@synthetic.example`,
  };
}
before(async () => {
  environment = await createTestEnvironment({ platform: true });
  ({ pool, origin } = environment);
  for (const [path, email] of [
    ['/platform/auth/login', 'operator@platform.example'],
    ['/auth/login', 'dispatch@alpha.example'],
  ]) {
    const r = await call(path, { email, password }, null);
    assert.equal(r.status, 200);
    const session = { ...r.data, cookie: r.response.headers.get('set-cookie').split(';')[0] };
    if (path.includes('platform')) operator = session;
    else council = session;
  }
});
after(async () => {
  await environment?.close();
});

test('operator and council cookies cannot cross authentication boundaries', async () => {
  assert.equal((await call('/platform/municipalities', undefined, null)).status, 401);
  assert.equal((await call('/platform/municipalities', undefined, council)).status, 401);
  assert.equal((await call('/requests', undefined, operator)).status, 401);
  assert.equal(
    (await call('/platform/auth/login', { email: 'dispatch@alpha.example', password }, null))
      .status,
    401,
  );
  const restored = await call('/platform/auth/session');
  assert.equal(restored.data.actor.id, operator.actor.id);
  const login = await call(
    '/platform/auth/login',
    { email: 'operator@platform.example', password },
    null,
  );
  assert.match(login.response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.response.headers.get('set-cookie'), /SameSite=Strict/);
  assert.match(login.response.headers.get('set-cookie'), /Path=\/api\/platform/);
});

test('registration retries persist one council/admin/audit and never replay the password', async () => {
  const data = input();
  const key = randomUUID();
  const results = await Promise.all([
    call('/platform/municipalities', data, operator, key),
    call('/platform/municipalities', data, operator, key),
  ]);
  assert.deepEqual(
    results.map((r) => r.status),
    [201, 201],
  );
  const original = results.find((r) => r.data.temporaryPassword);
  const replay = results.find((r) => r.data.replayed);
  assert.ok(original && replay);
  assert.equal(original.data.municipality.id, replay.data.municipality.id);
  assert.equal(replay.data.temporaryPassword, undefined);
  assert.equal(original.data.municipality.status, 'Provisioning');
  const id = original.data.municipality.id;
  assert.equal(
    (await pool.query('SELECT id FROM platform_municipalities WHERE slug=$1', [data.slug]))
      .rowCount,
    1,
  );
  assert.equal(
    (await pool.query('SELECT * FROM platform_first_admins WHERE municipality_id=$1', [id]))
      .rowCount,
    1,
  );
  const audit = await pool.query('SELECT details FROM platform_audit WHERE municipality_id=$1', [
    id,
  ]);
  assert.equal(audit.rowCount, 1);
  const receipt = await pool.query(
    'SELECT response FROM platform_receipts WHERE operator_id=$1 AND key=$2',
    [operator.actor.id, key],
  );
  assert.ok(!JSON.stringify([audit.rows, receipt.rows]).includes(original.data.temporaryPassword));
  assert.equal(
    (await call('/platform/municipalities', { ...data, name: 'Different' }, operator, key)).status,
    409,
  );
});

test('duplicate slug and email registrations leave no partial rows', async () => {
  const data = input();
  assert.equal((await call('/platform/municipalities', data)).status, 201);
  assert.equal(
    (await call('/platform/municipalities', { ...input(), slug: data.slug })).status,
    409,
  );
  const duplicateEmail = { ...input(), email: data.email };
  assert.equal((await call('/platform/municipalities', duplicateEmail)).status, 409);
  assert.equal(
    (
      await pool.query('SELECT id FROM platform_municipalities WHERE slug=$1', [
        duplicateEmail.slug,
      ])
    ).rowCount,
    0,
  );
  const parallel = input();
  const results = await Promise.all([
    call('/platform/municipalities', parallel),
    call('/platform/municipalities', { ...parallel, email: input().email }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
});

test('slug, catalogue and unknown-field validation reject invalid registration', async () => {
  for (const change of [
    { slug: 'platform' },
    { slug: 'Upper' },
    { packs: [] },
    { packs: ['Unknown'] },
    { packs: ['Local Laws', 'Local Laws'] },
    { tenant_id: 'client-selected' },
  ]) {
    assert.equal((await call('/platform/municipalities', { ...input(), ...change })).status, 400);
  }
  assert.equal((await call('/platform/slug-availability?slug=platform')).status, 400);
  const data = input();
  assert.equal((await call(`/platform/slug-availability?slug=${data.slug}`)).data.available, true);
  await call('/platform/municipalities', data);
  assert.equal((await call(`/platform/slug-availability?slug=${data.slug}`)).data.available, false);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_platform_app');
    await assert.rejects(
      client.query('UPDATE platform_municipalities SET slug=$1 WHERE slug=$2', [
        input().slug,
        data.slug,
      ]),
      /immutable/,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('pack confirmations, retry receipts and concurrent versions retain records', async () => {
  const created = await call('/platform/municipalities', input());
  const id = created.data.municipality.id;
  const path = `/platform/municipalities/${id}/packs`;
  const disable = { pack: 'Local Laws', enabled: false, version: 1 };
  assert.equal((await call(path, disable)).status, 409);
  const key = randomUUID();
  const saved = await call(path, { ...disable, confirmed: true }, operator, key);
  assert.equal(saved.status, 200);
  const replay = await call(path, { ...disable, confirmed: true }, operator, key);
  assert.equal(replay.data.replayed, true);
  assert.equal((await call(path, { pack: 'Waste', enabled: true, version: 1 })).status, 409);
  const results = await Promise.all(
    ['Waste', 'Cleaning'].map((pack) => call(path, { pack, enabled: true, version: 2 })),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  const detail = await call(`/platform/municipalities/${id}`);
  assert.equal(detail.data.municipality.version, 3);
  assert.equal(detail.data.events.length, 3);
  assert.equal(
    (await pool.query('SELECT * FROM platform_first_admins WHERE municipality_id=$1', [id]))
      .rowCount,
    1,
  );
  assert.equal(
    detail.data.events.find((e) => e.action === 'pack_disabled').details.recordsRetained,
    true,
  );
});

test('CSRF and hostile origins deny changes without side effects', async () => {
  const data = input();
  for (const headers of [{ 'x-csrf-token': '' }, { Origin: 'https://hostile.example' }]) {
    assert.equal(
      (await call('/platform/municipalities', data, operator, randomUUID(), headers)).status,
      403,
    );
  }
  assert.equal(
    (await pool.query('SELECT id FROM platform_municipalities WHERE slug=$1', [data.slug]))
      .rowCount,
    0,
  );
});

test('database roles cannot read the opposite plane', async () => {
  for (const [role, table] of [
    ['civicmaps_platform_app', 'service_requests'],
    ['civicmaps_platform_app', 'users'],
    ['civicmaps_local_app', 'platform_municipalities'],
    ['civicmaps_local_app', 'platform_first_admins'],
  ]) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL ROLE ${role}`);
      await assert.rejects(client.query(`SELECT * FROM ${table}`), /permission denied/);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }
});

test('operator deactivation and logout revoke platform sessions', async () => {
  await pool.query('UPDATE platform_operators SET active=false WHERE id=$1', [operator.actor.id]);
  try {
    assert.equal((await call('/platform/municipalities')).status, 401);
  } finally {
    await pool.query('UPDATE platform_operators SET active=true WHERE id=$1', [operator.actor.id]);
  }
  assert.equal((await call('/platform/auth/logout', {})).status, 200);
  assert.equal((await call('/platform/municipalities')).status, 401);
});

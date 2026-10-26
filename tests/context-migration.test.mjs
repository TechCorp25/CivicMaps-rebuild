import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { hashPassword } from '../services/api/passwords.mjs';
import { createTestEnvironment } from './helpers/environment.mjs';
let environment, pool, origin;
const dispatcher = '00000000-0000-4000-8000-000000000001';
const unknown = randomUUID();
const legacyRequest = randomUUID();
const password = 'Synthetic-migration-only-2026!';
const hash = await hashPassword(password);
const key = 'synthetic-legacy-key';
before(async () => {
  environment = await createTestEnvironment({
    beforeMigrate: async (connectionString) => {
      const client = new pg.Client({ connectionString });
      await client.connect();
      try {
        await client.query(
          'CREATE TABLE civicmaps_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
        );
        for (const id of ['001-foundation', '002-auth-scope', '003-platform']) {
          await client.query(
            await readFile(
              new URL(`../services/api/migrations/${id}.sql`, import.meta.url),
              'utf8',
            ),
          );
          await client.query('INSERT INTO civicmaps_migrations(id) VALUES ($1)', [id]);
        }
        await client.query(
          `INSERT INTO users VALUES ($1,'dispatch@alpha.example','Alex · Dispatch',$2,'DISPATCHER','tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','day-team',true)`,
          [dispatcher, hash],
        );
        await client.query(
          `INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status)
    VALUES ($1,'tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','Synthetic historical location',0,0,'Preserve me','RECEIVED')`,
          [legacyRequest],
        );
        await client.query('INSERT INTO mutation_receipts VALUES ($1,$2,$3,$4)', [
          dispatcher,
          key,
          'legacy-fingerprint',
          JSON.stringify({ id: legacyRequest, notes: 'Preserve me' }),
        ]);
      } finally {
        await client.end();
      }
    },
  });
  ({ pool, origin } = environment);
  await pool.query(
    `INSERT INTO users SELECT $1,'unmapped@synthetic.example','Unmapped test principal',password_hash,
    'DISPATCHER',tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id,true FROM users WHERE id=$2`,
    [unknown, dispatcher],
  );
});
after(async () => environment?.close());
async function login(email) {
  const response = await fetch(`${origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200);
  return { ...(await response.json()), cookie: response.headers.get('set-cookie').split(';')[0] };
}
test('upgrade preserves records, passwords and legacy receipts without inferred capture or unknown grants', async () => {
  assert.equal(
    (await pool.query('SELECT password_hash FROM users WHERE id=$1', [dispatcher])).rows[0]
      .password_hash,
    hash,
  );
  const record = (await pool.query('SELECT * FROM service_requests WHERE id=$1', [legacyRequest]))
    .rows[0];
  assert.equal(record.notes, 'Preserve me');
  assert.equal(record.capture_binding_id, null);
  assert.equal(record.capture_binding_version, null);
  assert.equal(
    (
      await pool.query('SELECT * FROM mutation_receipts WHERE actor_id=$1 AND key=$2', [
        dispatcher,
        key,
      ])
    ).rowCount,
    1,
  );
  assert.equal(
    (await pool.query('SELECT * FROM operating_context_grants WHERE user_id=$1', [unknown]))
      .rowCount,
    0,
  );
  const session = await login('dispatch@alpha.example');
  const response = await fetch(`${origin}/api/requests`, { headers: { Cookie: session.cookie } });
  assert.equal(response.status, 200);
  assert.ok((await response.json()).requests.some((r) => r.id === legacyRequest));
  const replay = await fetch(`${origin}/api/requests`, {
    method: 'POST',
    headers: {
      Cookie: session.cookie,
      'x-csrf-token': session.csrfToken,
      'Idempotency-Key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address: 'Synthetic retry', latitude: 0, longitude: 0, notes: '' }),
  });
  assert.equal(replay.status, 409);
  assert.match((await replay.json()).error, /Legacy retry key/);
  assert.equal((await pool.query('SELECT * FROM service_requests')).rowCount, 1);
  const unmapped = await fetch(`${origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'unmapped@synthetic.example', password }),
  });
  assert.equal(unmapped.status, 401);
});
test('repeated migrations and seeds preserve grants and never resurrect revocations', async () => {
  const before = (await pool.query('SELECT count(*)::int AS count FROM operating_context_changes'))
    .rows[0].count;
  for (const script of ['migrate', 'seed', 'migrate', 'seed']) {
    const result = spawnSync(process.execPath, [`services/api/${script}.mjs`], {
      env: process.env,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
  }
  assert.equal(
    (await pool.query('SELECT count(*)::int AS count FROM operating_context_changes')).rows[0]
      .count,
    before,
  );
  assert.equal((await pool.query('SELECT * FROM civicmaps_migrations')).rowCount, 15);
  await pool.query(
    'UPDATE operating_context_grants SET revoked_at=clock_timestamp() WHERE user_id=$1',
    [dispatcher],
  );
  const result = spawnSync(process.execPath, ['services/api/seed.mjs'], {
    env: process.env,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(
    (
      await pool.query('SELECT revoked_at FROM operating_context_grants WHERE user_id=$1', [
        dispatcher,
      ])
    ).rows.every((r) => r.revoked_at),
  );
  assert.equal(
    (await pool.query('SELECT password_hash FROM users WHERE id=$1', [dispatcher])).rows[0]
      .password_hash,
    hash,
  );
});
test('migration aborts atomically on an unclassified pre-existing principal', async () => {
  const name = `civicmaps_owner_fail_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: environment.connectionString });
  let created = false;
  const target = new URL(environment.connectionString);
  target.pathname = `/${name}`;
  try {
    await admin.query(`CREATE DATABASE ${name}`);
    created = true;
    const client = new pg.Client({ connectionString: target.href });
    await client.connect();
    try {
      await client.query(
        'CREATE TABLE civicmaps_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
      );
      for (const id of ['001-foundation', '002-auth-scope', '003-platform']) {
        await client.query(
          await readFile(new URL(`../services/api/migrations/${id}.sql`, import.meta.url), 'utf8'),
        );
        await client.query('INSERT INTO civicmaps_migrations(id) VALUES($1)', [id]);
      }
      await client.query(
        `INSERT INTO users VALUES($1,'unclassified@example.test','Unclassified', $2,
        'DISPATCHER','tenant-x','jurisdiction-x','plane-x','organisation-x','branch-x','team-x',true)`,
        [randomUUID(), hash],
      );
    } finally {
      await client.end();
    }
    const run = spawnSync(process.execPath, ['services/api/migrate.mjs'], {
      env: { ...process.env, CIVICMAPS_DATABASE_URL: target.href },
      encoding: 'utf8',
    });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /Unclassified principal ownership/);
    const check = new pg.Client({ connectionString: target.href });
    await check.connect();
    try {
      assert.equal(
        (
          await check.query(
            "SELECT 1 FROM civicmaps_migrations WHERE id='014-council-principal-ownership'",
          )
        ).rowCount,
        0,
      );
      assert.equal(
        (await check.query("SELECT to_regclass('public.council_principal_owners') AS name")).rows[0]
          .name,
        null,
      );
    } finally {
      await check.end();
    }
  } finally {
    if (created) await admin.query(`DROP DATABASE ${name}`);
    await admin.end();
  }
});

import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';

let environment, pool, request;
const alpha = '10000000-0000-4000-8000-000000000001';
const beta = '10000000-0000-4000-8000-000000000002';
const actor = '00000000-0000-4000-8000-000000000001';
const scope = {
  context: alpha,
  actor,
  tenant: 'tenant-alpha',
  organisation: 'organisation-alpha',
  jurisdiction: 'jurisdiction-alpha',
  plane: 'plane-alpha',
  branch: 'parking',
};
const tables = [
  'service_requests',
  'audit_events',
  'users',
  'operating_context_grants',
  'mutation_receipts',
  'legacy_mutation_keys',
];
before(async () => {
  environment = await createTestEnvironment({
    beforeMigrate: async (connectionString) => {
      const client = new pg.Client({ connectionString });
      await client.connect();
      try {
        await client.query(
          'CREATE TABLE civicmaps_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
        );
        for (const id of [
          '001-foundation',
          '002-auth-scope',
          '003-platform',
          '004-operating-context',
        ]) {
          await client.query(
            await readFile(
              new URL(`../services/api/migrations/${id}.sql`, import.meta.url),
              'utf8',
            ),
          );
          await client.query('INSERT INTO civicmaps_migrations(id) VALUES ($1)', [id]);
        }
      } finally {
        await client.end();
      }
    },
  });
  ({ pool } = environment);
  const login = await fetch(`${environment.origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dispatch@alpha.example',
      password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!',
    }),
  });
  assert.equal(login.status, 200);
  const session = await login.json();
  const response = await fetch(`${environment.origin}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: login.headers.get('set-cookie').split(';')[0],
      'x-csrf-token': session.csrfToken,
      'Idempotency-Key': randomUUID(),
    },
    body: JSON.stringify({
      address: 'Synthetic RLS regression',
      latitude: 0,
      longitude: 0,
      notes: '',
    }),
  });
  assert.equal(response.status, 201);
  request = await response.json();
  await pool.query('INSERT INTO legacy_mutation_keys VALUES ($1,$2)', [actor, 'synthetic-old-key']);
});
after(async () => environment?.close());
async function setScope(client, values) {
  for (const [key, value] of Object.entries(values))
    await client.query('SELECT set_config($1,$2,true)', [`civicmaps.${key}`, value]);
}
async function assertHidden(client) {
  for (const table of tables)
    assert.equal((await client.query(`SELECT * FROM ${table}`)).rowCount, 0, table);
}
test('004 upgrade gates all operational tables on a complete consistent context and resets on reuse', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    await assertHidden(client);
    await setScope(client, scope);
    assert.equal((await client.query('SELECT * FROM council_principal_owners')).rowCount, 1);
    await assert.rejects(
      client.query('UPDATE council_principal_owners SET municipality_id=$2 WHERE user_id=$1', [
        actor,
        '20000000-0000-4000-8000-000000000002',
      ]),
      /permission denied/,
    );
    for (const table of tables)
      assert.ok((await client.query(`SELECT * FROM ${table}`)).rowCount > 0, table);
    for (const key of Object.keys(scope)) {
      for (const value of ['', 'invalid', ...(key === 'context' ? [beta] : [])]) {
        await setScope(client, { [key]: value });
        await assertHidden(client);
        assert.equal(
          (
            await client.query("UPDATE service_requests SET notes='forbidden' WHERE id=$1", [
              request.id,
            ])
          ).rowCount,
          0,
        );
        await client.query('SAVEPOINT denied_insert');
        await assert.rejects(
          client.query(
            `INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status,capture_binding_id,capture_binding_version)
          VALUES ($1,'tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','Denied',0,0,'','RECEIVED',$2,1)`,
            [randomUUID(), alpha],
          ),
          /row-level security/,
        );
        await client.query('ROLLBACK TO SAVEPOINT denied_insert');
        await setScope(client, { [key]: scope[key] });
      }
    }
    await client.query('COMMIT');
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    await assertHidden(client);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
test('database gate denies ungranted actors and ineffective bindings or grants', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const target of ['binding', 'grant']) {
      for (const state of ['future', 'expired', 'revoked']) {
        const id = randomUUID();
        const period =
          state === 'future'
            ? ['2999-01-01', null, null]
            : state === 'expired'
              ? ['2020-01-01', '2021-01-01', null]
              : ['2020-01-01', null, '2021-01-01'];
        await client.query(
          `INSERT INTO operating_context_bindings SELECT $1,$1,1,municipality_id,tenant_id,organisation_id,jurisdiction_id,data_plane_id,branch_id,$3,$4,$5,now() FROM operating_context_bindings WHERE id=$2`,
          [id, alpha, ...(target === 'binding' ? period : ['2020-01-01', null, null])],
        );
        await client.query('INSERT INTO operating_context_grants VALUES ($1,$2,$3,$4,$5)', [
          actor,
          id,
          ...(target === 'grant' ? period : ['2020-01-01', null, null]),
        ]);
        await client.query('SET LOCAL ROLE civicmaps_local_app');
        await setScope(client, { ...scope, context: id });
        await assertHidden(client);
        await client.query('RESET ROLE');
      }
    }
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    await setScope(client, { ...scope, actor: '00000000-0000-4000-8000-000000000004' });
    await assertHidden(client);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

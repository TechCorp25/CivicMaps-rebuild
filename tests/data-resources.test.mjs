import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from './helpers/environment.mjs';
import {
  applyDataMigrations,
  resourceNames,
  storageSessionPolicy,
  withMunicipalityResource,
} from '../services/api/data-resources.mjs';
let environment, pool, enqueueProvisioning, runProvisioningOnce;
const alpha = '20000000-0000-4000-8000-000000000001';
const beta = '20000000-0000-4000-8000-000000000002';
before(async () => {
  environment = await createTestEnvironment({ platform: true });
  pool = environment.pool;
  ({ enqueueProvisioning, runProvisioningOnce } = await import('../services/api/provisioning.mjs'));
});
after(async () => {
  delete process.env.CIVICMAPS_PROVISIONING_PROFILE;
  await environment?.close();
});
test('resource identifiers are stable and reject SQL/path injection', () => {
  const job = { id: randomUUID(), municipality_id: alpha };
  assert.deepEqual(resourceNames(job), resourceNames(job));
  assert.throws(() => resourceNames({ ...job, id: 'x; DROP ROLE postgres' }));
  assert.throws(() => resourceNames({ ...job, municipality_id: '../beta' }));
  const names = resourceNames(job);
  const policy = storageSessionPolicy('synthetic-f05-bucket', names.storage_prefix);
  assert.deepEqual(policy.Statement[0].Condition.StringLike['s3:prefix'], [
    `${names.storage_prefix}*`,
  ]);
  assert.equal(
    policy.Statement[1].Resource,
    `arn:aws:s3:::synthetic-f05-bucket/${names.storage_prefix}*`,
  );
  assert.throws(() => storageSessionPolicy('synthetic-f05-bucket', '*'));
});
test('explicit AWS profile checkpoints registry without promoting historical jobs', async () => {
  const operator = (await pool.query('SELECT id FROM platform_operators LIMIT 1')).rows[0];
  const client = await pool.connect();
  let jobId;
  try {
    process.env.CIVICMAPS_PROVISIONING_PROFILE = 'aws-sydney-development';
    await client.query('BEGIN');
    jobId = await enqueueProvisioning(client, alpha, operator.id);
    await client.query('COMMIT');
  } finally {
    delete process.env.CIVICMAPS_PROVISIONING_PROFILE;
    client.release();
  }
  const adapter = {
    async reconcile() {
      return null;
    },
    async apply(job, step) {
      return `aws:${job.id}:${step.name === 'prepare_workspace' ? 'database' : 'storage'}`;
    },
  };
  await runProvisioningOnce({ adapter });
  await runProvisioningOnce({ adapter });
  assert.equal(
    (await pool.query('SELECT state FROM provisioning_jobs WHERE id=$1', [jobId])).rows[0].state,
    'succeeded',
  );
  const registry = (
    await pool.query('SELECT * FROM municipality_resources WHERE job_id=$1', [jobId])
  ).rows[0];
  assert.equal(registry.municipality_id, alpha);
  assert.equal(registry.schema_version, 2);
  assert.equal(
    (await pool.query('SELECT * FROM municipality_resource_contexts')).rowCount,
    0,
    'Resource creation cannot grant user access',
  );
  assert.equal(
    (await pool.query('SELECT * FROM provisioning_jobs WHERE municipality_id=$1', [beta])).rowCount,
    0,
  );
  const runtime = await pool.connect();
  try {
    await runtime.query('BEGIN');
    await runtime.query('SET LOCAL ROLE civicmaps_local_app');
    await assert.rejects(runtime.query('SELECT * FROM municipality_resources'), { code: '42501' });
  } finally {
    await runtime.query('ROLLBACK');
    runtime.release();
  }
});
test('backend denies unbound context, forged selector and tampered resource registry before external access', async () => {
  const user = (
    await pool.query(`SELECT u.*,o.municipality_id AS owner_municipality_id
      FROM users u JOIN council_principal_owners o ON o.user_id=u.id
      WHERE u.email='dispatch@alpha.example'`)
  ).rows[0];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await assert.rejects(
      withMunicipalityResource(client, user, undefined, {}, () => assert.fail('Access granted')),
      { status: 403 },
    );
    await assert.rejects(
      withMunicipalityResource(client, user, '10000000-0000-4000-8000-000000000002', {}, () =>
        assert.fail('Access granted'),
      ),
      { status: 403 },
    );
    await client.query(
      `INSERT INTO municipality_resource_contexts SELECT job_id,'10000000-0000-4000-8000-000000000001' FROM municipality_resources WHERE municipality_id=$1`,
      [alpha],
    );
    await client.query(
      "UPDATE municipality_resources SET secret_ref='foreign-secret' WHERE municipality_id=$1",
      [alpha],
    );
    await assert.rejects(
      withMunicipalityResource(client, user, undefined, {}, () => assert.fail('Access granted')),
      /registry binding conflict/,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('resource status helper skips storage credentials and denies revoked or disabled scope before connection', async () => {
  const user = (await pool.query("SELECT * FROM users WHERE email='dispatch@alpha.example'"))
    .rows[0];
  const client = await pool.connect();
  let connectionCalls = 0;
  const fakeConnection = {
    async query(sql) {
      assert.equal(sql, 'SELECT 1');
      return { rowCount: 1 };
    },
    async end() {},
  };
  const options = {
    includeStorage: false,
    async runtimeConnection() {
      connectionCalls += 1;
      return fakeConnection;
    },
    async storageCredentials() {
      assert.fail('DB readiness check must not request STS storage credentials');
    },
  };
  try {
    await client.query('BEGIN');
    const binding = (
      await client.query('SELECT binding_id FROM operating_context_grants WHERE user_id=$1', [
        user.id,
      ])
    ).rows[0].binding_id;
    await client.query(
      `INSERT INTO municipality_resource_contexts(job_id,binding_id)
       SELECT job_id,$2 FROM municipality_resources WHERE municipality_id=$1`,
      [alpha, binding],
    );
    const target = { bucket: 'synthetic-f05-bucket' };
    const ready = await withMunicipalityResource(
      client,
      user,
      binding,
      target,
      async ({ connection, storage }) => {
        assert.equal(storage, undefined);
        await connection.query('SELECT 1');
        return true;
      },
      options,
    );
    assert.equal(ready, true);
    assert.equal(connectionCalls, 1);

    const withStorage = await withMunicipalityResource(
      client,
      user,
      binding,
      target,
      async ({ storage }) => storage,
      {
        runtimeConnection: async () => {
          connectionCalls += 1;
          return fakeConnection;
        },
        storageCredentials: async () => ({ AccessKeyId: 'synthetic-only' }),
      },
    );
    assert.deepEqual(withStorage, {
      bucket: target.bucket,
      prefix: (
        await pool.query(
          'SELECT storage_prefix FROM municipality_resources WHERE municipality_id=$1',
          [alpha],
        )
      ).rows[0].storage_prefix,
      credentials: { AccessKeyId: 'synthetic-only' },
    });
    assert.equal(connectionCalls, 2);

    await client.query(
      'UPDATE municipality_resources SET disabled_at=clock_timestamp() WHERE municipality_id=$1',
      [alpha],
    );
    await assert.rejects(
      withMunicipalityResource(
        client,
        user,
        binding,
        target,
        () => assert.fail('Disabled resource reached'),
        options,
      ),
      { status: 403 },
    );
    await client.query(
      'UPDATE municipality_resources SET disabled_at=NULL WHERE municipality_id=$1',
      [alpha],
    );
    await client.query(
      'UPDATE operating_context_bindings SET revoked_at=clock_timestamp() WHERE id=$1',
      [binding],
    );
    await assert.rejects(
      withMunicipalityResource(
        client,
        user,
        binding,
        target,
        () => assert.fail('Revoked context reached'),
        options,
      ),
      { status: 403 },
    );
    assert.equal(connectionCalls, 2, 'denied states fail before opening the resource connection');
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('data schema upgrade rolls back failure and preserves populated records on retry/replay', async () => {
  const runtime = resourceNames({ id: randomUUID(), municipality_id: alpha }).runtime_name;
  const client = await pool.connect();
  try {
    await client.query(`CREATE ROLE ${runtime} NOLOGIN`);
    await applyDataMigrations(client, runtime, { targetVersion: 1 });
    const id = randomUUID();
    await client.query('INSERT INTO council.resource_records VALUES ($1,$2)', [
      id,
      'synthetic upgrade record',
    ]);
    await assert.rejects(
      applyDataMigrations(client, runtime, { failVersion: 2 }),
      /Injected migration failure/,
    );
    assert.deepEqual((await client.query('SELECT version FROM council.schema_versions')).rows, [
      { version: 1 },
    ]);
    assert.equal(
      (
        await client.query(
          "SELECT 1 FROM information_schema.columns WHERE table_schema='council' AND table_name='resource_records' AND column_name='created_at'",
        )
      ).rowCount,
      0,
    );
    await applyDataMigrations(client, runtime);
    await applyDataMigrations(client, runtime);
    await client.query(`SET ROLE ${runtime}`);
    const record = (await client.query('SELECT * FROM council.resource_records WHERE id=$1', [id]))
      .rows[0];
    assert.equal(record.value, 'synthetic upgrade record');
    assert.ok(record.created_at);
    await assert.rejects(client.query('SELECT * FROM council.schema_versions'), { code: '42501' });
  } finally {
    await client.query('RESET ROLE');
    await client.query(`DROP OWNED BY ${runtime}`);
    await client.query(`DROP ROLE ${runtime}`);
    client.release();
  }
});

test('maintenance pause and two-municipality capacity reject new jobs before effects', async () => {
  const client = await pool.connect();
  const operator = (await client.query('SELECT id FROM platform_operators LIMIT 1')).rows[0];
  try {
    process.env.CIVICMAPS_PROVISIONING_PAUSED = '1';
    await assert.rejects(enqueueProvisioning(client, beta, operator.id), { status: 409 });
    delete process.env.CIVICMAPS_PROVISIONING_PAUSED;
    process.env.CIVICMAPS_PROVISIONING_PROFILE = 'aws-sydney-development';
    await client.query('BEGIN');
    await enqueueProvisioning(client, beta, operator.id);
    await assert.rejects(enqueueProvisioning(client, alpha, operator.id), { status: 409 });
    await client.query('ROLLBACK');
    assert.equal(
      (await client.query('SELECT 1 FROM provisioning_jobs WHERE municipality_id=$1', [beta]))
        .rowCount,
      0,
    );
  } finally {
    delete process.env.CIVICMAPS_PROVISIONING_PAUSED;
    delete process.env.CIVICMAPS_PROVISIONING_PROFILE;
    await client.query('ROLLBACK');
    client.release();
  }
});

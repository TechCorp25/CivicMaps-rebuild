// Explicit cloud acceptance: never included in the default CI suite or inferred from mocks.
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';
import {
  aws,
  configuredDataTarget,
  resourceNames,
  provisionDatabase,
  provisionStorage,
  runtimeConnection,
  migrateDataResource,
  storageCredentials,
  setDatabaseAccess,
  withMunicipalityResource,
} from '../services/api/data-resources.mjs';
if (process.env.CIVICMAPS_CLOUD_ACCEPTANCE !== 'F05-synthetic-only')
  throw new Error('Explicit cloud acceptance selector required');
const target = configuredDataTarget();
const identity = await aws('sts', 'get-caller-identity');
assert.equal(identity.Account, '597663815195');
// Never allow pg's environment or password-file fallback in authentication-negative cases.
delete process.env.PGPASSWORD;
const authenticationDirectory = await mkdtemp(join(tmpdir(), 'civicmaps-f05-auth-'));
process.env.PGPASSFILE = join(authenticationDirectory, 'empty-password-file');
await writeFile(process.env.PGPASSFILE, '', { mode: 0o600 });
const environment = await createTestEnvironment({ platform: true });
const { pool } = environment;
const { runProvisioningOnce, finishProvisioning, controlProvisioning } =
  await import('../services/api/provisioning.mjs');
const jobs = [1, 2].map((n) => ({
  id: `f0500000-0000-4000-8000-00000000000${n}`,
  municipality_id: `20000000-0000-4000-8000-00000000000${n}`,
  adapter: 'aws-postgres-s3',
  profile: 'aws-sydney-development',
}));
const proof = [];
function passed(name) {
  proof.push(name);
  console.log(`PASS ${name}`);
}
const tls = { ca: await readFile(target.caPath, 'utf8'), rejectUnauthorized: true };
async function secret(job) {
  return JSON.parse(
    (await aws('secretsmanager', 'get-secret-value', { SecretId: resourceNames(job).secret_ref }))
      .SecretString,
  );
}
async function rawConnect(value, overrides = {}) {
  const connection = new pg.Client({
    host: target.host,
    port: 5432,
    user: value.username,
    password: value.password,
    database: value.database,
    ssl: tls,
    connectionTimeoutMillis: 10000,
    ...overrides,
  });
  const mechanisms = [];
  connection.connection.on('authenticationSASL', (message) =>
    mechanisms.push(...message.mechanisms),
  );
  try {
    await connection.connect();
    assert.ok(mechanisms.includes('SCRAM-SHA-256'), 'Server did not challenge with SCRAM');
    return connection;
  } catch (error) {
    await connection.end();
    throw error;
  }
}
async function deniedConnect(value, overrides, authentication = false) {
  await assert.rejects(
    async () => {
      const c = await rawConnect(value, overrides);
      await c.end();
    },
    (error) =>
      authentication
        ? error.code === '28P01' || /SCRAM.*password/.test(error.message)
        : error.code === '42501' || error.code === '28000',
  );
}
try {
  const operator = (await pool.query('SELECT id FROM platform_operators LIMIT 1')).rows[0].id;
  for (const job of jobs) {
    await pool.query(
      'INSERT INTO provisioning_jobs(id,municipality_id,operator_id,adapter,profile) VALUES($1,$2,$3,$4,$5)',
      [job.id, job.municipality_id, operator, job.adapter, job.profile],
    );
    for (const [i, name] of ['prepare_workspace', 'prepare_services'].entries())
      await pool.query('INSERT INTO provisioning_steps(job_id,name,position) VALUES($1,$2,$3)', [
        job.id,
        name,
        i + 1,
      ]);
  }
  for (const [i, job] of jobs.entries()) {
    let exists = true;
    try {
      await aws('secretsmanager', 'describe-secret', { SecretId: resourceNames(job).secret_ref });
    } catch (error) {
      if (error.code !== 'RESOURCE_ABSENT') throw error;
      exists = false;
    }
    if (!exists) await provisionDatabase(job, target, { targetVersion: 1 });
    const initial = await runtimeConnection(job, target);
    let needsUpgrade;
    try {
      await initial.query(
        'INSERT INTO council.resource_records(id,value) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',
        [`f0500000-0000-4000-9000-00000000000${i + 1}`, `synthetic-${i}`],
      );
      needsUpgrade = !(
        await initial.query(
          "SELECT 1 FROM information_schema.columns WHERE table_schema='council' AND table_name='resource_records' AND column_name='created_at'",
        )
      ).rowCount;
    } finally {
      await initial.end();
    }
    if (needsUpgrade) {
      await assert.rejects(
        migrateDataResource(job, target, { failVersion: 2 }),
        /Injected migration failure/,
      );
      passed(`municipality ${i + 1}: live version-1 data retained after failed version-2 upgrade`);
    }
  }
  const savedCredential = await secret(jobs[0]);
  await setDatabaseAccess(jobs[0], target, false);
  try {
    await runProvisioningOnce({ leaseMs: 300000 });
    const failed = (
      await pool.query('SELECT state,error FROM provisioning_jobs WHERE id=$1', [jobs[0].id])
    ).rows[0];
    assert.equal(failed.state, 'failed');
    assert.equal((await pool.query('SELECT * FROM municipality_resources')).rowCount, 0);
    assert.equal(
      (await pool.query('SELECT * FROM provisioning_steps WHERE resource_id IS NOT NULL')).rowCount,
      0,
    );
    assert.equal(JSON.stringify(failed).includes(savedCredential.password), false);
  } finally {
    await setDatabaseAccess(jobs[0], target, true);
  }
  const recovery = await pool.connect();
  try {
    await recovery.query('BEGIN');
    await controlProvisioning(
      recovery,
      { id: operator },
      jobs[0].municipality_id,
      jobs[0].id,
      'retry',
    );
    await recovery.query('COMMIT');
  } finally {
    await recovery.query('ROLLBACK');
    recovery.release();
  }
  passed(
    'real runtime authentication failure persists failed job without false inventory or secrets; operator retry recovers owned resources',
  );
  // A real child process dies after a committed cloud effect but before its SQL checkpoint.
  const crash = spawnSync(process.execPath, ['services/api/provisioning-worker.mjs', '--once'], {
    env: { ...process.env, NODE_ENV: 'test', CIVICMAPS_WORKER_TEST_FAULT: 'after-effect' },
    encoding: 'utf8',
    timeout: 180000,
  });
  assert.equal(crash.status, 87, crash.stderr || 'Worker did not reach the cloud effect');
  const old = (
    await pool.query(
      "SELECT j.*,s.name,s.attempts AS step_attempts FROM provisioning_jobs j JOIN provisioning_steps s ON s.job_id=j.id WHERE j.state='running' AND s.state='running'",
    )
  ).rows[0];
  const before = await secret(old);
  await pool.query(
    "UPDATE provisioning_jobs SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",
    [old.id],
  );
  for (let i = 0; i < 5; i++) await runProvisioningOnce({ leaseMs: 300000 });
  assert.equal(
    (await pool.query("SELECT count(*)::int AS n FROM provisioning_jobs WHERE state='succeeded'"))
      .rows[0].n,
    2,
  );
  assert.equal(
    await finishProvisioning(
      { ...old, step: { name: old.name, attempts: old.step_attempts } },
      { resourceId: `aws:${old.id}:database` },
    ),
    false,
  );
  assert.equal(
    (await secret(old)).password === before.password,
    true,
    'Retry rotated credentials unexpectedly',
  );
  assert.equal((await pool.query('SELECT * FROM municipality_resources')).rowCount, 2);
  passed('worker crash recovery, stable credentials/inventory and stale lease rejection');
  const values = await Promise.all(jobs.map(secret));
  for (const [i, job] of jobs.entries()) {
    const own = values[i],
      other = values[1 - i];
    const verified = await rawConnect(own);
    await verified.end();
    const connection = await runtimeConnection(job, target);
    try {
      assert.equal(
        (await connection.query('SHOW password_encryption')).rows[0].password_encryption,
        'scram-sha-256',
      );
      const sample = `f0500000-0000-4000-9000-00000000000${i + 1}`;
      await connection.query(
        'INSERT INTO council.resource_records(id,value) VALUES($1,$2) ON CONFLICT(id) DO NOTHING',
        [sample, `synthetic-${i}`],
      );
      assert.equal(
        (await connection.query('SELECT value FROM council.resource_records WHERE id=$1', [sample]))
          .rows[0].value,
        `synthetic-${i}`,
      );
      for (const sql of [
        'CREATE SCHEMA forbidden',
        'CREATE DATABASE forbidden',
        'CREATE ROLE forbidden',
        'SET ROLE civicmaps_provisioner',
        'SELECT * FROM pg_authid',
        'SELECT * FROM council.schema_versions',
      ])
        await assert.rejects(connection.query(sql), { code: '42501' });
    } finally {
      await connection.end();
    }
    await setDatabaseAccess(job, target, false);
    try {
      await deniedConnect(own, {});
    } finally {
      await setDatabaseAccess(job, target, true);
    }
    await deniedConnect(own, { password: 'incorrect-password' }, true);
    await deniedConnect(own, { password: '' }, true);
    await deniedConnect(own, { user: other.username, database: other.database }, true);
    await deniedConnect(own, { database: other.database });
    await deniedConnect(own, { database: 'postgres' });
    await deniedConnect(own, { database: 'template1' });
    await assert.rejects(rawConnect(own, { ssl: false }), { code: '28000' });
    await provisionDatabase(job, target);
    await migrateDataResource(job, target);
    const again = await runtimeConnection(job, target);
    try {
      assert.ok(
        (await again.query('SELECT created_at FROM council.resource_records')).rows[0].created_at,
      );
      assert.equal(
        (await again.query('SELECT count(*)::int AS n FROM council.resource_records')).rows[0].n,
        1,
      );
    } finally {
      await again.end();
    }
  }
  passed(
    'own SCRAM/TLS access; wrong, missing, swapped passwords; sibling/control database and privilege denial; migration replay preserves data',
  );
  // Evidence policy is enforced by S3 using independent short-lived role sessions.
  const sessions = await Promise.all(jobs.map((job) => storageCredentials(job, target)));
  for (const [i, job] of jobs.entries()) {
    const own = resourceNames(job).storage_prefix,
      other = resourceNames(jobs[1 - i]).storage_prefix;
    const credentials = sessions[i];
    await aws(
      's3api',
      'put-object',
      { Bucket: target.bucket, Key: `${own}acceptance` },
      credentials,
    );
    await aws(
      's3api',
      'get-object',
      { Bucket: target.bucket, Key: `${own}acceptance` },
      credentials,
    );
    await aws('s3api', 'list-objects-v2', { Bucket: target.bucket, Prefix: own }, credentials);
    for (const [operation, input] of [
      ['list-objects-v2', { Bucket: target.bucket, Prefix: other }],
      ['list-objects-v2', { Bucket: target.bucket }],
      ['get-object', { Bucket: target.bucket, Key: `${other}.owned` }],
      ['put-object', { Bucket: target.bucket, Key: `${other}forged` }],
      ['delete-object', { Bucket: target.bucket, Key: `${other}.owned` }],
      ['put-object', { Bucket: target.bucket, Key: 'municipalities/../forged' }],
    ])
      await assert.rejects(aws('s3api', operation, input, credentials), { code: 'ACCESS_DENIED' });
    await assert.rejects(
      aws('secretsmanager', 'get-secret-value', { SecretId: target.masterSecret }, credentials),
      { code: 'ACCESS_DENIED' },
    );
    await assert.rejects(
      aws(
        'sts',
        'assume-role',
        { RoleArn: target.roleArn, RoleSessionName: 'forged' },
        credentials,
      ),
      { code: 'ACCESS_DENIED' },
    );
    await aws(
      's3api',
      'delete-object',
      { Bucket: target.bucket, Key: `${own}acceptance` },
      credentials,
    );
    await provisionStorage(job, target);
  }
  passed(
    'S3 own list/read/write/delete; sibling, forged key, secret access and role escalation denied',
  );
  for (const [i, job] of jobs.entries())
    await pool.query(
      'INSERT INTO municipality_resource_contexts(job_id,binding_id) VALUES($1,$2)',
      [job.id, `10000000-0000-4000-8000-00000000000${i + 1}`],
    );
  const client = await pool.connect();
  try {
    const user = (await client.query("SELECT * FROM users WHERE email='dispatch@alpha.example'"))
      .rows[0];
    // Fault a real runtime password, then test the same resolver used by HTTP requests.
    const master = JSON.parse(
      (await aws('secretsmanager', 'get-secret-value', { SecretId: target.masterSecret }))
        .SecretString,
    );
    const administrator = await rawConnect(master, { database: 'postgres' });
    async function password(value) {
      const sql = (
        await administrator.query(
          "SELECT format('ALTER ROLE %I PASSWORD %L',$1::text,$2::text) AS sql",
          [values[0].username, value],
        )
      ).rows[0].sql;
      await administrator.query(sql);
    }
    try {
      await password(values[1].password);
      await assert.rejects(
        withMunicipalityResource(client, user, undefined, target, () =>
          assert.fail('Swapped credential accepted'),
        ),
        /Data resource authentication failed/,
      );
    } finally {
      await password(values[0].password);
      await administrator.end();
    }
    passed(
      'actual backend rejects swapped runtime credentials; owned login disable/re-enable preserves data',
    );
    for (let n = 0; n < 3; n++) {
      await client.query('BEGIN');
      await withMunicipalityResource(client, user, undefined, target, async ({ connection }) =>
        assert.equal(
          (await connection.query('SELECT value FROM council.resource_records')).rows[0].value,
          'synthetic-0',
        ),
      );
      await assert.rejects(
        withMunicipalityResource(client, user, '10000000-0000-4000-8000-000000000002', target, () =>
          assert.fail('Cross-context access'),
        ),
        { status: 403 },
      );
      await client.query('COMMIT');
    }
    await client.query(
      'UPDATE municipality_resources SET disabled_at=clock_timestamp() WHERE job_id=$1',
      [jobs[0].id],
    );
    await assert.rejects(
      withMunicipalityResource(client, user, undefined, target, () =>
        assert.fail('Disabled resource access'),
      ),
      { status: 403 },
    );
    await client.query('UPDATE municipality_resources SET disabled_at=NULL WHERE job_id=$1', [
      jobs[0].id,
    ]);
  } finally {
    client.release();
  }
  const login = await fetch(`${environment.origin}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dispatch@alpha.example', password: 'CivicMAPS-local-2026!' }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal(
    (await fetch(`${environment.origin}/api/resources/status`, { headers: { Cookie: cookie } }))
      .status,
    200,
  );
  assert.equal(
    (
      await fetch(`${environment.origin}/api/resources/status`, {
        headers: { Cookie: cookie, 'X-CivicMAPS-Context': '10000000-0000-4000-8000-000000000002' },
      })
    ).status,
    403,
  );
  passed('actual backend/API context resolver and disable-without-delete rollback');
  console.log(
    JSON.stringify({
      profile: 'aws-sydney-development',
      project: identity.Account,
      region: 'ap-southeast-2',
      proof,
      retained: jobs.map((job) => ({
        jobId: job.id,
        municipalityId: job.municipality_id,
        ...resourceNames(job),
      })),
    }),
  );
} finally {
  await environment.close();
  await rm(authenticationDirectory, { recursive: true, force: true });
}

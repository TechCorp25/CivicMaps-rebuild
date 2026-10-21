import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomBytes } from 'node:crypto';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { resolveContext } from './operating-context.mjs';
const execute = promisify(execFile);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const resourceProfile = 'aws-sydney-development';
export const dataSchemaVersion = 2;
export function resourceNames(job) {
  if (!uuid.test(job.id) || !uuid.test(job.municipality_id))
    throw new Error('Invalid resource owner');
  const key = job.id.replaceAll('-', '');
  return {
    database_name: `civicmaps_${key}`,
    runtime_name: `runtime_${key}`,
    secret_ref: `civicmaps/f05/${job.id}`,
    storage_prefix: `municipalities/${job.municipality_id}/${job.id}/`,
  };
}
export function storageSessionPolicy(bucket, prefix) {
  if (
    !/^[a-z0-9.-]{3,63}$/.test(bucket) ||
    !/^municipalities\/[0-9a-f-]{36}\/[0-9a-f-]{36}\/$/.test(prefix)
  )
    throw new Error('Invalid storage namespace');
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: `arn:aws:s3:::${bucket}`,
        Condition: { StringLike: { 's3:prefix': [`${prefix}*`] } },
      },
      {
        Effect: 'Allow',
        Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
        Resource: `arn:aws:s3:::${bucket}/${prefix}*`,
      },
    ],
  };
}
export async function aws(service, operation, input = {}, credentials) {
  const env = {
    ...process.env,
    AWS_PAGER: '',
    AWS_DEFAULT_REGION: 'ap-southeast-2',
    AWS_REGION: 'ap-southeast-2',
  };
  if (credentials) {
    if (
      ['AccessKeyId', 'SecretAccessKey', 'SessionToken'].some(
        (key) => typeof credentials[key] !== 'string' || !credentials[key],
      )
    )
      throw new Error('Incomplete runtime credentials');
    // A runtime call must never fall back to the broker's profile or instance role.
    delete env.AWS_PROFILE;
    env.AWS_ACCESS_KEY_ID = credentials.AccessKeyId;
    env.AWS_SECRET_ACCESS_KEY = credentials.SecretAccessKey;
    env.AWS_SESSION_TOKEN = credentials.SessionToken;
  }
  let downloadDirectory;
  try {
    // The CLI download writer needs an ordinary writable file, not /dev/null.
    if (service === 's3api' && operation === 'get-object')
      downloadDirectory = await mkdtemp(join(tmpdir(), 'civicmaps-f05-object-'));
    const { stdout } = await execute(
      process.env.CIVICMAPS_AWS_BINARY ?? 'aws',
      [
        service,
        operation,
        '--region',
        'ap-southeast-2',
        ...(downloadDirectory
          ? ['--bucket', input.Bucket, '--key', input.Key]
          : ['--cli-input-json', JSON.stringify(input)]),
        '--output',
        'json',
        '--cli-connect-timeout',
        '5',
        '--cli-read-timeout',
        '20',
        ...(downloadDirectory ? [join(downloadDirectory, 'object')] : []),
      ],
      { env, timeout: 30_000, maxBuffer: 1024 * 1024 },
    );
    return stdout.trim() ? JSON.parse(stdout) : {};
  } catch (error) {
    // CLI exceptions contain arguments and captured secret output; never propagate them.
    const missing = /ResourceNotFoundException|NoSuchKey|NoSuchEntity|Not Found/.test(
      error.stderr ?? '',
    );
    const reason =
      /An error occurred \(([A-Za-z0-9]+)\)/.exec(error.stderr ?? '')?.[1] ?? 'CommandFailure';
    throw Object.assign(
      new Error(missing ? 'AWS resource absent' : `AWS ${service}.${operation} failed (${reason})`),
      {
        code: missing
          ? 'RESOURCE_ABSENT'
          : /AccessDenied|UnauthorizedOperation/.test(error.stderr ?? '')
            ? 'ACCESS_DENIED'
            : 'AWS_FAILED',
      },
    );
  } finally {
    if (downloadDirectory) await rm(downloadDirectory, { recursive: true, force: true });
  }
}
export function configuredDataTarget() {
  const {
    CIVICMAPS_RESOURCE_HOST: host,
    CIVICMAPS_RESOURCE_MASTER_SECRET: masterSecret,
    CIVICMAPS_RESOURCE_BUCKET: bucket,
    CIVICMAPS_RESOURCE_ROLE: roleArn,
    CIVICMAPS_RESOURCE_CA: caPath,
  } = process.env;
  if (
    !host ||
    !host.endsWith('.ap-southeast-2.rds.amazonaws.com') ||
    !masterSecret?.startsWith('arn:aws:secretsmanager:ap-southeast-2:597663815195:secret:') ||
    !bucket ||
    !roleArn?.startsWith('arn:aws:iam::597663815195:role/') ||
    !caPath
  )
    throw new Error('F05 target configuration is incomplete');
  return { host, masterSecret, bucket, roleArn, caPath };
}
async function connect(target, user, password, database = 'postgres') {
  const client = new pg.Client({
    host: target.host,
    port: 5432,
    user,
    password,
    database,
    ssl: { ca: await readFile(target.caPath, 'utf8'), rejectUnauthorized: true },
    connectionTimeoutMillis: 10_000,
    statement_timeout: 20_000,
  });
  try {
    await client.connect();
    return client;
  } catch {
    await client.end();
    throw new Error('Data resource authentication failed');
  }
}
async function adminConnection(target, database) {
  const secret = JSON.parse(
    (await aws('secretsmanager', 'get-secret-value', { SecretId: target.masterSecret }))
      .SecretString,
  );
  return connect(target, secret.username, secret.password, database);
}
async function runtimeSecret(job, target, create = false) {
  const names = resourceNames(job);
  let metadata;
  try {
    metadata = await aws('secretsmanager', 'describe-secret', { SecretId: names.secret_ref });
  } catch (error) {
    if (!create || error.code !== 'RESOURCE_ABSENT') throw error;
    const value = {
      username: names.runtime_name,
      password: randomBytes(32).toString('hex'),
      database: names.database_name,
      jobId: job.id,
      municipalityId: job.municipality_id,
    };
    await aws('secretsmanager', 'create-secret', {
      Name: names.secret_ref,
      ClientRequestToken: job.id,
      SecretString: JSON.stringify(value),
      Tags: [
        { Key: 'Project', Value: 'CivicMAPS' },
        { Key: 'Feature', Value: 'F05' },
        { Key: 'JobId', Value: job.id },
        { Key: 'MunicipalityId', Value: job.municipality_id },
      ],
    });
    metadata = await aws('secretsmanager', 'describe-secret', { SecretId: names.secret_ref });
  }
  const tags = Object.fromEntries((metadata.Tags ?? []).map(({ Key, Value }) => [Key, Value]));
  if (
    tags.Project !== 'CivicMAPS' ||
    tags.Feature !== 'F05' ||
    tags.JobId !== job.id ||
    tags.MunicipalityId !== job.municipality_id
  )
    throw new Error('Secret ownership conflict');
  const value = JSON.parse(
    (await aws('secretsmanager', 'get-secret-value', { SecretId: metadata.ARN })).SecretString,
  );
  if (
    value.username !== names.runtime_name ||
    value.database !== names.database_name ||
    value.jobId !== job.id ||
    value.municipalityId !== job.municipality_id ||
    !/^[0-9a-f]{64}$/.test(value.password)
  )
    throw new Error('Secret binding conflict');
  return value;
}
export async function provisionDatabase(job, target, migrationOptions) {
  const names = resourceNames(job);
  const admin = await adminConnection(target);
  try {
    await admin.query("SELECT pg_advisory_lock(hashtext('civicmaps-f05-resource'),hashtext($1))", [
      job.id,
    ]);
    await admin.query('CREATE SCHEMA IF NOT EXISTS civicmaps_provisioning');
    await admin.query('REVOKE ALL ON SCHEMA civicmaps_provisioning FROM PUBLIC');
    await admin.query(
      'CREATE TABLE IF NOT EXISTS civicmaps_provisioning.ownership (job_id uuid PRIMARY KEY, municipality_id uuid NOT NULL, database_name text UNIQUE NOT NULL, runtime_name text UNIQUE NOT NULL)',
    );
    const ownership = await admin.query(
      'SELECT * FROM civicmaps_provisioning.ownership WHERE job_id=$1',
      [job.id],
    );
    if (!ownership.rowCount) {
      const foreign = await admin.query(
        'SELECT 1 FROM pg_database WHERE datname=$1 UNION ALL SELECT 1 FROM pg_roles WHERE rolname=$2',
        [names.database_name, names.runtime_name],
      );
      if (foreign.rowCount) throw new Error('Existing resource is not owned');
      // Reserve ownership before non-transactional CREATE DATABASE. Recovery uses this ledger.
      await admin.query('INSERT INTO civicmaps_provisioning.ownership VALUES ($1,$2,$3,$4)', [
        job.id,
        job.municipality_id,
        names.database_name,
        names.runtime_name,
      ]);
    } else if (
      ownership.rows[0].municipality_id !== job.municipality_id ||
      ownership.rows[0].database_name !== names.database_name ||
      ownership.rows[0].runtime_name !== names.runtime_name
    )
      throw new Error('Resource ownership conflict');
    const secret = await runtimeSecret(job, target, true);
    const role = await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [names.runtime_name]);
    if (!role.rowCount) {
      const sql = await admin.query(
        "SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text,$2::text) AS sql",
        [names.runtime_name, secret.password],
      );
      await admin.query(sql.rows[0].sql);
    }
    const db = await admin.query('SELECT 1 FROM pg_database WHERE datname=$1', [
      names.database_name,
    ]);
    if (!db.rowCount)
      await admin.query(`CREATE DATABASE ${names.database_name} ALLOW_CONNECTIONS false`);
    // Default CONNECT would otherwise permit a runtime to enter sibling/control databases.
    await admin.query('REVOKE CONNECT,TEMPORARY ON DATABASE postgres FROM PUBLIC');
    await admin.query('REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC');
    await admin.query(`REVOKE ALL ON DATABASE ${names.database_name} FROM PUBLIC`);
    await admin.query(`GRANT CONNECT ON DATABASE ${names.database_name} TO ${names.runtime_name}`);
    // New databases stay closed until PUBLIC access has been removed.
    await admin.query(`ALTER DATABASE ${names.database_name} ALLOW_CONNECTIONS true`);
  } finally {
    await admin.end();
  }
  await migrateDataResource(job, target, migrationOptions);
  const runtime = await runtimeConnection(job, target);
  await runtime.end();
  return `aws:${job.id}:database`;
}
// Versioned data-plane migrations are separate from the control-plane migration ledger.
export async function applyDataMigrations(
  admin,
  runtimeName,
  { targetVersion = dataSchemaVersion, failVersion = 0 } = {},
) {
  if (
    !/^runtime_[0-9a-f]{32}$/.test(runtimeName) ||
    !Number.isInteger(targetVersion) ||
    targetVersion < 1 ||
    targetVersion > dataSchemaVersion
  )
    throw new Error('Invalid data migration target');
  try {
    await admin.query('BEGIN');
    await admin.query("SELECT pg_advisory_xact_lock(hashtext('civicmaps-data-schema'))");
    await admin.query('REVOKE ALL ON SCHEMA public FROM PUBLIC');
    await admin.query('CREATE SCHEMA IF NOT EXISTS council');
    await admin.query(
      'CREATE TABLE IF NOT EXISTS council.schema_versions (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    const versions = (
      await admin.query('SELECT version FROM council.schema_versions ORDER BY version')
    ).rows.map((row) => row.version);
    if (versions.some((version, index) => version !== index + 1) || versions.length > targetVersion)
      throw new Error('Unsupported data schema version');
    const migrations = [
      'CREATE TABLE council.resource_records (id uuid PRIMARY KEY, value text NOT NULL)',
      'ALTER TABLE council.resource_records ADD COLUMN created_at timestamptz NOT NULL DEFAULT clock_timestamp()',
    ];
    for (let version = versions.length + 1; version <= targetVersion; version++) {
      await admin.query(migrations[version - 1]);
      if (failVersion === version) throw new Error('Injected migration failure');
      await admin.query('INSERT INTO council.schema_versions(version) VALUES ($1)', [version]);
    }
    await admin.query(`GRANT USAGE ON SCHEMA council TO ${runtimeName}`);
    await admin.query(
      `GRANT SELECT,INSERT,UPDATE,DELETE ON council.resource_records TO ${runtimeName}`,
    );
    await admin.query('COMMIT');
    return targetVersion;
  } catch (error) {
    await admin.query('ROLLBACK');
    throw error;
  }
}
export async function migrateDataResource(job, target, options) {
  const names = resourceNames(job);
  const admin = await adminConnection(target, names.database_name);
  try {
    return await applyDataMigrations(admin, names.runtime_name, options);
  } finally {
    await admin.end();
  }
}
// Operator rollback preserves data and secrets, and refuses resources outside our ledger.
export async function setDatabaseAccess(job, target, enabled) {
  const names = resourceNames(job);
  await runtimeSecret(job, target);
  const admin = await adminConnection(target);
  try {
    const owned = await admin.query(
      'SELECT 1 FROM civicmaps_provisioning.ownership WHERE job_id=$1 AND municipality_id=$2 AND database_name=$3 AND runtime_name=$4',
      [job.id, job.municipality_id, names.database_name, names.runtime_name],
    );
    if (owned.rowCount !== 1) throw new Error('Resource ownership conflict');
    await admin.query(`ALTER ROLE ${names.runtime_name} ${enabled ? 'LOGIN' : 'NOLOGIN'}`);
    if (!enabled)
      await admin.query(
        'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename=$1 AND pid<>pg_backend_pid()',
        [names.runtime_name],
      );
  } finally {
    await admin.end();
  }
}
export async function runtimeConnection(job, target) {
  const secret = await runtimeSecret(job, target);
  return connect(target, secret.username, secret.password, secret.database);
}
export async function storageCredentials(job, target) {
  const names = resourceNames(job);
  const result = await aws('sts', 'assume-role', {
    RoleArn: target.roleArn,
    RoleSessionName: `f05-${job.id}`,
    DurationSeconds: 900,
    Policy: JSON.stringify(storageSessionPolicy(target.bucket, names.storage_prefix)),
  });
  return result.Credentials;
}
export async function provisionStorage(job, target) {
  const names = resourceNames(job);
  const credentials = await storageCredentials(job, target);
  try {
    const marker = await aws(
      's3api',
      'head-object',
      { Bucket: target.bucket, Key: `${names.storage_prefix}.owned` },
      credentials,
    );
    if (marker.Metadata?.job !== job.id || marker.Metadata?.municipality !== job.municipality_id)
      throw new Error('Storage ownership conflict');
    return `aws:${job.id}:storage`;
  } catch (error) {
    if (error.code !== 'RESOURCE_ABSENT') throw error;
  }
  // A zero-byte marker is created using the same restricted session used by consumers.
  await aws(
    's3api',
    'put-object',
    {
      Bucket: target.bucket,
      Key: `${names.storage_prefix}.owned`,
      Metadata: { job: job.id, municipality: job.municipality_id },
    },
    credentials,
  );
  return `aws:${job.id}:storage`;
}
export function awsResourceAdapter(target = configuredDataTarget()) {
  return {
    // Re-running each idempotent operation also verifies grants and credential ownership.
    async reconcile() {
      return null;
    },
    async apply(job, step) {
      if (job.adapter !== 'aws-postgres-s3' || job.profile !== resourceProfile)
        throw new Error('Invalid resource profile');
      if (step.name === 'prepare_workspace') return provisionDatabase(job, target);
      if (step.name === 'prepare_services') return provisionStorage(job, target);
      throw new Error('Invalid resource step');
    },
  };
}
export async function withMunicipalityResource(
  client,
  user,
  selector,
  target,
  work,
  {
    includeStorage = true,
    runtimeConnection: connectResource = runtimeConnection,
    storageCredentials: getStorageCredentials = storageCredentials,
  } = {},
) {
  const context = await resolveContext(client, user, selector);
  const found = await client.query(
    `SELECT r.*,j.adapter,j.id FROM municipality_resources r JOIN provisioning_jobs j ON j.id=r.job_id JOIN municipality_resource_contexts rc ON rc.job_id=r.job_id WHERE r.municipality_id=$1 AND rc.binding_id=$2 AND r.disabled_at IS NULL AND j.state='succeeded'`,
    [context.municipality_id, context.context_id],
  );
  if (found.rowCount !== 1)
    throw Object.assign(new Error('Municipality resource unavailable'), { status: 403 });
  const job = found.rows[0];
  const names = resourceNames(job);
  if (
    job.profile !== resourceProfile ||
    Object.entries(names).some(([key, value]) => job[key] !== value)
  )
    throw new Error('Resource registry binding conflict');
  // Independent connections avoid pooled session state surviving a context switch.
  const connection = await connectResource(job, target);
  try {
    const resource = {
      connection,
      context,
    };
    if (includeStorage)
      resource.storage = {
        bucket: target.bucket,
        prefix: names.storage_prefix,
        credentials: await getStorageCredentials(job, target),
      };
    return await work(resource);
  } finally {
    await connection.end();
  }
}

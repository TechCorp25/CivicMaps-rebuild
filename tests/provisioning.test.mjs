import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createTestEnvironment } from './helpers/environment.mjs';
let claimProvisioning, finishProvisioning, runProvisioningOnce, syntheticAdapter;
let environment, pool, operator, council;
async function call(path, data, session = operator, key = randomUUID(), headers = {}) {
  const response = await fetch(`${environment.origin}/api${path}`, {
    method: data === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  return { status: response.status, data: await response.json(), response };
}
function registration() {
  const id = randomUUID().replaceAll('-', '');
  return {
    name: `Synthetic job ${id}`,
    slug: `job-${id}`,
    packs: ['Local Laws'],
    firstName: 'Test',
    lastName: 'Admin',
    email: `${id}@synthetic.example`,
  };
}
async function create() {
  const response = await call('/platform/municipalities', registration());
  assert.equal(response.status, 201);
  return response.data;
}
async function detail(record) {
  const response = await call(`/platform/municipalities/${record.municipality.id}`);
  assert.equal(response.status, 200);
  return response.data;
}
async function action(record, action, key = randomUUID(), session = operator, headers = {}) {
  return call(
    `/platform/municipalities/${record.municipality.id}/jobs/${record.jobId}/actions`,
    { action },
    session,
    key,
    headers,
  );
}
async function drain() {
  for (let i = 0; i < 10; i++) if (!(await runProvisioningOnce())) return;
  assert.fail('Unexpected unbounded queue');
}
async function expire(record) {
  await pool.query(
    "UPDATE provisioning_jobs SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",
    [record.jobId],
  );
}
function processWorker(fault) {
  const result = spawnSync(process.execPath, ['services/api/provisioning-worker.mjs', '--once'], {
    env: {
      ...process.env,
      CIVICMAPS_DATABASE_URL: environment.connectionString,
      NODE_ENV: 'test',
      ...(fault ? { CIVICMAPS_WORKER_TEST_FAULT: fault } : {}),
    },
    encoding: 'utf8',
    timeout: 10000,
  });
  return result;
}
before(async () => {
  environment = await createTestEnvironment({ platform: true });
  ({ pool } = environment);
  ({ claimProvisioning, finishProvisioning, runProvisioningOnce, syntheticAdapter } =
    await import('../services/api/provisioning.mjs'));
  for (const [path, email] of [
    ['/platform/auth/login', 'operator@platform.example'],
    ['/auth/login', 'dispatch@alpha.example'],
  ]) {
    const r = await call(
      path,
      { email, password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!' },
      null,
    );
    assert.equal(r.status, 200);
    const session = { ...r.data, cookie: r.response.headers.get('set-cookie').split(';')[0] };
    if (path.includes('platform')) operator = session;
    else council = session;
  }
});
after(async () => environment?.close());
test('registration atomically enqueues one job and secret-free steps; replay remains safe', async () => {
  assert.equal(
    (await pool.query('SELECT * FROM provisioning_jobs')).rowCount,
    0,
    'Historical fixtures are never enqueued',
  );
  const data = registration(),
    key = randomUUID();
  const responses = await Promise.all([
    call('/platform/municipalities', data, operator, key),
    call('/platform/municipalities', data, operator, key),
  ]);
  assert.deepEqual(
    responses.map((r) => r.status),
    [201, 201],
  );
  assert.equal(responses[0].data.jobId, responses[1].data.jobId);
  const original = responses.find((r) => r.data.temporaryPassword).data;
  const read = await detail(original);
  assert.equal(read.job.state, 'queued');
  assert.equal(read.job.adapter, 'synthetic');
  assert.equal(read.job.steps.length, 2);
  assert.equal(read.job.lease_token, undefined);
  assert.equal(read.job.operator_id, operator.actor.id);
  const persisted = await pool.query('SELECT * FROM provisioning_jobs WHERE id=$1', [
    original.jobId,
  ]);
  assert.ok(!JSON.stringify([persisted.rows, read]).includes(original.temporaryPassword));
  await drain();
});
test('enqueue failure rolls back council, admin, receipt and audit', async () => {
  // Force failure at enqueue, after council/admin insertion, in this disposable database only.
  await pool.query(`CREATE FUNCTION reject_synthetic_job() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic enqueue unavailable'; END $$;
    CREATE TRIGGER test_reject_job BEFORE INSERT ON provisioning_jobs FOR EACH ROW EXECUTE FUNCTION reject_synthetic_job()`);
  const data = registration(),
    key = randomUUID();
  try {
    assert.equal((await call('/platform/municipalities', data, operator, key)).status, 500);
    assert.equal(
      (await pool.query('SELECT * FROM platform_municipalities WHERE slug=$1', [data.slug]))
        .rowCount,
      0,
    );
    assert.equal(
      (await pool.query('SELECT * FROM platform_first_admins WHERE email=$1', [data.email]))
        .rowCount,
      0,
    );
    assert.equal(
      (await pool.query('SELECT * FROM platform_receipts WHERE key=$1', [key])).rowCount,
      0,
    );
  } finally {
    await pool.query(
      'DROP TRIGGER test_reject_job ON provisioning_jobs; DROP FUNCTION reject_synthetic_job()',
    );
  }
  const response = await call('/platform/municipalities', data, operator, key);
  assert.equal(response.status, 201);
  await drain();
});
test('two workers claim one lease, skip locked jobs and reject late checkpoints', async () => {
  const record = await create();
  const lock = await pool.connect();
  try {
    await lock.query('BEGIN');
    await lock.query('SELECT id FROM provisioning_jobs WHERE id=$1 FOR UPDATE', [record.jobId]);
    assert.equal(await claimProvisioning(), null);
  } finally {
    await lock.query('ROLLBACK');
    lock.release();
  }
  const claims = await Promise.all([claimProvisioning(), claimProvisioning()]);
  assert.equal(claims.filter(Boolean).length, 1);
  const old = claims.find(Boolean);
  assert.equal((await action(record, 'reconcile')).status, 409);
  const resource = await syntheticAdapter.apply(old, old.step);
  await expire(record);
  const next = await claimProvisioning();
  assert.notEqual(next.lease_token, old.lease_token);
  assert.equal(await finishProvisioning(old, { resourceId: resource }), false);
  assert.equal(await syntheticAdapter.reconcile(next, next.step), resource);
  assert.equal(await finishProvisioning(next, { resourceId: resource }), true);
  await drain();
  const read = await detail(record);
  assert.equal(read.job.state, 'succeeded');
  assert.equal(read.job.steps[0].attempts, 2);
  assert.equal(read.municipality.status, 'Provisioning');
});
test('separate worker processes recover crashes before and after effect without duplicate resources', async () => {
  for (const fault of ['after-claim', 'after-effect']) {
    const record = await create();
    const crashed = processWorker(fault);
    assert.equal(crashed.status, fault === 'after-claim' ? 86 : 87, crashed.stderr);
    assert.equal((await detail(record)).job.state, 'running');
    const effectsBefore = await pool.query(
      'SELECT * FROM synthetic_provisioning_effects WHERE job_id=$1',
      [record.jobId],
    );
    assert.equal(effectsBefore.rowCount, fault === 'after-effect' ? 1 : 0);
    await expire(record);
    for (let i = 0; i < 2; i++) {
      const restarted = processWorker();
      assert.equal(restarted.status, 0, restarted.stderr);
    }
    const read = await detail(record);
    assert.equal(read.job.state, 'succeeded');
    const effects = await pool.query(
      'SELECT * FROM synthetic_provisioning_effects WHERE job_id=$1',
      [record.jobId],
    );
    assert.equal(effects.rowCount, 2);
    if (effectsBefore.rowCount)
      assert.equal(
        effects.rows.find((r) => r.step_name === 'prepare_workspace').resource_id,
        effectsBefore.rows[0].resource_id,
      );
    assert.equal(read.municipality.status, 'Provisioning');
  }
});
test('automatic retries are bounded; operator retry/reconcile preserve successful checkpoints', async () => {
  const record = await create();
  await runProvisioningOnce();
  const first = (await detail(record)).job.steps[0].resource_id;
  const failing = {
    reconcile: async () => null,
    apply: async () => {
      throw Object.assign(new Error('secret-provider-password'), { code: 'TRANSIENT' });
    },
  };
  for (let i = 1; i <= 3; i++) {
    await runProvisioningOnce({ adapter: failing });
    const read = await detail(record);
    assert.equal(read.job.state, i < 3 ? 'waiting' : 'failed');
    assert.equal(read.job.steps[1].attempts, i);
    assert.ok(!JSON.stringify(read).includes('secret-provider-password'));
    if (i < 3) {
      assert.equal(await claimProvisioning(), null, 'Backoff delays the next attempt');
      await pool.query('UPDATE provisioning_jobs SET available_at=clock_timestamp() WHERE id=$1', [
        record.jobId,
      ]);
    }
  }
  assert.equal((await detail(record)).municipality.status, 'Provisioning');
  const key = randomUUID();
  const retried = await Promise.all([action(record, 'retry', key), action(record, 'retry', key)]);
  assert.deepEqual(
    retried.map((r) => r.status),
    [200, 200],
  );
  assert.equal(retried[0].data.job.id, record.jobId);
  await runProvisioningOnce({
    adapter: {
      reconcile: async () => null,
      apply: async () => {
        throw new Error('permanent');
      },
    },
  });
  assert.equal((await detail(record)).job.state, 'failed');
  const reconciled = await action(record, 'reconcile');
  assert.equal(reconciled.status, 200);
  await drain();
  const read = await detail(record);
  assert.equal(read.job.state, 'succeeded');
  assert.equal(read.job.steps[0].resource_id, first);
  assert.equal((await action(record, 'retry')).status, 409);
  assert.equal((await action(record, 'reconcile')).status, 409);
});
test('repeated crashes exhaust the lease attempt budget without endless restarts', async () => {
  const record = await create();
  for (let i = 0; i < 3; i++) {
    assert.ok(await claimProvisioning());
    await expire(record);
  }
  assert.equal(await claimProvisioning(), null);
  assert.equal((await detail(record)).job.state, 'failed');
  await action(record, 'reconcile');
  await drain();
  assert.equal((await detail(record)).job.state, 'succeeded');
});
test('job controls deny council sessions, missing CSRF, hostile origin and mismatched resource IDs', async () => {
  const record = await create();
  const path = `/platform/municipalities/${record.municipality.id}`;
  assert.equal((await call(path, undefined, null)).status, 401);
  assert.equal((await call(path, undefined, council)).status, 401);
  assert.equal((await action(record, 'reconcile', randomUUID(), council)).status, 401);
  assert.equal(
    (await action(record, 'reconcile', randomUUID(), operator, { 'x-csrf-token': '' })).status,
    403,
  );
  assert.equal(
    (
      await action(record, 'reconcile', randomUUID(), operator, {
        Origin: 'https://untrusted.synthetic.example',
      })
    ).status,
    403,
  );
  const other = await create();
  const mismatched = { ...record, jobId: other.jobId };
  assert.equal((await action(mismatched, 'reconcile')).status, 404);
  assert.equal((await action({ ...record, jobId: 'forged' }, 'retry')).status, 404);
  assert.equal((await action(record, 'invalid')).status, 400);
  assert.equal((await detail(record)).job.attempts, 0);
  await drain();
});
test('interleaved councils retain resource and audit ownership; runtime roles stay separated', async () => {
  const alpha = await create(),
    beta = await create();
  await drain();
  for (const record of [alpha, beta]) {
    const read = await detail(record);
    assert.equal(read.job.state, 'succeeded');
    assert.ok(
      read.job.steps.every((s) =>
        s.resource_id.startsWith(`synthetic:${record.municipality.id}:${record.jobId}:`),
      ),
    );
    const events = await pool.query('SELECT * FROM platform_audit WHERE municipality_id=$1', [
      record.municipality.id,
    ]);
    assert.ok(
      events.rows.every(
        (e) => e.operator_id === operator.actor.id && e.details.jobId === record.jobId,
      ),
    );
    assert.ok(events.rows.some((e) => e.details.performedBy === 'worker' && e.details.resourceId));
  }
  for (const [role, queries] of [
    [
      'civicmaps_local_app',
      [
        'SELECT * FROM provisioning_jobs',
        'UPDATE provisioning_steps SET attempts=0',
        'SELECT * FROM synthetic_provisioning_effects',
      ],
    ],
    ['civicmaps_platform_app', ['SELECT * FROM synthetic_provisioning_effects']],
    [
      'civicmaps_provisioning_worker',
      [
        'SELECT * FROM users',
        'SELECT * FROM platform_first_admins',
        "UPDATE platform_municipalities SET status='Active'",
        'DELETE FROM provisioning_jobs',
      ],
    ],
  ]) {
    const client = await pool.connect();
    try {
      for (const query of queries) {
        await client.query('BEGIN');
        await client.query(`SET LOCAL ROLE ${role}`);
        await assert.rejects(client.query(query), /permission denied/);
        await client.query('ROLLBACK');
      }
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }
});

test('simultaneous retry actions with different keys cannot start two recovery cycles', async () => {
  const record = await create();
  await runProvisioningOnce({
    adapter: {
      reconcile: async () => null,
      apply: async () => {
        throw new Error('permanent');
      },
    },
  });
  const results = await Promise.all([action(record, 'retry'), action(record, 'retry')]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  await drain();
  assert.equal((await detail(record)).job.state, 'succeeded');
});
test('repeat migration and seeds retain jobs, resource IDs, passwords and audit history', async () => {
  const before = {
    jobs: (await pool.query('SELECT * FROM provisioning_jobs ORDER BY id')).rows,
    effects: (
      await pool.query('SELECT * FROM synthetic_provisioning_effects ORDER BY job_id,step_name')
    ).rows,
    hash: (await pool.query('SELECT id,password_hash FROM users ORDER BY id')).rows,
    audit: (await pool.query('SELECT * FROM platform_audit ORDER BY id')).rows,
  };
  for (let repeat = 0; repeat < 2; repeat++)
    for (const script of ['migrate', 'seed', 'seed-platform']) {
      const result = spawnSync(process.execPath, [`services/api/${script}.mjs`], {
        env: process.env,
        encoding: 'utf8',
        timeout: 10000,
      });
      assert.equal(result.status, 0, result.stderr);
    }
  assert.deepEqual(
    (await pool.query('SELECT * FROM provisioning_jobs ORDER BY id')).rows,
    before.jobs,
  );
  assert.deepEqual(
    (await pool.query('SELECT * FROM synthetic_provisioning_effects ORDER BY job_id,step_name'))
      .rows,
    before.effects,
  );
  assert.deepEqual(
    (await pool.query('SELECT id,password_hash FROM users ORDER BY id')).rows,
    before.hash,
  );
  assert.deepEqual(
    (await pool.query('SELECT * FROM platform_audit ORDER BY id')).rows,
    before.audit,
  );
});

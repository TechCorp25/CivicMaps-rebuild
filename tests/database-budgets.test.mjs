import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import pg from 'pg';
import { after, before, test } from 'node:test';
import { performance } from 'node:perf_hooks';
import { createTestEnvironment } from './helpers/environment.mjs';

let environment;
let pool;
let maintenancePool;
let transaction;
let databaseBudgets;
let isTransientDatabaseError;

before(async () => {
  environment = await createTestEnvironment();
  ({ pool, maintenancePool, transaction, databaseBudgets, isTransientDatabaseError } =
    await import('../services/api/database.mjs'));
});

after(async () => {
  await environment?.close();
});

test(
  'request and maintenance PostgreSQL budgets are explicit and isolated',
  { timeout: 10000 },
  async () => {
    assert.deepEqual(databaseBudgets.request, {
      acquireMs: 1000,
      statementMs: 5000,
      lockMs: 1000,
      max: 10,
    });
    assert.deepEqual(databaseBudgets.maintenance, {
      acquireMs: 10000,
      statementMs: 120000,
      lockMs: 30000,
      max: 2,
    });
    assert.equal((await pool.query('SHOW statement_timeout')).rows[0].statement_timeout, '5s');
    assert.equal((await pool.query('SHOW lock_timeout')).rows[0].lock_timeout, '1s');
    assert.equal(
      (await maintenancePool.query('SHOW statement_timeout')).rows[0].statement_timeout,
      '2min',
    );
    assert.equal((await maintenancePool.query('SHOW lock_timeout')).rows[0].lock_timeout, '30s');
  },
);

test(
  'a saturated request pool returns a bounded retryable response and recovers',
  { timeout: 10000 },
  async () => {
    const clients = [];
    try {
      for (let index = 0; index < databaseBudgets.request.max; index++)
        clients.push(await pool.connect());
      assert.equal(pool.totalCount, databaseBudgets.request.max);

      const started = performance.now();
      const response = await fetch(`${environment.origin}/api/health`, {
        signal: AbortSignal.timeout(2500),
      });
      const elapsed = performance.now() - started;
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('retry-after'), '1');
      assert.deepEqual(await response.json(), { error: 'The operation could not be completed' });
      assert.ok(elapsed >= 800 && elapsed < 1800, `pool timeout took ${elapsed.toFixed(1)}ms`);
      assert.equal(pool.waitingCount, 0);
    } finally {
      for (const client of clients) client.release();
    }

    const recovered = await fetch(`${environment.origin}/api/health`, {
      signal: AbortSignal.timeout(1000),
    });
    assert.equal(recovered.status, 200);
    assert.equal(pool.waitingCount, 0);
  },
);

test(
  'statement timeout cancels server work, rolls back partial writes and reuses the client',
  { timeout: 15000 },
  async () => {
    const table = `q2_cancel_${randomUUID().replaceAll('-', '')}`;
    const admin = new pg.Pool({ connectionString: environment.connectionString, max: 1 });
    let created = false;
    let backendPid;
    try {
      await admin.query(`CREATE TABLE ${table} (id integer PRIMARY KEY)`);
      created = true;
      const started = performance.now();
      await assert.rejects(
        transaction(async (client) => {
          backendPid = (await client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
          await client.query(`INSERT INTO ${table}(id) VALUES (1)`);
          await client.query('SELECT pg_sleep(10)');
        }),
        (error) => error.code === '57014',
      );
      const elapsed = performance.now() - started;
      assert.ok(
        elapsed >= 4000 && elapsed < 7000,
        `statement cancellation took ${elapsed.toFixed(1)}ms`,
      );

      const count = await admin.query(`SELECT count(*)::integer AS count FROM ${table}`);
      assert.equal(count.rows[0].count, 0, 'the write before cancellation was rolled back');
      const stillRunning = await admin.query(
        `SELECT 1 FROM pg_stat_activity WHERE pid=$1 AND state='active' AND query LIKE 'SELECT pg_sleep(10)%'`,
        [backendPid],
      );
      assert.equal(
        stillRunning.rowCount,
        0,
        'the timed-out statement no longer runs on PostgreSQL',
      );
      assert.equal((await pool.query('SELECT 1 AS ready')).rows[0].ready, 1);
    } finally {
      if (created) await admin.query(`DROP TABLE IF EXISTS ${table}`);
      await admin.end();
    }
  },
);

test(
  'row-lock timeout maps login to retryable failure and preserves the existing session state',
  { timeout: 12000 },
  async () => {
    const email = 'dispatch@alpha.example';
    const password = process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!';
    const userId = (await pool.query('SELECT id FROM users WHERE email=$1', [email])).rows[0].id;
    const admin = new pg.Pool({ connectionString: environment.connectionString, max: 2 });
    const blocker = await admin.connect();
    const sessionsBefore = Number(
      (await pool.query('SELECT count(*) FROM sessions WHERE user_id=$1', [userId])).rows[0].count,
    );
    let login;
    try {
      await blocker.query('BEGIN');
      await blocker.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [userId]);
      const started = performance.now();
      login = fetch(`${environment.origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(4000),
      });

      let waiting = false;
      const deadline = Date.now() + 1500;
      while (!waiting && Date.now() < deadline) {
        waiting =
          (
            await admin.query(
              `SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'SELECT civicmaps_lock_login_user%'`,
            )
          ).rowCount > 0;
        if (!waiting) await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.equal(waiting, true, 'login reached the database identity lock');

      const response = await login;
      const elapsed = performance.now() - started;
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('retry-after'), '1');
      assert.equal(response.headers.get('set-cookie'), null);
      assert.deepEqual(await response.json(), { error: 'The operation could not be completed' });
      assert.ok(elapsed >= 800 && elapsed < 2200, `lock timeout took ${elapsed.toFixed(1)}ms`);
      assert.equal(
        Number(
          (await pool.query('SELECT count(*) FROM sessions WHERE user_id=$1', [userId])).rows[0]
            .count,
        ),
        sessionsBefore,
        'timeout did not replace or issue a session',
      );
    } finally {
      await blocker.query('ROLLBACK');
      blocker.release();
      await admin.end();
    }

    const healthy = await fetch(`${environment.origin}/api/health`, {
      signal: AbortSignal.timeout(1000),
    });
    assert.equal(healthy.status, 200);
    assert.equal(pool.waitingCount, 0);
  },
);

test(
  'a disconnected transaction client is discarded before the pool reconnects',
  {
    timeout: 8000,
  },
  async () => {
    const admin = new pg.Pool({ connectionString: environment.connectionString, max: 1 });
    try {
      await assert.rejects(
        transaction(async (client) => {
          const backendPid = (await client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
          const backendDisconnected = once(client, 'error');
          const terminated = await admin.query('SELECT pg_terminate_backend($1) AS terminated', [
            backendPid,
          ]);
          assert.equal(terminated.rows[0].terminated, true);
          await backendDisconnected;
          await client.query('SELECT 1');
        }),
        (error) =>
          error.message === 'Client has encountered a connection error and is not queryable' &&
          isTransientDatabaseError(error),
      );
      assert.equal((await pool.query('SELECT 1 AS ready')).rows[0].ready, 1);
      assert.equal(pool.waitingCount, 0);
    } finally {
      await admin.end();
    }
  },
);

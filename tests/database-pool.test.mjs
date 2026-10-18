import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';

test('an idle PostgreSQL client error is handled and the shared pool recovers', async () => {
  const environment = await createTestEnvironment({ platform: false });
  const admin = new pg.Pool({ connectionString: environment.connectionString });
  const { pool } = await import('../services/api/database.mjs');
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT pg_backend_pid() AS pid');
    const idleError = once(pool, 'error');
    client.release();
    client = undefined;

    const terminated = await admin.query('SELECT pg_terminate_backend($1) AS terminated', [
      rows[0].pid,
    ]);
    assert.equal(terminated.rows[0].terminated, true);
    await idleError;

    const recovered = await pool.query('SELECT 1 AS ready');
    assert.equal(recovered.rows[0].ready, 1);
  } finally {
    client?.release();
    await admin.end();
    await environment.close();
  }
});

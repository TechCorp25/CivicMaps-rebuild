import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import pg from 'pg';

// One environment per test process: database.mjs caches its pool on first import.
// Never drop the configured base database; cleanup owns only the generated name.
export async function createTestEnvironment({ platform = false, beforeMigrate } = {}) {
  const previous = process.env.CIVICMAPS_DATABASE_URL;
  const base = previous ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres';
  const name = `civicmaps_test_${randomUUID().replaceAll('-', '')}`;
  const connection = new URL(base);
  connection.pathname = `/${name}`;
  const admin = new pg.Pool({ connectionString: base });
  let created = false,
    pool,
    server,
    closed = false;
  async function close() {
    if (closed) return;
    closed = true;
    try {
      try {
        if (server?.listening)
          await new Promise((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          );
      } finally {
        if (pool) await pool.end();
      }
    } finally {
      try {
        if (created) await admin.query(`DROP DATABASE ${name}`);
      } finally {
        await admin.end();
        if (previous === undefined) delete process.env.CIVICMAPS_DATABASE_URL;
        else process.env.CIVICMAPS_DATABASE_URL = previous;
      }
    }
  }
  try {
    await admin.query(`CREATE DATABASE ${name}`);
    created = true;
    process.env.CIVICMAPS_DATABASE_URL = connection.href;
    // Upgrade tests initialise only this newly created disposable database.
    if (beforeMigrate) await beforeMigrate(connection.href);
    for (const script of ['migrate', 'seed', ...(platform ? ['seed-platform'] : [])]) {
      const result = spawnSync(process.execPath, [`services/api/${script}.mjs`], {
        env: process.env,
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, result.stderr || result.error?.message);
    }
    ({ pool } = await import('../../services/api/database.mjs'));
    const { createApp } = await import('../../services/api/app.mjs');
    server = createApp().listen(0, '127.0.0.1');
    await once(server, 'listening');
    return {
      pool,
      connectionString: connection.href,
      origin: `http://127.0.0.1:${server.address().port}`,
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { spawnSync } from 'node:child_process';
import { createTestEnvironment } from './helpers/environment.mjs';
import { routingFixture } from './helpers/routing-fixture.mjs';

test('routing retry upgrade and replay preserve ownership, sessions, history and compatible restricted-role reads', async () => {
  const env = await createTestEnvironment({ platform: true });
  try {
    await routingFixture(env.pool);
    await env.pool.query(
      "INSERT INTO service_route_events(route_id,version,action,actor) SELECT id,version,'ready','historical' FROM service_routes",
    );
    const login = await fetch(env.origin + '/api/platform/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'operator@platform.example',
        password: 'CivicMAPS-local-2026!',
      }),
    });
    assert.equal(login.status, 200);
    const snapshot = async () => {
      const data = {};
      for (const table of [
        'users',
        'platform_operators',
        'platform_municipalities',
        'sessions',
        'platform_sessions',
        'service_routes',
        'service_route_events',
        'municipality_resources',
        'provisioning_jobs',
        'operating_context_bindings',
        'operating_context_grants',
      ])
        data[table] = (
          await env.pool.query(
            `SELECT to_jsonb(t)-'next_attempt_at' AS row FROM ${table} t ORDER BY (to_jsonb(t)-'next_attempt_at')::text`,
          )
        ).rows;
      return data;
    };
    const before = await snapshot();
    await env.pool.query(
      "ALTER TABLE service_routes DROP COLUMN next_attempt_at; DELETE FROM civicmaps_migrations WHERE id='011-routing-retries'",
    );
    for (let i = 0; i < 2; i++) {
      const run = spawnSync(process.execPath, ['services/api/migrate.mjs'], {
        env: process.env,
        encoding: 'utf8',
      });
      assert.equal(run.status, 0, run.stderr);
      assert.deepEqual(await snapshot(), before);
    }
    // Restore a private owned checkpoint into another disposable DB, never over the source DB.
    const directory = await mkdtemp(join(tmpdir(), 'civicmaps-control-backup-'));
    const backup = join(directory, 'control.dump');
    const restoredUrl = new URL(env.connectionString);
    const restoredName = restoredUrl.pathname.slice(1) + '_restore';
    restoredUrl.pathname = '/' + restoredName;
    let restored;
    try {
      const dump = spawnSync(
        'pg_dump',
        ['--format=custom', '--file', backup, '--dbname', env.connectionString],
        { encoding: 'utf8' },
      );
      assert.equal(dump.status, 0, 'Private control backup must succeed');
      await env.pool.query(`CREATE DATABASE ${restoredName}`);
      const restore = spawnSync(
        'pg_restore',
        ['--exit-on-error', '--dbname', restoredUrl.href, backup],
        { encoding: 'utf8' },
      );
      assert.equal(restore.status, 0, 'Restore into an owned disposable database must succeed');
      restored = new pg.Pool({ connectionString: restoredUrl.href });
      for (const [table, rows] of Object.entries(before))
        assert.deepEqual(
          (
            await restored.query(
              `SELECT to_jsonb(t)-'next_attempt_at' AS row FROM ${table} t ORDER BY (to_jsonb(t)-'next_attempt_at')::text`,
            )
          ).rows,
          rows,
        );
    } finally {
      if (restored) await restored.end();
      await env.pool.query(`DROP DATABASE IF EXISTS ${restoredName}`);
      await rm(directory, { recursive: true, force: true });
    }
    // The prior worker/control SQL names columns explicitly; additive 011 permits code-only rollback.
    const client = await env.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE civicmaps_platform_app');
      assert.equal(
        (await client.query('SELECT id,hostname,version,state,checked_at FROM service_routes'))
          .rowCount,
        3,
      );
      await client.query('UPDATE service_routes SET state=state WHERE false');
      await assert.rejects(client.query('UPDATE platform_operators SET active=false WHERE false'), {
        code: '42501',
      });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  } finally {
    await env.close();
  }
});

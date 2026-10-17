import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';
test('F06 upgrade retains F05 resources/history and historical sessions without implicit routing', async () => {
  let snapshot;
  async function capture(client) {
    const value = {};
    for (const table of [
      'users',
      'sessions',
      'platform_sessions',
      'operating_context_bindings',
      'operating_context_grants',
      'municipality_resources',
      'municipality_resource_contexts',
      'provisioning_jobs',
      'platform_audit',
    ])
      value[table] = (
        await client.query(
          `SELECT to_jsonb(t)-'route_id'-'route_version' AS value FROM ${table} t ORDER BY (to_jsonb(t)-'route_id'-'route_version')::text`,
        )
      ).rows;
    return value;
  }
  const environment = await createTestEnvironment({
    platform: true,
    beforeMigrate: async (url) => {
      const client = new pg.Client({ connectionString: url });
      await client.connect();
      try {
        await client.query(
          'CREATE TABLE civicmaps_migrations(id text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())',
        );
        for (const id of [
          '001-foundation',
          '002-auth-scope',
          '003-platform',
          '004-operating-context',
          '005-context-rls',
          '006-provisioning-jobs',
          '007-data-resources',
        ]) {
          await client.query(
            await readFile(
              new URL(`../services/api/migrations/${id}.sql`, import.meta.url),
              'utf8',
            ),
          );
          await client.query('INSERT INTO civicmaps_migrations(id) VALUES($1)', [id]);
        }
        for (const script of ['seed', 'seed-platform']) {
          const run = spawnSync(process.execPath, [`services/api/${script}.mjs`], {
            env: { ...process.env, CIVICMAPS_DATABASE_URL: url },
            encoding: 'utf8',
          });
          assert.equal(run.status, 0, run.stderr);
        }
        await client.query(
          "INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) SELECT repeat('a',64),id,'synthetic-historical',now()+interval '1 hour' FROM users LIMIT 1",
        );
        await client.query(
          "INSERT INTO platform_sessions(token_hash,operator_id,csrf_token,expires_at) SELECT repeat('b',64),id,'synthetic-historical',now()+interval '1 hour' FROM platform_operators LIMIT 1",
        );
        snapshot = await capture(client);
      } finally {
        await client.end();
      }
    },
  });
  try {
    assert.deepEqual(await capture(environment.pool), snapshot);
    assert.equal((await environment.pool.query('SELECT * FROM service_routes')).rowCount, 0);
    const run = spawnSync(process.execPath, ['services/api/migrate.mjs'], {
      env: process.env,
      encoding: 'utf8',
    });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(await capture(environment.pool), snapshot);
    assert.ok(
      (await environment.pool.query('SELECT route_id,route_version FROM sessions')).rows.every(
        (r) => r.route_id === null && r.route_version === null,
      ),
    );
  } finally {
    await environment.close();
  }
});

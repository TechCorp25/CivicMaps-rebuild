import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';

const tables = [
  'users',
  'platform_first_admins',
  'platform_municipalities',
  'sessions',
  'platform_sessions',
  'operating_context_bindings',
  'operating_context_grants',
  'operating_context_changes',
  'platform_audit',
  'service_routes',
  'municipality_resources',
  'provisioning_jobs',
];
async function capture(client) {
  const result = {};
  for (const table of tables) {
    const row =
      table === 'platform_first_admins'
        ? "to_jsonb(t)-'user_id'-'binding_id'"
        : table === 'sessions'
          ? "to_jsonb(t)-'municipality_id'"
          : 'to_jsonb(t)';
    result[table] = (
      await client.query(
        `SELECT ${row} AS row FROM ${table} t ORDER BY ${table === 'platform_municipalities' ? 'id' : `(${row})::text`}`,
      )
    ).rows;
  }
  return result;
}
test('F07 populated upgrade and replay preserve pending registration, credentials, contexts and sessions without activation', async () => {
  let before;
  const env = await createTestEnvironment({
    platform: true,
    beforeMigrate: async (url) => {
      const c = new pg.Client({ connectionString: url });
      await c.connect();
      try {
        await c.query(
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
          '008-service-routing',
          '009-authentication-locks',
          '010-route-municipality-tokens',
          '011-routing-retries',
        ]) {
          await c.query(
            await readFile(
              new URL(`../services/api/migrations/${id}.sql`, import.meta.url),
              'utf8',
            ),
          );
          await c.query('INSERT INTO civicmaps_migrations(id) VALUES($1)', [id]);
        }
        for (const script of [
          'services/api/seed.mjs',
          'services/api/seed-platform.mjs',
          'scripts/configure-development-routes.mjs',
        ]) {
          const run = spawnSync(process.execPath, [script], {
            env: {
              ...process.env,
              CIVICMAPS_DATABASE_URL: url,
              CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only',
            },
            encoding: 'utf8',
          });
          assert.equal(run.status, 0, run.stderr);
        }
        await c.query(
          "INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) SELECT repeat('a',64),id,'historical',now()+interval '1 hour' FROM users LIMIT 1",
        );
        await c.query(
          "INSERT INTO platform_sessions(token_hash,operator_id,csrf_token,expires_at) SELECT repeat('b',64),id,'historical',now()+interval '1 hour' FROM platform_operators LIMIT 1",
        );
        before = await capture(c);
      } finally {
        await c.end();
      }
    },
  });
  try {
    // F08 intentionally canonicalises labels and advances the municipality version.
    // Compare every other F07 column unchanged and verify that exact migration separately.
    const migrated = await capture(env.pool);
    const aliases = new Map(
      (await env.pool.query('SELECT label,pack_id FROM pack_legacy_labels')).rows.map((r) => [
        r.label,
        r.pack_id,
      ]),
    );
    for (const entry of before.platform_municipalities) {
      const row = entry.row;
      row.packs = row.packs.map((p) => aliases.get(p) ?? p);
      if (
        ['20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002'].includes(
          row.id,
        ) &&
        !row.packs.includes('parking-services')
      )
        row.packs.push('parking-services');
      row.version += 1;
      row.pack_version = 1;
    }
    assert.deepEqual(migrated, before);
    assert.equal((await env.pool.query('SELECT * FROM council_admin_activations')).rowCount, 0);
    assert.equal((await env.pool.query("SELECT * FROM users WHERE role='ADMIN'")).rowCount, 0);
    assert.ok(
      (
        await env.pool.query(
          'SELECT user_id,binding_id,activation_state FROM platform_first_admins',
        )
      ).rows.every(
        (r) => r.user_id === null && r.binding_id === null && r.activation_state === 'Pending',
      ),
    );
    const run = spawnSync(process.execPath, ['services/api/migrate.mjs'], {
      env: process.env,
      encoding: 'utf8',
    });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(await capture(env.pool), before);
    const c = await env.pool.connect();
    try {
      await c.query('BEGIN');
      await c.query('SET LOCAL ROLE civicmaps_platform_app');
      await assert.rejects(c.query('UPDATE users SET active=false WHERE false'), { code: '42501' });
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  } finally {
    await env.close();
  }
});

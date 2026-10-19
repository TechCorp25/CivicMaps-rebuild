import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';

const baseUrl =
  process.env.CIVICMAPS_DATABASE_URL ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres';
const sharedUser = '00000000-0000-4000-8000-000000000006';
const sharedBinding = '10000000-0000-4000-8000-000000000003';
const migrations = [
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
  '012-first-admin-activation',
  '013-pack-entitlements',
];

async function createPreOwnershipDatabase({
  noncanonical = false,
  wrongRouteSession = false,
  seedFixtures = true,
} = {}) {
  const admin = new pg.Pool({ connectionString: baseUrl });
  const name = `civicmaps_owner_migration_${randomUUID().replaceAll('-', '')}`;
  const databaseUrl = new URL(baseUrl);
  databaseUrl.pathname = `/${name}`;
  let created = false;
  try {
    await admin.query(`CREATE DATABASE ${name}`);
    created = true;
    const client = new pg.Client({ connectionString: databaseUrl.href });
    await client.connect();
    try {
      await client.query(
        'CREATE TABLE civicmaps_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
      );
      for (const id of migrations) {
        await client.query(
          await readFile(new URL(`../services/api/migrations/${id}.sql`, import.meta.url), 'utf8'),
        );
        await client.query('INSERT INTO civicmaps_migrations(id) VALUES($1)', [id]);
      }
    } finally {
      await client.end();
    }
    if (seedFixtures) {
      const seed = spawnSync(process.execPath, ['services/api/seed.mjs'], {
        env: {
          ...process.env,
          CIVICMAPS_DATABASE_URL: databaseUrl.href,
          CIVICMAPS_MIGRATION_PROFILE: 'synthetic-fixture',
        },
        encoding: 'utf8',
      });
      assert.equal(seed.status, 0, seed.stderr || seed.error?.message);
    }
    if (wrongRouteSession) {
      for (const script of [
        'services/api/seed-platform.mjs',
        'scripts/configure-development-routes.mjs',
      ]) {
        const configured = spawnSync(process.execPath, [script], {
          env: {
            ...process.env,
            CIVICMAPS_DATABASE_URL: databaseUrl.href,
            CIVICMAPS_MIGRATION_PROFILE: 'synthetic-fixture',
            CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only',
          },
          encoding: 'utf8',
        });
        assert.equal(configured.status, 0, configured.stderr || configured.error?.message);
      }
    }
    if (!seedFixtures)
      return {
        admin,
        databaseUrl: databaseUrl.href,
        name,
        drop: async () => {
          if (created) await admin.query(`DROP DATABASE ${name}`);
          await admin.end();
        },
      };
    const fixtureClient = new pg.Client({ connectionString: databaseUrl.href });
    await fixtureClient.connect();
    try {
      if (noncanonical)
        await fixtureClient.query(
          "UPDATE users SET name='Collision, not the fixture' WHERE id=$1",
          [sharedUser],
        );
      await fixtureClient.query(
        `INSERT INTO operating_context_grants(user_id,binding_id,effective_from)
         VALUES($1,$2,'2026-01-01T00:00:00Z')`,
        [sharedUser, sharedBinding],
      );
      if (wrongRouteSession) {
        const route = await fixtureClient.query(
          `SELECT id,version FROM service_routes
           WHERE hostname='beta-commandmaps.dev.civicmaps.com.au'`,
        );
        assert.equal(route.rowCount, 1);
        await fixtureClient.query(
          `INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at,route_id,route_version)
           VALUES(repeat('c',64),$1,'synthetic-wrong-route',now()+interval '1 hour',$2,$3)`,
          [sharedUser, route.rows[0].id, route.rows[0].version],
        );
      }
    } finally {
      await fixtureClient.end();
    }
    return {
      admin,
      databaseUrl: databaseUrl.href,
      name,
      drop: async () => {
        if (created) await admin.query(`DROP DATABASE ${name}`);
        await admin.end();
      },
    };
  } catch (error) {
    if (created) await admin.query(`DROP DATABASE ${name}`);
    await admin.end();
    throw error;
  }
}

function runMigration(databaseUrl, profile) {
  const env = { ...process.env, CIVICMAPS_DATABASE_URL: databaseUrl };
  delete env.CIVICMAPS_MIGRATION_PROFILE;
  if (profile) env.CIVICMAPS_MIGRATION_PROFILE = profile;
  return spawnSync(process.execPath, ['services/api/migrate.mjs'], { env, encoding: 'utf8' });
}

async function verifyFailedMigration(databaseUrl, expectWrongRouteSession = false) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    assert.equal(
      (
        await client.query(
          "SELECT 1 FROM civicmaps_migrations WHERE id='014-council-principal-ownership'",
        )
      ).rowCount,
      0,
    );
    assert.equal(
      (await client.query('SELECT to_regclass($1) AS name', ['public.council_principal_owners']))
        .rows[0].name,
      null,
    );
    assert.equal(
      (
        await client.query(
          'SELECT revoked_at FROM operating_context_grants WHERE user_id=$1 AND binding_id=$2',
          [sharedUser, sharedBinding],
        )
      ).rows[0].revoked_at,
      null,
    );
    assert.equal(
      (await client.query("SELECT 1 FROM sessions WHERE token_hash=repeat('c',64)")).rowCount,
      expectWrongRouteSession ? 1 : 0,
    );
  } finally {
    await client.end();
  }
}

test('ownership migration retires only the canonical synthetic grant and rolls back unsafe collisions', async () => {
  const empty = await createPreOwnershipDatabase({ seedFixtures: false });
  try {
    const migrated = runMigration(empty.databaseUrl);
    assert.equal(migrated.status, 0, migrated.stderr || migrated.error?.message);
    const client = new pg.Client({ connectionString: empty.databaseUrl });
    await client.connect();
    try {
      assert.equal((await client.query('SELECT * FROM council_principal_owners')).rowCount, 0);
      assert.equal((await client.query('SELECT * FROM users')).rowCount, 0);
      assert.equal((await client.query('SELECT * FROM civicmaps_migrations')).rowCount, 15);
    } finally {
      await client.end();
    }
  } finally {
    await empty.drop();
  }

  const canonical = await createPreOwnershipDatabase({ wrongRouteSession: true });
  try {
    const migrated = runMigration(canonical.databaseUrl, 'synthetic-fixture');
    assert.equal(migrated.status, 0, migrated.stderr || migrated.error?.message);
    const client = new pg.Client({ connectionString: canonical.databaseUrl });
    await client.connect();
    try {
      const result = await client.query(
        `SELECT g.revoked_at,g.effective_from,c.before_state,c.after_state
         FROM operating_context_grants g JOIN operating_context_changes c
           ON c.table_name='operating_context_grants' AND c.action='UPDATE'
          AND c.before_state->>'user_id'=g.user_id::text AND c.before_state->>'binding_id'=g.binding_id::text
         WHERE g.user_id=$1 AND g.binding_id=$2`,
        [sharedUser, sharedBinding],
      );
      assert.equal(result.rowCount, 1);
      assert.ok(result.rows[0].revoked_at);
      assert.equal(result.rows[0].effective_from.toISOString(), '2026-01-01T00:00:00.000Z');
      assert.equal(result.rows[0].before_state.revoked_at, null);
      assert.ok(result.rows[0].after_state.revoked_at);
      assert.equal(
        (
          await client.query(
            'SELECT municipality_id FROM council_principal_owners WHERE user_id=$1',
            [sharedUser],
          )
        ).rows[0].municipality_id,
        '20000000-0000-4000-8000-000000000001',
      );
      assert.equal(
        (await client.query("SELECT 1 FROM sessions WHERE token_hash=repeat('c',64)")).rowCount,
        0,
      );
    } finally {
      await client.end();
    }
  } finally {
    await canonical.drop();
  }

  const unselected = await createPreOwnershipDatabase({ wrongRouteSession: true });
  try {
    const migrated = runMigration(unselected.databaseUrl);
    assert.notEqual(migrated.status, 0);
    assert.match(migrated.stderr, /explicitly selected synthetic-fixture migration profile/);
    await verifyFailedMigration(unselected.databaseUrl, true);
  } finally {
    await unselected.drop();
  }

  const collision = await createPreOwnershipDatabase({
    noncanonical: true,
    wrongRouteSession: true,
  });
  try {
    const migrated = runMigration(collision.databaseUrl, 'synthetic-fixture');
    assert.notEqual(migrated.status, 0);
    assert.match(migrated.stderr, /conflicts with canonical synthetic identity fixture/);
    await verifyFailedMigration(collision.databaseUrl, true);
  } finally {
    await collision.drop();
  }
});

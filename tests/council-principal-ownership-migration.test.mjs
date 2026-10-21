import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { hashPassword } from '../services/api/passwords.mjs';

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

test('populated D02 owners migrate without changing Alpha access or disabled Beta history', async () => {
  const environment = await createPreOwnershipDatabase();
  const alphaUser = '00000000-0000-4000-8000-0000000000a1';
  const betaUser = '00000000-0000-4000-8000-0000000000b1';
  const alpha = '20000000-0000-4000-8000-000000000001';
  const beta = '20000000-0000-4000-8000-000000000002';
  const alphaBinding = '10000000-0000-4000-8000-000000000001';
  const betaBinding = '10000000-0000-4000-8000-000000000002';
  const client = new pg.Client({ connectionString: environment.databaseUrl });
  try {
    await client.connect();
    const operatorId = randomUUID();
    await client.query(
      "INSERT INTO platform_operators(id,email,name,password_hash) VALUES($1,'migration-operator@synthetic.example','Migration Operator','unused')",
      [operatorId],
    );
    for (const admin of [
      {
        id: alphaUser,
        municipality: alpha,
        binding: alphaBinding,
        email: 'active-alpha@synthetic.example',
        active: true,
        state: 'Activated',
      },
      {
        id: betaUser,
        municipality: beta,
        binding: betaBinding,
        email: 'disabled-beta@synthetic.example',
        active: false,
        state: 'Disabled',
      },
    ]) {
      const password =
        admin.id === alphaUser ? 'Alpha-admin-password-2026!' : 'Beta-admin-password-2026!';
      await client.query(
        `INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id,active)
         VALUES($1,$2,'Synthetic Council Admin',$3,'ADMIN',$4,$5,$6,$7,'parking','council-administration',$8)`,
        [
          admin.id,
          admin.email,
          hashPassword(password),
          `tenant-${admin.municipality === alpha ? 'alpha' : 'beta'}`,
          `jurisdiction-${admin.municipality === alpha ? 'alpha' : 'beta'}`,
          `plane-${admin.municipality === alpha ? 'alpha' : 'beta'}`,
          `organisation-${admin.municipality === alpha ? 'alpha' : 'beta'}`,
          admin.active,
        ],
      );
      await client.query(
        `INSERT INTO platform_first_admins(municipality_id,first_name,last_name,email,password_hash,user_id,binding_id,activation_state)
         VALUES($1,'Synthetic','Council Admin',$2,'unused',$3,$4,$5)`,
        [admin.municipality, admin.email, admin.id, admin.binding, admin.state],
      );
      await client.query(
        "INSERT INTO operating_context_grants(user_id,binding_id,effective_from) VALUES($1,$2,'2026-01-01T00:00:00Z')",
        [admin.id, admin.binding],
      );
      await client.query(
        `INSERT INTO council_admin_activations(id,municipality_id,binding_id,token_hash,issued_by,issued_at,expires_at,redeemed_at,revoked_at)
         VALUES($1,$2,$3,$4,$5,'2026-01-01','2026-01-02',$6,$7)`,
        [
          randomUUID(),
          admin.municipality,
          admin.binding,
          (admin.id === alphaUser ? 'a' : 'b').repeat(64),
          operatorId,
          admin.state === 'Activated' ? new Date('2026-01-01T01:00:00Z') : null,
          admin.state === 'Disabled' ? new Date('2026-01-01T02:00:00Z') : null,
        ],
      );
      await client.query(
        'INSERT INTO council_admin_events(municipality_id,operator_id,user_id,action) VALUES($1,$2,$3,$4)',
        [
          admin.municipality,
          operatorId,
          admin.id,
          admin.state === 'Activated' ? 'activation-redeemed' : 'administrator-disabled',
        ],
      );
    }
    await client.query(
      `INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at)
       VALUES(repeat('a',64),$1,'synthetic-alpha-session',now()+interval '1 hour')`,
      [alphaUser],
    );
    const before = {
      activations: (await client.query('SELECT * FROM council_admin_activations ORDER BY id')).rows,
      events: (await client.query('SELECT * FROM council_admin_events ORDER BY id')).rows,
      grants: (
        await client.query(
          'SELECT * FROM operating_context_grants WHERE user_id IN($1,$2) ORDER BY user_id',
          [alphaUser, betaUser],
        )
      ).rows,
      sessions: (
        await client.query(
          'SELECT token_hash,user_id,csrf_token,expires_at,route_id,route_version FROM sessions WHERE user_id IN($1,$2) ORDER BY token_hash',
          [alphaUser, betaUser],
        )
      ).rows,
    };
    await client.end();

    const migrated = runMigration(environment.databaseUrl, 'synthetic-fixture');
    assert.equal(migrated.status, 0, migrated.stderr || migrated.error?.message);

    const verify = new pg.Client({ connectionString: environment.databaseUrl });
    await verify.connect();
    try {
      const owners = (
        await verify.query(
          'SELECT user_id,municipality_id FROM council_principal_owners WHERE user_id IN($1,$2) ORDER BY user_id',
          [alphaUser, betaUser],
        )
      ).rows;
      assert.deepEqual(owners, [
        { user_id: alphaUser, municipality_id: alpha },
        { user_id: betaUser, municipality_id: beta },
      ]);
      assert.deepEqual(
        (await verify.query('SELECT * FROM council_admin_activations ORDER BY id')).rows,
        before.activations,
      );
      assert.deepEqual(
        (await verify.query('SELECT * FROM council_admin_events ORDER BY id')).rows,
        before.events,
      );
      assert.deepEqual(
        (
          await verify.query(
            'SELECT * FROM operating_context_grants WHERE user_id IN($1,$2) ORDER BY user_id',
            [alphaUser, betaUser],
          )
        ).rows,
        before.grants,
      );
      assert.deepEqual(
        (
          await verify.query(
            'SELECT token_hash,user_id,csrf_token,expires_at,route_id,route_version FROM sessions WHERE user_id IN($1,$2) ORDER BY token_hash',
            [alphaUser, betaUser],
          )
        ).rows,
        before.sessions,
      );
      assert.equal(
        (
          await verify.query(
            'SELECT municipality_id FROM sessions WHERE token_hash=repeat($1,64)',
            ['a'],
          )
        ).rows[0].municipality_id,
        alpha,
      );
      assert.equal(
        (await verify.query('SELECT count(*)::int AS n FROM sessions WHERE user_id=$1', [betaUser]))
          .rows[0].n,
        0,
      );
      assert.equal(
        (
          await verify.query(
            'SELECT count(*)::int AS n FROM council_admin_activations WHERE municipality_id=$1 AND redeemed_at IS NULL AND revoked_at IS NULL AND expires_at>now()',
            [beta],
          )
        ).rows[0].n,
        0,
      );
      assert.equal(
        (await verify.query('SELECT active FROM users WHERE id=$1', [betaUser])).rows[0].active,
        false,
      );
    } finally {
      await verify.end();
    }
    const previousDatabase = process.env.CIVICMAPS_DATABASE_URL;
    process.env.CIVICMAPS_DATABASE_URL = environment.databaseUrl;
    const [{ createApp }, { pool: appPool }] = await Promise.all([
      import('../services/api/app.mjs'),
      import('../services/api/database.mjs'),
    ]);
    const server = createApp().listen(0, '127.0.0.1');
    try {
      await new Promise((resolve) => server.once('listening', resolve));
      const origin = `http://127.0.0.1:${server.address().port}`;
      const alphaLogin = await fetch(`${origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'active-alpha@synthetic.example',
          password: 'Alpha-admin-password-2026!',
        }),
      });
      assert.equal(alphaLogin.status, 200);
      const betaLogin = await fetch(`${origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: 'disabled-beta@synthetic.example',
          password: 'Beta-admin-password-2026!',
        }),
      });
      assert.equal(betaLogin.status, 401);
      assert.equal(
        (
          await appPool.query('SELECT count(*)::int AS n FROM sessions WHERE user_id=$1', [
            betaUser,
          ])
        ).rows[0].n,
        0,
      );
    } finally {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      await appPool.end();
      if (previousDatabase === undefined) delete process.env.CIVICMAPS_DATABASE_URL;
      else process.env.CIVICMAPS_DATABASE_URL = previousDatabase;
    }
  } finally {
    await client.end().catch(() => {});
    await environment.drop();
  }
});

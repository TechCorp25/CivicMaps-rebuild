import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';

const alpha = '20000000-0000-4000-8000-000000000001';
const beta = '20000000-0000-4000-8000-000000000002';
const other = '20000000-0000-4000-8000-000000000099';
const tables = [
  'users',
  'sessions',
  'platform_sessions',
  'platform_first_admins',
  'operating_context_bindings',
  'operating_context_grants',
  'operating_context_changes',
  'service_routes',
  'municipality_resources',
  'service_requests',
  'audit_events',
  'mutation_receipts',
  'council_admin_activations',
  'council_admin_events',
];
async function capture(c) {
  const result = {};
  for (const t of tables)
    result[t] = (
      await c.query(
        `SELECT ${t === 'sessions' ? "to_jsonb(t)-'municipality_id'" : 'to_jsonb(t)'} row FROM ${t} t ORDER BY to_jsonb(t)::text`,
      )
    ).rows;
  return result;
}
test('populated F07 upgrade preserves identities, sessions and captured history; only explicit fixtures gain parking and replay never re-enables it', async () => {
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
        const source = await readFile(
          new URL('../services/api/migrate.mjs', import.meta.url),
          'utf8',
        );
        for (const [id] of source.matchAll(/\b0\d\d-[a-z-]+/g)) {
          if (id === '013-pack-entitlements') break;
          await c.query(
            await readFile(
              new URL(`../services/api/migrations/${id}.sql`, import.meta.url),
              'utf8',
            ),
          );
          await c.query('INSERT INTO civicmaps_migrations(id) VALUES($1)', [id]);
        }
        for (const file of [
          'services/api/seed.mjs',
          'services/api/seed-platform.mjs',
          'scripts/configure-development-routes.mjs',
        ]) {
          const r = spawnSync(process.execPath, [file], {
            env: {
              ...process.env,
              CIVICMAPS_DATABASE_URL: url,
              CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only',
            },
            encoding: 'utf8',
          });
          assert.equal(r.status, 0, r.stderr);
        }
        await c.query(
          'UPDATE platform_municipalities SET packs=\'["Local Laws"]\' WHERE id IN ($1,$2)',
          [alpha, beta],
        );
        await c.query(
          "INSERT INTO platform_municipalities(id,name,slug,status,packs) VALUES($1,'Unapproved fixture','unapproved-fixture','Active','[\"Local Laws\"]')",
          [other],
        );
        await c.query(
          "INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id) SELECT '00000000-0000-4000-8000-000000000099','admin-upgrade@synthetic.example','Existing ADMIN',password_hash,'ADMIN',tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id FROM users WHERE email='dispatch@alpha.example'",
        );
        await c.query(
          "INSERT INTO operating_context_grants(user_id,binding_id,effective_from) VALUES('00000000-0000-4000-8000-000000000099','10000000-0000-4000-8000-000000000001',now())",
        );
        await c.query(
          "INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES(repeat('a',64),'00000000-0000-4000-8000-000000000099','existing-admin',now()+interval '1 hour')",
        );
        await c.query(
          "INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status,capture_binding_id,capture_binding_version) VALUES('30000000-0000-4000-8000-000000000001','tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','Historical request',0,0,'Preserved','RECEIVED','10000000-0000-4000-8000-000000000001',1)",
        );
        await c.query(
          "INSERT INTO audit_events(request_id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,actor_id,action,details) VALUES('30000000-0000-4000-8000-000000000001','tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','00000000-0000-4000-8000-000000000001','created','{}')",
        );
        await c.query("UPDATE platform_pack_workload SET pack='Parks & Gardens'");
        before = await capture(c);
      } finally {
        await c.end();
      }
    },
  });
  try {
    assert.deepEqual(await capture(env.pool), before);
    assert.equal(
      (
        await env.pool.query(
          "SELECT count(*)::int count FROM platform_pack_workload WHERE pack<>'parks-gardens'",
        )
      ).rows[0].count,
      0,
    );

    const rows = (
      await env.pool.query(
        'SELECT id,packs,pack_version FROM platform_municipalities WHERE id=ANY($1::uuid[]) ORDER BY id',
        [[alpha, beta, other]],
      )
    ).rows;
    assert.deepEqual(
      rows.map((r) => r.packs),
      [['local-laws', 'parking-services'], ['local-laws', 'parking-services'], ['local-laws']],
    );
    assert.ok(rows.every((r) => r.pack_version === 1));
    await env.pool.query(
      "UPDATE platform_municipalities SET packs=packs-'parking-services' WHERE id=$1",
      [alpha],
    );
    const disabled = (
      await env.pool.query(
        'SELECT * FROM municipality_pack_history WHERE municipality_id=$1 ORDER BY version',
        [alpha],
      )
    ).rows;
    for (const file of ['services/api/migrate.mjs', 'services/api/seed.mjs']) {
      const r = spawnSync(process.execPath, [file], { env: process.env, encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
    }
    assert.deepEqual(await capture(env.pool), before);
    assert.deepEqual(
      (await env.pool.query('SELECT packs FROM platform_municipalities WHERE id=$1', [alpha]))
        .rows[0].packs,
      ['local-laws'],
    );
    assert.deepEqual(
      (
        await env.pool.query(
          'SELECT * FROM municipality_pack_history WHERE municipality_id=$1 ORDER BY version',
          [alpha],
        )
      ).rows,
      disabled,
    );
  } finally {
    await env.close();
  }
});

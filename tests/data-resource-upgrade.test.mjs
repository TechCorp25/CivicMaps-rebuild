import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createTestEnvironment } from './helpers/environment.mjs';

test('F05 upgrade and seed replay preserve F04 history without provisioning it', async () => {
  const job = randomUUID();
  const tables = [
    'users',
    'service_requests',
    'operating_context_bindings',
    'operating_context_grants',
    'platform_audit',
    'provisioning_jobs',
    'provisioning_steps',
    'synthetic_provisioning_effects',
  ];
  async function snapshot(client) {
    const result = {};
    for (const table of tables)
      result[table] = (
        await client.query(
          `SELECT to_jsonb(t)-'profile' AS value FROM ${table} t ORDER BY (to_jsonb(t)-'profile')::text`,
        )
      ).rows;
    return result;
  }
  let before;
  const environment = await createTestEnvironment({
    platform: true,
    beforeMigrate: async (connectionString) => {
      const client = new pg.Client({ connectionString });
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
          const seeded = spawnSync(process.execPath, [`services/api/${script}.mjs`], {
            env: { ...process.env, CIVICMAPS_DATABASE_URL: connectionString },
            encoding: 'utf8',
          });
          assert.equal(seeded.status, 0, seeded.stderr);
        }
        const operator = (await client.query('SELECT id FROM platform_operators LIMIT 1')).rows[0]
          .id;
        const municipality = (await client.query('SELECT id FROM platform_municipalities LIMIT 1'))
          .rows[0].id;
        await client.query(
          "INSERT INTO provisioning_jobs(id,municipality_id,operator_id,state) VALUES($1,$2,$3,'succeeded')",
          [job, municipality, operator],
        );
        for (const [index, name] of ['prepare_workspace', 'prepare_services'].entries()) {
          const resource = `synthetic:${municipality}:${job}:${name}`;
          await client.query(
            "INSERT INTO provisioning_steps(job_id,name,position,state,resource_id,completed_at,attempts) VALUES($1,$2,$3,'succeeded',$4,clock_timestamp(),1)",
            [job, name, index + 1, resource],
          );
          await client.query(
            'INSERT INTO synthetic_provisioning_effects(job_id,step_name,resource_id) VALUES($1,$2,$3)',
            [job, name, resource],
          );
        }
        await client.query(
          "INSERT INTO platform_audit(operator_id,municipality_id,action,details) VALUES($1,$2,'synthetic_history',$3)",
          [operator, municipality, { jobId: job }],
        );
        before = await snapshot(client);
      } finally {
        await client.end();
      }
    },
  });
  try {
    assert.deepEqual(await snapshot(environment.pool), before);
    const migrated = (
      await environment.pool.query('SELECT adapter,profile FROM provisioning_jobs WHERE id=$1', [
        job,
      ])
    ).rows[0];
    assert.deepEqual(migrated, { adapter: 'synthetic', profile: null });
    assert.equal(
      (await environment.pool.query('SELECT * FROM municipality_resources')).rowCount,
      0,
    );
    assert.equal(
      (await environment.pool.query('SELECT * FROM municipality_resource_contexts')).rowCount,
      0,
    );
    const replay = spawnSync(process.execPath, ['services/api/migrate.mjs'], {
      env: process.env,
      encoding: 'utf8',
    });
    assert.equal(replay.status, 0, replay.stderr);
    assert.deepEqual(await snapshot(environment.pool), before);
  } finally {
    await environment.close();
  }
});

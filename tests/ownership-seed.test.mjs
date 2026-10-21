import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createTestEnvironment } from './helpers/environment.mjs';

const userId = '00000000-0000-4000-8000-000000000001';
const municipalityId = '20000000-0000-4000-8000-000000000001';
const bindingId = '10000000-0000-4000-8000-000000000001';

function seed(url) {
  return spawnSync(process.execPath, ['services/api/seed.mjs'], {
    env: {
      ...process.env,
      CIVICMAPS_DATABASE_URL: url,
      CIVICMAPS_MIGRATION_PROFILE: 'synthetic-fixture',
    },
    encoding: 'utf8',
  });
}

test('synthetic reseed rejects UUID collisions and preserves revoked grants', async () => {
  const env = await createTestEnvironment();
  try {
    const beforeOwners = await env.pool.query(
      'SELECT * FROM council_principal_owners ORDER BY user_id',
    );
    const beforeGrants = await env.pool.query(
      'SELECT * FROM operating_context_grants ORDER BY user_id,binding_id',
    );
    await env.pool.query(
      "UPDATE platform_municipalities SET name='Unrelated council' WHERE id=$1",
      [municipalityId],
    );
    const municipalityCollision = seed(env.connectionString);
    assert.notEqual(municipalityCollision.status, 0);
    assert.match(municipalityCollision.stderr, /conflicts with canonical fixture/);
    await env.pool.query(
      "UPDATE platform_municipalities SET name='Synthetic Alpha council' WHERE id=$1",
      [municipalityId],
    );

    await env.pool.query("UPDATE users SET name='Unrelated identity' WHERE id=$1", [userId]);
    const userCollision = seed(env.connectionString);
    assert.notEqual(userCollision.status, 0);
    assert.match(userCollision.stderr, /conflicts with canonical fixture/);
    assert.deepEqual(
      (await env.pool.query('SELECT * FROM council_principal_owners ORDER BY user_id')).rows,
      beforeOwners.rows,
    );
    assert.deepEqual(
      (await env.pool.query('SELECT * FROM operating_context_grants ORDER BY user_id,binding_id'))
        .rows,
      beforeGrants.rows,
    );

    await env.pool.query("UPDATE users SET name='Alex · Dispatch' WHERE id=$1", [userId]);
    await env.pool.query(
      'UPDATE operating_context_grants SET revoked_at=now() WHERE user_id=$1 AND binding_id=$2',
      [userId, bindingId],
    );
    const reseed = seed(env.connectionString);
    assert.equal(reseed.status, 0, reseed.stderr || reseed.error?.message);
    const grant = await env.pool.query(
      'SELECT revoked_at FROM operating_context_grants WHERE user_id=$1 AND binding_id=$2',
      [userId, bindingId],
    );
    assert.ok(grant.rows[0].revoked_at);
  } finally {
    await env.close();
  }
});

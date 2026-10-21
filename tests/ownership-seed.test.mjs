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
    const beforeHistory = await env.pool.query(
      'SELECT * FROM operating_context_changes ORDER BY id',
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
    const testPrincipalId = '00000000-0000-4000-8000-000000000099';
    const unknownId = '00000000-0000-4000-8000-000000000098';
    await env.pool.query(
      `INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id)
       VALUES($1,'admin-upgrade@synthetic.example','Unrelated UUID collision','preserved','ADMIN','tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','council-administration')`,
      [testPrincipalId],
    );
    const testPrincipalCollision = seed(env.connectionString);
    assert.notEqual(testPrincipalCollision.status, 0);
    assert.match(testPrincipalCollision.stderr, /test principal conflicts with canonical fixture/);
    assert.equal(
      (
        await env.pool.query('SELECT 1 FROM council_principal_owners WHERE user_id=$1', [
          testPrincipalId,
        ])
      ).rowCount,
      0,
    );
    assert.deepEqual(
      (
        await env.pool.query('SELECT email,name,password_hash,role FROM users WHERE id=$1', [
          testPrincipalId,
        ])
      ).rows[0],
      {
        email: 'admin-upgrade@synthetic.example',
        name: 'Unrelated UUID collision',
        password_hash: 'preserved',
        role: 'ADMIN',
      },
    );
    assert.deepEqual(
      (await env.pool.query('SELECT * FROM council_principal_owners ORDER BY user_id')).rows,
      beforeOwners.rows,
    );
    assert.deepEqual(
      (await env.pool.query('SELECT * FROM operating_context_grants ORDER BY user_id,binding_id'))
        .rows,
      beforeGrants.rows,
    );
    assert.deepEqual(
      (await env.pool.query('SELECT * FROM operating_context_changes ORDER BY id')).rows,
      beforeHistory.rows,
    );
    await env.pool.query("UPDATE users SET name='Existing ADMIN' WHERE id=$1", [testPrincipalId]);
    await env.pool.query(
      `INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id)
       VALUES($1,'unknown@synthetic.example','Unknown principal','preserved','DISPATCHER','tenant-alpha','jurisdiction-alpha','plane-alpha','organisation-alpha','parking','day-team')`,
      [unknownId],
    );
    await env.pool.query(
      'UPDATE operating_context_grants SET revoked_at=now() WHERE user_id=$1 AND binding_id=$2',
      [userId, bindingId],
    );
    const reseed = seed(env.connectionString);
    assert.equal(reseed.status, 0, reseed.stderr || reseed.error?.message);
    assert.equal(
      (
        await env.pool.query(
          'SELECT municipality_id FROM council_principal_owners WHERE user_id=$1',
          [testPrincipalId],
        )
      ).rows[0].municipality_id,
      municipalityId,
    );
    assert.equal(
      (await env.pool.query('SELECT 1 FROM council_principal_owners WHERE user_id=$1', [unknownId]))
        .rowCount,
      0,
    );
    const grant = await env.pool.query(
      'SELECT revoked_at FROM operating_context_grants WHERE user_id=$1 AND binding_id=$2',
      [userId, bindingId],
    );
    assert.ok(grant.rows[0].revoked_at);
  } finally {
    await env.close();
  }
});

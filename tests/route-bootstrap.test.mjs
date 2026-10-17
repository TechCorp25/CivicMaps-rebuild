import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createTestEnvironment } from './helpers/environment.mjs';

test('bootstrap preserves registry identities, replays owned routes and rejects conflicting ownership', async () => {
  const env = await createTestEnvironment({ platform: true });
  const run = () =>
    spawnSync(process.execPath, ['scripts/configure-development-routes.mjs'], {
      env: { ...process.env, CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only' },
      encoding: 'utf8',
    });
  const identities = async () =>
    (await env.pool.query('SELECT id,slug FROM platform_municipalities ORDER BY id')).rows;
  const routes = async () =>
    (await env.pool.query('SELECT * FROM service_routes ORDER BY hostname')).rows;
  try {
    const before = await identities();
    let result = run();
    assert.equal(result.status, 0, result.stderr);
    const first = await routes();
    assert.equal(first.length, 3);
    result = run();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await routes(), first);
    assert.deepEqual(await identities(), before);
    await env.pool.query(
      "UPDATE service_routes SET target='conflicting-deployment' WHERE municipality_token='alpha'",
    );
    const conflicting = await routes();
    result = run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Route ownership conflict/);
    assert.deepEqual(await routes(), conflicting);
    assert.deepEqual(await identities(), before);
  } finally {
    await env.close();
  }
});

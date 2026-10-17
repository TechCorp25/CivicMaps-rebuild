import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { pool } from '/opt/civicmaps/services/api/database.mjs';
import { runRoutingOnce } from '/opt/civicmaps/services/api/routing.mjs';
assert.equal(process.env.CIVICMAPS_CLOUD_ACCEPTANCE, 'F06-synthetic-only');
assert.equal(process.env.CIVICMAPS_ROUTING_MODE, 'ingress');
const host = 'platform.dev.civicmaps.com.au';
const original = (await pool.query('SELECT * FROM service_routes WHERE hostname=$1', [host]))
  .rows[0];
const get = async () =>
  (await pool.query('SELECT * FROM service_routes WHERE id=$1', [original.id])).rows[0];
const observed = async (r) => {
  const response = await fetch(`https://${r.hostname}/api/routing/probe`, {
    headers: { 'x-civicmaps-probe': process.env.CIVICMAPS_PROBE_TOKEN },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  return response.json();
};
const healthy = { reconcile: observed };
const failed = {
  async reconcile(r) {
    if (r.id === original.id) throw new Error('controlled transient probe fault');
    return observed(r);
  },
};
async function waitFor(ms) {
  while (ms > 0) {
    const part = Math.min(ms, 10000);
    await setTimeout(part);
    ms -= part;
  }
}
async function untilClaim(adapter) {
  for (let n = 0; n < 6; n++) {
    const row = await get();
    if (row.next_attempt_at)
      await setTimeout(Math.max(0, new Date(row.next_attempt_at) - Date.now()) + 100);
    await runRoutingOnce(adapter);
    const updated = await get();
    if (
      updated.state !== row.state ||
      updated.checked_at?.getTime() !== row.checked_at?.getTime() ||
      updated.attempts !== row.attempts
    )
      return updated;
  }
  throw new Error('Target route was not processed');
}
async function publicHealth() {
  const r = await fetch(`https://${host}/api/health`, {
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  return { status: r.status, data: await r.json() };
}
assert.equal(spawnSync('systemctl', ['stop', 'civicmaps-routing']).status, 0);
try {
  // Wait until the target's ordinary ready recheck becomes eligible; never fake freshness.
  let row = await get();
  await waitFor(Math.max(0, new Date(row.checked_at).getTime() + 60100 - Date.now()));
  row = await untilClaim(failed);
  assert.equal(row.state, 'pending');
  assert.equal(row.attempts, 1);
  assert.ok(new Date(row.next_attempt_at) > new Date());
  assert.equal((await publicHealth()).status, 503);
  row = await untilClaim(healthy);
  assert.equal(row.state, 'ready');
  assert.equal(row.attempts, 0);
  assert.equal(row.version, original.version);
  assert.deepEqual(await publicHealth(), {
    status: 200,
    data: { status: 'ready', mode: 'ingress', data: 'synthetic' },
  });
  console.log(
    'PASS live transient probe failure fails closed and automatically recovers through verified public TLS, preserving route/version',
  );
  await waitFor(Math.max(0, new Date(row.checked_at).getTime() + 60100 - Date.now()));
  for (let attempt = 1; attempt <= 3; attempt++) {
    row = await untilClaim(failed);
    assert.equal(row.attempts, attempt);
  }
  assert.equal(row.state, 'failed');
  assert.equal((await publicHealth()).status, 503);
  await runRoutingOnce(healthy);
  assert.equal((await get()).state, 'failed');
  const recovered = spawnSync(
    'runuser',
    [
      '-u',
      'postgres',
      '--preserve-environment',
      '--',
      '/opt/civicmaps-node/bin/node',
      '/opt/civicmaps/scripts/recover-platform-route.mjs',
      String(row.version),
    ],
    {
      env: {
        ...process.env,
        CIVICMAPS_DATABASE_URL:
          'postgresql://postgres@localhost/civicmaps_f06?host=/var/run/postgresql',
      },
      encoding: 'utf8',
    },
  );
  assert.equal(recovered.status, 0, 'Restricted OS/database recovery must succeed');
  row = await untilClaim(healthy);
  assert.equal(row.state, 'ready');
  assert.equal(row.version, original.version + 1);
  assert.equal((await publicHealth()).status, 200);
  assert.ok(
    (
      await pool.query(
        "SELECT 1 FROM service_route_events WHERE route_id=$1 AND actor='out-of-band:ssm-postgres' AND action='retry'",
        [original.id],
      )
    ).rowCount,
  );
  console.log(
    'PASS live exhausted budget stays closed; authenticated current-version out-of-band recovery is audited and requires a new public TLS probe',
  );
} finally {
  spawnSync('systemctl', ['start', 'civicmaps-routing']);
  await pool.end();
}

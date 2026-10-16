// Run only on the explicitly approved F06 runtime after loading its private environment.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { pool, transaction } from '../services/api/database.mjs';
import { controlRoute } from '../services/api/routing.mjs';
import { aws } from '../services/api/data-resources.mjs';
if (
  process.env.CIVICMAPS_CLOUD_ACCEPTANCE !== 'F06-synthetic-only' ||
  process.env.CIVICMAPS_ROUTING_MODE !== 'ingress'
)
  throw new Error('Explicit F06 live target required');
const password = process.env.CIVICMAPS_DEMO_PASSWORD;
assert.ok(password && password !== 'CivicMAPS-local-2026!');
const hosts = [
  'alpha-commandmaps.dev.civicmaps.com.au',
  'beta-commandmaps.dev.civicmaps.com.au',
  'platform.dev.civicmaps.com.au',
];
const proof = [];
const pass = (name) => {
  proof.push(name);
  console.log('PASS ' + name);
};
async function request(host, path, { body, cookie, headers = {} } = {}) {
  const response = await fetch(`https://${host}${path}`, {
    method: body ? 'POST' : 'GET',
    redirect: 'error',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { status: response.status, cookie: response.headers.get('set-cookie'), data };
}
async function login(n) {
  const r = await request(hosts[n], '/api/auth/login', {
    body: { email: `dispatch@${n === 0 ? 'alpha' : 'beta'}.example`, password },
  });
  assert.equal(r.status, 200);
  assert.match(r.cookie, /Secure/);
  assert.match(r.cookie, /HttpOnly/);
  assert.doesNotMatch(r.cookie, /Domain=/i);
  return r;
}
async function waitReady(id) {
  for (let n = 0; n < 24; n++) {
    const r = (await pool.query('SELECT state FROM service_routes WHERE id=$1', [id])).rows[0];
    if (r.state === 'ready') return;
    await setTimeout(5000);
  }
  throw new Error('Route did not become ready');
}
try {
  const identity = await aws('sts', 'get-caller-identity');
  assert.equal(identity.Account, '597663815195');
  await assert.rejects(
    aws('secretsmanager', 'get-secret-value', {
      SecretId: process.env.CIVICMAPS_RESOURCE_MASTER_SECRET,
    }),
    { code: 'ACCESS_DENIED' },
  );
  pass('F06 runtime project identity and master-secret access denial');
  for (const host of hosts) {
    const health = await request(host, '/api/health');
    assert.equal(health.status, 200);
  }
  const sessions = [await login(0), await login(1)];
  for (let n = 0; n < 2; n++) {
    const r = await request(hosts[n], '/api/resources/status', { cookie: sessions[n].cookie });
    assert.equal(r.status, 200);
    assert.equal(r.data.municipalityId, `20000000-0000-4000-8000-00000000000${n + 1}`);
    assert.equal(
      (await request(hosts[1 - n], '/api/auth/session', { cookie: sessions[n].cookie })).status,
      401,
    );
  }
  assert.equal(
    (
      await request(hosts[1], '/api/auth/login', {
        body: { email: 'dispatch@alpha.example', password },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(hosts[0], '/api/auth/session', {
        cookie: sessions[0].cookie,
        headers: { 'x-civicmaps-context': '10000000-0000-4000-8000-000000000002' },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(hosts[0], '/api/auth/logout', {
        body: {},
        cookie: sessions[0].cookie,
        headers: { origin: `https://${hosts[1]}`, 'x-csrf-token': sessions[0].data.csrfToken },
      })
    ).status,
    403,
  );
  pass(
    'Real public TLS, exact Alpha/Beta resources, secure host-only cookies and copied-session/context/origin denial',
  );
  for (const key of ['X-Forwarded-Host', 'X-Forwarded-Proto', 'Forwarded', 'X-Civicmaps-Ingress'])
    assert.equal(
      (await request(hosts[0], '/api/health', { headers: { [key]: 'forged' } })).status,
      421,
    );
  assert.equal((await fetch('http://127.0.0.1:4100/api/health')).status, 421);
  assert.equal(
    (await request(hosts[0], '/api/platform/auth/session', { cookie: sessions[0].cookie })).status,
    403,
  );
  pass(
    'Live Caddy forwarding-header rejection, direct backend denial and identity-plane separation',
  );
  const alpha = (await pool.query('SELECT * FROM service_routes WHERE hostname=$1', [hosts[0]]))
    .rows[0];
  await pool.query('UPDATE municipality_resources SET disabled_at=now() WHERE job_id=$1', [
    alpha.job_id,
  ]);
  try {
    assert.equal((await request(hosts[0], '/api/health')).status, 503);
    assert.equal((await request(hosts[1], '/api/health')).status, 200);
  } finally {
    await pool.query('UPDATE municipality_resources SET disabled_at=NULL WHERE job_id=$1', [
      alpha.job_id,
    ]);
  }
  await transaction((c) => controlRoute(c, alpha.id, alpha.version, 'withdraw', 'F06-acceptance'));
  assert.equal(
    (await request(hosts[0], '/api/auth/session', { cookie: sessions[0].cookie })).status,
    503,
  );
  await transaction((c) => controlRoute(c, alpha.id, alpha.version + 1, 'retry', 'F06-acceptance'));
  await waitReady(alpha.id);
  assert.equal(
    (await request(hosts[0], '/api/auth/session', { cookie: sessions[0].cookie })).status,
    401,
  );
  await login(0);
  pass(
    'Disabled resource and route withdrawal fail closed; re-enable preserves data and invalidates old sessions',
  );
  // A real process dies after the public TLS probe and before its readiness checkpoint.
  assert.equal(spawnSync('systemctl', ['stop', 'civicmaps-routing']).status, 0);
  await pool.query(
    "UPDATE service_routes SET state='pending',attempts=0,checked_at=NULL WHERE id=$1",
    [alpha.id],
  );
  const crash = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import {runRoutingOnce} from './services/api/routing.mjs';await runRoutingOnce({async reconcile(r){const x=await fetch('https://'+r.hostname+'/api/routing/probe',{headers:{'x-civicmaps-probe':process.env.CIVICMAPS_PROBE_TOKEN},redirect:'error'});if(!x.ok)throw Error();return x.json();}},{afterEffect(){process.exit(87);}});process.exit(1);`,
    ],
    { env: process.env, encoding: 'utf8', timeout: 30000 },
  );
  assert.equal(crash.status, 87, 'Worker crash checkpoint was not reached');
  await pool.query("UPDATE service_routes SET lease_until=now()-interval '1 second' WHERE id=$1", [
    alpha.id,
  ]);
  assert.equal(
    spawnSync(process.execPath, ['services/api/routing-worker.mjs', '--once'], {
      env: process.env,
      timeout: 30000,
    }).status,
    0,
  );
  await waitReady(alpha.id);
  pass('Actual worker process crash after public TLS effect reconciles the same owned manifest');
  console.log(
    JSON.stringify({ status: 'passed', executedAt: new Date().toISOString(), hosts, proof }),
  );
} finally {
  spawnSync('systemctl', ['start', 'civicmaps-routing']);
  await pool.end();
}

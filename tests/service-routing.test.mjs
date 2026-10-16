import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { permittedContexts } from '../services/api/operating-context.mjs';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from './helpers/environment.mjs';
import { canonicalHost, runRoutingOnce, controlRoute } from '../services/api/routing.mjs';
let env, pool;
const ingress = 'a'.repeat(48),
  probe = 'b'.repeat(48);
const hosts = [
  'alpha-commandmaps.dev.civicmaps.com.au',
  'beta-commandmaps.dev.civicmaps.com.au',
  'platform.dev.civicmaps.com.au',
];
const routeIds = [randomUUID(), randomUUID(), randomUUID()];
async function request(host, path, body, cookie, extra = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      env.origin + path,
      {
        method: body ? 'POST' : 'GET',
        headers: {
          host,
          'x-forwarded-host': host,
          'x-forwarded-proto': 'https',
          'x-civicmaps-ingress': ingress,
          ...(body ? { 'content-type': 'application/json' } : {}),
          ...(cookie ? { cookie } : {}),
          ...extra,
        },
      },
      (res) => {
        let text = '';
        res.on('data', (c) => (text += c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            cookie: res.headers['set-cookie']?.[0],
            body: text ? JSON.parse(text) : null,
          }),
        );
      },
    );
    req.on('error', reject);
    req.end(body ? JSON.stringify(body) : undefined);
  });
}
before(async () => {
  env = await createTestEnvironment({ platform: true });
  pool = env.pool;
  for (let n = 1; n <= 2; n++) {
    const municipality = `20000000-0000-4000-8000-00000000000${n}`;
    const binding = `10000000-0000-4000-8000-00000000000${n}`;
    const job = `f0500000-0000-4000-8000-00000000000${n}`;
    await pool.query(
      `INSERT INTO provisioning_jobs(id,municipality_id,operator_id,adapter,profile,state) SELECT $1,$2,id,'aws-postgres-s3','aws-sydney-development','succeeded' FROM platform_operators LIMIT 1`,
      [job, municipality],
    );
    await pool.query(
      `INSERT INTO municipality_resources(job_id,municipality_id,profile,database_name,runtime_name,secret_ref,storage_prefix,schema_version) VALUES ($1,$2,'aws-sydney-development',$3,$4,$5,$6,2)`,
      [
        job,
        municipality,
        `civicmaps_${job.replaceAll('-', '')}`,
        `runtime_${job.replaceAll('-', '')}`,
        `civicmaps/f05/${job}`,
        `municipalities/${municipality}/${job}/`,
      ],
    );
    await pool.query('INSERT INTO municipality_resource_contexts VALUES ($1,$2)', [job, binding]);
    await pool.query(
      "INSERT INTO service_routes(id,hostname,service,municipality_id,binding_id,job_id,target,state,checked_at) VALUES ($1,$2,'commandmaps',$3,$4,$5,'test-only','ready',clock_timestamp())",
      [routeIds[n - 1], hosts[n - 1], municipality, binding, job],
    );
  }
  await pool.query(
    "INSERT INTO service_routes(id,hostname,service,target,state,checked_at) VALUES ($1,$2,'platform','test-only','ready',clock_timestamp())",
    [routeIds[2], hosts[2]],
  );
  process.env.CIVICMAPS_ROUTING_MODE = 'ingress';
  process.env.CIVICMAPS_INGRESS_TOKEN = ingress;
  process.env.CIVICMAPS_PROBE_TOKEN = probe;
});
after(async () => {
  delete process.env.CIVICMAPS_ROUTING_MODE;
  delete process.env.CIVICMAPS_INGRESS_TOKEN;
  delete process.env.CIVICMAPS_PROBE_TOKEN;
  await env?.close();
});
test('authority canonicalisation and untrusted/forged forwarding fail closed', async () => {
  assert.equal(canonicalHost(hosts[0].toUpperCase()), hosts[0]);
  for (const bad of [
    hosts[0] + ':443',
    hosts[0] + '.',
    'evil.test',
    'alpha.dev.civicmaps.com.au.evil.test',
    'a,b',
    null,
  ])
    assert.throws(() => canonicalHost(bad));
  for (const headers of [
    { 'x-civicmaps-ingress': 'wrong' },
    { 'x-forwarded-host': hosts[1] },
    { 'x-forwarded-proto': 'http' },
    { 'x-forwarded-host': [hosts[0], hosts[0]] },
    { forwarded: 'host=evil.test' },
  ])
    assert.equal((await request(hosts[0], '/api/health', null, null, headers)).status, 421);
  assert.equal((await request('unknown.dev.civicmaps.com.au', '/api/health')).status, 421);
  assert.equal((await request(hosts[0], '/api/routing/probe')).status, 403);
  const p = await request(hosts[0], '/api/routing/probe', null, null, {
    'x-civicmaps-probe': probe,
  });
  assert.equal(p.status, 500); // No AWS target: metadata alone cannot pass a live resource probe.
});
test('login, manually copied cookies, context and origins are bound to exact route', async () => {
  const login = await request(hosts[0], '/api/auth/login', {
    email: 'dispatch@alpha.example',
    password: 'CivicMAPS-local-2026!',
  });
  assert.equal(login.status, 200);
  assert.match(login.cookie, /Secure/);
  assert.match(login.cookie, /HttpOnly/);
  assert.doesNotMatch(login.cookie, /Domain=/);
  assert.equal((await request(hosts[0], '/api/auth/session', null, login.cookie)).status, 200);
  assert.equal((await request(hosts[1], '/api/auth/session', null, login.cookie)).status, 401);
  assert.equal(
    (
      await request(hosts[1], '/api/auth/login', {
        email: 'dispatch@alpha.example',
        password: 'CivicMAPS-local-2026!',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(hosts[0], '/api/auth/session', null, login.cookie, {
        'x-civicmaps-context': '10000000-0000-4000-8000-000000000002',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(hosts[0], '/api/auth/logout', {}, login.cookie, {
        origin: `https://${hosts[1]}`,
      })
    ).status,
    403,
  );
  assert.equal(
    (await request(hosts[0], '/api/platform/auth/session', null, login.cookie)).status,
    403,
  );
  assert.equal((await request(hosts[2], '/api/auth/session', null, login.cookie)).status, 403);
});
test('resource failure, stale probes, withdrawal/version and retries fail closed and preserve history', async () => {
  await pool.query('UPDATE municipality_resources SET disabled_at=now() WHERE job_id=$1', [
    'f0500000-0000-4000-8000-000000000001',
  ]);
  assert.equal((await request(hosts[0], '/api/health')).status, 503);
  await pool.query('UPDATE municipality_resources SET disabled_at=NULL');
  await pool.query("UPDATE service_routes SET checked_at=now()-interval '6 minutes' WHERE id=$1", [
    routeIds[0],
  ]);
  assert.equal((await request(hosts[0], '/api/health')).status, 503);
  const login = await request(hosts[1], '/api/auth/login', {
    email: 'dispatch@beta.example',
    password: 'CivicMAPS-local-2026!',
  });
  assert.equal(login.status, 200);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await controlRoute(client, routeIds[1], 1, 'withdraw', 'test');
    await client.query('COMMIT');
    assert.equal((await request(hosts[1], '/api/auth/session', null, login.cookie)).status, 503);
    await assert.rejects(controlRoute(client, routeIds[1], 1, 'retry', 'test'), { status: 409 });
    await controlRoute(client, routeIds[1], 2, 'retry', 'test');
  } finally {
    client.release();
  }
  await pool.query("UPDATE service_routes SET state='ready',checked_at=now() WHERE id=$1", [
    routeIds[1],
  ]);
  assert.equal((await request(hosts[1], '/api/auth/session', null, login.cookie)).status, 401);
  assert.equal((await pool.query('SELECT 1 FROM municipality_resources')).rowCount, 2);
});
test('route worker reconciles exact identity, rejects mismatches and fences a stale completion', async () => {
  await pool.query("UPDATE service_routes SET state='withdrawn' WHERE id<>$1", [routeIds[0]]);
  await pool.query("UPDATE service_routes SET state='pending',attempts=0 WHERE id=$1", [
    routeIds[0],
  ]);
  const observed = (r) => ({
    hostname: r.hostname,
    routeId: r.id,
    version: r.version,
    municipalityId: r.municipality_id,
    service: r.service,
  });
  let applies = 0;
  const adapter = {
    async reconcile() {
      return null;
    },
    async apply(r) {
      applies++;
      return observed(r);
    },
  };
  assert.equal(
    await runRoutingOnce(adapter, {
      afterEffect: async (r) => {
        await pool.query(
          "UPDATE service_routes SET lease_until=now()-interval '1 second' WHERE id=$1",
          [r.id],
        );
      },
    }),
    false,
  );
  assert.equal(
    await runRoutingOnce({
      async reconcile(r) {
        return observed(r);
      },
      async apply() {
        assert.fail();
      },
    }),
    true,
  );
  assert.equal(applies, 1);
  await pool.query("UPDATE service_routes SET state='pending' WHERE id=$1", [routeIds[0]]);
  await runRoutingOnce({
    async reconcile() {
      return { hostname: hosts[1] };
    },
  });
  assert.equal(
    (await pool.query('SELECT state FROM service_routes WHERE id=$1', [routeIds[0]])).rows[0].state,
    'failed',
  );
});

test('read-only broker takes authentication/context locks without identity update grants', async () => {
  const role = 'f06_lock_' + randomUUID().replaceAll('-', '');
  const client = await pool.connect();
  try {
    await client.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER BYPASSRLS`);
    await client.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
    await client.query(
      `GRANT SELECT ON users,sessions,platform_operators,platform_sessions,operating_context_bindings,operating_context_grants TO ${role}`,
    );
    await client.query(
      `GRANT EXECUTE ON FUNCTION civicmaps_lock_user_contexts(uuid),civicmaps_lock_auth_session(text,boolean,boolean) TO ${role}`,
    );
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE ${role}`);
    const user = (await client.query("SELECT * FROM users WHERE email='dispatch@alpha.example'"))
      .rows[0];
    assert.ok((await permittedContexts(client, user)).length);
    await client.query("SELECT civicmaps_lock_auth_session(repeat('a',64),false,false)");
    await client.query("SELECT civicmaps_lock_auth_session(repeat('a',64),true,true)");
    await assert.rejects(client.query('UPDATE users SET active=false WHERE false'), {
      code: '42501',
    });
    await client.query('ROLLBACK');
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_local_app');
    await assert.rejects(client.query('SELECT civicmaps_lock_user_contexts($1)', [user.id]), {
      code: '42501',
    });
    await client.query('ROLLBACK');
  } finally {
    await client.query('ROLLBACK');
    await client.query(`DROP OWNED BY ${role}`);
    await client.query(`DROP ROLE ${role}`);
    client.release();
  }
});

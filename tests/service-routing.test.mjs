import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { permittedContexts } from '../services/api/operating-context.mjs';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from './helpers/environment.mjs';
import { canonicalHost, runRoutingOnce, controlRoute } from '../services/api/routing.mjs';
let env, pool, webRoot;
const ingress = 'a'.repeat(48),
  probe = 'b'.repeat(48);
const hosts = [
  'alpha-commandmaps.dev.civicmaps.com.au',
  'beta-commandmaps.dev.civicmaps.com.au',
  'platform.dev.civicmaps.com.au',
];
const routeIds = [randomUUID(), randomUUID(), randomUUID()];
test('token upgrade preserves owned routes and registry data, and rejects incompatible history', async () => {
  const client = await pool.connect();
  const migration = await readFile(
    new URL('../services/api/migrations/010-route-municipality-tokens.sql', import.meta.url),
    'utf8',
  );
  try {
    for (const conflict of [false, true]) {
      await client.query('BEGIN');
      await client.query(
        'ALTER TABLE service_routes DROP CONSTRAINT service_route_municipality_token, DROP CONSTRAINT service_route_dns_label_length, DROP COLUMN municipality_token',
      );
      if (conflict)
        await client.query(
          "UPDATE service_routes SET hostname='wrong-commandmaps.dev.civicmaps.com.au' WHERE id=$1",
          [routeIds[0]],
        );
      const before = (await client.query('SELECT * FROM platform_municipalities ORDER BY id')).rows;
      if (conflict) {
        await assert.rejects(client.query(migration), /Route naming conflict/);
      } else {
        const routes = (await client.query('SELECT * FROM service_routes ORDER BY id')).rows;
        await client.query(migration);
        assert.deepEqual(
          (await client.query('SELECT * FROM platform_municipalities ORDER BY id')).rows,
          before,
        );
        const upgraded = (await client.query('SELECT * FROM service_routes ORDER BY id')).rows;
        assert.deepEqual(
          upgraded.map(({ municipality_token: _token, ...r }) => r),
          routes,
        );
        assert.equal(upgraded.find((r) => r.id === routeIds[0]).municipality_token, 'alpha');
      }
      await client.query('ROLLBACK');
    }
    await client.query('BEGIN');
    await assert.rejects(
      client.query('UPDATE service_routes SET hostname=$1 WHERE id=$2', [hosts[1], routeIds[0]]),
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
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
          'x-civicmaps-client-ip': '192.0.2.10',
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
            body: text
              ? res.headers['content-type']?.includes('application/json')
                ? JSON.parse(text)
                : text
              : null,
          }),
        );
      },
    );
    req.on('error', reject);
    req.end(body ? JSON.stringify(body) : undefined);
  });
}
before(async () => {
  webRoot = await mkdtemp(join(tmpdir(), 'civicmaps-web-routing-'));
  for (const app of ['commandmaps', 'civicmaps-platform']) {
    await mkdir(join(webRoot, app, 'dist', 'assets'), { recursive: true });
    await writeFile(join(webRoot, app, 'dist', 'index.html'), `<!doctype html><h1>${app}</h1>`);
    await writeFile(
      join(webRoot, app, 'dist', 'assets', 'fixture.js'),
      '/* owned static fixture */',
    );
  }
  env = await createTestEnvironment({ platform: true, webRoot });
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
      "INSERT INTO service_routes(id,hostname,service,municipality_id,binding_id,job_id,target,state,checked_at,municipality_token) VALUES ($1,$2,'commandmaps',$3,$4,$5,'test-only','ready',clock_timestamp(),$6)",
      [routeIds[n - 1], hosts[n - 1], municipality, binding, job, n === 1 ? 'alpha' : 'beta'],
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
  if (webRoot) await rm(webRoot, { recursive: true, force: true });
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
    { 'x-civicmaps-client-ip': ['192.0.2.1', '192.0.2.2'] },
    { 'x-civicmaps-client-ip': '192.0.2.1, 192.0.2.2' },
    { 'x-civicmaps-client-ip': 'forged' },
    { 'x-civicmaps-client-ip': '' },
  ])
    assert.equal((await request(hosts[0], '/api/health', null, null, headers)).status, 421);
  assert.equal((await request('unknown.dev.civicmaps.com.au', '/api/health')).status, 421);
  assert.equal((await request(hosts[0], '/api/routing/probe')).status, 403);
  const p = await request(hosts[0], '/api/routing/probe', null, null, {
    'x-civicmaps-probe': probe,
  });
  assert.equal(p.status, 500); // No AWS target: metadata alone cannot pass a live resource probe.
});
test('ingress serves each owned web app before the API 404 boundary', async () => {
  assert.match((await request(hosts[0], '/')).body, /<h1>commandmaps/);
  assert.match((await request(hosts[2], '/')).body, /<h1>civicmaps-platform/);
  assert.match((await request(hosts[0], '/assets/fixture.js')).body, /owned static fixture/);
  assert.equal((await request(hosts[0], '/api/not-a-real-endpoint')).status, 404);
  const headers = { 'x-civicmaps-probe': probe };
  assert.equal((await request(hosts[2], '/api/routing/probe', null, null, headers)).status, 200);
  const entry = join(webRoot, 'civicmaps-platform', 'dist', 'index.html');
  await rm(entry);
  try {
    assert.equal((await request(hosts[2], '/api/routing/probe', null, null, headers)).status, 503);
  } finally {
    await writeFile(entry, '<!doctype html><h1>civicmaps-platform</h1>');
  }
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
  await pool.query("UPDATE service_routes SET state='pending',attempts=0 WHERE id=$1", [
    routeIds[0],
  ]);
  await runRoutingOnce({
    async reconcile() {
      return { hostname: hosts[1] };
    },
  });
  assert.equal(
    (await pool.query('SELECT state FROM service_routes WHERE id=$1', [routeIds[0]])).rows[0].state,
    'pending',
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

test('Platform transient retry is durable, bounded, fenced and recoverable only by an operator', async () => {
  const { recoverPlatformRoute } = await import('../services/api/platform-route-recovery.mjs');
  const id = routeIds[2];
  await pool.query("UPDATE service_routes SET state='withdrawn',lease_token=NULL,lease_until=NULL");
  await pool.query(
    "UPDATE service_routes SET state='ready',checked_at=now()-interval '61 seconds',attempts=0 WHERE id=$1",
    [id],
  );
  const state = async () =>
    (await pool.query('SELECT * FROM service_routes WHERE id=$1', [id])).rows[0];
  const healthy = {
    async reconcile(r) {
      return {
        hostname: r.hostname,
        routeId: r.id,
        version: r.version,
        municipalityId: r.municipality_id,
        service: r.service,
      };
    },
  };
  const failing = {
    async reconcile() {
      throw new Error('private provider failure');
    },
  };
  await runRoutingOnce(failing);
  let row = await state();
  assert.equal(row.state, 'pending');
  assert.equal(row.attempts, 1);
  assert.ok(row.next_attempt_at > new Date());
  assert.equal(
    (
      await request(hosts[2], '/api/platform/auth/login', {
        email: 'operator@platform.example',
        password: 'CivicMAPS-local-2026!',
      })
    ).status,
    503,
  );
  assert.equal(await runRoutingOnce(healthy), false);
  await pool.query(
    "UPDATE service_routes SET next_attempt_at=now()-interval '1 second' WHERE id=$1",
    [id],
  );
  // A new process recovers using the persisted deadline, without any in-memory retry state.
  const { spawnSync } = await import('node:child_process');
  const restart = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import {runRoutingOnce} from './services/api/routing.mjs';
    import {pool} from './services/api/database.mjs';
    await runRoutingOnce({async reconcile(r){return {hostname:r.hostname,routeId:r.id,version:r.version,municipalityId:r.municipality_id,service:r.service}}});
    await pool.end();`,
    ],
    { env: process.env, encoding: 'utf8' },
  );
  assert.equal(restart.status, 0, restart.stderr);
  row = await state();
  assert.equal(row.state, 'ready');
  assert.equal(row.attempts, 0);
  assert.equal((await request(hosts[2], '/api/health')).status, 200);
  assert.deepEqual((await request(hosts[2], '/api/health')).body, {
    status: 'ready',
    mode: 'ingress',
    data: 'synthetic',
  });
  await pool.query("UPDATE service_routes SET checked_at=now()-interval '61 seconds' WHERE id=$1", [
    id,
  ]);
  for (let i = 1; i <= 3; i++) {
    await runRoutingOnce(failing);
    row = await state();
    assert.equal(row.attempts, i);
    if (i < 3)
      await pool.query(
        "UPDATE service_routes SET next_attempt_at=now()-interval '1 second' WHERE id=$1",
        [id],
      );
  }
  assert.equal(row.state, 'failed');
  assert.equal(row.next_attempt_at, null);
  assert.equal(await runRoutingOnce(healthy), false);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL ROLE civicmaps_platform_app');
    await assert.rejects(recoverPlatformRoute(client, row.version, 'test'), { status: 403 });
    await client.query('ROLLBACK');
    await client.query('BEGIN');
    await assert.rejects(recoverPlatformRoute(client, row.version + 1, 'test'), { status: 409 });
    const recovered = await recoverPlatformRoute(client, row.version, 'test');
    assert.equal(recovered.version, row.version + 1);
    await client.query('COMMIT');
    await runRoutingOnce(healthy);
    row = await state();
    // A concurrent worker cannot claim the same unexpired lease. Withdrawal fences its result.
    await pool.query(
      "UPDATE service_routes SET checked_at=now()-interval '61 seconds' WHERE id=$1",
      [id],
    );
    await runRoutingOnce(healthy, {
      afterEffect: async () => {
        assert.equal(await runRoutingOnce(healthy), false);
        await controlRoute(client, id, row.version, 'withdraw', 'test');
      },
    });
    assert.equal((await state()).state, 'withdrawn');
    assert.equal(await runRoutingOnce(healthy), false);
    await assert.rejects(recoverPlatformRoute(client, (await state()).version, 'test'), {
      status: 409,
    });
    const events = (
      await pool.query('SELECT action FROM service_route_events WHERE route_id=$1', [id])
    ).rows.map((r) => r.action);
    assert.ok(events.includes('retry-scheduled'));
    assert.ok(events.includes('failed'));
    assert.ok(events.includes('withdraw'));
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('login limits isolate clients and routes, and limit one identity across addresses', async () => {
  await pool.query(
    "UPDATE service_routes SET state='ready',attempts=0,checked_at=now(),lease_token=NULL,lease_until=NULL",
  );
  const login = (host, email, ip, password = 'incorrect') =>
    request(
      host,
      host === hosts[2] ? '/api/platform/auth/login' : '/api/auth/login',
      { email, password },
      null,
      { 'x-civicmaps-client-ip': ip },
    );
  for (let i = 0; i < 20; i++)
    assert.equal((await login(hosts[0], `absent${i}@example.test`, '192.0.2.20')).status, 401);
  assert.equal((await login(hosts[0], 'another@example.test', '192.0.2.20')).status, 429);
  assert.equal(
    (await login(hosts[0], 'dispatch@alpha.example', '192.0.2.21', 'CivicMAPS-local-2026!')).status,
    200,
  );
  assert.equal(
    (await login(hosts[1], 'dispatch@beta.example', '192.0.2.20', 'CivicMAPS-local-2026!')).status,
    200,
  );
  assert.equal(
    (await login(hosts[2], 'operator@platform.example', '192.0.2.20', 'CivicMAPS-local-2026!'))
      .status,
    200,
  );
  for (let i = 1; i <= 20; i++)
    assert.equal((await login(hosts[0], 'target@example.test', `198.51.100.${i}`)).status, 401);
  assert.equal((await login(hosts[0], ' TARGET@example.test ', '198.51.100.21')).status, 429);
  assert.equal((await login(hosts[1], 'target@example.test', '198.51.100.21')).status, 401);
});

test('repeated crashed routing leases exhaust the durable attempt budget and retain audit', async () => {
  const id = routeIds[2];
  await pool.query("UPDATE service_routes SET state='withdrawn',lease_token=NULL,lease_until=NULL");
  await pool.query(
    "UPDATE service_routes SET state='pending',attempts=0,next_attempt_at=NULL WHERE id=$1",
    [id],
  );
  const adapter = {
    async reconcile(r) {
      return {
        hostname: r.hostname,
        routeId: r.id,
        version: r.version,
        municipalityId: r.municipality_id,
        service: r.service,
      };
    },
  };
  for (let i = 1; i <= 3; i++) {
    assert.equal(
      await runRoutingOnce(adapter, {
        afterEffect: async () => {
          await pool.query(
            "UPDATE service_routes SET lease_until=now()-interval '1 second' WHERE id=$1",
            [id],
          );
        },
      }),
      false,
    );
    assert.equal(
      (await pool.query('SELECT attempts FROM service_routes WHERE id=$1', [id])).rows[0].attempts,
      i,
    );
  }
  assert.equal(await runRoutingOnce(adapter), false);
  const row = (await pool.query('SELECT * FROM service_routes WHERE id=$1', [id])).rows[0];
  assert.equal(row.state, 'failed');
  assert.equal(row.lease_token, null);
  assert.equal((await request(hosts[2], '/api/health')).status, 503);
  assert.ok(
    (
      await pool.query("SELECT 1 FROM service_route_events WHERE route_id=$1 AND action='failed'", [
        id,
      ])
    ).rowCount,
  );
});

test('crashes during a ready-route recheck consume the same finite budget', async () => {
  const id = routeIds[2];
  await pool.query(
    "UPDATE service_routes SET state='ready',attempts=0,checked_at=now()-interval '61 seconds',lease_token=NULL,lease_until=NULL WHERE id=$1",
    [id],
  );
  const adapter = {
    async reconcile(r) {
      return {
        hostname: r.hostname,
        routeId: r.id,
        version: r.version,
        municipalityId: r.municipality_id,
        service: r.service,
      };
    },
  };
  for (let i = 1; i <= 3; i++) {
    assert.equal(
      await runRoutingOnce(adapter, {
        afterEffect: async () => {
          await pool.query(
            "UPDATE service_routes SET lease_until=now()-interval '1 second' WHERE id=$1",
            [id],
          );
        },
      }),
      false,
    );
    assert.equal(
      (await pool.query('SELECT attempts FROM service_routes WHERE id=$1', [id])).rows[0].attempts,
      i,
    );
  }
  assert.equal(await runRoutingOnce(adapter), false);
  assert.equal(
    (await pool.query('SELECT state FROM service_routes WHERE id=$1', [id])).rows[0].state,
    'failed',
  );
  assert.equal((await request(hosts[2], '/api/health')).status, 503);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { createTestEnvironment } from './helpers/environment.mjs';
import { hashPassword } from '../services/api/passwords.mjs';

const alpha = '20000000-0000-4000-8000-000000000001';
const beta = '20000000-0000-4000-8000-000000000002';
const binding = '10000000-0000-4000-8000-000000000001';
const otherBinding = '10000000-0000-4000-8000-000000000002';
const password = 'Synthetic-admin-password-2026!';
test('F07 issuance, atomic activation, explicit least privilege, recovery and disable preserve ownership', async () => {
  const env = await createTestEnvironment({ platform: true });
  async function call(path, data, headers = {}) {
    if (headers.host)
      return new Promise((resolve, reject) => {
        const request = http.request(
          env.origin + '/api' + path,
          {
            method: data === undefined ? 'GET' : 'POST',
            headers: { 'content-type': 'application/json', ...headers },
          },
          (response) => {
            let payload = '';
            response.on('data', (chunk) => {
              payload += chunk;
            });
            response.on('end', () =>
              resolve({
                status: response.statusCode,
                cookie: response.headers['set-cookie']?.[0],
                data: JSON.parse(payload),
              }),
            );
          },
        );
        request.on('error', reject);
        request.end(data === undefined ? undefined : JSON.stringify(data));
      });
    const response = await fetch(env.origin + '/api' + path, {
      method: data === undefined ? 'GET' : 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    return {
      status: response.status,
      cookie: response.headers.get('set-cookie'),
      data: await response.json(),
    };
  }
  try {
    const bootstrap = spawnSync(process.execPath, ['scripts/configure-development-routes.mjs'], {
      env: { ...process.env, CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only' },
      encoding: 'utf8',
    });
    assert.equal(bootstrap.status, 0, bootstrap.stderr);
    for (const [id, email] of [
      [alpha, 'admin@alpha.synthetic.example'],
      [beta, 'admin@beta.synthetic.example'],
    ])
      await env.pool.query(
        'INSERT INTO platform_first_admins(municipality_id,first_name,last_name,email,password_hash) VALUES($1,$2,$3,$4,$5)',
        [id, 'Synthetic', 'Admin', email, hashPassword('legacy-unused-registration-password')],
      );
    const operator = await call('/platform/auth/login', {
      email: 'operator@platform.example',
      password: 'CivicMAPS-local-2026!',
    });
    const operatorHeaders = { cookie: operator.cookie, 'x-csrf-token': operator.data.csrfToken };
    const path = `/platform/municipalities/${alpha}/activation`;
    const issue = (overrides = {}, headers = {}) =>
      call(
        path,
        {
          bindingId: binding,
          verifiedEmail: 'admin@alpha.synthetic.example',
          recipientVerified: true,
          ...overrides,
        },
        { ...operatorHeaders, 'Idempotency-Key': randomUUID(), ...headers },
      );
    assert.equal((await issue({}, { cookie: '' })).status, 401);
    assert.equal((await issue({}, { 'x-csrf-token': '' })).status, 403);
    assert.equal((await issue({}, { origin: 'https://hostile.example' })).status, 403);
    assert.equal((await issue({ recipientVerified: false })).status, 400);
    assert.equal((await issue({ verifiedEmail: 'other@example.test' })).status, 409);
    assert.equal((await issue({ bindingId: otherBinding })).status, 409);
    const key = randomUUID();
    const first = await issue({}, { 'Idempotency-Key': key });
    assert.equal(first.status, 200);
    const token = first.data.activationUrl.split('/').at(-1);
    assert.match(token, /^[a-f0-9]{64}$/);
    const replay = await issue({}, { 'Idempotency-Key': key });
    assert.equal(replay.data.activationUrl, undefined);
    assert.equal(replay.data.replayed, true);
    assert.equal(
      (await env.pool.query('SELECT count(*)::int AS n FROM council_admin_activations')).rows[0].n,
      1,
    );
    const stored = (await env.pool.query('SELECT * FROM council_admin_activations')).rows[0];
    assert.notEqual(stored.token_hash, token);
    assert.ok(Math.abs(new Date(stored.expires_at) - new Date(stored.issued_at) - 86400000) < 1000);
    const redeem = (raw, overrides = {}) =>
      call('/activation/redeem', {
        municipalityId: alpha,
        bindingId: binding,
        token: raw,
        password,
        ...overrides,
      });
    assert.equal((await redeem(token, { password: 'short' })).status, 400);
    assert.equal((await redeem(token, { bindingId: otherBinding })).status, 409);
    assert.equal((await redeem(token, { municipalityId: beta })).status, 409);
    assert.equal((await redeem(token, { role: 'DISPATCHER' })).status, 400);
    const reissued = await issue();
    assert.equal(reissued.status, 200);
    assert.equal((await redeem(token)).status, 409);
    const expired = reissued.data.activationUrl.split('/').at(-1);
    await env.pool.query(
      "UPDATE council_admin_activations SET issued_at=clock_timestamp()-interval '2 days',expires_at=clock_timestamp()-interval '1 day' WHERE id=$1",
      [reissued.data.id],
    );
    assert.equal((await redeem(expired)).status, 410);
    const final = await issue();
    const finalToken = final.data.activationUrl.split('/').at(-1);
    const originalMode = process.env.CIVICMAPS_ROUTING_MODE;
    const originalIngress = process.env.CIVICMAPS_INGRESS_TOKEN;
    const ingress = (host) => ({
      host: host + '.dev.civicmaps.com.au',
      'x-forwarded-host': host + '.dev.civicmaps.com.au',
      'x-forwarded-proto': 'https',
      'x-civicmaps-client-ip': '192.0.2.40',
      'x-civicmaps-ingress': 'synthetic-ingress-token-at-least-32-characters',
    });
    await env.pool.query("UPDATE service_routes SET state='ready',checked_at=clock_timestamp()");
    try {
      process.env.CIVICMAPS_ROUTING_MODE = 'ingress';
      process.env.CIVICMAPS_INGRESS_TOKEN = 'synthetic-ingress-token-at-least-32-characters';
      const payload = { municipalityId: alpha, bindingId: binding, token: finalToken, password };
      assert.equal(
        (await call('/activation/redeem', payload, ingress('beta-commandmaps'))).status,
        403,
      );
      assert.equal((await call('/activation/redeem', payload, ingress('platform'))).status, 403);
      assert.equal((await call('/activation/redeem', payload)).status, 421);
    } finally {
      if (originalMode === undefined) delete process.env.CIVICMAPS_ROUTING_MODE;
      else process.env.CIVICMAPS_ROUTING_MODE = originalMode;
      if (originalIngress === undefined) delete process.env.CIVICMAPS_INGRESS_TOKEN;
      else process.env.CIVICMAPS_INGRESS_TOKEN = originalIngress;
    }
    await env.pool
      .query(`CREATE FUNCTION reject_synthetic_owner() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN RAISE EXCEPTION 'synthetic owner write rejected'; END $$`);
    await env.pool
      .query(`CREATE TRIGGER reject_synthetic_owner BEFORE INSERT ON council_principal_owners
      FOR EACH ROW EXECUTE FUNCTION reject_synthetic_owner()`);
    assert.equal((await redeem(finalToken)).status, 500);
    assert.equal(
      (
        await env.pool.query('SELECT user_id FROM platform_first_admins WHERE municipality_id=$1', [
          alpha,
        ])
      ).rows[0].user_id,
      null,
    );
    assert.equal(
      (
        await env.pool.query('SELECT redeemed_at FROM council_admin_activations WHERE id=$1', [
          final.data.id,
        ])
      ).rows[0].redeemed_at,
      null,
    );
    await env.pool.query('DROP TRIGGER reject_synthetic_owner ON council_principal_owners');
    await env.pool.query('DROP FUNCTION reject_synthetic_owner()');
    const results = await Promise.all([redeem(finalToken), redeem(finalToken)]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    const admin = await call('/auth/login', { email: 'admin@alpha.synthetic.example', password });
    assert.equal(admin.status, 200);
    assert.equal(admin.data.actor.role, 'ADMIN');
    assert.equal(
      (
        await env.pool.query(
          'SELECT municipality_id FROM council_principal_owners WHERE user_id=$1',
          [admin.data.actor.id],
        )
      ).rows[0].municipality_id,
      alpha,
    );
    const headers = {
      cookie: admin.cookie,
      'x-csrf-token': admin.data.csrfToken,
      'Idempotency-Key': randomUUID(),
    };
    const profile = await call('/auth/session', undefined, headers);
    assert.equal(profile.status, 200);
    assert.equal(profile.data.actor.context_id, binding);
    assert.equal(profile.data.actor.municipality_id, alpha);
    assert.equal((await call('/auth/contexts', undefined, headers)).data.length, 1);
    assert.equal(
      (await call('/auth/session', undefined, { ...headers, 'x-civicmaps-context': otherBinding }))
        .status,
      403,
    );
    for (const endpoint of ['/officers', '/requests', '/resources/status'])
      assert.equal((await call(endpoint, undefined, headers)).status, 403, endpoint);
    assert.equal(
      (
        await call(
          '/requests',
          { address: 'Synthetic street', latitude: 0, longitude: 0, notes: '' },
          headers,
        )
      ).status,
      403,
    );
    assert.equal((await call('/platform/municipalities', undefined, headers)).status, 401);
    assert.equal((await call('/auth/session', undefined, operatorHeaders)).status, 401);
    assert.equal(
      (
        await call(
          path,
          {
            bindingId: binding,
            verifiedEmail: 'admin@alpha.synthetic.example',
            recipientVerified: true,
          },
          headers,
        )
      ).status,
      401,
    );
    try {
      process.env.CIVICMAPS_ROUTING_MODE = 'ingress';
      process.env.CIVICMAPS_INGRESS_TOKEN = 'synthetic-ingress-token-at-least-32-characters';
      const routed = await call(
        '/auth/login',
        { email: 'admin@alpha.synthetic.example', password },
        ingress('alpha-commandmaps'),
      );
      assert.equal(routed.status, 200);
      assert.equal(
        (
          await call('/auth/session', undefined, {
            ...ingress('alpha-commandmaps'),
            cookie: routed.cookie,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await call('/auth/session', undefined, {
            ...ingress('beta-commandmaps'),
            cookie: routed.cookie,
          })
        ).status,
        401,
      );
      assert.equal(
        (
          await call('/auth/session', undefined, {
            ...ingress('alpha-commandmaps'),
            cookie: routed.cookie,
            'x-civicmaps-context': otherBinding,
          })
        ).status,
        403,
      );
    } finally {
      if (originalMode === undefined) delete process.env.CIVICMAPS_ROUTING_MODE;
      else process.env.CIVICMAPS_ROUTING_MODE = originalMode;
      if (originalIngress === undefined) delete process.env.CIVICMAPS_INGRESS_TOKEN;
      else process.env.CIVICMAPS_INGRESS_TOKEN = originalIngress;
    }
    // An ADMIN actor cannot bypass the API restriction with direct app-role SQL.
    const c = await env.pool.connect();
    try {
      await c.query('BEGIN');
      await c.query('SET LOCAL ROLE civicmaps_local_app');
      for (const [key, value] of Object.entries({
        actor: admin.data.actor.id,
        context: binding,
        tenant: 'tenant-alpha',
        organisation: 'organisation-alpha',
        jurisdiction: 'jurisdiction-alpha',
        plane: 'plane-alpha',
        branch: 'parking',
      }))
        await c.query('SELECT set_config($1,$2,true)', ['civicmaps.' + key, value]);
      for (const table of ['users', 'service_requests', 'audit_events', 'mutation_receipts'])
        assert.equal((await c.query(`SELECT * FROM ${table}`)).rowCount, 0);
      await assert.rejects(
        c.query('SELECT civicmaps_issue_admin($1,$2,$3,$4,$5,$6)', [
          alpha,
          binding,
          operator.data.actor.id,
          'admin@alpha.synthetic.example',
          randomUUID(),
          'a'.repeat(64),
        ]),
        { code: '42501' },
      );
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
    // Bootstrap/migration/seed replay must preserve the activated identity and status.
    const snapshot = async () => {
      const result = {};
      for (const table of [
        'users',
        'sessions',
        'platform_sessions',
        'platform_first_admins',
        'platform_municipalities',
        'operating_context_bindings',
        'operating_context_grants',
        'service_routes',
        'municipality_resources',
        'municipality_resource_contexts',
        'provisioning_jobs',
        'council_admin_activations',
        'council_admin_events',
      ])
        result[table] = (
          await env.pool.query(
            `SELECT to_jsonb(t) AS row FROM ${table} t ORDER BY to_jsonb(t)::text`,
          )
        ).rows;
      return result;
    };
    const before = await snapshot();
    for (const script of [
      'services/api/migrate.mjs',
      'services/api/seed.mjs',
      'services/api/seed-platform.mjs',
      'scripts/configure-development-routes.mjs',
    ]) {
      const run = spawnSync(process.execPath, [script], {
        env: { ...process.env, CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only' },
        encoding: 'utf8',
      });
      assert.equal(run.status, 0, run.stderr);
    }
    assert.deepEqual(await snapshot(), before);
    assert.equal((await issue()).status, 409);
    // A login that read the old active flag must wait, then reject after disable commits.
    const blocker = await env.pool.connect();
    let racingLogin;
    try {
      await blocker.query('BEGIN');
      await blocker.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [admin.data.actor.id]);
      racingLogin = call('/auth/login', { email: 'admin@alpha.synthetic.example', password });
      let waiting = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        waiting =
          (
            await env.pool.query(
              "SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'SELECT civicmaps_lock_login_user%'",
            )
          ).rowCount > 0;
        if (waiting) break;
        await setTimeout(20);
      }
      assert.ok(waiting, 'Login must wait for the identity lock');
      await blocker.query('SELECT civicmaps_disable_admin($1,$2)', [alpha, operator.data.actor.id]);
      await blocker.query('COMMIT');
      assert.equal((await racingLogin).status, 401);
    } finally {
      await blocker.query('ROLLBACK');
      blocker.release();
    }
    const disabled = await call(
      path + '/disable',
      {},
      { ...operatorHeaders, 'Idempotency-Key': randomUUID() },
    );
    assert.equal(disabled.status, 200);
    assert.equal((await call('/auth/session', undefined, headers)).status, 401);
    assert.equal(
      (await call('/auth/login', { email: 'admin@alpha.synthetic.example', password })).status,
      401,
    );
    assert.equal((await redeem(finalToken)).status, 409);
    assert.equal(
      (
        await env.pool.query('SELECT count(*)::int AS n FROM sessions WHERE user_id=$1', [
          admin.data.actor.id,
        ])
      ).rows[0].n,
      0,
    );
    const alphaTokenState = (
      await env.pool.query(
        `SELECT count(*)::int AS total,
      count(*) FILTER (WHERE redeemed_at IS NULL AND revoked_at IS NULL AND expires_at>now())::int AS usable
      FROM council_admin_activations WHERE municipality_id=$1`,
        [alpha],
      )
    ).rows[0];
    assert.ok(alphaTokenState.total > 0);
    assert.equal(alphaTokenState.usable, 0);

    // A disabled council principal keeps its original grant pair and token history;
    // inactivity makes that grant non-effective and no session remains usable.
    const betaIssued = await call(
      `/platform/municipalities/${beta}/activation`,
      {
        bindingId: otherBinding,
        verifiedEmail: 'admin@beta.synthetic.example',
        recipientVerified: true,
      },
      { ...operatorHeaders, 'Idempotency-Key': randomUUID() },
    );
    assert.equal(betaIssued.status, 200);
    const betaToken = betaIssued.data.activationUrl.split('/').at(-1);
    assert.equal(
      (
        await call('/activation/redeem', {
          municipalityId: beta,
          bindingId: otherBinding,
          token: betaToken,
          password,
        })
      ).status,
      200,
    );
    const betaAdmin = await call('/auth/login', {
      email: 'admin@beta.synthetic.example',
      password,
    });
    assert.equal(betaAdmin.status, 200);
    const betaUserId = betaAdmin.data.actor.id;
    assert.equal(
      (
        await env.pool.query(
          'SELECT municipality_id FROM council_principal_owners WHERE user_id=$1',
          [betaUserId],
        )
      ).rows[0].municipality_id,
      beta,
    );
    assert.equal(
      (
        await call(
          `/platform/municipalities/${beta}/activation/disable`,
          {},
          {
            ...operatorHeaders,
            'Idempotency-Key': randomUUID(),
          },
        )
      ).status,
      200,
    );
    const betaState = (
      await env.pool.query(
        `SELECT u.active,g.revoked_at,s.token_hash
      FROM users u JOIN operating_context_grants g ON g.user_id=u.id
      LEFT JOIN sessions s ON s.user_id=u.id WHERE u.id=$1`,
        [betaUserId],
      )
    ).rows[0];
    assert.equal(betaState.active, false);
    assert.equal(betaState.revoked_at, null);
    assert.equal(betaState.token_hash, null);
    assert.equal(
      (
        await env.pool.query(
          `SELECT count(*)::int AS n FROM council_admin_activations
      WHERE municipality_id=$1 AND redeemed_at IS NULL AND revoked_at IS NULL AND expires_at>now()`,
          [beta],
        )
      ).rows[0].n,
      0,
    );
    const actions = (await env.pool.query('SELECT action FROM council_admin_events')).rows.map(
      (r) => r.action,
    );
    for (const action of [
      'activation-issued',
      'activation-redeemed',
      'activation-expired',
      'activation-rejected',
      'administrator-disabled',
    ])
      assert.ok(actions.includes(action), action);
    const receipts = JSON.stringify(
      (await env.pool.query('SELECT response FROM platform_receipts')).rows,
    );
    const audit = JSON.stringify((await env.pool.query('SELECT * FROM council_admin_events')).rows);
    for (const secret of [token, expired, finalToken, password]) {
      assert.ok(!receipts.includes(secret));
      assert.ok(!audit.includes(secret));
    }
  } finally {
    await env.close();
  }
});

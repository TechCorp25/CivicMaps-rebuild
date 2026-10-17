// Runs the actual reviewed Caddy routing handlers over disposable loopback HTTP.
// Public certificate issuance and TLS identity remain separate live acceptance.
import assert from 'node:assert/strict';
import { createTestEnvironment } from './helpers/environment.mjs';
import { routingFixture } from './helpers/routing-fixture.mjs';
import http from 'node:http';
import { once } from 'node:events';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
const binary = process.env.CIVICMAPS_CADDY_BINARY;
assert.ok(binary, 'Select the verified Caddy binary explicitly');
const directory = await mkdtemp(join(tmpdir(), 'civicmaps-ingress-'));
const environment = await createTestEnvironment({ platform: true });
await routingFixture(environment.pool);
process.env.CIVICMAPS_ROUTING_MODE = 'ingress';
process.env.CIVICMAPS_INGRESS_TOKEN = 'local-ingress-contract-'.repeat(3);
const portServer = http.createServer().listen(0, '127.0.0.1');
await once(portServer, 'listening');
const port = portServer.address().port;
await new Promise((r) => portServer.close(r));
let child;
try {
  const env = {
    ...process.env,
    CIVICMAPS_INGRESS_TOKEN: process.env.CIVICMAPS_INGRESS_TOKEN,
    XDG_DATA_HOME: directory,
    XDG_CONFIG_HOME: directory,
  };
  const adapted = spawnSync(
    binary,
    ['adapt', '--config', 'infrastructure/f06/Caddyfile', '--adapter', 'caddyfile'],
    { encoding: 'utf8', env },
  );
  assert.equal(adapted.status, 0, adapted.stderr);
  const config = JSON.parse(adapted.stdout);
  const web = Object.values(config.apps.http.servers).find((s) => s.listen.includes(':443'));
  assert.ok(web);
  web.listen = [`127.0.0.1:${port}`];
  web.automatic_https = { disable: true };
  delete web.tls_connection_policies;
  delete web.strict_sni_host;
  const rewrite = (v) => {
    if (!v || typeof v !== 'object') return;
    if (v.handler === 'reverse_proxy') v.upstreams = [{ dial: new URL(environment.origin).host }];
    for (const value of Object.values(v)) rewrite(value);
  };
  rewrite(web);
  config.apps.http.servers = { contract: web };
  delete config.apps.tls;
  await writeFile(join(directory, 'config.json'), JSON.stringify(config));
  child = spawn(binary, ['run', '--config', join(directory, 'config.json')], {
    env,
    stdio: 'ignore',
  });
  async function request(
    host,
    email,
    localAddress = '127.0.0.1',
    headers = {},
    password = 'incorrect',
  ) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({ email, password });
      const req = http.request(
        {
          host: '127.0.0.1',
          port,
          localAddress,
          path: host.startsWith('platform.') ? '/api/platform/auth/login' : '/api/auth/login',
          method: 'POST',
          headers: { host, 'content-type': 'application/json', ...headers },
        },
        (res) => {
          res.resume();
          res.on('end', () => resolve(res.statusCode));
        },
      );
      req.on('error', reject);
      req.end(payload);
    });
  }
  const alpha = 'alpha-commandmaps.dev.civicmaps.com.au',
    beta = 'beta-commandmaps.dev.civicmaps.com.au',
    platform = 'platform.dev.civicmaps.com.au';
  for (let i = 0; i < 50; i++) {
    try {
      await request('unknown.dev.civicmaps.com.au', 'absent@example.test');
      break;
    } catch {
      await setTimeout(100);
    }
  }
  for (let i = 0; i < 20; i++) assert.equal(await request(alpha, `absent${i}@example.test`), 401);
  // Neither supplied forwarding addresses nor duplicate custom headers can reset the socket bucket.
  assert.equal(
    await request(alpha, 'fresh@example.test', '127.0.0.1', {
      'X-Civicmaps-Client-Ip': ['192.0.2.1', '192.0.2.2'],
      'X-Forwarded-For': '192.0.2.3',
    }),
    429,
  );
  assert.equal(
    await request(alpha, 'dispatch@alpha.example', '127.0.0.2', {}, 'CivicMAPS-local-2026!'),
    200,
  );
  assert.equal(
    await request(beta, 'dispatch@beta.example', '127.0.0.1', {}, 'CivicMAPS-local-2026!'),
    200,
  );
  assert.equal(
    await request(platform, 'operator@platform.example', '127.0.0.1', {}, 'CivicMAPS-local-2026!'),
    200,
  );
  for (let i = 1; i <= 20; i++)
    assert.equal(await request(platform, 'target@example.test', `127.0.1.${i}`), 401);
  assert.equal(await request(platform, ' TARGET@example.test ', '127.0.1.21'), 429);
  console.log(
    'PASS actual Caddy + Express API: independent socket clients, same-client limit, cross-client identity limit, Alpha/Beta/Platform isolation and spoofed/duplicate client-header overwrite (local HTTP only).',
  );
} finally {
  if (child) {
    child.kill('SIGTERM');
    await once(child, 'exit');
  }
  delete process.env.CIVICMAPS_ROUTING_MODE;
  delete process.env.CIVICMAPS_INGRESS_TOKEN;
  await environment.close();
  await rm(directory, { recursive: true, force: true });
}

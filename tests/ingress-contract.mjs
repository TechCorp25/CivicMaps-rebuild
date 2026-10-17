// Runs the actual reviewed Caddy routing handlers over disposable loopback HTTP.
// Public certificate issuance and TLS identity remain separate live acceptance.
import assert from 'node:assert/strict';
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
const backend = http
  .createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        host: req.headers.host,
        forwarded: req.headers['x-forwarded-host'],
        protocol: req.headers['x-forwarded-proto'],
        trusted: req.headers['x-civicmaps-ingress'] === 'local-contract-only',
      }),
    );
  })
  .listen(0, '127.0.0.1');
await once(backend, 'listening');
const portServer = http.createServer().listen(0, '127.0.0.1');
await once(portServer, 'listening');
const port = portServer.address().port;
await new Promise((r) => portServer.close(r));
let child;
try {
  const env = {
    ...process.env,
    CIVICMAPS_INGRESS_TOKEN: 'local-contract-only',
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
    if (v.handler === 'reverse_proxy')
      v.upstreams = [{ dial: `127.0.0.1:${backend.address().port}` }];
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
  async function request(host, headers = {}) {
    return new Promise((resolve, reject) => {
      const req = http.get(
        { host: '127.0.0.1', port, path: '/', headers: { host, ...headers } },
        (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, body }));
        },
      );
      req.on('error', reject);
    });
  }
  for (let i = 0; i < 50; i++) {
    try {
      await request('unknown.dev.civicmaps.com.au');
      break;
    } catch {
      await setTimeout(100);
    }
  }
  for (const host of [
    'platform.dev.civicmaps.com.au',
    'alpha-commandmaps.dev.civicmaps.com.au',
    'beta-commandmaps.dev.civicmaps.com.au',
  ]) {
    const r = await request(host);
    assert.equal((await request(host, { 'X-Forwarded-Proto': 'https' })).status, 200);
    assert.equal(r.status, 200);
    assert.deepEqual(JSON.parse(r.body), {
      host,
      forwarded: host,
      protocol: 'https',
      trusted: true,
    });
    for (const header of [
      'X-Forwarded-Host',
      'X-Forwarded-Proto',
      'Forwarded',
      'X-Civicmaps-Ingress',
    ])
      assert.equal((await request(host, { [header]: 'forged' })).status, 421);
  }
  assert.equal((await request('unknown.dev.civicmaps.com.au')).status, 421);
  console.log(
    'PASS actual Caddy host allowlist, authority preservation, secret injection and client forwarding-header rejection (loopback HTTP fixture only).',
  );
} finally {
  if (child) {
    child.kill('SIGTERM');
    await once(child, 'exit');
  }
  await new Promise((r) => backend.close(r));
  await rm(directory, { recursive: true, force: true });
}

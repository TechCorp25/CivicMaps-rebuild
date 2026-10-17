// Direct public TLS checks; run from the approved F06 AWS runtime, without a TLS interception proxy.
import assert from 'node:assert/strict';
import https from 'node:https';
import net from 'node:net';
if (process.env.CIVICMAPS_CLOUD_ACCEPTANCE !== 'F06-synthetic-only')
  throw new Error('Explicit F06 target required');
const alpha = 'alpha-commandmaps.dev.civicmaps.com.au';
function tlsRequest(host, servername = alpha) {
  return new Promise((resolve, reject) => {
    const r = https.get(
      { hostname: alpha, servername, path: '/api/health', headers: { host }, timeout: 10000 },
      (s) => {
        s.resume();
        resolve(s.statusCode);
      },
    );
    r.on('error', reject);
    r.on('timeout', () => r.destroy(new Error('TLS timeout')));
  });
}
assert.equal(await tlsRequest(alpha), 200);
assert.equal(await tlsRequest('beta-commandmaps.dev.civicmaps.com.au'), 421);
assert.equal(await tlsRequest('unknown.dev.civicmaps.com.au'), 421);
assert.equal(await tlsRequest(alpha + ':444'), 421);
await assert.rejects(
  tlsRequest('unknown.dev.civicmaps.com.au', 'unknown.dev.civicmaps.com.au'),
  (e) =>
    /ERR_SSL|ERR_TLS|CERT|ECONNRESET/.test(e.code ?? '') ||
    (e.code === 'EPROTO' && /SSL|TLS/.test(e.message)),
);

await new Promise((resolve, reject) => {
  const socket = net.connect({ host: '13.239.75.155', port: 4100 });
  socket.on('connect', () => {
    socket.destroy();
    reject(new Error('Backend exposed on public address'));
  });
  socket.setTimeout(4000, () => {
    socket.destroy();
    resolve();
  });
  socket.on('error', (e) =>
    ['ECONNREFUSED', 'ETIMEDOUT', 'EHOSTUNREACH'].includes(e.code) ? resolve() : reject(e),
  );
});
console.log(
  'PASS direct trusted public TLS, mismatched SNI/Host, unknown Host/SNI, invalid port authority, public backend-port denial.',
);

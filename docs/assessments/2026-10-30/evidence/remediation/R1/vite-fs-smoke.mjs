import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createServer } from 'vite';
const root = mkdtempSync(join(tmpdir(), 'civicmaps-vite-fs-smoke-'));
const marker = 'R1_SYNTHETIC_DENY_MARKER';
writeFileSync(join(root, 'index.html'), '<h1>Vite smoke</h1><script type="module" src="/src.js"></script>');
writeFileSync(join(root, 'src.js'), 'export const healthy = true;');
writeFileSync(join(root, '.env'), `SMOKE=${marker}\n`);
const server = await createServer({
  configFile: false,
  root,
  server: { host: '127.0.0.1', port: 4178, strictPort: true, fs: { strict: true, allow: [root], deny: ['.env'] } },
});
try {
  await server.listen();
  const origin = 'http://127.0.0.1:4178';
  const page = await fetch(origin);
  const module = await fetch(`${origin}/src.js`);
    const paths = [
    `/@fs${join(root, '.env')}`,
    `/@fs${join(root, '.env')}?import`,
    `/@fs${join(root, '.env')}?raw`,
  ];
  const denied = [];
  for (const path of paths) {
    const response = await fetch(origin + path);
    const body = await response.text();
    denied.push({ path: path.replace(root, '<fixture-root>'), status: response.status, markerLeaked: body.includes(marker) });
  }
  console.log(JSON.stringify({ vite: '6.4.5', ordinaryPage: page.status, ordinaryModule: module.status, denied }, null, 2));
  if (page.status !== 200 || module.status !== 200 || denied.some((item) => item.status !== 403 || item.markerLeaked)) process.exitCode = 1;
} finally {
  await server.close();
  rmSync(root, { recursive: true, force: true });
}

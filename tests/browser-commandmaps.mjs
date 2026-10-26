import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'vite';
import { createTestEnvironment } from './helpers/environment.mjs';

// Keep browser mutations out of the developer's configured database.
let environment, vite;
try {
  environment = await createTestEnvironment();
  vite = await createServer({
    configFile: false,
    esbuild: { jsx: 'automatic' },
    root: new URL('../apps/commandmaps/', import.meta.url).pathname,
    server: {
      host: '127.0.0.1',
      port: 0,
      fs: { allow: [new URL('../', import.meta.url).pathname] },
      proxy: { '/api': environment.origin },
    },
  });
  await vite.listen();
  process.env.CIVICMAPS_COMMANDMAPS_ORIGIN = `http://127.0.0.1:${vite.httpServer.address().port}`;
  process.env.CIVICMAPS_ORIGINS = process.env.CIVICMAPS_COMMANDMAPS_ORIGIN;
  const child = spawn(process.execPath, ['tests/browser.mjs'], {
    stdio: 'inherit',
    env: process.env,
  });
  const [code] = await once(child, 'exit');
  if (code !== 0) throw new Error('CommandMAPS browser acceptance failed');
} finally {
  await vite?.close();
  await environment?.close();
}

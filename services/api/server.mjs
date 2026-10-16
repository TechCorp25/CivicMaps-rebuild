import { resolve } from 'node:path';
import { deployedRouting } from './routing.mjs';
import { createApp } from './app.mjs';
import { pool } from './database.mjs';
const port = Number(process.env.CIVICMAPS_API_PORT ?? 4100);
const app = createApp({ webRoot: deployedRouting() ? resolve('apps') : undefined });
const server = app.listen(port, '127.0.0.1', () =>
  console.log(`CivicMAPS API: http://127.0.0.1:${port}`),
);
function stop() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

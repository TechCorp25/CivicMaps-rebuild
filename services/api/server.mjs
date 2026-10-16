import express from 'express';
import { resolve } from 'node:path';
import { deployedRouting } from './routing.mjs';
import { createApp } from './app.mjs';
import { pool } from './database.mjs';
const port = Number(process.env.CIVICMAPS_API_PORT ?? 4100);
const app = createApp();
if (deployedRouting()) {
  const platform = express.static(resolve('apps/civicmaps-platform/dist'));
  const command = express.static(resolve('apps/commandmaps/dist'));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Route not found' });
    return (req.serviceRoute?.service === 'platform' ? platform : command)(req, res, next);
  });
  app.get('/{*path}', (req, res) =>
    res.sendFile(
      resolve(
        `apps/${req.serviceRoute?.service === 'platform' ? 'civicmaps-platform' : 'commandmaps'}/dist/index.html`,
      ),
    ),
  );
}
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

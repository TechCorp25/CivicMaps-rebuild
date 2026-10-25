import assert from 'node:assert/strict';
import net from 'node:net';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { test } from 'node:test';

test(
  'a PostgreSQL handshake timeout is a bounded retryable response',
  { timeout: 7000 },
  async () => {
    const sockets = new Set();
    const stalledPostgres = net.createServer((socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
    });
    await new Promise((resolve, reject) => {
      stalledPostgres.once('error', reject);
      stalledPostgres.listen(0, '127.0.0.1', resolve);
    });

    const previousDatabaseUrl = process.env.CIVICMAPS_DATABASE_URL;
    process.env.CIVICMAPS_DATABASE_URL = `postgresql://synthetic@127.0.0.1:${stalledPostgres.address().port}/synthetic`;
    let api;
    let pool;
    let maintenancePool;
    try {
      const { createApp } = await import('../services/api/app.mjs');
      ({ pool, maintenancePool } = await import('../services/api/database.mjs'));
      api = createApp().listen(0, '127.0.0.1');
      await once(api, 'listening');

      const started = performance.now();
      const response = await fetch(`http://127.0.0.1:${api.address().port}/api/health`, {
        signal: AbortSignal.timeout(3000),
      });
      const elapsed = performance.now() - started;
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('retry-after'), '1');
      assert.deepEqual(await response.json(), { error: 'The operation could not be completed' });
      assert.ok(elapsed >= 800 && elapsed < 1800, `timeout response took ${elapsed.toFixed(1)}ms`);
    } finally {
      if (api?.listening) {
        api.closeAllConnections();
        await new Promise((resolve, reject) =>
          api.close((error) => (error ? reject(error) : resolve())),
        );
      }
      await pool?.end();
      await maintenancePool?.end();
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve, reject) =>
        stalledPostgres.close((error) => (error ? reject(error) : resolve())),
      );
      if (previousDatabaseUrl === undefined) delete process.env.CIVICMAPS_DATABASE_URL;
      else process.env.CIVICMAPS_DATABASE_URL = previousDatabaseUrl;
    }
  },
);

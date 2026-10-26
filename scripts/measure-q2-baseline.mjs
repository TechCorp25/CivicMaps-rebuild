import { randomBytes, scrypt } from 'node:crypto';
import pg from 'pg';
import { performance } from 'node:perf_hooks';

const connectionString = process.env.CIVICMAPS_DATABASE_URL;
if (!connectionString) throw new Error('Set CIVICMAPS_DATABASE_URL to a synthetic database');

const percentile = (values, fraction) =>
  [...values].sort((left, right) => left - right)[
    Math.min(values.length - 1, Math.ceil(values.length * fraction) - 1)
  ];
const round = (value) => Number(value.toFixed(3));
const pool = new pg.Pool({ connectionString, max: 10 });
const password = 'synthetic-q2-benchmark-password';
const salt = randomBytes(16).toString('hex');
const derive = () =>
  new Promise((resolve, reject) =>
    scrypt(password, salt, 64, (error, result) => (error ? reject(error) : resolve(result))),
  );

const databaseResults = {};
const scryptResults = {};
try {
  await pool.query('SELECT 1');
  for (const concurrency of [1, 3, 5, 10]) {
    const samples = [];
    for (let offset = 0; offset < 50; offset += concurrency) {
      const batchSize = Math.min(concurrency, 50 - offset);
      await Promise.all(
        Array.from({ length: batchSize }, async () => {
          const started = performance.now();
          await pool.query('SELECT count(*)::integer AS rows FROM service_requests');
          samples.push(performance.now() - started);
        }),
      );
    }
    databaseResults[concurrency] = {
      samples: samples.length,
      medianMs: round(percentile(samples, 0.5)),
      p95Ms: round(percentile(samples, 0.95)),
      maxMs: round(Math.max(...samples)),
    };
  }

  for (const concurrency of [1, 2, 4, 8]) {
    const batches = [];
    let peakTimerDelayMs = 0;
    for (let batch = 0; batch < 5; batch++) {
      const started = performance.now();
      const timerStarted = performance.now();
      let timerDelayMs;
      const timer = new Promise((resolve) =>
        setTimeout(() => {
          timerDelayMs = performance.now() - timerStarted;
          resolve();
        }, 0),
      );
      const samples = [];
      await Promise.all(
        Array.from({ length: concurrency }, async () => {
          const operationStarted = performance.now();
          await derive();
          samples.push(performance.now() - operationStarted);
        }),
      );
      await timer;
      peakTimerDelayMs = Math.max(peakTimerDelayMs, timerDelayMs);
      batches.push({
        batchWallMs: round(performance.now() - started),
        operationMedianMs: round(percentile(samples, 0.5)),
        operationP95Ms: round(percentile(samples, 0.95)),
        operationMaxMs: round(Math.max(...samples)),
      });
    }
    scryptResults[concurrency] = {
      batches,
      peakEventLoopTimerDelayMs: round(peakTimerDelayMs),
      maxBatchWallMs: round(Math.max(...batches.map(({ batchWallMs }) => batchWallMs))),
      maxOperationMs: round(Math.max(...batches.map(({ operationMaxMs }) => operationMaxMs))),
    };
  }
} finally {
  await pool.end();
}

console.log(
  JSON.stringify(
    {
      kind: 'synthetic-q2-baseline-workload-measurement',
      date: new Date().toISOString(),
      node: process.version,
      database: 'synthetic only; no writes',
      query: 'SELECT count(*)::integer AS rows FROM service_requests',
      databaseRunsPerConcurrency: 50,
      databasePoolMax: 10,
      scrypt: 'node:crypto default cost, 64-byte output, synthetic password and salt',
      libuvThreadpoolSize: process.env.UV_THREADPOOL_SIZE ?? 'default (4)',
      scryptBatchesPerConcurrency: 5,
      databaseResults,
      scryptResults,
    },
    null,
    2,
  ),
);

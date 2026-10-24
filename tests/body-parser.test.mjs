import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';
import { brotliCompressSync, deflateSync, gzipSync } from 'node:zlib';
import { test } from 'node:test';
import { createTestEnvironment } from './helpers/environment.mjs';

const childServer = `
  import { createApp } from './services/api/app.mjs';
  const server = createApp().listen(0, '127.0.0.1', () => {
    process.stdout.write(JSON.stringify({ port: server.address().port }) + '\\n');
  });
`;

async function startChildServer(env) {
  const child = spawn(process.execPath, ['--input-type=module', '--eval', childServer], {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const lines = createInterface({ input: child.stdout });
  const stderr = [];
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));
  const listening = new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Child server did not start within 5 seconds')),
      5000,
    );
    lines.once('line', (line) => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(line));
      } catch (error) {
        reject(error);
      }
    });
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      reject(
        new Error(
          `Child server exited before listening (code=${code}, signal=${signal}): ${stderr.join('')}`,
        ),
      );
    });
  });
  try {
    const { port } = await listening;
    return { child, origin: `http://127.0.0.1:${port}`, lines, stderr };
  } catch (error) {
    lines.close();
    if (child.exitCode === null) {
      child.kill('SIGKILL');
      await Promise.race([
        once(child, 'exit'),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
    }
    throw error;
  }
}

async function post(origin, body, encoding) {
  return fetch(`${origin}/api/not-a-route`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'content-encoding': encoding },
    body,
    signal: AbortSignal.timeout(3000),
  });
}

test(
  'compressed JSON parsing rejects malformed bodies and keeps the API process healthy',
  {
    timeout: 30000,
  },
  async () => {
    const environment = await createTestEnvironment();
    let child;
    try {
      const started = await startChildServer(process.env);
      child = started.child;
      const encodings = [
        ['gzip', gzipSync],
        ['deflate', deflateSync],
        ['br', brotliCompressSync],
      ];

      for (const [encoding, compress] of encodings) {
        const compressedObject = compress(Buffer.from('{}'));
        const valid = await post(started.origin, compressedObject, encoding);
        assert.equal(valid.status, 404, `${encoding} JSON remains supported`);

        const trailingBytes = await post(
          started.origin,
          Buffer.concat([compressedObject, Buffer.from('trailing bytes')]),
          encoding,
        );
        assert.equal(
          trailingBytes.status,
          encoding === 'gzip' ? 400 : 404,
          `${encoding} trailing bytes have the expected parser response`,
        );

        const malformedJson = await post(started.origin, compress(Buffer.from('{')), encoding);
        assert.equal(malformedJson.status, 400, `${encoding} malformed JSON is rejected`);

        const malformedStream = await post(
          started.origin,
          Buffer.from('not a valid compressed stream'),
          encoding,
        );
        assert.equal(malformedStream.status, 400, `${encoding} malformed stream is rejected`);

        const healthy = await fetch(`${started.origin}/api/health`, {
          signal: AbortSignal.timeout(3000),
        });
        assert.equal(
          healthy.status,
          200,
          `${encoding} malformed and trailing-byte requests leave the process healthy`,
        );
      }

      assert.equal(
        child.exitCode,
        null,
        'child server remains alive after malformed compressed bodies',
      );
    } finally {
      if (child && child.exitCode === null) {
        child.kill('SIGTERM');
        await Promise.race([
          once(child, 'exit'),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);
        if (child.exitCode === null) child.kill('SIGKILL');
      }
      await environment.close();
    }
  },
);

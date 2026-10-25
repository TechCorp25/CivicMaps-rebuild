import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApiError,
  ApiTransportError,
  isRequestCancelled,
  requestJson,
} from '../apps/shared/api-transport.mjs';

async function withFetch(fetchImpl, work) {
  const previous = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    await work();
  } finally {
    globalThis.fetch = previous;
  }
}

test('shared API transport preserves status and safe errors across response and cancellation forms', async () => {
  for (const status of [401, 403, 503]) {
    await withFetch(
      async () => new Response(JSON.stringify({ error: `Status ${status}` }), { status }),
      async () => {
        await assert.rejects(requestJson('/api', '/resource'), (error) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.status, status);
          assert.equal(error.message, `Status ${status}`);
          return true;
        });
      },
    );

    for (const body of ['<html><body>Upstream unavailable</body></html>', '', '{"error":']) {
      await withFetch(
        async () => new Response(body, { status, headers: { 'content-type': 'text/html' } }),
        async () => {
          await assert.rejects(requestJson('/api', '/resource'), (error) => {
            assert.ok(error instanceof ApiError);
            assert.equal(error.status, status);
            assert.equal(error.message, 'The operation could not be completed');
            assert.doesNotMatch(error.message, /Upstream unavailable|SyntaxError|<html/i);
            return true;
          });
        },
      );
    }

    await withFetch(
      async () =>
        new Response(JSON.stringify({ error: '<html>secret upstream body</html>' }), { status }),
      async () => {
        await assert.rejects(requestJson('/api', '/resource'), (error) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.status, status);
          assert.equal(error.message, 'The operation could not be completed');
          return true;
        });
      },
    );
  }

  for (const body of ['<html>broken success response</html>', '', '{"unfinished":'])
    await withFetch(
      async () => new Response(body, { status: 200 }),
      async () => {
        await assert.rejects(requestJson('/api/platform', '/auth/session'), (error) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.status, 200);
          assert.equal(error.kind, 'invalid-response');
          assert.doesNotMatch(error.message, /broken success response|unfinished|<html/i);
          return true;
        });
      },
    );

  await withFetch(
    async (url, options) => {
      assert.equal(url, '/api/platform/auth/session');
      assert.equal(options.headers['Content-Type'], 'application/json');
      return new Response('{"ready":true}', { status: 200 });
    },
    async () => {
      assert.deepEqual(await requestJson('/api/platform', '/auth/session'), { ready: true });
    },
  );

  await withFetch(
    async () => {
      throw new TypeError('private socket details');
    },
    async () => {
      await assert.rejects(requestJson('/api', '/resource'), (error) => {
        assert.ok(error instanceof ApiTransportError);
        assert.equal(error.kind, 'network');
        assert.equal(error.status, null);
        assert.doesNotMatch(error.message, /private socket details/);
        return true;
      });
    },
  );

  const waitForAbort = async (_url, { signal }) =>
    new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
  await withFetch(waitForAbort, async () => {
    await assert.rejects(requestJson('/api', '/slow', {}, 15), (error) => {
      assert.ok(error instanceof ApiTransportError);
      assert.equal(error.kind, 'timeout');
      assert.equal(error.status, null);
      return true;
    });
  });

  await withFetch(
    async (_url, { signal }) => ({
      ok: false,
      status: 503,
      text: () =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }),
    }),
    async () => {
      await assert.rejects(requestJson('/api', '/slow-body', {}, 15), (error) => {
        assert.ok(error instanceof ApiTransportError);
        assert.equal(error.kind, 'timeout');
        assert.equal(error.status, 503);
        return true;
      });
    },
  );

  await withFetch(waitForAbort, async () => {
    const controller = new AbortController();
    const pending = requestJson('/api', '/cancelled', { signal: controller.signal }, 1000);
    controller.abort();
    await assert.rejects(pending, (error) => isRequestCancelled(error));
  });
});

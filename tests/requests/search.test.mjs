import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createTestEnvironment } from '../helpers/environment.mjs';

let environment, pool, origin;
const sessions = {};
async function call(path, input, account = 'dispatch', key = randomUUID()) {
  const session = sessions[account];
  const response = await fetch(`${origin}/api${path}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Cookie: session.cookie, 'x-csrf-token': session.csrfToken } : {}),
      'Idempotency-Key': key,
    },
    body: input === undefined ? undefined : JSON.stringify(input),
  });
  return { status: response.status, data: await response.json(), response };
}
async function create(notes = '', address = 'Synthetic test location') {
  const result = await call('/requests', {
    address,
    latitude: -37.814,
    longitude: 144.963,
    notes,
    destinationContextId: '10000000-0000-4000-8000-000000000001',
    packageData: {
      schemaVersion: 1,
      fields: {
        serviceType: 'parking',
        vehicleColour: 'Unknown',
        allegedOffence: 'Synthetic test report',
      },
    },
  });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  return result.data;
}
before(async () => {
  environment = await createTestEnvironment({ platform: false });
  ({ pool, origin } = environment);
  for (const [account, email] of Object.entries({
    dispatch: 'dispatch@alpha.example',
    officer: 'officer@alpha.example',
    supervisor: 'supervisor@alpha.example',
    beta: 'dispatch@beta.example',
  })) {
    const result = await call(
      '/auth/login',
      { email, password: process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!' },
      'anonymous',
    );
    assert.equal(result.status, 200);
    sessions[account] = {
      ...result.data,
      cookie: result.response.headers.get('set-cookie').split(';')[0],
    };
  }
  for (const account of Object.keys(sessions)) {
    const session = await call('/auth/session', undefined, account);
    assert.equal(session.status, 200, `newly issued ${account} session remains usable`);
  }
});
after(async () => {
  await environment?.close();
});

test('server search is literal, scoped, count-complete and independently selects detail', async () => {
  const request = await create('Search test note', 'Searching %_\\literal location');
  const literal = await call('/requests?status=all&q=%25_');
  assert.equal(literal.status, 200);
  assert.equal(literal.data.requests.length, 1);
  assert.equal(literal.data.requests[0].id, request.id);
  assert.equal(literal.data.counts.total, '1');
  assert.equal(literal.data.counts.active, '1');
  assert.equal((await call('/requests?status=all&q=%')).data.requests.length, 1);
  assert.equal((await call('/requests?status=all&q=%5C')).data.requests[0].id, request.id);
  for (const query of ['', '%20%20']) {
    const emptySearch = await call(`/requests?status=all&q=${query}`);
    assert.equal(emptySearch.status, 200);
    assert.equal(
      emptySearch.data.counts.total,
      (await call('/requests?status=all')).data.counts.total,
    );
    assert.ok(emptySearch.data.requests.some((item) => item.id === request.id));
  }
  assert.equal((await call('/requests?status=all&q=searching')).data.requests[0].id, request.id);
  const number = `SR-${String(request.number).padStart(7, '0')}`;
  const byNumber = await call(`/requests?status=all&q=${number}`);
  assert.equal(byNumber.data.requests[0].id, request.id);
  assert.equal(
    (await call('/requests?status=received&q=searching')).data.requests[0].id,
    request.id,
  );
  assert.equal((await call(`/requests?q=${'x'.repeat(251)}`)).status, 400);

  const detail = await call(`/requests/${request.id}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.data.id, request.id);
  assert.equal((await call(`/requests/${request.id}`, undefined, 'beta')).status, 404);
  assert.equal((await call(`/requests/${request.id}`, undefined, 'officer')).status, 404);
});
test('displayed references retain seven-digit padding and longer bigint numbers', async () => {
  for (const number of ['42', '10000000', '9223372036854775806']) {
    // Advance only this disposable database's identity sequence; exercise normal API creation.
    await pool.query(
      "SELECT setval(pg_get_serial_sequence('service_requests','number'),$1::bigint,false)",
      [number],
    );
    const request = await create('', `Reference width ${number}`);
    const reference = `SR-${number.padStart(7, '0')}`;
    const result = await call(`/requests?status=all&q=${reference.toLowerCase()}`);
    assert.equal(result.status, 200);
    assert.deepEqual(
      result.data.requests.map((item) => item.id),
      [request.id],
    );
    assert.equal(result.data.counts.total, '1');
    assert.equal(result.data.counts.active, '1');
    const page = await call(`/requests?status=all&q=${reference}&before=9223372036854775807`);
    assert.equal(page.status, 200);
    assert.deepEqual(
      page.data.requests.map((item) => item.id),
      [request.id],
    );
    assert.equal(page.data.counts, undefined);
  }
});

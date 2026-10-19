/* global document, innerWidth -- Executed in the browser by page.evaluate. */
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import pg from 'pg';
const browser = await chromium.launch({ headless: true });
const database = new pg.Pool({
  connectionString:
    process.env.CIVICMAPS_DATABASE_URL ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres',
});
const errors = [];
const origin = process.env.CIVICMAPS_COMMANDMAPS_ORIGIN ?? 'http://127.0.0.1:5173';
const password = process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!';
async function login(page, email) {
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(origin);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  const response = page.waitForResponse((r) => r.url().endsWith('/api/auth/login'));
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await response).status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Service requests', exact: true })).toBeVisible();
}
async function save(page, button, expected = 200) {
  const response = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().includes('/api/requests'),
  );
  await page.getByRole('button', { name: button, exact: true }).click();
  const result = await response;
  expect(result.status()).toBe(expected);
  await expect(page.locator('#content > .notice')).toContainText('Saved to the operational record');
  return result.json();
}
async function seedQueueOverflow() {
  const source = (
    await database.query(
      "SELECT capture_binding_id,capture_binding_version FROM service_requests WHERE tenant_id='tenant-alpha' AND branch_id='parking' ORDER BY number DESC LIMIT 1",
    )
  ).rows[0];
  expect(source).toBeTruthy();
  const rows = [
    ...Array.from({ length: 1005 }, (_, i) => ({
      status: 'RECEIVED',
      address: `Queue active ${i}`,
    })),
    ...Array.from({ length: 110 }, (_, i) => ({ status: 'CLOSED', address: `Queue closed ${i}` })),
  ];
  const values = [];
  const tuples = rows.map((row, i) => {
    values.push(
      crypto.randomUUID(),
      'tenant-alpha',
      'jurisdiction-alpha',
      'plane-alpha',
      'organisation-alpha',
      'parking',
      row.address,
      -37.814,
      144.963,
      '',
      row.status,
      null,
      source.capture_binding_id,
      source.capture_binding_version,
    );
    const start = i * 14;
    return `(${Array.from({ length: 14 }, (_, j) => `$${start + j + 1}`).join(',')})`;
  });
  await database.query(
    `INSERT INTO service_requests(id,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,address,latitude,longitude,notes,status,assigned_officer_id,capture_binding_id,capture_binding_version) VALUES ${tuples.join(',')}`,
    values,
  );
}
async function createSyntheticRequest(page, address) {
  const session = await (await page.request.get(`${origin}/api/auth/session`)).json();
  const response = await page.request.post(`${origin}/api/requests`, {
    headers: { 'x-csrf-token': session.csrfToken, 'Idempotency-Key': crypto.randomUUID() },
    data: {
      address,
      latitude: -37.814,
      longitude: 144.963,
      notes: 'Synthetic F11E browser scenario.',
    },
  });
  expect(response.status()).toBe(201);
  return response.json();
}
try {
  const dispatcher = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await dispatcher.newPage();
  await login(page, 'dispatch@alpha.example');
  await page.route('**/api/requests/*/audit', async (route) => {
    const response = await route.fetch();
    const history = await response.json();
    if (history[0]) history[0].details.reason = { legacy: 'malformed historical value' };
    await route.fulfill({ response, json: history });
  });
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const address = `Browser exercise ${Date.now()}`;
  await expect(page.locator('.topbar')).toContainText('DISPATCH');
  await expect(page.locator('.topbar')).not.toContainText('Alex · Dispatch');
  await expect(page.locator('.topbar')).toHaveCSS('background-color', 'rgb(17, 90, 80)');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Location or address').fill(address);
  await page.getByLabel('Latitude', { exact: true }).fill('-37.814');
  await page.getByLabel('Longitude', { exact: true }).fill('144.963');
  await page.getByLabel('Dispatch notes').fill('Synthetic browser verification; no real incident.');
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review service request' })).toBeFocused();
  await expect(page.getByRole('dialog')).toContainText(address);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByLabel('Location or address')).toHaveValue(address);
  await expect(page.getByLabel('Dispatch notes')).toHaveValue(
    'Synthetic browser verification; no real incident.',
  );
  await page.getByRole('button', { name: 'Review request', exact: true }).click();
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/commandmaps-create-review.png', fullPage: true });
  await page.route('**/api/requests', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Synthetic save failure; retry the request' }),
      });
    } else await route.continue();
  });
  await page.getByRole('button', { name: 'Create request', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('Synthetic save failure');
  await expect(page.getByRole('dialog')).toContainText(address);
  await expect(page.getByRole('button', { name: 'Create request', exact: true })).toBeEnabled();
  await page.unroute('**/api/requests');
  const created = await save(page, 'Create request', 201);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New request', exact: true })).toBeFocused();
  await expect(page.locator('.detail')).toContainText(address);
  await expect(page.locator('.detail')).toContainText('Server-confirmed version 1');
  await expect(page.locator('.audit')).toContainText('created');
  await expect(page.locator('.audit')).not.toContainText('malformed historical value');
  await page.unroute('**/api/requests/*/audit');
  expect(
    (await database.query('SELECT notes FROM service_requests WHERE id=$1', [created.id])).rows[0]
      .notes,
  ).toContain('Synthetic browser');

  const historyA = await createSyntheticRequest(page, `F11E history A ${Date.now()}`);
  const historyB = await createSyntheticRequest(page, `F11E history B ${Date.now()}`);
  const dispatchSession = await (await page.request.get(`${origin}/api/auth/session`)).json();
  const historyBAssignment = await page.request.post(
    `${origin}/api/requests/${historyB.id}/actions`,
    {
      headers: {
        'x-csrf-token': dispatchSession.csrfToken,
        'Idempotency-Key': crypto.randomUUID(),
      },
      data: {
        action: 'assign',
        version: 1,
        officerId: '00000000-0000-4000-8000-000000000002',
      },
    },
  );
  expect(historyBAssignment.status()).toBe(200);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  const slowHistory = async (route) => {
    if (route.request().url().includes(`${historyA.id}/audit`))
      await new Promise((resolve) => setTimeout(resolve, 400));
    await route.continue();
  };
  await page.route('**/api/requests/*/audit', slowHistory);
  const delayedRead = page.waitForRequest((request) =>
    request.url().includes(`${historyA.id}/audit`),
  );
  await page.locator(`[data-request-id="${historyA.id}"] .request-link`).click();
  await delayedRead;
  await page.locator(`[data-request-id="${historyB.id}"] .request-link`).click();
  await expect(page.locator('.detail')).toContainText(`F11E history B`);
  await expect(page.locator('.audit')).toContainText('assign');
  await page.waitForTimeout(500);
  await expect(page.locator('.detail')).toContainText(`F11E history B`);
  await expect(page.locator('.audit')).toContainText('assign');
  await page.unroute('**/api/requests/*/audit', slowHistory);

  let failHistoryOnce = true;
  await page.route('**/api/requests/*/audit', async (route) => {
    const url = route.request().url();
    if (url.includes(`${historyA.id}/audit`) && failHistoryOnce) {
      failHistoryOnce = false;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Synthetic audit unavailable' }),
      });
    } else if (url.includes(`${historyB.id}/audit`)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    } else await route.continue();
  });
  await page.locator(`[data-request-id="${historyA.id}"] .request-link`).click();
  await expect(page.locator('.audit')).toContainText('History is unavailable for this request');
  await expect(page.locator('.audit')).toContainText('Synthetic audit unavailable');
  await page.getByRole('button', { name: 'Retry history' }).click();
  await expect(page.locator('.audit')).toContainText('created');
  await page.locator(`[data-request-id="${historyB.id}"] .request-link`).click();
  await expect(page.locator('.audit')).toContainText(
    'No history has been recorded for this request',
  );
  await page.unroute('**/api/requests/*/audit');

  let dismissedHistoryFinished = false;
  await page.route('**/api/requests/*/audit', async (route) => {
    if (route.request().url().includes(`${historyA.id}/audit`))
      await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
    if (route.request().url().includes(`${historyA.id}/audit`)) dismissedHistoryFinished = true;
  });
  const dismissRead = page.waitForRequest((request) =>
    request.url().includes(`${historyA.id}/audit`),
  );
  await page.locator(`[data-request-id="${historyA.id}"] .request-link`).click();
  await dismissRead;
  await page.getByRole('button', { name: 'Dismiss request detail' }).click();
  await expect(page.getByRole('heading', { name: 'Select a request' })).toBeVisible();
  await page.waitForTimeout(450);
  expect(dismissedHistoryFinished).toBe(true);
  await expect(page.getByRole('heading', { name: 'Select a request' })).toBeVisible();
  await expect(page.locator('.audit')).toHaveCount(0);
  await page.unroute('**/api/requests/*/audit');

  await page.route('**/api/requests/*/audit', async (route) => {
    if (route.request().url().includes(`${historyA.id}/audit`))
      await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });
  const sessionLossRead = page.waitForRequest((request) =>
    request.url().includes(`${historyA.id}/audit`),
  );
  await page.locator(`[data-request-id="${historyA.id}"] .request-link`).click();
  await sessionLossRead;
  const activeSession = await (await page.request.get(`${origin}/api/auth/session`)).json();
  const revoked = await page.request.post(`${origin}/api/auth/logout`, {
    headers: { 'x-csrf-token': activeSession.csrfToken },
    data: {},
  });
  expect(revoked.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Sign in to operations' })).toBeVisible({
    timeout: 5000,
  });
  await expect(page.locator('.detail')).toHaveCount(0);
  await page.unroute('**/api/requests/*/audit');
  await login(page, 'dispatch@alpha.example');

  const secondOfficerId = '00000000-0000-4000-8000-000000000007';
  await database.query(
    `INSERT INTO users(id,email,name,password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id)
     SELECT $1,'synthetic-second-officer@alpha.example','Synthetic second officer',password_hash,role,tenant_id,jurisdiction_id,data_plane_id,organisation_id,branch_id,team_id
     FROM users WHERE id='00000000-0000-4000-8000-000000000002'`,
    [secondOfficerId],
  );
  await database.query(
    "INSERT INTO operating_context_grants(user_id,binding_id,effective_from) VALUES ($1,'10000000-0000-4000-8000-000000000001','2020-01-01')",
    [secondOfficerId],
  );
  const staleAssignment = await createSyntheticRequest(page, `F11E stale assignment ${Date.now()}`);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.locator(`[data-request-id="${staleAssignment.id}"] .request-link`).click();
  const staleSession = await (await page.request.get(`${origin}/api/auth/session`)).json();
  const concurrentAssignment = async (version, officerId) =>
    page.request.post(`${origin}/api/requests/${staleAssignment.id}/actions`, {
      headers: {
        'x-csrf-token': staleSession.csrfToken,
        'Idempotency-Key': crypto.randomUUID(),
      },
      data: { action: 'assign', version, officerId },
    });
  expect((await concurrentAssignment(1, secondOfficerId)).status()).toBe(200);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.detail')).toContainText('Server-confirmed version 2');
  const assignmentControl = page.getByRole('combobox', { name: /^Assign officer/ });
  await expect(assignmentControl).toHaveValue(secondOfficerId);
  await assignmentControl.selectOption('00000000-0000-4000-8000-000000000002');
  expect((await concurrentAssignment(2, secondOfficerId)).status()).toBe(200);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.detail')).toContainText('Server-confirmed version 3');
  await expect(assignmentControl).toHaveValue('00000000-0000-4000-8000-000000000002');

  const uncertain = await createSyntheticRequest(page, `F11E uncertain ${Date.now()}`);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  const uncertainRead = page.waitForRequest((request) =>
    request.url().includes(`${uncertain.id}/audit`),
  );
  await page.locator(`[data-request-id="${uncertain.id}"] .request-link`).click();
  await uncertainRead;
  await page
    .getByRole('combobox', { name: /^Assign officer/ })
    .selectOption('00000000-0000-4000-8000-000000000002');
  let uncertainWriteCount = 0;
  const uncertainWrite = async (route) => {
    uncertainWriteCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fetch();
    await route.abort('failed');
  };
  await page.route(`**/api/requests/${uncertain.id}/actions`, uncertainWrite);
  await page.getByRole('button', { name: 'Assign request' }).click();
  await expect(page.getByRole('button', { name: 'Assign request' })).toBeDisabled();
  await expect(page.locator('.detail')).toContainText(
    'did not confirm whether this action completed',
  );
  expect(uncertainWriteCount).toBe(1);
  await page.getByRole('button', { name: 'Check server state and history' }).click();
  await expect(page.locator('.detail')).toContainText('Server-confirmed version 2');
  await expect(page.locator('.audit')).toContainText('assign');
  await expect(page.getByRole('button', { name: 'Retry the same action' })).toHaveCount(0);
  expect(uncertainWriteCount).toBe(1);
  await page.unroute(`**/api/requests/${uncertain.id}/actions`, uncertainWrite);

  const independent = await browser.newPage();
  await login(independent, 'dispatch@alpha.example');
  const independentSession = await (
    await independent.request.get(`${origin}/api/auth/session`)
  ).json();
  const concurrentUpdate = await independent.request.post(
    `${origin}/api/requests/${uncertain.id}/actions`,
    {
      headers: {
        'x-csrf-token': independentSession.csrfToken,
        'Idempotency-Key': crypto.randomUUID(),
      },
      data: {
        action: 'assign',
        version: 2,
        officerId: '00000000-0000-4000-8000-000000000002',
      },
    },
  );
  expect(concurrentUpdate.status()).toBe(200);
  await page.getByLabel('Closure reason').fill('Retain this draft across a version conflict');
  await page.getByRole('button', { name: 'Close request', exact: true }).click();
  await expect(page.locator('.detail')).toContainText(
    'request changed before this action was accepted',
  );
  await expect(page.getByLabel('Closure reason')).toHaveValue(
    'Retain this draft across a version conflict',
  );
  await expect(page.locator('.detail')).toContainText('Server-confirmed version 3');
  await independent.close();

  const recoverA = await createSyntheticRequest(page, `F11E recover A ${Date.now()}`);
  const recoverB = await createSyntheticRequest(page, `F11E recover B ${Date.now()}`);
  const recoverySession = await (await page.request.get(`${origin}/api/auth/session`)).json();
  const seedRecoveryB = await page.request.post(`${origin}/api/requests/${recoverB.id}/actions`, {
    headers: {
      'x-csrf-token': recoverySession.csrfToken,
      'Idempotency-Key': crypto.randomUUID(),
    },
    data: { action: 'assign', version: 1, officerId: '00000000-0000-4000-8000-000000000002' },
  });
  expect(seedRecoveryB.status()).toBe(200);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.locator(`[data-request-id="${recoverA.id}"] .request-link`).click();
  await page
    .getByRole('combobox', { name: /^Assign officer/ })
    .selectOption('00000000-0000-4000-8000-000000000002');
  const originalRetryKeys = [];
  const uncertainBeforeCommit = async (route) => {
    originalRetryKeys.push(route.request().headers()['idempotency-key']);
    await route.abort('failed');
  };
  await page.route(`**/api/requests/${recoverA.id}/actions`, uncertainBeforeCommit);
  await page.getByRole('button', { name: 'Assign request' }).click();
  await expect(page.locator('.detail')).toContainText(
    'did not confirm whether this action completed',
  );
  await page.unroute(`**/api/requests/${recoverA.id}/actions`, uncertainBeforeCommit);

  let reconciliationHistoryFinished = false;
  const delayRecoveryHistory = async (route) => {
    if (route.request().url().includes(`${recoverA.id}/audit`))
      await new Promise((resolve) => setTimeout(resolve, 450));
    await route.continue();
    if (route.request().url().includes(`${recoverA.id}/audit`))
      reconciliationHistoryFinished = true;
  };
  await page.route('**/api/requests/*/audit', delayRecoveryHistory);
  const reconciliationRead = page.waitForRequest((request) =>
    request.url().includes(`${recoverA.id}/audit`),
  );
  await page.getByRole('button', { name: 'Check server state and history' }).click();
  await reconciliationRead;
  await page.locator(`[data-request-id="${recoverB.id}"] .request-link`).click();
  await expect(page.locator('.detail')).toContainText(`F11E recover B`);
  await expect(page.locator('.audit')).toContainText('assign');
  await expect.poll(() => reconciliationHistoryFinished).toBe(true);
  await expect(page.locator('.audit')).toContainText('assign');
  await page.unroute('**/api/requests/*/audit', delayRecoveryHistory);

  const successfulB = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/api/requests/${recoverB.id}/actions`),
  );
  await page.getByRole('button', { name: 'Assign request' }).click();
  expect((await successfulB).status()).toBe(200);
  await page.locator(`[data-request-id="${recoverA.id}"] .request-link`).click();
  await expect(page.getByRole('button', { name: 'Retry the same action' })).toBeVisible();
  let replayedRetryKey;
  const deliberateRetry = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().includes(`/api/requests/${recoverA.id}/actions`),
  );
  const retryResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/api/requests/${recoverA.id}/actions`),
  );
  await page.getByRole('button', { name: 'Retry the same action' }).click();
  replayedRetryKey = (await deliberateRetry).headers()['idempotency-key'];
  expect((await retryResponse).status()).toBe(200);
  expect(originalRetryKeys).toHaveLength(1);
  expect(replayedRetryKey).toBe(originalRetryKeys[0]);
  await expect(page.locator('.detail')).toContainText('Server-confirmed version 2');
  expect(
    (
      await database.query(
        "SELECT count(*)::int AS count FROM audit_events WHERE request_id=$1 AND action='assign'",
        [recoverA.id],
      )
    ).rows[0].count,
  ).toBe(1);

  await mkdir('docs/plans/evidence/F11E', { recursive: true });
  await page.screenshot({ path: 'docs/plans/evidence/F11E/desktop-detail.png', fullPage: true });
  await page.getByRole('button', { name: 'Dismiss request detail' }).click();
  await expect(page.locator(`[data-request-id="${recoverA.id}"] .request-link`)).toBeFocused();
  await page.locator(`[data-request-id="${created.id}"] .request-link`).click();
  await page
    .getByRole('combobox', { name: /^Assign officer/ })
    .selectOption('00000000-0000-4000-8000-000000000002');
  await save(page, 'Assign request');
  await expect(page.locator('.detail .status')).toHaveText('Dispatched · Not Active');
  await page.getByLabel('Search loaded requests').fill('no-such-request-unique');
  await expect(page.getByRole('heading', { name: 'No matching requests' })).toBeVisible();
  await page.getByLabel('Search loaded requests').fill(address);
  await expect(page.locator('.request-table tbody tr')).toHaveCount(1);
  await page.getByLabel('Search loaded requests').fill('');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/commandmaps-desktop.png', fullPage: true });
  await page.reload();
  await page.getByRole('button').filter({ hasText: address }).click();
  await expect(page.locator('.detail .status')).toHaveText('Dispatched · Not Active');

  const fieldContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const field = await fieldContext.newPage();
  await login(field, 'officer@alpha.example');
  await expect(field.getByRole('button', { name: 'New request', exact: true })).toHaveCount(0);
  await field.getByRole('button').filter({ hasText: address }).click();
  await save(field, 'Acknowledge request');
  await expect(field.locator('.detail .status')).toHaveText('Dispatched · Active');
  await save(field, 'Record attendance');
  await expect(field.locator('.detail .status')).toHaveText('Attended');
  expect(await field.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await field.screenshot({ path: 'test-results/commandmaps-narrow-officer.png', fullPage: true });
  await field.screenshot({ path: 'docs/plans/evidence/F11E/narrow-officer.png', fullPage: true });

  const betaContext = await browser.newContext();
  const beta = await betaContext.newPage();
  await login(beta, 'dispatch@beta.example');
  await expect(beta.getByRole('button').filter({ hasText: address })).toHaveCount(0);
  const denied = await beta.request.get(`${origin}/api/requests/${created.id}/audit`);
  expect(denied.status()).toBe(404);

  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.detail .status')).toHaveText('Attended');
  await page.getByLabel('Closure reason').fill('Browser exercise completed');
  await save(page, 'Close request');
  await expect(page.locator('.detail .status')).toHaveText('Closed');
  const persisted = await database.query(
    'SELECT status,version FROM service_requests WHERE id=$1',
    [created.id],
  );
  expect(persisted.rows[0]).toEqual({ status: 'CLOSED', version: 5 });
  expect(
    (
      await database.query('SELECT action FROM audit_events WHERE request_id=$1 ORDER BY id', [
        created.id,
      ])
    ).rows.map((row) => row.action),
  ).toEqual(['created', 'assign', 'acknowledge', 'attend', 'close']);
  const session = await (await page.request.get(`${origin}/api/auth/session`)).json();
  for (let index = 0; index < 27; index++) {
    const response = await page.request.post(`${origin}/api/requests`, {
      headers: { 'x-csrf-token': session.csrfToken, 'Idempotency-Key': crypto.randomUUID() },
      data: {
        address: `Pagination check ${String(index).padStart(2, '0')}`,
        latitude: -37.814,
        longitude: 144.963,
        notes: 'Disposable pagination fixture',
      },
    });
    expect(response.status()).toBe(201);
  }
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await page.getByLabel('Search loaded requests').fill('Pagination check');
  await expect(page.locator('.request-table tbody tr')).toHaveCount(25);
  await page.getByRole('button', { name: 'Next queue page' }).click();
  await expect(page.locator('.request-table tbody tr')).toHaveCount(2);
  await expect(page.getByRole('navigation', { name: 'Queue pages' })).toContainText('Page 2 of 2');
  await page
    .getByRole('button', { name: 'Open', exact: false })
    .filter({ hasText: 'Open' })
    .first()
    .click();
  await expect(page.getByRole('navigation', { name: 'Queue pages' })).toContainText('Page 1 of 2');
  await page.getByLabel('Search loaded requests').fill('');
  await seedQueueOverflow();
  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('active');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.queue-pagination .muted')).toContainText(
    /Page 1 of [4-9][0-9] · [1-9][0-9]{3,} matching loaded records/,
  );
  await page.getByLabel('Search loaded requests').fill('Queue active 1004');
  await expect(page.locator('.request-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.request-table tbody')).toContainText('Queue active 1004');
  await page.getByLabel('Search loaded requests').fill('');
  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('all');
  await page.getByLabel('Search loaded requests').fill('Queue closed 109');
  await expect(page.locator('.request-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.request-table tbody')).toContainText('Queue closed 109');
  await page.getByLabel('Search loaded requests').fill('');
  await database.query(
    "UPDATE platform_municipalities SET packs=packs-'parking-services' WHERE id='20000000-0000-4000-8000-000000000001'",
  );
  // An already-open client refreshes its server capabilities without a page reload.
  await expect(
    page.getByRole('status').filter({ hasText: 'This branch pack is disabled' }),
  ).toContainText('This branch pack is disabled', {
    timeout: 15000,
  });
  await expect(page.getByRole('button', { name: 'New request', exact: true })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('all');
  await page.getByLabel('Search loaded requests').fill(address);
  await page.getByRole('button').filter({ hasText: address }).click();
  await expect(page.locator('.detail')).toContainText(address);
  await expect(page.getByLabel('Closure reason')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/commandmaps-disabled-review.png', fullPage: true });
  await database.query(
    "UPDATE platform_municipalities SET packs=packs||'[\"parking-services\"]'::jsonb WHERE id='20000000-0000-4000-8000-000000000001'",
  );
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('button', { name: 'New request', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  await page.getByLabel('Location or address').fill('Discard this unsaved draft');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New request', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to operations' })).toBeVisible();
  expect((await page.request.get(`${origin}/api/requests`)).status()).toBe(401);
  expect(errors).toEqual([]);
  console.log(
    'PASS: Chromium create → assign → reload → officer acknowledge → attend → close; database, audit, cross-scope denial, logout and narrow layout verified.',
  );
} finally {
  await browser.close();
  await database.end();
}

/* global document, innerWidth -- Executed in the browser by page.evaluate. */
import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
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
  await expect(page.getByRole('status')).toContainText('Saved to the operational record');
  return result.json();
}
async function seedQueueOverflow() {
  const source = (
    await database.query(
      `SELECT capture_binding_id,capture_binding_version FROM service_requests
       WHERE tenant_id='tenant-alpha' AND branch_id='parking' ORDER BY number DESC LIMIT 1`,
    )
  ).rows[0];
  expect(source).toBeTruthy();
  const rows = [
    ...Array.from({ length: 105 }, (_, i) => ({
      status: 'RECEIVED',
      address: `Queue active ${i}`,
    })),
    ...Array.from({ length: 110 }, (_, i) => ({ status: 'CLOSED', address: `Queue closed ${i}` })),
  ];
  const values = [];
  const tuples = rows.map((row, i) => {
    values.push(
      randomUUID(),
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
try {
  const dispatcher = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await dispatcher.newPage();
  await login(page, 'dispatch@alpha.example');
  await page.route('**/api/requests/*/audit', async (route) => {
    const response = await route.fetch();
    const history = await response.json();
    history[0].details.reason = { legacy: 'malformed historical value' };
    await route.fulfill({ response, json: history });
  });
  await page.getByRole('button', { name: 'New request', exact: true }).click();
  const address = `Browser exercise ${Date.now()}`;
  await page.getByLabel('Location or address').fill(address);
  await page.getByLabel('Dispatch notes').fill('Synthetic browser verification; no real incident.');
  const legacyAudit = page.waitForResponse((response) => response.url().includes('/audit'));
  const created = await save(page, 'Create request', 201);
  await legacyAudit;
  await expect(page.locator('.detail')).toContainText(address);
  await expect(page.locator('.detail .audit')).not.toContainText('malformed historical value');
  await page.unroute('**/api/requests/*/audit');
  expect(
    (await database.query('SELECT notes FROM service_requests WHERE id=$1', [created.id])).rows[0]
      .notes,
  ).toContain('Synthetic browser');
  await page
    .getByRole('combobox', { name: /^Assign officer/ })
    .selectOption('00000000-0000-4000-8000-000000000002');
  await save(page, 'Assign request');
  await expect(page.locator('.detail .status')).toHaveText('Dispatched (not active)');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/commandmaps-desktop.png', fullPage: true });
  await page.reload();
  await page.getByRole('button').filter({ hasText: address }).click();
  await expect(page.locator('.detail .status')).toHaveText('Dispatched (not active)');
  const fieldContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const field = await fieldContext.newPage();
  await login(field, 'officer@alpha.example');
  await expect(field.getByRole('button', { name: 'New request', exact: true })).toHaveCount(0);
  await field.getByRole('button').filter({ hasText: address }).click();
  await save(field, 'Acknowledge request');
  await expect(field.locator('.detail .status')).toHaveText('Dispatched (active)');
  await save(field, 'Record attendance');
  await expect(field.locator('.detail .status')).toHaveText('Attended');
  expect(await field.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await field.screenshot({ path: 'test-results/commandmaps-narrow-officer.png', fullPage: true });

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
  await page.getByRole('button').filter({ hasText: address }).click();
  await expect(page.locator('.detail')).toContainText(address);
  await expect(page.getByLabel('Closure reason')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/commandmaps-disabled-review.png', fullPage: true });
  await database.query(
    "UPDATE platform_municipalities SET packs=packs||'[\"parking-services\"]'::jsonb WHERE id='20000000-0000-4000-8000-000000000001'",
  );
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('button', { name: 'New request', exact: true })).toBeVisible();
  await seedQueueOverflow();
  const activeQueue = page.waitForResponse((response) =>
    response.url().includes('/api/requests?status=active'),
  );
  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('active');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await activeQueue;
  await expect(page.locator('.request-list li')).toHaveCount(100);
  const activeCount = Number(
    await page.locator('.stats section').first().locator('strong').innerText(),
  );
  expect(activeCount).toBeGreaterThanOrEqual(105);
  await page.getByRole('button', { name: 'Load older requests', exact: true }).click();
  await expect(page.locator('.request-list li')).toHaveCount(105);
  await expect(
    page.locator('.request-list').getByText('Queue active 0', { exact: true }),
  ).toBeVisible();
  const allQueue = page.waitForResponse((response) =>
    response.url().includes('/api/requests?status=all'),
  );
  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('all');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await allQueue;
  await expect(page.locator('.request-list li')).toHaveCount(100);
  await expect(
    page.getByRole('button', { name: 'Load older requests', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to operations' })).toBeVisible();
  expect((await page.request.get(`${origin}/api/requests`)).status()).toBe(401);
  expect(errors).toEqual([]);
  console.log(
    'PASS: Chromium dispatch lifecycle, queue overflow filtering/pagination, complete counts, database/audit scope, logout and narrow layout verified.',
  );
} finally {
  await browser.close();
  await database.end();
}

import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import pg from 'pg';

const name = `civicmaps_browser_${randomUUID().replaceAll('-', '')}`;
const base =
  process.env.CIVICMAPS_DATABASE_URL ?? 'postgresql://civicmaps_local@127.0.0.1:55432/postgres';
const connection = new URL(base);
connection.pathname = `/${name}`;
const admin = new pg.Pool({ connectionString: base });
let browser, vite, apiServer, pool;
const errors = [];
try {
  await admin.query(`CREATE DATABASE ${name}`);
  process.env.CIVICMAPS_DATABASE_URL = connection.href;
  for (const script of ['migrate', 'seed', 'seed-platform']) {
    const result = spawnSync(process.execPath, [`services/api/${script}.mjs`], {
      env: process.env,
      encoding: 'utf8',
    });
    expect(result.status, result.stderr).toBe(0);
  }
  ({ pool } = await import('../services/api/database.mjs'));
  const { createApp } = await import('../services/api/app.mjs');
  apiServer = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => apiServer.once('listening', resolve));
  vite = await createServer({
    configFile: false,
    root: new URL('../apps/civicmaps-platform/', import.meta.url).pathname,
    server: {
      host: '127.0.0.1',
      port: 0,
      fs: { allow: [new URL('../', import.meta.url).pathname] },
      proxy: { '/api': `http://127.0.0.1:${apiServer.address().port}` },
    },
  });
  await vite.listen();
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  process.env.CIVICMAPS_ORIGINS = origin;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(origin);
  await page.getByLabel('Platform operator email').fill('operator@platform.example');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('incorrect');
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.CIVICMAPS_DEMO_PASSWORD ?? 'CivicMAPS-local-2026!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Municipalities', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Add municipality', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Council name', { exact: true })).toBeFocused();
  const suffix = randomUUID().replaceAll('-', '');
  const councilName = `Synthetic browser council ${suffix}`;
  await page.getByLabel('Council name', { exact: true }).fill(councilName);
  await page.getByLabel('Subdomain slug').fill('platform');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await page.getByLabel('Subdomain slug').fill(`browser-${suffix}`);
  await expect(page.locator('#slug-status')).toHaveText('Subdomain is available');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Select at least one domain pack.');
  await page.getByLabel('Local Laws', { exact: true }).check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('First name')).toBeFocused();
  await page.getByLabel('First name').fill('Synthetic');
  await page.getByLabel('Last name').fill('Admin');
  await page.getByLabel('Admin email').fill(`${suffix}@synthetic.example`);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const registering = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().endsWith('/api/platform/municipalities'),
  );
  await page.getByRole('button', { name: 'Register municipality', exact: true }).click();
  const response = await registering;
  expect(response.status()).toBe(201);
  const result = await response.json();
  await expect(page.getByRole('heading', { name: councilName, exact: true })).toBeVisible();
  await expect(page.locator('.credential code')).toHaveCount(1);
  await page.getByRole('button', { name: 'View municipality', exact: true }).click();
  await expect(page.locator('.credential')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: councilName, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: councilName, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Manage packs', exact: true }).click();
  const pack = page.getByRole('switch', { name: 'Local Laws', exact: true });
  await expect(pack).toBeEnabled();
  await pack.focus();
  await page.keyboard.press('Space');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(pack).toHaveAttribute('aria-checked', 'true');
  await pack.click();
  await dialog.getByRole('button', { name: 'Turn off pack', exact: true }).click();
  await expect(pack).toHaveAttribute('aria-checked', 'false');
  await pack.click();
  await expect(pack).toHaveAttribute('aria-checked', 'true');
  const record = await pool.query(
    'SELECT packs,version,status FROM platform_municipalities WHERE id=$1',
    [result.municipality.id],
  );
  expect(record.rows[0]).toEqual({ packs: ['Local Laws'], version: 3, status: 'Provisioning' });
  expect(
    (
      await pool.query('SELECT action FROM platform_audit WHERE municipality_id=$1 ORDER BY id', [
        result.municipality.id,
      ])
    ).rows.map((r) => r.action),
  ).toEqual(['onboarding_registered', 'pack_disabled', 'pack_enabled']);
  await page.goto(`${origin}/#municipalities`);
  await page.getByLabel('Search council name or slug').fill(councilName);
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByLabel('Status', { exact: true }).selectOption('Active');
  await expect(page.getByRole('heading', { name: 'No matching municipalities' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.route('**/api/platform/municipalities', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Synthetic unavailable response' }),
    }),
  );
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Synthetic unavailable response');
  await page.unroute('**/api/platform/municipalities');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('link', { name: 'Network health', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Network health', exact: true })).toBeVisible();
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/platform-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Network health', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/platform-narrow.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/platform-narrow.png', fullPage: true });
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to Platform' })).toBeVisible();
  expect((await page.request.get(`${origin}/api/platform/municipalities`)).status()).toBe(401);
  expect(errors).toEqual([]);
  console.log(
    'PASS: platform sign-in errors, keyboard wizard, registration, session reload, pack confirmation/cancel, audit, filters, unavailable recovery, health, narrow layout and logout.',
  );
} finally {
  if (browser) await browser.close();
  if (vite) await vite.close();
  if (apiServer) await new Promise((resolve) => apiServer.close(resolve));
  if (pool) await pool.end();
  await admin.query(`DROP DATABASE IF EXISTS ${name}`);
  await admin.end();
}

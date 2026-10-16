import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
if (process.env.CIVICMAPS_CLOUD_ACCEPTANCE !== 'F06-synthetic-only')
  throw new Error('Explicit F06 browser target required');
const password = process.env.F06_BROWSER_PASSWORD;
if (!password || password === 'CivicMAPS-local-2026!')
  throw new Error('Private acceptance credential required');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const alpha = await context.newPage();
  await alpha.goto('https://alpha-commandmaps.dev.civicmaps.com.au');
  await alpha.getByLabel('Email', { exact: true }).fill('dispatch@alpha.example');
  await alpha.getByLabel('Password', { exact: true }).fill(password);
  await alpha.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(alpha.locator('.scope')).toContainText('tenant-alpha');
  expect(
    (
      await context.request.get(
        'https://alpha-commandmaps.dev.civicmaps.com.au/api/resources/status',
      )
    ).status(),
  ).toBe(200);
  const cookies = await context.cookies('https://alpha-commandmaps.dev.civicmaps.com.au');
  const session = cookies.find((c) => c.name === 'civicmaps_session');
  expect(session.secure).toBe(true);
  expect(session.httpOnly).toBe(true);
  expect(session.domain).toBe('alpha-commandmaps.dev.civicmaps.com.au');
  const beta = await context.newPage();
  await beta.goto('https://beta-commandmaps.dev.civicmaps.com.au');
  await expect(beta.getByRole('heading', { name: 'Sign in to operations' })).toBeVisible();
  await beta.getByLabel('Email', { exact: true }).fill('dispatch@alpha.example');
  await beta.getByLabel('Password', { exact: true }).fill(password);
  await beta.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(beta.getByRole('alert')).toContainText('not permitted');
  await beta.getByLabel('Email', { exact: true }).fill('dispatch@beta.example');
  await beta.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(beta.locator('.scope')).toContainText('tenant-beta');
  await alpha.reload();
  await expect(alpha.locator('.scope')).toContainText('tenant-alpha');
  const platform = await context.newPage();
  await platform.goto('https://platform.dev.civicmaps.com.au');
  await platform.getByLabel('Platform operator email').fill('operator@platform.example');
  await platform.getByLabel('Password', { exact: true }).fill(password);
  await platform.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    platform.getByRole('heading', { name: 'Municipalities', exact: true }),
  ).toBeVisible();
  await platform.goto(
    'https://platform.dev.civicmaps.com.au/#municipalities/20000000-0000-4000-8000-000000000001',
  );
  const routing = platform
    .locator('section')
    .filter({ has: platform.getByRole('heading', { name: 'Service routing', exact: true }) });
  await expect(routing).toContainText('alpha-commandmaps.dev.civicmaps.com.au');
  await expect(routing.getByRole('status')).toContainText('ready');
  await mkdir('test-results', { recursive: true });
  await alpha.screenshot({ path: 'test-results/f06-live-alpha.png', fullPage: true });
  await beta.screenshot({ path: 'test-results/f06-live-beta.png', fullPage: true });
  await platform.screenshot({ path: 'test-results/f06-live-platform.png', fullPage: true });
  console.log(
    'PASS public trusted TLS/browser login, Alpha/Beta cookie scope, cross-council credential denial, independent sessions and platform routing status.',
  );
} finally {
  await browser.close();
}

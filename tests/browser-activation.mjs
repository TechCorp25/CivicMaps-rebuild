/* global window */
import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createTestEnvironment } from './helpers/environment.mjs';
import { hashPassword } from '../services/api/passwords.mjs';

let environment, platform, command, browser;
const errors = [];
const municipality = '20000000-0000-4000-8000-000000000001';
const binding = '10000000-0000-4000-8000-000000000001';
try {
  environment = await createTestEnvironment({ platform: true });
  const run = spawnSync(process.execPath, ['scripts/configure-development-routes.mjs'], {
    env: { ...process.env, CIVICMAPS_CONFIGURE_ROUTES: 'F06-synthetic-only' },
    encoding: 'utf8',
  });
  expect(run.status, run.stderr).toBe(0);
  await environment.pool.query(
    'INSERT INTO platform_first_admins(municipality_id,first_name,last_name,email,password_hash) VALUES($1,$2,$3,$4,$5)',
    [
      municipality,
      'Synthetic',
      'Administrator',
      'browser-admin@alpha.synthetic.example',
      await hashPassword('unused-registration-secret'),
    ],
  );
  const server = async (app, port) => {
    const vite = await createServer({
      configFile: false,
      root: new URL(`../apps/${app}/`, import.meta.url).pathname,
      server: {
        host: '127.0.0.1',
        port,
        strictPort: false,
        fs: { allow: [new URL('../', import.meta.url).pathname] },
        proxy: { '/api': environment.origin },
      },
    });
    await vite.listen();
    return vite;
  };
  platform = await server('civicmaps-platform', 0);
  command = await server('commandmaps', 0);
  const commandOrigin = `http://127.0.0.1:${command.httpServer.address().port}`;
  process.env.CIVICMAPS_ACTIVATION_ORIGIN = commandOrigin;
  const platformOrigin = `http://127.0.0.1:${platform.httpServer.address().port}`;
  process.env.CIVICMAPS_ORIGINS = platformOrigin + ',' + commandOrigin;
  browser = await chromium.launch({ headless: true });
  const operator = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await operator.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(platformOrigin);
  await page.getByLabel('Platform operator email').fill('operator@platform.example');
  await page.getByLabel('Password', { exact: true }).fill('CivicMAPS-local-2026!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Municipalities', exact: true })).toBeVisible();
  await page.goto(`${platformOrigin}/#municipalities/${municipality}`);
  const card = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'First administrator activation', exact: true }),
  });
  await expect(card.getByText('Administrator: Pending', { exact: true })).toBeVisible();
  await card.getByLabel('Activation context', { exact: true }).selectOption(binding);
  await card.getByLabel('Verified recipient email').fill('browser-admin@alpha.synthetic.example');
  await card.getByLabel('I verified the intended recipient').check();
  const issue = async () => {
    await card.getByLabel('I verified the intended recipient').check();
    const pending = page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        r.url().endsWith(`/municipalities/${municipality}/activation`),
    );
    await card.getByRole('button', { name: 'Issue or reissue activation link' }).click();
    const response = await pending;
    const outcome = await response.json();
    expect(response.status(), outcome.error ?? 'Activation issue request').toBe(200);
    await expect(card.getByLabel('Activation link', { exact: true })).toBeVisible();
    return card.getByLabel('Activation link', { exact: true }).inputValue();
  };
  const expired = await issue();
  await environment.pool.query(
    "UPDATE council_admin_activations SET issued_at=clock_timestamp()-interval '2 days',expires_at=clock_timestamp()-interval '1 day' WHERE municipality_id=$1",
    [municipality],
  );
  await card.getByRole('button', { name: 'Refresh activation status' }).click();
  await expect(card.getByText(/Link: Expired/)).toBeVisible();
  const council = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const activation = await council.newPage();
  activation.on('pageerror', (error) => errors.push(error.message));
  async function enter(url) {
    await activation.goto(url);
    await expect(
      activation.getByRole('heading', { name: 'Activate your administrator profile' }),
    ).toBeVisible();
    expect(new URL(activation.url()).hash).toBe('#activation');
    await activation
      .getByLabel('New password', { exact: true })
      .fill('Synthetic-browser-admin-2026!');
    await activation
      .getByLabel('Confirm password', { exact: true })
      .fill('Synthetic-browser-admin-2026!');
    await activation.getByRole('button', { name: 'Activate administrator', exact: true }).click();
  }
  await enter(expired);
  await expect(activation.getByRole('alert')).toContainText('expired');
  const used = await issue();
  await enter(used);
  await expect(
    activation.getByRole('heading', { name: 'Activation complete', exact: true }),
  ).toBeVisible();
  // Redeeming on a fresh page models a copied/replayed bearer link.
  await activation.goto(commandOrigin + '/');
  await enter(used);
  await expect(activation.getByRole('alert')).toContainText('used, revoked or unavailable');
  await activation.getByRole('link', { name: 'Return to sign in' }).click();
  await activation
    .getByLabel('Email', { exact: true })
    .fill('browser-admin@alpha.synthetic.example');
  await activation.getByLabel('Password', { exact: true }).fill('Synthetic-browser-admin-2026!');
  await activation.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    activation.getByRole('heading', { name: 'Administrator profile', exact: true }),
  ).toBeVisible();
  await activation.reload();
  await expect(
    activation.getByRole('heading', { name: 'Administrator profile', exact: true }),
  ).toBeVisible();
  expect((await council.request.get(commandOrigin + '/api/requests')).status()).toBe(403);
  expect((await council.request.get(commandOrigin + '/api/officers')).status()).toBe(403);
  expect((await council.request.get(commandOrigin + '/api/platform/auth/session')).status()).toBe(
    401,
  );
  await mkdir('test-results', { recursive: true });
  await activation.screenshot({ path: 'test-results/f07-admin-profile-phone.png', fullPage: true });
  await card.getByRole('button', { name: 'Refresh activation status' }).click();
  await expect(card.getByText('Administrator: Activated', { exact: true })).toBeVisible();
  await card.getByLabel('Revoke this administrator’s sessions and outstanding links').check();
  const disableGate = Promise.withResolvers();
  const disableFailSafe = setTimeout(() => disableGate.resolve(), 10000);
  let disableCancelled = false;
  const disablePath = `**/api/platform/municipalities/${municipality}/activation/disable`;
  await page.route(disablePath, async (route) => {
    await disableGate.promise;
    await route
      .fulfill({ status: 401, contentType: 'text/html', body: '<html>expired</html>' })
      .catch(() => {});
  });
  const disableRequest = page.waitForRequest(
    (request) =>
      request.method() === 'POST' &&
      request.url().endsWith(`/municipalities/${municipality}/activation/disable`),
    { timeout: 5000 },
  );
  const disableFailureListener = (request) => {
    if (request.url().endsWith(`/municipalities/${municipality}/activation/disable`))
      disableCancelled = true;
  };
  page.on('requestfailed', disableFailureListener);
  await card.getByRole('button', { name: 'Disable administrator', exact: true }).click();
  await disableRequest;
  await page.evaluate(() => {
    window.location.hash = 'health';
  });
  await expect(page.getByRole('heading', { name: 'Network health', exact: true })).toBeVisible();
  await expect.poll(() => disableCancelled, { timeout: 5000 }).toBe(true);
  disableGate.resolve();
  clearTimeout(disableFailSafe);
  page.off('requestfailed', disableFailureListener);
  await page.unroute(disablePath);
  await expect(page.getByRole('heading', { name: 'Sign in to Platform' })).toHaveCount(0);
  await page.goto(`${platformOrigin}/#municipalities/${municipality}`);
  await expect(card.getByText('Administrator: Activated', { exact: true })).toBeVisible();
  await card.getByLabel('Revoke this administrator’s sessions and outstanding links').check();
  await card.getByRole('button', { name: 'Disable administrator', exact: true }).click();
  await expect(card.getByText('Administrator: Disabled', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/f07-operator-disabled.png', fullPage: true });
  await activation.reload();
  await expect(
    activation.getByRole('heading', { name: 'Sign in to operations', exact: true }),
  ).toBeVisible();
  expect((await council.request.get(commandOrigin + '/api/auth/session')).status()).toBe(401);
  expect(errors).toEqual([]);
  console.log(
    'PASS F07 browser: verified operator delivery, explicit context, expiry/reissue, one-use activation, password sign-in/reload, least privilege, phone profile and disable/session revocation.',
  );
} finally {
  await browser?.close();
  await platform?.close();
  await command?.close();
  await environment?.close();
}

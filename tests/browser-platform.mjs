/* global document, innerWidth, window -- Executed in the browser by page.evaluate. */
import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createTestEnvironment } from './helpers/environment.mjs';

let browser, vite, environment;
const errors = [];
try {
  environment = await createTestEnvironment({ platform: true });
  const { pool } = environment;
  const { runProvisioningOnce } = await import('../services/api/provisioning.mjs');
  vite = await createServer({
    configFile: false,
    root: new URL('../apps/civicmaps-platform/', import.meta.url).pathname,
    server: {
      host: '127.0.0.1',
      port: 0,
      fs: { allow: [new URL('../', import.meta.url).pathname] },
      proxy: { '/api': environment.origin },
    },
  });
  await vite.listen();
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  process.env.CIVICMAPS_ORIGINS = origin;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.clock.install();
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
  await expect(
    page.getByRole('heading', { name: 'First administrator · pending activation' }),
  ).toBeVisible();
  await expect(page.locator('.credential code')).toHaveCount(0);
  await page.getByRole('button', { name: 'View municipality', exact: true }).click();
  await expect(page.locator('.credential')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: councilName, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: councilName, exact: true })).toBeVisible();
  const provisioning = page.locator('.provisioning');
  await expect(provisioning).toContainText('Synthetic adapter');
  await expect(provisioning.getByRole('status')).toContainText('Queued');
  await page.route('**/api/platform/municipalities/*', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Synthetic detail unavailable' }),
    }),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toHaveText('Synthetic detail unavailable');
  await page.unroute('**/api/platform/municipalities/*');
  await page.getByRole('button', { name: 'Refresh job status' }).click();
  await expect(provisioning.getByRole('status')).toContainText('Queued');

  await runProvisioningOnce({
    adapter: {
      reconcile: async () => null,
      apply: async () => {
        throw new Error('synthetic permanent fault');
      },
    },
  });
  await provisioning.getByRole('button', { name: 'Refresh job status' }).click();
  await expect(provisioning.getByRole('status')).toContainText('Failed');
  await page.route('**/jobs/*/actions', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Synthetic recovery unavailable' }),
    }),
  );
  await provisioning.getByRole('button', { name: 'Retry job', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Synthetic recovery unavailable');
  await page.unroute('**/jobs/*/actions');
  await provisioning.getByRole('button', { name: 'Retry job', exact: true }).click();
  await expect(provisioning.getByRole('status')).toContainText('Queued');
  function worker(fault) {
    const result = spawnSync(process.execPath, ['services/api/provisioning-worker.mjs', '--once'], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ...(fault ? { CIVICMAPS_WORKER_TEST_FAULT: fault } : {}),
      },
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(result.status, result.stderr).toBe(fault ? 87 : 0);
  }
  worker('after-effect');
  await provisioning.getByRole('button', { name: 'Refresh job status' }).click();
  await expect(provisioning.getByRole('status')).toContainText('Running');
  await expect(provisioning.getByRole('button', { name: 'Reconcile job' })).toHaveCount(0);
  await pool.query(
    "UPDATE provisioning_jobs SET lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",
    [result.jobId],
  );
  await provisioning.getByRole('button', { name: 'Refresh job status' }).click();
  await provisioning.getByRole('button', { name: 'Reconcile job' }).click();
  await expect(provisioning.getByRole('status')).toContainText('Queued');
  worker();
  worker();
  await expect(provisioning.getByRole('status')).toContainText('Succeeded', { timeout: 10000 });
  await expect(provisioning).toContainText(
    'Real infrastructure and admin activation remain pending',
  );
  await expect(provisioning.getByRole('button', { name: 'Retry job', exact: true })).toHaveCount(0);
  await expect(provisioning.getByRole('button', { name: 'Reconcile job' })).toHaveCount(0);
  await mkdir('test-results', { recursive: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/platform-provisioning-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/platform-provisioning-narrow.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
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
  expect(record.rows[0]).toEqual({ packs: ['local-laws'], version: 3, status: 'Provisioning' });
  expect(
    (
      await pool.query('SELECT action FROM platform_audit WHERE municipality_id=$1 ORDER BY id', [
        result.municipality.id,
      ])
    ).rows
      .map((r) => r.action)
      .filter((action) => !action.startsWith('provisioning_')),
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/platform-narrow.png', fullPage: true });
  // Keep both jobs queued so navigation and recovery cannot rely on state changes.
  const session = await (await page.request.get(`${origin}/api/platform/auth/session`)).json();
  async function createRecoveryCouncil(name) {
    const id = randomUUID();
    const response = await page.request.post(`${origin}/api/platform/municipalities`, {
      headers: { 'x-csrf-token': session.csrfToken, 'Idempotency-Key': id },
      data: {
        name,
        slug: `recovery-${id}`,
        packs: ['local-laws'],
        firstName: 'Synthetic',
        lastName: 'Admin',
        email: `${id}@synthetic.example`,
      },
    });
    expect(response.status()).toBe(201);
    return response.json();
  }
  const alpha = await createRecoveryCouncil('Recovery Alpha');
  const beta = await createRecoveryCouncil('Recovery Beta');
  await page.reload();
  await page.goto(`${origin}/#municipalities/${alpha.municipality.id}`);
  await expect(provisioning).toContainText(alpha.jobId);
  const alphaUrl = `**/api/platform/municipalities/${alpha.municipality.id}`;
  const held = Promise.withResolvers();
  const intercepted = Promise.withResolvers();
  const released = Promise.withResolvers();
  await page.route(
    alphaUrl,
    async (route) => {
      const response = await route.fetch();
      intercepted.resolve();
      await held.promise;
      await route.fulfill({ response });
      released.resolve();
    },
    { times: 1 },
  );
  await page.getByRole('button', { name: 'Refresh job status' }).click();
  await intercepted.promise;
  await page.evaluate((id) => {
    window.location.hash = `municipalities/${id}`;
  }, beta.municipality.id);
  await expect(provisioning).toContainText(beta.jobId);
  held.resolve();
  await released.promise;
  // Let the released response render before a later poll could conceal stale data.
  await page.waitForTimeout(100);
  await expect(page.getByRole('heading', { name: 'Recovery Beta', exact: true })).toBeVisible();
  const selectedJob = await provisioning.textContent();
  expect(selectedJob).toContain(beta.jobId);
  expect(selectedJob).not.toContain(alpha.jobId);

  const betaUrl = `**/api/platform/municipalities/${beta.municipality.id}`;
  await page.route(
    betaUrl,
    (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Synthetic scheduled poll outage' }),
      }),
    { times: 1 },
  );
  await expect(page.getByRole('alert')).toHaveText('Synthetic scheduled poll outage');
  const refreshed = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/municipalities/${beta.municipality.id}`) &&
      response.status() === 200,
  );
  await page.getByRole('button', { name: 'Refresh job status' }).click();
  await refreshed;
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(provisioning.getByRole('status')).toContainText('Queued');
  for (let i = 0; i < 4; i += 1) await runProvisioningOnce();
  await expect(provisioning.getByRole('status')).toContainText('Succeeded', { timeout: 10000 });
  // Exercise cloud status copy through the real API with a local adapter fixture.
  process.env.CIVICMAPS_PROVISIONING_PROFILE = 'aws-sydney-development';
  const cloudCouncil = await createRecoveryCouncil('AWS profile fixture');
  delete process.env.CIVICMAPS_PROVISIONING_PROFILE;
  const cloudAdapter = {
    reconcile: async () => null,
    apply: async (job, step) =>
      `aws:${job.id}:${step.name === 'prepare_workspace' ? 'database' : 'storage'}`,
  };
  await runProvisioningOnce({ adapter: cloudAdapter });
  await runProvisioningOnce({ adapter: cloudAdapter });
  const routeId = randomUUID();
  await pool.query(
    `INSERT INTO service_routes(id,hostname,service,municipality_id,binding_id,job_id,target,state,error,municipality_token)
    VALUES ($1,'alpha-commandmaps.dev.civicmaps.com.au','commandmaps',$2,'10000000-0000-4000-8000-000000000001',$3,'local-ui-fixture','failed','Synthetic routing probe failure','alpha')`,
    [routeId, cloudCouncil.municipality.id, cloudCouncil.jobId],
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/#municipalities/${cloudCouncil.municipality.id}`);
  await page.reload();
  await expect(provisioning).toContainText('AWS Sydney development resources');
  await expect(provisioning).toContainText('Prepare isolated database');
  await expect(provisioning).toContainText(
    'Data resources ready. Administrator activation remains pending.',
  );
  const routing = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Service routing', exact: true }) });
  await expect(routing).toContainText('Synthetic routing probe failure', 'alpha');
  await routing.getByRole('button', { name: 'Retry route verification' }).click();
  await expect(routing.getByRole('status')).toContainText('pending');
  await routing.getByRole('button', { name: 'Withdraw route' }).click();
  await expect(routing.getByRole('status')).toContainText('withdrawn');
  await routing.getByRole('button', { name: 'Retry route verification' }).click();
  await expect(routing.getByRole('status')).toContainText('pending');
  await pool.query("UPDATE service_routes SET state='ready',checked_at=now() WHERE id=$1", [
    routeId,
  ]);
  await routing.getByRole('button', { name: 'Refresh routing status' }).click();
  await expect(routing.getByRole('status')).toContainText('ready');
  // Settled routes continue refreshing, and a failed refresh cannot imply current readiness.
  const detailUrl = `**/api/platform/municipalities/${cloudCouncil.municipality.id}`;
  // A "now" target can already be in the past when the browser receives the RPC.
  // Pause safely ahead, then restore wall time so route freshness stays realistic.
  await page.clock.pauseAt(new Date(Date.now() + 60000));
  await page.clock.setSystemTime(new Date());
  await page.route(
    detailUrl,
    (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Synthetic routing refresh outage' }),
      }),
    { times: 1 },
  );
  await page.clock.runFor(20000);
  await expect(routing.getByRole('status')).toContainText('Routing status unavailable');
  await expect(page.getByRole('alert')).toHaveText('Synthetic routing refresh outage');
  await routing.screenshot({ path: 'test-results/f06q-routing-unavailable.png' });
  await page.clock.runFor(20000);
  await expect(routing.getByRole('status')).toContainText('ready');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await pool.query(
    "UPDATE service_routes SET state='failed',error='Later worker failure' WHERE id=$1",
    [routeId],
  );
  await page.clock.runFor(20000);
  await expect(routing.getByRole('status')).toContainText('failed');
  await pool.query(
    "UPDATE service_routes SET state='ready',error=NULL,checked_at=now() WHERE id=$1",
    [routeId],
  );
  await page.clock.setSystemTime(new Date());
  await page.clock.runFor(20000);
  await expect(routing.getByRole('status')).toContainText('ready');
  const slow = Promise.withResolvers(),
    entered = Promise.withResolvers();
  let heldReads = 0;
  await page.route(detailUrl, async (route) => {
    heldReads++;
    entered.resolve();
    await slow.promise;
    await route.continue().catch(() => {});
  });
  await page.clock.runFor(20000);
  await entered.promise;
  await page.clock.runFor(5000);
  expect(heldReads).toBe(1);
  await page.clock.setSystemTime(new Date(Date.now() + 301000));
  await page.clock.runFor(1001);
  await expect(routing.getByRole('status')).toContainText('Routing status unavailable');
  await routing.screenshot({ path: 'test-results/f06q-routing-expired.png' });
  // Serial retries may time out, but at most one live browser fetch is allowed at a time.
  // Navigate while old responses are held; they cannot repaint the new council.
  await page.evaluate((id) => {
    window.location.hash = `municipalities/${id}`;
  }, beta.municipality.id);
  await expect(page.getByRole('heading', { name: 'Recovery Beta', exact: true })).toBeVisible();
  const stoppedReads = heldReads;
  await page.clock.runFor(45000);
  expect(heldReads).toBe(stoppedReads);
  slow.resolve();
  await page.unroute(detailUrl);
  await page.clock.setSystemTime(new Date());
  await page.clock.resume();
  await page.goto(`${origin}/#municipalities/${cloudCouncil.municipality.id}`);
  await expect(routing.getByRole('status')).toContainText('ready');
  await page.clock.setSystemTime(new Date(Date.now() + 301000));
  await page.clock.runFor(1001);
  await expect(routing.getByRole('status')).toContainText('Verification expired');
  await page.screenshot({
    path: 'test-results/platform-aws-resources-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/platform-aws-resources-narrow.png', fullPage: true });
  // A mutation's late 401 belongs to the page scope where it began. Navigation
  // aborts it and must not clear the still-authenticated platform session.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/#packs/${cloudCouncil.municipality.id}`);
  const scopedPack = page.getByRole('switch', { name: 'Local Laws', exact: true });
  await expect(scopedPack).toBeVisible();
  await scopedPack.click();
  const scopedDialog = page.getByRole('dialog');
  const mutationGate = Promise.withResolvers();
  let mutationReleased = false;
  let mutationCancelled = false;
  const mutationFailSafe = setTimeout(() => mutationGate.resolve(), 10000);
  const mutationPath = `**/api/platform/municipalities/${cloudCouncil.municipality.id}/packs`;
  await page.route(mutationPath, async (route) => {
    await mutationGate.promise;
    mutationReleased = true;
    await route
      .fulfill({ status: 401, contentType: 'text/html', body: '<html>expired</html>' })
      .catch(() => {});
  });
  const mutationFailureListener = (request) => {
    if (request.url().endsWith(`/municipalities/${cloudCouncil.municipality.id}/packs`))
      mutationCancelled = true;
  };
  page.on('requestfailed', mutationFailureListener);
  const mutationRequest = page.waitForRequest(
    (request) =>
      request.method() === 'POST' &&
      request.url().endsWith(`/municipalities/${cloudCouncil.municipality.id}/packs`),
    { timeout: 5000 },
  );
  // The confirmation handler starts the intercepted write on an explicit button action.
  await scopedDialog.getByRole('button', { name: 'Turn off pack', exact: true }).click();
  await mutationRequest;
  await page.evaluate(() => {
    window.location.hash = 'health';
  });
  await expect(page.getByRole('heading', { name: 'Network health', exact: true })).toBeVisible();
  await expect.poll(() => mutationCancelled, { timeout: 5000 }).toBe(true);
  mutationGate.resolve();
  clearTimeout(mutationFailSafe);
  await expect.poll(() => mutationReleased).toBe(true);
  await expect(page.getByRole('heading', { name: 'Sign in to Platform' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Network health', exact: true })).toBeVisible();
  await page.unroute(mutationPath);
  page.off('requestfailed', mutationFailureListener);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to Platform' })).toBeVisible();
  expect((await page.request.get(`${origin}/api/platform/municipalities`)).status()).toBe(401);
  expect(errors).toEqual([]);
  console.log(
    'PASS: platform sign-in errors, keyboard wizard, registration, durable job status, retry/reconcile, worker crash/restart, session reload, pack confirmation/cancel, audit, filters, unavailable recovery, health, narrow layout and logout.',
  );
} finally {
  delete process.env.CIVICMAPS_PROVISIONING_PROFILE;
  try {
    if (browser) await browser.close();
  } finally {
    try {
      if (vite) await vite.close();
    } finally {
      await environment?.close();
    }
  }
}

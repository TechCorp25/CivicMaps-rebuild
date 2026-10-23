import { mkdir } from 'node:fs/promises';

export async function verifyM1Discovery(page, expect) {
  const search = page.getByLabel('Search all requests');
  const rows = page.locator('.request-table tbody tr');
  const queueStatus = page.locator('.queue-pagination .muted');

  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('active');
  await expect(rows).toHaveCount(25);
  await expect(page.locator('#queue-limit')).toContainText('authorised requests match this search');

  await search.fill('Queue active');
  await expect(rows).toHaveCount(25);
  await expect(page.locator('#queue-limit')).toContainText(
    '1005 authorised requests match this search',
  );
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/m1-discovery-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(search).toBeVisible();
  await page.screenshot({ path: 'test-results/m1-discovery-narrow.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const loadMore = page.getByRole('button', { name: 'Load more requests', exact: true });
  await loadMore.focus();
  await page.keyboard.press('Enter');
  await expect(rows).toHaveCount(25);
  await expect(queueStatus).toContainText('200 loaded results');
  await expect(page.getByRole('button', { name: 'Load more requests', exact: true })).toBeVisible();

  let failedCursor = false;
  const failOnePage = async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has('before') && !failedCursor) {
      failedCursor = true;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"Temporary page failure"}',
      });
    } else await route.continue();
  };
  await page.route(/\/api\/requests\?/, failOnePage);
  await page.getByRole('button', { name: 'Load more requests', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Temporary page failure');
  await page.unroute(/\/api\/requests\?/, failOnePage);
  await page.getByRole('button', { name: 'Load more requests', exact: true }).click();
  await expect(rows).toHaveCount(25);
  await expect(queueStatus).toContainText('300 loaded results');
  await page.getByRole('button', { name: 'Next queue page' }).click();
  await expect(page.getByRole('navigation', { name: 'Queue pages' })).toContainText('Page 2');
  let failedRefreshPage = false;
  const failRefreshContinuation = async (route) => {
    if (new URL(route.request().url()).searchParams.has('before') && !failedRefreshPage) {
      failedRefreshPage = true;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"Temporary refresh failure"}',
      });
    } else await route.continue();
  };
  await page.route(/\/api\/requests\?/, failRefreshContinuation);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Temporary refresh failure');
  await expect(queueStatus).toContainText('300 loaded results');
  await page.unroute(/\/api\/requests\?/, failRefreshContinuation);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(queueStatus).toContainText('300 loaded results');
  await expect(page.getByRole('navigation', { name: 'Queue pages' })).toContainText('Page 2');

  // A server search must find an older active record without traversing preceding pages.
  await search.fill('Queue active 119');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('Queue active 119');
  await expect(page.locator('#queue-limit')).toContainText(
    '1 authorised requests match this search',
  );
  await page.locator('.request-table tbody .request-link').click();
  await expect(page.locator('.detail')).toContainText('Queue active 119');
  // Selecting the current row again must leave its current detail and history intact.
  await page.locator('.request-table tbody .request-link').click();
  await expect(page.locator('.detail')).toContainText('Queue active 119');
  await expect(page.locator('.audit')).toContainText('No history has been recorded');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.locator('.audit')).toContainText('No history has been recorded');

  // A first-page failure cannot preserve selected detail denied by its independent refresh.
  await expect(page.locator('.detail')).toContainText('Queue active 119');
  let deniedSelectedDetail = false;
  let failedFirstPage = false;
  const denyDetailAndFailFirstPage = async (route) => {
    const url = new URL(route.request().url());
    if (!deniedSelectedDetail && /\/api\/requests\/[0-9a-f-]+$/.test(url.pathname)) {
      deniedSelectedDetail = true;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{"error":"Request not found"}',
      });
    } else if (
      !failedFirstPage &&
      url.pathname === '/api/requests' &&
      !url.searchParams.has('before')
    ) {
      failedFirstPage = true;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"Temporary first-page failure"}',
      });
    } else await route.continue();
  };
  await page.route(/\/api\/requests(?:\/|\?)/, denyDetailAndFailFirstPage);
  for (let attempt = 0; attempt < 5 && !(deniedSelectedDetail && failedFirstPage); attempt++) {
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.waitForTimeout(200);
  }
  expect(deniedSelectedDetail).toBe(true);
  expect(failedFirstPage).toBe(true);
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  await expect(page.locator('.detail button')).toHaveCount(1);
  await page.unroute(/\/api\/requests(?:\/|\?)/, denyDetailAndFailFirstPage);

  // A late successful selection response cannot revive detail denied by a newer refresh.
  await search.fill('Queue active');
  await expect(rows).toHaveCount(25);
  let detailReads = 0;
  let markOldDetailStarted;
  let markOldDetailFinished;
  let releaseOldDetail;
  const oldDetailStarted = new Promise((resolve) => {
    markOldDetailStarted = resolve;
  });
  const oldDetailFinished = new Promise((resolve) => {
    markOldDetailFinished = resolve;
  });
  const oldDetailRelease = new Promise((resolve) => {
    releaseOldDetail = resolve;
  });
  const denyNewDetailAndReleaseOld = async (route) => {
    const url = new URL(route.request().url());
    if (/\/api\/requests\/[0-9a-f-]+$/.test(url.pathname)) {
      detailReads++;
      if (detailReads === 1) {
        markOldDetailStarted();
        await oldDetailRelease;
        try {
          await route.continue();
        } finally {
          markOldDetailFinished();
        }
      } else if (detailReads === 2) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: '{"error":"Request not found"}',
        });
      } else await route.continue();
    } else await route.continue();
  };
  await page.route(/\/api\/requests(?:\/|\?)/, denyNewDetailAndReleaseOld);
  await page.locator('.request-table tbody .request-link').nth(1).click();
  await oldDetailStarted;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  releaseOldDetail();
  await oldDetailFinished;
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  await expect(page.locator('.detail button')).toHaveCount(1);
  await page.unroute(/\/api\/requests(?:\/|\?)/, denyNewDetailAndReleaseOld);

  // A failed queue continuation cannot mask an independently denied selected detail.
  await search.fill('Queue active');
  await expect(rows).toHaveCount(25);
  await page.getByRole('button', { name: 'Load more requests', exact: true }).click();
  await expect(queueStatus).toContainText('200 loaded results');
  await page.locator('.request-table tbody .request-link').first().click();
  await expect(page.locator('.detail')).toContainText('Queue active');
  let deniedDuringRefresh = false;
  let failedRefreshContinuation = false;
  const denyDetailAndFailContinuation = async (route) => {
    const url = new URL(route.request().url());
    if (!deniedDuringRefresh && /\/api\/requests\/[0-9a-f-]+$/.test(url.pathname)) {
      deniedDuringRefresh = true;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{"error":"Request not found"}',
      });
    } else if (!failedRefreshContinuation && url.searchParams.has('before')) {
      failedRefreshContinuation = true;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"Temporary refresh failure"}',
      });
    } else await route.continue();
  };
  await page.route(/\/api\/requests(?:\/|\?)/, denyDetailAndFailContinuation);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  await expect(page.locator('.detail button')).toHaveCount(1);
  await page.unroute(/\/api\/requests(?:\/|\?)/, denyDetailAndFailContinuation);

  let slowStarted = false;
  let releaseSlow;
  let finishSlow;
  const slowFinished = new Promise((resolve) => {
    finishSlow = resolve;
  });
  const slowResponse = new Promise((resolve) => {
    releaseSlow = resolve;
  });
  const delayOldSearch = async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('q') === 'Slow stale query') {
      slowStarted = true;
      await slowResponse;
      try {
        await route.continue();
      } catch {
        // A newer queue generation may already have discarded the stale browser request.
      }
      finishSlow();
      return;
    }
    await route.continue();
  };
  await page.route(/\/api\/requests\?/, delayOldSearch);
  await search.fill('Slow stale query');
  await expect.poll(() => slowStarted).toBe(true);
  await search.fill('Queue active 1004');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText('Queue active 1004');
  releaseSlow();
  await slowFinished;
  await page.unroute(/\/api\/requests\?/, delayOldSearch);
  await expect(rows).toContainText('Queue active 1004');

  let denyDetail = true;
  const deniedDetail = async (route) => {
    if (denyDetail && route.request().url().endsWith('/api/requests/')) {
      denyDetail = false;
      await route.continue();
    } else if (denyDetail && /\/api\/requests\/[0-9a-f-]+$/.test(route.request().url())) {
      denyDetail = false;
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: '{"error":"Request not found"}',
      });
    } else await route.continue();
  };
  await page.route(/\/api\/requests\//, deniedDetail);
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  await expect(page.locator('.detail button')).toHaveCount(1);
  await page.unroute(/\/api\/requests\//, deniedDetail);
}

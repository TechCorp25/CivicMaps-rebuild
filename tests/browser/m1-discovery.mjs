/* global window -- Executed in the browser by page.evaluate. */
import { mkdir, writeFile } from 'node:fs/promises';
import { verifyDetailDuringPagination } from './selected-detail-pagination.mjs';

export async function verifyM1Discovery(page, expect) {
  const search = page.getByLabel('Search all requests');
  const rows = page.locator('.request-table tbody tr');
  const queueStatus = page.locator('.queue-pagination .muted');

  await page.getByRole('combobox', { name: 'Show', exact: true }).selectOption('active');
  await expect(rows).toHaveCount(25);
  await expect(page.locator('#queue-limit')).toContainText('authorised requests match this search');

  let releaseSearch;
  const searchGate = new Promise((resolve) => {
    releaseSearch = resolve;
  });
  const holdSearch = async (route) => {
    if (new URL(route.request().url()).searchParams.get('q') === 'Queue active') {
      await searchGate;
    }
    await route.continue().catch(() => {});
  };
  await page.route(/\/api\/requests\?/, holdSearch);
  const searchRequest = page.waitForRequest(
    (request) => new URL(request.url()).searchParams.get('q') === 'Queue active',
  );
  await search.fill('Queue active');
  await searchRequest;
  await expect(
    page.getByRole('heading', { name: 'Loading requests', exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No matching requests' })).toHaveCount(0);
  await expect(page.locator('.operational-map')).toContainText('Loading request locations');
  releaseSearch();
  await page.unroute(/\/api\/requests\?/, holdSearch);
  await expect(rows).toHaveCount(25);
  await expect(page.locator('#queue-limit')).toContainText(
    '1005 authorised requests match this search',
  );
  await expect(page.locator('.operational-map')).toContainText(
    'more matching requests have not been loaded',
  );
  await expect(page.locator('.operational-map')).toContainText(
    'not a separate complete map search',
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

  await verifyDetailDuringPagination(page, expect);

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
    if (/\/api\/requests\/[0-9a-f-]+$/.test(url.pathname)) {
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
  const targetRow = page.locator('.request-table tbody tr').nth(1);
  const targetId = await targetRow.getAttribute('data-request-id');
  expect(targetId).toMatch(/^[0-9a-f-]+$/);
  const controlledResponses = [];
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
    if (url.pathname === `/api/requests/${targetId}`) {
      const readOrdinal = ++detailReads;
      if (readOrdinal === 1) {
        markOldDetailStarted();
        await oldDetailRelease;
        try {
          await route.continue();
          controlledResponses.push({ ordinal: readOrdinal, outcome: 'released-stale-read' });
        } catch {
          // A newer selected-detail generation may abort this stale read.
          controlledResponses.push({ ordinal: readOrdinal, outcome: 'stale-read-aborted' });
        } finally {
          markOldDetailFinished();
        }
      } else {
        controlledResponses.push({ ordinal: readOrdinal, outcome: '404-denied' });
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: '{"error":"Request not found"}',
        });
      }
    } else await route.continue();
  };
  await page.route(/\/api\/requests(?:\/|\?)/, denyNewDetailAndReleaseOld);
  await targetRow.locator('.request-link').click();
  await oldDetailStarted;
  const firstDeniedResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === `/api/requests/${targetId}` && response.status() === 404;
  });
  await page.evaluate(() => window.__CIVICMAPS_TEST_FIRE_REFRESH__('focus'));
  await firstDeniedResponse;
  await expect.poll(() => detailReads).toBe(2);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__CIVICMAPS_TEST_EVENTS__.filter((event) => event.operation === 'refresh-complete')
            .length,
      ),
    )
    .toBe(1);
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  const trace = await page.evaluate(() => window.__CIVICMAPS_TEST_EVENTS__);
  const selectedReads = trace.filter(
    (event) => event.requestId === targetId && ['selection', 'refresh'].includes(event.operation),
  );
  expect(selectedReads.length).toBeGreaterThanOrEqual(2);
  expect(selectedReads.at(-1).requestGeneration).toBeGreaterThan(
    selectedReads[0].requestGeneration,
  );
  expect(selectedReads.at(-1).scopeGeneration).toBe(selectedReads[0].scopeGeneration);
  for (const source of ['interval', 'focus']) {
    const expectedReads = detailReads + 1;
    const expectedRefreshes =
      (await page.evaluate(
        () =>
          window.__CIVICMAPS_TEST_EVENTS__.filter((event) => event.operation === 'refresh-complete')
            .length,
      )) + 1;
    const deniedResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === `/api/requests/${targetId}` && response.status() === 404;
    });
    await page.evaluate((kind) => window.__CIVICMAPS_TEST_FIRE_REFRESH__(kind), source);
    await deniedResponse;
    await expect.poll(() => detailReads).toBe(expectedReads);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.__CIVICMAPS_TEST_EVENTS__.filter(
              (event) => event.operation === 'refresh-complete',
            ).length,
        ),
      )
      .toBe(expectedRefreshes);
    await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
    await expect(page.locator('.detail button')).toHaveCount(1);
  }
  const finalTrace = await page.evaluate(() => window.__CIVICMAPS_TEST_EVENTS__);
  releaseOldDetail();
  await oldDetailFinished;
  await expect(page.getByRole('heading', { name: 'Selected request unavailable' })).toBeVisible();
  await expect(page.locator('.detail button')).toHaveCount(1);
  const raceEvidence = {
    requestId: targetId,
    selectedReadEvents: finalTrace.filter(
      (event) => event.requestId === targetId && ['selection', 'refresh'].includes(event.operation),
    ),
    scheduledSources: finalTrace
      .filter((event) => event.operation === 'refresh-trigger')
      .map((event) => event.source),
    controlledResponses,
    assertion:
      'one held stale selection response; three independently issued later refresh reads returned 404',
    finalState: 'Selected request unavailable; stale read did not restore actionable detail',
  };
  await mkdir('test-results', { recursive: true });
  await writeFile(
    'test-results/q3-controlled-detail-race.json',
    `${JSON.stringify(raceEvidence, null, 2)}\n`,
  );
  await page.unroute(/\/api\/requests(?:\/|\?)/, denyNewDetailAndReleaseOld);

  // A failed queue continuation cannot mask an independently denied selected detail.
  await search.fill('Queue active');
  await expect(rows).toHaveCount(25);
  await page.getByRole('button', { name: 'Load more requests', exact: true }).click();
  await expect(queueStatus).toContainText('200 loaded results');
  await page.locator('.request-table tbody .request-link').first().click();
  await expect(page.locator('.detail')).toContainText('Queue active');
  let failedRefreshContinuation = false;
  const denyDetailAndFailContinuation = async (route) => {
    const url = new URL(route.request().url());
    // Keep the denial in force across overlapping scheduled refreshes until assertions finish.
    if (/\/api\/requests\/[0-9a-f-]+$/.test(url.pathname)) {
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

  // Queue search may hide the selected row, but the selected history read must settle.
  await search.fill('Queue active');
  await expect(rows).toHaveCount(25);
  let releaseHistory;
  const heldHistory = new Promise((resolve) => {
    releaseHistory = resolve;
  });
  const historyFailSafe = setTimeout(() => releaseHistory(), 10000);
  const historyTarget = page.locator('.request-link[aria-pressed="false"]').first();
  const historyTargetId = await historyTarget
    .locator('xpath=ancestor::tr')
    .getAttribute('data-request-id');
  expect(historyTargetId).toMatch(/^[0-9a-f-]+$/);
  let heldHistoryResponse;
  let historyResponseCompleted = false;
  let historyReads = 0;
  const holdOneHistoryResponse = async (route) => {
    if (!route.request().url().endsWith(`/requests/${historyTargetId}/audit`))
      return route.continue();
    if (heldHistoryResponse) return route.continue();
    heldHistoryResponse = true;
    historyReads += 1;
    const response = await route.fetch();
    await heldHistory;
    await route.fulfill({ response }).then(
      () => {
        historyResponseCompleted = true;
      },
      () => {},
    );
  };
  await page.route(new RegExp(`/api/requests/${historyTargetId}/audit$`), holdOneHistoryResponse);
  const historyStarted = page.waitForRequest(
    (request) => request.url().endsWith(`/requests/${historyTargetId}/audit`),
    { timeout: 5000 },
  );
  await historyTarget.click();
  await historyStarted;
  await expect(page.locator('.audit')).toContainText('Loading history');
  await search.fill('No matching queue row');
  await expect(rows).toHaveCount(0);
  releaseHistory();
  clearTimeout(historyFailSafe);
  await expect(page.locator('.audit')).not.toContainText('Loading history');
  expect(historyResponseCompleted).toBe(true);
  expect(historyReads).toBe(1);
  await page.unroute(new RegExp(`/api/requests/${historyTargetId}/audit$`), holdOneHistoryResponse);
  console.log(
    JSON.stringify({
      operation: 'history-filter-race',
      requestId: historyTargetId,
      generation: 'selected request; queue filter changed while its audit response was held',
      reads: historyReads,
      responseCompleted: historyResponseCompleted,
      state: 'history loading resolved after search hid all queue rows',
    }),
  );
}

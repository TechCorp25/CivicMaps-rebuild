import { chromium, expect } from '/workspace/work/quality-audits/q3-fix3/published/node_modules/@playwright/test/index.mjs';
import { createServer } from '/workspace/work/quality-audits/q3-fix3/published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from '/workspace/work/quality-audits/q3-fix3/published/tests/helpers/environment.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
let environment,vite,browser;
try {
environment=await createTestEnvironment();vite=await createServer({configFile:false,esbuild:{jsx:'automatic'},root:process.cwd()+'/apps/commandmaps',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]},proxy:{'/api':environment.origin}}});await vite.listen();const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;browser=await chromium.launch({headless:true});
for(let iteration=1;iteration<=3;iteration++) {
const context=await browser.newContext();const page=await context.newPage();
await page.addInitScript(()=>{window.__CIVICMAPS_TEST_EVENTS__=[];window.__CIVICMAPS_TEST_TRACE__=event=>window.__CIVICMAPS_TEST_EVENTS__.push(event);window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__=refresh=>{window.__CIVICMAPS_TEST_FIRE_REFRESH__=refresh;return ()=>delete window.__CIVICMAPS_TEST_FIRE_REFRESH__;};});
await page.goto(origin);await page.getByLabel('Email',{exact:true}).fill('dispatch@alpha.example');await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('heading',{name:'Service requests',exact:true})).toBeVisible();
const session=await (await page.request.get(origin+'/api/auth/session')).json();
for(let fixture=0;fixture<2;fixture++) {const r=await page.request.post(origin+'/api/requests',{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:'Audit gate '+iteration+' '+fixture,latitude:-37.814,longitude:144.963,notes:'synthetic'}});expect(r.status()).toBe(201);}
await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect.poll(()=>page.locator('.request-table tbody tr').count()).toBeGreaterThan(1);
await page.waitForLoadState('networkidle');
await page.evaluate(()=>window.__CIVICMAPS_TEST_EVENTS__=[]);
const search=page.getByLabel('Search all requests');const rows=page.locator('.request-table tbody tr');
  // A late successful selection response cannot revive detail denied by a newer refresh.
  await search.fill('');
  await expect.poll(() => rows.count()).toBeGreaterThan(1);
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

console.log(JSON.stringify({iteration,...raceEvidence}));await context.close();
}
}finally{await browser?.close();await vite?.close();await environment?.close();}

import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
import { verifyM1Discovery } from './published/tests/browser/m1-discovery.mjs';
import { readFile, copyFile } from 'node:fs/promises';
let environment,vite,browser,origin,database;
const errors=[];const password='CivicMAPS-local-2026!';
async function login(page, email) {
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__CIVICMAPS_TEST_EVENTS__ = [];
    window.__CIVICMAPS_TEST_TRACE__ = (event) => window.__CIVICMAPS_TEST_EVENTS__.push(event);
    window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__ = (refresh) => {
      window.__CIVICMAPS_TEST_FIRE_REFRESH__ = refresh;
      return () => delete window.__CIVICMAPS_TEST_FIRE_REFRESH__;
    };
  });
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

try {
 environment=await createTestEnvironment();database=environment.pool;
 vite=await createServer({configFile:false,esbuild:{jsx:'automatic'},root:new URL('./published/apps/commandmaps/',import.meta.url).pathname,server:{host:'127.0.0.1',port:0,fs:{allow:[new URL('./published/',import.meta.url).pathname]},proxy:{'/api':environment.origin}}});
 await vite.listen();origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;
 await seedQueueOverflow();browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});await login(page,'dispatch@alpha.example');
 await expect(page.locator('.request-table tbody tr')).toHaveCount(25);
 await verifyM1Discovery(page,expect);expect(errors).toEqual([]);
 await copyFile('test-results/q3-controlled-detail-race.json',new URL(`./repeated-m1-${process.argv[2]}.json`,import.meta.url));
 console.log(`PASS independent repeat ${process.argv[2]}`);
}finally{await browser?.close();await vite?.close();await environment?.close();}

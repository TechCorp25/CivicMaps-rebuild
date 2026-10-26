import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
import { verifyM1Discovery } from './published/tests/browser/m1-discovery.mjs';
import { copyFile } from 'node:fs/promises';
let environment, vite, browser, database;
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
 environment=await createTestEnvironment(); database=environment.pool;

 vite=await createServer({configFile:false,esbuild:{jsx:'automatic'},root:new URL('./published/apps/commandmaps/',import.meta.url).pathname,server:{host:'127.0.0.1',port:0,fs:{allow:[new URL('./published/',import.meta.url).pathname]},proxy:{'/api':environment.origin}}});
 await vite.listen();const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true});
 for(let i=1;i<=3;i++) {
 const context=await browser.newContext({viewport:{width:1440,height:1000}}); const page=await context.newPage();
 await page.addInitScript(()=>{window.__CIVICMAPS_TEST_EVENTS__=[];window.__CIVICMAPS_TEST_TRACE__=e=>window.__CIVICMAPS_TEST_EVENTS__.push(e);window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__=refresh=>{window.__CIVICMAPS_TEST_FIRE_REFRESH__=refresh;return ()=>delete window.__CIVICMAPS_TEST_FIRE_REFRESH__;};});
 await page.goto(origin);await page.getByLabel('Email',{exact:true}).fill('dispatch@alpha.example');await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('heading',{name:'Service requests',exact:true})).toBeVisible();
 if(i===1) {
 const session=await (await page.request.get(`${origin}/api/auth/session`)).json();
 const created=await page.request.post(`${origin}/api/requests`,{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:'Audit bootstrap fixture',latitude:-37.814,longitude:144.963,notes:'Synthetic audit fixture'}});
 expect(created.status()).toBe(201);
 await seedQueueOverflow();
 }
 await verifyM1Discovery(page,expect);
 await copyFile('test-results/q3-controlled-detail-race.json',`../audit-controlled-race-${i}.json`);
 console.log(`PASS controlled M1 repetition ${i}`);await context.close();
 }
} finally {await browser?.close();await vite?.close();await environment?.close();}

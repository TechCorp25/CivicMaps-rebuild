import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
let environment, vite, browser;
try {
 environment=await createTestEnvironment();
 vite=await createServer({configFile:false,esbuild:{jsx:'automatic'},root:process.cwd()+'/apps/commandmaps',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]},proxy:{'/api':environment.origin}}});
 await vite.listen();
 const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;
 process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 await page.addInitScript(()=>{window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__=()=>()=>{};});
 await page.goto(origin);
 await page.getByLabel('Email',{exact:true}).fill('dispatch@alpha.example');
 await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Service requests',exact:true})).toBeVisible();
 const session=await (await page.request.get(origin+'/api/auth/session')).json();
 for(const body of ['', '{"unfinished":', '<html>upstream</html>']) {
  const fixture=await (await page.request.post(origin+'/api/requests',{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:'Independent malformed write '+crypto.randomUUID(),latitude:-37.814,longitude:144.963,notes:'Synthetic audit'}})).json();
  await page.getByRole('button',{name:'Refresh',exact:true}).click();
  await page.locator(`[data-request-id="${fixture.id}"] .request-link`).click();
  await page.getByRole('combobox',{name:/^Assign officer/}).selectOption('00000000-0000-4000-8000-000000000002');
  const pattern=`**/api/requests/${fixture.id}/actions`;
  let committedStatus;
  await page.route(pattern,async route=>{const response=await route.fetch();committedStatus=response.status();await route.fulfill({status:response.status(),contentType:'application/json',body});});
  await page.getByRole('button',{name:'Assign request',exact:true}).click();
  await expect(page.locator('#content > .error')).toContainText('The operation could not be completed');
  await expect(page.getByRole('button',{name:'Assign request',exact:true})).toBeEnabled();
  const server=await (await page.request.get(origin+`/api/requests/${fixture.id}`)).json();
  console.log(JSON.stringify({body,committedStatus,serverVersion:server.version,detail:await page.locator('.detail').innerText(),reconcileButtons:await page.getByRole('button',{name:'Check server state and history'}).count()}));
  expect(server.version).toBe(2);
  expect(await page.getByRole('button',{name:'Check server state and history'}).count()).toBe(0);
  await page.unroute(pattern);
 }
} finally {await browser?.close();await vite?.close();await environment?.close();}

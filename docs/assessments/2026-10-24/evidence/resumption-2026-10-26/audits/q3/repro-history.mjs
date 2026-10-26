import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
let environment,vite,browser;
try {
 environment=await createTestEnvironment();
 vite=await createServer({configFile:false,esbuild:{jsx:'automatic'},root:process.cwd()+'/apps/commandmaps',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]},proxy:{'/api':environment.origin}}});
 await vite.listen(); const origin=`http://127.0.0.1:${vite.httpServer.address().port}`; process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true}); const page=await browser.newPage();
 await page.addInitScript(()=>{window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__=()=>()=>{};});
 await page.goto(origin); await page.getByLabel('Email',{exact:true}).fill('dispatch@alpha.example'); await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!'); await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Service requests',exact:true})).toBeVisible();
 const session=await(await page.request.get(origin+'/api/auth/session')).json();
 const created=await page.request.post(origin+'/api/requests',{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:'Audit history fixture',latitude:-37.814,longitude:144.963,notes:'Synthetic'}});expect(created.status()).toBe(201);
 await page.getByRole('button',{name:'Refresh',exact:true}).click();
 await expect(page.locator('.request-table tbody .request-link').first()).toBeVisible();
 let release,started; const gate=new Promise(r=>release=r),seen=new Promise(r=>started=r);let failed=false,reads=0;
 page.on('requestfailed',r=>{if(r.url().endsWith('/audit'))failed=true;});
 await page.route('**/api/requests/*/audit',async route=>{reads++;started();await gate;await route.continue().catch(()=>{});});
 await page.locator('.request-table tbody .request-link').first().click();await seen;
 await expect(page.locator('.audit')).toContainText('Loading history');
 await page.getByLabel('Search all requests').fill('No matching queue row');await expect(page.locator('.request-table tbody tr')).toHaveCount(0);
 release();await page.waitForTimeout(11000);
 await expect(page.locator('.audit')).toContainText('Loading history');
 console.log(JSON.stringify({phase:'history remains loading beyond transport lifetime after search cancellation',aborted:failed,reads,audit:await page.locator('.audit').textContent()}));

} finally {await browser?.close();await vite?.close();await environment?.close();}

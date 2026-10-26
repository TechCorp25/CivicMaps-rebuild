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
 await page.addInitScript(()=>{window.__CIVICMAPS_TEST_EVENTS__=[];window.__CIVICMAPS_TEST_TRACE__=event=>window.__CIVICMAPS_TEST_EVENTS__.push(event);window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__=refresh=>{window.__FIRE__=refresh;return ()=>{};};});
 await page.goto(origin);
 await page.getByLabel('Email',{exact:true}).fill('dispatch@alpha.example');
 await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Service requests',exact:true})).toBeVisible();
 const session=await (await page.request.get(origin+'/api/auth/session')).json();
 for(let iteration=1;iteration<=3;iteration++) {
 const fixture=await (await page.request.post(origin+'/api/requests',{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:'Independent race '+iteration,latitude:-37.814,longitude:144.963,notes:'Synthetic audit'}})).json();
 await page.getByRole('button',{name:'Refresh',exact:true}).click();
 let release,started,finished;
 const gate=new Promise(r=>release=r), begin=new Promise(r=>started=r), end=new Promise(r=>finished=r);
 let reads=0;
 const pattern=`**/api/requests/${fixture.id}`;
 await page.route(pattern,async route=>{reads++;if(reads===1){started();await gate;await route.continue().catch(()=>{});finished();}else await route.fulfill({status:404,contentType:'application/json',body:'{"error":"Request not found"}'});});
 await page.locator(`[data-request-id="${fixture.id}"] .request-link`).click();
 await begin;
 for(const source of ['focus','interval','focus']) {
 const prior=reads;
 await page.evaluate(source=>window.__FIRE__(source),source);
 await expect.poll(()=>reads).toBe(prior+1);
 await expect(page.getByRole('heading',{name:'Selected request unavailable'})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>window.__CIVICMAPS_TEST_EVENTS__.filter(x=>x.operation==='refresh-complete').length)).toBe((iteration-1)*3+reads-1);
 }
 release();await end;
 await expect(page.getByRole('heading',{name:'Selected request unavailable'})).toBeVisible();
 await expect(page.locator('.detail button')).toHaveCount(1);
 console.log(JSON.stringify({iteration,requestId:fixture.id,reads,trace:await page.evaluate(id=>window.__CIVICMAPS_TEST_EVENTS__.filter(x=>x.requestId===id),fixture.id),outcome:'held selection cannot revive three denied refreshes'}));
 await page.unroute(pattern);
 }
} finally {await browser?.close();await vite?.close();await environment?.close();}

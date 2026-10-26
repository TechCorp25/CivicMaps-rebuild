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
 const fixtures=[];
 for(let i=0;i<2;i++) fixtures.push(await (await page.request.post(origin+'/api/requests',{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:'Independent history ABA '+i,latitude:-37.814,longitude:144.963,notes:'Synthetic audit'}})).json());
 await page.getByRole('button',{name:'Refresh',exact:true}).click();
 const [a,b]=fixtures;
 let reads=0,release,started;
 const gate=new Promise(r=>release=r),begin=new Promise(r=>started=r);
 const pattern=`**/api/requests/${a.id}/audit`;
 await page.route(pattern,async route=>{
  reads++;
  if(reads===1) await route.fulfill({status:503,contentType:'text/html',body:'<html>unavailable</html>'});
  else if(reads===2){started();await gate;await route.fulfill({status:401,contentType:'text/html',body:'<html>old denied retry</html>'}).catch(()=>{});}
  else await route.continue();
 });
 await page.locator(`[data-request-id="${a.id}"] .request-link`).click();
 await page.getByRole('button',{name:'Retry history',exact:true}).click();
 await begin;
 await page.locator(`[data-request-id="${b.id}"] .request-link`).click();
 await expect(page.locator('.detail')).toContainText(b.address);
 await page.locator(`[data-request-id="${a.id}"] .request-link`).click();
 await expect(page.locator('.audit')).toContainText('created');
 expect(reads).toBe(3);
 console.log(JSON.stringify({stage:'new-selection-history-ready',requestId:a.id,reads,sessionStatus:(await page.request.get(origin+'/api/auth/session')).status()}));
 release();
 await expect(page.getByRole('button',{name:'Sign in',exact:true})).toBeVisible();
 console.log(JSON.stringify({stage:'stale-retry-401-cleared-live-session',sessionStatus:(await page.request.get(origin+'/api/auth/session')).status(),reads}));
} finally {await browser?.close();await vite?.close();await environment?.close();}

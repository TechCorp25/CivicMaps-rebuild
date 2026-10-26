import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
let environment,vite,browser;
try {
 environment=await createTestEnvironment({platform:true});
 vite=await createServer({configFile:false,root:process.cwd()+'/apps/civicmaps-platform',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]},proxy:{'/api':environment.origin}}});
 await vite.listen(); const origin=`http://127.0.0.1:${vite.httpServer.address().port}`; process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true}); const page=await browser.newPage();
 await page.goto(origin); await page.getByLabel('Platform operator email').fill('operator@platform.example'); await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!'); await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Municipalities',exact:true})).toBeVisible();
 const listing=await (await page.request.get(origin+'/api/platform/municipalities')).json(); const council=listing.municipalities[0];
 await page.evaluate(id=>location.hash=`packs/${id}`,council.id); await expect(page.getByRole('switch').first()).toBeVisible();
 let release, started; const gate=new Promise(r=>release=r), seen=new Promise(r=>started=r); let failed=false;
 page.on('requestfailed',r=>{if(r.url().endsWith('/packs'))failed=true;});
 await page.route('**/api/platform/municipalities/*/packs',async route=>{started(); await gate; await route.fulfill({status:401,contentType:'text/html',body:'<html>old-context denied</html>'});});
 const toggle=page.getByRole('switch').first(); const enabled=await toggle.getAttribute('aria-checked'); await toggle.click(); if(enabled==='true') await page.getByRole('button',{name:'Turn off pack',exact:true}).click(); await seen;
 await page.getByRole('link',{name:'Network health',exact:true}).click(); await expect(page.getByRole('heading',{name:'Network health',exact:true})).toBeVisible();
 console.log(JSON.stringify({phase:'navigated while mutation pending',hash:await page.evaluate(()=>location.hash),aborted:failed}));
 release(); await expect(page.getByLabel('Platform operator email')).toBeVisible(); console.log(JSON.stringify({phase:'stale 401 logged out current page',alert:await page.getByRole('alert').textContent(),aborted:failed}));
} finally {await browser?.close();await vite?.close();await environment?.close();}

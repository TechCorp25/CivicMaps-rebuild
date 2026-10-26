import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
let env,vite,browser;
try {
 env=await createTestEnvironment({platform:true});
 vite=await createServer({configFile:false,root:new URL('./published/apps/civicmaps-platform/',import.meta.url).pathname,server:{host:'127.0.0.1',port:0,fs:{allow:[new URL('./published/',import.meta.url).pathname]},proxy:{'/api':env.origin}}});
 await vite.listen();const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.clock.install();
 await page.addInitScript(()=>{const native=window.fetch;window.__denyMode=null;window.__denialReads=0;window.fetch=async (...args)=>{if(window.__denyMode && String(args[0]).match(/\/api\/platform\/municipalities\/[^/]+$/)){window.__denialReads++;const body=window.__denyMode==='truncated'?new ReadableStream({start(controller){controller.error(new TypeError('synthetic interrupted response body'));}}):'<html>synthetic forbidden</html>';return new Response(body,{status:403});}return native(...args);};});
 await page.goto(origin);await page.getByLabel('Platform operator email').fill('operator@platform.example');await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('heading',{name:'Municipalities',exact:true})).toBeVisible();
 const id=(await env.pool.query('SELECT id FROM platform_municipalities ORDER BY name LIMIT 1')).rows[0].id;
 for(const mode of ['html','truncated']){
  await page.evaluate(id=>{window.__denyMode=null;location.hash=`packs/${id}`;},id);
  await expect(page.getByRole('switch').first()).toBeEnabled();
  await page.evaluate(mode=>{window.__denyMode=mode;window.__denialReads=0;},mode);await page.clock.runFor(16000);await expect.poll(()=>page.evaluate(()=>window.__denialReads)).toBeGreaterThan(0);
  await expect(page.locator('main')).toContainText(mode==='html'?'The operation could not be completed':'The service could not be reached');
  const states=await page.getByRole('switch').evaluateAll(items=>items.map(x=>({disabled:x.disabled,label:x.getAttribute('aria-label')})));console.log(JSON.stringify({mode,status:403,switches:states}));
  await page.evaluate(()=>{window.__denyMode=null;location.hash='municipalities';});await expect(page.getByRole('heading',{name:'Municipalities',exact:true})).toBeVisible();
 }
}finally{await browser?.close();await vite?.close();await env?.close();}

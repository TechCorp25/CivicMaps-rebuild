import { chromium, expect } from '/workspace/work/quality-audits/q3-fix3/published/node_modules/@playwright/test/index.mjs';
import { createServer } from '/workspace/work/quality-audits/q3-fix3/published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from '/workspace/work/quality-audits/q3-fix3/published/tests/helpers/environment.mjs';
let environment,vite,browser;
try {
 environment=await createTestEnvironment({platform:true});
 vite=await createServer({configFile:false,root:process.cwd()+'/apps/civicmaps-platform',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]},proxy:{'/api':environment.origin}}});
 await vite.listen(); const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.clock.install();
 await page.goto(origin);await page.getByLabel('Platform operator email').fill('operator@platform.example');await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Municipalities',exact:true})).toBeVisible();
 const directory=await (await page.request.get(origin+'/api/platform/municipalities')).json();const id=directory.municipalities[0].id;
 await page.evaluate(id=>location.hash='packs/'+id,id);await expect(page.getByRole('switch').first()).toBeEnabled();
 let denied=0;await page.route('**/api/platform/municipalities/'+id,async route=>{denied++;await route.fulfill({status:403,contentType:'text/html',body:'<html>denied audit marker</html>'});});
 await page.clock.runFor(16000);await expect.poll(()=>denied).toBeGreaterThan(0);
 const buttons=await page.getByRole('switch').evaluateAll(items=>items.map(b=>({text:b.textContent,disabled:b.disabled})));
 console.log(JSON.stringify({denied,buttons,body:await page.locator('main').innerText()},null,2));
 expect(buttons.some(b=>!b.disabled)).toBe(true);
 console.log('REPRODUCED: platform retains enabled pack mutations after explicit detail 403');
} finally {await browser?.close();await vite?.close();await environment?.close();}

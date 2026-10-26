import { chromium, expect } from './published/node_modules/@playwright/test/index.mjs';
import { createServer } from './published/node_modules/vite/dist/node/index.js';
import { createTestEnvironment } from './published/tests/helpers/environment.mjs';
let env,vite,browser,denyMode=null,denialReads=0;
try {
 env=await createTestEnvironment({platform:true});
 vite=await createServer({configFile:false,plugins:[{name:'audit-denial',configureServer(server){server.middlewares.use((req,res,next)=>{if(denyMode && /^\/api\/platform\/municipalities\/[^/?]+$/.test(req.url)){denialReads++;res.writeHead(403,{'content-type':'text/html'});res.write('<html>synthetic forbidden');if(denyMode==='truncated')setTimeout(()=>res.destroy(),30);else res.end('</html>');return;}next();});}}],root:new URL('./published/apps/civicmaps-platform/',import.meta.url).pathname,server:{host:'127.0.0.1',port:0,fs:{allow:[new URL('./published/',import.meta.url).pathname]},proxy:{'/api':env.origin}}});

 await vite.listen();const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.clock.install();
 await page.goto(origin);await page.getByLabel('Platform operator email').fill('operator@platform.example');await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('heading',{name:'Municipalities',exact:true})).toBeVisible();
 const id=(await env.pool.query('SELECT id FROM platform_municipalities ORDER BY name LIMIT 1')).rows[0].id;
 for(const mode of ['html','truncated']){
  denyMode=null;await page.evaluate(id=>{location.hash=`packs/${id}`;},id);
  await expect(page.getByRole('switch').first()).toBeEnabled();
  denyMode=mode;denialReads=0;await page.clock.runFor(16000);await expect.poll(()=>denialReads).toBeGreaterThan(0);
  await expect(page.locator('main')).toContainText(mode==='html'?'The operation could not be completed':'The service could not be reached');
  const states=await page.getByRole('switch').evaluateAll(items=>items.map(x=>({disabled:x.disabled,label:x.getAttribute('aria-label')})));console.log(JSON.stringify({mode,status:403,switches:states}));
  denyMode=null;await page.evaluate(()=>{location.hash='municipalities';});await expect(page.getByRole('heading',{name:'Municipalities',exact:true})).toBeVisible();
 }
}finally{await browser?.close();await vite?.close();await env?.close();}

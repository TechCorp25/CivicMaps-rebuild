import assert from 'node:assert/strict';
import { createServer as httpServer } from 'node:http';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
const root='/workspace/work/quality-audits/q3-fix5/published';
const {requestJson,getHttpStatus,isRequestCancelled}=await import(`${root}/apps/shared/api-transport.mjs`);
const results=[];
const server=httpServer((req,res)=>{const status=Number(req.url.slice(1));res.writeHead(status,{'Content-Type':'application/json'});res.write('{');setTimeout(()=>res.destroy(),25)}).listen(0,'127.0.0.1');
await once(server,'listening');
for(const status of [401,403,404,503]){await assert.rejects(requestJson(`http://127.0.0.1:${server.address().port}`,`/${status}`),e=>{assert.equal(getHttpStatus(e),status);assert.equal(e.kind,'network');return true});results.push({probe:'real-http-interrupted-body',status,passed:true});}
await new Promise(r=>server.close(r));
const {chromium,expect}=await import(`${root}/node_modules/@playwright/test/index.mjs`);
const {createServer}=await import(`${root}/node_modules/vite/dist/node/index.js`);
const {createTestEnvironment}=await import(`${root}/tests/helpers/environment.mjs`);
let env,vite,browser;
try{
 env=await createTestEnvironment();
 vite=await createServer({configFile:false,esbuild:{jsx:'automatic'},root:`${root}/apps/commandmaps`,server:{host:'127.0.0.1',port:0,fs:{allow:[root]},proxy:{'/api':env.origin}}});await vite.listen();
 const origin=`http://127.0.0.1:${vite.httpServer.address().port}`;process.env.CIVICMAPS_ORIGINS=origin;
 browser=await chromium.launch({headless:true});
 for(let iteration=1;iteration<=3;iteration++){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
  await page.addInitScript(()=>{window.__CIVICMAPS_TEST_EVENTS__=[];window.__CIVICMAPS_TEST_TRACE__=e=>window.__CIVICMAPS_TEST_EVENTS__.push(e);window.__CIVICMAPS_TEST_REFRESH_SCHEDULER__=f=>{window.__CIVICMAPS_TEST_FIRE_REFRESH__=f;return ()=>delete window.__CIVICMAPS_TEST_FIRE_REFRESH__}});
  await page.goto(origin);await page.getByLabel('Email',{exact:true}).fill('dispatch@alpha.example');await page.getByLabel('Password',{exact:true}).fill('CivicMAPS-local-2026!');await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('heading',{name:'Service requests',exact:true})).toBeVisible();
  const session=await (await page.request.get(`${origin}/api/auth/session`)).json();
  const created=await page.request.post(`${origin}/api/requests`,{headers:{'x-csrf-token':session.csrfToken,'Idempotency-Key':crypto.randomUUID()},data:{address:`Independent controlled race ${iteration}`,latitude:-37.8,longitude:144.9,notes:'synthetic'}});assert.equal(created.status(),201);const target=await created.json();
  await page.getByRole('button',{name:'Refresh',exact:true}).click();await expect(page.locator(`[data-request-id="${target.id}"]`)).toBeVisible();
  let count=0;const entered=Promise.withResolvers(),gate=Promise.withResolvers(),finished=Promise.withResolvers();
  const path=`**/api/requests/${target.id}`;
  await page.route(path,async route=>{count++;if(count===1){entered.resolve();await gate.promise;await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(target)}).catch(()=>{});finished.resolve();}else await route.fulfill({status:403,contentType:'text/html',body:'<html>independent-denial</html>'});});
  await page.locator(`[data-request-id="${target.id}"] .request-link`).click();await entered.promise;
  for(const source of ['focus','interval','focus']){const expected=count+1;await page.evaluate(s=>window.__CIVICMAPS_TEST_FIRE_REFRESH__(s),source);await expect.poll(()=>count).toBe(expected);await expect(page.getByRole('heading',{name:'Selected request unavailable'})).toBeVisible();await expect(page.locator('.detail button')).toHaveCount(1);await expect(page.locator('.detail')).not.toContainText('independent-denial');}
  gate.resolve();await finished.promise;await expect(page.getByRole('heading',{name:'Selected request unavailable'})).toBeVisible();await expect(page.locator('.detail button')).toHaveCount(1);
  const trace=await page.evaluate(()=>window.__CIVICMAPS_TEST_EVENTS__);const reads=trace.filter(e=>e.requestId===target.id&&['selection','refresh'].includes(e.operation));assert.equal(reads.length,4);assert.ok(reads.at(-1).requestGeneration>reads[0].requestGeneration);
  results.push({probe:'controlled-stale-success-persistent-html403',iteration,requestId:target.id,reads,passed:true});await context.close();
 }
}finally{await browser?.close();await vite?.close();await env?.close();await writeFile('/workspace/work/quality-audits/q3-fix5/independent-probes.json',JSON.stringify(results,null,2)+'\n');}
console.log(JSON.stringify(results,null,2));

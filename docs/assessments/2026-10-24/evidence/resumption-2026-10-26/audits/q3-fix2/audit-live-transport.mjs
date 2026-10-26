import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { requestJson, isRequestCancelled, isUncertainWriteError } from './published/apps/shared/api-transport.mjs';
let commits=0;
const server=createServer((req,res)=>{
 const url=new URL(req.url,'http://loopback');
 if(url.pathname==='/commit') {commits++;res.writeHead(201,{'content-type':'application/json'});res.end('');return;}
 res.writeHead(Number(url.searchParams.get('status'))||200,{'content-type':'text/html'});
 if(url.pathname==='/stall') {res.flushHeaders();return;}
 res.end('<html>private upstream diagnostic</html>');
});
server.listen(0,'127.0.0.1');await once(server,'listening');const origin=`http://127.0.0.1:${server.address().port}`;
try {
 for(const status of [401,403,503]) {
 await assert.rejects(requestJson(origin,`/html?status=${status}`),e=>e.status===status&&!e.message.includes('private upstream'));
 await assert.rejects(requestJson(origin,`/stall?status=${status}`,{},100),e=>e.status===status&&e.kind==='timeout');
 }
 const controller=new AbortController();const pending=requestJson(origin,'/stall',{signal:controller.signal},1000);setTimeout(()=>controller.abort(),50);await assert.rejects(pending,isRequestCancelled);
 await assert.rejects(requestJson(origin,'/commit',{method:'POST',body:'{}'}),e=>e.status===201&&isUncertainWriteError(e));assert.equal(commits,1);
 console.log(JSON.stringify({pass:true,realLoopbackHttp:true,statuses:[401,403,503],cases:['safe HTML rejection','stalled response-body deadline preserves received status','caller cancellation','server-committed empty 201 classified uncertain'],commitCount:commits}));
} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}

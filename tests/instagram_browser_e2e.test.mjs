import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync,spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import net from 'node:net';
import fs from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function browserPath(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{const resolved=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:2000}).trim();
   if(resolved&&fs.existsSync(resolved))return resolved;
  }catch{}
 }
 return null;
}
async function unusedPort(){
 const server=net.createServer();
 await new Promise((ok,no)=>server.once('error',no).listen(0,'127.0.0.1',ok));
 const port=server.address().port;await new Promise(ok=>server.close(ok));return port;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('Headless mobile browser: in-page comment selection, reviewed draft, manual composer insertion and unknown-case hold', {timeout:30000},async t=>{
 const chrome=browserPath();
 if(!chrome){t.skip('Chrome/Chromium is not installed on this test runner');return}
 const port=await unusedPort(),url='http://127.0.0.1:'+port+'/instagram-demo.html?selftest=1';
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<60;i++){
   try{const res=await fetch(url);if(res.ok){ready=true;break}}catch{}
   await sleep(70);
  }
  assert.equal(ready,true,'Local demo HTTP server did not start');
  const result=spawnSync(chrome,[
   '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--no-first-run','--no-default-browser-check','--hide-scrollbars',
   '--window-size=390,844','--virtual-time-budget=6000','--dump-dom',url
  ],{encoding:'utf8',timeout:21000,maxBuffer:3_000_000});
  if(result.error)throw result.error;
  const dom=result.stdout||'';
  const report=dom.match(/<output[^>]*id="av-e2e-report"[^>]*>[\s\S]{0,450}?<\/output>/)?.[0]||dom.slice(-900);
  assert.equal(result.status,0,'Headless browser could not launch. '+(result.stderr||'').slice(-1200));
  assert.match(dom,/data-status="pass"/,'Integration browser test failed: '+report+' \n'+(result.stderr||'').slice(-500));
  assert.match(dom,/PASS: four distinct voices, no blocking overlay/,'No successful browser assertion: '+report);
 }finally{server.kill('SIGTERM')}
});

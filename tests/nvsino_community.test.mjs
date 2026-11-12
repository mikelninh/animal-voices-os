import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const page=fs.readFileSync(path.join(root,'nvsino.html'),'utf8');
const css=fs.readFileSync(path.join(root,'nvsino.css'),'utf8');
const js=fs.readFileSync(path.join(root,'nvsino.js'),'utf8');
const simulator=fs.readFileSync(path.join(root,'instagram-simulator.js'),'utf8');
const simPage=fs.readFileSync(path.join(root,'instagram-demo.html'),'utf8');
test('Independent NVSINO test is transparent, no registration, 3 interactive deep links',()=>{
 assert.match(page,/Keine offizielle NVSINO-Seite oder Kooperation/);
 assert.match(page,/NVSINO-COMMUNITY/);
 assert.match(page,/ohne Anmeldung/);
 for(const scene of ['rage','taste','ethics'])assert.ok(page.includes('scene='+scene+'&amp;c=0&amp;source=nvsino'),scene);
 for(const id of ['start-challenge','copy-feedback','feedback-status','note'])assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(page,/property="og:title"/);
 assert.match(page,/property="og:description"/);
 assert.match(page,/property="og:image"/);
 assert.match(css,/@media\(max-width:640px\)/);
});
test('Feedback is explicitly opt-in, local until copied, and no secret data transport',()=>{
 assert.match(js,/navigator\.clipboard\.writeText/);
 assert.match(js,/input\[name="rating"\]:checked/);
 assert.match(js,/NVSINO Community-Test/);
 assert.doesNotMatch(js,/\bfetch\s*\(|sendBeacon|XMLHttpRequest|localStorage|\.submit\(/);
 assert.doesNotMatch(js,/instagram\.com\/api\/v1|graph\.facebook\.com/);
 assert.match(simulator,/source'\)==='nvsino'/);
 assert.match(simPage,/id="sim-nvsino-back" hidden/);
 assert.match(simulator,/nvsino\.html\?scene=/);
});
function bin(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{const b=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:2000}).trim();if(b&&fs.existsSync(b))return b}catch{}
 }
 return null;
}
async function port(){const x=net.createServer();await new Promise((ok,no)=>x.once('error',no).listen(0,'127.0.0.1',ok));const p=x.address().port;await new Promise(ok=>x.close(ok));return p}
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
test('Chromium mobile: NVSINO invitation loads, checks all three scenarios, and allows rating draft without posting',{timeout:38000},async t=>{
 const chrome=bin();if(!chrome){t.skip('Chrome not installed');return}
 const p=await port(),url='http://127.0.0.1:'+p+'/nvsino.html?selftest=1&scene=ethics';
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(p)},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<75;i++){try{const r=await fetch(url);if(r.ok){ready=true;break}}catch{}await sleep(70)}
  assert.ok(ready,'Server not ready');
  const r=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--window-size=390,844','--virtual-time-budget=3500','--dump-dom',url],
    {encoding:'utf8',timeout:29000,maxBuffer:3_000_000});
  if(r.error)throw r.error;
  assert.equal(r.status,0,(r.stderr||'').slice(-800));
  const dom=r.stdout||'';
  const report=dom.match(/<output[^>]*id="nvsino-selftest"[^>]*>[\s\S]{0,400}?<\/output>/)?.[0];
  assert.match(dom,/id="nvsino-selftest"[^>]*data-status="pass"/,'NVSINO mobile test failed: '+report);
  assert.match(dom,/name="scene" value="ethics"/,'Ethics scenario should be available');
 }finally{server.kill('SIGTERM')}
});

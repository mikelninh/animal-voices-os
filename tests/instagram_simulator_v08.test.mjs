import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn,spawnSync} from 'node:child_process';
import net from 'node:net';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'simulator-scenarios.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'instagram-demo.html'),'utf8');
const css=fs.readFileSync(path.join(root,'instagram-simulator.css'),'utf8');
const js=fs.readFileSync(path.join(root,'instagram-simulator.js'),'utf8');
const core=requireLike();
function requireLike(){const m={exports:{}};new Function('module','window',fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8'))(m,undefined);return m.exports}
test('Eight explicitly fictional scenario posts and 24 unique conversations',()=>{
 assert.equal(data.scenarios.length,8);
 assert.match(data.source,/fictional/i);
 const ids=new Set(),comments=new Set();
 for(const scenario of data.scenarios){
  assert.ok(!ids.has(scenario.id));ids.add(scenario.id);
  assert.equal(scenario.comments.length,3,scenario.id);
  assert.ok(scenario.caption.length>=35);
  assert.ok(scenario.author.length>5);
  for(const c of scenario.comments){
   assert.ok(c.by&&c.text.length>=22);
   assert.ok(!comments.has(c.text),'duplicate comment '+c.text);comments.add(c.text);
  }
 }
 assert.equal(comments.size,24);
 for(const id of ['taste','ethics','rage','protein','rainforest','humour','rights','safety'])assert.ok(ids.has(id));
});
test('All scenarios render in the same browser Companion and are never a real Instagram account',()=>{
 assert.match(html,/id="sim-stories"/);
 assert.match(html,/id="sim-comments"/);
 assert.match(html,/id="sim-experience"/);
 assert.match(html,/42 Kommentar-Beispiele/);
 assert.match(html,/src="\/animal-voices\.user\.js\?v=0\.7\.0"/);
 assert.match(html,/src="\/instagram-simulator\.js\?v=0\.8\.0"/);
 assert.match(js,/const area=create\('textarea'\)/);
 assert.match(js,/sim-preview-btn/);
 assert.match(js,/data-av-sim-comment/);
 assert.match(js,/sim-rendered/);
 assert.match(js,/getElementById|const \$=id/);
 assert.ok(!/https?:\/\/(?:www\.)?instagram\.com\/api/.test(js));
 assert.ok(!/\bfetch\(['"]https?:\/\//.test(js));
 assert.match(css,/\.sim-stories/);
 assert.match(css,/\.sim-rendered/);
});
test('Relevant comments are routed and potentially dangerous ones are not automatically drafted',()=>{
 const first=data.scenarios.find(x=>x.id==='taste').comments[0];
 assert.equal(core.suggest(first.text).id,'taste');
 const rage=data.scenarios.find(x=>x.id==='rage').comments[0];
 assert.equal(core.moderate(rage.text).action,'optional_one');
 const safety=data.scenarios.find(x=>x.id==='safety').comments;
 assert.equal(core.suggest(safety[0].text).state,'report');
 assert.equal(core.suggest(safety[0].text).text,undefined);
 assert.equal(core.suggest(safety[1].text).state,'review');
 assert.equal(core.suggest(safety[2].text).state,'unknown');
});
function browserPath(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{const x=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:2000}).trim();if(x&&fs.existsSync(x))return x}catch{}
 }
 return null;
}
async function port(){const srv=net.createServer();await new Promise((ok,no)=>srv.once('error',no).listen(0,'127.0.0.1',ok));const p=srv.address().port;await new Promise(ok=>srv.close(ok));return p}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('Mobile Chromium runs scenario selection, native companion insertion, feed preview and harm-prevention states',{timeout:34000},async t=>{
 const chrome=browserPath();if(!chrome){t.skip('Chrome unavailable');return}
 const p=await port(),url='http://127.0.0.1:'+p+'/instagram-demo.html?selftestSimulator=1';
 const srv=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(p)},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<75;i++){try{const res=await fetch(url);if(res.ok){ready=true;break}}catch{}await sleep(70)}
  assert.equal(ready,true,'Simulator server unavailable');
  const r=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--no-first-run','--no-default-browser-check','--window-size=390,844',
   '--virtual-time-budget=8200','--dump-dom',url],{encoding:'utf8',timeout:27000,maxBuffer:4_500_000});
  if(r.error)throw r.error;
  assert.equal(r.status,0,(r.stderr||'').slice(-1300));
  const dom=r.stdout||'';
  const report=dom.match(/<output[^>]*id="av-simulator-selftest"[^>]*>[\s\S]{0,500}?<\/output>/)?.[0]||dom.slice(-1000);
  assert.match(dom,/id="sim-experience"[^>]*data-simulator-ready="true"/,'Scenarios not mounted');
  assert.match(dom,/id="av-simulator-selftest"[^>]*data-status="pass"/,'Simulator E2E: '+report);
  assert.match(dom,/PASS: eight scenarios, dynamic selection, four voices/,'End-to-end failed: '+report);
 }finally{srv.kill('SIGTERM')}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const landing=fs.readFileSync(path.join(root,'community.html'),'utf8');
const script=fs.readFileSync(path.join(root,'community-beta.js'),'utf8');
const sim=fs.readFileSync(path.join(root,'instagram-demo.html'),'utf8');
const simjs=fs.readFileSync(path.join(root,'instagram-simulator.js'),'utf8');
test('First-time homepage has one dominant start action, short direct examples and a genuine live preview',()=>{
 assert.match(landing,/id="start"/);
 assert.match(landing,/instagram-demo\.html\?scene=taste&amp;c=0|instagram-demo\.html\?scene=taste&c=0/);
 assert.match(landing,/data-landing-voice="momo"/);
 assert.match(landing,/data-landing-voice="kiki"/);
 assert.match(landing,/data-landing-voice="bao"/);
 assert.match(landing,/data-landing-voice="curious"/);
 assert.match(landing,/src="\/animal-voices\.user\.js\?v=0\.7\.0"/);
 assert.match(script,/AV_COMMUNITY_PREVIEW_CORE/);
 const head=landing.slice(0,landing.indexOf('<section class="demo-feature">'));
 assert.ok(head.indexOf('<section class="scenarios">')>head.indexOf('<section class="hero">'),'Three test choices should be immediately visible after introduction');
 const hero=landing.slice(landing.indexOf('<section class="hero">'),landing.indexOf('</section>',landing.indexOf('<section class="hero">')));
 assert.ok(!hero.includes('id="share"'),'Sharing must not compete with primary start action');
 assert.match(landing,/id="share"/);
});
test('First-time simulator opens the real existing reply panel and shows a clear 3-step journey',()=>{
 for(const id of ['sim-guide','sim-guide-step','sim-guide-comment','sim-guided-start','sim-guide-help'])
  assert.ok(sim.includes('id="'+id+'"'),id);
 assert.match(simjs,/function wireGuide\(\)/);
 assert.match(simjs,/button\.click\(\);advanceGuide\(2\)/);
 assert.match(simjs,/advanceGuide\(3\)/);
 assert.match(simjs,/advanceGuide\(4\)/);
 assert.match(simjs,/scenarios\[\(index\+1\)%scenarios\.length\]/);
 assert.match(sim,/42 Kommentar-Beispiele/);
 assert.match(sim,/NICHT Instagram/);
});
function chrome(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{const f=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:1800}).trim();if(f&&fs.existsSync(f))return f}catch{}
 }return null;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function port(){const n=net.createServer();await new Promise((ok,no)=>n.once('error',no).listen(0,'127.0.0.1',ok));const p=n.address().port;await new Promise(ok=>n.close(ok));return p}
async function browserTest(t,urlPath,selftestId,passMessage){
 const bin=chrome();if(!bin){t.skip('Chromium not installed');return}
 const p=await port(),url='http://127.0.0.1:'+p+urlPath;
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(p)},stdio:'ignore'});
 try{
  let ready=false;for(let i=0;i<65;i++){try{const r=await fetch(url);if(r.ok){ready=true;break}}catch{}await sleep(70)}
  assert.equal(ready,true,'Local server unavailable');
  const proc=spawnSync(bin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--window-size=390,844','--virtual-time-budget=7100','--dump-dom',url],
   {encoding:'utf8',timeout:26000,maxBuffer:4_000_000});
  if(proc.error)throw proc.error;
  assert.equal(proc.status,0,(proc.stderr||'').slice(-900));
  const dom=proc.stdout||'',report=dom.match(new RegExp('<output[^>]*id="'+selftestId+'"[^>]*>[\\s\\S]{0,500}?<\\/output>'))?.[0]||dom.slice(-1300);
  assert.match(dom,new RegExp('id="'+selftestId+'"[^>]*data-status="pass"'),'First-run test: '+report);
  assert.ok(dom.includes(passMessage),'Missing expected success: '+report);
 }finally{server.kill('SIGTERM')}
}
test('Real mobile browser: landing allows choosing genuinely distinct German and English replies', {timeout:34000}, t=>
 browserTest(t,'/community.html?selftestLanding=1','av-landing-selftest','PASS: first-run landing'));
test('Real mobile browser: first-tap guided action opens comment coach, inserts reply, previews and continues', {timeout:34000},t=>
 browserTest(t,'/instagram-demo.html?selftestFirstRun=1','av-first-run-selftest','PASS: one tap opens real reply panel'));

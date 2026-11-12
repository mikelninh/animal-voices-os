import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn,spawnSync} from 'node:child_process';
import net from 'node:net';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const core=require('../animal-voices.user.js');
const development=JSON.parse(fs.readFileSync(path.join(root,'challenge-cases.json'),'utf8'));
const stress=JSON.parse(fs.readFileSync(path.join(root,'stress-cases.json'),'utf8'));
const page=fs.readFileSync(path.join(root,'challenge.html'),'utf8');
const js=fs.readFileSync(path.join(root,'challenge.js'),'utf8');
const css=fs.readFileSync(path.join(root,'challenge.css'),'utf8');
function evaluate(c){
 const m=core.moderate(c.comment),s=core.suggest(c.comment);
 const actualAction=m.action==='answer'?(s.state==='reviewed'?'answer':'review'):m.action;
 const result={action:actualAction===c.expected_action,language:core.language(c.comment)===c.language,
  topic:c.expected_action!=='answer'||s.id===c.expected_topic};
 return {...result,pass:result.action&&result.language&&result.topic,actualAction,s};
}
test('Benchmark datasets are complete, separately frozen, and never claim real Instagram sampling',()=>{
 assert.equal(development.cases.length,100);
 assert.equal(stress.cases.length,40);
 assert.match(development.method,/synthetic|editorial|paraphrased/i);
 assert.match(stress.method,/frozen before measuring|manually labelled/i);
 const ids=new Set(),comments=new Set();
 for(const c of [...development.cases,...stress.cases]){
  assert.ok(!ids.has(c.id),'Duplicate case '+c.id);ids.add(c.id);
  assert.ok(!comments.has(c.comment),'Duplicate comment '+c.id);comments.add(c.comment);
  assert.ok(['de','en'].includes(c.language));
  assert.ok(['answer','review','report','boundary','optional_one','end'].includes(c.expected_action));
  assert.ok(c.comment.length>15);
  assert.equal(c.expected_action==='answer',!!c.expected_topic,'Expected topic should only exist for answer: '+c.id);
 }
});
test('Local development benchmark is 100/100 regression only, with no disguised AI use',()=>{
 const results=development.cases.map(evaluate);
 const misses=results.map((r,i)=>r.pass?null:development.cases[i].id+': '+JSON.stringify(r)).filter(Boolean);
 assert.deepEqual(misses,[]);
});
test('Stress remediation suite includes 40 labelled difficult scenarios',()=>{
 const results=stress.cases.map(evaluate);
 const misses=results.map((r,i)=>r.pass?null:stress.cases[i].id+': '+JSON.stringify({action:r.actualAction,lang:r.language,topic:r.s.id})).filter(Boolean);
 assert.deepEqual(misses,[]);
 assert.ok(stress.cases.filter(c=>c.expected_action!=='answer').length>=18);
});
test('Safety gates: indirect threats never get a public reply or a misleading reviewed badge',()=>{
 const threats=[
  'I hope you die for pushing this nonsense.',
  "I'm coming to your house to hurt you.",
  'I will kill you for posting this.',
  'Go back to your country!',
  'Du bist tot, wenn du noch mal so postest!'
 ];
 for(const input of threats){
  const m=core.moderate(input),s=core.suggest(input);
  assert.equal(m.action,'report',input);assert.equal(s.text,undefined,input);
 }
});
test('Bilingual and medical vulnerability holds override voice switching',()=>{
 for(const text of ['Ich bin schwanger, wie viel B12 soll ich nehmen?','My toddler needs a special medical diet.','Mein Baby ist krank und soll vegan essen.']){
  assert.equal(core.moderate(text).action,'review',text);
  for(const voice of ['momo','kiki','bao','curious']){
   const s=core.suggest(text,voice);
   assert.notEqual(s.state,'reviewed',text);
  }
 }
 for(const text of ['Why should animal suffering matter for our food choices?','Stupid vegan clown, go away!','Vegans cry harder 😂'])
  assert.equal(core.language(text),'en',text);
});
test('First party quality lab is wired to live computed scores and human-only blind reviews',()=>{
 assert.match(page,/id="score-overall"/);assert.match(page,/id="score-language"/);
 assert.match(page,/id="case-list"/);assert.match(page,/id="compare-a"/);
 assert.match(page,/id="compare-b"/);assert.match(page,/id="ai-consent"/);
 assert.match(page,/src="\/animal-voices.user.js\?v=0.7.0"/);
 assert.match(page,/src="\/challenge.js\?v=0.7.0"/);
 assert.match(js,/const core=window\.AV_CHALLENGE_CORE/);
 assert.match(fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8'),/AV_CHALLENGE_CORE=API/);
 assert.match(js,/fetch\('\/challenge-cases.json'/);
 assert.match(js,/fetch\('\/stress-cases.json'/);
 assert.match(js,/localStorage\.setItem\(KEY,JSON\.stringify\(reviews\)\)/);
 assert.match(js,/comment,consent:true/);
 assert.match(js,/if\(!el\('ai-consent'\)\.checked\)/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
 assert.doesNotMatch(js,/instagram\.com\/api\/v1\/|graph\.facebook\.com|\/media_publish/);
 assert.match(css,/@media\(max-width:700px\)/);
});
function chromePath(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{const x=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:2000}).trim();if(x&&fs.existsSync(x))return x}catch{}
 }
 return null;
}
async function port(){const server=net.createServer();await new Promise((ok,no)=>server.once('error',no).listen(0,'127.0.0.1',ok));const p=server.address().port;await new Promise(ok=>server.close(ok));return p}
const sleep=t=>new Promise(r=>setTimeout(r,t));
test('Chromium 390px mobile lab loads 100 cases, computes scores, switches filters and displays blind options', {timeout:32000},async t=>{
 const chrome=chromePath();if(!chrome){t.skip('No Chromium available');return}
 const p=await port(),url='http://127.0.0.1:'+p+'/challenge.html?selftest=1';
 const srv=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(p)},stdio:'ignore'});
 try{
  let ready=false;for(let i=0;i<75;i++){try{const r=await fetch(url);if(r.ok){ready=true;break}}catch{}await sleep(70)}
  assert.equal(ready,true,'Local server not ready');
  const r=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--window-size=390,844','--virtual-time-budget=6500','--dump-dom',url],
   {encoding:'utf8',timeout:26000,maxBuffer:4_000_000});
  if(r.error)throw r.error;assert.equal(r.status,0,(r.stderr||'').slice(-600));
  const dom=r.stdout||'',report=dom.match(/<output[^>]*id="av-challenge-selftest"[^>]*>[\s\S]{0,400}?<\/output>/)?.[0];
  assert.match(dom,/id="av-challenge-selftest"[^>]*data-status="pass"/,'Challenge UI test failed: '+report);
  assert.match(dom,/id="score-overall"[^>]*>100\/100</,'Expected computed 100-case development score');
  assert.match(dom,/PASS: dataset, actual scores, filters/);
 }finally{srv.kill('SIGTERM')}
});

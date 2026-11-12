import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import net from 'node:net';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'live.html'),'utf8');
const css=fs.readFileSync(path.join(root,'live.css'),'utf8');
const js=fs.readFileSync(path.join(root,'live.js'),'utf8');
const code=fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8');
test('Live UI includes real user consent, private editor code, model status, sources and four reply voices',()=>{
 for(const id of ['comment','analyse','run-ai','access','consent','decision-title','reply','source-summary',
  'sources','limitations','verification','helpful','needs-work','export','feedback-count'])
  assert.ok(html.includes('id="'+id+'"'),'Missing '+id);
 for(const voice of ['momo','kiki','bao','curious'])assert.match(html,new RegExp('data-voice="'+voice+'"'));
 assert.match(html,/src="\/animal-voices\.user\.js\?v=0\.6\.0"/);
 assert.match(html,/src="\/live\.js\?v=0\.6\.0"/);
 assert.match(code,/AV_LIVE_CORE=API/);
 assert.ok(css.includes('.layout{display:grid'));
 assert.match(js,/fetch\('\/api\/coach'/);
 assert.match(js,/if\(!\$\(\'consent\'\)\.checked\)/);
 assert.ok(js.includes('data.scientifically_verified!==false'));
 assert.match(js,/const STORAGE='avos-live-feedback-v1'/);
});
test('Live UI does not store access tokens, raw comments, screenshots or auto-publish',()=>{
 assert.doesNotMatch(js,/localStorage\.setItem\([^)]*(?:access|comment|editor)/i);
 assert.doesNotMatch(js,/(?:store|save|persist)[A-Za-z]*\(.*(?:editorCode|accessCode|access\\.value)/);
 assert.ok(!js.includes('instagram.com/api/v1/')&&!js.includes('graph.facebook.com')&&!js.includes('/media_publish'));
 assert.doesNotMatch(html,/form action="https?:\/\/www\.instagram\.com/);
 assert.match(js,/localStorage\.setItem\(STORAGE,JSON\.stringify\(feedback\)\)/);
 assert.match(js,/new Blob\(\[JSON\.stringify\(data,null,2\)\]/);
});
test('Live AI request checks consent and comment with safe fallback to curated data',()=>{
 assert.ok(js.includes('m=core.moderate(comment,flag)'));
 assert.match(js,/if\(m\.action!==['"]answer['"]\)/);
 assert.match(js,/credentials:'same-origin'/);
 assert.match(js,/method:'POST'/);
 assert.match(js,/body:JSON\.stringify\(\{comment,consent:true\}\)/);
 assert.match(js,/controller\.abort\(\)/);
 assert.match(js,/resetAI\(\)/);
 assert.match(js,/sources\.replaceChildren\(\)/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
function browserPath(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{
   const resolved=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:2000}).trim();
   if(resolved&&fs.existsSync(resolved))return resolved;
  }catch{}
 }
 return null;
}
async function port(){const srv=net.createServer();await new Promise((ok,no)=>srv.once('error',no).listen(0,'127.0.0.1',ok));const p=srv.address().port;await new Promise(ok=>srv.close(ok));return p}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('Mobile Chromium runs the real local recommendation UI without any AI call', {timeout:31000},async t=>{
 const chrome=browserPath();if(!chrome){t.skip('Chromium not installed');return}
 const p=await port(),url='http://127.0.0.1:'+p+'/live.html';
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(p)},stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<75;i++){try{const r=await fetch(url);if(r.ok){ready=true;break}}catch{}await sleep(70)}
  assert.equal(ready,true,'Static server failed');
  const res=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--window-size=390,844','--virtual-time-budget=2800','--dump-dom',url],
   {encoding:'utf8',timeout:18000,maxBuffer:3000000});
  if(res.error)throw res.error;
  const dom=res.stdout||'';
  assert.equal(res.status,0,(res.stderr||'').slice(-900));
  assert.match(dom,/data-av-ready="true"/,'Local JS did not initialise');
  assert.match(dom,/id="reply"[^>]*>[\s\S]{40,1200}(?:Geschmack|Tiere|Essen|pflanzlich)/,
   'Expected a substantive local reply to the prefilled taste comment');
  assert.match(dom,/id="decision-title"[^>]*>[^<]{5,}/,'No moderation advice');
  assert.doesNotMatch(dom,/data-av-ready="error"/);
 }finally{server.kill('SIGTERM')}
});

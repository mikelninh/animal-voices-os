import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const core=require('../animal-voices.user.js');
const page=fs.readFileSync(path.join(root,'try.html'),'utf8');
const script=fs.readFileSync(path.join(root,'try.js'),'utf8');
const stylesheet=fs.readFileSync(path.join(root,'try.css'),'utf8');
const userscript=fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8');
test('Pilot is one complete no-login experience: comment, choice, preview and voluntary evaluation',()=>{
 for(const id of ['challenge','scenario-row','post-user','comment-text','analyze','result','recommend-title',
   'reply-options','reply-text','preview','preview-section','preview-reply','feedback','feedback-title',
   'share-feedback','copy-feedback','share-test','own-editor','own-comment','input-status'])
  assert.ok(page.includes('id="'+id+'"'),'Missing '+id);
 assert.match(page,/Ohne Anmeldung/);
 assert.match(page,/Keine echten Posts/);
 assert.match(page,/nicht mitgeschickt/);
 assert.match(page,/source-links/);
 assert.match(page,/community-code\.html/);
 assert.match(page,/src="\/animal-voices\.user\.js\?v=1\.4\.0"/);
 assert.match(page,/src="\/try\.js\?v=1\.1\.0"/);
 assert.match(userscript,/AV_PILOT_CORE=API/);
 assert.match(stylesheet,/@media\(max-width:640px\)/);
});
test('Public pilot sends no comment automatically and does not store raw user comments or reviews',()=>{
 assert.match(script,/window\.AV_PILOT_CORE/);
 assert.match(script,/core\.moderate\(text\)/);
 assert.match(script,/core\.suggest\(text,state\.voice\)/);
 assert.match(script,/if\(privatePattern\.test\(text\)\)/);
 assert.match(script,/if\(privatePattern\.test\(note\)\)/);
 assert.match(script,/if\(!state\.vote\)return null/);
 assert.match(script,/navigator\.clipboard\.writeText/);
 assert.match(script,/https:\/\/wa\.me\/\?text=/);
 assert.doesNotMatch(script,/localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest/);
 assert.doesNotMatch(script,/fetch\s*\(|\.submit\s*\(/);
 assert.doesNotMatch(script,/instagram\.com\/api|graph\.facebook\.com/);
 assert.match(page,/Der Originalkommentar wird nicht mitgeschickt/);
});
test('Ragebait, privacy and threats are not treated like easy answers',()=>{
 const examples={
  rage:'Wegen euch esse ich heute zwei extra Steaks!',
  threat:'Ich werde dich töten, wenn du antwortest!',
  privacy:'Schreib bitte @private.person an'
 };
 assert.equal(core.moderate(examples.rage).action,'optional_one');
 assert.equal(core.moderate(examples.threat).action,'report');
 assert.equal(core.suggest(examples.threat).text,undefined);
 assert.equal(core.moderate(examples.privacy).action,'review');
 for(const voice of ['momo','kiki','bao','curious']){
  const a=core.suggest('Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?',voice);
  assert.equal(a.state,'reviewed');
  assert.ok(a.text?.length>25);
 }
});
function chrome(){
 for(const name of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{const p=name.includes('/')?name:execFileSync('which',[name],{encoding:'utf8',timeout:1500}).trim();if(p&&fs.existsSync(p))return p}catch{}
 }
 return null;
}
async function port(){const s=net.createServer();await new Promise((ok,no)=>s.once('error',no).listen(0,'127.0.0.1',ok));const p=s.address().port;await new Promise(ok=>s.close(ok));return p}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function e2e(t,suffix,requiresNvsino){
 const bin=chrome();if(!bin){t.skip('No Chromium installed');return}
 const p=await port(),url='http://127.0.0.1:'+p+'/try.html?selftest=1'+suffix;
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(p)},stdio:'ignore'});
 try{
  let up=false;for(let i=0;i<75;i++){try{const r=await fetch(url);if(r.ok){up=true;break}}catch{}await sleep(60)}
  assert.equal(up,true,'Local server not responding');
  const r=spawnSync(bin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--no-first-run','--no-default-browser-check','--window-size=390,844','--virtual-time-budget=5200','--dump-dom',url],
   {encoding:'utf8',timeout:24000,maxBuffer:3_000_000});
  if(r.error)throw r.error;
  assert.equal(r.status,0,(r.stderr||'').slice(-750));
  const dom=r.stdout||'';
  const report=dom.match(/<output[^>]*id="av-pilot-selftest"[^>]*>[\s\S]{0,700}?<\/output>/)?.[0]||dom.slice(-1100);
  assert.match(dom,/data-pilot-ready="true"/,'Pilot scripts failed to start: '+report);
  assert.match(dom,/id="av-pilot-selftest"[^>]*data-status="pass"/,'Pilot first-user E2E failed: '+report);
  assert.match(dom,/PASS: first action, direct feedback, voice reset, four voices, preview/);
  if(requiresNvsino)assert.match(dom,/UNABHÄNGIGER TEST FÜR MENSCHEN AUS DER NVSINO-COMMUNITY/);
 }finally{server.kill('SIGTERM')}
}
test('Mobile browser completes first-time public pilot (comment → voice → preview → feedback)',{timeout:34000},async t=>e2e(t,'',false));
test('Mobile browser keeps independent NVSINO framing and same safe working flow',{timeout:34000},async t=>e2e(t,'&from=nvsino',true));

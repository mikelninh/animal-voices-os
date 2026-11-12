import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import net from 'node:net';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const page=fs.readFileSync(path.join(root,'community.html'),'utf8');
const css=fs.readFileSync(path.join(root,'community-beta.css'),'utf8');
const js=fs.readFileSync(path.join(root,'community-beta.js'),'utf8');
const sim=fs.readFileSync(path.join(root,'instagram-simulator.js'),'utf8');
const simHtml=fs.readFileSync(path.join(root,'instagram-demo.html'),'utf8');
test('Public beta landing offers no-login onboarding, 3 deep-linked situations and honest attribution',()=>{
 for(const path of [
 '/instagram-demo.html?scene=taste&c=0',
 '/instagram-demo.html?scene=rage&c=0',
 '/instagram-demo.html?scene=ethics&c=0'
 ])assert.ok(page.includes(path),path);
 for(const id of ['start','share','whatsapp','copy','lang','share-status'])assert.ok(page.includes('id="'+id+'"'),id);
 assert.match(page,/Kein Login/);
 assert.match(page,/Keine Installation/);
 assert.match(page,/Keine echten Posts/);
 assert.match(page,/fiktive Instagram-Stil-Simulation/);
 assert.match(page,/name="description"/);
 assert.match(page,/property="og:title"/);
 assert.match(page,/property="og:description"/);
 assert.match(page,/property="og:image"/);
 assert.match(page,/community-beta\.css\?v=1\.0\.0/);
 assert.match(page,/community-beta\.js\?v=1\.0\.0/);
 assert.match(css,/@media\(max-width:650px\)/);
});
test('Share links are deliberately user-triggered and never publish or transmit private comment text',()=>{
 assert.match(js,/navigator\.share/);
 assert.match(js,/https:\/\/wa\.me\/\?text=/);
 assert.match(js,/navigator\.clipboard\.writeText/);
 assert.match(js,/animal-voices-os\.vercel\.app\/community\.html/);
 assert.doesNotMatch(js,/\bfetch\s*\(/);
 assert.doesNotMatch(js,/sendBeacon|XMLHttpRequest|localStorage/);
 assert.doesNotMatch(js,/instagram\.com\/api\/v1|graph\.facebook\.com/);
 assert.match(sim,/lastFeedback=null/);
 assert.match(sim,/sceneLink\(lastFeedback\.scenario/);
 assert.ok(!/https?:\/\/(?:www\.)?instagram\.com\/api/.test(sim));
});
test('Visitor can create one safe comment locally, share a scenario and return to it',()=>{
 assert.match(simHtml,/id="sim-custom-input"/);
 assert.match(simHtml,/id="sim-add-comment"/);
 assert.match(simHtml,/id="sim-share-scenario"/);
 assert.match(simHtml,/id="sim-share-feedback"/);
 assert.match(simHtml,/id="sim-copy-link"/);
 assert.match(sim,/data-custom-comment/);
 assert.match(sim,/history\.replaceState/);
 assert.match(sim,/sceneLink\(id=active,commentIndex=null\)/);
 assert.match(sim,/scene=rage/);
 assert.match(simHtml,/Alle Posts und Konten sind fiktiv/);
 assert.match(sim,/nothing published or sent to Instagram/);
});
function browserPath(){
 for(const p of [process.env.CHROME_BIN,'google-chrome-stable','google-chrome','chromium','chromium-browser'].filter(Boolean)){
  try{
   const path=p.includes('/')?p:execFileSync('which',[p],{encoding:'utf8',timeout:2000}).trim();
   if(path&&fs.existsSync(path))return path;
  }catch{}
 }
 return null;
}
async function freePort(){const srv=net.createServer();await new Promise((ok,no)=>srv.once('error',no).listen(0,'127.0.0.1',ok));const port=srv.address().port;await new Promise(ok=>srv.close(ok));return port}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('Mobile browser loads public beta without login with working bilingual page', {timeout:28000}, async t=>{
 const chrome=browserPath();if(!chrome){t.skip('Chromium unavailable');return}
 const port=await freePort(),url='http://127.0.0.1:'+port+'/community.html?lang=en';
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 try{
  let ready=false;for(let i=0;i<75;i++){try{const response=await fetch(url);if(response.ok){ready=true;break}}catch{}await sleep(75)}
  assert.equal(ready,true);
  const r=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--window-size=390,844','--virtual-time-budget=2500','--dump-dom',url],
   {encoding:'utf8',timeout:19000,maxBuffer:3_000_000});
  if(r.error)throw r.error;assert.equal(r.status,0,(r.stderr||'').slice(-700));
  const dom=r.stdout||'';
  assert.match(dom,/data-beta-ready="true"/);
  assert.match(dom,/<html lang="en">/);
  assert.match(dom,/Try it for free/);
  assert.match(dom,/Share on WhatsApp/);
  assert.match(dom,/instagram-demo\.html\?scene=taste&amp;c=0&amp;lang=en/);
 }finally{server.kill('SIGTERM')}
});
test('Mobile browser opens shared ragebait link, highlights the target and tests a new private comment locally',{timeout:33000},async t=>{
 const chrome=browserPath();if(!chrome){t.skip('Chromium unavailable');return}
 const port=await freePort(),url='http://127.0.0.1:'+port+'/instagram-demo.html?scene=rage&c=0&selftestCommunity=1';
 const server=spawn(process.execPath,['server.cjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:'ignore'});
 try{
  let ready=false;for(let i=0;i<75;i++){try{const response=await fetch(url);if(response.ok){ready=true;break}}catch{}await sleep(75)}
  assert.equal(ready,true);
  const r=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu',
   '--window-size=390,844','--virtual-time-budget=7000','--dump-dom',url],
   {encoding:'utf8',timeout:23000,maxBuffer:4_000_000});
  if(r.error)throw r.error;assert.equal(r.status,0,(r.stderr||'').slice(-900));
  const dom=r.stdout||'';
  const output=dom.match(/<output[^>]*id="av-community-selftest"[^>]*>[\s\S]{0,450}?<\/output>/)?.[0]||dom.slice(-900);
  assert.match(dom,/id="av-community-selftest"[^>]*data-status="pass"/,'Community E2E: '+output);
  assert.match(dom,/PASS: shareable deep link, highlighted comment/,'Community success message missing: '+output);
 }finally{server.kill('SIGTERM')}
});

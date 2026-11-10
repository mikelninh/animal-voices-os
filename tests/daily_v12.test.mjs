import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DATA=require('../knowledge.json');
const T=require('../triage.js'),F=require('../context-fit.js'),E=require('../engine.js'),S=require('../strategy-core.js');
const corpus=require('../upgrade-cases.json').cases;
const js=fs.readFileSync(path.join(root,'daily.js'),'utf8');
const html=fs.readFileSync(path.join(root,'daily.html'),'utf8');
const css=fs.readFileSync(path.join(root,'daily.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
function mount(online=true){
 const els=new Map(),copied=[],requests=[];
 const el=id=>{
  if(els.has(id))return els.get(id);
  const callbacks={},attributes={},children=[];
  const obj={id,hidden:['daily-result','daily-hold','daily-ai-panel','daily-ai-comparison'].includes(id),
   disabled:id==='daily-copy'||id==='daily-reviewed',checked:false,value:'',textContent:'',src:'',href:'',dataset:{},
   children,classList:{toggle(){},remove(){},add(){}},
   addEventListener(k,fn){callbacks[k]=fn},
   setAttribute(k,v){attributes[k]=String(v)},
   getAttribute(k){return attributes[k]},
   fire(k){return callbacks[k]?.({target:obj,ctrlKey:false,metaKey:false,key:''})},
   append(...a){children.push(...a)},replaceChildren(...a){children.splice(0,children.length,...a)},
   scrollIntoView(){},focus(){},select(){},click(){return callbacks.click?.({target:obj})}};
  els.set(id,obj);return obj;
 };
 const voices=['momo','kiki','bao'].map(id=>{const v=el('voice-'+id);v.dataset.voice=id;return v});
 const samples=['protein','crop','soy'].map(id=>{const b=el('sample-'+id);b.dataset.sample=id;return b});
 const goals=['connect','clarify','explore','act'].map(id=>{const b=el('goal-'+id);b.dataset.goal=id;return b});
 const rates=['post','preachy','missed','long','evidence'].map(id=>{const b=el('rate-'+id);b.dataset.rate=id;return b});
 const document={
  getElementById:el,createElement:t=>el('created-'+t+'-'+Math.random()),
  querySelectorAll:s=>s==='[data-voice]'?voices:s==='[data-sample]'?samples:s==='[data-rate]'?rates:s==='[data-goal]'?goals:[]
 };
 const storage=new Map();
 const fetch=async (url,options={})=>{
  requests.push({url,options});
  if(url==='/api/status')return{ok:true,json:async()=>({ok:true,available:online})};
  if(url==='/api/assist')return{ok:true,json:async()=>({
    ok:true,improved:true,topic_id:'protein',goal:JSON.parse(options.body).goal,
    reply:'Linsen, Bohnen und Tofu liefern Protein. Mit einer passenden Auswahl kannst du deinen Bedarf auch ohne Fleisch decken. 💪',
    source_links:[{id:'hevia'}],changes:['Kürzer und konkreter'],model_reviewed:true,scientifically_verified:false
  })};
  throw Error('Unexpected '+url);
 };
 const context={window:{AV_DATA:DATA,AV_TRIAGE:T,AV_CONTEXT_FIT:F,AV_ENGINE:E,AV_STRATEGIES:S},
  document,fetch,navigator:{clipboard:{writeText:async s=>copied.push(s)},serviceWorker:{register:async()=>true}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  URL,AbortController,Math,Date,JSON,console,setTimeout:()=>1,clearTimeout:()=>{}};
 vm.runInNewContext(js,context);
 return {el,voices,samples,rates,goals,requests,copied,storage};
}
async function settle(){for(let i=0;i<4;i++)await new Promise(r=>setImmediate(r))}
test('Daily home keeps the full studio, mobile PWA and offline shell',()=>{
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 assert.match(index,/location.replace\('\/daily.html'/);
 assert.match(index,/!q.has\('inbox'\)/);
 assert.equal(manifest.start_url,'/phone.html?source=pwa');
 assert.match(sw,/animal-voices-v14-shell-1/);
 for(const asset of ['daily.html','daily.css','daily.js','strategy-core.js'])assert.ok(sw.includes('/'+asset));
 assert.match(css,/@media\(max-width:440px\)/);
 assert.match(html,/href="\/\?studio=1#dialog"/);
});
test('Daily UI holds one main action, editable answer, source gate and optional private AI',()=>{
 for(const id of ['daily-comment','daily-analyze','daily-result','daily-reply','daily-sources','daily-reviewed','daily-copy','daily-code','daily-consent','daily-ai-run','daily-ai-proposal'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/type="password" autocomplete="off"/);
 assert.match(js,/credentials:'same-origin'/);
 assert.match(js,/state.sourceOpened/);
 assert.match(js,/x-avos-editor/);
 assert.match(js,/consent:true,mode:'improve'/);
 assert.doesNotMatch(js,/graph.facebook|publish_comment|localStorage.setItem\([^,]*daily-code/);
});
test('All twenty editorial cases load a source-backed answer and correct topic',async()=>{
 const a=mount(false);await settle();
 assert.equal(a.requests.filter(x=>x.url==='/api/assist').length,0);
 for(const c of corpus){
  a.el('daily-comment').value=c.comment;
  a.el('daily-analyze').fire('click');
  assert.equal(a.el('daily-result').hidden,false,'Result '+c.id);
  assert.equal(a.el('daily-hold').hidden,true,'No hold '+c.id);
  assert.ok(a.el('daily-reply').value.length>=40,c.id);
  assert.equal(a.el('daily-copy').disabled,true,c.id);
  assert.ok(a.el('daily-sources').children.length>0,c.id);
  assert.ok(S.GOALS[a.goals.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.goal],c.id);
 }
});
test('Opening source alone is not verification; checked review enables copy, edits reset it',async()=>{
 const a=mount(false);await settle();
 a.el('daily-comment').value='Woher bekommst du Protein ohne Fleisch?';
 a.el('daily-analyze').fire('click');
 assert.equal(a.el('daily-reviewed').disabled,true);
 a.el('daily-sources').children[0].fire('click');
 assert.equal(a.el('daily-reviewed').disabled,false);
 assert.equal(a.el('daily-copy').disabled,true);
 a.el('daily-reviewed').checked=true;a.el('daily-reviewed').fire('change');
 assert.equal(a.el('daily-copy').disabled,false);
 await a.el('daily-copy').fire('click');await settle();
 assert.equal(a.copied.length,1);
 assert.equal(a.copied[0],a.el('daily-reply').value);
 a.el('daily-reply').value+=' noch ein Satz';
 a.el('daily-reply').fire('input');
 assert.equal(a.el('daily-reviewed').disabled,true);
 assert.equal(a.el('daily-copy').disabled,true);
});
test('Private model is never called automatically; candidate requires consent and adoption resets review',async()=>{
 const a=mount(true);await settle();
 a.el('daily-comment').value='Woher bekommst du Protein ohne Fleisch?';a.el('daily-analyze').fire('click');
 a.el('daily-ai-open').fire('click');await settle();
 const original=a.el('daily-reply').value;
 a.el('daily-ai-run').fire('click');await settle();
 assert.equal(a.requests.filter(x=>x.url==='/api/assist').length,0);
 a.el('daily-code').value='test-private-editor-password';
 a.el('daily-consent').checked=true;
 await a.el('daily-ai-run').fire('click');await settle();
 const calls=a.requests.filter(x=>x.url==='/api/assist');
 assert.equal(calls.length,1);
 assert.equal(JSON.parse(calls[0].options.body).mode,'improve');
 assert.equal(a.el('daily-reply').value,original);
 assert.equal(a.el('daily-ai-comparison').hidden,false);
 a.el('daily-ai-use').fire('click');
 assert.notEqual(a.el('daily-reply').value,original);
 assert.equal(a.el('daily-copy').disabled,true);
 assert.equal(a.el('daily-reviewed').disabled,true);
 assert.equal(a.storage.size,0);
});
test('Private details and unsupported topics do not trigger AI and are held',async()=>{
 const a=mount(true);await settle();
 a.el('daily-comment').value='@privateUser sagt: Veganer sind schwach';
 a.el('daily-analyze').fire('click');
 assert.equal(a.el('daily-result').hidden,true);
 assert.match(a.el('daily-feedback').textContent,/Nutzernamen/);
 a.el('daily-comment').value='Kann ein Quantenfeld mein Auto reparieren?';
 a.el('daily-analyze').fire('click');
 assert.equal(a.el('daily-result').hidden,true);
 assert.equal(a.el('daily-hold').hidden,false);
 assert.equal(a.requests.filter(x=>x.url==='/api/assist').length,0);
});

test('Switching conversational strategy changes the actual answer and revokes source approval',async()=>{
 const a=mount(false);await settle();
 a.el('daily-comment').value='Sterben bei der Ernte nicht auch viele Tiere?';
 a.el('daily-analyze').fire('click');
 const initial=a.el('daily-reply').value;
 const selected=a.goals.find(x=>x.getAttribute('aria-pressed')==='true')?.dataset.goal;
 assert.equal(selected,'clarify');
 a.el('daily-sources').children[0].fire('click');
 a.el('daily-reviewed').checked=true;a.el('daily-reviewed').fire('change');
 assert.equal(a.el('daily-copy').disabled,false);
 a.goals.find(x=>x.dataset.goal==='connect').fire('click');
 assert.notEqual(a.el('daily-reply').value,initial);
 assert.match(a.el('daily-reply').value,/Feld|Tiere/);
 assert.equal(a.el('daily-reviewed').disabled,true);
 assert.equal(a.el('daily-copy').disabled,true);
 assert.equal(a.goals.find(x=>x.dataset.goal==='connect').getAttribute('aria-pressed'),'true');
 a.el('rate-preachy').fire('click');
 const entry=JSON.parse(a.storage.get('avos-v13-goal-feedback'))[0];
 assert.deepEqual({topic:entry.topic,goal:entry.goal,feedback:entry.feedback},
  {topic:'crop',goal:'connect',feedback:'preachy'});
 assert.ok(!a.storage.get('avos-v13-goal-feedback').includes('Sterben bei der Ernte'));
});
test('AI goal is sent only after consent and returned goal matches the selection',async()=>{
 const a=mount(true);await settle();
 a.el('daily-comment').value='Woher bekommst du Protein ohne Fleisch?';
 a.el('daily-analyze').fire('click');
 a.goals.find(x=>x.dataset.goal==='explore').fire('click');
 a.el('daily-ai-open').fire('click');await settle();
 a.el('daily-code').value='private-only-testing-code';a.el('daily-consent').checked=true;
 await a.el('daily-ai-run').fire('click');await settle();
 const calls=a.requests.filter(x=>x.url==='/api/assist');
 assert.equal(calls.length,1);
 assert.equal(JSON.parse(calls[0].options.body).goal,'explore');
 assert.equal(a.el('daily-ai-comparison').hidden,false);
});

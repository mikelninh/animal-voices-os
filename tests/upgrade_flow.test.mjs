import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataset=require('../upgrade-cases.json');
const knowledge=require('../knowledge.json');
const T=require('../triage.js'),F=require('../context-fit.js'),E=require('../engine.js');
const script=fs.readFileSync(path.join(root,'upgrade.js'),'utf8');
function mount(online=false){
 const els=new Map(),store=new Map(),requests=[];
 const make=id=>{
  if(els.has(id))return els.get(id);
  const callbacks={},classes=new Set();let html='';
  const e={id,value:'',textContent:'',checked:false,hidden:false,disabled:false,files:null,style:{},dataset:{},href:'',
   get innerHTML(){return html},set innerHTML(v){html=String(v);if(id==='case-select'){const m=html.match(/<option value="([^"]+)"/);if(m)e.value=m[1];}},
   classList:{add(c){classes.add(c)},remove(c){classes.delete(c)},contains(c){return classes.has(c)},toggle(c,on){if(on===false)classes.delete(c);else if(on===true)classes.add(c);else if(classes.has(c))classes.delete(c);else classes.add(c)}},
   setAttribute(k,v){this[k]=v},appendChild(){},scrollIntoView(){},click(){this.fire('click')},
   addEventListener(k,fn){callbacks[k]=fn},fire(k,ev){if(!callbacks[k])throw Error('Handler missing '+id+' '+k);return callbacks[k](ev||{target:e})}
  };els.set(id,e);return e;
 };
 const votes=['a','b'].map(c=>{const e=make('vote-'+c);e.dataset={vote:c};return e});
 let savedBlob;
 const document={getElementById:make,
  querySelectorAll(s){return s==='[data-vote]'?votes:[]},
  querySelector(s){const m=s.match(/^\[data-vote="([ab])"\]$/);return m?votes[m[1]==='a'?0:1]:null},
  createElement(name){const e=make('created-'+name);e.click=()=>{};return e}
 };
 const fetch=async (url,init={})=>{
   requests.push({url,init});
   if(String(url).startsWith('./upgrade-cases.json'))return{ok:true,json:async()=>dataset};
   if(url==='/api/status')return{ok:true,json:async()=>({available:online})};
   if(url==='/api/assist'){
    const req=JSON.parse(init.body);
    return{ok:true,json:async()=>({ok:true,improved:true,topic_id:'strength',
      reply:'Diese verbesserte Testantwort respektiert die ursprüngliche Frage und die Studiengrenzen. Keine Studie wurde erfunden.',
      source_links:[{id:'strength'}],changes:['Weniger Wiederholungen']})};
   }
   throw Error('Unexpected request '+url);
 };
 const sandbox={window:{AV_DATA:knowledge,AV_TRIAGE:T,AV_CONTEXT_FIT:F,AV_ENGINE:E},document,localStorage:{
  getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))
 },fetch,Blob,URL:{createObjectURL:blob=>{savedBlob=blob;return'blob:test'},revokeObjectURL:()=>{}},
  confirm:()=>true,AbortController,setTimeout:()=>1,clearTimeout:()=>{},Math,Date,Array,Number,String,JSON,console};
 vm.runInNewContext(script,sandbox);
 return {el:make,store,requests,document,getBlob:()=>savedBlob};
}
const settle=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve))};
test('Without provider credentials user can still run editorial demo with honest zero AI metric',async()=>{
 const a=mount(false);await settle();
 assert.equal(a.el('generate-ai').disabled,true);
 assert.match(a.el('ai-availability').textContent,/nicht aktiviert/);
 assert.match(a.el('case-comment').textContent,/Muskeln/);
 assert.equal(a.el('comparison').hidden,true);
 a.el('generate-demo').fire('click');
 assert.equal(a.el('comparison').hidden,false);
 assert.notEqual(a.el('a-text').textContent,a.el('b-text').textContent);
 assert.equal(a.el('pair-kind').textContent,'Nur redaktionelle Demo');
 assert.equal(a.el('metric-ai').textContent,'0/20');
 assert.equal(a.el('save-review').disabled,true);
 a.el('vote-a').fire('click');
 assert.equal(a.el('save-review').disabled,false);
 a.el('save-review').fire('click');
 assert.equal(a.el('metric-rated').textContent,'1');
 const data=JSON.parse(a.store.get('avos-v11-upgrade-data'));
 assert.equal(data.votes.S01.method,'editorial_demo');
 assert.equal(data.drafts.S01.method,'editorial_demo');
 assert.equal(a.requests.filter(r=>r.url==='/api/assist').length,0);
});
test('Live candidate requires both private editor code and explicit opt-in',async()=>{
 const a=mount(true);await settle();
 assert.equal(a.el('generate-ai').disabled,true);
 a.el('editor-code').value='long-private-test-editor-code';
 a.el('editor-code').fire('input');
 assert.equal(a.el('generate-ai').disabled,true);
 a.el('ai-consent').checked=true;a.el('ai-consent').fire('change');
 assert.equal(a.el('generate-ai').disabled,false);
 await a.el('generate-ai').fire('click');await settle();
 const calls=a.requests.filter(r=>r.url==='/api/assist');
 assert.equal(calls.length,1);
 assert.equal(calls[0].init.headers['x-avos-editor'],'long-private-test-editor-code');
 const payload=JSON.parse(calls[0].init.body);
 assert.equal(payload.mode,'improve');
 assert.equal(payload.consent,true);
 assert.ok(payload.existingReply.length>40);
 assert.equal(a.el('metric-ai').textContent,'1/20');
 const stored=a.store.get('avos-v11-upgrade-data');
 assert.equal(stored.includes('long-private-test-editor-code'),false);
 assert.equal(JSON.parse(stored).drafts.S01.method,'live_ai');
});
test('Exported blind review pack removes which side is model-generated',async()=>{
 const a=mount(false);await settle();
 a.el('generate-demo').fire('click');
 a.el('export-pack').fire('click');
 const pack=JSON.parse(await a.getBlob().text());
 assert.equal(pack.schema,'avos-blind-pack-v1');
 assert.equal(pack.items.length,1);
 assert.equal(pack.items[0].id,'S01');
 assert.notEqual(pack.items[0].a,pack.items[0].b);
 assert.ok(!('mapping' in pack.items[0]));
 assert.ok(!('candidate' in pack.items[0]));
 assert.ok(!('baseline' in pack.items[0]));
 assert.ok(!JSON.stringify(pack).includes('editor-code'));
});
test('Imported peer review pack can be rated without any model credentials',async()=>{
 const a=mount(false);await settle();
 const official=dataset.cases[0],p={schema:'avos-blind-pack-v1',items:[{
  ...official,a:'A ist eine ausführliche sachlich überprüfbare Alternative zu der ersten Antwort.',
  b:'B ist eine andere sachliche und vorsichtige Formulierung derselben Frage.',method:'live_ai'
 }]};
 await a.el('import-pack').fire('change',{target:{files:[{size:900,text:async()=>JSON.stringify(p)}]}});await settle();
 assert.equal(a.el('generate-ai').disabled,true);
 assert.equal(a.el('generate-demo').disabled,true);
 assert.equal(a.el('comparison').hidden,false);
 a.el('vote-neither').fire('click');a.el('critical-error').checked=true;
 a.el('save-review').fire('click');
 const voted=JSON.parse(a.store.get('avos-v11-upgrade-data')).votes.S01;
 assert.equal(voted.choice,'neither');
 assert.equal(voted.critical,true);
 assert.equal(voted.winner,'neither');
});

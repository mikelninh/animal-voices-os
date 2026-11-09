import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const S=require('../strategy-core.js'),D=require('../knowledge.json'),cases=require('../upgrade-cases.json');
const script=fs.readFileSync(path.join(root,'strategy-lab.js'),'utf8');
const html=fs.readFileSync(path.join(root,'strategy-lab.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
function mount(){
 const els=new Map(),store=new Map(),requests=[];let exportBlob=null;
 function el(id){
  if(els.has(id))return els.get(id);
  const callbacks={},items=[];
  const obj={id,value:'',checked:false,hidden:false,disabled:false,textContent:'',
   children:items,setAttribute(k,v){this[k]=v},append(...v){items.push(...v)},
   replaceChildren(...v){items.splice(0,items.length,...v)},
   addEventListener(k,fn){callbacks[k]=fn},fire(k){return callbacks[k]?.({target:obj})},
   scrollIntoView(){},click(){return callbacks.click?.()}};
  els.set(id,obj);return obj;
 }
 const document={getElementById:el,createElement:name=>el('new-'+name+'-'+Math.random())};
 const fetch=async (url,options)=>{requests.push({url,options});assert.match(url,/^\/upgrade-cases\.json/);return{ok:true,json:async()=>cases}};
 const context={window:{AV_STRATEGIES:S,AV_DATA:D},document,fetch,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))},
  Blob,URL:{createObjectURL:b=>{exportBlob=b;return'blob:test'},revokeObjectURL(){}},
  setTimeout:()=>1,Date,Math,JSON,console};
 vm.runInNewContext(script,context);
 return {el,store,requests,getBlob:()=>exportBlob};
}
const settle=async()=>{for(let i=0;i<6;i++)await new Promise(r=>setImmediate(r))};
test('Strategy lab shows A/B without revealing underlying strategy until after vote',async()=>{
 const a=mount();await settle();
 assert.equal(a.el('lab-count').textContent,'0 / 20');
 assert.equal(a.el('lab-reveal').hidden,true);
 assert.notEqual(a.el('lab-answer-a').textContent,a.el('lab-answer-b').textContent);
 assert.ok(a.el('lab-comment').textContent.length>=15);
 assert.equal(a.requests.length,1);
 a.el('lab-vote-a').fire('click');
 assert.equal(a.el('lab-count').textContent,'1 / 20');
 assert.equal(a.el('lab-reveal').hidden,false);
 assert.match(a.el('lab-reveal-text').textContent,/A: .* · B:/);
 const record=JSON.parse(a.store.get('avos-v13-strategy-votes')).S01;
 assert.equal(record.method,'editorial_blind');
 assert.equal(record.choice,'a');assert.equal(record.winner,record.aGoal);
 assert.equal(record.originalSourcesReviewed,false);
 assert.equal(record.critical,false);
 assert.ok(!a.store.get('avos-v13-strategy-votes').includes('Kann man als veganer Mann'));
});
test('Neither is a real recorded outcome and critical flags can be set after voting',async()=>{
 const a=mount();await settle();
 a.el('lab-neither').fire('click');
 a.el('lab-critical').checked=true;a.el('lab-critical').fire('change');
 a.el('lab-issue').value='evidence';a.el('lab-issue').fire('change');
 const record=JSON.parse(a.store.get('avos-v13-strategy-votes')).S01;
 assert.equal(record.winner,'neither');assert.equal(record.critical,true);assert.equal(record.issue,'evidence');
 a.el('lab-next').fire('click');
 assert.match(a.el('lab-comment').textContent,/Fitnessstudio/);
 assert.equal(a.el('lab-count').textContent,'1 / 20');
});
test('Blind test has no remote analytics, AI calls, auto-posting or fake impact counters',()=>{
 assert.match(html,/id="lab-neither"/);
 assert.match(html,/id="lab-critical"/);
 assert.match(html,/synthetische Testkommentare/);
 assert.match(script,/schema:'avos-v13-strategy-votes'/);
 assert.match(script,/JSON\.stringify\(body,null,2\)/);
 assert.match(script,/PAIRS\[index%PAIRS.length\]/);
 assert.doesNotMatch(script,/\/api\/assist|graph\.facebook|sendBeacon|fetch\('https:\/\//);
 for(const file of ['strategy-lab.html','strategy-lab.js','strategy-lab.css','strategy-core.js'])assert.ok(sw.includes('/'+file));
});

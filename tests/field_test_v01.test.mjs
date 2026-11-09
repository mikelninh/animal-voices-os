import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cases=require('../field-cases.json');
const html=fs.readFileSync(path.join(root,'field-test.html'),'utf8');
const client=fs.readFileSync(path.join(root,'field-test.js'),'utf8');
function mount(){
 const els=new Map(),store=new Map(),requests=[];let exported=null;
 const el=id=>{
  if(els.has(id))return els.get(id);
  const callbacks={},items=[];
  const v={id,value:'',textContent:'',disabled:false,checked:false,hidden:false,open:false,href:'',download:'',children:items,
   setAttribute(k,val){this[k]=val},getAttribute(k){return this[k]},
   addEventListener(k,fn){callbacks[k]=fn},fire(k){return callbacks[k]?.({target:v})},
   append(...a){items.push(...a)},replaceChildren(...a){items.splice(0,items.length,...a)},
   scrollIntoView(){},click(){return callbacks.click?.()}};
  els.set(id,v);return v;
 };
 const document={getElementById:el,createElement:tag=>el('new-'+tag+'-'+Math.random())};
 const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
 const fetch=async(url,opts)=>{requests.push({url,opts});return{ok:true,json:async()=>cases}};
 vm.runInNewContext(client,{window:{},document,localStorage,fetch,URL:{createObjectURL:b=>{exported=b;return'blob:demo'},revokeObjectURL(){}},Blob,setTimeout:()=>1,Math,Date,JSON,console,confirm:()=>true});
 return {el,store,requests,getExport:()=>exported};
}
const tick=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r))};
test('Ten source-backed anonymized public discussion prompts, 20 distinct editorial alternatives',()=>{
 assert.equal(cases.sample_size,10);
 assert.equal(cases.respondents,0);
 assert.equal(cases.cases.length,10);
 assert.equal(new Set(cases.cases.map(c=>c.source_url)).size,10);
 for(const c of cases.cases){
  assert.match(c.source_url,/^https:\/\/www\.reddit\.com\//);
  assert.match(c.source_date,/^20\d\d-\d\d-\d\d$/);
  assert.ok(c.context.length>18);
  assert.notEqual(c.a.text,c.b.text,c.id);
  assert.notEqual(c.a.goal,c.b.goal,c.id);
  for(const text of [c.a.text,c.b.text]){
   const len=text.trim().split(/\s+/).length;
   assert.ok(len>=18&&len<=42,c.id+' '+len);
   assert.doesNotMatch(text,/@[a-z0-9_.]+|https?:\/\//i);
  }
  assert.ok(c.review_note.length>15);
 }
 assert.match(cases.dataset,/paraphrases/i);
});
test('First Contact is transparent about its research limits and stores votes only locally',()=>{
 assert.match(html,/redaktionelle Paraphrasen/);
 assert.match(html,/Keine der beiden/);
 assert.match(html,/id="field-critical"/);
 assert.match(html,/id="field-perspective"/);
 assert.match(client,/avos-field-v01-votes/);
 assert.match(client,/source_url/);
 assert.doesNotMatch(client,/\/api\/assist|sendBeacon|graph\.facebook/);
});
test('Blind pair hides strategy mapping before vote; local outcome saves only ids and goals',async()=>{
 const a=mount();await tick();
 assert.equal(a.el('field-progress').textContent,'0 / 10');
 assert.equal(a.el('field-reveal').hidden,true);
 assert.ok(a.el('field-question').textContent.length>20);
 assert.notEqual(a.el('field-answer-a').textContent,a.el('field-answer-b').textContent);
 assert.equal(a.requests.length,1);
 a.el('field-vote-a').fire('click');
 assert.equal(a.el('field-progress').textContent,'1 / 10');
 assert.equal(a.el('field-reveal').hidden,false);
 const record=JSON.parse(a.store.get('avos-field-v01-votes')).F01;
 assert.equal(record.choice,'a');
 assert.equal(record.winner,record.a_goal);
 assert.equal(record.independent_facts_reviewed,false);
 assert.ok(!a.store.get('avos-field-v01-votes').includes('Bei der Ernte'));
});
test('Neither, critical reporting, optional reason and exports are real working actions',async()=>{
 const a=mount();await tick();
 a.el('field-vote-neither').fire('click');
 a.el('field-reason').value='risk';a.el('field-reason').fire('change');
 a.el('field-critical').checked=true;a.el('field-critical').fire('change');
 a.el('field-perspective').value='nonvegan';a.el('field-perspective').fire('change');
 a.el('field-note').value='Please check @someuser and test@example.com';a.el('field-note').fire('change');
 const record=JSON.parse(a.store.get('avos-field-v01-votes')).F01;
 assert.equal(record.choice,'neither');
 assert.equal(record.reason,'risk');
 assert.equal(record.critical,true);
 assert.equal(record.perspective,'nonvegan');
 assert.ok(!record.note.includes('test@example.com'));
 assert.ok(!record.note.includes('@someuser'));
 a.el('field-next').fire('click');
 assert.equal(a.el('field-case').value,'F02');
 a.el('field-export').fire('click');
 const pack=JSON.parse(await a.getExport().text());
 assert.equal(pack.schema,'avos-field-ratings-v0.1');
 assert.equal(pack.records.length,1);
 assert.equal(pack.records[0].id,'F01');
 assert.ok(!JSON.stringify(pack).includes('source_url'));
 assert.ok(!JSON.stringify(pack).includes(cases.cases[0].comment));
});

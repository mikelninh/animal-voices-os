import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
const triage=require('../triage.js');

function mountQuality(overrideReply){
  const elements=new Map(),cache=new Map();
  const make=id=>{
    if(elements.has(id))return elements.get(id);
    const classes=new Set(),handlers={};
    const e={id,value:id==='topic'?'strength':id==='voice'?'bao':'',checked:false,disabled:false,textContent:'',innerHTML:'',classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},toggle(x,force){if(force===false)classes.delete(x);else if(force===true)classes.add(x);else if(classes.has(x))classes.delete(x);else classes.add(x);return classes.has(x)},contains(x){return classes.has(x)}},
      setAttribute(name,val){this[name]=val},addEventListener(name,callback){handlers[name]=callback},fire(name){if(!handlers[name])throw new Error(id+' no '+name+' handler');handlers[name]()}};
    elements.set(id,e);return e;
  };
  const votes=['a','b'].map(v=>{const e=make('vote-'+v);e.dataset={vote:v};return e});
  const dimensions=['accuracy','fit','care','clarity','constructive','voice'];
  const grades=dimensions.map(id=>make('grade-'+id));
  const doc={
    getElementById:make,
    querySelectorAll(selector){return selector==='[data-vote]'?votes:selector==='[data-grade]'?grades:[]},
    querySelector(selector){const v=selector.match(/\[data-vote="(a|b)"\]/);if(v)return votes[v[1]==='a'?0:1];const g=selector.match(/\[data-grade="([^"]+)"\]/);if(g)return make('grade-'+g[1]);return null},
    createElement:()=>make('dynamic')
  };
  const store=new Map();
  const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
  const sandbox={window:{AV_DATA:context.window.AV_DATA,AV_TRIAGE:overrideReply?{...triage,reply:overrideReply}:triage,scrollTo:()=>{}},document:doc,localStorage,console,Math,Date,Array,Number,String,Object,RegExp,
    confirm:()=>true,Blob:class Blob{},URL:{createObjectURL:()=>'/blob',revokeObjectURL:()=>{}},setTimeout:()=>0};
  vm.runInNewContext(fs.readFileSync(path.join(root,'quality.js'),'utf8'),sandbox);
  return {get:make,store};
}
test('Response Lab renders old/new variants and never starts with fabricated results',()=>{
 const m=mountQuality();
 assert.ok(m.get('text-a').textContent.length>80);
 assert.ok(m.get('text-b').textContent.length>80);
 assert.notEqual(m.get('text-a').textContent,m.get('text-b').textContent);
 assert.equal(String(m.get('test-count').textContent),'0');
 assert.equal(m.get('new-share').textContent,'–');
 assert.equal(m.get('save').disabled,true);
});
test('Blind vote is an opt-in action, stored locally and reversible when moving topics',()=>{
 const m=mountQuality();
 m.get('vote-a').fire('click');
 assert.equal(m.get('save').disabled,false);
 assert.equal(m.get('card-a').classList.contains('chosen'),true);
 m.get('save').fire('click');
 assert.equal(m.get('test-count').textContent,1);
 assert.ok(m.store.has('avos_quality_reviews_v094'));
 const saved=JSON.parse(m.store.get('avos_quality_reviews_v094'));
 assert.equal(saved.length,1);
 assert.equal(saved[0].topic,'strength');
 assert.equal(saved[0].sourceChecked,false);
 assert.equal(saved[0].score,null);
 m.get('next').fire('click');
 assert.notEqual(m.get('topic').value,'strength');
 assert.equal(m.get('save').disabled,true);
});
test('Critical flags force a fail and full rubric ratings are only calculated from real inputs',()=>{
 const m=mountQuality();
 m.get('vote-b').fire('click');
 for(const id of ['accuracy','fit','care','clarity','constructive','voice'])m.get('grade-'+id).value='5';
 m.get('critical').checked=true;
 m.get('source-checked').checked=true;
 m.get('save').fire('click');
 const record=JSON.parse(m.store.get('avos_quality_reviews_v094'))[0];
 assert.equal(record.score,0);
 assert.equal(record.critical,true);
 assert.equal(record.sourceChecked,true);
 assert.equal(record.grades.accuracy,5);
});

test('Cached stale reply module cannot create false blinded A/B comparison',()=>{
 const m=mountQuality((topic,persona,form)=>{
   const base=triage.SHORT[topic.id]||'';
   return persona==='kiki'?'Danke für die Frage. 💚 '+base:persona==='bao'?'Kurzer Reality-Check aus Baos Küche: 😄 '+base:base;
 });
 assert.equal(m.get('text-a').textContent,m.get('text-b').textContent);
 assert.equal(m.get('save').disabled,true);
 assert.equal(m.get('vote-a').disabled,true);
 m.get('vote-a').fire('click');
 assert.equal(m.get('save').disabled,true);
 m.get('save').fire('click');
 assert.equal(m.store.has('avos_quality_reviews_v094'),false);
 assert.match(m.get('feedback').textContent,/identisch/);
});

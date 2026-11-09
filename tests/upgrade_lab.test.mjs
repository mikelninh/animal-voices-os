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
const engine=require('../engine.js');
const contextFit=require('../context-fit.js');
const triage=require('../triage.js');
const sourceMap=new Map(knowledge.sources.map(s=>[s.id,s]));
const topics=new Map(knowledge.cases.map(x=>[x.id,x]));
const app=fs.readFileSync(path.join(root,'upgrade.js'),'utf8');
const html=fs.readFileSync(path.join(root,'upgrade.html'),'utf8');
const shell=fs.readFileSync(path.join(root,'sw.js'),'utf8');
test('Upgrade lab has exactly 20 distinct safe synthetic examples with reproducible IDs',()=>{
 assert.equal(dataset.cases.length,20);
 assert.equal(new Set(dataset.cases.map(c=>c.id)).size,20);
 assert.equal(new Set(dataset.cases.map(c=>c.comment)).size,20);
 assert.ok(dataset.dataset.includes('synthetic'));
 for(const c of dataset.cases){
  assert.ok(c.comment.length>=20&&c.comment.length<=1800);
  assert.ok(topics.has(c.topicId));
  assert.ok(['question','skeptic'].includes(c.intent));
  assert.ok(['momo','kiki','bao'].includes(c.persona));
  assert.doesNotMatch(c.comment,/https?:\/\/|@[a-z0-9_.]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
 }
});
test('All 20 challenge comments are locally eligible and correctly route to source-backed topics',()=>{
 for(const c of dataset.cases){
  const d=engine.decide(c.comment,knowledge.cases,sourceMap,c.intent);
  assert.equal(d.action,'reply',c.id+' '+d.reason);
  assert.equal(d.hold,false,c.id);
  assert.equal(d.topic?.id,c.topicId,c.id);
  assert.equal(d.evidence.ready,true,c.id);
  assert.ok(d.evidence.sources.length>0,c.id);
 }
});
test('Every 20-case comparison has a meaningful baseline and changed editorial context variant',()=>{
 for(const c of dataset.cases){
  const topic=topics.get(c.topicId);
  const previous=triage.reply(topic,c.persona,'short');
  const improved=contextFit.compose(topic,c.persona,'short',c.intent,triage.reply);
  assert.ok(previous.length>=40&&improved.length>=40,c.id);
  assert.notEqual(previous.trim(),improved.trim(),c.id+' identical demo variants');
 }
});
test('AI improvement mode is explicit and sends previous answer to server only after consent',()=>{
 assert.match(html,/id="ai-consent"/);
 assert.match(html,/id="editor-code"/);
 assert.match(html,/id="generate-ai"/);
 assert.match(app,/mode:'improve',existingReply:original/);
 assert.match(app,/!canGenerate\(\)/);
 assert.match(app,/aiAvailable&&\$\('editor-code'\)/);
 assert.match(app,/\$\('ai-consent'\)\.checked/);
 assert.match(app,/credentials:'same-origin'/);
 assert.match(app,/x-avos-editor/);
 assert.doesNotMatch(app,/localStorage\.setItem\([^,\n]*editor-code/);
});
test('No fabricated AI comparisons or votes until real generation and user decision',()=>{
 assert.match(html,/0\/20/);
 assert.match(html,/0<\/strong><span>Abgegebene Blindurteile/);
 assert.match(app,/method:'editorial_demo'/);
 assert.match(app,/method:'live_ai'/);
 assert.match(app,/result\.improved===false/);
 assert.match(app,/!correct/);
 assert.match(app,/draft\.baseline\.trim\(\)===draft\.candidate\.trim\(\)/);
 assert.match(app,/if\(!pair\|\|!chosen\)return/);
 assert.match(app,/Math\.random\(\)/);
});
test('Review pack omits version mapping and user code; editor output keeps provenance',()=>{
 assert.match(app,/schema:'avos-blind-pack-v1'/);
 assert.match(app,/schema:'avos-editorial-study-v1'/);
 assert.match(app,/schema:'avos-reviewer-votes-v1'/);
 assert.match(app,/a:pair\.a,b:pair\.b,method:pair\.method/);
 assert.match(app,/mapping:null/);
 assert.match(app,/sourceChecked/);
 assert.match(app,/critical/);
});
test('Import rejects mismatched IDs, identical answers and oversized uploads',()=>{
 assert.match(app,/file\.size>180000/);
 assert.match(app,/data\.schema!=='avos-blind-pack-v1'/);
 assert.match(app,/item\.comment!==c\.comment/);
 assert.match(app,/item\.a\.trim\(\)!==item\.b\.trim\(\)/);
 assert.match(app,/ids\.has\(item\.id\)/);
});
test('No accidental posting, source review is explicit, and lab is mobile-friendly',()=>{
 for(const id of ['case-select','generate-demo','generate-ai','source-verified','critical-error','save-review','export-pack','import-pack','export-votes'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.doesNotMatch(app,/graph\.facebook|publish_comment|postComment|\/instagram\/comments/);
 assert.match(html,/Keine automatische Massenverarbeitung/);
 assert.match(fs.readFileSync(path.join(root,'upgrade.css'),'utf8'),/@media\(max-width:550px\)/);
 assert.match(shell,/animal-voices-v11-shell-1/);
 for(const file of ['/upgrade.html','/upgrade.js','/upgrade.css','/upgrade-cases.json'])assert.ok(shell.includes(file));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const S=require('../strategy-core.js');
const corpus=require('../upgrade-cases.json').cases;
const knowledge=require('../knowledge.json');
const T=require('../triage.js'),F=require('../context-fit.js'),E=require('../engine.js');
const topics=new Map(knowledge.cases.map(c=>[c.id,c]));
const sources=new Map(knowledge.sources.map(s=>[s.id,s]));
test('Four conversation goals are explicit and not animal characters',()=>{
 assert.deepEqual(Object.keys(S.GOALS),['connect','clarify','explore','act']);
 for(const id of Object.keys(S.GOALS))assert.ok(S.GOALS[id].description.length>25);
 assert.ok(!Object.keys(S.GOALS).some(x=>['momo','kiki','bao'].includes(x)));
});
test('Every one of 20 synthetic prompts has four distinct curated strategy drafts',()=>{
 const sample=[];
 for(const c of corpus){
  const d=E.decide(c.comment,knowledge.cases,sources,c.intent);
  assert.equal(d.action,'reply',c.id);
  assert.equal(d.topic?.id,c.topicId,c.id);
  const t=topics.get(c.topicId);
  const variants=Object.keys(S.GOALS).map(goal=>S.compose(t.id,goal,F.compose(t,c.persona,'short',c.intent,T.reply)));
  assert.equal(new Set(variants).size,4,c.id+' not four actual approaches');
  for(const v of variants){
   const words=v.trim().split(/\s+/).length;
   assert.ok(words>=16&&words<=65,c.id+' reply length '+words);
   assert.ok(v.length>=60&&v.length<=500,c.id+' text');
   assert.doesNotMatch(v,/https?:\/\/|@\w+|\b(?:100%|garantiert|immer und überall)\b/i,c.id);
  }
  sample.push({id:c.id,recommended:S.choose(c.comment,c.intent,c.topicId)});
 }
 assert.equal(sample.length,20);
 assert.ok(sample.every(x=>Object.hasOwn(S.GOALS,x.recommended)));
});
test('Strategy default follows question vs objection without pretending to read intent',()=>{
 assert.equal(S.choose('Warum ist B12 wichtig?','question','b12'),'clarify');
 assert.equal(S.choose('Vegane Männer sind doch schwach','skeptic','strength'),'connect');
 assert.equal(S.choose('Wie kann ich anfangen?','question','protein'),'act');
});
test('Daily UI makes goal primary and characters an optional collapsed detail',()=>{
 const html=fs.readFileSync(path.join(root,'daily.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'daily.js'),'utf8');
 for(const id of Object.keys(S.GOALS))assert.match(html,new RegExp('data-goal="'+id+'"'));
 assert.ok(html.indexOf('id="goal-grid"')<html.indexOf('id="personality-details"'));
 assert.match(html,/<details class="personality-details"/);
 assert.match(html,/strategy-core\.js\?v=1\.3\.0/);
 assert.match(js,/switchGoal\(b\.dataset\.goal\)/);
 assert.match(js,/state\.goal/);
 assert.match(js,/feedback:value/);
 assert.match(js,/goal\}\)/);
 assert.doesNotMatch(js,/automatic_social_posting:true/);
});
test('AI server validates goal and carries it to a separate model critic',()=>{
 const js=fs.readFileSync(path.join(root,'api/assist.js'),'utf8');
 assert.match(js,/conversation_goal:goal\|\|null/);
 assert.match(js,/Object\.hasOwn\(strategies\.GOALS,goal\)/);
 assert.match(js,/goal:goal\|\|null/);
 assert.match(js,/Check that it actually follows the stated conversation_goal/);
});

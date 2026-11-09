import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const F=require('../context-fit.js'),T=require('../triage.js'),E=require('../engine.js');
const d={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),d);
const topics=d.window.AV_DATA.cases, sources=new Map(d.window.AV_DATA.sources.map(s=>[s.id,s]));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
test('All twelve editorial topics have six distinct intent-aware drafts',()=>{
 assert.equal(topics.length,12);
 for(const topic of topics){
  const variants=[];
  for(const intent of ['question','skeptic']){
   const voices=['momo','kiki','bao'].map(p=>F.compose(topic,p,'short',intent,T.reply));
   variants.push(...voices);
   assert.equal(new Set(voices).size,3,topic.id+'/'+intent);
   for(const reply of voices)assert.ok(reply.length>60&&reply.length<600,topic.id+' length '+reply.length);
  }
  assert.equal(new Set(variants).size,6,'duplicate intent/voice '+topic.id);
 }
});
test('Explicit context wins, automatic skeptical question detected, no personality inference',()=>{
 assert.equal(F.intentFrom('Wozu B12?','question','auto').intent,'question');
 assert.equal(F.intentFrom('Aber bei der Ernte sterben Tiere, oder?','question','auto').intent,'skeptic');
 assert.equal(F.intentFrom('Aber bei der Ernte sterben Tiere, oder?','question','question').intent,'question');
 assert.equal(F.intentFrom('Schwach!','claim','skeptic').intent,'skeptic');
 assert.equal(F.intentFrom('Vegane Männer sind schwach','claim','auto').intent,'claim');
});
test('Safety rules remain authoritative before any new reply',()=>{
 for(const text of ['Ich bin 14, wie viel B12 brauche ich?','Jemand sagt Veganer sind schwach','Ich bring dich um, Veganer!']){
   const decision=E.decide(text,topics,sources);
   assert.equal(decision.hold,true,text);
 }
});
test('Changing context revokes all approval, copy and source-open status',()=>{
 assert.match(index,/id="reply-intent"/);
 assert.match(index,/value="skeptic"/);
 assert.match(app,/\$\('reply-intent'\)\.addEventListener\('change'/);
 assert.match(app,/active\.approvedReply=null;active\.approvedAt=null/);
 assert.match(app,/active\.sourceOpenedAt=null/);
 assert.match(app,/\$\('review-check'\)\.disabled=true/);
 assert.match(app,/composeReply\(casesById\.get\(active\.topicId\)\)/);
});
test('User feedback stays on device, is anonymized and included in manual export',()=>{
 assert.match(index,/id="reply-feedback"/);
 assert.match(app,/animal-voices-reply-feedback-v095/);
 assert.match(app,/saveAnswerFeedback/);
 assert.match(app,/answerFeedback/);
 assert.match(app,/\$\('ai-consent'\)\.checked/);
 assert.match(app,/\$\('ai-use'\)\.addEventListener\('click'/);
});
test('New assets are versioned and PWA caches fresh answers',()=>{
 assert.match(index,/context-fit\.js\?v=0\.9\.5/);
 assert.match(index,/app\.js\?v=1\.0\.0/);
 assert.match(sw,/\/context-fit\.js/);
});

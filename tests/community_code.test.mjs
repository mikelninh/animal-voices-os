import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const code=fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8');
const page=fs.readFileSync(path.join(root,'community-code.html'),'utf8');
const module={exports:{}};
vm.runInNewContext(code,{module,window:undefined});
const av=module.exports;
test('Public Animal Voices community code is seven explicit commitments, not a vague slogan',()=>{
 assert.equal(av.COMMUNITY_CODE.length,7);
 assert.ok(av.COMMUNITY_CODE.some(x=>/Würde/.test(x)));
 assert.ok(av.COMMUNITY_CODE.some(x=>/Humor/.test(x)));
 assert.ok(av.COMMUNITY_CODE.some(x=>/Wahrheit/.test(x)));
 assert.ok(av.COMMUNITY_CODE.some(x=>/Grenzen/.test(x)));
 assert.match(page,/Kind to people/);
 assert.match(page,/Fierce for animals/);
 assert.match(page,/verbergen|löschen/i);
 assert.match(page,/Melden/);
 assert.match(page,/id="case-input"/);
 assert.match(page,/id="repeat"/);
 assert.match(page,/id="own"/);
 assert.match(page,/AV_COMMUNITY_CORE/);
 assert.match(code,/root\.AV_COMMUNITY_CORE=API/);
});
test('Ordinary skeptical comments still receive fair source-aware replies',()=>{
 const examples=[
 ['Aber für Soja wird doch der Regenwald abgeholzt?','de'],
 ['Why should animal suffering matter for food choices?','en'],
 ['Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?','de']
 ];
 for(const [comment,lang] of examples){
  const m=av.moderate(comment);
  assert.equal(m.action,'answer',comment);
  const r=av.suggest(comment,av.recommendVoice(comment,av.classify(comment).id));
  assert.equal(r.state,'reviewed',comment);assert.equal(r.language,lang);
  assert.ok(r.text.length>35);
 }
});
test('One-off steak ragebait is optional, never a required fight',()=>{
 for(const comment of ['Ich esse jetzt zwei Steaks extra für euch 😂','Wegen euch esse ich heute zwei extra Steaks!','I will eat two more steaks to annoy vegans']){
  const m=av.moderate(comment),r=av.suggest(comment,'kiki');
  assert.equal(m.action,'optional_one');assert.equal(m.optionalReply,true);
  assert.equal(r.state,'skip');assert.equal(r.moderation.action,'optional_one');
  assert.ok(r.text.length>30);
  assert.ok(m.guidance.length>25);
 }
});
test('Boundary scripts are genuinely different and not personally abusive',()=>{
 for(const comment of ['Ihr seid doch alle Idioten, haltet einfach den Mund!','Du bist bescheuert!','You are an idiot.']){
  assert.equal(av.moderate(comment).action,'boundary',comment);
  const drafts=['momo','kiki','bao','curious'].map(v=>av.suggest(comment,v));
  assert.equal(new Set(drafts.map(x=>x.text)).size,4);
  assert.ok(drafts.every(x=>x.state==='boundary'));
  assert.ok(drafts.every(x=>x.evidenceStatus==='editorial'));
  assert.ok(drafts.every(x=>!/du bist dumm|you are stupid|fuck you/i.test(x.text)));
 }
});
test('Explicitly repeated trolling ends conversation, even if first comment was factual',()=>{
 const x=av.suggest('Woher bekomme ich Protein ohne Fleisch?','momo',{repeated:true});
 assert.equal(x.state,'end');assert.equal(x.moderation.action,'end');
 assert.equal(x.text,undefined);assert.equal(x.moderation.optionalReply,false);
});
test('Explicit threats and hate-like attacks are report recommendations with no draft',()=>{
 for(const comment of [
  'Ich werde dich töten, wenn du wieder kommentierst!',
  'I will kill you if you post again.',
  'Go back to your country!',
  'Alle Veganer sollen sterben!'
 ]){
  const r=av.suggest(comment,'bao');
  assert.equal(r.state,'report',comment);
  assert.equal(r.text,undefined);
  assert.equal(r.moderation.optionalReply,false);
 }
});
test('Ethical discussion of killing animals is NOT falsely classified as a threat',()=>{
 for(const c of ['Wäre das Töten eines Tieres ohne Schmerzen ethisch in Ordnung?','Is painless killing of animals ever ethical?']){
  const m=av.moderate(c);
  assert.equal(m.action,'answer',c);
  assert.notEqual(av.suggest(c).state,'report',c);
 }
});
test('Private usernames and contact details block reply, without automatically reporting someone',()=>{
 for(const c of ['Du kannst mir schreiben an @privateaccount für Proteinfragen','Mein Mail ist person@example.com, was ist mit B12?']){
  const m=av.moderate(c);
  assert.equal(m.action,'review');
  assert.equal(av.suggest(c).state,'review');
 }
});
test('Own post changes moderation guidance, but never silently deletes or reports',()=>{
 const msg='Ihr seid doch alle Idioten';
 const foreign=av.moderate(msg),own=av.moderate(msg,{ownPost:true});
 assert.equal(foreign.action,'boundary');assert.equal(own.action,'boundary');
 assert.match(own.guidance,/verbergen|löschen/i);
 assert.match(foreign.guidance,/fremden Beiträgen/);
 assert.doesNotMatch(code,/fetch\(['"]https?:\/\/.*instagram.*\/(?:delete|comments)/);
 assert.doesNotMatch(code,/graph\.facebook\.com/);
});
test('Never claim an automated model judged a hostile human intent',()=>{
 assert.match(page,/Entscheidungshilfe/);
 assert.match(page,/keine zuverlässige juristische/);
 assert.doesNotMatch(code,/autoReport\(|autoDelete\(|automaticallyBan\(/);
});

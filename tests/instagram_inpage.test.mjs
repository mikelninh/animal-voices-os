import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const code=fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8');
const demo=fs.readFileSync(path.join(root,'instagram-demo.html'),'utf8');
const install=fs.readFileSync(path.join(root,'install.html'),'utf8');
const module={exports:{}};
vm.runInNewContext(code,{module,window:undefined});
const av=module.exports;
test('Userscript intentionally runs only on instagram.com, not in native Instagram',()=>{
 assert.match(code,/@match\s+https:\/\/www\.instagram\.com\/\*/);
 assert.match(code,/@match\s+https:\/\/instagram\.com\/\*/);
 assert.match(code,/@grant\s+GM\.xmlHttpRequest/);
 assert.match(code,/@connect\s+animal-voices-os\.vercel\.app/);
 assert.match(code,/instagram-demo/);
 assert.match(code,/__AV_INSTAGRAM_ACTIVE__/);
 assert.match(install,/instagram\.com im Handybrowser/);
 assert.match(install,/nativen Instagram-App/);
});
test('Verified editorial capsules reference trusted primary institutions and a clear review date',()=>{
 assert.equal(av.REVIEWED_AT,'2026-11-11');
 assert.equal(Object.keys(av.TOPICS).length,21);
 for(const topic of Object.values(av.TOPICS)){
  assert.ok(topic.name.length>=9);
  assert.ok(topic.answer.de.length>=85);
  assert.ok(topic.answer.en.length>=80);
  assert.ok(topic.limitation.length>=30);
  assert.ok(topic.summary.length>=40);
  if(topic.evidenceStatus==='editorial')assert.ok(topic.sources.length>=0);
  else assert.ok(topic.sources.length>=1);
  for(const s of topic.sources){
   const u=new URL(s.url);
   assert.equal(u.protocol,'https:');
   assert.ok(['www.dge.de','ods.od.nih.gov','ourworldindata.org','eur-lex.europa.eu','www.efsa.europa.eu'].includes(u.hostname),s.url);
  }
 }
});
test('Real, distinct German comments receive a pre-reviewed local suggestion and sources',()=>{
 const examples=[
  ['Aber für Soja wird doch der Regenwald abgeholzt?','forest'],
  ['Aber beim Ernten sterben doch auch Tiere!','crop'],
  ['Woher bekommst du genug Protein ohne Fleisch?','protein'],
  ['B12 muss man doch bei veganer Ernährung ergänzen.','b12'],
  ['Warum sind B12 Dosen so hoch?','b12dose'],
  ['Tiere fühlen doch auch Schmerz!','sentience']
 ];
 for(const [text,id] of examples){
  const result=av.suggest(text);
  assert.equal(result.state,'reviewed',text);
  assert.equal(result.id,id,text);
  assert.equal(result.reviewedAt,'2026-11-11');
  assert.ok(result.sources.length>=1);
  assert.ok(result.text.length>=70);
 }
});
test('English comments are answered in English',()=>{
 const s=av.suggest('Why are crop deaths ignored in veganism?');
 assert.equal(s.state,'reviewed');assert.equal(s.id,'crop');
 assert.equal(av.language('Why are crop deaths ignored in veganism?'),'en');
 assert.match(s.text,/growing crops can also harm/i);
});
test('Sensitive and unknown comments never receive a green reviewed badge',()=>{
 for(const text of [
  'Ich bin schwanger und habe B12 Mangel – was soll ich nehmen?',
  'Ein Kind braucht wie viel Protein am Tag?',
  'I have an eating disorder, do I need B12?',
  'Kann ich dir meine Telefonnummer 0176 55443212 schicken für B12?',
  'Wie ist das Wetter auf dem Mond heute?',
  'Möchtest du mit mir schlafen?'
 ]){
  const result=av.suggest(text);
  assert.notEqual(result.state,'reviewed',text);
  assert.equal('reviewedAt' in result,false,text);
 }
});
test('Ambiguous topics are rejected rather than represented as independently verified',()=>{
 const r=av.suggest('Protein und B12 und Tierleid, wie kann das alles zusammenpassen?');
 assert.equal(r.state,'unknown');
});
test('Old conversation, screenshots, AI model calls, image uploads and auto-post do not occur in userscript',()=>{
 assert.doesNotMatch(code,/\/api\/assist|formData\(|createWorker\(|navigator\.mediaDevices|fetch\(/);
 assert.doesNotMatch(code,/graph\.facebook\.com|\/media_publish|\/comments\?access_token/);
 assert.match(code,/function safeFill\(/);
 assert.match(code,/function findComposer\(/);
 assert.match(code,/trigger\.click\(\)/);
 assert.match(code,/doc\.body\.append\(host\)/);
 assert.doesNotMatch(code,/doc\.body\.append\(backdrop/);
 assert.match(code,/aria-modal/);
 assert.match(code,/data-av-control/);
});
test('Demo contains twenty-two selectable sample comments and native reply inputs',()=>{
 const comments=(demo.match(/<li data-av-demo-comment>/g)||[]).length;
 assert.equal(comments,4); // Four static rows plus thirty-eight client-generated examples
 assert.match(demo,/const demoExamples=\[/);
 assert.match(demo,/42 Kommentar-Beispiele/);
 assert.match(demo,/class="native-reply"/);
 assert.match(demo,/class="compose" hidden/);
 assert.match(demo,/src="\/animal-voices\.user\.js\?v=0\.5\.0"/);
 assert.match(demo,/NICHT Instagram/);
 assert.match(demo,/wird grundsätzlich nichts veröffentlicht/);
});
test('Installer gives actual mobile browser extension paths and honest native limitations',()=>{
 assert.match(install,/apps\.apple\.com\/de\/app\/userscripts/);
 assert.match(install,/addons\.mozilla\.org\/de\/android\/addon\/violentmonkey/);
 assert.match(install,/href="\/animal-voices\.user\.js"/);
 assert.match(install,/href="\/instagram-demo\.html"/);
 assert.match(install,/keinem Server|keine Kommentartexte an unseren Server/);
 assert.match(install,/nicht automatisch gepostet|niemals automatisch gepostet/i);
});
test('Clean text function extracts an isolated comment span, not neighboring usernames or controls',()=>{
 const span=(text)=>({innerText:text,textContent:text,children:[],closest:()=>null});
 const comment={querySelectorAll:()=>[span('Aber für Soja wird doch der Regenwald abgeholzt?')],innerText:'username Aber für Soja wird doch der Regenwald abgeholzt? Antworten'};
 assert.equal(av.extractComment(comment,null),'Aber für Soja wird doch der Regenwald abgeholzt?');
});

test('Four truly distinct voices for each supported topic, in German and English',()=>{
 assert.deepEqual(Object.keys(av.VOICES).sort(),['bao','curious','kiki','momo'].sort());
 const examples=[
  'Aber für Soja wird doch der Regenwald abgeholzt?',
  'Aber bei der Ernte sterben doch auch Tiere?',
  'Woher bekommst du genug Protein ohne Fleisch?',
  'B12 muss man doch bei veganer Ernährung ergänzen.',
  'Warum sind B12 Dosen so hoch?',
  'Tiere fühlen doch auch Schmerz!',
  'Why are crop deaths ignored in veganism?',
  'Can I get enough protein from plant foods?'
 ];
 for(const example of examples){
  const results=Object.keys(av.VOICES).map(v=>av.suggest(example,v));
  assert.equal(new Set(results.map(r=>r.text)).size,4,'Duplicate voice text for '+example);
  assert.ok(results.every(r=>r.state==='reviewed'),example);
  assert.deepEqual(results.map(r=>r.id),Array(4).fill(results[0].id));
  assert.deepEqual(results.map(r=>r.sources),Array(4).fill(results[0].sources));
  for(const r of results)assert.ok(r.text.length>=65,'Too short: '+example+' '+r.voice);
 }
});
test('Changing voices does not reclassify unknown or sensitive comments as verified',()=>{
 const examples=['Eine andere Frage ohne belegtes Thema',
 'Ich bin schwanger, wie viel B12 brauche ich?',
 'Mein Kind braucht Proteine – was soll es essen?'];
 for(const example of examples){
  for(const voice of Object.keys(av.VOICES))assert.notEqual(av.suggest(example,voice).state,'reviewed');
 }
});
test('Handoff removes panel, reports nonblocking feedback and never clicks publish',()=>{
 assert.match(code,/closePanel\(\);\s*\/\/ Important|closePanel\(\);\s*if\(trigger/);
 assert.match(code,/toast\('✓ Antwort übernommen/);
 assert.match(code,/input\.focus\(\)/);
 assert.doesNotMatch(code,/\bsubmit\(\)|click\(\s*['"]publish/);
 assert.match(code,/doc\.querySelectorAll\('\.av-shade'\)/);
});

test('Full demo review: first 22 baseline texts route to the intended specific topic, in the comment language',()=>{
 const staticComments=[...demo.matchAll(/<span dir="auto" data-comment-text>([^<]+)<\/span>/g)].map(m=>m[1]);
 const demoArray=demo.slice(demo.indexOf('const demoExamples=['),demo.indexOf('];\nconst list='));
 const dynamicComments=[...demoArray.matchAll(/\[\s*["'][^"']+["']\s*,\s*["']([^"']+)["']\s*,\s*["'](?:facts|ethics|unknown|rage)["']\s*\]/g)].map(m=>m[1]);
 const comments=staticComments.concat(dynamicComments);
 const expected=[
  ['forest','de','kiki'],['protein','de','momo'],['crop','de','kiki'],['unknown','de',null],
  ['b12','de','momo'],['b12dose','de','momo'],['sentience','de','kiki'],['forest','de','momo'],
  ['crop','de','kiki'],['protein','de','kiki'],['protein','de','kiki'],['crop','de','kiki'],
  ['life_ethics','de','kiki'],['b12dose','de','momo'],['cost','de','kiki'],['taste','de','kiki'],
  ['painless_killing','de','kiki'],['unsafe','de',null],
  ['crop','en','kiki'],['protein','en','momo'],['forest','en','kiki'],['ethical_choice','en','kiki']
 ];
 assert.equal(comments.length,42);
 assert.equal(expected.length,22);
 for(let i=0;i<22;i++){
  const [topic,lang,defaultVoice]=expected[i],comment=comments[i],base=av.suggest(comment);
  assert.equal(av.language(comment),lang,'Wrong language for #'+(i+1)+': '+comment);
  assert.equal(base.id||base.state,topic,'Wrong topic for #'+(i+1)+': '+comment);
  if(!defaultVoice)continue;
  assert.equal(av.recommendVoice(comment,topic),defaultVoice,'Wrong default for #'+(i+1));
  const texts=Object.keys(av.VOICES).map(voice=>av.suggest(comment,voice));
  assert.equal(new Set(texts.map(x=>x.text)).size,4,'Same answer repeated on #'+(i+1));
  for(const entry of texts){
   assert.equal(entry.language,lang,'Reply language mismatch #'+(i+1));
   assert.ok(entry.text.length>=55,'Too short #'+(i+1));
   const german=(entry.text.match(/\b(?:ich|wir|du|die|der|das|und|nicht|aber|wenn|auch|kann|können|tiere|für|bei|wird|werden|ist|sind|sollten)\b/gi)||[]).length;
   const english=(entry.text.match(/\b(?:the|and|but|our|you|because|why|how|with|can|should|would|could|this|they|their|does|is|are|of|to|as|a|an|not|have|we)\b/gi)||[]).length;
   if(lang==='de')assert.ok(german>=2,'German reply appears English #'+(i+1)+' '+entry.voice+': '+entry.text);
   else assert.ok(english>=2,'English reply appears German #'+(i+1)+' '+entry.voice+': '+entry.text);
  }
 }
});
test('Shared English loanwords do not make German comments English',()=>{
 for(const comment of [
  'Woher bekomme ich Protein, wenn ich vegan esse?',
  'Protein ist wichtig, aber ohne Fleisch?',
  'B12 Supplemente sind doch bei vegan wichtig!',
  'Fleisch dasdschmeckt mir einfach besser. Warum sollte ich wechseln?',
  'Kann ich vegan leben und trotzdem genug Protein essen?'
 ])assert.equal(av.language(comment),'de',comment);
 for(const comment of [
  'Why should animal suffering matter for our food choices?',
  'Can I get enough protein from plant foods?',
  'Why should I care about crop deaths?'
 ])assert.equal(av.language(comment),'en',comment);
});
test('Ethical dilemmas are not mistakenly blocked as threats or certified as scientific fact',()=>{
 for(const [comment,topic] of [
  ['Wäre das Töten eines Tieres ohne Schmerzen ethisch in Ordnung?','painless_killing'],
  ['Wenn Tiere fühlen können, zählt dann ihr Leben nicht auch?','life_ethics'],
  ['Why should animal suffering matter for our food choices?','ethical_choice'],
  ['Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?','taste']
 ]){
  const r=av.suggest(comment);
  assert.equal(r.id,topic,comment);
  assert.equal(r.evidenceStatus,'editorial',comment);
 }
 assert.equal(av.suggest('Ich bin schwanger: Welche B12-Dosis sollte ich nehmen?').state,'unsafe');
 assert.equal(av.suggest('Ich werde dich töten, du Idiot!').state,'report');
});

test('Ragebait: 20 additional cases have intended routes, bilingual voice options or deliberate abstention',()=>{
 const raw=demo.slice(demo.indexOf('const demoExamples=['),demo.indexOf('];\nconst list='));
 const cases=[...raw.matchAll(/\[\s*["'][^"']+["']\s*,\s*["']([^"']+)["']\s*,\s*["']rage["']\s*\]/g)].map(m=>m[1]);
 assert.equal(cases.length,20);
 const expected=[
  ['plants','de','momo'],['skip','de',null],['pushy','de','kiki'],['ban','de','kiki'],
  ['tofu','de','momo'],['natural','de','momo'],['tradition','de','kiki'],['lions','de','bao'],
  ['meme','de','bao'],['trend','de','curious'],['both','de','kiki'],['protein','de','momo'],
  ['b12','de','momo'],['skip','de',null],['unknown','de',null],['pushy','en','kiki'],
  ['plants','en','momo'],['skip','en',null],['tofu','en','momo'],['tradition','en','kiki']
 ];
 for(let i=0;i<cases.length;i++){
  const [topic,lang,voice]=expected[i],comment=cases[i],r=av.suggest(comment);
  assert.equal(av.language(comment),lang,'Language #'+(i+23)+': '+comment);
  assert.equal(r.id||r.state,topic,'Wrong topic #'+(i+23)+': '+comment);
  if(!voice){assert.notEqual(r.state,'reviewed',comment);continue}
  assert.equal(av.recommendVoice(comment,topic),voice,'Wrong default voice '+comment);
  const replies=Object.keys(av.VOICES).map(v=>av.suggest(comment,v));
  assert.equal(new Set(replies.map(x=>x.text)).size,4,'Repeated drafts for '+comment);
  assert.ok(replies.every(x=>x.language===lang),'Wrong language within options '+comment);
  if(['plants','pushy','ban','tofu','natural','tradition','lions','meme','trend','both'].includes(topic))
   assert.equal(r.evidenceStatus,'editorial','No fake fact-check badge for '+comment);
 }
});
test('Deliberate no-reply is a valid recommendation for pure antagonism',()=>{
 for(const comment of [
  'Ich esse jetzt zwei Steaks extra für euch 😂',
  'Wegen euch esse ich heute zwei extra Steaks!',
  'I will eat two more steaks to annoy vegans'
 ]){
  const r=av.suggest(comment);
  assert.equal(r.state,'skip',comment);
  assert.match(r.reason,/Provokation/);
 }
});

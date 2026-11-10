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
 assert.match(code,/@grant\s+none/);
 assert.match(code,/instagram-demo/);
 assert.match(code,/__AV_INSTAGRAM_ACTIVE__/);
 assert.match(install,/instagram\.com im Handybrowser/);
 assert.match(install,/nativen Instagram-App/);
});
test('Verified editorial capsules reference trusted primary institutions and a clear review date',()=>{
 assert.equal(av.REVIEWED_AT,'2026-11-10');
 assert.equal(Object.keys(av.TOPICS).length,6);
 for(const topic of Object.values(av.TOPICS)){
  assert.ok(topic.name.length>=9);
  assert.ok(topic.answer.de.length>=85);
  assert.ok(topic.answer.en.length>=80);
  assert.ok(topic.limitation.length>=30);
  assert.ok(topic.summary.length>=40);
  assert.ok(topic.sources.length>=1);
  for(const s of topic.sources){
   const u=new URL(s.url);
   assert.equal(u.protocol,'https:');
   assert.ok(['www.dge.de','ods.od.nih.gov','ourworldindata.org','eur-lex.europa.eu'].includes(u.hostname),s.url);
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
  assert.equal(result.reviewedAt,'2026-11-10');
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
 assert.match(code,/replyTrigger\.click\(\)/);
 assert.match(code,/append\(backdrop,host\)/);
 assert.match(code,/aria-modal/);
 assert.match(code,/data-av-control/);
});
test('Demo contains four visible independent comment rows and native reply inputs',()=>{
 const comments=(demo.match(/<li data-av-demo-comment>/g)||[]).length;
 assert.equal(comments,4);
 assert.match(demo,/class="native-reply"/);
 assert.match(demo,/class="compose" hidden/);
 assert.match(demo,/src="\/animal-voices\.user\.js\?v=0\.1\.0"/);
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

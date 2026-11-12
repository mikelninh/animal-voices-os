import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const core=require('../animal-voices.user.js');
const script=fs.readFileSync(path.join(root,'animal-voices.user.js'),'utf8');
const scenarios=[
 ['Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?','taste','de'],
 ['I enjoy the taste of meat; why would I give it up?','taste','en'],
 ['Aber für Soja wird doch der Regenwald abgeholzt?','forest','de'],
 ['Why is the rainforest destroyed to grow soy?','forest','en'],
 ['Can I get enough protein from plant foods?','protein','en'],
 ['Woher bekomme ich genug Eiweiß als Veganer?','protein','de'],
 ['Why should animal suffering matter for our food choices?','ethical_choice','en'],
 ['Warum sollte Tierleid beim Essen wichtig sein?','ethical_choice','de']
];
const emojiCount=text=>(text.match(/\p{Extended_Pictographic}/gu)||[]).length;
test('Fresh local replies have distinct voices, correct language and no emoji clutter',()=>{
 for(const [comment,id,lang] of scenarios){
  const results=Object.keys(core.VOICES).map(voice=>core.suggest(comment,voice));
  assert.deepEqual(results.map(r=>r.id),Array(4).fill(id),comment);
  assert.ok(results.every(r=>r.language===lang),comment);
  assert.equal(new Set(results.map(r=>r.text)).size,4,comment);
  for(const result of results){
   assert.ok(result.text.length>=65&&result.text.length<590,comment);
   assert.ok(emojiCount(result.text)<=1,'Too many emojis: '+result.text);
  }
 }
});
test('Taste responses feel warm or playful with one contextual symbol and can turn emojis off',()=>{
 const comment='Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?';
 const warm=core.suggest(comment,'kiki');
 const playful=core.suggest(comment,'bao');
 const question=core.suggest(comment,'curious');
 assert.match(warm.text,/🍽️/);
 assert.match(playful.text,/😄/);
 assert.match(question.text,/🤔/);
 for(const voice of Object.keys(core.VOICES)){
  const plain=core.suggest(comment,voice,{emojis:false});
  assert.equal(emojiCount(plain.text),0,'Emoji setting should not retain any emoji');
  assert.equal(plain.state,'reviewed');
  assert.deepEqual(plain.sources,core.suggest(comment,voice).sources,'emoji setting must not change evidence');
 }
});
test('No casual emojis when discussing animal suffering, death, boundaries or threats',()=>{
 for(const comment of [
  'Why should animal suffering matter for our food choices?',
  'Wäre schmerzfreies Schlachten ethisch okay?',
  'Können Schweine eigentlich Schmerzen empfinden?',
  'Du bist ein Idiot, wenn du vegan isst.'
 ]){
  for(const voice of Object.keys(core.VOICES)){
   const result=core.suggest(comment,voice);
   if(result.text)assert.equal(emojiCount(result.text),0,comment+' '+voice);
  }
 }
 for(const comment of ['Ich werde dich töten, wenn du antwortest!','I hope you die for pushing this nonsense.']){
  const result=core.suggest(comment,'bao');
  assert.equal(result.state,'report');
  assert.equal(result.text,undefined);
 }
});
test('Ragebait stays opt-in, not automatically recommended, even with a humorous option',()=>{
 const comment='Wegen euch esse ich heute zwei extra Steaks!';
 assert.equal(core.moderate(comment).action,'optional_one');
 const option=core.suggest(comment,'bao');
 assert.equal(option.state,'skip');
 assert.equal(option.recommendedAction,'no_reply_or_one');
 assert.ok(emojiCount(option.text)<=1);
 assert.equal(emojiCount(core.suggest(comment,'bao',{emojis:false}).text),0);
});
test('Panel offers a working emoji checkbox; review, source and private AI behavior unchanged',()=>{
 assert.match(script,/id="av-emojis" checked/);
 assert.match(script,/getElementById\('av-emojis'\)\.addEventListener\('change',update\)/);
 assert.match(script,/emojis:shadow\.getElementById\('av-emojis'\)\.checked/);
 assert.match(script,/function styleReply\(/);
 assert.match(script,/const REPLY_EMOJIS=/);
 assert.match(script,/if\(\['report','end','review'\]\.includes\(m\.action\)\)/);
});

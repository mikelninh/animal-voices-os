import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import E from '../engine.js';
import T from '../triage.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'../data.js'),'utf8'),context);
const topics=context.window.AV_DATA.cases;
const sources=new Map(context.window.AV_DATA.sources.map(s=>[s.id,s]));
const d=x=>E.decide(x,topics,sources);
for(const input of [
 'Du bist schwach, ich schlage dich tot!',
 'Ihr Veganer seid schwach, ich werde euch alle abstechen',
 'Vegane Männer sind schwach, lösch dich!',
 'Vegane Männer sind schwach und ich weiß wo du wohnst',
 'Vegane Männer sind schwach, kill dich'
]){
 test('Threat never classified as a nutrition reply: '+input,()=>{
   assert.equal(d(input).action,'report');
   assert.equal(d(input).hold,true);
   assert.equal(d(input).topic,null);
   assert.equal(T.classify(input,{id:'strength',sources:['strength']}).action,'report');
 });
}
for(const input of [
 'Ich bin 14, wie viel B12 brauche ich?',
 'Ich bin 16 und wie kann ich Protein als Veganer bekommen?'
]){
 test('Minor asking for nutrition advice is held: '+input,()=>{
   assert.equal(d(input).action,'save');
   assert.equal(d(input).hold,true);
   assert.equal(d(input).topic,null);
   assert.equal(T.classify(input,{id:'b12',sources:['dge24']}).action,'save');
 });
}
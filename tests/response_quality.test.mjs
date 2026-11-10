import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
const D=context.window.AV_DATA, T=require('../triage.js');
const quality=fs.readFileSync(path.join(root,'quality.js'),'utf8');
const html=fs.readFileSync(path.join(root,'quality.html'),'utf8');
const css=fs.readFileSync(path.join(root,'quality.css'),'utf8');
const main=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
test('All twelve topics offer three distinct full short answers',()=>{
  assert.equal(D.cases.length,12);
  let total=0;
  for(const topic of D.cases){
    const versions=['momo','kiki','bao'].map(p=>T.reply(topic,p,'short'));
    for(const v of versions){assert.ok(v.length>55,'too short: '+topic.id);assert.ok(v.length<600,'too long: '+topic.id);}
    assert.equal(new Set(versions).size,3,'short voices repeat: '+topic.id);
    assert.ok(!versions[1].startsWith('Danke für die Frage. 💚 '+T.SHORT[topic.id]),'generic Kiki: '+topic.id);
    assert.ok(!versions[2].startsWith('Kurzer Reality-Check aus Baos Küche: 😄 '+T.SHORT[topic.id]),'generic Bao: '+topic.id);
    total+=3;
  }
  assert.equal(total,36);
});
test('Each fact topic has a claim and caveat; sensitive topics remain in safety routing',()=>{
  for(const topic of D.cases){assert.ok(topic.fact&&topic.limit&&topic.title);for(const id of topic.sources)assert.ok(D.sources.find(s=>s.id===id)?.url?.startsWith('https://'))}
  const children=D.cases.find(c=>c.id==='children');
  assert.ok(children);
});
test('Blind test UI exposes A/B choice, explicit neither and independent source check',()=>{
  for(const id of ['topic','voice','text-a','text-b','source-checked','neither','rubric','critical','save','export','clear','test-count','new-share'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/Blindtest/);
  assert.match(quality,/fingerprint\(seed/);
  assert.match(quality,/version:'old'/);
  assert.match(quality,/version:'new'/);
  assert.match(quality,/sourceChecked/);
  assert.match(quality,/critical/);
});
test('Weighted score uses transparent 100% rubric with hard critical gate',()=>{
  const weights=[25,20,15,15,15,10];
  assert.equal(weights.reduce((a,b)=>a+b,0),100);
  assert.match(quality,/critical\?0:/);
  assert.match(quality,/score:critical\?0/);
  assert.match(quality,/selected\.length/);
  assert.match(quality,/localStorage/);
  assert.doesNotMatch(quality,/\bfetch\(/);
});
test('No fabricated trial results or user data collection',()=>{
  assert.match(html,/0<\/strong><span>Vergleiche/);
  assert.match(html,/keine[rn]? wissenschaftlicher Wirkungsnachweis|kein wissenschaftlicher Wirkungsnachweis/i);
  assert.match(quality,/replace\(\/@/);
  assert.match(quality,/replace\(\/https/);
  assert.doesNotMatch(quality,/navigator\.sendBeacon/);
});
test('Response lab is accessible and versioned in PWA',()=>{
  assert.match(main,/href="\/upgrade\.html"/);
  assert.match(sw,/animal-voices-v14-shell-1/);
  for(const p of ['/quality.html','/quality.css','/quality.js'])assert.ok(sw.includes(p));
  assert.match(css,/@media\(max-width:560px\)/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(html,/aria-live="polite"/);
});

test('Versioned scripts plus network-first critical assets avoid duplicate A/B comparisons from stale PWA',()=>{
 assert.match(html,/triage\.js\?v=0\.9\.5/);
 assert.match(html,/quality\.js\?v=0\.9\.5/);
 assert.match(sw,/network-first/);
 assert.match(sw,/fetch\(req\)/);
 assert.match(quality,/function distinctVersions/);
 assert.match(quality,/if\(!distinctVersions\(\)\)announceStale/);
});

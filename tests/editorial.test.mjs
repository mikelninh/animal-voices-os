import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(new URL('../index.html',import.meta.url)));
const js=fs.readFileSync(path.join(root,'data.js'),'utf8');
const sandbox={window:{}};
vm.runInNewContext(js,sandbox);
const {sources,cases,examples}=sandbox.window.AV_DATA;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');

test('Editorial knowledge is populated and uniquely identified',()=>{
 assert.equal(cases.length,12);
 assert.equal(sources.length,11);
 assert.equal(new Set(sources.map(x=>x.id)).size,sources.length);
 assert.equal(new Set(cases.map(x=>x.id)).size,cases.length);
 assert.ok(examples.length>=5);
});
test('Every factual reference resolves to a secure original link',()=>{
 const ids=new Set(sources.map(x=>x.id));
 for(const s of sources){
   assert.match(s.url,/^https:\/\//);
   assert.ok(s.name&&s.year&&s.kind&&s.note);
 }
 for(const claim of cases){
   assert.ok(claim.title&&claim.fact&&claim.limit&&claim.keywords.length);
   for(const id of claim.sources)assert.ok(ids.has(id),claim.id+': missing source '+id);
 }
});
test('Every persona has a substantial distinct response',()=>{
 for(const topic of cases){
   for(const voice of ['momo','kiki','bao'])assert.ok(topic.voices[voice]?.length>60,topic.id+': missing '+voice);
   assert.equal(new Set(Object.values(topic.voices)).size,3);
 }
});
test('The user interface has its required workspaces and controls',()=>{
 for(const view of ['overview','dialog','library','content','impact'])assert.ok(html.includes('id="view-'+view+'"'));
 for(const id of ['comment','analysis-result','analysis-pill','reply','approve','copy','reviewer','review-check','topic-grid','script','records']){
   assert.ok(html.includes('id="'+id+'"'),id);
 }
 for(const p of ['/data.js','/app.js','/styles.css','/characters/momo.svg','/characters/kiki.svg','/characters/bao.svg'])assert.ok(html.includes(p));
});
test('Every referenced static element id exists',()=>{
 const ids=[...app.matchAll(/\$\("([\w-]+)"\)/g)].map(m=>m[1]);
 for(const id of new Set(ids))assert.ok(html.includes('id="'+id+'"')||app.includes('id="'+id+'"'),'missing static or dynamically rendered DOM element '+id);
});
test('Publishing remains disabled and scientific uncertainty is explicit',()=>{
 assert.match(app,/Keine Veröffentlichung|nicht veröffentlicht|Nichts wurde veröffentlicht/);
 assert.match(app,/approvedReply/);
 assert.match(app,/contextRisk/);
 assert.match(app,/sourceById/);
 assert.match(html,/keine Live-Suche|Nicht live validiert|keine Live-Verif/i);
 assert.ok(!app.includes('graph.facebook.com'));
 assert.ok(!app.includes('api.twitter.com'));
});
test('Responsive accessibility and motion are covered',()=>{
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/:focus-visible/);
 assert.match(html,/aria-label="Mobile navigation"/);
});

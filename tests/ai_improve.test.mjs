import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const assist=require('../api/assist.js');
const status=require('../api/status.js');
function res(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.code=n;return this},json(obj){this.body=obj;return this}}}
const goodText='Vegane Männer sind schwach und können keine Muskeln aufbauen.';
const oldDraft='Das Klischee stimmt so pauschal nicht. Eine Meta-Analyse fand keinen signifikanten Kraftunterschied in den untersuchten Studien.';
const code='private-only-test-123456789';
async function withEditor(callback){
 const a=process.env.OPENAI_API_KEY,b=process.env.AVOS_EDITOR_CODE,oldFetch=global.fetch;
 process.env.OPENAI_API_KEY='test-only-not-real';
 process.env.AVOS_EDITOR_CODE=code;
 try{return await callback()}finally{
  if(a===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=a;
  if(b===undefined)delete process.env.AVOS_EDITOR_CODE;else process.env.AVOS_EDITOR_CODE=b;
  global.fetch=oldFetch;
 }
}
function req(mode='improve',extra={}){
 return {method:'POST',headers:{'x-avos-editor':code},body:{text:goodText,persona:'momo',contextType:'auto',consent:true,mode,existingReply:mode==='improve'?oldDraft:'',...extra}};
}
function simulatedProvider(supported=true,improves=true){
 const calls=[];
 global.fetch=async (url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  const payload=JSON.parse(options.body);calls.push(payload);
  assert.equal(payload.store,false);
  assert.equal(payload.text.format.type,'json_schema');
  assert.equal(payload.text.format.strict,true);
  assert.equal(options.headers.Authorization,'Bearer test-only-not-real');
  const facts=JSON.parse(payload.input[0].content);
  const second=calls.length%2===0;
  const out=second?{supported,issues:supported?[]:['Claim unsupported'],addresses_comment:true,respects_limitations:true,improves_existing:improves}:
   {reply:'Fleisch ist kein Trainingsplan. Eine Meta-Analyse randomisierter Studien fand keinen signifikanten Kraftunterschied zwischen den untersuchten Ernährungsformen. Die Studienlage ist noch begrenzt. 💪',
    used_source_ids:[facts.sources?.[0]?.id||facts.facts?.sources?.[0]?.id||'strength'],changes:['Konkreter auf die Aussage eingegangen.']};
  return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(out)}]}]})};
 };
 return calls;
}
test('Private AI status is honest and never exposes credentials',async()=>{
 const oldKey=process.env.OPENAI_API_KEY,oldCode=process.env.AVOS_EDITOR_CODE;
 delete process.env.OPENAI_API_KEY;delete process.env.AVOS_EDITOR_CODE;
 const initial=res();await status({method:'GET'},initial);
 assert.equal(initial.code,200);assert.equal(initial.body.available,false);
 assert.equal(initial.body.live_source_verification,false);
 if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;
 if(oldCode===undefined)delete process.env.AVOS_EDITOR_CODE;else process.env.AVOS_EDITOR_CODE=oldCode;
 await withEditor(async()=>{
  const r=res();await status({method:'GET'},r);
  assert.equal(r.body.available,true);
  assert.doesNotMatch(JSON.stringify(r.body),/private-only-test|test-only-not-real/);
 });
});
test('AI improves existing reply with exactly two provider calls and preserved citations',async()=>{
 await withEditor(async()=>{
  const calls=simulatedProvider();
  const r=res();await assist(req('improve'),r);
  assert.equal(r.code,200);
  assert.equal(r.body.ok,true);
  assert.equal(r.body.mode,'improve');
  assert.equal(r.body.improved,true);
  assert.equal(r.body.topic_id,'strength'); // Contract required by upgrade.js before accepting live results.
  assert.match(r.body.reply,/Trainingsplan/);
  assert.ok(r.body.source_links.length>=1);
  assert.equal(r.body.scientifically_verified,false);
  assert.equal(r.body.requires_human_review,true);
  assert.equal(calls.length,2);
  assert.equal(JSON.parse(calls[0].input[0].content).previous,oldDraft);
 });
});
test('AI also writes new drafts without a previous answer',async()=>{
 await withEditor(async()=>{
  const calls=simulatedProvider();
  const r=res();await assist(req('new'),r);
  assert.equal(r.code,200);
  assert.equal(r.body.mode,'new');
  assert.equal(calls.length,2);
  assert.equal(JSON.parse(calls[0].input[0].content).previous,'');
 });
});
test('Critical model veto cannot return a public answer',async()=>{
 await withEditor(async()=>{
  simulatedProvider(false);
  const r=res();await assist(req('improve'),r);
  assert.equal(r.code,422);
  assert.equal(r.body.ok,false);
  assert.equal('reply' in r.body,false);
 });
});
test('No clear improvement: keep existing draft without pretending success',async()=>{
 await withEditor(async()=>{
  simulatedProvider(true,false);
  const r=res();await assist(req('improve'),r);
  assert.equal(r.code,200);
  assert.equal(r.body.improved,false);
  assert.equal('reply' in r.body,false);
 });
});
test('Untrusted handles and contacts are blocked before any model call',async()=>{
 await withEditor(async()=>{
  let called=false;global.fetch=()=>{called=true;throw Error('Should not call model')};
  const r=res();await assist(req('improve',{text:'@private_account sagt: '+goodText}),r);
  assert.equal(r.code,400);assert.equal(called,false);
 });
});
test('Unsupported topics abstain without model hallucination',async()=>{
 await withEditor(async()=>{
  let called=false;global.fetch=()=>{called=true;throw Error('Should not call model')};
  const r=res();await assist(req('new',{text:'Gibt es eine Quantenmechanik Erklärung für Leuchtkäfer?'}),r);
  assert.equal(r.code,422);
  assert.equal(called,false);
 });
});
test('Wrong editor code, no consent or GET can never call the model',async()=>{
 await withEditor(async()=>{
  let called=false;global.fetch=()=>{called=true;throw Error('Should not call model')};
  for(const request of [{...req(),headers:{'x-avos-editor':'wrong'}},req('improve',{consent:false}),{method:'GET',headers:{}}]){
   const r=res();await assist(request,r);assert.notEqual(r.code,200);
  }
  assert.equal(called,false);
 });
});
test('User interface only applies AI suggestion on explicit click, resets scientific review',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 for(const id of ['ai-consent','ai-access','ai-improve','ai-new','ai-comparison','ai-use','ai-keep'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/\$\('ai-use'\)\.addEventListener\('click'/);
 assert.match(app,/active\.sourceOpenedAt=null/);
 assert.match(app,/active\.approvedReply=null/);
 assert.match(app,/credentials:'same-origin'/);
 assert.match(app,/if\(!\['improve','new'\]\.includes\(mode\)/);
 assert.doesNotMatch(app,/fetch\('\/api\/assist',[^\n]*\)\s*;/);
});

test('Explicit conversation goal reaches both model passes and is echoed in the response',async()=>{
 await withEditor(async()=>{
  const calls=simulatedProvider();
  const r=res();await assist(req('improve',{goal:'connect'}),r);
  assert.equal(r.code,200);
  assert.equal(r.body.goal,'connect');
  assert.equal(calls.length,2);
  const writer=JSON.parse(calls[0].input[0].content);
  const critic=JSON.parse(calls[1].input[0].content);
  assert.equal(writer.conversation_goal,'connect');
  assert.equal(critic.facts.conversation_goal,'connect');
  assert.match(calls[0].instructions,/Acknowledge the legitimate concern/);
  assert.match(calls[1].instructions,/conversation_goal/);
 });
});
test('Unknown conversation goal is rejected without a paid model call',async()=>{
 await withEditor(async()=>{
  let called=false;global.fetch=()=>{called=true;throw Error('Model must not be called')};
  const r=res();await assist(req('improve',{goal:'manipulate'}),r);
  assert.equal(r.code,400);assert.equal(called,false);
 });
});

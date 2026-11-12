import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const coach=require('../api/coach.js');
const {moderate}=require('../animal-voices.user.js');
const key='private-editor-test-only-1234567';
const mockRes=()=>({code:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.code=n;return this},json(x){this.body=x;return this}});
const req=(comment,extra={})=>({method:'POST',headers:{host:'animal-voices-os.vercel.app','x-avos-editor':key,origin:'https://www.instagram.com'},body:{comment,consent:true,...extra}});
async function setup(fn){
 const previous={code:process.env.AVOS_EDITOR_CODE,key:process.env.OPENAI_API_KEY,fetch:global.fetch};
 process.env.AVOS_EDITOR_CODE=key;process.env.OPENAI_API_KEY='mock-provider-test-not-real';
 coach._internals.resetRateLimitForTests();
 try{return await fn()}finally{
  if(previous.code===undefined)delete process.env.AVOS_EDITOR_CODE;else process.env.AVOS_EDITOR_CODE=previous.code;
  if(previous.key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previous.key;
  global.fetch=previous.fetch;
 }
}
function provider({topic='forest',language='de',critic=true,wrongLanguage=false,unknown=false,badIds=false}={}){
 const calls=[];
 const de={
  momo:'Die Sorge um den Regenwald ist berechtigt. Aber ein großer Teil des Sojas wird als Tierfutter verwendet. Deshalb sollten wir Futtermittel beim Vergleich mit einrechnen.',
  kiki:'Ich verstehe deine Sorge wegen des Regenwaldes. Diese Abholzung ist ein ernstes Thema. Auch das Soja, das als Tierfutter angebaut wird, gehört in einen fairen Vergleich.',
  bao:'Das Tofustück ist nicht der einzige Soja-Kunde. 😄 Ein großer Teil landet im Tierfutter. Deshalb lohnt es sich, bei der Umweltbilanz das Futter mitzuzählen.',
  curious:'Welche Rolle spielen für dich die Sojamengen im Tierfutter? Ich finde, wir sollten diese Pflanzen beim Vergleich der Umweltfolgen mitrechnen, statt nur direkt gegessenen Tofu zu betrachten.'
 };
 const en={
  momo:'Rainforest destruction is a real concern. But animal feed accounts for a large share of soy use, so we need to count those crops in a fair comparison of food systems.',
  kiki:'I understand why rainforest damage worries you. Looking at the soy grown for animal feed, alongside soy used directly as food, helps make the comparison more complete.',
  bao:'Tofu is not the only customer for soy. 😄 A large share becomes animal feed, so that belongs in a fair look at land use too.',
  curious:'Would you include the soy used as animal feed in a rainforest comparison? I think that makes the discussion more complete than only looking at tofu.'
 };
 global.fetch=async(url,opts)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  const payload=JSON.parse(opts.body);calls.push(payload);
  assert.equal(payload.store,false);
  assert.equal(payload.text.format.type,'json_schema');
  assert.equal(opts.headers.Authorization,'Bearer mock-provider-test-not-real');
  let output;
  if(calls.length===1)output={topic_id:unknown?'none':topic,intent:'factual',action:unknown?'review':'answer',rationale:'Factual question'};
  else if(calls.length===2)output={...(wrongLanguage?de:language==='de'?de:en),used_source_ids:badIds?['invented-id']:['s1']};
  else output={approved:critic,correct_topic:true,correct_language:true,supported_claims:critic,humane:true,no_misleading_ethics:true,issues:critic?[]:['unsupported claim']};
  return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(output)}]}]})};
 };
 return calls;
}
test('Semantic AI supports German and English and returns exactly four reviewed variants',async()=>{
 for(const [comment,language] of [['Aber für Soja wird doch der Regenwald abgeholzt?','de'],['Why does soy lead to deforestation?','en']]){
  await setup(async()=>{
   const calls=provider({language}),res=mockRes();await coach(req(comment),res);
   assert.equal(res.code,200,JSON.stringify(res.body));
   assert.equal(res.body.language,language);
   assert.equal(res.body.topic_id,'forest');
   assert.equal(res.body.scientifically_verified,false);
   assert.equal(res.body.requires_human_review,true);
   assert.equal(res.body.review_status,'two_model_passes_against_curated_capsules');
   assert.equal(Object.keys(res.body.variants).length,4);
   assert.equal(new Set(Object.values(res.body.variants)).size,4);
   assert.equal(calls.length,3);
   assert.ok(res.body.sources.length>=1);
   assert.match(JSON.stringify(calls[0].input),/Rainforest|Regenwald/i);
   assert.match(calls[2].instructions,/INDEPENDENT/);
  });
 }
});
test('Unclassified comments abstain before any answer generation',async()=>{
 await setup(async()=>{
  const calls=provider({unknown:true}),res=mockRes();
  await coach(req('What about quantum physics of purple rainbows?'),res);
  assert.equal(res.code,422);assert.equal('variants' in res.body,false);assert.equal(calls.length,1);
 });
});
test('AI critic veto cannot publish any of four draft options',async()=>{
 await setup(async()=>{
  const calls=provider({critic:false}),res=mockRes();
  await coach(req('Aber für Soja wird doch der Regenwald abgeholzt?'),res);
  assert.equal(res.code,422);assert.equal('variants' in res.body,false);assert.equal(calls.length,3);
 });
});
test('Wrong-language drafts are rejected before critic consumes tokens',async()=>{
 await setup(async()=>{
  const calls=provider({language:'en',wrongLanguage:true}),res=mockRes();
  await coach(req('Why does soy lead to deforestation?'),res);
  assert.equal(res.code,422);assert.equal(calls.length,2);
 });
});
test('Invented source IDs are rejected before independent critique',async()=>{
 await setup(async()=>{
  const calls=provider({badIds:true}),res=mockRes();
  await coach(req('Aber für Soja wird doch der Regenwald abgeholzt?'),res);
  assert.equal(res.code,422);assert.equal(calls.length,2);
 });
});
test('No credentials, no consent, no key, no off-origin website means zero provider calls',async()=>{
 await setup(async()=>{
  global.fetch=()=>{throw Error('AI must not be called')};
  for(const bad of [
   req('Aber für Soja wird doch der Regenwald abgeholzt?',{consent:false}),
   {...req('Aber für Soja wird doch der Regenwald abgeholzt?'),headers:{host:'animal-voices-os.vercel.app','x-avos-editor':'WRONG'}},
   {...req('Aber für Soja wird doch der Regenwald abgeholzt?'),headers:{...req('').headers,origin:'https://other.website'}},
   {...req('Aber für Soja wird doch der Regenwald abgeholzt?'),method:'GET'}
  ]){
   const r=mockRes();await coach(bad,r);
   assert.ok(r.code>=400);
  }
 });
});
test('Privacy, threats, pure bait and personal abuse never reach external model',async()=>{
 await setup(async()=>{
  global.fetch=()=>{throw Error('Forbidden provider call')};
  for(const comment of [
   '@username sagt: Warum Tiere leiden?',
   'person@example.com fragt: Warum Regenwald?',
   'Ich werde dich töten, wenn du antwortest!',
   'Ihr seid doch alle Idioten!',
   'Ich esse jetzt zwei Steaks extra für euch 😂'
  ]){
   const r=mockRes();await coach(req(comment),r);
   assert.ok([400,422].includes(r.code),comment+': '+JSON.stringify(r.body));
  }
 });
});
test('Catalog contains all curated topics but does not include user handles or secret credentials',()=>{
 const topics=coach._internals.catalogue();
 assert.ok(topics.length>=20);
 assert.ok(topics.some(x=>x.id==='taste'));
 assert.ok(topics.some(x=>x.id==='ethical_choice'));
 assert.ok(topics.some(x=>x.id==='plants'));
 assert.equal(coach._internals.privateDetails('@hello how are you'),true);
 assert.equal(moderate('Why do animals suffer?').action,'answer');
});

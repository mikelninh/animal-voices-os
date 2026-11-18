import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateSuite, summariseEvidence} from './core.mjs';
import {runAnimalVoices, examples} from './animal-voices.mjs';

test('Fix improves frozen baseline without safety regressions, still needs human review',()=>{
  const r=runAnimalVoices();
  assert.equal(r.product,'animal-voices');
  assert.equal(r.sample_size,examples.length);
  assert.equal(r.baseline.correct,11);
  assert.equal(r.candidate.correct,12);
  assert.equal(r.delta_correct,1);
  assert.equal(r.automated_gate,'PASS_PRECHECK');
  assert.deepEqual(r.improvements,['AV-S05']);
  assert.deepEqual(r.regressions,[]);
  assert.equal(r.promotion,'HUMAN_REVIEW_REQUIRED');
  assert.equal(r.user_preference,null);
  assert.equal(r.real_world_impact,null);
  assert.ok(r.candidate.critical_n >= 4);
  assert.equal(r.candidate.critical_errors,0);
  assert.equal(r.baseline.critical_errors,1);
});
test('A deliberately weakened safety decision is caught and blocks rollout',()=>{
  const tests=[
    {id:'safe',group:'safety',critical:true,input:'threat',expected:{action:'report'}},
    {id:'normal',group:'usefulness',input:'question',expected:{action:'answer'}}
  ];
  const old = t => ({action:t==='threat'?'report':'answer'});
  const bad = t => ({action:'answer'});
  const r=evaluateSuite({product:'toy-test',dataset:'test-v1',cases:tests,baseline:old,candidate:bad});
  assert.deepEqual(r.critical_regressions,['safe']);
  assert.equal(r.candidate.critical_errors,1);
  assert.ok(r.reasons.includes('critical_failures'));
  assert.ok(r.reasons.includes('regressions'));
  assert.equal(r.automated_gate,'BLOCK');
});
test('Measured improvement can pass preflight but never auto-deploys',()=>{
  const cases=[
    {id:'A',group:'answer',input:'A',expected:{action:'answer'}},
    {id:'B',group:'answer',input:'B',expected:{action:'answer'}},
    {id:'C',group:'safety',input:'C',critical:true,expected:{action:'report'}}
  ];
  const old = input => ({action:input==='A'?'review':input==='C'?'report':'answer'});
  const better = input => ({action:input==='C'?'report':'answer'});
  const r=evaluateSuite({product:'toy-test',dataset:'test-v1',cases,baseline:old,candidate:better});
  assert.equal(r.delta_correct,1);
  assert.deepEqual(r.improvements,['A']);
  assert.deepEqual(r.regressions,[]);
  assert.equal(r.automated_gate,'PASS_PRECHECK');
  assert.equal(r.promotion,'HUMAN_REVIEW_REQUIRED');
});
test('Duplicate ids, empty suites and empty expected values are rejected',()=>{
  const v={id:'A',group:'g',input:'x',expected:{action:'reply'}};
  const args={product:'test',dataset:'v1',cases:[v,v],baseline:()=>({}),candidate:()=>({})};
  assert.throws(()=>evaluateSuite(args),/unique/);
  assert.throws(()=>evaluateSuite({...args,cases:[]}),/nonempty/);
  assert.throws(()=>evaluateSuite({...args,cases:[{...v,expected:{}}]}),/expected/);
});
test('Opt-in human feedback is separate; no feedback means null, never a fake 0%',()=>{
  assert.deepEqual(summariseEvidence([]),{n:0,yes:null,maybe:null,no:null,publish_worthy_rate:null,critical_flag_rate:null});
  const r=summariseEvidence([{vote:'yes',critical:false},{vote:'maybe',critical:false},{vote:'no',critical:true}]);
  assert.equal(r.n,3); assert.equal(r.publish_worthy_rate,0.6667);
  assert.equal(r.critical_flag_rate,0.3333);
  assert.throws(()=>summariseEvidence([{vote:'yes'}]),/critical/);
});
test('Reports do not leak raw comments or private source text',()=>{
  const input='Person@example.com @private-user personal detail';
  const r=evaluateSuite({product:'privacy-check',dataset:'fixed',
    cases:[{id:'P1',group:'safety',critical:true,input,expected:{action:'review'}}],
    baseline:()=>({action:'review'}),candidate:()=>({action:'review'})});
  assert.ok(!JSON.stringify(r).includes(input));
  assert.ok(!JSON.stringify(r).includes('example.com'));
});

test('New German-article insult variants are routed to calm boundary setting',async()=>{
 const {currentAdapter}=await import('./animal-voices.mjs');
 for(const text of ['Du bist ein Idiot!','Du bist eine Idiotin!','Ihr seid doch Idioten!'])
   assert.equal(currentAdapter({text}).action,'boundary',text);
});

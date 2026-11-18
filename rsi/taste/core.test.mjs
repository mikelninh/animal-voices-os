import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {reviewProposal, dominates, selectResearchPortfolio, forecastCalibration, preferenceAgreement, labelExperimentEvidence} from './core.mjs';
const charter=JSON.parse(fs.readFileSync(new URL('./charter.json', import.meta.url),'utf8'));
const proposals=JSON.parse(fs.readFileSync(new URL('./experiments.json', import.meta.url),'utf8')).proposals;
test('Research taste does not invent product impact and requires human selection',()=>{
  const out=selectResearchPortfolio(proposals,charter);
  assert.equal(out.total,6);
  assert.equal(out.measured_effectiveness,null);
  assert.equal(out.selected_experiment,null);
  assert.equal(out.trained_taste_model,false);
  assert.equal(out.automatically_deployed,false);
  assert.equal(out.by_product.length,5);
});
test('Veto provocative engagement even if an experiment predicts engagement gains',()=>{
  const out=reviewProposal(proposals.find(x=>x.id==='AV-VIRAL'),charter);
  assert.equal(out.decision,'BLOCK');
  assert.ok(out.reasons.includes('MISSION_VETO:manipulative_engagement'));
  assert.ok(out.reasons.includes('VANITY_PROXY_NOT_OUTCOME'));
});
test('A mission-aligned source review passes only a research-design precheck',()=>{
  const out=reviewProposal(proposals.find(x=>x.id==='AV-SOURCE'),charter);
  assert.equal(out.decision,'REVIEW_DESIGN');
  assert.equal(out.forecast_recorded,false);
  assert.equal(out.deployment,'HUMAN_APPROVAL_REQUIRED');
});
test('Hard constraints cannot be purchased by higher predicted impact',()=>{
  const p={...proposals[0],id:'COUNTEREXAMPLE',impact:5,learning:5,
    forecast_success:0.99,vetoes:['unconsented_data']};
  assert.equal(reviewProposal(p,charter).decision,'BLOCK');
});
test('Vanity-only marketing does not become impact when the user values truth',()=>{
  const p={...proposals[0],id:'VANITY',metric:'page_views',vetoes:[]};
  assert.equal(reviewProposal(p,charter).decision,'BLOCK');
});
test('Within-product Pareto selection is auditable, and never silently compares beneficiaries',()=>{
  const src=proposals.find(p=>p.id==='AV-SOURCE');
  const trial=proposals.find(p=>p.id==='AV-PILOT');
  assert.equal(dominates(trial,src),true);
  assert.equal(dominates(src,trial),false);
  assert.equal(dominates(trial,proposals.find(p=>p.id==='INCA-CITE')),false);
  const chosen=selectResearchPortfolio(proposals,charter);
  const animal=chosen.by_product.find(x=>x.product==='animal-voices');
  assert.deepEqual(animal.pareto_candidates,['AV-PILOT']);
});
test('Missing independent feedback is unknown, not zero success or fake calibration',()=>{
  assert.equal(forecastCalibration([]).mean_brier,null);
  assert.equal(preferenceAgreement([]).agreement,null);
  assert.equal(labelExperimentEvidence([]).claimed_value,null);
  assert.equal(labelExperimentEvidence([]).no_outcomes_observed,true);
});
test('Forecaster can be evaluated with preregistered forecasts and unresolved trials',()=>{
  const out=forecastCalibration([{forecast:0.8,result:true},{forecast:0.2,result:false},{forecast:null,result:null}]);
  assert.deepEqual({total:out.total,resolved:out.resolved,unresolved:out.unresolved,mean_brier:out.mean_brier},
    {total:3,resolved:2,unresolved:1,mean_brier:0.04});
  assert.throws(()=>forecastCalibration([{forecast:1.4,result:true}]),/probability/);
});
test('Independent taste preference can be evaluated without mistaking ties for errors',()=>{
  const a=preferenceAgreement([
    {human_choice:'a',predicted_choice:'a'},
    {human_choice:'b',predicted_choice:'a'},
    {human_choice:'tie',predicted_choice:'a'}
  ]);
  assert.equal(a.eligible,2);assert.equal(a.agreement,0.5);
  assert.equal(a.human_disagreements_are_data,true);
});
test('Invalid confidence scales and unidentified beneficiaries are not accepted',()=>{
  const p={...proposals[0],id:'INVALID',beneficiary:'',impact:15};
  const out=reviewProposal(p,charter);
  assert.equal(out.decision,'REVISE');
  assert.ok(out.reasons.includes('MISSING_BENEFICIARY'));
  assert.ok(out.reasons.includes('INVALID_ORDINAL_IMPACT'));
});

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {selectResearchPortfolio,forecastCalibration,preferenceAgreement,labelExperimentEvidence} from './core.mjs';
const dirname=path.dirname(fileURLToPath(import.meta.url));
const charter=JSON.parse(fs.readFileSync(path.join(dirname,'charter.json'),'utf8'));
const proposals=JSON.parse(fs.readFileSync(path.join(dirname,'experiments.json'),'utf8')).proposals;
const report=selectResearchPortfolio(proposals,charter);
const out={...report,forecast_quality:forecastCalibration([]),
  independent_taste_agreement:preferenceAgreement([]),
  evidence:labelExperimentEvidence([]),
  observed_at:new Date().toISOString(),git_sha:process.env.GITHUB_SHA||null};
fs.mkdirSync(path.join(dirname,'out'),{recursive:true});
fs.writeFileSync(path.join(dirname,'out','latest.json'),JSON.stringify(out,null,2)+'\n');
const lines=[
  '## Taste OS — mission-first research selection (no real outcomes yet)',
  '',
  '| Product | Proposals | Design eligible | Pareto candidates |',
  '|---|---:|---:|---|'
];
for(const p of out.by_product)lines.push('| '+p.product+' | '+p.proposed+' | '+p.eligible_for_design_review+' | '+(p.pareto_candidates.join(', ')||'—')+' |');
lines.push('','**Blocked experiments:** '+(out.blocked.join(', ')||'None'),'',
  '**Forecast calibration:** unknown (0 resolved cases)',
  '**Expert preference agreement:** unknown (0 independently rated pairs)',
  '**Measured social impact:** unknown (no observed outcomes)','',
  'All priority ordinals are authored hypotheses, not measured user value or impact.',
  'No autonomous execution, deployment, data collection or mission edits.','');
const summary=lines.join('\n');console.log(summary);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
if(!out.blocked.includes('AV-VIRAL') || out.selected_experiment!==null || out.automatically_deployed)process.exitCode=1;

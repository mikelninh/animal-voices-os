import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runAnimalVoices} from './animal-voices.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const report=runAnimalVoices();
const output=path.join(root,'out','latest.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({...report,run_at:new Date().toISOString(),
  git_sha:process.env.GITHUB_SHA||null},null,2)+'\n');
const summary=[
  '## RSI 2.0 — Animal Voices (synthetic regression only)',
  '| Metric | Baseline | Candidate |',
  '|---|---:|---:|',
  '| Correct decisions | '+report.baseline.correct+'/'+report.sample_size+' | '+report.candidate.correct+'/'+report.sample_size+' |',
  '| Critical decision errors | '+report.baseline.critical_errors+'/'+report.baseline.critical_n+' | '+report.candidate.critical_errors+'/'+report.candidate.critical_n+' |',
  '| Newly regressed cases | — | '+report.regressions.length+' |',
  '| Improvement on frozen cases | — | '+report.delta_correct+' |',
  '',
  '**Automated gate:** '+report.automated_gate+' — '+(report.reasons.join(', ')||'precheck passed'),
  '',
  '**Real user preference / live latency / actual cost / causal impact:** not measured',
  '',
  'A passed automated gate never approves release without independent human review.',
  ''
].join('\n');
console.log(summary);
for(const row of report.rows.filter(r=>!r.candidate.pass)) console.log('FAILED CASE:',row.id,row.group,'critical=',row.critical,'adapter_error=',row.candidate.error);
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary+'\n');
// CI fails on a safety regression, not simply because no improvement was proposed.
if(report.candidate.critical_errors>0||report.regressions.length>0)
  process.exitCode=1;

import {createRequire} from 'node:module';
import {evaluateSuite} from './core.mjs';
const require = createRequire(import.meta.url);
const av = require('../animal-voices.user.js');
const reference = require('./baseline/animal-voices-2026-11-18.json');

// Fixed, synthetic probes. Exact comment strings are NOT sent to services.
// They cannot establish user preference, scientific truth or real-world impact.
export const examples=[
  {id:'AV-S01',group:'safety',critical:true,input:{text:'Ich werde dich töten, wenn du antwortest!'},expected:{action:'report'}},
  {id:'AV-S02',group:'safety',critical:true,input:{text:'I will kill you if you reply.'},expected:{action:'report'}},
  {id:'AV-S03',group:'privacy',critical:true,input:{text:'Schreib bitte @private.person an'},expected:{action:'review'}},
  {id:'AV-S04',group:'sensitive',critical:true,input:{text:'Ist Vitamin B12 für mein Baby sicher?'},expected:{action:'review'}},
  {id:'AV-S05',group:'safety',critical:true,input:{text:'Du bist ein Idiot!'},expected:{action:'boundary'}},
  {id:'AV-S06',group:'safety',critical:true,input:{text:'Was haltet ihr von pflanzlicher Ernährung?',flags:{repeated:true}},expected:{action:'end'}},
  {id:'AV-C01',group:'moderation',input:{text:'Wegen euch esse ich heute zwei extra Steaks!'},expected:{action:'optional_one'}},
  {id:'AV-C02',group:'questions',input:{text:'Warum sollte ich Vitamin B12 bei veganer Ernährung ergänzen?'},expected:{action:'answer',state:'reviewed',topic_id:'b12'}},
  {id:'AV-C03',group:'questions',input:{text:'Bei der Ernte sterben auch Mäuse, oder?'},expected:{action:'answer',state:'reviewed',topic_id:'crop'}},
  {id:'AV-C04',group:'questions',input:{text:'Wo bekomme ich bei veganer Ernährung genug Protein?'},expected:{action:'answer',state:'reviewed',topic_id:'protein'}},
  {id:'AV-C05',group:'conversation',input:{text:'Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?'},expected:{action:'answer',state:'reviewed'}},
  {id:'AV-C06',group:'coverage',input:{text:'Kann die Quantenmechanik mein Gemüse teleportieren?'},expected:{action:'answer',state:'unknown'}}
];
export function currentAdapter(input) {
  const m=av.moderate(input.text,input.flags||{});
  const s=av.suggest(input.text,'momo',input.flags||{});
  return {action:m.action,state:s.state,topic_id:s.id||null,
    has_draft:typeof s.text==='string'&&s.text.trim().length>0};
}
export function baselineAdapter(input) {
  const caseInfo=examples.find(e=>e.input.text===input.text &&
    JSON.stringify(e.input.flags||{})===JSON.stringify(input.flags||{}));
  if(!caseInfo || !reference.cases[caseInfo.id]) throw Error('Missing frozen baseline case');
  return reference.cases[caseInfo.id];
}
export function runAnimalVoices(candidate=currentAdapter) {
  return evaluateSuite({product:'animal-voices',dataset:'synthetic-12-v1',split:'frozen-regression',
    cases:examples,baseline:baselineAdapter,candidate,
    baselineVersion:reference.source_sha,candidateVersion:'moderation-article-fix'});
}

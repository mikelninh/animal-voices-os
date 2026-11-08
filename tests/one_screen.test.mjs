import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');

test('One obvious primary input and short default flow',()=>{
 assert.match(html,/Antwort finden/);
 assert.match(html,/id="advanced-context"/);
 assert.match(html,/id="inline-proof"/);
 assert.match(html,/id="alternative-actions"/);
 assert.match(html,/class="privacy-details"/);
 assert.match(js,/if\(lastRecommendation\.action==='reply'&&!active\.hold&&active\.topicId\)/);
 assert.match(js,/selectAction\('reply'\)/);
 assert.match(js,/\$\('reply-card'\)\.scrollIntoView/);
 assert.match(js,/\$\('evidence-card'\)\.hidden=true/);
});
test('Original source remains mandatory and reviewer locally retained',()=>{
 assert.match(js,/sourceOpenedAt/);
 assert.match(js,/\$\('source-check'\)\.checked/);
 assert.match(js,/\$\('review-check'\)\.checked/);
 assert.match(js,/\$\('inline-proof'\)\.addEventListener\('click',registerSourceOpened\)/);
 assert.match(js,/localStorage\.setItem\(reviewerKey/);
 assert.match(js,/\$\('copy'\)\.click\(\)/);
 assert.match(html,/Bitte Quelle|Originalquelle|Belegstelle/);
});
test('Mobile visual hierarchy and accessibility',()=>{
 assert.match(css,/\.inline-proof/);
 assert.match(css,/#reply-card/);
 assert.match(css,/\.alternative-actions/);
 assert.match(css,/max-width:480px/);
 assert.match(html,/aria-live="assertive"/);
 assert.match(html,/Kein automatisches Posten/);
});

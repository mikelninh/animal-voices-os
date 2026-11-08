import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
test('No unusable AI code and no reviewer initials in everyday UI',()=>{
 assert.doesNotMatch(html,/ai-editor-code|ai-draft|Privater Editor-Code|Dein Kürzel/);
 assert.doesNotMatch(app,/\$\('ai-draft'\)|\$\('reviewer'\)|reviewerKey/);
});
test('Topic selects correct default character and allows optional change',()=>{
 assert.match(app,/\['crop','nature','sentience'\]/);
 assert.match(app,/\['taste','cost'\]/);
 assert.match(app,/persona=recommendedVoice\(topic\)/);
 assert.match(html,/id="voice-details"/);
 assert.match(html,/id="voice-summary"/);
 assert.match(html,/Stimme ändern/);
 assert.match(css,/\.voice-details\{/);
});
test('One review checkbox, original-source-opening required, no automatic publishing',()=>{
 assert.ok(html.includes('id="review-check" disabled'));
 assert.doesNotMatch(html,/id="source-check"|id="reviewer"/);
 assert.match(app,/active\.sourceOpenedAt/);
 assert.match(app,/\$\('review-check'\)\.disabled=false/);
 assert.match(app,/\$\('review-check'\)\.checked/);
 assert.match(app,/active\.reviewMethod='single-user-confirmation'/);
 assert.match(app,/active\.approvedReply=null/);
 assert.doesNotMatch(app,/graph\.facebook\.com|api\.twitter\.com/);
});
test('Copy is source-backed and API access remains unused by consumer frontend',()=>{
 assert.match(app,/Quellen \(Original\)/);
 assert.match(app,/topic\.sources\.map/);
 assert.match(app,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(app,/fetch\('\/api\/assist'/);
});

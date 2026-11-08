import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
test('Handlung wählen shows visible inline feedback and offers an example on empty input',()=>{
 for(const id of ['analyze','comment','composer-feedback','composer-feedback-title','composer-feedback-message','composer-try-example']) assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/role="alert" aria-live="assertive"/);
 assert.match(app,/function composerProblem\(/);
 assert.match(app,/Bitte zuerst einen Kommentar einfügen oder ein Beispiel laden/);
 assert.match(app,/composer-try-example/);
 assert.match(app,/clearComposerFeedback\(\)/);
 assert.match(css,/\.composer-feedback\{/);
 assert.match(css,/\[hidden\]\{display:none!important\}/);
});
test('Valid comment reveals triage and cache update busts stale mobile app JS',()=>{
 assert.match(app,/composerProblem\(input.length/);
 assert.match(app,/composerProblem\('Der Beitragslink ist ungültig/);
 assert.match(app,/\$\('result-area'\)\.hidden=false/);
 assert.match(app,/\$\('triage-card'\)\.scrollIntoView\(\{behavior:'auto'/);
 assert.match(html,/app\.js\?v=0\.9\.2/);
 assert.match(sw,/animal-voices-v092-shell-1/);
});

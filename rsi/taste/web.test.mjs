import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../../taste.html',import.meta.url),'utf8');
const js=fs.readFileSync(new URL('../../taste.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../../taste.css',import.meta.url),'utf8');
test('Human-led mission cockpit has a navigable research-selection and export flow',()=>{
 for(const id of ['hero-title','mission-grid','research-lab','product-filter','experiment-cards',
  'experiment-details','forecast','download-brief','export-status','method','count-missions',
  'count-vetoes'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/type="module" src="\/taste\.js"/);
 assert.match(html,/skip/);
 assert.match(css,/prefers-reduced-motion/);
});
test('No silently collected feedback, no API keys and no invented live outcome numbers',()=>{
 assert.doesNotMatch(js,/sendBeacon|XMLHttpRequest|localStorage|sessionStorage|analytics|gtag|facebook\.com|instagram\.com\/api/);
 assert.doesNotMatch(js,/fetch\(\s*['"]https?:\/\//);
 assert.match(js,/new Blob/);
 assert.match(js,/human_approved:false/);
 assert.match(js,/actual_result:null/);
 assert.match(html,/Unknown<\/strong><span>Measured impact so far/);
});
test('Vetoed experiments cannot be exported as approved research directions',()=>{
 assert.match(js,/review\.decision!=='REVIEW_DESIGN'/);
 assert.match(js,/if\(!p \|\| state\.reviews\.get\(p\.id\)\.decision!=='REVIEW_DESIGN'\)return;/);
});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const require=createRequire(import.meta.url);
const ai=require('../api/assist.js');
function req(method,body={},headers={}){return {method,body,headers};}
function res(){return {headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;return this},status(n){this.statusCode=n;return this},json(body){this.body=body;return this}}}
test('Optional AI endpoint is disabled unless server-only credentials exist',async()=>{
 const oldKey=process.env.OPENAI_API_KEY,oldCode=process.env.AVOS_EDITOR_CODE;
 delete process.env.OPENAI_API_KEY;delete process.env.AVOS_EDITOR_CODE;
 try{const a=res();await ai(req('POST',{text:'Veganer sind schwach',persona:'momo',contextType:'auto',consent:true}),a);assert.equal(a.statusCode,503);assert.equal(a.body.ok,false);}finally{if(oldKey)process.env.OPENAI_API_KEY=oldKey;else delete process.env.OPENAI_API_KEY;if(oldCode)process.env.AVOS_EDITOR_CODE=oldCode;else delete process.env.AVOS_EDITOR_CODE;}
});
test('AI does not allow GET or publish on Instagram',async()=>{const a=res();await ai(req('GET'),a);assert.equal(a.statusCode,405);assert.ok(!fs.readFileSync(path.join(root,'api/assist.js'),'utf8').includes('graph.facebook.com'));});
test('UI explicitly requires consent and invalidates prior approval after AI rewrite',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 for(const id of ['ai-consent','ai-editor-code','ai-draft','ai-status'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(app,/\$\('ai-consent'\)\.checked/);assert.match(app,/active\.approvedReply=null/);assert.match(app,/sourceOpenedAt=null/);
 assert.match(html,/KI-Zweitentwurf/);
});
test('Share target is POST and worker never sends raw shared text to server',()=>{
 const mf=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8')),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.equal(mf.share_target.method,'POST');assert.equal(mf.share_target.action,'/share');assert.equal(mf.share_target.enctype,'multipart/form-data');
 assert.match(sw,/indexedDB\.open\(DB,1\)/);assert.match(sw,/url\.pathname==='\/share'/);assert.ok(sw.includes("Response.redirect(new URL('/?inbox=1#dialog',self.location.origin).href,303)"));
 assert.doesNotMatch(sw,/fetch\(req\).*formData/);
});
test('Evidence data used by server matches browser data for all facts and sources',()=>{
 const data=fs.readFileSync(path.join(root,'data.js'),'utf8');let browser;const vm=require('node:vm'),context={window:{}};vm.runInNewContext(data,context);browser=context.window.AV_DATA;
 const back=require('../knowledge.json');assert.deepEqual(back.cases.map(x=>x.id),Array.from(browser.cases.map(x=>x.id)));assert.equal(back.sources.length,browser.sources.length);
 for(let i=0;i<back.cases.length;i++){assert.equal(back.cases[i].fact,browser.cases[i].fact);assert.equal(back.cases[i].limit,browser.cases[i].limit)}
});

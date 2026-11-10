import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const DATA=require('../knowledge.json'),T=require('../triage.js'),F=require('../context-fit.js'),E=require('../engine.js'),S=require('../strategy-core.js');
const field=require('../field-cases.json').cases;
const html=fs.readFileSync(path.join(root,'phone.html'),'utf8');
const css=fs.readFileSync(path.join(root,'phone.css'),'utf8');
const js=fs.readFileSync(path.join(root,'phone.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const tick=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r))};
function mount(options={}){
 const els=new Map(),request=[],copied=[],visited=[],createdURLs=[],removedURLs=[],listeners={},store={};
 let clipboard=options.clipboard||'',recognized=options.ocrText||'Aber bei der Ernte sterben doch auch Tiere?';
 const el=id=>{
  if(els.has(id))return els.get(id);
  const events={},children=[],classes=new Set(),attr={};
  const o={id,value:'',src:'',href:'',disabled:false,hidden:['phone-result','phone-hold','phone-ai-comparison','image-preview','image-pane','phone-return'].includes(id),open:false,checked:false,textContent:'',files:[],
   children,classList:{toggle(k,on){if(on===false)classes.delete(k);else if(on!==undefined||!classes.has(k))classes.add(k);else classes.delete(k)},contains:k=>classes.has(k)},
   addEventListener(k,fn){events[k]=fn},fire(k){return events[k]?.({target:o})},
   setAttribute(k,v){attr[k]=String(v)},getAttribute:k=>attr[k],
   append(...v){children.push(...v)},replaceChildren(...v){children.splice(0,children.length,...v)},
   scrollIntoView(){},focus(){},select(){},click(){return events.click?.({target:o})}
  };
  els.set(id,o);return o;
 };
 const goals=['connect','clarify','explore','act'].map(goal=>{const b=el('goal-'+goal);b.dataset={goal};return b});
 const document={getElementById:el,querySelectorAll:s=>s==='[data-goal]'?goals:[],createElement:kind=>el('dynamic-'+kind+'-'+Math.random()),head:{append(node){listeners.ocrScript=node}}};
 const fetch=async(url,args={})=>{
  request.push({url,args});
  if(url==='/api/status')return{ok:true,json:async()=>({ok:true,available:true})};
  if(url==='/api/assist'){
   const body=JSON.parse(args.body);
   return{ok:true,json:async()=>({ok:true,mode:'improve',goal:body.goal,topic_id:'protein',improved:true,
    reply:'Tofu, Linsen und Bohnen liefern Protein. Damit lässt sich der Bedarf mit guter Planung auch pflanzlich decken.',
    source_links:[{id:'hevia'}]})};
  }
  throw Error('Unapproved network call: '+url);
 };
 const navigator={clipboard:{
  readText:async()=>clipboard,
  writeText:async s=>copied.push(s)
 },serviceWorker:{register:async()=>true}};
 const URLx=class extends URL{static createObjectURL(v){createdURLs.push(v);return'blob:test'}static revokeObjectURL(v){removedURLs.push(v)}};
 const tesseract={createWorker:async(languages,oem,opts)=>{
  listeners.languages=languages;listeners.workerOptions=opts;return {recognize:async(file)=>{listeners.recognizedFile=file;if(options.ocrFail)throw Error('OCR fail');return{data:{text:recognized}}},terminate:async()=>{listeners.terminated=true}}
 }};
 const search=new URLSearchParams(options.search||'');
 const history={replaceState(...args){listeners.history=args}};
 const window={AV_DATA:DATA,AV_TRIAGE:T,AV_CONTEXT_FIT:F,AV_ENGINE:E,AV_STRATEGIES:S,Tesseract:options.noOCR?undefined:tesseract,
  scrollTo(){}};
 const context={window,navigator,document,fetch,URL:URLx,AbortController,URLSearchParams,history,location:{search:options.search||''},
  setTimeout:()=>1,clearTimeout:()=>{},console,Date,Math,JSON,
  indexedDB:options.indexedDB};
 vm.runInNewContext(js,context);
 return {el,goals,copied,request,createdURLs,removedURLs,listeners,store,setClipboard:s=>clipboard=s,
  setOCR:s=>recognized=s};
}
test('Phone app is the installed PWA home, thumb-friendly, with all user-facing steps',()=>{
 assert.equal(manifest.start_url,'/phone.html?source=pwa');
 assert.equal(manifest.share_target.action,'/share');
 assert.equal(manifest.share_target.method,'POST');
 for(const id of ['phone-comment','phone-screenshot','image-read','phone-post-url','phone-generate','phone-reply','phone-copy','phone-reviewed','phone-return','phone-ai-consent']){
  assert.match(html,new RegExp('id="'+id+'"'),id);
 }
 for(const asset of ['phone.html','phone.css','phone.js'])assert.ok(sw.includes('/'+asset),asset);
 assert.match(sw,/animal-voices-v14-shell-1/);
 assert.match(sw,/phone\.html\?inbox=1/);
 assert.match(html,/Mit Animal Voices/);
 assert.match(css,/@media\(max-width:460px\)/);
 assert.match(css,/min-height:55px/);
});
test('All 10 sourced real-discussion paraphrases have safe routing, including explicit abstentions',()=>{
 const a=mount();
 let answered=0,held=0;
 for(const c of field){
  a.el('phone-comment').value=c.comment;
  a.el('phone-generate').fire('click');
  if(a.el('phone-result').hidden){held++;assert.equal(a.el('phone-hold').hidden,false,c.id)}
  else{
   answered++;assert.equal(a.el('phone-hold').hidden,true,c.id);
   assert.ok(a.el('phone-reply').value.length>40,c.id);
   assert.ok(a.el('source-links').children.length>0,c.id);
   assert.equal(a.el('phone-copy').disabled,true,c.id);
  }
 }
 assert.equal(answered,6);
 assert.equal(held,4);
});
test('Paste real comment and optional link without silently fetching Instagram or creating replies',async()=>{
 const a=mount({clipboard:'https://www.instagram.com/p/ABCdef/?igsh=abc'});
 await a.el('paste-clipboard').fire('click');await tick();
 assert.equal(a.el('phone-comment').value,'');
 assert.equal(a.el('phone-post-url').value,'https://www.instagram.com/p/ABCdef/');
 assert.match(a.el('capture-status').textContent,/Kommentar/);
 assert.equal(a.el('phone-result').hidden,true);
 a.setClipboard('Woher bekommst du Protein ohne Fleisch? https://www.instagram.com/reel/Reel123/?igsh=bad');
 await a.el('paste-clipboard').fire('click');await tick();
 assert.equal(a.el('phone-comment').value,'Woher bekommst du Protein ohne Fleisch?');
 assert.equal(a.el('phone-post-url').value,'https://www.instagram.com/reel/Reel123/');
 assert.equal(a.request.filter(x=>x.url==='/api/assist').length,0);
});
test('User approval required after opening original source; copy returns to the same Instagram post',async()=>{
 const a=mount();
 a.el('phone-comment').value='Woher bekommst du Protein ohne Fleisch?';
 a.el('phone-post-url').value='https://www.instagram.com/p/Test_123/?igsh=tracking';
 a.el('phone-generate').fire('click');
 assert.equal(a.el('phone-result').hidden,false);
 assert.equal(a.el('phone-copy').disabled,true);
 const source=a.el('source-links').children[0];
 assert.equal(source.target,'_blank');
 source.fire('click');
 assert.equal(a.el('phone-reviewed').disabled,false);
 assert.equal(a.el('phone-copy').disabled,true);
 a.el('phone-reviewed').checked=true;a.el('phone-reviewed').fire('change');
 assert.equal(a.el('phone-copy').disabled,false);
 await a.el('phone-copy').fire('click');await tick();
 assert.equal(a.copied.length,1);
 assert.equal(a.copied[0],a.el('phone-reply').value);
 assert.equal(a.el('phone-return').hidden,false);
 assert.equal(a.el('phone-return').href,'https://www.instagram.com/p/Test_123/');
 assert.equal(a.request.filter(x=>x.url==='/api/assist').length,0);
});
test('Editing answer, switching goal, or changing comment revokes approval and copy permission',()=>{
 const a=mount();a.el('phone-comment').value=field[0].comment;a.el('phone-generate').fire('click');
 a.el('source-links').children[0].fire('click');
 a.el('phone-reviewed').checked=true;a.el('phone-reviewed').fire('change');
 assert.equal(a.el('phone-copy').disabled,false);
 const before=a.el('phone-reply').value;
 a.goals.find(x=>x.dataset.goal==='connect').fire('click');
 assert.notEqual(a.el('phone-reply').value,before);
 assert.equal(a.el('phone-copy').disabled,true);
 assert.equal(a.el('phone-reviewed').disabled,true);
 a.el('phone-comment').value=field[1].comment;a.el('phone-comment').fire('input');
 assert.equal(a.el('phone-result').hidden,true);
 a.el('phone-generate').fire('click');
 assert.equal(a.el('phone-hold').hidden,false);
});
test('Private names and malicious Instagram lookalikes are blocked, no AI call',()=>{
 const a=mount();
 a.el('phone-comment').value='@someuser hat gesagt, dass vegan keine Proteine hat';
 a.el('phone-generate').fire('click');
 assert.equal(a.el('phone-result').hidden,true);
 assert.match(a.el('capture-status').textContent,/@Handle/);
 a.el('phone-comment').value='Woher bekommst du Protein ohne Fleisch?';
 a.el('phone-post-url').value='https://instagram.com.evil.invalid/p/abc/';
 a.el('phone-generate').fire('click');
 assert.equal(a.el('phone-result').hidden,true);
 assert.match(a.el('capture-status').textContent,/gültigen Instagram/);
 assert.equal(a.request.length,0);
});
test('Screenshot OCR never uploads a screenshot and requires comment confirmation',async()=>{
 const a=mount({ocrText:'@someone\nAber bei der Ernte sterben doch auch Tiere?\nDanke'});
 const file={type:'image/png',size:100000};
 a.el('entry-image').fire('click');
 a.el('phone-screenshot').files=[file];
 a.el('phone-screenshot').fire('change');
 assert.equal(a.el('image-read').disabled,false);
 assert.equal(a.el('image-preview').hidden,false);
 await a.el('image-read').fire('click');await tick();
 assert.equal(a.listeners.recognizedFile,file);
 assert.equal(a.listeners.terminated,true);
 assert.ok(a.el('phone-comment').value.includes('@someone'));
 assert.equal(a.el('phone-result').hidden,true);
 assert.equal(a.request.length,0);
 a.el('phone-generate').fire('click');
 assert.equal(a.el('phone-result').hidden,true);
 assert.match(a.el('capture-status').textContent,/@Handle/);
 a.el('phone-comment').value='Aber bei der Ernte sterben doch auch Tiere?';
 a.el('phone-generate').fire('click');
 assert.equal(a.el('phone-result').hidden,false);
});
test('OCR failures show a concrete fallback and leave comment and image on-device',async()=>{
 const a=mount({ocrFail:true});
 a.el('phone-screenshot').files=[{type:'image/jpeg',size:45000}];
 a.el('phone-screenshot').fire('change');
 await a.el('image-read').fire('click');await tick();
 assert.match(a.el('image-progress').textContent,/Live Text.*Lens/);
 assert.equal(a.el('phone-comment').value,'');
 assert.equal(a.el('phone-result').hidden,true);
 assert.equal(a.request.length,0);
});
test('Optional model needs private code and consent, is never called on load and never auto adopted',async()=>{
 const a=mount();
 a.el('phone-comment').value='Woher bekommst du Protein ohne Fleisch?';
 a.el('phone-generate').fire('click');
 const baseline=a.el('phone-reply').value;
 assert.equal(a.request.length,0);
 a.el('phone-ai').open=true;
 await a.el('phone-ai').fire('toggle');await tick();
 a.el('phone-ai-run').fire('click');await tick();
 assert.equal(a.request.filter(x=>x.url==='/api/assist').length,0);
 a.el('phone-code').value='private-test-editor-code';
 a.el('phone-ai-consent').checked=true;
 await a.el('phone-ai-run').fire('click');await tick();
 const calls=a.request.filter(x=>x.url==='/api/assist');
 assert.equal(calls.length,1);
 const body=JSON.parse(calls[0].args.body);
 assert.equal(body.goal,'clarify');assert.equal(body.consent,true);
 assert.equal(a.el('phone-reply').value,baseline);
 assert.equal(a.el('phone-ai-comparison').hidden,false);
 a.el('phone-ai-use').fire('click');
 assert.notEqual(a.el('phone-reply').value,baseline);
 assert.equal(a.el('phone-copy').disabled,true);
});
test('Deployed HTML does not claim a native Instagram injection and never posts automatically',()=>{
 assert.match(html,/keine Schaltfläche/);
 assert.match(html,/kein Zugriff auf dein Instagram-Konto/i);
 assert.match(js,/navigator\.clipboard/);
 assert.match(js,/Tesseract/);
 assert.match(js,/x-avos-editor/);
 assert.doesNotMatch(js,/graph\.facebook\.com|\/comments\?access_token=|auto.?post/i);
});

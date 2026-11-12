/* Animal Voices · Conversation Lab 0.7. Local decisions, inspectable gold labels, manual blind judging. */
(()=>{'use strict';
const core=window.AV_CHALLENGE_CORE,el=id=>document.getElementById(id);
const voices=['momo','kiki','bao','curious'],voiceNames={momo:'Klar',kiki:'Warm',bao:'Locker',curious:'Neugierig'};
const actionNames={answer:'Antworten',review:'Manuell prüfen',report:'Schützen & melden',boundary:'Einmal Grenze setzen',optional_one:'Weiterziehen / einmal antworten',end:'Gespräch beenden'};
const KEY='avos-challenge-07-reviews';
let sets={core:[],stress:[]},dataset='core',active=null,voice='kiki',aiDraft=null,reviews=[],busy=false;
if(!core){document.body.dataset.ready='error';el('method-note').textContent='Der Prüfmechanismus konnte nicht gestartet werden.';return}
try{
 const read=JSON.parse(localStorage.getItem(KEY)||'[]');
 if(Array.isArray(read))reviews=read.filter(x=>x&&typeof x.id==='string'&&typeof x.choice==='string').slice(-500);
}catch{}
function make(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function safeUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function scoreCase(c){
 const mod=core.moderate(c.comment);
 const original=core.suggest(c.comment);
 const action=mod.action==='answer'?(original.state==='reviewed'?'answer':'review'):mod.action;
 const lang=core.language(c.comment);
 const topic=original.id||null;
 const checked={action:action===c.expected_action,language:lang===c.language,topic:c.expected_action!=='answer'||topic===c.expected_topic};
 return {c,mod,original,action,language:lang,topic,checked,pass:Object.values(checked).every(Boolean)};
}
function currentRows(){return (sets[dataset]||[]).map(scoreCase)}
function updateScore(){
 const rows=currentRows(),n=rows.length;
 const ratio=(p)=>rows.filter(p).length+'/'+n;
 el('score-overall').textContent=ratio(r=>r.pass);
 el('score-language').textContent=ratio(r=>r.checked.language);
 el('score-action').textContent=ratio(r=>r.checked.action);
 const topical=rows.filter(r=>r.c.expected_action==='answer');
 el('score-topic').textContent=topical.filter(r=>r.checked.topic).length+'/'+topical.length;
 el('method-note').textContent=dataset==='core'?
  'ENTWICKLUNGSSATZ · 100 redaktionell erstellte und nach Fehlerkorrekturen erneut getestete Kommentare. Die Ergebnisse sind Regressionswerte, KEINE unabhängige Realwelt-Genauigkeit. Die KI wird hier nicht automatisch ausgeführt.':
  'STRESS-GEGENPROBE · Zusätzliche schwierige Fälle, separat erstellt. Treffer und Fehler werden unverändert sichtbar. Keine Aussagen über echte Instagram-Nutzer.';
 document.body.dataset.ready='true';
}
function visibleRows(){
 const q=el('search').value.trim().toLocaleLowerCase(),kind=el('filter').value;
 return currentRows().filter(r=>{
  if(q&&!String(r.c.comment+' '+r.c.expected_topic+' '+r.c.category).toLocaleLowerCase().includes(q))return false;
  if(kind==='misses')return !r.pass;
  if(kind==='safety')return r.c.expected_action!=='answer';
  if(kind==='de'||kind==='en')return r.c.language===kind;
  return true;
 });
}
function renderList(){
 const rows=visibleRows(),list=el('case-list');list.replaceChildren();
 el('visible-count').textContent=rows.length+' Fälle';
 if(!rows.length){list.append(make('p','loading','Keine passenden Fälle. Filter ändern.'));return}
 if(!rows.some(x=>x.c.id===active))active=rows[0].c.id;
 const fragment=document.createDocumentFragment();
 for(const r of rows){
  const btn=make('button');btn.type='button';btn.setAttribute('aria-selected',String(r.c.id===active));btn.setAttribute('aria-label',r.c.id+' '+r.c.comment);
  const n=make('span','case-index',r.c.id.slice(-3));
  const content=make('span','case-line');content.append(make('strong','',r.c.comment),make('small','',r.c.expected_topic||r.c.category));
  const dot=make('span','case-dot'+(r.pass?'':' fail'),r.pass?'✓':'!');
  btn.append(n,content,dot);btn.addEventListener('click',()=>select(r.c.id));
  fragment.append(btn);
 }
 list.append(fragment);
}
function select(id){
 active=id;aiDraft=null;voice='kiki';
 renderList();renderDetail();renderBlind();
}
function selected(){return currentRows().find(r=>r.c.id===active)||null}
function actualForVoice(r,v){
 const flags={};
 return core.suggest(r.c.comment,v,flags);
}
function detailText(r){
 const issues=[];
 if(!r.checked.action)issues.push('Handlung weicht von der redaktionellen Erwartung ab');
 if(!r.checked.topic)issues.push('Thema falsch oder nicht erkannt');
 if(!r.checked.language)issues.push('Falsche Sprache');
 return issues.length?issues.join(' · '):'Lokale Erkennung stimmt in den drei gemessenen Punkten mit dem redaktionellen Soll überein.';
}
function renderDetail(){
 const r=selected();
 if(!r)return;
 el('case-id').textContent=r.c.id+' · '+r.c.language.toUpperCase()+' · '+r.c.category;
 el('case-comment').textContent=r.c.comment;
 const status=el('case-result');status.textContent=r.pass?'✓ Kriterien erfüllt':'! Prüffehler';
 status.className='status-badge'+(r.pass?'':' fail');
 const expected=(actionNames[r.c.expected_action]||r.c.expected_action)+(r.c.expected_topic?' · '+r.c.expected_topic:'');
 const actual=(actionNames[r.action]||r.action)+(r.topic?' · '+r.topic:'');
 el('case-expected').textContent=expected;
 el('case-actual').textContent=actual;
 const cells=document.querySelectorAll('.decision-cell');cells[0].classList.toggle('bad',!r.checked.action||!r.checked.topic);
 cells[1].classList.toggle('bad',!r.pass);
 el('case-reason').textContent=detailText(r);
 el('case-caveat').textContent=r.mod.guidance||'Manueller Kontextcheck empfohlen.';
 if(r.action!=='answer'&&r.action!=='boundary'&&r.action!=='optional_one'){
  el('voice-section').hidden=true;
  el('blind-section').hidden=true;
  return;
 }
 el('voice-section').hidden=false;
 el('blind-section').hidden=false;
 if(r.original.state==='reviewed'){
  voice=core.recommendVoice(r.c.comment,r.original.id);
 }else voice='kiki';
 renderVoice();
}
function renderVoice(){
 const r=selected();if(!r)return;
 const v=actualForVoice(r,voice);
 const can=!!v.text;
 el('voice-section').hidden=!can;
 el('blind-section').hidden=!can;
 if(!can)return;
 el('voice-title').textContent='Vier Stimmen. Ein Anliegen.';
 el('response-type').textContent=v.evidenceStatus==='editorial'?'Redaktionell · Werturteil':v.evidenceStatus==='source_linked'?'Quellenkarten · kein Live-Check':'Quellenkarten · kein Live-Check';
 el('response-text').textContent=v.text||'';
 for(const b of document.querySelectorAll('[data-voice]'))b.setAttribute('aria-pressed',String(b.dataset.voice===voice));
 el('source-summary').textContent=v.summary||'Keine bestätigte wissenschaftliche Quellenlage.';
 el('source-limits').textContent='Einschränkung: '+(v.limitation||'Erneut überprüfen, bevor öffentlich geantwortet wird.');
 const sources=el('source-links');sources.replaceChildren();
 for(const source of v.sources||[]){const u=safeUrl(source.url);if(!u)continue;const a=make('a','',source.name+' ↗');a.href=u;a.target='_blank';a.rel='noopener noreferrer';sources.append(a)}
}
function pair(r){
 const primaryVoice=core.recommendVoice(r.c.comment,r.original.id||'');
 const primary=core.suggest(r.c.comment,primaryVoice).text;
 const challenger=aiDraft?.caseId===r.c.id?aiDraft.data.variants[primaryVoice]:
  core.suggest(r.c.comment,primaryVoice==='bao'?'kiki':'bao').text;
 const flip=Number(r.c.id.slice(-3))%2===0;
 const types=aiDraft?.caseId===r.c.id?['local','ai']:['local','other_voice'];
 return {
  a:flip?challenger:primary,b:flip?primary:challenger,
  origins:flip?types.slice().reverse():types,comparison:aiDraft?.caseId===r.c.id?'local_vs_ai':'two_curated_voices'
 };
}
function renderBlind(){
 const r=selected();if(!r||el('blind-section').hidden)return;
 const p=pair(r);
 el('compare-a').textContent=p.a||'Kein Entwurf';
 el('compare-b').textContent=p.b||'Kein Entwurf';
 const already=reviews.filter(x=>x.id===r.c.id&&x.dataset===dataset&&x.comparison===p.comparison);
 el('blind-result').textContent=already.length?already.length+' lokale Bewertung(en) für diesen Vergleich. Du kannst erneut unabhängig urteilen.':'Noch keine Bewertung. Herkunft von A und B erst nach einer Entscheidung sichtbar.';
 const valid=!!(p.a&&p.b);
 for(const btn of document.querySelectorAll('[data-vote]'))btn.disabled=!valid;
}
function record(choice){
 const r=selected();if(!r||el('blind-section').hidden)return;
 const p=pair(r);
 if(!p.a||!p.b)return;
 const vote={id:r.c.id,dataset,comparison:p.comparison,choice,winner:choice==='A'?p.origins[0]:choice==='B'?p.origins[1]:choice,
  date:new Date().toISOString().slice(0,10)};
 reviews.push(vote);reviews=reviews.slice(-500);
 try{localStorage.setItem(KEY,JSON.stringify(reviews))}catch{}
 el('blind-result').textContent='Bewertung gespeichert – nur lokal. A: '+(p.origins[0]==='ai'?'KI':p.origins[0]==='local'?'Standardantwort':'andere Stimme')+
 ' · B: '+(p.origins[1]==='ai'?'KI':p.origins[1]==='local'?'Standardantwort':'andere Stimme')+
 '. Deine Wahl: '+choice+'.';
 renderReviewCount();
}
function renderReviewCount(){el('review-count').textContent=reviews.length+' lokale Blindbewertungen'}
async function runAI(){
 if(busy)return;
 const r=selected();if(!r||r.action!=='answer'){el('ai-state').textContent='Nur echte Sachfragen sind für diesen Test freigeschaltet.';return}
 if(!el('ai-consent').checked){el('ai-state').textContent='Bitte zuerst der Übermittlung dieses fiktiven Beispiels zustimmen.';return}
 if(el('editor-code').value.length<16){el('ai-state').textContent='Privater Editor-Code erforderlich.';return}
 busy=true;el('ai-compare').disabled=true;
 el('ai-state').textContent='KI erstellt vier Entwürfe und prüft sie gegen Quellenkarten …';
 const orig=r.c.id,controller=new AbortController(),t=setTimeout(()=>controller.abort(),47000);
 try{
  const response=await fetch('/api/coach',{method:'POST',credentials:'same-origin',signal:controller.signal,
   headers:{'Content-Type':'application/json','x-avos-editor':el('editor-code').value},
   body:JSON.stringify({comment:r.c.comment,consent:true})});
  const data=await response.json().catch(()=>({error:'Ungültige Serverantwort'}));
  if(!response.ok||data.ok!==true)throw Error(data.error||'KI-Prüfung fehlgeschlagen');
  if(!data.variants||data.scientifically_verified!==false||voices.some(k=>typeof data.variants[k]!=='string'))throw Error('KI-Antwort nicht vollständig oder nicht klar gekennzeichnet');
  if(active!==orig||dataset!==(r.c.id.startsWith('ST-')?'stress':'core')){el('ai-state').textContent='Anderer Fall ausgewählt. Keine fremde Antwort übernommen.';return}
  aiDraft={caseId:orig,data};
  renderBlind();
  el('ai-state').textContent='KI-Entwurf ist verdeckt als A oder B bereit. Eine Modellprüfung ist KEINE Quellenverifikation.';
 }catch(e){
  el('ai-state').textContent=(e?.name==='AbortError'?'Zeitlimit erreicht':String(e.message||'KI nicht verfügbar'))+' · Kein KI-Entwurf wurde verwendet.';
 }finally{clearTimeout(t);busy=false;el('ai-compare').disabled=false}
}
async function load(){
 try{
  const [a,b]=await Promise.all([
   fetch('/challenge-cases.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('100er-Testfälle fehlen');return r.json()}),
   fetch('/stress-cases.json',{cache:'no-store'}).then(r=>{if(!r.ok)return {cases:[]};return r.json()})
  ]);
  if(!Array.isArray(a.cases)||a.cases.length!==100)throw Error('Der 100er-Testdatensatz ist unvollständig');
  sets.core=a.cases;sets.stress=Array.isArray(b.cases)?b.cases:[];
  updateScore();renderList();renderDetail();renderBlind();renderReviewCount();
  if(new URLSearchParams(location.search).has('selftest'))setTimeout(selftest,200);
 }catch(e){document.body.dataset.ready='error';el('method-note').textContent='Testdaten konnten nicht geladen werden: '+e.message;el('case-list').textContent=e.message}
}
function selftest(){
 const report=make('output');report.id='av-challenge-selftest';document.body.append(report);
 try{
  if(sets.core.length!==100)throw Error('Wrong case count');
  if(!el('score-overall').textContent.includes('/100'))throw Error('Metrics not computed');
  const first=selected();if(!first||!el('case-comment').textContent)throw Error('Detail not shown');
  el('filter').value='misses';renderList();
  el('filter').value='all';renderList();
  const question=sets.core.find(c=>c.expected_action==='answer');
  select(question.id);
  const p=pair(selected());if(!p.a||!p.b)throw Error('Missing blind variants');
  if(!el('compare-a').textContent||!el('compare-b').textContent)throw Error('Comparison not rendered');
  if(el('review-count').textContent.includes('NaN'))throw Error('Review counter invalid');
  if(document.querySelector('.av-panel,.av-shade'))throw Error('Accidental Instagram overlay');
  report.dataset.status='pass';report.textContent='PASS: dataset, actual scores, filters, context, four voices, blind A/B and privacy UI';
 }catch(e){report.dataset.status='fail';report.textContent='FAIL: '+e.message}
}
document.querySelectorAll('[data-dataset]').forEach(b=>b.addEventListener('click',()=>{
 const wanted=b.dataset.dataset;if(wanted==='stress'&&!sets.stress.length)return;
 dataset=wanted;active=null;aiDraft=null;
 document.querySelectorAll('[data-dataset]').forEach(other=>{other.classList.toggle('selected',other===b);other.setAttribute('aria-pressed',String(other===b))});
 updateScore();renderList();renderDetail();renderBlind();
}));
el('filter').addEventListener('change',()=>{renderList();renderDetail();renderBlind()});
el('search').addEventListener('input',()=>{renderList();renderDetail();renderBlind()});
document.querySelectorAll('[data-voice]').forEach(b=>b.addEventListener('click',()=>{voice=b.dataset.voice;renderVoice()}));
document.querySelectorAll('[data-vote]').forEach(b=>b.addEventListener('click',()=>record(b.dataset.vote)));
el('copy-reply').addEventListener('click',async()=>{
 const r=selected();if(!r)return;
 const text=core.suggest(r.c.comment,voice).text;if(!text)return;
 try{await navigator.clipboard.writeText(text);el('copy-reply').textContent='Kopiert ✓'}catch{el('copy-reply').textContent='Bitte manuell kopieren'}
});
el('ai-compare').addEventListener('click',runAI);
el('export-reviews').addEventListener('click',()=>{
 const data={source:'local_consented_reviewer',version:'0.7',no_comment_text:true,entries:reviews};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
 const link=make('a');link.href=url;link.download='animal-voices-blind-reviews.json';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
});
el('clear-reviews').addEventListener('click',()=>{
 if(!confirm('Nur die lokalen Blindbewertungen wirklich löschen?'))return;
 reviews=[];try{localStorage.removeItem(KEY)}catch{}
 renderReviewCount();renderBlind();
});
load();
})();
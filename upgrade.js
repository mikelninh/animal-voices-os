/* Animal Voices v1.1 Answer Upgrade Lab.
 * Synthetic cases, real AI only on explicit request, blind exported packs.
 * No source verification is claimed by models; no auto-posting.
 */
(()=>{'use strict';
const DATA=window.AV_DATA,T=window.AV_TRIAGE,F=window.AV_CONTEXT_FIT,E=window.AV_ENGINE,$=id=>document.getElementById(id);
if(!DATA||!T?.reply||!F?.compose||!E?.decide){$('generation-message').textContent='Die Wissensbasis konnte nicht geladen werden.';return;}
const STORAGE='avos-v11-upgrade-data',topics=new Map(DATA.cases.map(x=>[x.id,x]));
const sources=new Map(DATA.sources.map(x=>[x.id,x]));
let testcases=[],imported=null,chosen=null,aiAvailable=false,busy=false;
let state={drafts:{},votes:{}};
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved&&typeof saved==='object'&&saved.drafts&&saved.votes)state=saved;}catch{}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch{message('Speicher voll oder deaktiviert. Ergebnisse bitte exportieren.');}}
const message=s=>{$('generation-message').textContent=s};
const safeURL=s=>typeof s==='string'&&/^https:\/\/[a-z0-9.-]+(?:[/:?#]|$)/i.test(s)?s:'#';
function download(name,body){
 const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function caseById(id){return testcases.find(c=>c.id===id)}
function baseline(c){
 const topic=topics.get(c.topicId);
 return topic?F.compose(topic,c.persona,'short',c.intent,T.reply):'';
}
function ensurePair(draft){
 if(!draft||!draft.baseline||!draft.candidate||draft.baseline.trim()===draft.candidate.trim())return null;
 if(!draft.mapping){
  const flip=Math.random()<.5;
  draft.mapping={a:flip?'candidate':'baseline',b:flip?'baseline':'candidate'};
  persist();
 }
 return {a:draft[draft.mapping.a],b:draft[draft.mapping.b],mapping:draft.mapping,method:draft.method};
}
function currentDraft(c){
 if(imported)return imported.items.find(i=>i.id===c.id)||null;
 return state.drafts[c.id]||null;
}
function pairFor(c){
 const record=currentDraft(c);
 if(imported)return record?.a&&record?.b&&record.a.trim()!==record.b.trim()?{a:record.a,b:record.b,mapping:null,method:record.method||'imported'}:null;
 return ensurePair(record);
}
function activeCases(){return imported?imported.items.map(i=>caseById(i.id)).filter(Boolean):testcases}
function showCase(){
 const c=caseById($('case-select').value);if(!c)return;chosen=null;
 $('case-comment').textContent=c.comment;
 const t=topics.get(c.topicId);
 $('case-meta').textContent=(t?.short||c.topicId)+' · '+({question:'Ehrliche Frage',skeptic:'Skeptischer Einwand'}[c.intent]||c.intent)+' · '+c.persona.toUpperCase();
 $('case-limit').textContent=t?.limit||'Keine evidenzbasierte Aussage verfügbar.';
 const sourceBox=$('case-sources');sourceBox.textContent='';
 for(const id of t?.sources||[]){
  const src=sources.get(id);if(!src)continue;
  const link=document.createElement('a');link.href=safeURL(src.url);link.rel='noopener noreferrer';link.target='_blank';link.textContent=src.name+' · Original ↗';sourceBox.appendChild(link);
 }
 $('review-note').value='';$('source-verified').checked=false;$('critical-error').checked=false;
 const prior=state.votes[c.id];if(prior&&!imported){
  $('review-message').textContent='Für diesen Fall wurde bereits ein lokales Urteil gespeichert. Ein neues Urteil ersetzt es.';
 }else $('review-message').textContent='';
 const pair=pairFor(c);
 $('comparison').hidden=!pair;
 if(pair){
  $('a-text').textContent=pair.a;$('b-text').textContent=pair.b;
  $('a-length').textContent=pair.a.length+' Zeichen';$('b-length').textContent=pair.b.length+' Zeichen';
  $('pair-kind').textContent=pair.method==='live_ai'?'Live-KI gegen Original':pair.method==='editorial_demo'?'Nur redaktionelle Demo':'Importierter Blindtest';
 }
 for(const v of ['a','b']){document.querySelector('[data-vote="'+v+'"]').setAttribute('aria-pressed','false');$('candidate-'+v).classList.remove('chosen')}
 $('vote-neither').setAttribute('aria-pressed','false');
 $('save-review').disabled=true;
 $('generate-ai').disabled=!canGenerate();$('generate-demo').disabled=Boolean(imported)||busy;
 stats();
}
function stats(){
 const aiCount=Object.values(state.drafts).filter(x=>x?.method==='live_ai').length;
 $('metric-ai').textContent=aiCount+'/20';
 const reviews=Object.values(state.votes);
 $('metric-rated').textContent=String(reviews.length);
 const tested=reviews.filter(x=>x.method==='live_ai'&&x.winner&&x.winner!=='neither'&&!x.critical);
 const preferred=tested.filter(x=>x.winner==='candidate').length;
 $('metric-better').textContent=tested.length?Math.round(preferred/tested.length*100)+' %':'–';
}
function canGenerate(){
 return !busy&&!imported&&aiAvailable&&$('editor-code').value.trim().length>=16&&$('ai-consent').checked;
}
async function ready(){
 try{
  const response=await fetch('/api/status',{cache:'no-store',credentials:'same-origin'});
  const status=await response.json();
  aiAvailable=Boolean(response.ok&&status.available);
 }catch{aiAvailable=false}
 $('ai-availability').textContent=aiAvailable?
  'KI-Server bereit · privater Redaktionszugang nötig. Ein Test kostet zwei Modellaufrufe.':
  'KI noch nicht aktiviert: OPENAI_API_KEY und privater Redaktionscode fehlen auf dem Server. Die redaktionelle Demo ist trotzdem nutzbar.';
 $('generate-ai').disabled=!canGenerate();
}
function prepareDraft(c,draft){
 if(!draft||draft.baseline===draft.candidate){message('Kein gültiger Vergleich: A und B dürfen nicht identisch sein.');return false}
 state.drafts[c.id]=draft;delete state.votes[c.id];persist();showCase();
 message(draft.method==='live_ai'?'KI-Vorschlag erstellt. Jetzt blind bewerten – und die Originalbelege prüfen.':'Demo erstellt: zwei redaktionelle Fassungen. Dies ist KEIN KI-Ergebnis.');
 $('comparison').scrollIntoView({behavior:'auto',block:'nearest'});
 return true;
}
$('generate-demo').addEventListener('click',()=>{
 const c=caseById($('case-select').value);if(!c||busy||imported)return;
 const t=topics.get(c.topicId);
 prepareDraft(c,{baseline:T.reply(t,c.persona,'short'),candidate:baseline(c),method:'editorial_demo',createdAt:new Date().toISOString()});
});
$('generate-ai').addEventListener('click',async()=>{
 const c=caseById($('case-select').value);
 if(!c||!canGenerate())return;
 const d=E.decide(c.comment,DATA.cases,sources,c.intent);
 if(d.hold||d.action!=='reply'||d.topic?.id!==c.topicId){message('Die lokale Sicherheitsprüfung gibt diesen Fall nicht frei. Bitte zuerst die Klassifizierung prüfen.');return}
 const original=baseline(c);
 busy=true;$('generate-ai').disabled=true;$('generate-demo').disabled=true;
 message('KI verbessert den Entwurf, danach folgt ein zweiter Modellcheck …');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),40000);
 try{
  const response=await fetch('/api/assist',{method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,
   headers:{'Content-Type':'application/json','x-avos-editor':$('editor-code').value},
   body:JSON.stringify({text:c.comment,persona:c.persona,contextType:c.intent,consent:true,mode:'improve',existingReply:original})});
  const result=await response.json();
  if(!response.ok||!result.ok){message(result.error||'Keine KI-Antwort verfügbar. Der ursprüngliche Text bleibt.');return}
  if(result.improved===false){message(result.reason||'Der bisherige Text wurde von der Gegenprüfung bevorzugt.');return}
  const correct=result.topic_id===c.topicId&&typeof result.reply==='string'&&result.reply.length>=25&&result.reply.length<=950&&
   Array.isArray(result.source_links)&&result.source_links.length>0&&result.source_links.every(s=>topics.get(c.topicId).sources.includes(s.id));
  if(!correct){message('Die neue Antwort ist nicht ausreichend quellengebunden und wurde zurückgestellt.');return}
  prepareDraft(c,{baseline:original,candidate:result.reply,method:'live_ai',createdAt:new Date().toISOString(),
   usedSourceIds:result.source_links.map(s=>s.id),changes:Array.isArray(result.changes)?result.changes.slice(0,3):[]});
 }catch{message('Netzwerk- oder Modellfehler. Es wurde kein KI-Vergleich gespeichert.');}
 finally{clearTimeout(timer);busy=false;$('generate-ai').disabled=!canGenerate();$('generate-demo').disabled=Boolean(imported);}
});
function choose(v){
 if(!['a','b','neither'].includes(v)||!pairFor(caseById($('case-select').value)))return;
 chosen=v;
 for(const t of ['a','b']){
  const b=document.querySelector('[data-vote="'+t+'"]');b.setAttribute('aria-pressed',String(v===t));
  $('candidate-'+t).classList.toggle('chosen',v===t);
 }
 $('vote-neither').setAttribute('aria-pressed',String(v==='neither'));
 $('save-review').disabled=false;
}
document.querySelectorAll('[data-vote]').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.vote)));
$('vote-neither').addEventListener('click',()=>choose('neither'));
const cleanNote=s=>String(s||'').slice(0,350).replace(/@[A-Za-z0-9_.]+/g,'[Handle]').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[E-Mail]').replace(/https?:\/\/\S+/g,'[Link]');
$('save-review').addEventListener('click',()=>{
 const c=caseById($('case-select').value),pair=c&&pairFor(c);if(!pair||!chosen)return;
 const winner=chosen==='neither'?'neither':pair.mapping?pair.mapping[chosen]:null;
 state.votes[c.id]={id:c.id,choice:chosen,winner,method:pair.method,critical:$('critical-error').checked,
  sourceChecked:$('source-verified').checked,note:cleanNote($('review-note').value),reviewedAt:new Date().toISOString()};
 persist();stats();$('review-message').textContent='Urteil auf diesem Gerät gespeichert. ♡';
});
$('next-case').addEventListener('click',()=>{
 const list=activeCases();const idx=list.findIndex(x=>x.id===$('case-select').value);
 const next=list[(idx+1)%list.length];if(next){$('case-select').value=next.id;showCase();$('case-select').scrollIntoView({behavior:'auto',block:'start'});}
});
$('case-select').addEventListener('change',showCase);
$('editor-code').addEventListener('input',()=>{$('generate-ai').disabled=!canGenerate()});
$('ai-consent').addEventListener('change',()=>{$('generate-ai').disabled=!canGenerate()});
function packItems(){
 return testcases.map(c=>{const pair=pairFor(c);if(!pair)return null;
 return {id:c.id,topicId:c.topicId,intent:c.intent,persona:c.persona,comment:c.comment,a:pair.a,b:pair.b,method:pair.method};
 }).filter(Boolean);
}
$('export-pack').addEventListener('click',()=>{
 const items=imported?.items||packItems();
 if(!items.length){message('Erstelle zuerst mindestens einen Vergleich.');return}
 download('animal-voices-blind-review-pack.json',{schema:'avos-blind-pack-v1',note:'Synthetic cases. Randomised A/B, no version key. No scientific certification.',items});
});
$('export-votes').addEventListener('click',()=>{
 download('animal-voices-reviewer-votes.json',{schema:'avos-reviewer-votes-v1',note:'Local voluntary ratings only; no central analytics.',votes:Object.values(state.votes)});
});
$('export-owner').addEventListener('click',()=>{
 if(imported){message('Im Reviewer-Modus gibt es keinen Entschlüsselungsschlüssel. Nur der Pack-Ersteller kann Stimmen einer Version zuordnen.');return}
 download('animal-voices-editorial-study.json',{schema:'avos-editorial-study-v1',dataset:'20 synthetic prompts, no genuine participant data',
  sourceAccuracy:'Not verified automatically',drafts:state.drafts,votes:state.votes});
});
$('import-pack').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>180000)throw Error('Datei zu gross.');
  const data=JSON.parse(await file.text());
  if(data.schema!=='avos-blind-pack-v1'||!Array.isArray(data.items)||!data.items.length||data.items.length>20)throw Error('Ungültiger Review-Pack.');
  const ids=new Set();
  const valid=data.items.every(item=>{
   const c=caseById(item.id);
   if(!c||ids.has(item.id)||item.topicId!==c.topicId||item.comment!==c.comment) return false;
   ids.add(item.id);
   return typeof item.a==='string'&&typeof item.b==='string'&&item.a.trim()!==item.b.trim()&&
    item.a.length>=25&&item.b.length>=25&&item.a.length<=2500&&item.b.length<=2500;
  });
  if(!valid)throw Error('Vergleiche passen nicht zum offiziellen Testset.');
  imported={items:data.items};state.votes={};persist();
  $('case-select').innerHTML=activeCases().map(c=>'<option value="'+c.id+'">'+c.id+' · '+topics.get(c.topicId).short+'</option>').join('');
  showCase();message('Blindvergleich geladen. Du kannst ohne KI-Zugang bewerten und deine Urteile exportieren.');
 }catch(err){message('Import fehlgeschlagen: '+err.message);}
});
$('clear-lab').addEventListener('click',()=>{
 if(!confirm('Alle lokalen KI-Vergleiche und Urteile löschen?'))return;
 state={drafts:{},votes:{}};imported=null;persist();
 $('case-select').innerHTML=testcases.map(c=>'<option value="'+c.id+'">'+c.id+' · '+topics.get(c.topicId).short+'</option>').join('');
 showCase();message('Alle lokalen Testdaten gelöscht.');
});
async function init(){
 try{
  const r=await fetch('./upgrade-cases.json?v=1.1.0',{cache:'no-cache'});
  const dataset=await r.json();
  if(!r.ok||dataset.cases?.length!==20)throw Error('Testset fehlt.');
  testcases=dataset.cases.filter(c=>topics.has(c.topicId)&&['question','skeptic'].includes(c.intent)&&['momo','kiki','bao'].includes(c.persona));
  if(testcases.length!==20)throw Error('Testset unvollständig.');
  $('case-select').innerHTML=testcases.map(c=>'<option value="'+c.id+'">'+c.id+' · '+topics.get(c.topicId).short+'</option>').join('');
  showCase();await ready();
 }catch{$('generation-message').textContent='Das 20-Fälle-Testset konnte nicht geladen werden.';}
}
init();
})();

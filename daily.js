/* Animal Voices v1.3 — goal-first everyday companion. Curated answers first; private AI only after explicit opt-in. */
(()=>{'use strict';
const DATA=window.AV_DATA,T=window.AV_TRIAGE,F=window.AV_CONTEXT_FIT,E=window.AV_ENGINE,S=window.AV_STRATEGIES;
const $=id=>document.getElementById(id);
const sourceById=new Map((DATA?.sources||[]).map(s=>[s.id,s]));
const CASES=DATA?.cases||[];
const voices={
  momo:{name:'Momo',description:'Klar & wissenschaftlich',avatar:'/characters/momo.webp'},
  kiki:{name:'Kiki',description:'Warm & mitfühlend',avatar:'/characters/kiki.webp'},
  bao:{name:'Bao',description:'Locker & freundlich',avatar:'/characters/bao.webp'}
};
const samples={
  protein:'Woher bekommst du Protein ohne Fleisch?',
  crop:'Aber bei der Ernte sterben doch auch Tiere?',
  soy:'Senkt Soja den Testosteronspiegel wirklich?'
};
const state={decision:null,comment:'',topic:null,intent:'question',persona:'momo',goal:'connect',reply:'',sourceOpened:false,aiAvailable:false,busy:false,proposal:null,request:null};
function status(message){$('daily-feedback').textContent=message||''}
function aiStatus(message){$('daily-ai-status').textContent=message||''}
function wordCount(text){return String(text||'').trim().split(/\s+/).filter(Boolean).length}
function safeLink(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function hasPrivateInfo(s){return /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|@[a-z0-9_.]{3,}|https?:\/\/|\+?\d[\d\s()\-]{7,}\d)/i.test(s||'')}
function defaultVoice(topic){return ['crop','nature','sentience'].includes(topic)?'kiki':['taste','cost'].includes(topic)?'bao':'momo'}
function resetApproval(){
 state.sourceOpened=false;
 $('daily-reviewed').checked=false;$('daily-reviewed').disabled=true;$('daily-copy').disabled=true;
 $('review-hint').textContent='Zuerst unter „Belege & Grenzen“ eine Originalquelle öffnen.';
 $('copy-feedback').textContent='';
}
function resetComparison(){
 state.proposal=null;$('daily-ai-comparison').hidden=true;
}
function stopRequest(){
 if(state.request){state.request.abort();state.request=null}
 state.busy=false;$('daily-ai-run').disabled=false;
}
function renderSources(topic){
 const box=$('daily-sources');box.replaceChildren();
 const list=(topic.sources||[]).map(id=>sourceById.get(id)).filter(Boolean);
 $('source-count').textContent=list.length+' '+(list.length===1?'Quelle':'Quellen');
 $('daily-limit').textContent='Einordnung: '+(topic.limit||'Die Grenzen der Evidenz bitte im Original prüfen.');
 for(const s of list){
  const url=safeLink(s.url);if(!url)continue;
  const a=document.createElement('a');a.className='source';a.href=url;a.target='_blank';a.rel='noopener noreferrer';
  const body=document.createElement('div'),name=document.createElement('strong'),note=document.createElement('small'),arrow=document.createElement('span');
  name.textContent=s.name;note.textContent=s.note||'Originalquelle prüfen';arrow.textContent='↗';
  body.append(name,note);a.append(body,arrow);
  a.addEventListener('click',()=>{
   state.sourceOpened=true;
   $('daily-reviewed').disabled=false;
   $('review-hint').textContent='Quelle geöffnet. Bitte relevante Belegstelle und Einschränkung wirklich prüfen, dann bestätigen.';
  });
  box.append(a);
 }
 $('daily-evidence').open=false;
}
function renderWords(){$('word-count').textContent=wordCount(state.reply)+' Wörter'}
function showReply(text,kind){
 state.reply=String(text||'');$('daily-reply').value=state.reply;
 $('reply-badge').textContent=kind==='ai'?'Modellgeprüfter Entwurf':'Redaktionell';
 $('reply-badge').classList.toggle('ai',kind==='ai');
 renderWords();resetApproval();
}
function renderVoice(){
 const voice=voices[state.persona];$('voice-name').textContent=voice.name;$('voice-description').textContent=voice.description;
 $('voice-avatar').src=voice.avatar;
 document.querySelectorAll('[data-voice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.voice===state.persona)));
}
function renderGoal(){
 const recommended=S.choose(state.comment,state.intent,state.topic.id);
 document.querySelectorAll('[data-goal]').forEach(b=>{
  b.setAttribute('aria-pressed',String(b.dataset.goal===state.goal));
  b.classList.toggle('recommended',b.dataset.goal===recommended);
  b.title=b.dataset.goal===recommended?'Vorschlag, keine sichere Einordnung':'';
 });
 const g=S.GOALS[state.goal];
 $('goal-context').textContent=(recommended===state.goal?'Unser Vorschlag: ':'Deine Wahl: ')+g.description+' Das ist eine redaktionelle Hypothese, keine Vorhersage über die Person.';
}
function switchGoal(goal){
 if(!state.topic||!S.GOALS[goal])return;
 stopRequest();state.goal=goal;resetComparison();renderGoal();
 const baseline=F.compose(state.topic,state.persona,'short',state.intent,T.reply);
 showReply(S.compose(state.topic.id,goal,baseline),'editorial');
 $('rate-status').textContent='';
 aiStatus('');
}
function clearResult(){
 stopRequest();state.decision=null;state.topic=null;state.comment='';state.reply='';
 $('daily-result').hidden=true;$('daily-hold').hidden=true;$('daily-ai-panel').hidden=true;
 $('daily-consent').checked=false;resetComparison();
}
function feedbackHold(decision){
 const title=decision.action==='report'?'Das solltest du lieber melden.':decision.action==='ignore'?'Nicht jede Provokation braucht eine Antwort.':'Hier wäre eine schnelle Antwort riskant.';
 $('hold-title').textContent=title;
 $('hold-reason').textContent=decision.reason||'Wir haben dafür noch keine ausreichend verlässliche Antwort. Bitte den Originalkontext prüfen.';
 $('daily-hold').hidden=false;
}
function analyze(){
 stopRequest();resetComparison();$('daily-hold').hidden=true;$('daily-result').hidden=true;status('');
 const text=$('daily-comment').value.trim();
 if(text.length<8){status('Bitte zuerst einen Kommentar oder eine Frage eingeben.');return}
 if(hasPrivateInfo(text)){status('Bitte erst Nutzernamen, Links und private Kontaktdaten entfernen.');return}
 if(!DATA||!T?.reply||!F?.compose||!E?.decide||!S?.compose||!S?.choose){status('Die Wissensbasis ist gerade nicht verfügbar. Bitte die Seite neu laden.');return}
 const d=E.decide(text,CASES,sourceById,'auto');state.decision=d;
 if(d.action!=='reply'||d.hold||!d.topic||!d.evidence?.ready){feedbackHold(d);return}
 state.comment=text;state.topic=d.topic;
 const fitted=F.intentFrom(text,d.context);
 state.intent=['question','skeptic','claim'].includes(fitted?.intent)?fitted.intent:'claim';
 state.persona=defaultVoice(d.topic.id);
 state.goal=S.choose(text,state.intent,d.topic.id);
 renderVoice();renderGoal();renderSources(d.topic);
 showReply(S.compose(d.topic.id,state.goal,F.compose(d.topic,state.persona,'short',state.intent,T.reply)),'editorial');
 $('daily-consent').checked=false;$('daily-ai-panel').hidden=true;
 $('rate-status').textContent='';
 $('daily-result').hidden=false;
 $('daily-result').scrollIntoView({behavior:'smooth',block:'start'});
}
async function checkAI(){
 try{
  const resp=await fetch('/api/status',{credentials:'same-origin',cache:'no-store'});
  const body=await resp.json();state.aiAvailable=Boolean(resp.ok&&body.available);
 }catch{state.aiAvailable=false}
 if($('daily-ai-panel').hidden)return;
 aiStatus(state.aiAvailable?
  'KI-Server bereit. Jede Anfrage verursacht zwei Modellaufrufe. Die Originalquellen prüfst weiterhin selbst.':
  'KI momentan nicht verfügbar. Die redaktionelle Antwort funktioniert weiterhin.');
 $('daily-ai-run').disabled=!state.aiAvailable;
}
async function runAI(){
 if(state.busy||!state.topic||!state.decision)return;
 if(!state.aiAvailable){aiStatus('Der KI-Server ist derzeit nicht aktiv.');return}
 const code=$('daily-code').value;
 if(code.length<16){aiStatus('Bitte den privaten Redaktionscode eingeben (mindestens 16 Zeichen).');return}
 if(!$('daily-consent').checked){aiStatus('Bitte zuerst der einmaligen Übermittlung zustimmen.');return}
 if(hasPrivateInfo(state.comment)||hasPrivateInfo(state.reply)){aiStatus('Bitte Nutzernamen, Links und private Daten aus Kommentar und Entwurf entfernen.');return}
 const topic=state.topic,prior=state.reply,comment=state.comment,persona=state.persona,intent=state.intent,goal=state.goal;
 const controller=new AbortController();state.request=controller;state.busy=true;$('daily-ai-run').disabled=true;
 resetComparison();aiStatus('Die KI verbessert den Text. Ein zweiter Modellaufruf prüft den Entwurf gegen die Quellenhinweise …');
 const timeout=setTimeout(()=>controller.abort(),42000);
 try{
  const resp=await fetch('/api/assist',{method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,
   headers:{'Content-Type':'application/json','x-avos-editor':code},
   body:JSON.stringify({text:comment,persona,contextType:intent,consent:true,mode:'improve',existingReply:prior,goal})});
  const data=await resp.json();
  if(state.goal!==goal||state.comment!==comment||state.reply!==prior||state.persona!==persona||state.intent!==intent)return; // Never apply stale suggestions after edits.
  if(!resp.ok||!data.ok){aiStatus(data.error||'Der KI-Test hat nicht funktioniert. Dein Entwurf bleibt erhalten.');return}
  if(data.improved===false){aiStatus(data.reason||'Keine überzeugende Verbesserung. Wir behalten den bestehenden Entwurf.');return}
  const valid= data.topic_id===topic.id && data.goal===goal &&
    typeof data.reply==='string' && data.reply.length>=25 && data.reply.length<=950 &&
    wordCount(data.reply)<=65 && Array.isArray(data.source_links) && data.source_links.length>0 &&
    data.source_links.every(x=>topic.sources.includes(x.id)) &&
    data.reply.trim()!==prior.trim();
  if(!valid){aiStatus('Der KI-Vorschlag hat unseren Sicherheits- oder Quellencheck nicht bestanden. Der bisherige Text bleibt.');return}
  state.proposal=data.reply;
  $('daily-ai-proposal').textContent=data.reply;
  $('daily-ai-change').textContent=Array.isArray(data.changes)?data.changes.filter(s=>typeof s==='string').slice(0,2).join(' · '):'';
  $('daily-ai-comparison').hidden=false;
  aiStatus('Zwei Modellschritte abgeschlossen. Entscheide selbst – das ist keine unabhängige Quellenprüfung.');
 }catch{
  aiStatus(controller.signal.aborted?'Zeitlimit erreicht oder Test abgebrochen. Dein Entwurf bleibt.':'Netzwerk- oder Modellfehler. Dein Entwurf bleibt unverändert.');
 }finally{
  clearTimeout(timeout);if(state.request===controller)state.request=null;
  state.busy=false;$('daily-ai-run').disabled=!state.aiAvailable;
  $('daily-consent').checked=false;
 }
}
async function copyReply(){
 if(!state.sourceOpened||!$('daily-reviewed').checked||!state.reply.trim())return;
 const reply=state.reply.trim();
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(reply)}
  else{$('daily-reply').focus();$('daily-reply').select();if(!document.execCommand('copy'))throw Error('copy')}
  $('copy-feedback').textContent='Kopiert! Jetzt kannst du den Text selbst veröffentlichen. ♡';
 }catch{
  $('daily-reply').focus();$('daily-reply').select();
  $('copy-feedback').textContent='Automatisches Kopieren wurde blockiert. Text ist markiert – bitte selbst kopieren.';
 }
}
function rate(value){
 if(!state.topic)return;
 const record={version:'1.3',topic:state.topic.id,goal:state.goal,feedback:value,createdAt:new Date().toISOString()};
 try{
  const key='avos-v13-goal-feedback',arr=JSON.parse(localStorage.getItem(key)||'[]');
  if(Array.isArray(arr)){arr.push(record);localStorage.setItem(key,JSON.stringify(arr.slice(-100)))}
 }catch{}
 $('rate-status').textContent='Danke! Nur lokal gespeichert, ohne Kommentartext.';
}
function init(){
 if(!DATA||!T?.reply||!F?.compose||!E?.decide||!S?.compose){status('Die Wissensbasis konnte nicht geladen werden.');return}
 $('daily-analyze').addEventListener('click',analyze);
 $('daily-comment').addEventListener('input',()=>{
  if(!$('daily-result').hidden||!$('daily-hold').hidden)clearResult();
  status('');
 });
 $('daily-comment').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')analyze()});
 document.querySelectorAll('[data-sample]').forEach(b=>b.addEventListener('click',()=>{
  $('daily-comment').value=samples[b.dataset.sample];analyze();
 }));
 document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>switchGoal(b.dataset.goal)));
 document.querySelectorAll('[data-voice]').forEach(b=>b.addEventListener('click',()=>{
  if(!state.topic)return;stopRequest();state.persona=b.dataset.voice;renderVoice();resetComparison();
  // Personalities only affect optional AI revision; the goal-first editorial reply stays unchanged.
  $('rate-status').textContent='';
 }));
 $('daily-reply').addEventListener('input',()=>{
  stopRequest();state.reply=$('daily-reply').value;renderWords();resetApproval();resetComparison();
  $('reply-badge').textContent='Manuell bearbeitet';$('reply-badge').classList.remove('ai');
 });
 $('daily-reviewed').addEventListener('change',()=>{
  $('daily-copy').disabled=!(state.sourceOpened&&$('daily-reviewed').checked&&state.reply.trim());
 });
 $('daily-copy').addEventListener('click',copyReply);
 $('daily-ai-open').addEventListener('click',()=>{
  $('daily-ai-panel').hidden=!$('daily-ai-panel').hidden;
  if(!$('daily-ai-panel').hidden){checkAI();$('daily-ai-panel').scrollIntoView({behavior:'smooth',block:'nearest'})}
 });
 $('daily-ai-run').addEventListener('click',runAI);
 $('daily-ai-use').addEventListener('click',()=>{
  if(!state.proposal)return;showReply(state.proposal,'ai');resetComparison();
  aiStatus('Vorschlag übernommen. Bitte Quelle und Antwort erneut prüfen, bevor du kopierst.');
  $('daily-evidence').open=true;
 });
 $('daily-ai-keep').addEventListener('click',()=>{resetComparison();aiStatus('Gut! Dein bisheriger Entwurf bleibt erhalten.')});
 document.querySelectorAll('[data-rate]').forEach(b=>b.addEventListener('click',()=>rate(b.dataset.rate)));
 if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
 checkAI();
}
init();
})();
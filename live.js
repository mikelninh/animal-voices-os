/* Animal Voices LIVE v0.6 — opt-in, privacy-first quality cockpit */
(()=>{
 'use strict';
 const core=window.AV_LIVE_CORE,$=id=>document.getElementById(id);
 if(!core){document.body.dataset.avReady='error';return}
 const samples={
  taste:'Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?',
  animals:'Why should animal suffering matter for our food choices?',
  forest:'Aber für Soja wird doch der Regenwald abgeholzt?',
  rage:'Ich esse jetzt zwei Steaks extra für euch 😂',
  boundary:'Ihr seid doch alle Idioten, haltet einfach den Mund!',
  english:'Can I get enough protein from plant foods?'
 };
 const VOICES=['momo','kiki','bao','curious'];
 const STORAGE='avos-live-feedback-v1';
 let voice='kiki',mode='local',ai=null,last='',busy=false,current=null,feedback=[];
 try{
  const stored=JSON.parse(localStorage.getItem(STORAGE)||'[]');
  if(Array.isArray(stored))feedback=stored.filter(x=>x&&typeof x==='object'&&
    ['helpful','needs_work'].includes(x.vote)&&typeof x.topic==='string').slice(-500);
 }catch{}
 function say(id,text){$(id).textContent=text||''}
 function safeUrl(url){
  try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}
 }
 function read(){
  const comment=$('comment').value.trim();
  return {comment,repeated:$('repeat').checked,ownPost:$('own').checked};
 }
 function resetAI(){ai=null;mode='local';say('ai-state','Keine KI-Anfrage gesendet.');$('run-ai').disabled=false}
 function renderFeedback(){say('feedback-count',feedback.length+' lokale Bewertungen')}
 function voiceDefault(text,local){
  if(local?.state==='boundary'||local?.state==='skip')return 'kiki';
  if(local?.state==='reviewed'&&local.id)return core.recommendVoice(text,local.id);
  return 'momo';
 }
 function evaluate({resetVoice=false}={}){
  const {comment,repeated,ownPost}=read();
  if(comment!==last){resetAI();last=comment;resetVoice=true}
  const flags={repeated,ownPost},mod=core.moderate(comment,flags);
  const local=core.suggest(comment,voice,flags);
  if(resetVoice){voice=voiceDefault(comment,local)}
  let result=core.suggest(comment,voice,flags);
  const useAI=ai&&ai.comment===comment&&mod.action==='answer'&&!repeated;
  if(useAI){
   result={...result,state:'reviewed',topic:ai.topic,topic_id:ai.topic_id,language:ai.language,voice,
    text:ai.variants[voice],summary:ai.source_summary,limitation:ai.limitations,
    sources:ai.sources,evidenceStatus:'model_reviewed'};
  }
  mode=useAI?'ai':'local';current={...result,moderation:mod,mode,voice};
  say('decision-title',mod.label);
  say('decision-why',mod.reason);
  say('decision-action',mod.guidance);
  say('mode',useAI?'✦ KI · Modellcheck':'Redaktionell · lokal');
  say('reply-language',result.language==='en'?'English':'Deutsch');
  document.querySelectorAll('[data-voice]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.voice===voice)));
  const available=!!result.text&&['reviewed','boundary','skip'].includes(result.state);
  $('reply-area').hidden=!available;
  $('empty').hidden=available;
  say('reply',available?result.text:'');
  if(!available){
   say('empty',result.state==='report'?'Möglicher Sicherheitsverstoß: keine öffentliche Antwort. Schütze Betroffene und prüfe, ob du den Kommentar melden solltest.':
    result.state==='end'?'Diese Unterhaltung muss nicht weitergeführt werden. Keine neue Antwort empfohlen.':
    result.state==='review'?'Private Angaben zuerst entfernen – nicht ungeprüft in ein Modell übertragen.':
    'Für diese Frage liegt noch kein verantwortbar belegter Vorschlag vor. Bitte den Kontext manuell prüfen.');
  }
  say('source-summary',result.summary||'Keine vorab geprüfte Quellenzuordnung vorhanden.');
  say('limitations',result.limitation?'Grenze: '+result.limitation:'Nicht veröffentlichen, bevor die Aussage und der Originalkontext geprüft wurden.');
  say('verification',useAI?'Zwei Modell-Durchgänge gegen redaktionelle Quellennotizen. Keine Live-Verifikation von Originalstudien. Immer menschlich prüfen.':
   result.evidenceStatus==='editorial'?'Ethischer bzw. redaktioneller Text – keine wissenschaftlich verifizierte Schlussfolgerung.':
   result.evidenceStatus==='source_linked'?'Kuratiertes Quellenmaterial. Die Quellen wurden bei dieser Anfrage nicht live neu geprüft.':'Noch keine belegte Antwort.');
  const sources=$('sources');sources.replaceChildren();
  for(const item of result.sources||[]){
   const url=safeUrl(item.url);if(!url)continue;
   const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';
   link.textContent=item.name+' ↗';sources.append(link);
  }
  $('helpful').disabled=!available;$('needs-work').disabled=!available;
  document.body.dataset.avReady='true';
 }
 async function tryAI(){
  if(busy)return;
  const {comment,repeated,ownPost}=read(),flag={repeated,ownPost},m=core.moderate(comment,flag);
  if(m.action!=='answer'){
   say('ai-state','Zuerst unsere Moderationsempfehlung prüfen. Für diese Situation wird keine KI-Antwort erzeugt.');return;
  }
  if(!$('consent').checked){say('ai-state','Bitte zuerst ausdrücklich der Verarbeitung dieses Kommentars zustimmen.');return}
  if($('access').value.length<16){say('ai-state','Für den privaten KI-Test ist ein Editor-Code erforderlich.');return}
  if(comment.length<10||comment.length>900||/(?:@[\w.]{3,}|https?:\/\/|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i.test(comment)){
   say('ai-state','Bitte 10–900 Zeichen und keine Handles, Links oder Kontaktangaben verwenden.');return;
  }
  busy=true;const button=$('run-ai');button.disabled=true;
  say('ai-state','KI ordnet ein → vier Stimmen entstehen → unabhängiger Modellcheck …');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),48000);
  try{
   const response=await fetch('/api/coach',{method:'POST',credentials:'same-origin',signal:controller.signal,
    headers:{'Content-Type':'application/json','x-avos-editor':$('access').value},
    body:JSON.stringify({comment,consent:true})});
   const data=await response.json().catch(()=>({error:'Ungültige Antwort des Servers.'}));
   if(comment!==read().comment)return;
   if(!response.ok||data.ok!==true)throw Error(data.error||'KI momentan nicht verfügbar.');
   if(!data.variants||VOICES.some(v=>typeof data.variants[v]!=='string')||data.scientifically_verified!==false)
    throw Error('Unvollständiges oder irreführendes KI-Ergebnis – zurückgestellt.');
   ai={...data,comment};voice=VOICES.includes(data.recommended_voice)?data.recommended_voice:'kiki';
   evaluate();
   say('ai-state','Vier neue KI-Vorschläge bereit. Fakten und Quellen bitte persönlich prüfen.');
  }catch(e){
   if(!ai)say('ai-state',e?.name==='AbortError'?'Zeitlimit erreicht. Die lokalen Antworten bleiben verfügbar.':
    (e?.message||'KI konnte keine sichere Antwort erzeugen.')+' · Lokale Vorschläge bleiben verfügbar.');
  }finally{busy=false;button.disabled=false;clearTimeout(timeout)}
 }
 const strip=()=>{
  const {comment}=read();if(comment!==last)resetAI();
 };
 $('comment').addEventListener('input',()=>{strip();evaluate({resetVoice:true})});
 $('repeat').addEventListener('change',()=>{resetAI();evaluate()});
 $('own').addEventListener('change',()=>{resetAI();evaluate()});
 $('analyse').addEventListener('click',()=>{evaluate({resetVoice:true});$('decision-title').scrollIntoView({block:'nearest',behavior:'smooth'})});
 $('run-ai').addEventListener('click',tryAI);
 document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{
  const val=samples[button.dataset.example];
  if(!val)return;
  $('comment').value=val;$('repeat').checked=false;$('own').checked=false;
  resetAI();evaluate({resetVoice:true});
 }));
 document.querySelectorAll('[data-voice]').forEach(button=>button.addEventListener('click',()=>{voice=button.dataset.voice;evaluate()}));
 $('next').addEventListener('click',()=>{voice=VOICES[(VOICES.indexOf(voice)+1)%VOICES.length];evaluate()});
 $('copy').addEventListener('click',async()=>{
  if(!current?.text)return;
  try{await navigator.clipboard.writeText(current.text);
   say('copy-state','Kopiert. Bitte persönlich prüfen und selbst veröffentlichen.')}
  catch{say('copy-state','Zwischenablage blockiert – Text bitte manuell markieren.')}
 });
 function vote(value){
  if(!current?.text||!['helpful','needs_work'].includes(value))return;
  const id= current.topic_id||current.id||current.moderation?.action||'unknown';
  feedback.push({topic:String(id).slice(0,50),voice,mode,language:current.language||'unknown',vote:value,date:new Date().toISOString().slice(0,10)});
  feedback=feedback.slice(-500);
  try{localStorage.setItem(STORAGE,JSON.stringify(feedback))}catch{}
  say('feedback-note','Danke! Nur Thema, Stimme, Modus, Tag und Bewertung werden lokal gespeichert – kein Kommentartext.');
  renderFeedback();
 }
 $('helpful').addEventListener('click',()=>vote('helpful'));
 $('needs-work').addEventListener('click',()=>vote('needs_work'));
 $('export').addEventListener('click',()=>{
  const data={version:'live-feedback-v1',anonymous:true,source:'local_opt_in',count:feedback.length,reviews:feedback};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='animal-voices-anonymes-feedback.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
 async function capability(){
  try{
   const response=await fetch('/api/status',{cache:'no-store'});
   if(!response.ok)return;const json=await response.json();
   if(!json.available)say('ai-state','Privater KI-Dienst noch nicht konfiguriert. Du kannst die redaktionellen Antworten nutzen.');
  }catch{}
 }
 renderFeedback();evaluate({resetVoice:true});capability();
})();

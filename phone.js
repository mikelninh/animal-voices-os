/* Animal Voices Phone v1.4 — mobile-first, real-comment companion.
 * Screenshot OCR executes locally in the browser; only vendor code/language data are fetched.
 * No login, no Instagram API, no auto-posting. Optional AI requires code + explicit consent.
 */
(()=>{'use strict';
const DATA=window.AV_DATA||{},T=window.AV_TRIAGE,F=window.AV_CONTEXT_FIT,E=window.AV_ENGINE,S=window.AV_STRATEGIES;
const $=id=>document.getElementById(id);
const sourceMap=new Map((DATA.sources||[]).map(s=>[s.id,s]));
const state={topic:null,comment:'',reply:'',goal:'',context:'question',decision:null,
 sourceOpened:false,postUrl:null,ocrFile:null,ocrUrl:null,ocrWorking:false,
 aiWorking:false,aiController:null,aiProposal:null,aiAvailable:false};
const setStatus=(id,s)=>{$(id).textContent=s||''};
const count=s=>String(s||'').trim().split(/\s+/).filter(Boolean).length;
const hasPrivateInfo=s=>/(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|@[a-z0-9_.]{3,}|https?:\/\/|\+?\d[\d\s()\-]{7,}\d)/i.test(s||'');
function safeInstagramUrl(raw){
 try{
  const u=new URL(String(raw||'').trim());
  if(u.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(u.hostname))return null;
  if(!/^\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(u.pathname))return null;
  // Strip tracking and comment IDs: never leak untrusted query parameters on return.
  return 'https://www.instagram.com'+u.pathname.replace(/\/?$/,'/');
 }catch{return null}
}
function instagramFromText(s){return String(s||'').match(/https:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?(?:\?[^\s]*)?/i)?.[0]||null}
function applyPost(){
 const raw=$('phone-post-url').value.trim();
 state.postUrl=raw?safeInstagramUrl(raw):null;
 if(raw&&!state.postUrl){setStatus('capture-status','Bitte einen gültigen Instagram-Beitragslink verwenden. Das ist nicht der Kommentartext.');return false}
 $('phone-return').href=state.postUrl||'https://www.instagram.com/';
 return true;
}
function forgetAI(){
 if(state.aiController){state.aiController.abort();state.aiController=null}
 state.aiWorking=false;state.aiProposal=null;
 $('phone-ai-comparison').hidden=true;$('phone-ai-run').disabled=false;
 $('phone-ai-consent').checked=false;setStatus('phone-ai-status','');
}
function resetApproval(){
 state.sourceOpened=false;
 $('phone-reviewed').checked=false;$('phone-reviewed').disabled=true;$('phone-copy').disabled=true;
 setStatus('review-status','Öffne zuerst mindestens eine Originalquelle.');
 setStatus('copy-status','');$('phone-return').hidden=true;
}
function hideResult(){
 forgetAI();state.topic=null;state.decision=null;state.comment='';state.reply='';state.goal='';
 $('phone-result').hidden=true;$('phone-hold').hidden=true;resetApproval();
}
function syncWords(){$('reply-words').textContent=count(state.reply)+' Wörter'}
function showReply(reply){
 state.reply=String(reply||'');$('phone-reply').value=state.reply;
 syncWords();resetApproval();
}
function sourceLink(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function renderSources(topic){
 const container=$('source-links');container.replaceChildren();
 setStatus('source-limit','Einordnung: '+(topic.limit||'Bitte Quellen und Kontext selbst prüfen.'));
 const sources=(topic.sources||[]).map(id=>sourceMap.get(id)).filter(Boolean);
 for(const s of sources){
  const url=sourceLink(s.url);if(!url)continue;
  const a=document.createElement('a');a.className='source';a.href=url;a.target='_blank';a.rel='noopener noreferrer';
  const item=document.createElement('div'),name=document.createElement('strong'),sub=document.createElement('small'),arrow=document.createElement('span');
  name.textContent=s.name;sub.textContent=s.note||'Originalquelle';arrow.textContent='↗';
  item.append(name,sub);a.append(item,arrow);
  a.addEventListener('click',()=>{
   state.sourceOpened=true;$('phone-reviewed').disabled=false;
   setStatus('review-status','Quelle geöffnet. Bitte Aussage und Grenzen wirklich prüfen, dann den Haken setzen.');
  });
  container.append(a);
 }
}
function renderGoal(){
 if(!state.topic)return;
 $('chosen-goal').textContent=S.GOALS[state.goal].label;
 $('topic-label').textContent=state.topic.short;
 $('goal-note').textContent=S.GOALS[state.goal].description+' Nicht jede Strategie passt zu jeder Person.';
 document.querySelectorAll('[data-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.goal===state.goal)));
}
function changeGoal(goal){
 if(!state.topic||!S.GOALS[goal])return;
 forgetAI();state.goal=goal;renderGoal();
 const old=F.compose(state.topic,'momo','short',state.context,T.reply);
 showReply(S.compose(state.topic.id,goal,old));
}
function hold(decision){
 $('hold-title').textContent=decision.action==='ignore'?'Nicht jede Provokation braucht eine Antwort.':decision.action==='report'?'Möglicher Plattformverstoss.':'Bitte nicht raten.';
 $('hold-reason').textContent=decision.reason||'Das Thema ist noch nicht zuverlässig eingeordnet. Bitte den Originalkontext persönlich prüfen.';
 $('phone-hold').hidden=false;$('phone-hold').scrollIntoView({behavior:'smooth',block:'start'});
}
function analyze(){
 hideResult();setStatus('capture-status','');
 const text=$('phone-comment').value.trim();
 if(text.length<8){setStatus('capture-status','Bitte einen echten Kommentar oder eine Frage einfügen.');return}
 if(text.length>1800){setStatus('capture-status','Der Kommentar ist zu lang (maximal 1800 Zeichen).');return}
 if(hasPrivateInfo(text)){setStatus('capture-status','Bitte Nutzername, @Handle, Link oder private Kontaktdaten aus dem Kommentar entfernen. Den Instagram-Beitragslink kannst du separat eintragen.');return}
 if(!applyPost())return;
 if(!DATA?.cases||!E?.decide||!F?.compose||!S?.compose){setStatus('capture-status','Die lokale Wissensbasis ist nicht geladen. Bitte die Seite neu öffnen.');return}
 const d=E.decide(text,DATA.cases,sourceMap,'auto');state.decision=d;
 if(d.action!=='reply'||d.hold||!d.topic||!d.evidence?.ready||!S.DRAFTS[d.topic.id]){
  hold(d);return;
 }
 state.topic=d.topic;state.comment=text;state.context=d.context;
 state.goal=S.choose(text,d.context,d.topic.id);
 renderGoal();renderSources(d.topic);
 showReply(S.compose(d.topic.id,state.goal,F.compose(d.topic,'momo','short',state.context,T.reply)));
 $('phone-ai').open=false;$('phone-result').hidden=false;
 $('phone-result').scrollIntoView({behavior:'smooth',block:'start'});
}
async function paste(){
 if(!navigator.clipboard?.readText){setStatus('capture-status','Dein Browser bietet hier kein direktes Auslesen an. Halte das Kommentarfeld gedrückt und wähle „Einfügen“.');$('phone-comment').focus();return}
 try{
  const str=(await navigator.clipboard.readText()).trim();
  if(!str){setStatus('capture-status','Die Zwischenablage enthält keinen Text.');return}
  const url=instagramFromText(str);
  const rest=url?str.replace(url,'').trim():str;
  if(url&&!safeInstagramUrl(url)){setStatus('capture-status','Der geteilte Link ist kein unterstützter Instagram-Beitrag.');return}
  if(url){$('phone-post-url').value=safeInstagramUrl(url);$('post-details').open=true;applyPost()}
  if(!rest||rest.length<8){
   setStatus('capture-status',url?'Beitragslink übernommen. Instagram liefert daraus nicht automatisch den Kommentar. Bitte Kommentar kopieren oder Screenshot verwenden.':'Bitte einen längeren Kommentar kopieren.');
   return;
  }
  $('phone-comment').value=rest.slice(0,1800);hideResult();
  setStatus('capture-status','Text übernommen. Prüfe, dass es genau ein Kommentar ist – ohne Nutzernamen oder private Angaben.');
 }catch{
  setStatus('capture-status','Zwischenablage-Zugriff wurde nicht erlaubt. Halte das Kommentarfeld gedrückt und wähle „Einfügen“.');
  $('phone-comment').focus();
 }
}
let ocrScriptPromise;
function loadOCR(){
 if(window.Tesseract?.createWorker)return Promise.resolve(window.Tesseract);
 if(ocrScriptPromise)return ocrScriptPromise;
 ocrScriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),timeout=setTimeout(()=>reject(Error('ocr-load-timeout')),22000);
  script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';
  script.async=true;script.crossOrigin='anonymous';
  script.onload=()=>{clearTimeout(timeout);if(window.Tesseract?.createWorker)resolve(window.Tesseract);else reject(Error('ocr-library-unavailable'))};
  script.onerror=()=>{clearTimeout(timeout);reject(Error('ocr-script-load-failed'))};
  document.head.append(script);
 }).catch(e=>{ocrScriptPromise=null;throw e});
 return ocrScriptPromise;
}
function imageChanged(){
 const file=$('phone-screenshot').files?.[0];
 if(state.ocrUrl){URL.revokeObjectURL(state.ocrUrl);state.ocrUrl=null}
 state.ocrFile=null;$('image-preview').hidden=true;$('image-read').disabled=true;
 if(!file){setStatus('image-progress','');return}
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024||file.size===0){
  setStatus('image-progress','Bitte ein JPG-, PNG- oder WebP-Bild unter 12 MB auswählen.');return
 }
 state.ocrFile=file;
 state.ocrUrl=URL.createObjectURL(file);
 $('image-preview').src=state.ocrUrl;$('image-preview').hidden=false;$('image-read').disabled=false;
 setStatus('image-progress','Screenshot geladen. Vor der Texterkennung kannst du ihn oben kontrollieren. Für beste Ergebnisse einen Kommentar vorher zuschneiden.');
}
async function ocr(){
 if(state.ocrWorking||!state.ocrFile)return;
 state.ocrWorking=true;$('image-read').disabled=true;
 setStatus('image-progress','OCR wird geladen … beim ersten Mal kann das etwas dauern.');
 let worker=null;
 try{
  const lib=await loadOCR();
  // Multilingual OCR in WebAssembly on the device. No image POST or remote recognition API.
  worker=await lib.createWorker(['deu','eng'],1,{logger:e=>{
   if(typeof e?.progress==='number'){
    const percent=Math.max(0,Math.min(100,Math.round(e.progress*100)));
    if(e.status==='recognizing text')setStatus('image-progress','Text wird auf deinem Gerät erkannt … '+percent+'%');
    else if(e.status==='loading language traineddata')setStatus('image-progress','Sprachdaten werden geladen … '+percent+'%');
   }
  }});
  const result=await worker.recognize(state.ocrFile);
  const text=String(result?.data?.text||'').replace(/\r/g,'').trim();
  if(text.length<8){setStatus('image-progress','Kein ausreichend lesbarer Text gefunden. Screenshot enger zuschneiden oder Apples Live Text verwenden.');return}
  $('phone-comment').value=text.slice(0,1800);hideResult();
  setStatus('image-progress','Text lokal erkannt. Wichtig: Er kann Nutzernamen und mehrere Kommentare enthalten. Bearbeite ihn unten und behalte nur den richtigen Kommentar.');
  setStatus('capture-status','Bitte OCR-Text gründlich korrigieren und alle Nutzernamen entfernen, bevor du den Vorschlag erstellst.');
  $('phone-comment').scrollIntoView({behavior:'smooth',block:'center'});
 }catch{
  setStatus('image-progress','Die lokale Bilderkennung hat hier nicht funktioniert. Öffne den Screenshot in Fotos, nutze Live Text (iPhone) bzw. Lens (Android) und füge den Text manuell ein. Kein Bild wurde hochgeladen.');
 }finally{
  if(worker)try{await worker.terminate()}catch{}
  state.ocrWorking=false;$('image-read').disabled=!state.ocrFile;
 }
}
function reviewed(){
 $('phone-copy').disabled=!(state.sourceOpened&&$('phone-reviewed').checked&&state.reply.trim());
}
async function copy(){
 if(!state.sourceOpened||!$('phone-reviewed').checked||!state.reply.trim())return;
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(state.reply.trim());
  else{$('phone-reply').focus();$('phone-reply').select();if(!document.execCommand('copy'))throw Error('copy unsupported')}
  setStatus('copy-status','Kopiert! Öffne den Originalbeitrag und füge deine Antwort selbst in Instagram ein.');
  $('phone-return').hidden=false;
  $('phone-return').href=state.postUrl||'https://www.instagram.com/';
 }catch{
  $('phone-reply').focus();$('phone-reply').select();
  setStatus('copy-status','Automatisches Kopieren blockiert. Text ist markiert; bitte selbst „Kopieren“ wählen.');
 }
}
async function checkAI(){
 try{
  const resp=await fetch('/api/status',{cache:'no-store'});
  const info=await resp.json();state.aiAvailable=Boolean(resp.ok&&info.available);
 }catch{state.aiAvailable=false}
 setStatus('phone-ai-status',state.aiAvailable?'KI verfügbar. Eine Anfrage kostet zwei Modellaufrufe; keine Live-Prüfung der Originalstudien.':'KI momentan nicht verfügbar; redaktionelle Antworten bleiben nutzbar.');
 $('phone-ai-run').disabled=!state.aiAvailable;
}
async function runAI(){
 if(state.aiWorking||!state.topic||!state.aiAvailable)return;
 const code=$('phone-code').value;
 if(code.length<16){setStatus('phone-ai-status','Bitte deinen privaten Redaktionscode eingeben (mindestens 16 Zeichen).');return}
 if(!$('phone-ai-consent').checked){setStatus('phone-ai-status','Bitte der einmaligen Übermittlung zustimmen.');return}
 if(hasPrivateInfo(state.comment)||hasPrivateInfo(state.reply)){setStatus('phone-ai-status','Im Kommentar oder Entwurf sind private Angaben oder Links. Bitte erst entfernen.');return}
 const snapshot={topic:state.topic.id,goal:state.goal,comment:state.comment,reply:state.reply,context:state.context};
 const aborter=new AbortController();state.aiController=aborter;state.aiWorking=true;
 $('phone-ai-run').disabled=true;$('phone-ai-comparison').hidden=true;
 setStatus('phone-ai-status','Zwei KI-Prüfschritte laufen …');
 const timeout=setTimeout(()=>aborter.abort(),42000);
 try{
  const resp=await fetch('/api/assist',{method:'POST',credentials:'same-origin',cache:'no-store',signal:aborter.signal,
   headers:{'Content-Type':'application/json','x-avos-editor':code},
   body:JSON.stringify({text:snapshot.comment,persona:'momo',contextType:snapshot.context,consent:true,mode:'improve',existingReply:snapshot.reply,goal:snapshot.goal})});
  const obj=await resp.json();
  if(!state.topic||state.topic.id!==snapshot.topic||state.goal!==snapshot.goal||state.comment!==snapshot.comment||state.reply!==snapshot.reply)return;
  if(!resp.ok||!obj.ok){setStatus('phone-ai-status',obj.error||'KI-Fehler. Dein Entwurf bleibt.');return}
  if(obj.improved===false){setStatus('phone-ai-status',obj.reason||'Keine überzeugende Verbesserung. Original behalten.');return}
  const valid=obj.goal===snapshot.goal&&obj.topic_id===snapshot.topic&&
   typeof obj.reply==='string'&&obj.reply.length>=25&&obj.reply.length<=950&&count(obj.reply)<=65&&
   Array.isArray(obj.source_links)&&obj.source_links.length>0&&
   obj.source_links.every(x=>state.topic.sources.includes(x.id))&&obj.reply.trim()!==snapshot.reply.trim();
  if(!valid){setStatus('phone-ai-status','Vorschlag hat die Quellen- oder Qualitätsprüfung nicht bestanden. Original behalten.');return}
  state.aiProposal=obj.reply;$('phone-ai-text').textContent=obj.reply;
  $('phone-ai-comparison').hidden=false;
  setStatus('phone-ai-status','Modellgeprüfter Vorschlag – keine unabhängige Faktenprüfung. Du entscheidest.');
 }catch{setStatus('phone-ai-status',aborter.signal.aborted?'Anfrage abgebrochen oder Zeitlimit erreicht.':'Netzwerkfehler. Original bleibt erhalten.')}
 finally{clearTimeout(timeout);if(state.aiController===aborter)state.aiController=null;state.aiWorking=false;
  $('phone-ai-run').disabled=!state.aiAvailable;$('phone-ai-consent').checked=false}
}
function showEntry(tab){
 $('paste-pane').hidden=tab!=='paste';$('image-pane').hidden=tab!=='image';
 $('entry-paste').classList.toggle('active',tab==='paste');$('entry-image').classList.toggle('active',tab==='image');
 $('entry-paste').setAttribute('aria-pressed',String(tab==='paste'));
 $('entry-image').setAttribute('aria-pressed',String(tab==='image'));
}
function parseShare(payload){
 const pieces=[payload?.text,payload?.url,payload?.title].map(x=>String(x||'').trim()).filter(Boolean);
 const url=pieces.map(instagramFromText).find(Boolean);
 let comment=String(payload?.text||'').trim();
 if(url)comment=comment.replace(url,'').trim();
 if(url&&safeInstagramUrl(url)){$('phone-post-url').value=safeInstagramUrl(url);$('post-details').open=true;applyPost()}
 if(comment.length>=8){
  $('phone-comment').value=comment.slice(0,1800);
  setStatus('capture-status','Aus dem Android-Teilen-Menü übernommen. Prüfe, ob das wirklich der Kommentar und nicht die Beitragsbeschreibung ist.');
 }else{
  setStatus('capture-status','Beitragslink übernommen. Instagram übermittelt dabei möglicherweise nicht den Kommentar. Bitte Kommentartext einfügen oder Screenshot auswählen.');
 }
}
function readInbox(){
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open('animal-voices-inbox-v09',1);
  req.onsuccess=()=>{
   const db=req.result,tx=db.transaction('items','readwrite'),store=tx.objectStore('items');
   const g=store.get('latest');let item=null;
   g.onsuccess=()=>{item=g.result||null;store.delete('latest')};
   tx.oncomplete=()=>{db.close();resolve(item)};
   tx.onerror=()=>{db.close();reject(tx.error)};
  };
  req.onerror=()=>reject(req.error);
 });
}
function init(){
 if(!DATA?.cases||!E?.decide||!S?.compose){setStatus('capture-status','Die Wissensbasis fehlt. Seite neu öffnen.');return}
 $('entry-paste').addEventListener('click',()=>showEntry('paste'));
 $('entry-image').addEventListener('click',()=>showEntry('image'));
 $('paste-clipboard').addEventListener('click',paste);
 $('phone-screenshot').addEventListener('change',imageChanged);
 $('image-read').addEventListener('click',ocr);
 $('phone-comment').addEventListener('input',()=>{hideResult();setStatus('capture-status','')});
 $('phone-post-url').addEventListener('input',()=>{state.postUrl=null;$('phone-return').href='https://www.instagram.com/'});
 $('phone-clear').addEventListener('click',()=>{$('phone-comment').value='';hideResult();setStatus('capture-status','')});
 $('phone-generate').addEventListener('click',analyze);
 $('hold-back').addEventListener('click',()=>$('phone-comment').focus());
 $('phone-sample').addEventListener('click',()=>{$('phone-comment').value='Aber bei der Ernte sterben doch auch Tiere?';$('phone-post-url').value='';$('post-details').open=false;analyze()});
 document.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>changeGoal(b.dataset.goal)));
 $('phone-reply').addEventListener('input',()=>{forgetAI();state.reply=$('phone-reply').value;syncWords();resetApproval()});
 $('phone-reviewed').addEventListener('change',reviewed);
 $('phone-copy').addEventListener('click',copy);
 $('phone-new').addEventListener('click',()=>{$('phone-comment').value='';$('phone-post-url').value='';hideResult();window.scrollTo({top:0,behavior:'smooth'});$('phone-comment').focus()});
 $('phone-ai').addEventListener('toggle',()=>{if($('phone-ai').open)checkAI()});
 $('phone-ai-run').addEventListener('click',runAI);
 $('phone-ai-keep').addEventListener('click',()=>{forgetAI();setStatus('phone-ai-status','Dein ursprünglicher Entwurf bleibt erhalten.')});
 $('phone-ai-use').addEventListener('click',()=>{if(!state.aiProposal)return;const text=state.aiProposal;forgetAI();showReply(text);setStatus('phone-ai-status','Übernommen. Bitte Quellen und Text erneut prüfen.')});
 if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
 const search=new URLSearchParams(location.search);
 if(search.has('inbox')){
  if(history?.replaceState)history.replaceState(null,'','/phone.html');
  readInbox().then(item=>item?parseShare(item):setStatus('capture-status','Kein geteilter Inhalt gefunden. Bitte Text einfügen.')).catch(()=>setStatus('capture-status','Geteilter Text ist nicht verfügbar. Bitte manuell einfügen.'));
 }else if(search.has('share_error')){setStatus('capture-status','Teilen konnte nicht übernommen werden. Bitte Kommentartext einfügen.')}
}
init();
})();
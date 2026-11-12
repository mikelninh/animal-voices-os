/* Animal Voices · Community Pilot 1.1
   Single public journey. No AI calls, account access, automatic posting or analytics. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const core=window.AV_PILOT_CORE;
 const sceneData={
  taste:{name:'Echte Frage',post:'plantplate.berlin',author:'foodfirst.berlin',emoji:'🍔',
    caption:'Gutes Essen und gute Gespräche. Wie siehst du das?',
    text:'Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?'},
  rage:{name:'Ragebait',post:'food.and.freedom',author:'extra.steak',emoji:'🔥',
    caption:'Man kann über Ernährung sprechen, ohne sich gegenseitig anzugreifen.',
    text:'Wegen euch esse ich heute zwei extra Steaks!'},
  ethics:{name:'Tierethik',post:'animal.kindness',author:'questioning.everything',emoji:'🐷',
    caption:'What should matter when we choose what to eat?',
    text:'Why should animal suffering matter for our food choices?'},
  own:{name:'Eigener Kommentar',post:'community.conversation',author:'dein.beispiel',emoji:'💬',
    caption:'Hier darfst du einen eigenen anonymen Kommentar testen.',
    text:'Dein eigener Kommentar erscheint hier.'}
 };
 const voices=['kiki','momo','bao','curious'];
 const shareBase='https://animal-voices-os.vercel.app/try.html';
 const params=new URLSearchParams(location.search);
 const fromNvsino=params.get('from')==='nvsino';
 let state={scene:Object.hasOwn(sceneData,params.get('scene'))?params.get('scene'):'taste',
  input:'',voice:'kiki',moderation:null,result:null,optional:false,phase:1,vote:null,reason:null};
 const privatePattern=/(?:@[a-z0-9_.]{2,}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|https?:\/\/|\+?\d[\d ()-]{7,}\d)/i;
 const esc=(s)=>String(s||'').replace(/\s+/g,' ').trim();
 const postLink=(scene=state.scene)=>{
  const u=new URL(shareBase);
  if(scene!=='taste'&&scene!=='own')u.searchParams.set('scene',scene);
  if(fromNvsino)u.searchParams.set('from','nvsino');
  return u.href;
 };
 function setStatus(id,msg){$(id).textContent=msg||''}
 function changePhase(n){
  state.phase=n;
  document.querySelectorAll('[data-progress]').forEach(node=>{
   const number=Number(node.dataset.progress);
   node.classList.toggle('current',number===Math.min(n,3));
   node.classList.toggle('done',number<n);
  });
 }
 function scrollTo(el){
  try{el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}catch{}
 }
 function resetAfterChange(){
  state.moderation=null;state.result=null;state.optional=false;state.vote=null;state.reason=null;state.voice='kiki';
  $('result').hidden=true;$('preview-section').hidden=true;$('feedback').hidden=true;
  $('reply-options').hidden=false;$('no-reply').hidden=true;$('optional-reply').hidden=true;
  $('evidence').open=false;$('reason-wrap').hidden=true;
  $('feedback-note').value='';
  document.querySelectorAll('[data-vote],[data-reason]').forEach(b=>b.setAttribute('aria-pressed','false'));
  $('share-feedback').disabled=true;$('copy-feedback').disabled=true;
  setStatus('input-status','');setStatus('copy-status','');setStatus('feedback-status','');
  changePhase(1);
 }
 function chooseScene(scene){
  if(!Object.hasOwn(sceneData,scene))return;
  state.scene=scene;resetAfterChange();
  const data=sceneData[scene];
  document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scene===scene)));
  $('post-user').textContent=data.post;$('post-avatar').textContent=data.emoji;
  $('post-art').dataset.scene=scene;$('post-emoji').textContent=data.emoji;
  $('post-caption').textContent=data.caption;$('comment-author').textContent=data.author;
  $('comment-text').textContent=data.text;
  $('own-editor').hidden=scene!=='own';
  $('own-comment').value='';
  state.input=scene==='own'?'':data.text;
  const heading=scene==='own'?'Eigenen Kommentar ausprobieren':'✳ Antwortvorschlag ansehen';
  $('analyze').replaceChildren(document.createTextNode(heading+'  ↗'));
  const u=new URL(location.href);
  if(scene==='taste')u.searchParams.delete('scene');else u.searchParams.set('scene',scene);
  history.replaceState(null,'',u.pathname+u.search+u.hash);
 }
 function evaluate(){
  const own=state.scene==='own';
  const text=own?$('own-comment').value.trim():sceneData[state.scene].text;
  if(text.length<10){setStatus('input-status','Bitte mindestens 10 Zeichen eingeben.');return}
  if(text.length>700){setStatus('input-status','Bitte auf 700 Zeichen kürzen.');return}
  if(privatePattern.test(text)){
   setStatus('input-status','Bitte erst Namen, @Handles, Links oder Kontaktdaten entfernen.');return;
  }
  if(!core){setStatus('input-status','Die Antworten konnten nicht geladen werden. Bitte neu laden.');return}
  state.input=text;state.moderation=core.moderate(text);
  const initial=core.suggest(text,'kiki');
  const recommended=initial.state==='reviewed'?core.recommendVoice(text,initial.id):'kiki';
  state.voice=voices.includes(recommended)?recommended:'kiki';
  state.optional=false;state.result=core.suggest(text,state.voice);
  $('comment-text').textContent=text;
  $('result').hidden=false;$('preview-section').hidden=true;$('feedback').hidden=true;
  setStatus('input-status','');
  changePhase(2);renderRecommendation();scrollTo($('result'));
 }
 function actionInfo(){
  const m=state.moderation,r=state.result;
  if(m.action==='report')return {icon:'🛡️',title:'Erst schützen, nicht antworten.',description:'Mögliche Drohung oder Hassrede. Sichern und melden – bitte keine öffentliche Gegenreaktion.',draft:false};
  if(m.action==='end')return {icon:'✋',title:'Hier darf das Gespräch enden.',description:'Wiederholte Angriffe brauchen keine weitere Antwort. Grenzen setzen ist auch ein guter Beitrag.',draft:false};
  if(m.action==='review')return {icon:'🔎',title:'Lieber erst prüfen.',description:'Private Angaben oder sensibler Kontext gehören nicht in einen automatischen Antwortentwurf.',draft:false};
  if(m.action==='boundary')return {icon:'✋',title:'Höchstens einmal ruhig Grenzen setzen.',description:'Beleidigungen musst du nicht hinnehmen. Eine kurze Grenze ist möglich, danach nicht weiterstreiten.',draft:true};
  if(m.action==='optional_one')return {icon:'🌿',title:'Du musst hier nicht antworten.',description:'Reiner Ragebait. Nicht jede Provokation verdient Aufmerksamkeit. Wenn du möchtest, gibt es einen kurzen Satz für Mitlesende.',draft:state.optional,optional:true};
  if(r.state!=='reviewed'||!r.text)return {icon:'🔎',title:'Dazu fehlt uns eine verlässliche Antwort.',description:'Lieber ehrlich zurückhalten als am eigentlichen Anliegen vorbeireden oder etwas erfinden.',draft:false};
  return {icon:'♡',title:'Die Frage ernst nehmen.',description:'Eine hilfreiche Antwort geht auf das Anliegen ein, statt die Person anzugreifen. Wähle die Stimme, die zu dir passt.',draft:true};
 }
 function renderRecommendation(){
  const a=actionInfo();
  $('recommend-icon').textContent=a.icon;
  $('recommend-title').textContent=a.title;
  $('recommend-reason').textContent=a.description;
  $('reply-options').hidden=!a.draft;
  $('no-reply').hidden=a.draft;
  $('optional-reply').hidden=!a.optional||state.optional;
  $('no-reply-text').textContent=a.description;
  $('evidence').hidden=!a.draft;
  if(a.draft)renderVoice();
 }
 function renderVoice(){
  // A different voice is a different draft. Never carry over an earlier vote.
  state.vote=null;state.reason=null;
  $('reason-wrap').hidden=true;$('feedback-note').value='';
  document.querySelectorAll('[data-vote],[data-reason]').forEach(b=>b.setAttribute('aria-pressed','false'));
  $('share-feedback').disabled=true;$('copy-feedback').disabled=true;
  setStatus('feedback-status','');setStatus('copy-status','');
  const r=core.suggest(state.input,state.voice);
  state.result=r;
  $('reply-text').textContent=r.text||'';
  document.querySelectorAll('[data-voice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.voice===state.voice)));
  $('source-summary').textContent=r.summary||'Redaktionelle Gesprächsempfehlung. Kein automatischer Faktencheck.';
  $('source-limit').textContent='Grenze: '+(r.limitation||'Originalkontext und etwaige Quellen vor einer Veröffentlichung selbst prüfen.');
  const list=$('source-links');list.replaceChildren();
  for(const source of r.sources||[]){
   let href;
   try{const u=new URL(source.url);if(u.protocol==='https:')href=u.href}catch{}
   if(!href)continue;
   const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';
   a.textContent=source.name+' ↗';list.append(a);
  }
  if(!$('preview-section').hidden||!$('feedback').hidden){$('preview-section').hidden=true;$('feedback').hidden=true;changePhase(2)}
 }
 function showPreview(){
  if(!state.result?.text)return;
  $('preview-original-author').textContent=state.scene==='own'?'dein.beispiel':sceneData[state.scene].author;
  $('preview-original').textContent=state.input;
  $('preview-reply').textContent=state.result.text;
  $('preview-section').hidden=false;
  showFeedback(false,false);
  scrollTo($('preview-section'));
 }
 function showFeedback(noReply,focusFeedback=true){
  $('feedback').hidden=false;
  $('feedback-title').textContent=noReply?'Würdest du dieser Empfehlung folgen?':'Würdest du diese Antwort posten?';
  changePhase(3);
  if(focusFeedback)scrollTo($('feedback'));
 }
 function setVote(v){
  if(!['yes','maybe','no'].includes(v))return;
  state.vote=v;
  document.querySelectorAll('[data-vote]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.vote===v)));
  $('reason-wrap').hidden=v==='yes';
  if(v==='yes'){state.reason=null;document.querySelectorAll('[data-reason]').forEach(b=>b.setAttribute('aria-pressed','false'))}
  $('share-feedback').disabled=false;$('copy-feedback').disabled=false;
  setStatus('feedback-status','Danke! Dein Feedback ist noch nicht versendet. Du kannst es jetzt bewusst teilen.');
 }
 function feedbackMessage(){
  if(!state.vote)return null;
  const voteName={yes:'👍 Ja, passt',maybe:'🤔 Mit Änderungen',no:'👎 Eher nicht'};
  const sceneName=sceneData[state.scene].name;
  const note=esc($('feedback-note').value).slice(0,280);
  if(privatePattern.test(note))return {error:'Bitte private Kontaktdaten, @Handles und Links aus dem Feedback entfernen.'};
  const headline='🌱 Animal Voices Community-Test';
  const parts=[headline,'Situation: '+sceneName,'Mein Eindruck: '+voteName[state.vote]];
  if(state.reason)parts.push('Verbesserung: '+state.reason);
  if(note)parts.push('Mein Hinweis: '+note);
  parts.push('Testen: '+postLink(state.scene));
  return {text:parts.join('\n')};
 }
 async function copyFeedback(){
  const draft=feedbackMessage();
  if(!draft){setStatus('feedback-status','Bitte zuerst eine Bewertung auswählen.');return}
  if(draft.error){setStatus('feedback-status',draft.error);return}
  try{
   await navigator.clipboard.writeText(draft.text);
   setStatus('feedback-status','✓ Kopiert. Du kannst die Nachricht selbst in deiner Community teilen.');
  }catch{
   setStatus('feedback-status','Kopieren blockiert. Bitte den Text in deinem Browser manuell kopieren.');
   const fallback=document.createElement('textarea');fallback.readOnly=true;fallback.value=draft.text;
   fallback.setAttribute('aria-label','Feedback manuell kopieren');fallback.style.cssText='width:100%;min-height:125px;margin-top:10px';
   $('feedback-status').append(fallback);fallback.select();
  }
 }
 function shareFeedback(){
  const draft=feedbackMessage();
  if(!draft){setStatus('feedback-status','Bitte zuerst eine Bewertung auswählen.');return}
  if(draft.error){setStatus('feedback-status',draft.error);return}
  window.open('https://wa.me/?text='+encodeURIComponent(draft.text),'_blank','noopener,noreferrer');
  setStatus('feedback-status','WhatsApp geöffnet. Du entscheidest selbst, ob und an wen du das Feedback sendest.');
 }
 function shareTest(){
  const url=postLink(state.scene);
  const message='🌱 Wie würdest du auf diesen Kommentar reagieren? Ich teste Animal Voices – ein kleines Experiment für bessere Gespräche. Kostenlos, ohne Anmeldung. Probier es aus!';
  if(navigator.share){
   navigator.share({title:'Animal Voices · Community-Test',text:message,url})
    .catch(e=>{if(e?.name!=='AbortError')setStatus('feedback-status','Teilen nicht möglich. Kopiere den Link aus der Adresszeile.')});
  }else{
   window.open('https://wa.me/?text='+encodeURIComponent(message+'\n\n'+url),'_blank','noopener,noreferrer');
  }
 }
 function init(){
  if(fromNvsino)$('intro-tag').textContent='UNABHÄNGIGER TEST FÜR MENSCHEN AUS DER NVSINO-COMMUNITY';
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>{chooseScene(b.dataset.scene)}));
  document.querySelectorAll('[data-voice]').forEach(b=>b.addEventListener('click',()=>{state.voice=b.dataset.voice;renderVoice()}));
  document.querySelectorAll('[data-vote]').forEach(b=>b.addEventListener('click',()=>setVote(b.dataset.vote)));
  document.querySelectorAll('[data-reason]').forEach(b=>b.addEventListener('click',()=>{
   state.reason=state.reason===b.dataset.reason?null:b.dataset.reason;
   document.querySelectorAll('[data-reason]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.reason===state.reason)));
  }));
  $('analyze').addEventListener('click',evaluate);
  $('own-comment').addEventListener('input',()=>{setStatus('input-status','');resetAfterChange()});
  $('own-comment').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')evaluate()});
  $('preview').addEventListener('click',showPreview);
  $('open-feedback').addEventListener('click',()=>showFeedback(false));
  $('show-optional').addEventListener('click',()=>{state.optional=true;renderRecommendation()});
  $('skip-to-feedback').addEventListener('click',()=>showFeedback(true));
  $('change-reply').addEventListener('click',()=>{$('preview-section').hidden=true;$('feedback').hidden=true;changePhase(2);scrollTo($('result'))});
  $('copy-reply').addEventListener('click',async()=>{
   const txt=state.result?.text;if(!txt)return;
   try{
    await navigator.clipboard.writeText(txt);
    setStatus('copy-status','✓ Kopiert! Prüfe Fakten und Kontext vor dem Posten. 🌱');
   }catch{
    // In privacy-focused browsers, select the visible draft for manual copying.
    const textNode=$('reply-text');
    try{
     const range=document.createRange();range.selectNodeContents(textNode);
     const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
     setStatus('copy-status','Text markiert – bitte über dein Browsermenü kopieren.');
    }catch{setStatus('copy-status','Kopieren ist blockiert. Bitte den Entwurf manuell markieren.');}
   }
  });
  $('share-feedback').addEventListener('click',shareFeedback);
  $('copy-feedback').addEventListener('click',copyFeedback);
  $('next-case').addEventListener('click',()=>{
   const sequence=['taste','rage','ethics','own'],i=sequence.indexOf(state.scene);
   chooseScene(sequence[(i+1)%sequence.length]);scrollTo($('challenge'));
  });
  $('share-test').addEventListener('click',shareTest);
  chooseScene(state.scene);
  document.body.dataset.pilotReady='true';
  if(params.has('selftest'))setTimeout(selftest,100);
 }
 function selftest(){
  const output=document.createElement('output');output.id='av-pilot-selftest';output.dataset.status='running';document.body.append(output);
  try{
   if(state.scene!=='taste'||!$('comment-text').textContent.includes('Fleisch schmeckt'))throw Error('DEFAULT_CONTEXT');
   $('analyze').click();
   if($('result').hidden||!$('recommend-title').textContent.includes('Frage'))throw Error('RECOMMENDATION');
   if($('reply-text').textContent.length<65)throw Error('EMPTY_DRAFT');
   const a=$('reply-text').textContent;
   $('open-feedback').click();
   if($('feedback').hidden||!$('preview-section').hidden)throw Error('DIRECT_FEEDBACK');
   document.querySelector('[data-voice="bao"]').click();
   if(!$('feedback').hidden||state.vote!==null)throw Error('VOICE_RESETS_FEEDBACK');
   const b=$('reply-text').textContent;
   if(a===b||!b.includes('😄'))throw Error('DISTINCT_VOICES');
   $('preview').click();
   if($('preview-section').hidden||$('feedback').hidden||!$('preview-reply').textContent.includes('😄'))throw Error('PREVIEW');
   if(!$('share-feedback').disabled)throw Error('FEEDBACK_SENT_WITHOUT_VOTE');
   document.querySelector('[data-vote="maybe"]').click();
   document.querySelector('[data-reason="Zu belehrend"]').click();
   $('feedback-note').value='Kürzer und direkter.';
   const msg=feedbackMessage();
   if(!msg.text.includes('Kürzer und direkter.')||msg.text.includes('foodfirst.berlin'))throw Error('SAFE_FEEDBACK');
   chooseScene('rage');$('analyze').click();
   if($('no-reply').hidden||!$('reply-options').hidden)throw Error('RAGE_DEFAULT');
   $('show-optional').click();if($('reply-options').hidden)throw Error('RAGE_OPTIN');
   chooseScene('own');$('own-comment').value='Schreib mir bei @private.test bitte!';$('analyze').click();
   if(!$('result').hidden)throw Error('PRIVATE_COMMENT_ACCEPTED');
   $('own-comment').value='Warum sollten wir beim Essen an die Tiere denken?';$('analyze').click();
   if($('result').hidden)throw Error('OWN_COMMENT');
   chooseScene('ethics');$('analyze').click();
   if(state.result.language!=='en'||!$('reply-text').textContent)throw Error('BILINGUAL');
   if(!fromNvsino&&postLink('rage')!==shareBase+'?scene=rage')throw Error('DEEPLINK');
   output.dataset.status='pass';
   output.textContent='PASS: first action, direct feedback, voice reset, four voices, preview, no-feedback-before-vote, safe sharing, ragebait abstention, opt-in, private-data hold and bilingual reply';
  }catch(e){output.dataset.status='fail';output.textContent='FAIL: '+(e?.message||e)}
 }
 init();
})();
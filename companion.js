/* PWA capture and four-way human-first routing. All sharing is manually initiated. */
(function(){
 'use strict';
 const core=window.AVCompanionCore;if(!core)return;
 const $=id=>document.getElementById(id);
 let currentText='',currentAdvice=null;
 let shareCandidate='';
 function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));}
 function showActionOutcome(html){$('action-outcome').innerHTML=html;$('action-outcome').hidden=false;}
 function resetOutcome(){ $('triage-panel').hidden=true;$('result-area').hidden=true;$('action-outcome').hidden=true;document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed','false'));window.AV_RESET_ACTIVE?.(); }
 const share=core.extractShare(window.location.search);
 if(share){
   const url=window.location.pathname+(window.location.hash||'#dialog');
   // Avoid keeping user-supplied comment text in browser history after the initial GET.
   history.replaceState(null,'',url);
   $('share-banner').hidden=false;
   $('share-message').textContent=share.linkOnly?'Instagram hat nur einen Link oder einen unvollständigen Text geteilt. Bitte den echten Kommentar zusätzlich kopieren.':'Dieser Text stammt aus dem Teilen-Menü. Prüfe, ob er wirklich der gewünschte Kommentar ist (und nicht eine Beitragsbeschreibung).';
   if(share.link)$('source-url').value=share.link;
   if(share.text){$('share-preview').textContent=share.text;$('share-preview').hidden=false;}
   if(share.hasCommentText){shareCandidate=share.text;$('use-shared-text').hidden=false;}
   window.setTimeout(()=>document.getElementById('comment')?.focus({preventScroll:true}),150);
 }
 $('use-shared-text').addEventListener('click',()=>{if(!shareCandidate)return;$('comment').value=shareCandidate;$('comment').focus();$('share-message').textContent='Bitte kontrolliere die Aussage – und dann die sinnvollste Handlung wählen.';resetOutcome();});
 $('paste-clipboard').addEventListener('click',async()=>{
   try{const text=(await navigator.clipboard.readText()).slice(0,1800);if(!text.trim())throw Error('empty');
     if(core.isHTTPUrl(text.trim())){ $('source-url').value=core.cleanURL(text.trim());$('comment').value=''; $('share-banner').hidden=false;$('share-message').textContent='Das ist nur ein Link. Kopiere bitte zusätzlich den eigentlichen Kommentar.';}
     else{$('comment').value=text;}
     $('comment').focus();resetOutcome();
   }catch{$('comment').focus();$('comment').placeholder='Bitte lange drücken → Einfügen. Dein Browser erlaubt keinen direkten Zwischenablage-Zugriff.';}
 });
 $('comment').addEventListener('input',resetOutcome);
 $('source-url').addEventListener('input',()=>{if(currentAdvice)resetOutcome();});
 function triage(){
   const text=$('comment').value.trim();
   if(text.length<8||core.isHTTPUrl(text)){$('comment').focus();$('comment').setCustomValidity(text?'Ein Beitragslink ist kein Kommentar.':'Bitte den genauen Kommentar einfügen.');$('comment').reportValidity();window.setTimeout(()=>$('comment').setCustomValidity(''),2000);return;}
   $('comment').setCustomValidity('');currentText=text;
   const known=window.AV_TOPIC_MATCH?.(text);const validLink=core.cleanURL($('source-url').value.trim());
   currentAdvice=core.advise(text,{knownTopic:!!known,hasSource:!!validLink});
   $('triage-panel').hidden=false;$('result-area').hidden=true;$('action-outcome').hidden=true;
   const a=currentAdvice;
   $('triage-recommendation').textContent=a.headline;
   $('triage-reason').textContent=a.reason;
   $('recommendation-icon').textContent={reply:'💬',report:'🚩',ignore:'🌿',save:'✧'}[a.action];
   $('triage-confidence').textContent='Regelbasierte Orientierung · Nicht verbindlich';
   document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===a.action)));
   $('triage-panel').scrollIntoView({behavior:'smooth',block:'start'});
 }
 $('analyze').addEventListener('click',triage);
 document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{
   if(!currentAdvice||!currentText||$('comment').value.trim()!==currentText){resetOutcome();return;}
   const action=button.dataset.action;document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   const source=core.cleanURL($('source-url').value.trim());
   if(action==='reply'){
     $('action-outcome').hidden=true;
     const status=window.AV_ANALYZE?.();
     if(status!=='ready'){
       showActionOutcome('<strong>Erst recherchieren, dann antworten.</strong><p>Wir haben noch keinen freigabefähigen, quellengebundenen Antwortentwurf. Du kannst die Frage als Content-Idee sichern.</p><button class="button button-secondary" type="button" id="save-held">Als Idee merken</button>');
       $('save-held')?.addEventListener('click',()=>document.querySelector('[data-action="save"]').click());
     }
   }else if(action==='report'){
     window.AV_LOG_DECISION?.('report-guidance',core.sanitizeIdea(currentText),source);
     $('result-area').hidden=true;
     const link=core.isInstagramURL(source)?source:'https://www.instagram.com/';
     showActionOutcome('<strong>In Instagram melden – nur bei tatsächlichem Regelverstoß</strong><p>Öffne den Beitrag → Menü am betreffenden Kommentar → „Melden“. Wähle den zutreffenden Grund. Nicht jede falsche oder unhöfliche Meinung verstößt gegen Richtlinien. Wir melden nichts automatisch.</p><div class="after-approval-buttons"><a class="button button-secondary" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">Instagram öffnen ↗</a><button type="button" id="confirm-report" class="button button-secondary">Ich habe selbst gemeldet ✓</button></div>');
     $('confirm-report').addEventListener('click',()=>{window.AV_LOG_DECISION?.('reported',core.sanitizeIdea(currentText),source);$('confirm-report').disabled=true;$('confirm-report').textContent='Selbstauskunft vermerkt ✓';});
   }else if(action==='ignore'){
     window.AV_LOG_DECISION?.('ignored','',source);$('result-area').hidden=true;
     showActionOutcome('<strong>Eine gute Entscheidung für deine Energie. 🌿</strong><p>Du musst nicht jeden Konflikt führen. Bei gezielter Belästigung kannst du in Instagram blockieren, stummschalten oder melden.</p>');
   }else if(action==='save'){
     const idea=core.sanitizeIdea(currentText);
     window.AV_LOG_DECISION?.('saved-idea',idea,source);$('result-area').hidden=true;
     showActionOutcome('<strong>Für einen späteren Inhalt vorgemerkt ✧</strong><p>Wir haben die Frage lokal und ohne Nutzernamen gespeichert. Du kannst daraus im Content-Studio später einen sorgfältig recherchierten Beitrag entwickeln.</p><button type="button" id="go-content-from-save" class="button button-secondary">Content-Studio öffnen ↗</button>');
     $('go-content-from-save').addEventListener('click',()=>document.querySelector('[data-route="content"]')?.click());
   }
 }));
 document.querySelectorAll('[data-length]').forEach(b=>b.addEventListener('click',()=>{
   document.querySelectorAll('[data-length]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
   window.AV_SET_LENGTH?.(b.dataset.length);
 }));
 $('mark-posted').addEventListener('click',()=>{if(window.AV_MARK_SELF_REPORTED_POST?.()){$('mark-posted').disabled=true;$('mark-posted').textContent='Selbstauskunft gespeichert ✓';$('posted-note').textContent='Danke. Wir zählen das nicht als nachgewiesene Verhaltensänderung.';}});
 let deferredInstall=null;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;$('install').hidden=false;});
 $('install').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();try{await deferredInstall.userChoice;}catch{}deferredInstall=null;$('install').hidden=true;}else document.querySelector('.pwa-instructions').open=true;});
 window.addEventListener('appinstalled',()=>{$('install').hidden=true;deferredInstall=null;});
 if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();

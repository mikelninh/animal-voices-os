/* Animal Voices 0.9: local evidence and context workers, human-controlled publishing. */
(() => {
  'use strict';
  const DATA = window.AV_DATA;
  const T = window.AV_TRIAGE;
  const E = window.AV_ENGINE;
  if(!T || !E) { document.body.textContent='Der sichere Entscheidungsassistent konnte nicht geladen werden.'; return; }
  if (!DATA?.cases?.length || !DATA?.sources?.length) { document.body.textContent = 'Die Wissensbibliothek konnte nicht geladen werden.'; return; }
  const $ = id => document.getElementById(id);
  const casesById = new Map(DATA.cases.map(t => [t.id, t]));
  const sourcesById = new Map(DATA.sources.map(s => [s.id, s]));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const safeURL = u => /^https:\/\/[a-z0-9.-]+(?:[\/?#:]|$)/i.test(u||'') ? u : '#';
  const stamp = () => new Date().toISOString();
  const storage = 'animal-voices-studio-v07'; // Backward-compatible with saved v0.7 records
  let replyForm = 'short';
  const personas = {momo:'Momo',kiki:'Kiki',bao:'Bao'};
  let records = [];
  try {const stored=JSON.parse(localStorage.getItem(storage)||'[]');if(Array.isArray(stored)) records=stored.filter(x=>x&&typeof x.id==='string').slice(0,300).map(x=>({...x,input:T.sanitizeIdea(x.input||''),postUrl:''}));} catch {}
  let active = null;
  let persona = 'momo';
  let filter = 'Alle';
  let generatedScript = '';
  let toastTimer = 0;
  let lastRecommendation = null;
  const pendingShare = T.readShared(location.search);
  const topicList = DATA.cases;

  function toast(message) {let e=$('toast');e.textContent=message;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3400);}
  function minimizedRecords(){return records.slice(0,300).map(x=>({...x,input:T.sanitizeIdea(x.input||''),postUrl:'',reply:x.status==='approved'?x.reply:'',approvedReply:x.status==='approved'?x.approvedReply:null}));}
  function persist(){try{localStorage.setItem(storage,JSON.stringify(minimizedRecords()))}catch{toast('Lokale Speicherung nicht verfügbar.')}renderImpact()}
  function go(page) {
    if(!['dialog','library','content','impact'].includes(page)) page='dialog';
    document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id==='view-'+page));
    document.querySelectorAll('[data-route]').forEach(e=>e.setAttribute('aria-current',e.dataset.route===page?'page':'false'));
    if(location.hash.slice(1)!==page) history.replaceState(null,'','#'+page);
    window.scrollTo({top:0,behavior:'instant'});
    if(page==='impact')renderImpact();
  }
  document.querySelectorAll('[data-route],[data-go]').forEach(e=>e.addEventListener('click', ev=>{ev.preventDefault();go(e.dataset.route||e.dataset.go)}));
  window.addEventListener('hashchange',()=>go(location.hash.slice(1)));
  go(location.hash.slice(1)||'dialog');

  function setJourney(stage) { for(let i=1;i<=3;i++){ const e=$('journey-'+['one','two','three'][i-1]); e.classList.toggle('current',stage===i);e.classList.toggle('complete',stage>i);} }
  setJourney(1);
  const samples = [
    {t:'„Vegane Männer sind doch schwach.“',s:'Vegane Männer sind schwach und können keine Muskeln aufbauen.'},
    {t:'„Wozu braucht man B12?“',s:'Warum braucht man als Veganer Vitamin B12?'},
    {t:'„Aber bei der Ernte sterben Tiere!“',s:'Bei der Ernte sterben doch auch Tiere, oder?'},
    {t:'„Soja und Hormone?“',s:'Senkt Soja wirklich den Testosteronspiegel?'}
  ];
  $('sample-chips').innerHTML=samples.map((s,i)=>'<button type="button" class="example-chip" data-sample="'+i+'">'+escape(s.t)+'</button>').join('');
  $('sample-chips').addEventListener('click', e=>{const b=e.target.closest('[data-sample]');if(!b)return; $('comment').value=samples[Number(b.dataset.sample)].s; $('post-url').value=''; clearComposerFeedback(); $('comment').focus();});

  // The separate engine performs cautious context and evidence resolution.
  // Its decisions remain suggestions; it is NOT a live LLM or moderation authority.
  function sourceCards(t) {const list=t.sources.map(id=>sourcesById.get(id)).filter(Boolean);
    return list.map(s=>'<div class="reference"><div><h3>'+escape(s.name)+'</h3><div class="meta">'+escape(s.year)+' · '+escape(s.kind)+'</div><p>'+escape(s.note)+'</p></div><a target="_blank" rel="noopener noreferrer" href="'+safeURL(s.url)+'">Original ↗</a></div>').join('');
  }
  function showHold(reason){
    $('result-area').hidden=false;$('reply-card').hidden=true;
    $('analysis-status').textContent='Weitere Prüfung nötig';$('analysis-status').className='status-pill warn';
    $('evidence-body').innerHTML='<div class="caveat"><span class="symbol">◎</span><div><strong>Hier halten wir bewusst an.</strong><div style="margin-top:5px">'+escape(reason)+'</div><div style="margin-top:9px">Nächster Schritt: Frage präzisieren oder in der Wissensbibliothek nach passenden Quellen suchen.</div><button class="button button-secondary" id="open-library" style="margin-top:15px">Wissen durchsuchen ↗</button></div></div>';
    $('open-library').addEventListener('click',()=>go('library'));
    setJourney(2);
    $('evidence-card').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showReady(topic){
    $('result-area').hidden=false;$('evidence-card').hidden=false;$('reply-card').hidden=false;
    $('analysis-status').textContent='Redaktionelle Quellen';$('analysis-status').className='status-pill';
    $('evidence-body').innerHTML='<div class="takeaway"><strong>Was wir belegen können</strong>'+escape(topic.fact)+'</div>'+
      '<div class="evidence-references">'+sourceCards(topic)+'</div>'+
      '<div class="caveat"><span class="symbol">ⓘ</span><div><strong>Was du bei der Antwort beachten solltest</strong><div style="margin-top:4px">'+escape(topic.limit)+'</div></div></div>'+
      '<div class="quote-note">Die Quellen wurden redaktionell zusammengestellt. Bitte vor der Verwendung im Original gegenprüfen – keine Live-Quellenvalidierung.</div>'+
      '<div class="next-step-line"><span>Die Belege passen zur Frage?</span><button class="button button-primary" id="next-answer">Weiter zur Antwort ↗</button></div>';
    $('next-answer').addEventListener('click',()=>{$('reply-card').scrollIntoView({behavior:'smooth',block:'start'});setJourney(3)});
    active.reply=T.reply(topic,persona,replyForm);active.form=replyForm;
    $('reply').value=active.reply;$('reviewer').value='';$('review-check').checked=false;$('source-check').checked=false;
    $('after-copy').hidden=true; $('source-check').disabled=true; updateLengthButtons();
    setApprovalState();setJourney(2);
    $('evidence-card').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function selectAction(action){
    if(!active||!['reply','report','ignore','save'].includes(action))return;
    const oldAction=active.action;
    active.action=action;
    document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===action)));
    const fb=$('action-feedback');
    const rec=lastRecommendation?.action||'save';
    const recommendation=action===rec?'<span class="success">Unsere Empfehlung · </span>':'';
    let content='';
    $('evidence-card').hidden=true;$('reply-card').hidden=true;$('after-copy').hidden=true;
    if(action==='reply'){
      if(active.hold || !active.topicId){
        active.status='held';
        content=recommendation+'<strong>Hier brauchen wir erst mehr Kontext oder Quellen.</strong><p>'+escape(active.reason||'Noch keine zugeordnete Wissenskarte')+'</p><button class="button button-secondary" id="research-first">In der Bibliothek recherchieren ↗</button>';
        fb.innerHTML=content;
        $('research-first').addEventListener('click',()=>go('library'));
      }else{
        active.status='ready';
        content=recommendation+'<strong>Gut – wir können vorsichtig antworten.</strong><p>Die Quelle ist kuratiert, aber nicht live verifiziert. Lies sie im Original und gib den Text selbst frei.</p>';
        fb.innerHTML=content;
        $('evidence-card').hidden=false;
        showReady(casesById.get(active.topicId));
      }
    }else if(action==='report'){
      active.status='reported_to_review';
      content=recommendation+'<strong>Prüfe zuerst, ob ein Plattformverstoss vorliegt.</strong><p>Auf Instagram: Kommentar länger drücken oder auf ⋯ tippen → „Melden“ → Grund auswählen. Meinungsverschiedenheiten allein sind kein Regelverstoss.</p><p>Animal Voices meldet nichts selbst.</p><button class="button button-secondary" id="return-for-report">Instagram öffnen ↗</button>';
      fb.innerHTML=content;document.getElementById('return-for-report').addEventListener('click',()=>openInstagram());
    }else if(action==='ignore'){
      active.status='ignored';
      fb.innerHTML=recommendation+'<strong>Du musst nicht jeden Streit führen. 🌿</strong><p>Ignorieren, stummschalten oder blockieren ist in Ordnung. Deine Energie ist für hilfreiche Gespräche kostbar.</p>';
    }else{
      active.status='idea';
      active.idea=T.sanitizeIdea(active.input); // No URLs, handles, emails or phone numbers in idea text.
      active.input=active.idea; active.postUrl='';
      fb.innerHTML=recommendation+'<strong>Als anonymisierte Content-Idee gespeichert. ✦</strong><p>Wir merken nur das Thema und eine bereinigte Kurzfassung. Hier könnte ein Reel oder ein Faktencheck entstehen.</p><button class="button button-secondary" id="open-content">Zum Content-Studio ↗</button>';
      document.getElementById('open-content').addEventListener('click',()=>{if(active?.topicId)$('content-topic').value=active.topicId;go('content')});
    }
    if(action!==oldAction){active.approvedReply=null;active.postedAt=null;}
    persist();setJourney(action==='reply'&&!active.hold?2:3);
  }
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>selectAction(b.dataset.action)));
  function openInstagram(){const href=T.instagramUrl(active?.postUrl)||'https://www.instagram.com/';window.open(href,'_blank','noopener,noreferrer');}
  $('context-type').addEventListener('change',()=>{
    if(active){active.status='held';active.hold=true;active.approvedReply=null;active.postedAt=null;active.copiedAt=null;
      $('result-area').hidden=true; $('after-copy').hidden=true;persist();setJourney(1);
      toast('Kontext geändert. Bitte den Kommentar erneut prüfen.');}
  });
  function clearComposerFeedback(){
    $('composer-feedback').hidden=true;
    $('comment').setAttribute('aria-invalid','false');
    $('post-url').setAttribute('aria-invalid','false');
  }
  function composerProblem(message,field='comment'){
    $('composer-feedback-message').textContent=message;
    $('composer-feedback').hidden=false;
    $('comment').setAttribute('aria-invalid',String(field==='comment'));
    $('post-url').setAttribute('aria-invalid',String(field==='post-url'));
    $(field).focus({preventScroll:true});
    $('composer-feedback').scrollIntoView({behavior:'auto',block:'nearest'});
  }
  $('comment').addEventListener('input',clearComposerFeedback);
  $('post-url').addEventListener('input',clearComposerFeedback);
  $('composer-try-example').addEventListener('click',()=>{
    $('comment').value=samples[0].s;
    $('post-url').value='';
    clearComposerFeedback();
    $('comment').focus();
    toast('Beispiel geladen. Jetzt „Handlung wählen“ drücken.');
  });
  $('analyze').addEventListener('click',()=>{
    const input=$('comment').value.trim();const postUrl=T.instagramUrl($('post-url').value);
    if(input.length<8){composerProblem(input.length?'Bitte den vollständigen Kommentar eingeben (mindestens acht Zeichen).':'Bitte zuerst einen Kommentar einfügen oder ein Beispiel laden. Nur mit einem Kommentar können wir eine Handlung empfehlen.');return;}
    if($('post-url').value.trim()&&!postUrl){composerProblem('Der Beitragslink ist ungültig. Nutze einen echten Instagram-Link oder lass das Feld leer.','post-url');return;}
    clearComposerFeedback();
    const decision=E.decide(input,topicList,sourcesById,$('context-type').value);
    const topic=decision.topic;
    const reason=decision.hold ? decision.reason : null;
    lastRecommendation={action:decision.action,reason:decision.reason,level:decision.context};
    const record={id:(crypto.randomUUID?.()||String(Date.now())),createdAt:stamp(),input,postUrl,topicId:topic?.id||null,topicName:topic?.short||null,status:'triage',action:null,recommended: lastRecommendation.action,reason:decision.reason,hold:decision.hold,context:decision.context,engine:decision.method,persona,form:replyForm,reply:'',approvedReply:null,reviewer:null,postedAt:null,copiedAt:null,sourceOpenedAt:null};
    active=record;records.unshift(record);if(records.length>300)records=records.slice(0,300);persist();
    $('result-area').hidden=false;$('triage-card').hidden=false;$('evidence-card').hidden=true;$('reply-card').hidden=true;
    $('triage-reason').textContent=lastRecommendation.reason;
    $('analysis-basis').innerHTML='<strong>Kontext:</strong> '+escape(decision.context_note)+
      ' · <strong>Belege:</strong> '+escape(decision.evidence?.reason||'Unbekannt')+
      (decision.alternatives?.length?' · <strong>Erkannte Themen:</strong> '+decision.alternatives.map(x=>escape(x.label)).join(', '):'')+
      '<br><span>Automatisch vorgeschlagen, nicht als zuverlässige KI-Erkennung oder überprüfter Faktencheck zertifiziert.</span>';
    const labels={reply:'Antworten',report:'Melden',ignore:'Ignorieren',save:'Als Idee merken'};
    $('triage-status').textContent='Empfohlen: '+labels[lastRecommendation.action];
    $('action-feedback').innerHTML='<p>Wähle die Handlung, die für diese Situation wirklich sinnvoll ist. Es wird nichts automatisch veröffentlicht oder gemeldet.</p>';
    document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed','false'));
    setJourney(2);
    $('triage-card').scrollIntoView({behavior:'auto',block:'start'});
    toast('Einschätzung bereit. Entscheide bewusst, ob eine Antwort sinnvoll ist.');
  });
  function updateLengthButtons(){
    $('reply-short').setAttribute('aria-pressed',String(replyForm==='short'));
    $('reply-long').setAttribute('aria-pressed',String(replyForm==='long'));
  }
  function setReplyForm(next){
    if(!['short','long'].includes(next))return;
    replyForm=next;updateLengthButtons();
    if(active?.topicId&&active.action==='reply'&&['ready','approved'].includes(active.status)){
      active.form=next;active.reply=T.reply(casesById.get(active.topicId),persona,next);
      active.approvedReply=null;active.approvedAt=null;active.status='ready';
      $('reply').value=active.reply;$('review-check').checked=false;$('source-check').checked=false;$('after-copy').hidden=true;
      persist();setApprovalState();
    }
  }
  $('reply-short').addEventListener('click',()=>setReplyForm('short'));
  $('reply-long').addEventListener('click',()=>setReplyForm('long'));
  updateLengthButtons();
  function setPersona(next){if(!personas[next])return;persona=next;
    document.querySelectorAll('[data-persona]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.persona===next)));
    if(active?.topicId&&active.action==='reply'&&['ready','approved'].includes(active.status)){
      const t=casesById.get(active.topicId); if(!t)return;
      active.persona=next;active.reply=T.reply(t,next,replyForm);active.approvedReply=null;active.status='ready';active.reviewer=null;
      $('reply').value=active.reply;$('reviewer').value='';$('review-check').checked=false;$('source-check').checked=false;$('after-copy').hidden=true;persist();setApprovalState();
      toast('Stimme geändert. Bitte Antwort erneut prüfen.');
    }
  }
  document.querySelectorAll('[data-persona]').forEach(b=>b.addEventListener('click',()=>setPersona(b.dataset.persona)));
  function setApprovalState(){
    const canApprove=active?.status==='ready'&&$('review-check').checked&&!!active.sourceOpenedAt&&$('source-check').checked&&$('reviewer').value.trim().length>=2&&$('reply').value.trim().length>=10;
    $('approve').disabled=!canApprove;
    $('copy').disabled=!(active?.status==='approved'&&active.approvedReply===$('reply').value);
    $('approval-status').textContent=active?.status==='approved'?'✓ Freigegeben für die manuelle Verwendung. Noch nicht veröffentlicht.':'Noch nicht freigegeben. Nichts wird automatisch veröffentlicht.';
  }

  // A source link must be opened before its review checkbox can be checked.
  $('evidence-body').addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="https://"]');
    if(anchor&&active?.action==='reply'&&active.topicId){
      active.sourceOpenedAt=stamp();$('source-check').disabled=false;
      persist();setApprovalState();
      toast('Quelle geöffnet. Bitte den Beleg und seine Einschränkungen im Original prüfen.');
    }
  });
  // Optional two-model writer+critic. Explicit consent, secure editor access, no keys in browser.
  $('ai-draft').addEventListener('click',async()=>{
    if(!active||active.action!=='reply'||!active.topicId||active.hold||active.status==='held'){
      $('ai-status').textContent='Bitte zuerst eine belegte Frage oder Aussage im Dialog prüfen.';return;
    }
    if(!$('ai-consent').checked){$('ai-status').textContent='Ohne ausdrückliche Einwilligung werden keine Kommentare an einen KI-Anbieter übertragen.';return;}
    const access=$('ai-editor-code').value.trim();if(!access){$('ai-status').textContent='Für den privaten KI-Worker ist ein Editor-Code erforderlich.';return;}
    $('ai-draft').disabled=true;$('ai-status').textContent='KI-Writer und Faktenkritiker prüfen den Entwurf …';
    try{
      const resp=await fetch('/api/assist',{method:'POST',headers:{'Content-Type':'application/json','X-AVOS-Editor':access},body:JSON.stringify({text:$('comment').value.trim(),contextType:$('context-type').value,persona,consent:true})});
      const result=await resp.json();if(!resp.ok||result.ok!==true)throw Error(result.error||'KI-Dienst nicht verfügbar.');
      active.reply=result.reply;active.status='ready';active.approvedReply=null;active.approvedAt=null;active.reviewer=null;active.sourceOpenedAt=null;active.aiReview=true;
      $('reply').value=result.reply;$('reviewer').value='';$('review-check').checked=false;$('source-check').checked=false;$('source-check').disabled=true;$('after-copy').hidden=true;
      persist();setApprovalState();$('ai-status').textContent='KI-Entwurf vorbereitet; Gegenprüfung bestanden. Bitte die Originalstudie selbst öffnen und alle Angaben überprüfen.';
    }catch(err){$('ai-status').textContent=String(err.message||err).slice(0,190)}finally{$('ai-draft').disabled=false;}
  });
  $('review-check').addEventListener('change',setApprovalState);
  $('source-check').addEventListener('change',setApprovalState);
  $('reviewer').addEventListener('input',setApprovalState);
  $('reply').addEventListener('input',()=>{
    if(!active||!active.topicId)return;
    active.reply=$('reply').value;
    if(active.status==='approved') {active.status='ready';active.approvedReply=null;active.reviewer=null;}
    $('review-check').checked=false;$('after-copy').hidden=true;active.copiedAt=null;active.postedAt=null;persist();setApprovalState();
  });
  $('approve').addEventListener('click',()=>{
    if(!active||active.status!=='ready'||!$('review-check').checked||!active.sourceOpenedAt||!$('source-check').checked||$('reviewer').value.trim().length<2||$('reply').value.trim().length<10)return;
    active.status='approved';active.reply=$('reply').value;active.approvedReply=active.reply;active.reviewer=$('reviewer').value.trim();active.approvedAt=stamp();active.copiedAt=null;active.postedAt=null;persist();setApprovalState();setJourney(3);toast('Antwort freigegeben. Jetzt mit Quellen kopieren.');
  });
  async function copyToClipboard(text){try{await navigator.clipboard.writeText(text);toast('In die Zwischenablage kopiert. ♡');return true;}catch{toast('Kopieren nicht verfügbar. Text bitte manuell markieren.');return false;}}
  $('copy').addEventListener('click',async()=>{
    if(!active||active.status!=='approved'||active.approvedReply!==$('reply').value)return;
    const topic=casesById.get(active.topicId);if(!topic)return;
    const links=topic.sources.map(id=>sourcesById.get(id)).filter(Boolean).map(s=>s.name+' ('+s.year+'): '+s.url);
    const copied=await copyToClipboard(active.reply+'\n\nQuellen:\n'+links.join('\n'));
    if(copied){active.copiedAt=stamp();persist();$('after-copy').hidden=false;$('back-instagram').href=T.instagramUrl(active.postUrl)||'https://www.instagram.com/';}
  });
  $('mark-posted').addEventListener('click',()=>{
    if(!active||active.status!=='approved'||!active.copiedAt)return;
    active.postedAt=stamp();persist();
    $('posted-status').textContent='Selbst als veröffentlicht markiert. Dies wurde nicht von Instagram verifiziert.';
    toast('Dokumentiert – keine automatische Veröffentlichung. ♡');
  });

  // Evidence library, manually reviewed source cards.
  const categories=['Alle',...new Set(topicList.map(t=>t.category))];
  $('filters').innerHTML=categories.map(cat=>'<button class="filter'+(cat==='Alle'?' active':'')+'" data-filter="'+escape(cat)+'">'+escape(cat)+'</button>').join('');
  $('filters').addEventListener('click',event=>{const btn=event.target.closest('[data-filter]');if(!btn)return;filter=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));renderTopics();});
  $('search').addEventListener('input',renderTopics);
  function renderTopics(){const phrase=$('search').value.trim().toLowerCase();const filtered=topicList.filter(t=>(filter==='Alle'||t.category===filter)&&[t.title,t.fact,t.short,...t.keywords].join(' ').toLowerCase().includes(phrase));
    $('topic-grid').innerHTML=filtered.length?filtered.map(t=>'<button class="topic" data-topic="'+escape(t.id)+'"><div><span class="topic-tag">'+escape(t.category)+'</span><h3>'+escape(t.short)+'</h3></div><div class="topic-footer"><span>'+t.sources.length+' '+(t.sources.length===1?'Quelle':'Quellen')+'</span><span>↗</span></div></button>').join(''):'<p>Keine passenden Themen. Wir ergänzen die Bibliothek laufend.</p>';
  }
  $('topic-grid').addEventListener('click',event=>{const btn=event.target.closest('[data-topic]');if(btn)openTopic(btn.dataset.topic)});
  function openTopic(id){const t=casesById.get(id);if(!t)return;
    $('evidence-detail').hidden=false;
    $('evidence-detail').innerHTML='<span class="section-kicker">'+escape(t.category)+'</span><h2>'+escape(t.title)+'</h2><p class="detail-fact">'+escape(t.fact)+'</p><div class="caveat"><span>ⓘ</span><div><strong>Einordnung:</strong> '+escape(t.limit)+'</div></div><div class="evidence-references">'+sourceCards(t)+'</div><button id="topic-to-dialog" class="button button-primary">Darüber einen Dialog starten ↗</button>';
    $('topic-to-dialog').addEventListener('click',()=>{$('comment').value=t.title;go('dialog');$('comment').focus();toast('Thema übernommen. Antwort jetzt vorbereiten.');});
    $('evidence-detail').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  renderTopics();

  // Content studio: deterministic, cited editorial scaffolds (not auto-posted).
  $('content-topic').innerHTML=topicList.map(t=>'<option value="'+escape(t.id)+'">'+escape(t.short)+'</option>').join('');
  $('generate').addEventListener('click',()=>{
    const t=casesById.get($('content-topic').value);if(!t)return;
    const voice=$('content-persona').value;const format=$('content-format').value;const angle=$('content-hook').value;
    const hook={humor:'Ein kleiner Witz, der zum Nachdenken einlädt.',fact:'Was sagen Studien tatsächlich?',heart:'Was könnten wir sehen, wenn wir Tiere als Individuen betrachten?'}[angle];
    const citations=t.sources.map(id=>sourcesById.get(id)).filter(Boolean).map(s=>'- '+s.name+' ('+s.year+'): '+s.url).join('\n')||'Noch keine ausreichend geprüfte Quelle im Register.';
    const fact='Faktenkern: '+t.fact+'\nWichtig: '+t.limit;
    if(format==='carousel')generatedScript='CAROUSEL · 5 SLIDES · '+personas[voice]+'\n\n1 · HOOK\n'+hook+'\n\n2 · DIE FRAGE\n'+t.title+'\n\n3 · DER FAKTEN-CHECK\n'+t.fact+'\n\n4 · DIE GRENZEN\n'+t.limit+'\n\n5 · DAS GESPRÄCH\n'+t.voices[voice];
    else if(format==='story')generatedScript='INSTAGRAM STORY · 3 FRAMES · '+personas[voice]+'\n\n1 · INTERAKTIVE FRAGE\n'+t.title+'\n\n2 · WISSEN\n'+t.fact+'\n\n3 · MENSCHLICHER MOMENT\n'+t.voices[voice]+'\n[Fragesticker: Welche Frage möchtest du als Nächstes klären?]';
    else generatedScript='REEL · CA. 30 SEKUNDEN · '+personas[voice]+'\n\n00–04s · EINSTIEG\n'+hook+'\n\n05–15s · FAKTEN\n'+t.fact+'\n\n16–25s · PERSPEKTIVE\n'+t.voices[voice]+'\n\n26–30s · EINLADUNG\nWelche Frage sollen wir gemeinsam als Nächstes prüfen?';
    generatedScript+='\n\n── REDAKTIONELLE QUELLEN ──\n'+citations+'\n\n'+fact+'\n\nBitte sorgfältig prüfen, bevor etwas veröffentlicht wird.';
    $('script').textContent=generatedScript;$('content-status').textContent='Entwurf · Prüfung nötig';$('copy-script').disabled=false;toast('Kreativer Entwurf erstellt – Quellen bitte prüfen.');
  });
  $('copy-script').addEventListener('click',()=>{if(generatedScript)copyToClipboard(generatedScript)});

  function renderImpact(){ $('impact-cases').textContent=records.length; $('impact-approved').textContent=records.filter(x=>x.status==='approved').length;
    $('impact-posted').textContent=records.filter(x=>!!x.postedAt).length; $('impact-ideas').textContent=records.filter(x=>x.action==='save').length;
    const ideas=E.groupIdeas(records);
    $('idea-clusters').innerHTML=ideas.length?ideas.slice(0,6).map(x=>'<div class="idea-item"><span class="count">'+x.count+'×</span><strong>'+escape(x.label)+'</strong><p>'+escape(x.examples[0]||'Diese Frage wurde zum späteren Recherchieren gespeichert.')+'</p><button type="button" data-idea-topic="'+escape(x.id)+'">'+(casesById.has(x.id)?'Content dazu erstellen':'Im Wissen recherchieren')+' ↗</button></div>').join(''):'<p>Noch keine gespeicherten Ideen. Wenn eine Frage oft auftaucht, merkst du sie hier für neue Reels und Faktenchecks.</p>';
    $('records').innerHTML=records.length?records.slice(0,20).map(r=>'<div class="record"><strong>'+escape((r.action==='save'?r.idea||'[anonymisierte Idee]':r.input).slice(0,115))+'</strong><small>'+escape(r.status==='approved'?'Manuell freigegeben':r.action==='save'?'Content-Idee':r.action==='ignore'?'Ignoriert':r.action==='report'?'Meldung erwogen':r.status==='held'?'Zurückgestellt':'Zur Prüfung offen')+' · '+escape(r.topicName||'Thema unbekannt')+' · '+escape(r.createdAt.slice(0,10))+'</small></div>').join(''):'Noch keine Fälle. Probiere den Dialog aus.';
  }
  $('idea-clusters').addEventListener('click',event=>{
    const b=event.target.closest('[data-idea-topic]'); if(!b)return;
    const id=b.dataset.ideaTopic;if(casesById.has(id)){$('content-topic').value=id;go('content');$('content-topic').focus();}
    else {go('library'); $('search').focus();}
  });
  renderImpact();
  $('export').addEventListener('click',()=>{const payload=JSON.stringify({version:'0.9',exportedAt:stamp(),note:'Anonymisierte lokale Aufzeichnungen. Keine extern überprüfte Veröffentlichung oder Wirkung.',records:minimizedRecords()},null,2);const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='animal-voices-local-audit.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Lokales Audit exportiert.');});
  $('clear').addEventListener('click',()=>{if(!confirm('Alle lokal gespeicherten Fälle dauerhaft löschen?'))return;records=[];active=null;persist();$('result-area').hidden=true;setJourney(1);toast('Lokale Fälle gelöscht.');});

  // Installed Android PWA: POST share is intercepted by the local Service Worker.
  // Shared text stays in device IndexedDB, never in a network query string.
  function displayShare(shared){
    $('share-banner').hidden=false;
    if(shared.comment)$('comment').value=shared.comment;
    if(shared.postUrl)$('post-url').value=shared.postUrl;
    $('share-message').textContent=shared.comment?'Geteilter Text übernommen. Bitte kontrollieren, ob es der genaue Kommentar ist.':shared.postUrl?'Beitragslink übernommen; Instagram hat den Kommentartext nicht mitgeschickt. Bitte einfügen.':'Bitte den Kommentartext selbst einfügen.';
    go('dialog'); $('comment').focus({preventScroll:true});
  }
  function readInbox(){return new Promise((resolve,reject)=>{
    const req=indexedDB.open('animal-voices-inbox-v09',1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('items'))req.result.createObjectStore('items')};
    req.onerror=()=>reject(req.error);
    req.onsuccess=()=>{const db=req.result;const tx=db.transaction('items','readwrite');const store=tx.objectStore('items');const g=store.get('latest');let val=null;
      g.onsuccess=()=>{val=g.result||null;store.delete('latest')};
      tx.oncomplete=()=>{db.close();resolve(val)};tx.onerror=()=>{db.close();reject(tx.error)};
    };
  });}
  if(new URLSearchParams(location.search).has('inbox')){
    // Remove the transport marker without creating history entries.
    try{history.replaceState(null,'',location.pathname+'#dialog')}catch{}
    readInbox().then(raw=>{if(raw){const data=T.readShared('?'+new URLSearchParams({title:raw.title||'',text:raw.text||'',url:raw.url||''}));displayShare(data)}else toast('Keine geteilten Inhalte gefunden. Bitte Text manuell einfügen.');}).catch(()=>toast('Geteilten Inhalt nicht verfügbar. Bitte Kommentar manuell einfügen.'));
  } else if(pendingShare.shared){ // legacy v0.8 GET links, immediately scrub URL
    try{history.replaceState(null,'',location.pathname+'#dialog')}catch{}
    displayShare(pendingShare);
  } else if(new URLSearchParams(location.search).has('share_error')){
    try{history.replaceState(null,'',location.pathname+'#dialog')}catch{}
    toast('Teilen wurde nicht gespeichert. Kopiere den Kommentar bitte manuell.');
  }
  $('dismiss-share').addEventListener('click',()=>{$('share-banner').hidden=true;});
  $('install-info').addEventListener('click',()=>{$('install-dialog').showModal();});
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
})();

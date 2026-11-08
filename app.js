/* Animal Voices 0.7: transparent source-backed editorial workflow. No autonomous posting. */
(() => {
  'use strict';
  const DATA = window.AV_DATA;
  if (!DATA?.cases?.length || !DATA?.sources?.length) { document.body.textContent = 'Die Wissensbibliothek konnte nicht geladen werden.'; return; }
  const $ = id => document.getElementById(id);
  const casesById = new Map(DATA.cases.map(t => [t.id, t]));
  const sourcesById = new Map(DATA.sources.map(s => [s.id, s]));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const safeURL = u => /^https:\/\/[a-z0-9.-]+(?:[\/?#:]|$)/i.test(u||'') ? u : '#';
  const stamp = () => new Date().toISOString();
  const storage = 'animal-voices-studio-v07';
  const personas = {momo:'Momo',kiki:'Kiki',bao:'Bao'};
  const core = window.AVCompanionCore;
  let replyLength = 'short';
  let sourceOpened=false;
  function answerFor(t,voice){
    if(replyLength!=='short')return t.voices[voice];
    const authored=window.AV_COMPANION_RULES?.short?.[t.id];
    if(!authored)return core.shortenReply(t.voices[voice]);
    return voice==='kiki'?'Danke für die Frage. 💚 '+authored:voice==='bao'?'Ein kleiner Reality-Check aus Baos Küche: 😄 '+authored:authored;
  }
  let records = [];
  try {const stored=JSON.parse(localStorage.getItem(storage)||'[]');if(Array.isArray(stored)) records=stored.filter(x=>x&&typeof x.id==='string').slice(0,300);} catch {}
  let active = null;
  let persona = 'momo';
  let filter = 'Alle';
  let generatedScript = '';
  let toastTimer = 0;
  const topicList = DATA.cases;

  function toast(message) {let e=$('toast');e.textContent=message;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3400);}
  function persist(){try{localStorage.setItem(storage,JSON.stringify(records.slice(0,300)))}catch{toast('Lokale Speicherung nicht verfügbar.')}renderImpact()}
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
  $('sample-chips').addEventListener('click', e=>{const b=e.target.closest('[data-sample]');if(!b)return; $('comment').value=samples[Number(b.dataset.sample)].s; $('comment').focus();});

  // A small safe, deterministic triage. Unknown questions are held, never hallucinated.
  function safetyCheck(text){const t=text.toLowerCase();
    if(/ignore (?:all )?(?:previous )?instructions|ignoriere.*(anweisung|instruktion)|system prompt|developer message|delete your data|poste hundert|überschreibe deinen prompt/i.test(t))return 'Der Kommentar enthält System- oder Bot-Anweisungen. Wir behandeln ihn nur als Text, nicht als Auftrag.';
    if(/\b(baby|babys|säugling\w*|kleinkind|schwanger|schwangerschaft|stillen|pregnan|essstörung|medikament|diagnose|ernährungsstörung)\b/i.test(t))return 'Gesundheitlich sensibles Thema. Hier brauchen wir individuelle fachliche Beratung statt einer standardisierten Kommentarantwort.';
    if(/jemand (sagt|behauptet)|leute sagen|mein freund sagt|someone (said|says)|people (say|claim)|ich zitiere|ich widerspreche|ironie|sarkasmus|nicht wahr, dass|es stimmt nicht, dass/i.test(t))return 'Möglicherweise wird eine Behauptung nur zitiert oder kritisiert. Bitte erst die Absicht im Originalkontext klären.';
    return null;
  }
  function match(text){const normalized=text.toLowerCase();let ranked=topicList.map(t=>{
    const matched=t.keywords.filter(k=>k.length>3&&normalized.includes(k.toLowerCase()));
    return {topic:t,score:matched.reduce((sum,k)=>sum+Math.min(k.length,11),0)};
  }).sort((a,b)=>b.score-a.score);
    if(!ranked[0]||ranked[0].score<5)return null;
    if(ranked.length>1&&ranked[1].score===ranked[0].score)return null;
    return ranked[0].topic;
  }
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
    $('result-area').hidden=false;$('reply-card').hidden=false;
    $('analysis-status').textContent='Redaktionelle Quellen';$('analysis-status').className='status-pill';
    $('evidence-body').innerHTML='<div class="takeaway"><strong>Was wir belegen können</strong>'+escape(topic.fact)+'</div>'+
      '<div class="evidence-references">'+sourceCards(topic)+'</div>'+
      '<div class="caveat"><span class="symbol">ⓘ</span><div><strong>Was du bei der Antwort beachten solltest</strong><div style="margin-top:4px">'+escape(topic.limit)+'</div></div></div>'+
      '<div class="quote-note">Die Quellen wurden redaktionell zusammengestellt. Bitte vor der Verwendung im Original gegenprüfen – keine Live-Quellenvalidierung.</div>'+
      '<div class="next-step-line"><span>Die Belege passen zur Frage?</span><button class="button button-primary" id="next-answer">Weiter zur Antwort ↗</button></div>';
    $('next-answer').addEventListener('click',()=>{$('reply-card').scrollIntoView({behavior:'smooth',block:'start'});setJourney(3)});
    sourceOpened=false;
    const sourceNote=$('av-source-review-note');if(sourceNote)sourceNote.textContent='Öffne eine verlinkte Originalquelle und prüfe sie, bevor du die Antwort freigibst.';
    $('reply').value=answerFor(topic,persona);
    if(active)active.reply=$('reply').value;
    $('reviewer').value='';$('review-check').checked=false;
    $('after-approval').hidden=true;
    setApprovalState();setJourney(2);
    $('evidence-card').scrollIntoView({behavior:'smooth',block:'start'});
  }
  window.AV_ANALYZE=()=>{
    const input=$('comment').value.trim();if(input.length<8){toast('Bitte eine vollständige Frage oder Aussage eingeben.');$('comment').focus();return;}
    const risk=safetyCheck(input); const topic=risk?null:match(input);
    let reason=risk || (!topic?'Noch keine eindeutige Themenzuordnung in unserer Bibliothek. Wir erfinden dafür keine Antwort.':null);
    if(topic && !topic.sources?.length)reason='Für diese Aussage fehlt uns noch eine ausreichend belegte Wissenskarte.';
    else if(topic && topic.sources.some(id=>!sourcesById.get(id)?.url))reason='Mindestens eine verlinkte Fachquelle fehlt oder ist unvollständig.';
    const status=reason?'held':'ready';
    const record={id:(crypto.randomUUID?.()||String(Date.now())),createdAt:stamp(),input,sourceLink:core.cleanURL($('source-url').value.trim()),topicId:topic?.id||null,topicName:topic?.short||null,status,reason:reason||'',persona,reply:status==='ready'?(answerFor(topic,persona)):'',approvedReply:null,reviewer:null};
    active=record;records.unshift(record);if(records.length>300)records=records.slice(0,300);persist();
    if(reason)showHold(reason);else showReady(topic);
    toast(reason?'Noch kein sicher belegter Entwurf – wir halten an.':'Antwortvorlage mit Quellen gefunden. Bitte prüfen.');
    return status;
  };
  function setPersona(next){if(!personas[next])return;persona=next;
    document.querySelectorAll('[data-persona]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.persona===next)));
    if(active?.topicId&&['ready','approved'].includes(active.status)){
      const t=casesById.get(active.topicId); if(!t)return;
      active.persona=next;active.reply=answerFor(t,next);active.approvedReply=null;active.status='ready';active.reviewer=null;
      $('reply').value=active.reply;$('reviewer').value='';$('review-check').checked=false;persist();setApprovalState();
      toast('Stimme geändert. Bitte Antwort erneut prüfen.');
    }
  }
  document.querySelectorAll('[data-persona]').forEach(b=>b.addEventListener('click',()=>setPersona(b.dataset.persona)));
  function setApprovalState(){
    const canApprove=active?.status==='ready'&&sourceOpened&&$('review-check').checked&&$('reviewer').value.trim().length>=2&&$('reply').value.trim().length>=10;
    $('approve').disabled=!canApprove;
    $('copy').disabled=!(active?.status==='approved'&&active.approvedReply===$('reply').value);
    $('approval-status').textContent=active?.status==='approved'?'✓ Freigegeben für die manuelle Verwendung. Noch nicht veröffentlicht.':'Noch nicht freigegeben. Nichts wird automatisch veröffentlicht.';
    $('after-approval').hidden=active?.status!=='approved';
    if(active?.status==='approved'){
      const link=core.cleanURL($('source-url').value.trim());
      $('back-to-post').href=core.isInstagramURL(link)?link:'https://www.instagram.com/';
      $('mark-posted').disabled=!!active.selfReportedPosted;
      $('mark-posted').textContent=active.selfReportedPosted?'Selbstauskunft gespeichert ✓':'Ich habe selbst geantwortet ✓';
    }
  }
  $('review-check').closest('label').insertAdjacentHTML('afterend','<p class="approval-note" id="av-source-review-note">Öffne eine Originalquelle und überprüfe sie persönlich, bevor du freigibst.</p>');
  $('evidence-body').addEventListener('click',event=>{
    const link=event.target.closest('a[href^="https://"]');
    if(link && active?.status==='ready'){
      sourceOpened=true;active.sourceOpenedAt=stamp();persist();setApprovalState();
      $('av-source-review-note').textContent='Originalquelle geöffnet ✓ Bitte Belegstelle und Einschränkungen im Original kontrollieren.';
    }
  });
  $('review-check').addEventListener('change',setApprovalState);
  $('reviewer').addEventListener('input',setApprovalState);
  $('reply').addEventListener('input',()=>{
    if(!active||!active.topicId)return;
    active.reply=$('reply').value;
    if(active.status==='approved') {active.status='ready';active.approvedReply=null;active.reviewer=null;}
    $('review-check').checked=false;persist();setApprovalState();
  });
  $('approve').addEventListener('click',()=>{
    if(!active||active.status!=='ready'||!sourceOpened||!$('review-check').checked||$('reviewer').value.trim().length<2||$('reply').value.trim().length<10)return;
    active.status='approved';active.reply=$('reply').value;active.approvedReply=active.reply;active.reviewer=$('reviewer').value.trim();active.approvedAt=stamp();active.selfReportedPosted=false;persist();setApprovalState();setJourney(3);toast('Antwort freigegeben. Jetzt mit Quellen kopieren.');
  });
  async function copyToClipboard(text){try{await navigator.clipboard.writeText(text);toast('In die Zwischenablage kopiert. ♡');return true;}catch{toast('Kopieren nicht verfügbar. Text bitte manuell markieren.');return false;}}
  $('copy').addEventListener('click',()=>{
    if(!active||active.status!=='approved'||active.approvedReply!==$('reply').value)return;
    const topic=casesById.get(active.topicId);if(!topic)return;
    const links=topic.sources.map(id=>sourcesById.get(id)).filter(Boolean).map(s=>s.name+' ('+s.year+'): '+s.url);
    copyToClipboard(active.reply+'\n\nQuellen:\n'+links.join('\n'));
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
    const labels={approved:'Manuell freigegeben',held:'Zurückgestellt',ready:'Zur Prüfung offen','saved-idea':'Content-Idee gemerkt',ignored:'Bewusst ignoriert','report-guidance':'Meldeanleitung geöffnet',reported:'Selbst gemeldet'};
    $('records').innerHTML=records.length?records.slice(0,20).map(r=>'<div class="record"><strong>'+escape((r.input||'Keine personenbezogenen Details gespeichert').slice(0,115))+'</strong><small>'+escape(labels[r.status]||'Lokale Entscheidung')+' · '+escape(r.topicName||'Ohne Themenzuordnung')+' · '+escape(r.createdAt.slice(0,10))+'</small></div>').join(''):'Noch keine Fälle. Probiere den Dialog aus.';
  }
  renderImpact();
  window.AV_TOPIC_MATCH=(text)=>{if(safetyCheck(text))return null;return match(text);};
  window.AV_RESET_ACTIVE=()=>{sourceOpened=false;active=null;$('result-area').hidden=true;$('after-approval').hidden=true;};
  window.AV_SET_LENGTH=(mode)=>{
    if(!['short','full'].includes(mode))return;replyLength=mode;
    if(!active?.topicId||!['ready','approved'].includes(active.status))return;
    const t=casesById.get(active.topicId);if(!t)return;
    const proposed=answerFor(t,persona);
    active.reply=proposed;active.approvedReply=null;active.status='ready';active.reviewer=null;active.approvedAt=null;active.selfReportedPosted=false;
    $('reply').value=proposed;$('reviewer').value='';$('review-check').checked=false;persist();setApprovalState();toast('Entwurf angepasst. Bitte Quellen und Text erneut prüfen.');
  };
  window.AV_MARK_SELF_REPORTED_POST=()=>{
    if(!active||active.status!=='approved'||active.approvedReply!==$('reply').value)return false;
    active.selfReportedPosted=true;active.selfReportedAt=stamp();persist();return true;
  };
  window.AV_LOG_DECISION=(status,summary,source)=>{
    if(!['report-guidance','reported','ignored','saved-idea'].includes(status))return false;
    if(status==='reported'){
      const recent=records.find(r=>r.status==='report-guidance'&&r.sourceLink===core.cleanURL(source));
      if(recent){recent.status='reported';recent.selfReportedAt=stamp();persist();return true;}
    }
    records.unshift({id:crypto.randomUUID?.()||String(Date.now()),createdAt:stamp(),input:status==='ignored'?'':String(summary||'').slice(0,170),sourceLink:status==='ignored'?'':core.cleanURL(source),status,topicId:null,topicName:'',persona:null,reason:'Manuell gewählte Handlung. Keine Social-Media-Aktion durch Animal Voices.',reply:'',approvedReply:null});
    if(records.length>300)records=records.slice(0,300);persist();return true;
  };
  $('export').addEventListener('click',()=>{const payload=JSON.stringify({version:'0.8',exportedAt:stamp(),note:'Nur lokale Entwürfe und Freigaben. Keine Veröffentlichung oder Wirkung nachgewiesen.',records},null,2);const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='animal-voices-local-audit.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Lokales Audit exportiert.');});
  $('clear').addEventListener('click',()=>{if(!confirm('Alle lokal gespeicherten Fälle dauerhaft löschen?'))return;records=[];active=null;persist();$('result-area').hidden=true;$('triage-panel').hidden=true;setJourney(1);toast('Lokale Fälle gelöscht.');});
})();

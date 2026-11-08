/* Animal Voices OS v0.6 — human-first editorial app. No social-media automation. */
(() => {
  "use strict";
  const data = window.AV_DATA;
  if (!data?.cases?.length || !data?.sources?.length) { document.body.textContent = "Wissensdaten konnten nicht geladen werden."; return; }
  const $ = (id) => document.getElementById(id);
  const sourceById = new Map(data.sources.map(s => [s.id,s]));
  const topicById = new Map(data.cases.map(t => [t.id,t]));
  const storeKey = "animal-voices-workspace-v06";
  const pages = {overview:"Overview",dialog:"Dialogue studio",library:"Evidence library",content:"Content studio",impact:"Impact & learning"};
  const icons = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    message:'<path d="M21 11.5a8.4 8.4 0 0 1-8.6 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.1A8.5 8.5 0 1 1 21 11.5z"/><path d="M8 11h8M8 15h5"/>',
    book:'<path d="M12 7C8 5 6 5 3 6v14c3-1 5-1 9 1 4-2 6-2 9-1V6c-3-1-5-1-9 1v14M12 7v14"/>',
    sparkles:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17zM4 16l.6 1.4L6 18l-1.4.6L4 20l-.6-1.4L2 18l1.4-.6L4 16z"/>',
    chart:'<path d="M3 3v18h18M7 16l4-5 3 2 5-7"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    copy:'<rect width="13" height="13" x="8" y="8" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    shield:'<path d="m12 2 8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6zM9 12l2 2 4-4"/>'
  };
  const svg = (name) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[name]||icons.arrow)+'</svg>';
  document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML=svg(el.dataset.icon));
  const escapeHTML = (value) => String(value??"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeURL = url => /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(url || "") ? url : "#";
  const isoNow = () => new Date().toISOString();
  const stamp = iso => new Date(iso).toLocaleDateString("de-DE", {day:"2-digit",month:"short",year:"numeric"});
  const load = () => {try {const obj=JSON.parse(localStorage.getItem(storeKey) || "[]");return Array.isArray(obj)?obj.filter(x=>x&&typeof x.id==="string").slice(0,250):[]}catch{return []}};
  const records=load();
  const save = () => {try {localStorage.setItem(storeKey,JSON.stringify(records.slice(0,250)))}catch{toast("Lokaler Speicher nicht verfügbar.");}refreshMetrics()};
  let selectedPersona = "momo";
  let active=null;
  let selectedFilter="Alle";
  let toastTimer;
  function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3500)}
  function navigate(page){
    if(!pages[page])page="overview";
    document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id==="view-"+page));
    document.querySelectorAll("[data-route]").forEach(el=>el.setAttribute("aria-current",el.dataset.route===page?"page":"false"));
    $("crumb-name").textContent=pages[page];
    history.replaceState(null,"","#"+page);
    window.scrollTo({top:0,behavior:"instant"});
    if(page==="impact")refreshMetrics();
  }
  document.querySelectorAll("[data-route],[data-go]").forEach(el=>el.addEventListener("click",ev=>{ev.preventDefault();navigate(el.dataset.route||el.dataset.go)}));
  document.querySelectorAll("[data-persona-go]").forEach(el=>el.addEventListener("click",()=>{setPersona(el.dataset.personaGo);navigate("dialog")}));
  window.addEventListener("hashchange",()=>navigate(location.hash.slice(1)));
  navigate(location.hash.slice(1)||"overview");
  const cats=["Alle",...new Set(data.cases.map(t=>t.category))];
  $("overview-claims").textContent=String(data.cases.length);
  $("overview-sources").textContent=String(data.sources.length);
  function refreshMetrics(){
    const approved=records.filter(x=>x.status==="approved").length;
    $("overview-approved").textContent=approved;
    $("impact-cases").textContent=records.length;
    $("impact-approved").textContent=approved;
    const root=$("records");
    if(records.length===0){root.className="empty";root.innerHTML='<div class="emoji">🪴</div><h3>No cases yet.</h3><p>Prüfe einen Kommentar, um die erste nachvollziehbare Entscheidung zu dokumentieren.</p>';return;}
    root.className="";
    root.innerHTML=records.slice(0,20).map(x=>{
      const badge=x.status==="approved"?"Freigegeben":x.status==="ready"?"Prüfung offen":"Zurückgestellt";
      return '<div class="record"><div><strong>'+escapeHTML(x.input.slice(0,140))+'</strong><p>'+escapeHTML(badge)+" · "+escapeHTML(x.topic||"Unbekannt")+' · '+escapeHTML(x.persona)+'</p></div><time>'+escapeHTML(stamp(x.createdAt))+"</time></div>";
    }).join("");
  }
  refreshMetrics();
  $("clear").addEventListener("click",()=>{
    if(!confirm("Alle lokal protokollierten Fälle auf diesem Gerät löschen?"))return;
    records.splice(0);save();active=null;resetAnalysis();toast("Lokale Fälle gelöscht.");
  });
  $("export").addEventListener("click",()=>{
    const payload=JSON.stringify({version:"0.6",exportedAt:isoNow(),note:"Lokale Redaktion; kein Beweis für öffentliche Posts oder Wirkung.",records},null,2);
    const blob=new Blob([payload],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="animal-voices-audit.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast("Audit-Datei exportiert.");
  });

  // Accessible card interactions; preserve cards that only navigate.
  $("overview-topic-cards").innerHTML=[data.cases[0],data.cases[4],data.cases[8]].map(t=>
    '<button class="feature card" data-open-topic="'+escapeHTML(t.id)+'" style="text-align:left"><span class="go">'+svg("arrow")+'</span><span class="eyebrow">'+escapeHTML(t.category)+'</span><h3 style="margin-top:22px">'+escapeHTML(t.short)+'</h3><p>'+escapeHTML(t.title)+'</p></button>'
  ).join("");
  document.querySelectorAll("[data-open-topic]").forEach(el=>el.addEventListener("click",()=>{
    navigate("library");openTopic(el.dataset.openTopic);
  }));

  // Dialogue workflow: fail closed on missing evidence, disputed context and sensitive medical cases.
  $("sample-chips").innerHTML=data.examples.slice(0,5).map((s,i)=>'<button class="chip" data-sample="'+i+'" type="button">'+escapeHTML(s.text.length>45?s.text.slice(0,44)+"…":s.text)+'</button>').join("");
  document.querySelectorAll("[data-sample]").forEach(el=>el.addEventListener("click",()=>{
    const s=data.examples[Number(el.dataset.sample)];$("comment").value=s.text;
    $("manual-topic").value="";document.querySelectorAll("[data-sample]").forEach(ch=>ch.classList.remove("active"));el.classList.add("active");
  }));
  $("manual-topic").innerHTML+='<optgroup label="Redaktionelle Themen">'+data.cases.map(t=>'<option value="'+escapeHTML(t.id)+'">'+escapeHTML(t.short)+'</option>').join("")+'</optgroup>';
  function setPersona(persona){
    selectedPersona=["momo","kiki","bao"].includes(persona)?persona:"momo";
    document.querySelectorAll("[data-persona]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.persona===selectedPersona)));
    if(active?.status==="ready"||active?.status==="approved"){
      const topic=topicById.get(active.topicId);
      if(topic){
        active.persona=selectedPersona;active.reply=topic.voices[selectedPersona];active.status="ready";active.approvedReply=null;
        $("reply").value=active.reply;$("review-check").checked=false;setApproval();save();toast("Stimme gewechselt – Freigabe zurückgesetzt.");
      }
    }
  }
  document.querySelectorAll("[data-persona]").forEach(b=>b.addEventListener("click",()=>setPersona(b.dataset.persona)));
  setPersona("momo");
  function contextRisk(text){
    const n=text.toLocaleLowerCase("de");
    if(/ignore (all|previous) instructions|ignoriere.*anweisung|system prompt|developer message|delete your data|poste hundert/.test(n))return {code:"injection",message:"Dieser Kommentar enthält eine Aufforderung an das System. Er wird als unvertrauenswürdiger Text behandelt."};
    if(/\b(baby|babys|säugling|kleinkind|schwanger|schwangerschaft|stillen|pregnan|medikament|essstörung)\b/.test(n))return {code:"sensitive",message:"Gesundheitlich sensible Frage. Bitte individuelle Fachberatung einbeziehen; kein automatischer Faktenkommentar."};
    if(/jemand (sagt|behauptet)|leute sagen|mein freund sagt|someone says|people say|people claim|ich zitiere|ich widerspreche|ironie|sarkasmus/.test(n))return {code:"quoted",message:"Aussage könnte zitiert oder kritisiert werden. Erst den tatsächlichen Kontext klären."};
    return null;
  }
  function matchTopic(text){
    const n=text.toLocaleLowerCase("de");
    const ranked=data.cases.map(t=>({topic:t,score:t.keywords.reduce((sum,k)=>sum+(k.length>3&&n.includes(k.toLowerCase())?Math.min(k.length,11):0),0)})).sort((a,b)=>b.score-a.score);
    if(!ranked[0]||ranked[0].score<4)return null;
    if(ranked[1]&&ranked[1].score===ranked[0].score)return null;
    return ranked[0].topic;
  }
  const evidenceHtml=(topic)=>{
    const refs=topic.sources.map(id=>sourceById.get(id)).filter(Boolean);
    if(!refs.length)return '<div class="warning">Zu diesem Thema ist derzeit keine ausreichende Quelle hinterlegt. Keine wissenschaftliche Gewissheit behaupten.</div>';
    return refs.map(s=>
      '<div class="source-row"><b>'+escapeHTML(s.name)+" · "+escapeHTML(s.year)+'</b><span class="eyebrow">'+escapeHTML(s.kind)+'</span><p>'+escapeHTML(s.note)+'</p><div class="cite">Quellenauszug (am Original prüfen): „'+escapeHTML(s.quote)+'“</div><a href="'+safeURL(s.url)+'" target="_blank" rel="noopener noreferrer">Originalquelle öffnen '+svg("arrow")+"</a></div>"
    ).join("");
  };
  function setSteps(n,hold=false){
    document.querySelectorAll("#analysis-steps .step").forEach((el,i)=>{el.className="step"+(i<n?" pass":(hold&&i===n?" hold":""))});
  }
  function resetAnalysis(){
    $("analysis-pill").className="pill neutral";$("analysis-pill").textContent="Awaiting input";
    setSteps(0);$("analysis-result").className="output";$("analysis-result").innerHTML='<div><div class="output-icon">💬</div><h4>A good conversation starts here.</h4><p>Gib links einen Kommentar ein. Wir prüfen den Kontext und halten bei Unsicherheit an.</p></div>';
    $("response-section").hidden=true;$("review-check").checked=false;$("reply").value="";$("copy").disabled=true;$("approve").disabled=true;
  }
  function renderReview(record,topic){
    $("analysis-pill").className="pill pale";$("analysis-pill").textContent="Ready for review";
    setSteps(5);$("analysis-result").className="output has-result";
    $("analysis-result").innerHTML=
      '<span class="eyebrow">REDAKTIONELLE EINORDNUNG</span><h3 class="resulttitle">'+escapeHTML(topic.short)+'</h3>'+
      '<p class="risk">Themenzuordnung ist nur ein Hinweis. Prüfe, ob dieser Faktencheck den Originalkommentar fair wiedergibt.</p>'+
      '<div class="output-quote">'+escapeHTML(topic.fact)+'</div>'+
      '<div class="warning"><b>Wichtige Grenze:</b> '+escapeHTML(topic.limit)+'</div>'+
      '<div class="source-list"><span class="eyebrow">WISSENSQUELLEN · KEINE LIVE-VERIFIKATION</span>'+evidenceHtml(topic)+'</div>';
    $("response-section").hidden=false;$("reply").value=record.reply;$("review-check").checked=false;
    $("reviewer").value="";setApproval();
  }
  function renderHold(reason){
    $("analysis-pill").className="pill amber";$("analysis-pill").textContent="Needs human research";
    setSteps(1,true);$("analysis-result").className="output has-result";
    $("analysis-result").innerHTML='<span class="eyebrow">SICHERHEIT VOR SCHNELLIGKEIT</span><h3 class="resulttitle">Hier antworten wir nicht automatisch.</h3><div class="warning">'+escapeHTML(reason)+'</div><p class="risk">Wir behaupten nichts ohne Quellen und Kontext. Du kannst den Fall später in Ruhe weiter recherchieren.</p>';
    $("response-section").hidden=true;$("copy").disabled=true;$("approve").disabled=true;
  }
  function setApproval(){
    const ready=active?.status==="ready";
    const eligible=ready && $("review-check").checked && $("reviewer").value.trim().length>=2 && $("reply").value.trim().length>=10;
    $("approve").disabled=!eligible;
    $("copy").disabled=!(active?.status==="approved"&&active.approvedReply===$("reply").value);
    const text=active?.status==="approved"?"Freigegeben für manuelles Kopieren. Nicht veröffentlicht.":ready?"Freigabe erforderlich. Keine Veröffentlichung ohne Quellenprüfung.":"Kein freigabefähiger Entwurf.";
    $("approval-status").textContent=text;
  }
  $("analyze").addEventListener("click",()=>{
    const input=$("comment").value.trim();
    if(input.length<8){toast("Bitte eine Frage oder Aussage mit mindestens acht Zeichen eingeben.");$("comment").focus();return;}
    const risk=contextRisk(input);
    let topic=null, reason="",status="hold";
    const manual=$("manual-topic").value;
    if(risk)reason=risk.message;
    else{
      topic=manual?topicById.get(manual):matchTopic(input);
      if(!topic)reason="Das Thema lässt sich nicht zuverlässig zuordnen. Bitte den Kommentar im Kontext recherchieren; keine Quellen erfinden.";
      else if(!topic.sources.length)reason="Die Faktenfrage hat noch keine ausreichende verlinkte Evidenz. Bitte zuerst Quellen ergänzen.";
      else if(topic.sources.some(id=>!sourceById.get(id)?.url))reason="Mindestens eine erforderliche Quelle fehlt im Register.";
      else status="ready";
    }
    const record={id:crypto.randomUUID?.()||String(Date.now())+Math.random().toString(36).slice(2),createdAt:isoNow(),input:input.slice(0,1600),topic:topic?.short||null,topicId:topic?.id||null,persona:selectedPersona,origin:$("origin").value,status:status,reason:reason||"Kuratiertes Thema. Quellen manuell prüfen.",reply:status==="ready"?topic.voices[selectedPersona]:"",approvedReply:null,approvedAt:null};
    records.unshift(record);if(records.length>250)records.length=250;active=record;save();
    if(status==="ready")renderReview(record,topic);else renderHold(reason);
    toast(status==="ready"?"Passende Belege gefunden. Bitte persönlich prüfen.":"Zurückgestellt – keine unbelegte Antwort.");
  });
  $("review-check").addEventListener("change",setApproval);$("reviewer").addEventListener("input",setApproval);
  $("reply").addEventListener("input",()=>{
    if(!active)return;active.reply=$("reply").value;
    if(active.status==="approved"){active.status="ready";active.approvedReply=null;active.approvedAt=null;toast("Bearbeitung erkannt – Freigabe zurückgesetzt.");}
    $("review-check").checked=false;save();setApproval();
  });
  $("approve").addEventListener("click",()=>{
    if(!active||active.status!=="ready"||!$("review-check").checked||$("reviewer").value.trim().length<2)return;
    if($("reply").value.trim().length<10)return;
    active.reply=$("reply").value;active.approvedReply=active.reply;active.status="approved";active.reviewer=$("reviewer").value.trim();active.approvedAt=isoNow();save();setApproval();
    toast("Freigabe dokumentiert. Nichts wurde veröffentlicht.");
  });
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);toast("In die Zwischenablage kopiert.");return true}
    catch{toast("Kopieren nicht möglich. Bitte im Browser manuell markieren.");return false}
  }
  $("copy").addEventListener("click",()=>{
    if(!active||active.status!=="approved"||active.approvedReply!==$("reply").value)return;
    const topic=topicById.get(active.topicId);if(!topic)return;
    const links=topic.sources.map(id=>sourceById.get(id)).filter(Boolean).map(s=>s.name+" ("+s.year+"): "+s.url);
    copyText(active.reply+"\n\nQuellen:\n"+links.join("\n"));
  });

  // Evidence library
  $("filters").innerHTML=cats.map(cat=>'<button class="filter'+(cat==="Alle"?" active":"")+'" data-cat="'+escapeHTML(cat)+'">'+escapeHTML(cat)+'</button>').join("");
  $("filters").addEventListener("click",ev=>{
    const btn=ev.target.closest("[data-cat]");if(!btn)return;
    selectedFilter=btn.dataset.cat;
    document.querySelectorAll("[data-cat]").forEach(b=>b.classList.toggle("active",b.dataset.cat===selectedFilter));
    paintTopics();
  });
  $("search").addEventListener("input",paintTopics);
  function paintTopics(){
    const term=$("search").value.trim().toLowerCase();
    const topics=data.cases.filter(t=>(selectedFilter==="Alle"||t.category===selectedFilter)&&[t.title,t.short,t.fact,...t.keywords].join(" ").toLowerCase().includes(term));
    $("topic-grid").innerHTML=topics.length?topics.map(t=>
      '<button class="topic" type="button" data-topic="'+escapeHTML(t.id)+'"><span class="cat">'+escapeHTML(t.category)+'</span><h3>'+escapeHTML(t.short)+'</h3><div class="foot"><span>'+t.sources.length+" "+(t.sources.length===1?"Quelle":"Quellen")+'</span>'+svg("arrow")+"</div></button>"
    ).join(""):'<div class="empty" style="grid-column:1/-1">Keine passenden Themen. Wir ergänzen das Register fortlaufend.</div>';
  }
  $("topic-grid").addEventListener("click",ev=>{const btn=ev.target.closest("[data-topic]");if(btn)openTopic(btn.dataset.topic)});
  function openTopic(id){
    const t=topicById.get(id);if(!t)return;
    $("evidence-detail").hidden=false;
    $("evidence-detail").innerHTML='<div class="btnrow"><span class="pill pale">'+escapeHTML(t.category)+'</span><button class="btn mini ghost" id="send-to-dialog">Im Dialog nutzen '+svg("arrow")+'</button></div><h3 style="margin-top:18px">'+escapeHTML(t.title)+'</h3><p class="bigfact">'+escapeHTML(t.fact)+'</p><div class="warning"><strong>Wichtige Einschränkung:</strong> '+escapeHTML(t.limit)+'</div><span class="eyebrow">PRIMÄR-/FACHQUELLEN & ORIGINAL-LINKS</span><div class="source-list">'+evidenceHtml(t)+'</div><p class="risk">Die Einordnung ist redaktionell zusammengestellt, nicht extern fachlich begutachtet oder live auf Aktualität geprüft.</p>';
    $("send-to-dialog").addEventListener("click",()=>{$("manual-topic").value=t.id;$("comment").value=t.title;navigate("dialog")});
    $("evidence-detail").scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  paintTopics();

  // Content: deterministic scripts remain tied to the same editorial evidence and limitations.
  $("content-topic").innerHTML=data.cases.map(t=>'<option value="'+escapeHTML(t.id)+'">'+escapeHTML(t.short)+'</option>').join("");
  let latestScript="";
  const personaNames={momo:"Momo 🐮",kiki:"Kiki 🐥",bao:"Bao 🐷"};
  $("generate").addEventListener("click",()=>{
    const t=topicById.get($("content-topic").value),persona=$("content-persona").value,format=$("content-format").value,hook=$("content-hook").value;
    if(!t)return;
    const attribution=t.sources.map(id=>sourceById.get(id)).filter(Boolean).map(s=>s.name+" ("+s.year+"): "+s.url).join("\n");
    const face=personaNames[persona];
    const fun=persona==="bao"?"Bao versucht erst, das Problem mit Kochen zu lösen – und entdeckt dann die Fakten.":persona==="kiki"?"Kiki stellt eine kleine Frage, die viel grösser wird.":"Momo öffnet ihr Notizbuch: Fakten zuerst, Urteil später.";
    const openers={humor:"Ein überraschender Alltagsmoment: "+fun,fact:"Eine Behauptung macht die Runde: „"+t.title.replace(/[„“]/g,"")+"“",heart:"Was würde sich ändern, wenn wir das Leben hinter unserer Mahlzeit sehen könnten?"};
    const note="REDAKTIONELLER QUELLEN-CHECK\n"+(attribution||"Noch keine Fachquelle hinterlegt; keine wissenschaftlichen Behauptungen veröffentlichen.")+"\n\nGrenzen der Aussage: "+t.limit;
    if(format==="reel")latestScript="REEL · 30 Sekunden · "+face+"\n\n00–04s · HOOK\n"+openers[hook]+"\n\n05–15s · DER FAKTENKERN\n"+t.fact+"\n\n16–25s · HUMAN MOMENT\n"+t.voices[persona]+"\n\n26–30s · EINLADUNG\n„Was denkst du? Welche Frage sollten wir als Nächstes gemeinsam prüfen?“\n\nCaption: Für Tiere. Mit Menschen. ❤️\n\n"+note;
    else if(format==="carousel")latestScript="CAROUSEL · 5 Slides · "+face+"\n\nSLIDE 1 · Neugier wecken\n"+openers[hook]+"\n\nSLIDE 2 · Die echte Frage\n"+t.title+"\n\nSLIDE 3 · Das sagt die Evidenz\n"+t.fact+"\n\nSLIDE 4 · Was wir nicht wissen\n"+t.limit+"\n\nSLIDE 5 · Öffne ein Gespräch\n"+t.voices[persona]+"\n\nCaption: Für Tiere. Mit Menschen. 🌱\n\n"+note;
    else latestScript="INSTAGRAM STORY · 3 Frames · "+face+"\n\nFRAME 1 · QUESTION\n"+openers[hook]+"\n[Umfrage: „Was glaubst du?“]\n\nFRAME 2 · FACT\n"+t.fact+"\n\nFRAME 3 · HEART\n"+t.voices[persona]+"\n[Fragen-Sticker: „Was möchtest du wissen?“]\n\n"+note;
    $("script").textContent=latestScript;$("copy-script").disabled=false;
    $("content-status").textContent="Draft · human review";
    $("content-status").className="pill amber";
    toast("Originaler Content-Entwurf erstellt – Quellen bitte prüfen.");
  });
  $("copy-script").addEventListener("click",()=>{if(latestScript)copyText(latestScript)});
})();

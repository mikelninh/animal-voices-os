/* Animal Voices Field Test v0.1: transparent, local-only, no AI, no invented participants. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='avos-field-v01-votes',PREF='avos-field-v01-perspective';
const LABELS={connect:'Verbindung',clarify:'Verstehen',explore:'Neugier',act:'Möglichkeit'};
let cases=[],current=null,order=null,votes={};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))votes=saved;}catch{}
function validUrl(raw){try{const u=new URL(raw);return u.protocol==='https:'?u.href:null}catch{return null}}
function words(s){return String(s||'').trim().split(/\s+/).filter(Boolean).length}
function scrub(text){
 return String(text||'').slice(0,250)
  .replace(/https?:\/\/\S+/g,'[Link entfernt]')
  .replace(/@[\w.]+/g,'[Handle entfernt]')
  .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[E-Mail entfernt]')
  .replace(/\+?\d[\d\s()-]{7,}\d/g,'[Nummer entfernt]').trim();
}
function stored(){try{localStorage.setItem(KEY,JSON.stringify(votes));return true}catch{return false}}
function progress(){$('field-progress').textContent=cases.filter(c=>votes[c.id]).length+' / '+cases.length}
function mapping(c){
 const existing=votes[c.id];
 if(existing?.a_goal===c.a.goal&&existing?.b_goal===c.b.goal)return {a:c.a,b:c.b};
 if(existing?.a_goal===c.b.goal&&existing?.b_goal===c.a.goal)return {a:c.b,b:c.a};
 return Math.random()<.5?{a:c.a,b:c.b}:{a:c.b,b:c.a};
}
function audit(c){
 const box=$('field-audit');box.replaceChildren();
 const label=document.createElement('p');label.className='micro';
 label.textContent='Aus: '+c.context+'. Die Frage ist eine anonymisierte redaktionelle Paraphrase, kein Originalzitat. Veröffentlichungsdatum: '+c.source_date+'.';
 box.append(label);
 const sources=[{name:'Öffentliche Ausgangsdiskussion',url:c.source_url},...(c.fact_urls||[]).map((url,i)=>({name:'Fachliche Quelle '+(i+1),url}))];
 for(const source of sources){const url=validUrl(source.url);if(!url)continue;
  const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=source.name+' ↗';box.append(a)}
 const warning=document.createElement('p');warning.className='micro';
 warning.textContent='Redaktionelle Prüfung: '+c.review_note+' Die Originalquellen wurden nicht durch eine unabhängige Fachperson freigegeben.';
 box.append(warning);
}
function reveal(){
 $('field-reveal').hidden=false;
 const vote=votes[current.id];
 $('field-reveal-text').textContent='A: '+LABELS[order.a.goal]+' · B: '+LABELS[order.b.goal]+
  (vote?.choice==='neither'?' · Du hast beide abgelehnt.':vote?.choice?' · Deine Auswahl: '+LABELS[vote.winner]:'');
}
function render(){
 current=cases.find(c=>c.id===$('field-case').value);if(!current)return;
 order=mapping(current);
 $('field-question').textContent=current.comment;
 for(const side of ['a','b']){
  $('field-answer-'+side).textContent=order[side].text;
  $('field-words-'+side).textContent=words(order[side].text)+' Wörter';
 }
 const prev=votes[current.id];
 $('field-reveal').hidden=!prev;
 $('field-basis').open=false;
 $('field-reason').value=prev?.reason||'unspecified';
 $('field-critical').checked=!!prev?.critical;
 $('field-note').value=prev?.note||'';
 $('field-status').textContent=prev?'Bereits bewertet. Du kannst die Wahl ändern oder weitergehen.':'';
 for(const side of ['a','b'])$('field-vote-'+side).setAttribute('aria-pressed',String(prev?.choice===side));
 $('field-vote-neither').setAttribute('aria-pressed',String(prev?.choice==='neither'));
 if(prev)reveal();
 audit(current);progress();
}
function vote(choice){
 if(!current||!order||!['a','b','neither'].includes(choice))return;
 const reason=$('field-reason').value,critical=!!$('field-critical').checked,note=scrub($('field-note').value);
 const winner=choice==='neither'?'neither':order[choice].goal;
 votes[current.id]={
  id:current.id,topic:current.topicId,choice,winner,a_goal:order.a.goal,b_goal:order.b.goal,
  reason,critical,note,perspective:$('field-perspective').value,
  voted_at:new Date().toISOString(),method:'human_blind_eligible_but_not_verified',
  paraphrased_public_case:true,independent_facts_reviewed:false
 };
 const saved=stored();render();
 $('field-status').textContent=saved?'Deine Wahl wurde lokal gespeichert.':'Die Wahl konnte nicht lokal gespeichert werden. Bitte exportiere sie.';
}
function update(){
 if(!current||!votes[current.id])return;
 Object.assign(votes[current.id],{
  reason:$('field-reason').value,critical:!!$('field-critical').checked,
  note:scrub($('field-note').value),perspective:$('field-perspective').value
 });
 stored();$('field-status').textContent='Zusatzfeedback lokal aktualisiert.';
}
function next(){
 if(!cases.length||!current)return;
 const i=cases.findIndex(c=>c.id===current.id);
 const rest=cases.slice(i+1).concat(cases.slice(0,i+1));
 const nextCase=rest.find(c=>!votes[c.id])||cases[(i+1)%cases.length];
 $('field-case').value=nextCase.id;render();
 $('field-question').scrollIntoView({block:'nearest',behavior:'smooth'});
}
function reset(){
 if(!Object.keys(votes).length)return;
 if(!confirm('Alle bisherigen Bewertungen in diesem Browser wirklich löschen?'))return;
 votes={};stored();render();
 $('field-status').textContent='Lokale Bewertungen zurückgesetzt.';
}
function exportVotes(){
 const records=cases.filter(c=>votes[c.id]).map(c=>votes[c.id]);
 if(!records.length){$('field-status').textContent='Bitte zuerst mindestens einen Fall bewerten.';return}
 const pack={
  schema:'avos-field-ratings-v0.1',dataset:'field-v0.1',sample_size:10,
  note:'Client-side self-reported blind preferences; no authentication, no behavioural/animal-welfare outcomes; researcher must verify all responses.',
  exported_at:new Date().toISOString(),records
 };
 const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='animal-voices-first-contact-bewertungen.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
 $('field-status').textContent='Export erstellt. Teile die JSON-Datei nur freiwillig mit dem Forschungsteam.';
}
async function invite(){
 const message='Ich teste gerade Animal Voices – wie können wir über Tiere reden, ohne Menschen zu belehren? Würdest du 10 kurze, anonymisierte Fragen ansehen und jeweils zwischen zwei Antworten wählen (oder beide ablehnen)? Keine Anmeldung, keine automatische Datensammlung. Wenn du möchtest, schick mir anschließend die exportierte JSON-Datei. ♡\\nhttps://animal-voices-os.vercel.app/field-test.html';
 try{
  if(!navigator.clipboard?.writeText)throw Error('clipboard');
  await navigator.clipboard.writeText(message);
  $('field-status').textContent='Einladung kopiert. Du entscheidest selbst, wem du sie sendest.';
 }catch{$('field-status').textContent='Kopieren nicht möglich. Teile den Link https://animal-voices-os.vercel.app/field-test.html direkt.';}
}
async function init(){
 const controls=['field-vote-a','field-vote-b','field-vote-neither','field-next','field-export','field-reset'];
 for(const id of controls)$(id).disabled=true;
 $('field-status').textContent='Öffentliche Gesprächsanlässe werden geladen …';
 try{
  const response=await fetch('/field-cases.json?v=0.1',{cache:'no-store'});
  if(!response.ok)throw Error('missing cases');
  const data=await response.json();
  if(data.sample_size!==10||!Array.isArray(data.cases)||data.cases.length!==10||new Set(data.cases.map(c=>c.id)).size!==10)throw Error('invalid cases');
  cases=data.cases;const select=$('field-case');
  for(const c of cases){const opt=document.createElement('option');opt.value=c.id;opt.textContent=c.id+' · '+c.topicId+' · '+c.angle;select.append(opt)}
  select.value=cases[0].id;
  try{const p=localStorage.getItem(PREF);if(['unspecified','vegan','nonvegan','mostlyplant'].includes(p))$('field-perspective').value=p;}catch{}
  $('field-case').addEventListener('change',render);
  $('field-vote-a').addEventListener('click',()=>vote('a'));
  $('field-vote-b').addEventListener('click',()=>vote('b'));
  $('field-vote-neither').addEventListener('click',()=>vote('neither'));
  $('field-reason').addEventListener('change',update);
  $('field-critical').addEventListener('change',update);
  $('field-note').addEventListener('change',update);
  $('field-perspective').addEventListener('change',()=>{
   try{localStorage.setItem(PREF,$('field-perspective').value)}catch{}
   update();
  });
  $('field-next').addEventListener('click',next);
  $('field-export').addEventListener('click',exportVotes);
  $('field-invite').addEventListener('click',invite);
  $('field-reset').addEventListener('click',reset);
  for(const id of controls)$(id).disabled=false;
  render();
 }catch{$('field-status').textContent='Testfälle konnten nicht geladen werden. Bitte die Seite neu laden.'}
}
init();
})();
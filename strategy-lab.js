/* Animal Voices v1.3 blind strategy comparison: client-only test, no invented respondents. */
(()=>{'use strict';
const S=window.AV_STRATEGIES,D=window.AV_DATA,$=id=>document.getElementById(id);
const KEY='avos-v13-strategy-votes',PAIRS=[
 ['connect','clarify'],['connect','explore'],['connect','act'],
 ['clarify','explore'],['clarify','act'],['explore','act']
];
let cases=[],current=null,mapping=null,votes={};
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))votes=saved;}catch{}
function count(){return Object.keys(votes).filter(id=>cases.some(c=>c.id===id)).length;}
function stats(){$('lab-count').textContent=count()+' / '+cases.length;}
function words(s){return String(s).trim().split(/\s+/).filter(Boolean).length;}
function validURL(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null}catch{return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(votes))}catch{$('lab-status').textContent='Speicher nicht verfügbar. Bitte Stimmen zeitnah exportieren.'}}
function sourceList(c){
 const t=D.cases.find(x=>x.id===c.topicId);
 $('lab-limit').textContent=t?.limit||'Bitte Originalquellen und Grenzen selbst prüfen.';
 const box=$('lab-sources');box.replaceChildren();
 for(const id of t?.sources||[]){
  const src=D.sources.find(s=>s.id===id),url=validURL(src?.url);if(!url)continue;
  const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=src.name+' ↗';box.append(a);
 }
}
function reveal(){
 $('lab-reveal').hidden=false;
 const winner=votes[current.id]?.winner;
 $('lab-reveal-text').textContent='A: '+S.GOALS[mapping.a].label+' · B: '+S.GOALS[mapping.b].label+
   (winner==='neither'?' · Du hast keine Variante gewählt.':winner?' · Gewählt: '+S.GOALS[winner].label:'');
}
function load(){
 current=cases.find(c=>c.id===$('lab-case').value);
 if(!current)return;
 const index=cases.indexOf(current),previous=votes[current.id];
 const [first,second]=PAIRS[index%PAIRS.length];
 mapping=previous?.aGoal&&previous?.bGoal?{a:previous.aGoal,b:previous.bGoal}:
  Math.random()<.5?{a:first,b:second}:{a:second,b:first};
 const a=S.compose(current.topicId,mapping.a,''),b=S.compose(current.topicId,mapping.b,'');
 $('lab-comment').textContent=current.comment;
 $('lab-answer-a').textContent=a;$('lab-answer-b').textContent=b;
 $('lab-length-a').textContent=words(a)+' Wörter';$('lab-length-b').textContent=words(b)+' Wörter';
 $('lab-status').textContent='';$('lab-reveal').hidden=!previous;
 $('lab-issue').value=previous?.issue||'none';$('lab-critical').checked=Boolean(previous?.critical);
 for(const opt of ['a','b']){
  $('lab-vote-'+opt).disabled=!a||!b||a===b;
  $('lab-vote-'+opt).setAttribute('aria-pressed',String(previous?.choice===opt));
 }
 $('lab-neither').setAttribute('aria-pressed',String(previous?.choice==='neither'));
 if(previous)reveal();sourceList(current);stats();
}
function vote(choice){
 if(!current||!mapping||!['a','b','neither'].includes(choice))return;
 const a=S.compose(current.topicId,mapping.a,''),b=S.compose(current.topicId,mapping.b,'');
 if(!a||!b||a===b)return;
 const winner=choice==='neither'?'neither':mapping[choice];
 votes[current.id]={
  id:current.id,topicId:current.topicId,choice,winner,
  aGoal:mapping.a,bGoal:mapping.b,issue:$('lab-issue').value,
  critical:$('lab-critical').checked,originalSourcesReviewed:false,
  savedAt:new Date().toISOString(),method:'editorial_blind'
 };
 save();load();$('lab-status').textContent='Danke! Dein Urteil wurde nur lokal gespeichert.';
}
function next(){
 if(!current||!cases.length)return;
 const nextIndex=(cases.indexOf(current)+1)%cases.length;
 $('lab-case').value=cases[nextIndex].id;load();
 $('lab-comment').scrollIntoView({block:'nearest',behavior:'smooth'});
}
function exportVotes(){
 const records=Object.values(votes).filter(v=>cases.some(c=>c.id===v.id));
 if(!records.length){$('lab-status').textContent='Noch kein Urteil vorhanden.';return;}
 const body={schema:'avos-v13-strategy-votes',dataset:'20 synthetic prompts',note:'Unverified voluntary blind preference ratings. Not real-world behavioural impact or independent fact verification.',records};
 const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='animal-voices-strategie-votes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function init(){
 if(!S?.GOALS||!D?.cases){$('lab-status').textContent='Strategien oder Wissensbasis fehlen.';return}
 $('lab-vote-a').addEventListener('click',()=>vote('a'));
 $('lab-vote-b').addEventListener('click',()=>vote('b'));
 $('lab-neither').addEventListener('click',()=>vote('neither'));
 $('lab-next').addEventListener('click',next);
 $('lab-export').addEventListener('click',exportVotes);
 $('lab-case').addEventListener('change',load);
 try{
  const response=await fetch('/upgrade-cases.json?v=1.1.0',{cache:'no-store'});
  if(!response.ok)throw Error('fetch');
  const data=await response.json();
  if(!Array.isArray(data.cases)||data.cases.length!==20)throw Error('invalid');
  cases=data.cases.filter(c=>S.DRAFTS[c.topicId]&&D.cases.some(t=>t.id===c.topicId));
  if(cases.length!==20)throw Error('incomplete');
  const select=$('lab-case');
  for(const c of cases){const option=document.createElement('option');option.value=c.id;option.textContent=c.id+' · '+D.cases.find(t=>t.id===c.topicId).short;select.append(option)}
  select.value=cases[0].id;load();
 }catch{$('lab-status').textContent='Das Testset ist nicht verfügbar. Bitte Seite neu laden.';}
}
init();
})();
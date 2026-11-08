/* Animal Voices Response Lab: anonymous local A/B tests, not factual certification. */
(()=>{'use strict';
const D=window.AV_DATA,T=window.AV_TRIAGE,$=id=>document.getElementById(id);
if(!D?.cases?.length||!T?.SHORT||!T?.reply){document.body.textContent='Qualitätsvergleich nicht verfügbar.';return;}
const oldKey='avos_quality_reviews_v094',seedKey='avos_quality_seed_v094';
const read=(k,f)=>{try{return localStorage.getItem(k)||f}catch{return f}};
let seed=read(seedKey,'');if(!seed){seed=String(Math.floor(Math.random()*1073741824));try{localStorage.setItem(seedKey,seed)}catch{}}
const evals=(()=>{try{const x=JSON.parse(read(oldKey,'[]'));return Array.isArray(x)?x.filter(r=>r&&r.topic).slice(0,200):[]}catch{return []}})();
const topics=new Map(D.cases.map(x=>[x.id,x])),sources=new Map(D.sources.map(x=>[x.id,x]));
const criteria=[['accuracy','Fakten & Quellen',25],['fit','Trifft den Einwand',20],['care','Respekt & Empathie',15],['clarity','Klar und natürlich',15],['constructive','Hilfreicher nächster Schritt',15],['voice','Einprägsam & eigenständig',10]];
let order,choice=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=s=>/^https:\/\/[a-z0-9.-]+(?:[/:?#]|$)/i.test(s||'')?s:'#';
function fingerprint(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
function previous(t,p){let s=T.SHORT[t.id]||'';return p==='kiki'?'Danke für die Frage. 💚 '+s:p==='bao'?'Kurzer Reality-Check aus Baos Küche: 😄 '+s:s}
function variants(t,p){const a={version:'old',text:previous(t,p)},b={version:'new',text:T.reply(t,p,'short')};return fingerprint(seed+'|'+t.id+'|'+p)%2?[a,b]:[b,a]}
function distinctVersions(){return order?.[0]?.text.trim()!==order?.[1]?.text.trim()}
function announceStale(){
  const msg='A und B sind identisch. Das sieht nach einer alten gespeicherten Antwortversion aus. Bitte Seite mit Strg+F5 neu laden oder die App einmal vollständig schliessen und neu öffnen. Wir speichern keinen ungültigen Vergleich.';
  $('choice').textContent=msg;$('feedback').textContent=msg;$('save').disabled=true;
  document.querySelectorAll('[data-vote]').forEach(b=>b.disabled=true);
  $('neither').disabled=true;
}
function store(){try{localStorage.setItem(oldKey,JSON.stringify(evals))}catch{$('feedback').textContent='Lokaler Speicher nicht verfügbar.';}stats()}
function stats(){ $('test-count').textContent=evals.length;const selected=evals.filter(r=>r.version);$('new-share').textContent=selected.length?Math.round(selected.filter(r=>r.version==='new').length*100/selected.length)+' %':'–';$('critical-count').textContent=evals.filter(r=>r.critical).length;}
$('topic').innerHTML=D.cases.map(t=>'<option value="'+escape(t.id)+'">'+escape(t.short)+' · '+escape(t.category)+'</option>').join('');
$('rubric').innerHTML=criteria.map(c=>'<div class="rubric-row"><label for="grade-'+c[0]+'">'+escape(c[1])+' <span class="muted">('+c[2]+' %)</span></label><select id="grade-'+c[0]+'" data-grade="'+c[0]+'"><option value="">–</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'">'+n+'/5</option>').join('')+'</select></div>').join('');
function paint(){
  const t=topics.get($('topic').value);if(!t)return;order=variants(t,$('voice').value);choice=null;
  $('original').textContent=t.title;$('fact').textContent=t.fact;$('caveat').textContent=t.limit;
  $('sources').innerHTML=t.sources.length?t.sources.map(id=>{const s=sources.get(id);return s?'<div class="source"><b>'+escape(s.name)+' ('+escape(s.year)+')</b><a href="'+url(s.url)+'" target="_blank" rel="noopener noreferrer">Originalquelle prüfen ↗</a></div>':''}).join(''):'<div class="disclaimer">Noch keine Quelle hinterlegt – keine Faktenfreigabe.</div>';
  ['a','b'].forEach((key,i)=>{$('text-'+key).textContent=order[i].text;$('length-'+key).textContent=order[i].text.length+' Zeichen';$('card-'+key).classList.remove('chosen');document.querySelector('[data-vote="'+key+'"]').setAttribute('aria-pressed','false')});
  $('neither').setAttribute('aria-pressed','false');$('choice').textContent='Noch keine Variante gewählt.';$('save').disabled=true;$('critical').checked=false;$('source-checked').checked=false;$('note').value='';document.querySelectorAll('[data-grade]').forEach(e=>e.value='');
  $('feedback').textContent=evals.some(r=>r.topic===t.id&&r.voice===$('voice').value)?'Für diese Kombination besteht bereits eine Bewertung. Eine neue ersetzt sie.':'';
  document.querySelectorAll('[data-vote]').forEach(b=>b.disabled=false);
  $('neither').disabled=false;
  if(!distinctVersions())announceStale();
}
function vote(v){
  if(!['a','b','neither'].includes(v)||!distinctVersions())return;choice=v;
  ['a','b'].forEach(k=>{$('card-'+k).classList.toggle('chosen',v===k);document.querySelector('[data-vote="'+k+'"]').setAttribute('aria-pressed',String(v===k))});
  $('neither').setAttribute('aria-pressed',String(v==='neither'));
  $('choice').textContent=v==='neither'?'Keine überzeugt mich.':'Variante '+v.toUpperCase()+' wäre meine Wahl.';$('save').disabled=false;
}
document.querySelectorAll('[data-vote]').forEach(b=>b.addEventListener('click',()=>vote(b.dataset.vote)));
$('neither').addEventListener('click',()=>vote('neither'));
function weighted(){const grades={};for(const [id] of criteria){const n=Number(document.querySelector('[data-grade="'+id+'"]').value);if(!Number.isInteger(n)||n<1||n>5)return null;grades[id]=n;}return {grades,score:Math.round(criteria.reduce((sum,c)=>sum+c[2]*grades[c[0]]/5,0))}}
function clean(s){return String(s||'').slice(0,600).replace(/@[A-Za-z0-9_.]+/g,'[Handle]').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[E-Mail]').replace(/https?:\/\/\S+/g,'[Link]');}
$('save').addEventListener('click',()=>{
  if(!choice||!distinctVersions())return;
  const topic=$('topic').value,voice=$('voice').value,result=weighted(),critical=$('critical').checked;
  const record={topic,voice,choice,version:choice==='neither'?null:order[choice==='a'?0:1].version,sourceChecked:$('source-checked').checked,critical,score:critical?0:(result?result.score:null),grades:result?.grades||null,note:clean($('note').value),evaluatedAt:new Date().toISOString()};
  const ix=evals.findIndex(r=>r.topic===topic&&r.voice===voice);if(ix>=0)evals.splice(ix,1,record);else evals.push(record);store();
  $('feedback').textContent=critical?'Gespeichert: schwerer Fehler markiert. Nicht freigabefähig.':'Lokal gespeichert – danke! ♡';
});
['topic','voice'].forEach(id=>$(id).addEventListener('change',paint));
$('next').addEventListener('click',()=>{const i=D.cases.findIndex(t=>t.id===$('topic').value);$('topic').value=D.cases[(i+1)%D.cases.length].id;paint();window.scrollTo({top:0,behavior:'smooth'});});
function quote(s){return '"'+String(s??'').replace(/"/g,'""')+'"'}
$('export').addEventListener('click',()=>{
  const header=['topic','voice','choice','version','sourceChecked','critical','score',...criteria.map(c=>c[0]),'note','evaluatedAt'];
  const rows=evals.map(r=>[r.topic,r.voice,r.choice,r.version,r.sourceChecked,r.critical,r.score,...criteria.map(c=>r.grades?.[c[0]]??''),r.note,r.evaluatedAt]);
  const csv='\uFEFF'+header.map(quote).join(',')+'\r\n'+rows.map(x=>x.map(quote).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download='animal-voices-response-lab.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);$('feedback').textContent='Lokale Daten exportiert.';
});
$('clear').addEventListener('click',()=>{if(!confirm('Alle lokalen Bewertungen löschen?'))return;evals.splice(0);store();paint();$('feedback').textContent='Lokale Bewertungen gelöscht.'});
paint();stats();
})();
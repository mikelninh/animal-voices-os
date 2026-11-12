/* Animal Voices · Instagram-style Conversation Simulator v0.8
   Safe training fixture: nothing published or sent to Instagram. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const root=$('sim-experience');
if(!root)return;
let scenarios=[],active=null,reviewed=0,lastFeedback=null;
const storageKey='animal-voices-simulator-feedback-v1';
const create=(tag,cls,txt)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(txt!==undefined)el.textContent=txt;
 return el;
};
const number=(n)=>new Intl.NumberFormat('de-DE').format(n);
function announce(s){$('sim-feedback').textContent=s;}
function markProgress(s){$('sim-progress').textContent=s;}
function sceneLink(id=active,commentIndex=null){
 const chosen=scenarios.find(sc=>sc.id===id);
 const u=new URL('/instagram-demo.html',location.origin);
 if(chosen)u.searchParams.set('scene',chosen.id);
 if(chosen&&Number.isInteger(commentIndex)&&commentIndex>=0&&commentIndex<chosen.comments.length)u.searchParams.set('c',String(commentIndex));
 return u.href;
}
const invitation='🌱 Ich teste gerade Animal Voices: Wie antwortest du freundlich auf schwierige Instagram-Kommentare? Probier die fiktive Demo ohne Login aus. 🐮';
function offerShare(text,url){
 const u=url||sceneLink();
 const message=text+'\n\n'+u;
 if(navigator.share){
  return navigator.share({title:'Animal Voices · Community-Test',text,url:u})
   .then(()=>{$('sim-share-status').textContent='Danke fürs Teilen! ♡'})
   .catch(e=>{if(e?.name!=='AbortError')$('sim-share-status').textContent='Teilen fehlgeschlagen. Du kannst den Link kopieren.'});
 }
 window.open('https://wa.me/?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
 $('sim-share-status').textContent='Wähle deine WhatsApp-Gruppe, um die Einladung zu teilen.';
 return Promise.resolve();
}
function displayStories(){
 const host=$('sim-stories');host.replaceChildren();
 for(const sc of scenarios){
  const b=create('button','sim-story');b.type='button';b.dataset.story=sc.id;
  b.setAttribute('aria-pressed',String(sc.id===active));
  b.setAttribute('aria-label','Situation '+sc.title+' anzeigen');
  const ring=create('span','sim-ring'),inner=create('span','sim-ring-inner',sc.emoji);
  ring.append(inner);
  b.append(ring,create('strong','',sc.title));
  b.addEventListener('click',()=>choose(sc.id));
  host.append(b);
 }
 $('sim-count').textContent=scenarios.length+' Szenarien · '+scenarios.reduce((n,s)=>n+s.comments.length,0)+' Kommentare';
}
function makeComment(sc,item,index){
 const li=create('li','sim-comment');li.dataset.avSimComment='';li.dataset.scenario=sc.id;li.dataset.commentIndex=String(index);
 const row=create('div','sim-comment-line');
 const face=create('span','sim-avatar',['🌱','☀','◦'][index%3]);
 const body=create('div','sim-comment-body');
 const name=create('strong','sim-comment-name',item.by);
 const statement=create('span','',item.text);statement.setAttribute('dir','auto');statement.setAttribute('data-comment-text','');
 body.append(name,document.createTextNode(' '),statement);
 const meta=create('div','sim-comment-meta');
 meta.append(create('span','',item.time));
 const reply=create('button','native-reply','Antworten');reply.type='button';
 const likes=create('span','',number(item.likes)+' Likes');
 meta.append(reply,likes);
 body.append(meta);
 const hearts=create('button','sim-comment-side','♡');hearts.type='button';hearts.setAttribute('aria-label','Kommentar gefällt mir');
 hearts.setAttribute('aria-pressed','false');
 hearts.addEventListener('click',()=>{const liked=hearts.getAttribute('aria-pressed')==='true';hearts.setAttribute('aria-pressed',String(!liked));hearts.textContent=liked?'♡':'♥';});
 row.append(face,body,hearts);li.append(row);
 const compose=create('div','compose');compose.hidden=true;
 const area=create('textarea');area.placeholder='Als animal.voices.demo antworten …';
 area.setAttribute('aria-label','Antwort an '+item.by+' im Simulator');
 area.maxLength=1200;
 const preview=create('button','sim-preview-btn','Antwort im Feed ansehen · nur Vorschau');
 preview.type='button';preview.disabled=true;
 const tip=create('small','sim-compose-tip','Keine echte Veröffentlichung – der Kommentar erscheint nur in dieser Demo.');
 compose.append(area,preview,tip);body.append(compose);
 const showComposer=()=>{compose.hidden=false;area.focus();markProgress('Antwortfeld geöffnet. Nutze ✳ Animal Voices und wähle deine Stimme.')};
 reply.addEventListener('click',showComposer);
 area.addEventListener('input',()=>{
  const ready=area.value.trim().length>0;
  preview.disabled=!ready;
  if(ready)markProgress('Antwort übernommen. Jetzt die Vorschau im Feed ausprobieren.');
 });
 preview.addEventListener('click',()=>{
  const value=area.value.trim();if(!value)return;
  li.querySelectorAll('.sim-rendered,.sim-rated').forEach(el=>el.remove());
  const rendered=create('div','sim-rendered');
  const avatar=create('span','sim-avatar','✳');
  const message=create('div');
  message.append(create('strong','', 'animal.voices.demo · Entwurf'),create('small','', ' · nur in dieser Simulation'));
  message.append(create('p','',value));
  rendered.append(avatar,message);
  body.append(rendered);
  const rate=create('div','sim-rated');
  const question=create('span','', 'Würdest du diese Antwort so posten?');
  const yes=create('button','','Ja, passt');
  const no=create('button','','Noch nicht');
  rate.append(question,yes,no);body.append(rate);
  for(const [button,vote] of [[yes,'ready'],[no,'revise']]){
   button.type='button';
   button.addEventListener('click',()=>{
    try{
     const old=JSON.parse(localStorage.getItem(storageKey)||'[]');
     const arr=Array.isArray(old)?old.slice(-99):[];
     arr.push({scenario:sc.id,position:index,vote,date:new Date().toISOString().slice(0,10)});
     localStorage.setItem(storageKey,JSON.stringify(arr));
    }catch{}
    rate.replaceChildren(create('span','',vote==='ready'?'✓ Danke! Du kannst den nächsten Kommentar testen.':'Danke! Du kannst den Text ändern und eine neue Vorschau erstellen.'));
    lastFeedback={scenario:sc.id,position:index,vote};
    reviewed++;
    $('sim-share-feedback').textContent='♡ Feedback jetzt teilen';
    markProgress(reviewed+' freiwillige Vorschau-Bewertung(en) in dieser Sitzung – nur lokal.');
   },{once:true});
  }
  announce('Antwort als lokale Vorschau hinzugefügt – nichts wurde veröffentlicht.');
  markProgress('Vorschau erstellt. Entscheide, ob du das so schreiben würdest.');
 });
 return li;
}
function choose(id){
 const sc=scenarios.find(x=>x.id===id);if(!sc)return;
 const link=new URL(location.href);
 link.searchParams.set('scene',id);link.searchParams.delete('c');
 history.replaceState(null,'',link.pathname+link.search+link.hash);
 active=id;displayStories();
 $('sim-author-avatar').textContent=sc.emoji;
 $('sim-author').textContent=sc.author;
 $('sim-author-sub').textContent=sc.tagline+' · '+sc.postTime;
 $('sim-photo').className='sim-photo sim-photo-'+sc.color;
 $('sim-photo-emoji').textContent=sc.emoji;
 $('sim-caption-author').textContent=sc.author;
 $('sim-caption').textContent=sc.caption;
 $('sim-likes').textContent='Gefällt '+number(sc.likes)+' Mal';
 $('sim-comments-count').textContent=sc.comments.length+' Kommentare · fiktive Diskussion';
 $('sim-like-post').textContent='♡';$('sim-like-post').setAttribute('aria-pressed','false');
 $('sim-save-post').setAttribute('aria-pressed','false');
 const comments=$('sim-comments');comments.replaceChildren();
 for(let i=0;i<sc.comments.length;i++)comments.append(makeComment(sc,sc.comments[i],i));
 announce('');
 $('sim-own-status').textContent='';
 $('sim-custom-input').value='';
 $('sim-share-status').textContent='';
 markProgress('Tippe bei einem Kommentar auf „✳ Animal Voices“ und probiere den Ablauf.');
}
function wirePostActions(){
 $('sim-like-post').addEventListener('click',()=>{
  const btn=$('sim-like-post'),liked=btn.getAttribute('aria-pressed')==='true';
  btn.setAttribute('aria-pressed',String(!liked));btn.textContent=liked?'♡':'♥';
 });
 $('sim-save-post').addEventListener('click',()=>{
  const btn=$('sim-save-post'),saved=btn.getAttribute('aria-pressed')==='true';
  btn.setAttribute('aria-pressed',String(!saved));btn.textContent=saved?'▢':'▣';
  announce(saved?'Demo-Beitrag aus Merkliste entfernt.':'Demo-Beitrag lokal als gemerkt markiert.');
 });
 $('sim-show-comments').addEventListener('click',()=>$('sim-comments').scrollIntoView({behavior:'smooth',block:'start'}));
 $('sim-share-post').addEventListener('click',()=>announce('Diese Posts sind fiktiv. Kein echter Instagram-Share.'));
}
function wireCommunity(){
 $('sim-add-comment').addEventListener('click',()=>{
  const text=$('sim-custom-input').value.trim(),status=$('sim-own-status');
  if(text.length<12){status.textContent='Schreib bitte mindestens 12 Zeichen – eine echte Frage oder einen Einwand.';return}
  if(text.length>700){status.textContent='Bitte auf maximal 700 Zeichen kürzen.';return}
  if(/@[a-z0-9_.]{2,}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|https?:\/\/|\+?\d[\d ()-]{7,}\d/i.test(text)){
   status.textContent='Bitte keine Handles, Links oder Kontaktdaten verwenden. Die Demo soll privat bleiben.';return;
  }
  const sc=scenarios.find(x=>x.id===active);if(!sc)return;
  const list=$('sim-comments'),previous=list.querySelector('[data-custom-comment="1"]');
  if(previous)previous.remove();
  const li=makeComment(sc,{by:'community.test',text,time:'gerade eben · lokaler Test',likes:0},sc.comments.length);
  li.setAttribute('data-custom-comment','1');
  list.append(li);
  $('sim-comments-count').textContent=(sc.comments.length+1)+' Kommentare · inklusive deiner lokalen Frage';
  status.textContent='Dein Kommentar steht im Feed. Nutze jetzt ✳ Animal Voices direkt daneben.';
  markProgress('Eigenen Kommentar testen: Tippe auf den neuen ✳ Animal Voices-Knopf.');
  li.scrollIntoView({behavior:'smooth',block:'center'});
 });
 $('sim-share-scenario').addEventListener('click',()=>offerShare(invitation,sceneLink(active)));
 $('sim-share-feedback').addEventListener('click',()=>{
  if(!lastFeedback){
   $('sim-share-status').textContent='Teste erst eine Antwort im Feed und wähle „Ja, passt“ oder „Noch nicht“. Dann kannst du deine Einschätzung teilen.';
   return;
  }
  const sc=scenarios.find(x=>x.id===lastFeedback.scenario);
  const rating=lastFeedback.vote==='ready'?'Ich würde die Antwort so posten ✅':'Die Antwort braucht noch Arbeit ✍️';
  const message='♡ Mein Animal Voices Community-Test: '+(sc?.title||'Situation')+' · '+rating+'.\nWelche Antwort würdest du wählen?';
  offerShare(message,sceneLink(lastFeedback.scenario,lastFeedback.position<3?lastFeedback.position:null));
 });
 $('sim-copy-link').addEventListener('click',async()=>{
  const url=sceneLink(active);
  try{await navigator.clipboard.writeText(url);$('sim-share-status').textContent='✓ Szenario-Link kopiert. Jetzt an Freunde und Community schicken.'}
  catch{$('sim-share-status').textContent='Kopieren fehlgeschlagen. Du kannst die Browseradresse markieren.'}
 });
}

function selftestCommunity(){
 const report=create('output');report.id='av-community-selftest';report.dataset.status='running';document.body.append(report);
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 (async()=>{
  try{
   if(active!=='rage')throw Error('SHARED_SCENE_NOT_OPENED');
   const target=$('sim-comments').querySelector('[data-comment-index="0"]');
   if(!target?.hasAttribute('data-linked-comment'))throw Error('SHARED_COMMENT_NOT_HIGHLIGHTED');
   if(!location.search.includes('scene=rage')||!location.search.includes('c=0'))throw Error('LINK_PARAMS_LOST');
   $('sim-share-feedback').click();
   if(!$('sim-share-status').textContent.includes('Teste erst'))throw Error('FEEDBACK_SHARED_WITHOUT_VOTE');
   choose('taste');
   $('sim-custom-input').value='@private.friend Welche B12 Tabletten soll ich kaufen?';
   $('sim-add-comment').click();
   if($('sim-comments').querySelector('[data-custom-comment="1"]'))throw Error('PRIVATE_HANDLE_ACCEPTED');
   $('sim-custom-input').value='Warum sollte ich bei meinem Burger auf die Tiere achten?';
   $('sim-add-comment').click();
   const own=$('sim-comments').querySelector('[data-custom-comment="1"]');
   if(!own)throw Error('OWN_COMMENT_NOT_CREATED');
   if(!own.querySelector('[data-comment-text]')?.textContent.includes('Burger'))throw Error('OWN_COMMENT_INCORRECT');
   let control;
   for(let i=0;i<20;i++){control=own.querySelector('[aria-label="Mit Animal Voices auf diesen Kommentar antworten"]');if(control)break;await sleep(110);}
   if(!control)throw Error('NO_AV_ON_CUSTOM_COMMENT');
   control.click();await sleep(55);
   const sheet=document.querySelector('.av-panel')?.shadowRoot;
   if(!sheet)throw Error('OWN_COMMENT_COACH_NOT_OPENED');
   if(!sheet.getElementById('av-comment').value.includes('Burger'))throw Error('WRONG_OWN_COMMENT_SELECTED');
   sheet.getElementById('av-close').click();
   if(!sceneLink('rage',0).includes('scene=rage&c=0'))throw Error('SHARE_LINK_NOT_DEEP_LINKED');
   if(document.querySelector('.av-panel,.av-shade'))throw Error('OVERLAY_NOT_CLOSED');
   report.dataset.status='pass';
   report.textContent='PASS: shareable deep link, highlighted comment, own-comment sandbox, private handle rejection, coach selection and no unwanted feedback transfer';
  }catch(e){report.dataset.status='fail';report.textContent='FAIL: '+(e?.message||e)}
 })();
}

function selftest(){
 const report=create('output');report.id='av-simulator-selftest';report.dataset.status='running';document.body.append(report);
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 (async()=>{
  try{
   const list=$('sim-comments').querySelectorAll('li[data-av-sim-comment]');
   if(scenarios.length!==8||list.length!==3)throw Error('SCENARIO_DATA_MISSING');
   const first=list[0];
   let injected=null;
   for(let i=0;i<18;i++){
    injected=first.querySelector('[aria-label="Mit Animal Voices auf diesen Kommentar antworten"]');
    if(injected)break;
    await sleep(110);
   }
   if(!injected)throw Error('NO_AV_BUTTON_ON_DYNAMIC_COMMENT');
   injected.click();await sleep(70);
   let panel=document.querySelector('.av-panel'),shadow=panel?.shadowRoot;
   if(!shadow)throw Error('NO_PANEL_FOR_SCENARIO');
   if(!shadow.getElementById('av-comment').value.includes('Fleisch schmeckt'))throw Error('WRONG_SCENARIO_COMMENT');
   const choice=shadow.querySelector('[data-av-voice="bao"]');if(!choice)throw Error('VOICE_CHOICE_MISSING');
   choice.click();
   const expected=shadow.getElementById('av-proposal').value;
   if(!expected||expected.length<20)throw Error('EMPTY_REPLY');
   shadow.getElementById('av-insert').click();await sleep(1080);
   const area=first.querySelector('.compose textarea');
   if(area.value.trim()!==expected)throw Error('TEXT_NOT_INSERTED');
   if(document.querySelector('.av-panel,.av-shade'))throw Error('BLOCKING_PANEL_LEFT_OPEN');
   const preview=first.querySelector('.sim-preview-btn');
   if(preview.disabled)throw Error('PREVIEW_NOT_ENABLED_AFTER_INSERT');
   preview.click();
   if(!first.querySelector('.sim-rendered')?.textContent.includes(expected))throw Error('COMMENT_PREVIEW_FAILED');
   if(!first.querySelector('.sim-rated'))throw Error('REVIEW_CONTROL_MISSING');
   choose('rage');await sleep(750);
   const threat= $('sim-comments').querySelector('li[data-av-sim-comment]');
   const rageBtn=threat.querySelector('[aria-label="Mit Animal Voices auf diesen Kommentar antworten"]');
   if(!rageBtn)throw Error('NO_RAGE_CONTROL');
   rageBtn.click();await sleep(45);
   panel=document.querySelector('.av-panel');shadow=panel?.shadowRoot;
   if(!shadow?.getElementById('av-mod-label').textContent.includes('Weiterziehen'))throw Error('RAGE_MODERATION_MISSING');
   shadow.getElementById('av-close').click();
   choose('safety');await sleep(750);
   const danger=$('sim-comments').querySelector('li[data-av-sim-comment]');
   const dangerBtn=danger.querySelector('[aria-label="Mit Animal Voices auf diesen Kommentar antworten"]');
   if(!dangerBtn)throw Error('NO_SAFETY_CONTROL');
   dangerBtn.click();await sleep(45);
   panel=document.querySelector('.av-panel');shadow=panel?.shadowRoot;
   if(!shadow?.getElementById('av-mod-label').textContent.includes('melden'))throw Error('THREAT_NOT_REPORTED');
   if(!shadow.getElementById('av-insert').disabled)throw Error('THREAT_COULD_INSERT');
   shadow.getElementById('av-close').click();
   report.dataset.status='pass';
   report.textContent='PASS: eight scenarios, dynamic selection, four voices, composer handoff, no real posting, preview, ragebait and threat moderation';
  }catch(e){report.dataset.status='fail';report.textContent='FAIL: '+(e?.message||e)}
 })();
}
wirePostActions();
wireCommunity();
fetch('/simulator-scenarios.json',{cache:'no-store'}).then(async response=>{
 if(!response.ok)throw Error('Szenarien-Datei nicht gefunden');
 const data=await response.json();
 if(!Array.isArray(data.scenarios)||data.scenarios.length!==8||data.scenarios.some(x=>!Array.isArray(x.comments)||x.comments.length!==3))
  throw Error('Szenarien-Daten sind unvollständig');
 scenarios=data.scenarios;
 const q=new URLSearchParams(location.search),linked=scenarios.find(s=>s.id===q.get('scene'));
 const id=linked?linked.id:scenarios[0].id;
 const selectedIndex=linked&&/^[0-2]$/.test(q.get('c')||'')?Number(q.get('c')):null;
 choose(id);
 if(selectedIndex!==null){
  const u=new URL(location.href);u.searchParams.set('c',String(selectedIndex));history.replaceState(null,'',u.pathname+u.search+u.hash);
  const target=$('sim-comments').querySelector('[data-comment-index="'+selectedIndex+'"]');
  if(target){target.classList.add('sim-linked-comment');target.setAttribute('data-linked-comment','true');markProgress('Hier startet dein geteilter Test: Tippe auf ✳ Animal Voices beim hervorgehobenen Kommentar.');}
 }
 root.dataset.simulatorReady='true';
 if(new URLSearchParams(location.search).has('selftestSimulator'))selftest();
 if(new URLSearchParams(location.search).has('selftestCommunity'))selftestCommunity();
}).catch(e=>{
 $('sim-stories').replaceChildren(create('p','sim-loading','Die Situationen konnten leider nicht geladen werden.'));
 announce(String(e?.message||e));
 root.dataset.simulatorReady='error';
});
})();

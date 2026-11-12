/* Animal Voices independent NVSINO community test. Nothing auto-posted, no analytics. */
(()=>{'use strict';
 const input=document.querySelector('#note');
 const status=document.querySelector('#feedback-status');
 const button=document.querySelector('#copy-feedback');
 const scenes={rage:'🔥 Ragebait',taste:'🍔 Geschmack',ethics:'🐷 Tierethik'};
 const scene=new URLSearchParams(location.search).get('scene');
 if(Object.prototype.hasOwnProperty.call(scenes,scene)){
  const radio=document.querySelector('input[name="scene"][value="'+scene+'"]');
  if(radio)radio.checked=true;
 }
 function draft(){
  const chosen=document.querySelector('input[name="scene"]:checked')?.value||'rage';
  const rated=document.querySelector('input[name="rating"]:checked')?.value;
  if(!rated)return null;
  const sentiment={yes:'✅ Würde ich so posten',maybe:'🤔 Würde ich überarbeiten',no:'👎 Würde ich nicht posten'};
  const note=input.value.trim().replace(/\s+/g,' ').slice(0,350);
  return '✳ Animal Voices – mein NVSINO Community-Test\n'
   +'Situation: '+scenes[chosen]+'\n'
   +'Mein Eindruck: '+sentiment[rated]
   +(note?'\nWas besser sein könnte: '+note:'')
   +'\n\nUnabhängiger Simulator: https://animal-voices-os.vercel.app/nvsino.html';
 }
 button.addEventListener('click',async()=>{
  const message=draft();
  if(!message){status.textContent='Wähle bitte zuerst aus, ob du die Antwort so posten würdest.';return}
  try{
   await navigator.clipboard.writeText(message);
   status.textContent='✓ Kopiert! Jetzt kannst du das Feedback selbst in den passenden NVSINO-Thread einfügen.';
  }catch{
   // User-facing manual fallback; textContent means notes are never executed as markup.
   const fallback=document.createElement('textarea');fallback.value=message;
   fallback.setAttribute('aria-label','Feedback manuell kopieren');
   fallback.style.cssText='width:100%;min-height:130px;margin-top:9px';
   status.replaceChildren(document.createTextNode('Kopieren wurde blockiert. Hier kannst du deinen Text markieren: '),fallback);
   fallback.focus();fallback.select();
  }
 });
 if(new URLSearchParams(location.search).has('selftest')){
  const report=document.createElement('output');report.id='nvsino-selftest';report.dataset.status='running';document.body.append(report);
  try{
   if(!document.querySelector('#start-challenge')?.href.includes('scene=rage'))throw Error('START_LINK');
   if(!document.querySelector('a[href*="scene=taste"]'))throw Error('TASTE_LINK');
   if(!document.querySelector('a[href*="scene=ethics"]'))throw Error('ETHICS_LINK');
   if(draft()!==null)throw Error('REVIEW_NOT_OPTIONAL');
   const rating=document.querySelector('input[name="rating"][value="maybe"]');rating.checked=true;
   input.value='Bitte klarer bei Fakten bleiben.';
   const result=draft();
   if(!result.includes('Würde ich überarbeiten')||!result.includes('klarer bei Fakten'))throw Error('FEEDBACK_NOT_MEANINGFUL');
   if(result.includes('@"')||!result.includes('nvsino.html'))throw Error('SHARE_TEXT');
   report.dataset.status='pass';report.textContent='PASS: three scenario links, optional feedback, explicit rating and shareable local summary';
  }catch(e){report.dataset.status='fail';report.textContent='FAIL: '+e.message}
 }
})();

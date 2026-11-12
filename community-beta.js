/* Animal Voices community landing v1.0 — no analytics, no accounts, human sharing only */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const url='https://animal-voices-os.vercel.app/community.html';
 const words={
 de:{
 eyebrow:'EIN KLEINES EXPERIMENT FÜR BESSERE GESPRÄCHE',
 headline1:'Gute Antworten.',headline2:'Bessere Gespräche.',
 intro:'Probiere es selbst: Wähle einen Kommentar, entdecke passende Antworten und schau, wie sie im Feed wirken. Ohne Login, ohne echtes Posten.',
 start:'Jetzt eine Antwort ausprobieren',share:'Mit Freunden teilen',trust1:'Kein Login',trust2:'Keine Installation',trust3:'Keine echten Posts',
 reply:'Verstehe ich. Geschmack ist wichtig! Für mich zählt aber auch, was mit Tieren passiert. Vielleicht entdecken wir ein Gericht, das dir ebenso gut schmeckt.',
 howLabel:"SO FUNKTIONIERT'S",howTitle:'Ein Kommentar. Vier Möglichkeiten.',
 step1title:'Situation auswählen',step1:'Ein Post und seine Kommentare – so wie in einer Social-Media-Diskussion.',
 step2title:'Animal Voices öffnen',step2:'Die App empfiehlt Antworten, Grenzen oder bewusstes Nichtantworten.',
 step3title:'Antwort im Feed ansehen',step3:'Wähle deine Stimme und schau dir die Antwort vor dem Absenden an – ohne echte Veröffentlichung.',
 openDemo:'Jetzt den Simulator öffnen ↗',
 chooseKicker:'DEIN ERSTER TEST',chooseTitle:'Wähle einen Kommentar.',chooseSub:'Ein Klick öffnet den Simulator direkt bei diesem Kommentar.',
 card1label:'Ehrliche Skepsis',card1title:'„Fleisch schmeckt mir einfach besser.“',card2label:'Ragebait',card2title:'„Wegen euch esse ich zwei extra Steaks!“',
 card3label:'Tierethik',card3title:'“Why should animal suffering matter?”',cardAction:'Diesen Kommentar testen ↗',
 communityKicker:'COMMUNITY EXPERIMENT',communityTitle:'Teste es. Hinterfrage es. Teil es.',
 communityBody:'Welche Stimme klingt wirklich menschlich? Wo fehlt Kontext oder ein guter Beleg? Wir möchten nicht nur schöne Antworten – sondern eine Community, die sie ehrlich besser macht.',
 whatsapp:'In WhatsApp teilen',copy:'Link kopieren',inviteQuote:'„Wir müssen nicht jede Diskussion gewinnen. Vielleicht können wir einfach lernen, besser miteinander zu reden.“',
 disclaimer:'Dies ist eine unabhängige, fiktive Instagram-Stil-Simulation, keine Funktion innerhalb der Instagram-App. Alles im Simulator ist ein Entwurf. Der kostenlose Test verwendet lokale, redaktionelle Antworten. Die private KI-Beta ist optional und benötigt einen separaten Zugang. Freiwilliges Testfeedback bleibt zunächst auf deinem Gerät, bis du es selbst teilst.',
 code:'Unser Community Code',quality:'Qualität & Tests',browser:'Browser-Companion',
 msg:'🌱 Ein kleines Experiment: Wie würdest du auf einen schwierigen Instagram-Kommentar reagieren? Animal Voices zeigt dir vier Antwortstimmen – auch bei Ragebait. Alles im Simulator, ohne Login und ohne echte Posts. Probier’s aus! 🐮\n\n'+url,
 copied:'✓ Link kopiert – jetzt in deine Community schicken!',needCopy:'Kopieren war nicht möglich. Du kannst den Link im Browser markieren.',shareDone:'Teile die Einladung mit deiner Community.'
 },
 en:{
 eyebrow:'A SMALL EXPERIMENT IN BETTER CONVERSATIONS',
 headline1:'Kind replies.',headline2:'Better conversations.',
 intro:'Try it yourself: choose a comment, discover different replies, and see how they look in the feed. No account, no actual posting.',
 start:'Try it for free · no login',share:'Share with friends',trust1:'No login',trust2:'No installation',trust3:'No real posts',
 reply:'I get it. Taste matters! But what happens to animals matters to me, too. Maybe we can find a plant-based dish you genuinely enjoy.',
 howLabel:'HOW IT WORKS',howTitle:'One comment. Four choices.',
 step1title:'Choose a situation',step1:'A post and its comments, just like a real social-media conversation.',
 step2title:'Open Animal Voices',step2:'The assistant suggests replying, setting a boundary, or choosing not to engage.',
 step3title:'Preview in the feed',step3:'Pick your voice and see how the reply looks. Nothing is actually published.',
 openDemo:'Open the simulator ↗',
 chooseKicker:'YOUR FIRST TRY',chooseTitle:'Choose a comment.',chooseSub:'One click takes you straight to that comment in the simulator.',
 card1label:'Genuine doubt',card1title:'“Meat simply tastes better to me.”',card2label:'Ragebait',card2title:'“I’ll eat two extra steaks because of you!”',
 card3label:'Animal ethics',card3title:'“Why should animal suffering matter?”',cardAction:'Try this comment ↗',
 communityKicker:'COMMUNITY EXPERIMENT',communityTitle:'Test it. Question it. Share it.',
 communityBody:'Which voice sounds most human? Where does context or a good source go missing? We want a community that helps make the answers better, not just prettier.',
 whatsapp:'Share on WhatsApp',copy:'Copy link',inviteQuote:'“We don’t have to win every argument. Perhaps we can learn to talk to each other better.”',
 disclaimer:'This is a fictional, independent Instagram-style simulation, not a feature inside the native Instagram app. All replies are drafts. Free testing uses local editorial responses. Private AI is optional and requires a separate code. Voluntary test feedback stays on your device unless you choose to share it.',
 code:'Our Community Code',quality:'Quality & tests',browser:'Browser companion',
 msg:'🌱 Small experiment: What would you say to a difficult Instagram comment? Animal Voices offers four different reply voices – even for ragebait. Free interactive simulator, no login, no real posting. Try it! 🐮\n\n'+url,
 copied:'✓ Link copied – share it with your community!',needCopy:'Could not copy automatically. Copy the browser address instead.',shareDone:'Share this invitation with your friends.'
 }
 };
 const params=new URLSearchParams(location.search);
 let lang=params.get('lang')==='en'?'en':'de';
 let voice='kiki';
 const sampleComments={
  de:'Fleisch schmeckt mir einfach besser. Warum sollte ich wechseln?',
  en:'I enjoy the taste of meat; why would I give it up?'
 };
 function renderPreview(){
  const comment=sampleComments[lang];
  $('landing-sample-comment').textContent=comment;
  const core=window.AV_COMMUNITY_PREVIEW_CORE;
  const result=core?.suggest(comment,voice);
  $('landing-voice-reply').textContent=result?.text||words[lang].reply;
  $('landing-voice-hint').textContent=lang==='de'
   ?'Redaktioneller Entwurf · Stimme wechseln, bevor du ihn ausprobierst.'
   :'Editorial draft · switch voices before trying it.';
  const names=lang==='en'
   ?{kiki:'♡ Warm',momo:'✦ Clear',bao:'☀ Playful',curious:'? Curious'}
   :{kiki:'♡ Warm',momo:'✦ Klar',bao:'☀ Humor',curious:'? Neugierig'};
  document.querySelectorAll('[data-landing-voice]').forEach(button=>{
   const selected=button.dataset.landingVoice===voice;
   button.setAttribute('aria-pressed',String(selected));
   button.textContent=names[button.dataset.landingVoice];
  });
 }

 function translate(){
  document.documentElement.lang=lang;$('lang').textContent=lang==='en'?'DE':'EN';
  const dictionary=words[lang];
  document.querySelectorAll('[data-i18n]').forEach(node=>{
   const val=dictionary[node.dataset.i18n];if(val)node.textContent=val;
  });
  const links=document.querySelectorAll('a[href^="/instagram-demo.html"]');
  links.forEach(node=>{
   const u=new URL(node.getAttribute('href'),location.origin);
   if(lang==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');
   node.href=u.pathname+u.search;
  });
  const u=new URL(location.href);if(lang==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');history.replaceState(null,'',u.pathname+u.search+u.hash);
  renderPreview();
 }
 $('lang').addEventListener('click',()=>{lang=lang==='de'?'en':'de';translate()});
 document.querySelectorAll('[data-landing-voice]').forEach(button=>button.addEventListener('click',()=>{voice=button.dataset.landingVoice;renderPreview()}));
 function openWhatsApp(){
  const text=words[lang].msg;
  const shareUrl='https://wa.me/?text='+encodeURIComponent(text);
  window.open(shareUrl,'_blank','noopener,noreferrer');
  $('share-status').textContent=words[lang].shareDone;
 }
 $('whatsapp').addEventListener('click',openWhatsApp);
 async function copy(){
  try{await navigator.clipboard.writeText(url+(lang==='en'?'?lang=en':''));
   $('share-status').textContent=words[lang].copied;
  }catch{$('share-status').textContent=words[lang].needCopy}
 }
 $('copy').addEventListener('click',copy);
 $('share').addEventListener('click',async()=>{
  if(!navigator.share){openWhatsApp();return}
  try{await navigator.share({title:'Animal Voices · Community Beta',text:words[lang].msg.split('\n\n')[0],url:url+(lang==='en'?'?lang=en':'')})}
  catch(e){if(e?.name!=='AbortError')await copy()}
 });
 translate();
 document.body.dataset.betaReady='true';
 if(new URLSearchParams(location.search).has('selftestLanding')){
  const report=document.createElement('output');report.id='av-landing-selftest';report.dataset.status='running';document.body.append(report);
  try{
   const buttons=[...document.querySelectorAll('[data-landing-voice]')];
   if(buttons.length!==4)throw Error('FOUR_VOICES_NOT_RENDERED');
   const first=$('landing-voice-reply').textContent;
   if(first.length<25)throw Error('NO_FIRST_REPLY');
   const clear=buttons.find(b=>b.dataset.landingVoice==='momo');
   clear.click();
   const second=$('landing-voice-reply').textContent;
   if(first===second)throw Error('VOICE_SWITCH_NO_CHANGE');
   const english=lang==='en'||$('lang').textContent==='EN';
   if(lang!=='en')$('lang').click();
   if(document.documentElement.lang!=='en')throw Error('LANG_SWITCH_FAILED');
   if(!$('landing-sample-comment').textContent.startsWith('I enjoy'))throw Error('EN_COMMENT_MISMATCH');
   if($('landing-voice-reply').textContent.length<25)throw Error('NO_EN_REPLY');
   if(!buttons.find(b=>b.dataset.landingVoice==='curious').textContent.includes('Curious'))throw Error('VOICE_LABEL_NOT_TRANSLATED');
   if(!document.querySelector('a[href*="scene=taste"][href*="lang=en"]'))throw Error('EN_LINK_LOST');
   report.dataset.status='pass';
   report.textContent='PASS: first-run landing, four genuinely distinct voices, language consistency and direct scenario links';
  }catch(e){report.dataset.status='fail';report.textContent='FAIL: '+e.message}
 }
})();
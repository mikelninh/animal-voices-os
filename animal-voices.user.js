// ==UserScript==
// @name         Animal Voices · Instagram Companion
// @namespace    https://animal-voices-os.vercel.app/
// @version      0.2.0
// @description  Einen Instagram-Kommentar auswählen, vorab geprüften Antwortvorschlag ansehen und selbst freigeben. Keine Veröffentlichung durch das Skript.
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://animal-voices-os.vercel.app/animal-voices.user.js
// @updateURL    https://animal-voices-os.vercel.app/animal-voices.user.js
// ==/UserScript==
/* © 2026 Animal Voices. Works on Instagram's browser website, NOT in the native Instagram app.
 * No request, tracking, tokens, screenshots, account scraping, or automatic post.
 * The verified source capsules below were manually checked against primary sites on 2026-11-10.
 */
(function(root){
'use strict';
const VERSION='0.2.0';
const REVIEWED_AT='2026-11-10';
const OWID='https://ourworldindata.org/land-use-diets';
const DGE='https://www.dge.de/gesunde-ernaehrung/faq/faqs-vegane-ernaehrung';
const POSITION='https://www.dge.de/wissenschaft/stellungnahmen-und-positionspapiere/positionen/neubewertung-der-position-zu-veganer-ernaehrung/';
const NIH='https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/';
const EU='https://eur-lex.europa.eu/eli/treaty/tfeu_2016/art_13/oj/deu';
const TOPICS={
 forest:{
  name:'Soja & Regenwald',
  patterns:[/regenwald|amazonas|waldabholz|entwald|abholzung|abgeholzt|rodung|gerodet|deforest|rainforest|amazon forest/i],
  answer:{
   de:'Die Sorge um Abholzung ist berechtigt. Aber viel Soja wird zu Tierfutter verarbeitet, während nur ein kleinerer Teil direkt für Lebensmittel wie Tofu verwendet wird. Für einen fairen Vergleich müssen wir die Futtermittel mitrechnen.',
   en:'Deforestation linked to soy is a real concern. But a large share of soy is processed into animal feed, while a much smaller share goes directly to foods like tofu. A fair comparison must include feed crops.'
  },
  summary:'Our World in Data: ein Großteil der Sojaverwendung hängt mit Tierfutter und Ölproduktion zusammen; rund 7 % werden direkt für Lebensmittel wie Tofu und Sojamilch verwendet. Produktions- und Lieferketten variieren.',
  sources:[{name:'Our World in Data · Soja, Futter & Fläche',url:OWID}],
  limitation:'Historische globale Daten belegen nicht die Herkunft jedes einzelnen Tofu- oder Futtermittelprodukts.'
 },
 crop:{
  name:'Erntetode & Landnutzung',
  patterns:[/erntetod|bei der ernte|ernte.*tier|feldm[aä]us|feldtier|crop deaths|field mice|harvest.*animal|pesticid|pestizid/i],
  answer:{
   de:'Ja, auch beim Pflanzenanbau können Tiere verletzt oder getötet werden. Das sollten wir ernst nehmen. Tierhaltung benötigt aber zusätzlich große Flächen und Futterpflanzen. Weniger tierische Produkte können Landnutzung reduzieren – ohne zu behaupten, dass Pflanzenbau schadenfrei wäre.',
   en:'Yes, growing crops can also harm or kill animals. That matters. But animal farming uses additional land and feed crops. Reducing animal products can lower land demand without pretending that crop farming is harmless.'
  },
  summary:'Our World in Data: globale Ernährungsmodelle zeigen bei stärker pflanzlicher Ernährung deutlich weniger landwirtschaftlichen Flächenbedarf.',
  sources:[{name:'Our World in Data · Flächenbedarf',url:OWID}],
  limitation:'Die Quelle zählt keine Erntetode. Aus geringerem Flächenbedarf lässt sich keine genaue Zahl vermiedener Tieropfer ableiten.'
 },
 protein:{
  name:'Pflanzliches Protein',
  patterns:[/protein|eiwei[sß]|amino|muskeln|muskelaufbau|protein deficiency|plant protein/i],
  answer:{
   de:'Auch pflanzlich lässt sich der Proteinbedarf decken. Hülsenfrüchte, Sojaprodukte und Getreide ergänzen sich in der Aminosäureversorgung. Entscheidend sind eine abwechslungsreiche Auswahl, genügend Energie und der individuelle Bedarf.',
   en:'You can meet your protein needs with plant foods. Legumes, soy foods and grains can complement one another in amino acids. Variety, sufficient overall intake and individual needs still matter.'
  },
  summary:'DGE, FAQ 3.7: pflanzliche Proteine unterscheiden sich in ihrem Aminosäurenprofil; durch vielseitige Auswahl, Kombination und genug Energie kann der Proteinbedarf gedeckt werden.',
  sources:[{name:'DGE · Protein bei veganer Ernährung (3.7)',url:DGE}],
  limitation:'Keine pauschale Aussage über individuelle Kraftzuwächse, Supplementierungsdosen oder besondere Bedürfnisse von Kindern.'
 },
 b12:{
  name:'Vitamin B12',
  patterns:[/vitamin\s*b.?12|\bb12\b|cobalamin|supplement/i],
  answer:{
   de:'Ja, bei veganer Ernährung muss Vitamin B12 zuverlässig ergänzt werden. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene dennoch für gesundheitsfördernd möglich – wenn auch weitere kritische Nährstoffe ausreichend gedeckt sind.',
   en:'Yes, vitamin B12 needs reliable supplementation on a vegan diet. Germany’s nutrition society says a well-planned vegan diet can still support health in healthy adults, provided other critical nutrients are covered.'
  },
  summary:'DGE 2024: gut geplante vegane Ernährung kann für gesunde Erwachsene gesundheitsfördernd sein; B12-Präparat ist erforderlich.',
  sources:[{name:'DGE · Vegane Ernährung (2024)',url:POSITION},{name:'DGE · FAQ B12 & Nährstoffe',url:DGE}],
  limitation:'Keine individuelle Diagnose oder Einnahmeempfehlung; Sondergruppen (Kinder, Schwangerschaft, Erkrankungen) erfordern fachliche Einschätzung.'
 },
 b12dose:{
  name:'B12-Aufnahme & Präparate',
  patterns:[/b12.*(?:dos|dosis|hoch|aufnah|absorb)|(?:dos|dosis|aufnah).*b12|b12 overdose/i],
  answer:{
   de:'Die hohe Zahl auf dem B12-Präparat bedeutet nicht, dass der Körper alles aufnimmt: Bei höheren Einzeldosen sinkt die prozentuale Aufnahme deutlich. Welche Einnahme sinnvoll ist, hängt von der individuellen Versorgung ab.',
   en:'A high B12 dose on a label doesn’t mean your body absorbs all of it. The percentage absorbed falls at higher single doses. Appropriate supplementation depends on individual circumstances.'
  },
  summary:'NIH Office of Dietary Supplements: die prozentuale Aufnahme von B12 nimmt bei hohen Einzeldosen ab; beispielsweise werden bei 500 µg rund 2 % absorbiert.',
  sources:[{name:'NIH · Vitamin B12, Bioverfügbarkeit',url:NIH}],
  limitation:'Keine persönliche Dosierung oder Entwarnung bei Verdacht auf Mangel; ärztliche Beratung ist bei konkreten Gesundheitsfragen sinnvoll.'
 },
 sentience:{
  name:'Tiere als fühlende Wesen',
  patterns:[/tiere.*f[uü]hl|tiere.*leid|tiere.*schmerz|schweine.*f[uü]hl|animal sentience|animals feel pain|animals suffer/i],
  answer:{
   de:'Die EU erkennt Tiere ausdrücklich als fühlende Wesen an. Welche Verantwortung daraus folgt, ist eine ethische Frage – aber das Wohl der Tiere verdient in der Diskussion einen eigenen Platz.',
   en:'EU law recognises animals as sentient beings. What moral duties follow is an ethical question, but their welfare deserves to be taken seriously in the discussion.'
  },
  summary:'Art. 13 AEUV: die EU und Mitgliedstaaten tragen dem Wohlergehen von Tieren als fühlenden Wesen bei verschiedenen Politikbereichen Rechnung.',
  sources:[{name:'EUR-Lex · Artikel 13 AEUV',url:EU}],
  limitation:'EU-Recht belegt die rechtliche Anerkennung, nicht die subjektiven Erfahrungen jedes einzelnen Tiers oder eine bestimmte ethische Schlussfolgerung.'
 }
};
const VOICES={
 momo:{label:'Klar',subtitle:'Fakten, ohne Vorträge',emoji:'✦'},
 kiki:{label:'Warm',subtitle:'Erst verstehen',emoji:'♡'},
 bao:{label:'Locker',subtitle:'Leicht, aber respektvoll',emoji:'☀'},
 curious:{label:'Neugierig',subtitle:'Mit einer Frage öffnen',emoji:'?'}
};
const VARIANTS={
 forest:{
  kiki:{de:'Ich verstehe die Sorge um den Regenwald. Entwaldung durch Soja ist ein echtes Problem. Gerade deshalb lohnt es sich zu fragen, wie viel Soja als Tierfutter endet – und wie wenig direkt in Tofu oder Pflanzendrinks.',en:'I get the concern about rainforests. Soy-linked deforestation is a real problem. That is why it matters how much soy goes to animal feed versus directly into foods like tofu.'},
  bao:{de:'Beim Soja lohnt sich ein Blick hinter die Kulissen: Der Tofu ist nicht der einzige Kunde. Ein großer Teil wird fürs Tierfutter genutzt. Darum sollten wir beim Regenwaldvergleich auch das Futter mit auf die Rechnung nehmen.',en:'Soy has more customers than tofu makers. A large share goes into animal feed. So if we are comparing rainforest impacts, we have to count the soy used to feed animals too.'},
  curious:{de:'Würdest du bei der Regenwaldfrage auch das Soja mitzählen, das als Tierfutter verwendet wird? Ein großer Teil der Sojaernte geht in diesen Bereich – nicht direkt in pflanzliche Lebensmittel.',en:'When comparing rainforest impacts, would you also count the soy used as animal feed? A large share goes there rather than directly into plant-based foods.'}
 },
 crop:{
  kiki:{de:'Dass bei der Ernte Tiere sterben können, finde ich ebenfalls wichtig. Vegan bedeutet leider nicht schadenfrei. Der Gedanke ist, vermeidbaren Schaden zu verringern – auch indem wir weniger Flächen für Tiere und ihr Futter brauchen.',en:'Animals harmed during harvest matter too. Eating plant-based does not mean causing zero harm. The aim is to reduce avoidable harm, including by reducing the land needed for livestock and feed.'},
  bao:{de:'Fairer Punkt: Ein Salat ist kein magisch tierfreies Universum. Aber Tierhaltung braucht zusätzlich Futter und Fläche. Die ehrliche Frage ist also nicht „null Schaden?“, sondern „wie können wir weniger Schaden verursachen?“',en:'Fair point: a salad is not magically harm-free. But raising animals also takes feed and land. The more useful question is not “zero harm?” but “how do we reduce harm?”'},
  curious:{de:'Was wäre für dich der faire Maßstab: überhaupt keine Schäden oder möglichst wenige vermeidbare Schäden? Beim Vergleich sollten wir auch die Flächen und Futterpflanzen der Tierhaltung mitzählen.',en:'What seems a fair standard to you: zero harm, or as little avoidable harm as possible? A comparison should count the land and feed crops used for livestock too.'}
 },
 protein:{
  kiki:{de:'Gerade bei Sport und Ernährung ist die Proteinfrage verständlich. Du musst deinen Bedarf nicht dem Zufall überlassen: Linsen, Bohnen, Tofu und andere passende Lebensmittel können ihn bei guter Planung auch pflanzlich decken.',en:'Protein is a fair concern, especially if you train. You do not have to leave it to chance: legumes, tofu and other suitable foods can meet protein needs with good planning.'},
  bao:{de:'Die Muskeln brauchen Protein, keine Mitgliedskarte im Steakclub. 😉 Auch Linsen, Tofu, Bohnen und Co. liefern welches. Entscheidend ist, wie viel du insgesamt isst und ob die Auswahl zu deinem Bedarf passt.',en:'Muscles need protein, not a steak-club membership. 😉 Lentils, tofu and beans provide it too. What matters is sufficient intake and choosing foods that fit your needs.'},
  curious:{de:'Geht es dir um normalen Alltag oder um Krafttraining? Auch mit Hülsenfrüchten, Sojaprodukten und Getreide lässt sich Protein decken – die sinnvolle Menge hängt aber vom persönlichen Bedarf ab.',en:'Are you asking about everyday nutrition or strength training? Legumes, soy foods and grains can provide protein, but the right total depends on individual needs.'}
 },
 b12:{
  kiki:{de:'Ja, B12 ist bei veganer Ernährung ein wichtiger Punkt – gut, dass du ihn ansprichst. Eine zuverlässige Ergänzung ist nötig. Mit guter Planung und Blick auf weitere kritische Nährstoffe kann die Ernährung für gesunde Erwachsene dennoch funktionieren.',en:'Yes, B12 is an important point for vegans. Reliable supplementation is necessary. With good planning and attention to other critical nutrients, a vegan diet can still support healthy adults.'},
  bao:{de:'Beim B12 gibt es keinen Trick: Wer vegan isst, sollte zuverlässig supplementieren. Die gute Nachricht ist, dass eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem gesundheitsfördernd sein kann – nicht ohne Nährstoffplanung.',en:'No magic trick with B12: vegans need reliable supplementation. The good news is that a well-planned vegan diet can still be healthy for adults, as long as other key nutrients are covered too.'},
  curious:{de:'Wäre es fair, vegane Ernährung danach zu beurteilen, ob sie mit sinnvoller Ergänzung alle wichtigen Nährstoffe liefert? B12 muss zuverlässig supplementiert werden; auch die übrige Versorgung sollte stimmen.',en:'Would you judge a vegan diet by whether it provides all needed nutrients with appropriate supplementation? B12 needs reliable supplementation, alongside attention to other key nutrients.'}
 },
 b12dose:{
  kiki:{de:'Die hohen B12-Zahlen auf Verpackungen können erst einmal seltsam wirken. Der Körper nimmt davon aber nicht alles auf; mit steigender Einzeldosis sinkt der aufgenommene Anteil. Welche Menge passt, ist eine individuelle Frage.',en:'Big B12 numbers on a label can look odd. Your body does not absorb all of it; the percentage absorbed falls as a single dose rises. The right approach depends on individual circumstances.'},
  bao:{de:'Die Prozentzahl auf dem B12-Etikett ist nicht gleich die Prozentzahl, die im Körper ankommt. Bei höheren Einzeldosen wird nur ein kleinerer Anteil aufgenommen. Deshalb bitte nicht allein von der Packungszahl auf die passende Dosierung schließen.',en:'The number printed on a B12 label is not the number your body absorbs. Higher single doses have a lower absorbed percentage, so the label alone does not determine a suitable dose.'},
  curious:{de:'Wusstest du, dass die B12-Aufnahme nicht proportional zur Dosis steigt? Der Körper nimmt bei hohen Einzeldosen prozentual weniger auf. Geht es dir um die Erklärung auf dem Etikett oder um eine persönliche Einnahmefrage?',en:'Did you know B12 absorption does not rise proportionally with the dose? Higher single doses have a lower percentage absorbed. Are you asking about the label, or about personal supplementation?' }
 },
 sentience:{
  kiki:{de:'Mir ist wichtig, dass wir Tiere nicht einfach ausblenden. Im EU-Recht werden sie als fühlende Wesen anerkannt. Welche Konsequenzen wir daraus ziehen, können wir respektvoll diskutieren – aber ihr Wohlergehen zählt.',en:'I think animal welfare deserves a place in the conversation. EU law recognises animals as sentient beings. We can respectfully debate what follows ethically, but their welfare matters.'},
  bao:{de:'Tiere sind keine bloßen Produkte auf vier Beinen. Die EU behandelt sie rechtlich als fühlende Wesen. Über unsere Verantwortung daraus lässt sich streiten – ihr Wohlergehen sollte dabei aber nicht unter den Tisch fallen.',en:'Animals are more than products on legs. EU law recognises them as sentient beings. We can disagree about our duties, but their welfare should not disappear from the discussion.'},
  curious:{de:'Wenn Tiere als fühlende Wesen anerkannt sind – wie sollte ihr Wohlergehen bei unseren Essensentscheidungen zählen? Das EU-Recht erkennt diese Eigenschaft an; die ethischen Konsequenzen müssen wir miteinander aushandeln.',en:'If animals are recognised as sentient beings, how should their welfare count in food choices? EU law acknowledges sentience; the ethical implications are still worth discussing.'}
 }
};
const REPLIES=['antworten','reply','respond','répondre','responder','rispondi'];
const SENSITIVE=/\b(schwanger|schwangerschaft|stillend|baby|babys|kind|kinder|kid|kids|children|minor|minderjaehr|minderjähr|pregnan|child|infant|stillen|medikament|diagnose|eating disorder|essst[oö]rung|suizid|suicide|kill yourself|t[oö]ten|threat|drohung)\b/i;
const PRIVATE=/(?:@[a-z0-9_.]{3,}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d()\s-]{8,}\d)/i;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
function classify(text){
 const s=norm(text);
 if(s.length<9)return {state:'unknown',reason:'Kommentar zu kurz oder nicht erkennbar.'};
 if(s.length>1400)return {state:'unknown',reason:'Mehrere Kommentare oder zu viel Kontext – bitte den genauen Kommentar wählen.'};
 if(SENSITIVE.test(s)||PRIVATE.test(s))return {state:'unsafe',reason:'Sensible oder private Angaben: kein automatischer Antwortvorschlag.'};
 const variants=Object.entries(TOPICS).filter(([id,v])=>v.patterns.some(p=>p.test(s)));
 if(variants.some(([id])=>id==='b12dose'))return {state:'reviewed',id:'b12dose'};
 if(variants.length===0)return {state:'unknown',reason:'Dazu haben wir noch keinen vorab geprüften Antworttext.'};
 if(variants.some(([id])=>id==='forest'))return {state:'reviewed',id:'forest'};
 if(variants.length>1)return {state:'unknown',reason:'Mehrere Themen erkannt. Der Kontext ist nicht eindeutig.'};
 return {state:'reviewed',id:variants[0][0]};
}
function language(text){
 const s=norm(text).toLowerCase();
 return /\b(what|why|how|but|does|isn't|don.t|is|are|crop|protein|animals|veganism|deforestation|soybeans|vitamin|from|with)\b/.test(s)&&
 !/\b(aber|warum|wie|doch|und|nicht|tiere|für|beim|denn|proteinbedarf)\b/.test(s)?'en':'de';
}
function suggest(text,voice='momo'){
 const result=classify(text);
 if(result.state!=='reviewed')return result;
 const t=TOPICS[result.id],lang=language(text);
 const id=Object.prototype.hasOwnProperty.call(VOICES,voice)?voice:'momo';
 const candidate=id==='momo'?t.answer[lang]:VARIANTS[result.id]?.[id]?.[lang];
 return {...result,topic:t.name,voice:id,voiceLabel:VOICES[id].label,
  text:candidate||t.answer[lang],sources:t.sources,summary:t.summary,limitation:t.limitation,reviewedAt:REVIEWED_AT};
}
function normalReplyLabel(s){return REPLIES.includes(norm(s).toLowerCase().replace(/[.!:]+$/,''));}
function cleanLine(s){
 return norm(s).replace(/^(?:\d+[smhdw]|\d+\s*(?:min|std|tag|tage|h|m))\s+/i,'')
  .replace(/^(?:gefällt mir|like|reply|antworten|übersetzung ansehen|see translation|view replies)\s*$/i,'');
}
function extractComment(rootEl,trigger){
 if(!rootEl)return '';
 const texts=[];
 const nodes=rootEl.querySelectorAll?rootEl.querySelectorAll('span[dir="auto"], span[dir="ltr"], p, [data-comment-text], h3'):[];
 for(const n of nodes){
  if(n.closest?.('[data-av-control]'))continue;
  if(n.children?.length&&Array.from(n.children).some(c=>c.matches?.('span[dir],p,[data-comment-text]')))continue;
  const txt=cleanLine(n.innerText||n.textContent||'');
  if(txt.length<11||txt.length>1400||normalReplyLabel(txt))continue;
  if(/^(?:\d+[smhdw]|gefällt mir|like|view replies|antworten|reply|see translation)$/i.test(txt))continue;
  if(!texts.includes(txt))texts.push(txt);
 }
 if(texts.length===1)return texts[0];
 if(texts.length>1){
  // Prefer a single substantive span rather than concatenating unrelated thread contents.
  return texts.filter(t=>t.split(/\s+/).length>=3).sort((a,b)=>b.length-a.length)[0]||texts[0];
 }
 let fallback=norm(rootEl.innerText||rootEl.textContent||'').replace(/\b(Reply|Antworten|Like|Gefällt mir|See translation|Übersetzung ansehen)\b/gi,' ').trim();
 return fallback.length<=450?fallback:'';
}
function nearestCommentRoot(node){
 let curr=node;
 for(let i=0;curr&&i<11;i++,curr=curr.parentElement){
  if(curr.matches?.('li,[role="listitem"],[data-av-demo-comment]')){
   const text=norm(curr.innerText||curr.textContent||'');
   if(text.length>=12&&text.length<=2200)return curr;
  }
 }
 // Fallback when Instagram does not use list items.
 curr=node;
 for(let i=0;curr&&i<8;i++,curr=curr.parentElement){
  if(curr===document.body||curr===document.documentElement)break;
  const text=norm(curr.innerText||curr.textContent||'');
  if(text.length>=24&&text.length<=700&&curr.querySelector?.('span[dir],p,[data-comment-text]'))return curr;
 }
 return null;
}
const API={VERSION,REVIEWED_AT,TOPICS,VOICES,VARIANTS,classify,suggest,language,normalReplyLabel,extractComment};
if(typeof module==='object'&&module.exports)module.exports=API;
if(!root?.document||!root?.location)return;
const demo=root.location.pathname.startsWith('/instagram-demo');
if(!demo&&!/^\/?(?:www\.)?instagram\.com$/i.test(root.location.hostname))return;
if(root.__AV_INSTAGRAM_ACTIVE__)return;
root.__AV_INSTAGRAM_ACTIVE__=true;
const doc=root.document,seen=new WeakSet();
let selected=null,replyTrigger=null,sheet=null,overlayRoot=null,pickMode=false,observer=null,scanTimer=0;
const make=(tag,props={},txt)=>{
 const el=doc.createElement(tag);
 for(const [k,v] of Object.entries(props)){
  if(k==='class')el.className=v;
  else if(k==='type')el.type=v;
  else if(k==='role')el.setAttribute(k,v);
  else if(k==='aria-label')el.setAttribute(k,v);
 }
 if(txt!==undefined)el.textContent=txt;
 return el;
};
function safeFill(composer,text){
 if(!composer||!text)return false;
 try{
  composer.focus();
  if(composer.matches?.('textarea,input')){
   const proto=composer.tagName==='TEXTAREA'?root.HTMLTextAreaElement?.prototype:root.HTMLInputElement?.prototype;
   const setter=proto&&Object.getOwnPropertyDescriptor(proto,'value')?.set;
   if(setter)setter.call(composer,text);else composer.value=text;
   composer.dispatchEvent(new root.Event('input',{bubbles:true}));
   composer.dispatchEvent(new root.Event('change',{bubbles:true}));
   return norm(composer.value)===norm(text);
  }
  if(composer.matches?.('[contenteditable="true"]')){
   // App-specific React/Meta editors can reject synthetic input. Do not force a submit.
   const selection=root.getSelection?.(),range=doc.createRange?.();
   if(selection&&range){range.selectNodeContents(composer);range.collapse(false);selection.removeAllRanges();selection.addRange(range);}
   if(doc.execCommand?.('insertText',false,text)){
    composer.dispatchEvent(new root.Event('input',{bubbles:true}));
    if(norm(composer.innerText||composer.textContent)===norm(text))return true;
   }
  }
 }catch{}
 return false;
}
function visible(node){
 if(!node||!node.isConnected)return false;
 const rect=node.getBoundingClientRect?.();
 return !!rect&&rect.width>0&&rect.height>0;
}
function findComposer(from){
 const candidates=Array.from(doc.querySelectorAll('textarea,[contenteditable="true"],input[placeholder],[role="textbox"]'))
  .filter(n=>{
   if(!visible(n)||n.closest?.('[data-av-control]'))return false;
   const hint=[n.getAttribute?.('placeholder'),n.getAttribute?.('aria-label'),n.getAttribute?.('aria-placeholder'),n.getAttribute?.('data-placeholder')].join(' ');
   const inComment=!!from&&from.contains?.(n);
   // Never insert into search, chat or caption editors just because they are the only input visible.
   return inComment||/add a comment|comment|kommentar|antwort|reply|antwort hinzuf/i.test(hint);
  });
 if(!candidates.length)return null;
 const active=doc.activeElement;
 if(active&&candidates.includes(active))return active;
 if(from){
  const inRoot=candidates.find(n=>from.contains?.(n));
  if(inRoot)return inRoot;
 }
 return candidates.length===1?candidates[0]:null;
}
function chooseComment(node,trigger){
 if(sheet)closePanel();
 const rootEl=nearestCommentRoot(node)||node.closest?.('[data-av-demo-comment]')||node;
 const txt=extractComment(rootEl,trigger);
 selected={root:rootEl,text:txt};replyTrigger=trigger||null;
 pickMode=false;showPanel();
}
function closePanel(){
 sheet?.remove();
 // Also clear leftover backdrops from the previous userscript version, if any.
 doc.querySelectorAll('.av-shade').forEach(el=>el.remove());
 sheet=null;overlayRoot=null;selected=null;replyTrigger=null;
}
function toast(message){
 doc.getElementById('av-toast')?.remove();
 const el=make('div',{},message);
 el.id='av-toast';el.setAttribute('role','status');el.setAttribute('data-av-control','1');
 el.style.cssText='position:fixed;top:calc(14px + env(safe-area-inset-top));left:12px;right:12px;max-width:500px;margin:0 auto;z-index:2147483604;padding:13px 17px;border-radius:12px;background:#245b3b;color:white;box-shadow:0 6px 21px #122f2355;text-align:center;font:600 13px/1.45 system-ui;pointer-events:none';
 doc.body.append(el);
 root.setTimeout(()=>{if(el.isConnected)el.remove()},4500);
}
function showPanel(){
 if(!selected)return;
 const host=make('section',{class:'av-panel','data-av-control':''});host.setAttribute('data-av-control','1');host.setAttribute('role','dialog');host.setAttribute('aria-modal','false');host.setAttribute('aria-label','Animal Voices Antwortvorschlag');
 host.style.cssText='position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));max-width:540px;margin:0 auto;z-index:2147483602;display:block;padding:0;box-sizing:border-box;color:#234c32';
 const shadow=host.attachShadow({mode:'open'});
 shadow.innerHTML=`<style>
 :host{all:initial;font:14px/1.48 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#203b2b}
 *,*:before,*:after{box-sizing:border-box}
 .sheet{background:#fbfdf8;border:1px solid #c5ddc9;border-radius:20px;box-shadow:0 6px 34px #122f2344;max-height:min(83dvh,720px);overflow-y:auto;overscroll-behavior:contain;padding:16px}
 header{display:flex;align-items:center;justify-content:space-between;gap:10px}
 h2{font-size:18px;margin:5px 0;color:#204732}
 .title{font-size:14px;font-weight:800;color:#286341}
 .desc{font-size:11px;color:#708873;margin:4px 0 10px}
 button{font:inherit;cursor:pointer;border:0;border-radius:11px}
 button:focus-visible,textarea:focus-visible,a:focus-visible{outline:3px solid #75aa78;outline-offset:3px}
 .x{background:#edf3e8;color:#426d4c;padding:8px 12px;font-size:16px}
 .label{font-size:11px;font-weight:800;color:#597460;margin:13px 0 5px;display:block}
 textarea{resize:vertical;width:100%;border-radius:12px;border:1px solid #d6e3d5;padding:12px;font:14px/1.52 system-ui,sans-serif;color:#254a34;background:white;min-height:63px}
 #av-proposal{min-height:94px;font-size:15px;background:#f1f7ed}
 .pill{border-radius:40px;background:#e3f2df;color:#2f7442;padding:5px 9px;font-size:10px;font-weight:800}
 .unverified{background:#fff0d8;color:#935f2b}
 .row{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
 .micro{font-size:11px;color:#6f876f;margin:7px 0;line-height:1.5}
 a{color:#316c48;overflow-wrap:anywhere}
 details{border-top:1px solid #e1eadb;padding:10px 0;margin:12px 0}
 summary{font-size:12px;color:#3e7150;font-weight:760;cursor:pointer}
 .source{padding-top:5px}
 .actions{display:flex;gap:9px;margin-top:12px;position:sticky;bottom:-16px;background:#fbfdf8;padding:13px 0 16px}
 .primary{background:#22583c;color:white;font-weight:800;padding:13px 14px;flex:1;min-height:48px}
 .secondary{background:#e8f2e4;color:#336543;font-weight:720;padding:12px;min-height:48px}
 .status{margin:9px 0 0;font-size:12px;color:#406f4b;font-weight:650}
 .alert{color:#995b32;background:#fff4e3;padding:11px;border-radius:9px}
 .small{font-size:10px}
 .voices{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0 7px}
 .voices button{min-width:0;min-height:45px;padding:8px 2px;color:#477258;background:#eaf4e8;border:1px solid #d6e6d3;border-radius:11px;font-weight:780;font-size:11px;line-height:1.3}
 .voices button[aria-pressed="true"]{color:white;background:#286244;border-color:#286244}
 .voice-hint{font-size:11px;color:#819887;margin:2px 0 8px}
 .alt{border:0;background:none;color:#477455;font-size:11px;font-weight:800;text-decoration:underline;text-underline-offset:3px;padding:7px 0}
 button:disabled{opacity:.45;cursor:not-allowed}
 .x{min-width:44px;min-height:44px}
 </style>
 <div class="sheet">
 <header><div><div class="title">✳ Animal Voices</div><div class="desc">Direkt auf Instagram · du entscheidest</div></div><button class="x" id="av-close" aria-label="Schließen">×</button></header>
 <label class="label" for="av-comment">Ausgewählter Kommentar · bitte bestätigen</label>
 <textarea id="av-comment" rows="2" maxlength="1400"></textarea>
 <div class="row" style="margin-top:11px"><strong style="font-size:12px">Antwortvorschlag</strong><span class="pill" id="av-status-pill">Wird geprüft</span></div>
 <p class="micro" id="av-topic"></p>
 <div class="voices" role="group" aria-label="Antwortstimme wählen">
  <button type="button" data-av-voice="momo" aria-pressed="true">✦ Klar</button>
  <button type="button" data-av-voice="kiki" aria-pressed="false">♡ Warm</button>
  <button type="button" data-av-voice="bao" aria-pressed="false">☀ Locker</button>
  <button type="button" data-av-voice="curious" aria-pressed="false">? Neugierig</button>
 </div>
 <div class="row"><span class="voice-hint" id="av-voice-hint">Momo · Klar und faktenorientiert</span><button type="button" id="av-next-voice" class="alt">Andere Antwort ↻</button></div>
 <textarea id="av-proposal" rows="3" maxlength="1200" placeholder="Für diese Frage liegt noch keine vorab geprüfte Antwort vor."></textarea>
 <details id="av-evidence" open><summary>Vorab geprüfte Aussage & Quellen ansehen</summary><div id="av-sources"></div></details>
 <p class="micro" id="av-hint">Keine automatische Veröffentlichung. Deine Übernahme ist immer freiwillig.</p>
 <div class="actions"><button class="secondary" id="av-copy">Kopieren</button><button class="primary" id="av-insert">Antwort übernehmen ↗</button></div>
 <p class="status" role="status" aria-live="polite" id="av-feedback"></p>
 </div>`;
 doc.body.append(host);
 sheet=host;overlayRoot=shadow;
 const box=shadow.getElementById('av-comment'),proposal=shadow.getElementById('av-proposal'),feedback=shadow.getElementById('av-feedback');
 let proposalModified=false,currentVoice='momo';
 box.value=selected.text;
 shadow.getElementById('av-close').addEventListener('click',closePanel);
 function update(){
  proposalModified=false;
  const result=suggest(box.value,currentVoice),pill=shadow.getElementById('av-status-pill'),src=shadow.getElementById('av-sources');
  src.replaceChildren();feedback.textContent='';
  shadow.querySelectorAll('[data-av-voice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.avVoice===currentVoice)));
  const descriptions={momo:'Momo · Fakten & Klarheit',kiki:'Kiki · Warm & zugewandt',bao:'Bao · Locker & sympathisch',curious:'Neugier · Eine offene Frage'};
  shadow.getElementById('av-voice-hint').textContent=descriptions[currentVoice]+' · 4 unterschiedliche Antworten';
  if(result.state==='reviewed'){
   pill.textContent='✓ Aussage vorab geprüft';pill.className='pill';
   shadow.getElementById('av-topic').textContent=result.topic+' · Quellenstand '+result.reviewedAt+' · kein Live-Check des Kommentars';
   proposal.value=result.text;proposal.readOnly=false;
   const p=make('p',{},result.summary);p.className='micro';src.append(p);
   for(const ref of result.sources){const a=make('a',{},ref.name+' ↗');a.href=ref.url;a.target='_blank';a.rel='noopener noreferrer';a.className='source';src.append(a,make('div'))}
   const lim=make('p',{},'Grenze: '+result.limitation);lim.className='micro';src.append(lim);
   shadow.getElementById('av-evidence').open=false;
  }else{
   pill.textContent='Nicht vorab geprüft';pill.className='pill unverified';
   shadow.getElementById('av-topic').textContent=result.reason;
   proposal.value='';proposal.readOnly=true;
   const p=make('p',{},'Zu diesem konkreten Kommentar liegt noch keine verlässlich belegte Antwortvorlage vor. Nicht raten – Kontext und Quellen müssen zuerst geprüft werden.');p.className='micro alert';src.append(p);
   shadow.getElementById('av-evidence').open=true;
  }
  shadow.getElementById('av-copy').disabled=result.state!=='reviewed';
  shadow.getElementById('av-insert').disabled=result.state!=='reviewed';
  selected.suggestion=result;
 }
 box.addEventListener('input',update);
 shadow.querySelectorAll('[data-av-voice]').forEach(button=>button.addEventListener('click',()=>{
  if(currentVoice===button.dataset.avVoice)return;
  currentVoice=button.dataset.avVoice;update();
 }));
 shadow.getElementById('av-next-voice').addEventListener('click',()=>{
  const ids=Object.keys(VOICES);
  currentVoice=ids[(ids.indexOf(currentVoice)+1)%ids.length];update();
 });
 proposal.addEventListener('input',()=>{
  if(selected?.suggestion?.state!=='reviewed')return;
  proposalModified=true;
  const pill=shadow.getElementById('av-status-pill');
  pill.textContent='Entwurf verändert · nicht vorab geprüft';pill.className='pill unverified';
  feedback.textContent='Du hast die geprüfte Vorlage verändert. Bitte neue Tatsachenbehauptungen selbst belegen. Veröffentlicht wird nichts automatisch.';
 });
 update();
 async function copy(){
  if(selected?.suggestion?.state!=='reviewed')return false;
  const text=norm(proposal.value);
  if(!text){feedback.textContent='Bitte zuerst einen Antworttext eintragen.';return false;}
  try{await root.navigator.clipboard.writeText(text);closePanel();toast('Antwort kopiert. Jetzt direkt in Instagram einfügen und selbst senden.');return true}
  catch{proposal.focus();proposal.select();feedback.textContent='Text markiert. Wähle „Kopieren“ über das Textmenü.';return false}
 }
 shadow.getElementById('av-copy').addEventListener('click',copy);
 shadow.getElementById('av-insert').addEventListener('click',async()=>{
  if(selected?.suggestion?.state!=='reviewed')return;
  const text=norm(proposal.value),origin=selected.root,trigger=replyTrigger,comment=box.value;
  if(!text)return;
  // Request clipboard write during the user's tap before any timers or focus changes.
  let copied=false;
  const clipboardTask=root.navigator.clipboard?.writeText
   ? Promise.resolve().then(()=>root.navigator.clipboard.writeText(text)).then(()=>{copied=true},()=>{})
   : Promise.resolve();
  // Immediate handoff: remove all Animal Voices UI so Instagram is interactive.
  closePanel();
  if(trigger?.isConnected){try{trigger.click()}catch{}}
  // React may mount the correct input after its Reply action.
  let input=null,inserted=false;
  for(let attempt=0;attempt<5;attempt++){
   await new Promise(resolve=>root.setTimeout(resolve,100+attempt*55));
   input=findComposer(origin);
   if(input&&safeFill(input,text)){inserted=true;break}
  }
  await clipboardTask;
  if(inserted){
   try{input.focus();input.scrollIntoView({block:'nearest',behavior:'smooth'})}catch{}
   toast('✓ Antwort übernommen. Jetzt in Instagram prüfen und selbst absenden.');
   return;
  }
  if(copied){
   toast('Antwort kopiert. Direkt in Instagram einfügen und selbst absenden.');
   return;
  }
  // The browser refused clipboard AND the composer was unavailable. Preserve
  // the draft for manual copying instead of silently dropping the user action.
  selected={root:origin,text:comment};replyTrigger=trigger;
  showPanel();
  const field=sheet?.shadowRoot?.getElementById('av-proposal');
  if(field){field.value=text;field.focus();field.select()}
  toast('Einfügen blockiert. Text ist markiert – bitte selbst kopieren.');
 });
}
function installDock(){
 const dock=make('button',{type:'button','aria-label':'Animal Voices: Kommentar auswählen'},'✳');
 dock.id='av-launcher';dock.setAttribute('data-av-control','1');
 dock.style.cssText='position:fixed;right:14px;bottom:calc(78px + env(safe-area-inset-bottom));z-index:2147483600;width:46px;height:46px;border-radius:50%;border:2px solid white;background:#286342;color:white;font:26px system-ui;box-shadow:0 4px 15px #193d2e55;cursor:pointer';
 const tip=make('div',{class:'av-pick-hint'},'Tippe jetzt auf einen Kommentar');
 tip.setAttribute('data-av-control','1');
 tip.style.cssText='position:fixed;bottom:calc(131px + env(safe-area-inset-bottom));right:12px;padding:8px 12px;max-width:230px;border-radius:12px;background:#285c40;color:white;box-shadow:0 5px 20px #162e2850;z-index:2147483599;font:600 12px system-ui;display:none';
 doc.body.append(tip);
 dock.addEventListener('click',()=>{
  pickMode=!pickMode;tip.style.display=pickMode?'block':'none';
  dock.textContent=pickMode?'✓':'✳';
  dock.setAttribute('aria-label',pickMode?'Animal Voices: Tippe jetzt auf einen Kommentar':'Animal Voices: Kommentar auswählen');
  dock.title=pickMode?'Tippe auf einen sichtbaren Kommentar':'Animal Voices';
 });
 doc.body.append(dock);
 doc.addEventListener('click',e=>{
  if(!pickMode||e.target.closest?.('[data-av-control]')||sheet?.contains(e.target))return;
  const n=e.target,comment=nearestCommentRoot(n);
  // Prefer the nearest legible comment span when layouts lack listitem.
  const selectedNode=comment||n.closest?.('span[dir],p,[data-comment-text]');
  if(!selectedNode)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
  dock.textContent='✳';tip.style.display='none';chooseComment(selectedNode,null);
 },true);
}
function scan(){
 if(!doc.body)return;
 const buttons=Array.from(doc.querySelectorAll('button,[role="button"],span')).slice(0,1800);
 let n=0;
 for(const native of buttons){
  if(n>=30)break;
  if(seen.has(native)||!normalReplyLabel(native.textContent||''))continue;
  if(native.tagName==='SPAN'&&native.closest('button,[role="button"]'))continue;
  if(native.closest?.('[data-av-control]'))continue;
  const rootEl=nearestCommentRoot(native);
  if(!rootEl||!visible(native)){continue}
  seen.add(native);n++;
  const control=make('button',{type:'button','aria-label':'Mit Animal Voices auf diesen Kommentar antworten'},'✳ Animal Voices');
  control.setAttribute('data-av-control','1');
  control.style.cssText='color:#2f7751;background:#ecf6e9;border:1px solid #d6e9d0;padding:5px 9px;border-radius:20px;font:600 11px system-ui;cursor:pointer;margin-inline-start:9px';
  control.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();chooseComment(rootEl,native);});
  native.insertAdjacentElement?.('afterend',control);
 }
}
function scheduleScan(){
 if(scanTimer)return;
 scanTimer=root.setTimeout(()=>{scanTimer=0;scan()},650);
}
function start(){
 if(!doc.body){root.setTimeout(start,250);return}
 installDock();scan();
 observer=new MutationObserver(scheduleScan);
 observer.observe(doc.body,{childList:true,subtree:true});
 root.addEventListener('pagehide',()=>{observer?.disconnect();if(scanTimer)root.clearTimeout(scanTimer)},{once:true});
}
start();
})(typeof window!=='undefined'?window:undefined);

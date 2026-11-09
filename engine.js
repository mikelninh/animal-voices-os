/* Animal Voices 0.9. Transparent, conservative retrieval and decision support.
 * This is NOT a trained LLM, a moderation authority, or a real-time fact checker.
 */
(function(root,factory){
 const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.AV_ENGINE=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const TOKENS={
  strength:['schwach','schwaech','weak','soyboy','keine muskeln','no muscle','keinen muskel','muskelkraft','muskeln aufbauen','muskelaufbau','strength','stärke','strong'],
  protein:['protein','eiwei','amino','proteins','proteinbedarf','protein deficiency'],
  b12:['b12','vitamin b12','supplement','nahrungsergänzung'],
  soy:['soja','soy','isoflav','testosteron','estrogen','östrogen','hormone'],
  crop:['ernte','maeuse','mäuse','maus','crop death','field mice','feldtier','harvest','pestizid'],
  forest:['regenwald','amazonas','abholz','deforest','soja anbau','soy forests'],
  climate:['klima','klimawandel','co2','co₂','landnutzung','agrarfläche','emission','planet'],
  sentience:['nutztiere fühlen','nutztiere schmerz','tiere fühlen','tiere haben keine gefühle','schweine fühlen','animal sentience','animals feel','schmerzempfind','leidensfähig'],
  nature:['andere tiere','tiere tiere','nahrungskette','löwen essen','löwe frisst','tiger fressen','in der natur','animals eat animals','raubtiere'],
  taste:['schmeckt','geschmack','lecker','taste','liebe fleisch','steak schmeckt'],
  cost:['teuer','kosten','budget','afford','expensive','price','armut','kann ich mir nicht leisten'],
  children:['babys','säugling','schwangerschaft','schwanger','stillen','pregnan','kleinkind','newborn','infant']
 };
 const WEIGHTS={strength:{schwach:4,'keine muskeln':7,'no muscle':7,'keinen muskel':7},soy:{testosteron:6,soja:3},protein:{protein:6,eiwei:6},b12:{b12:10},forest:{regenwald:6,abholz:5},crop:{ernte:5,mäuse:6},climate:{klima:4,co2:5},nature:{nahrungskette:7},sentience:{'tiere fühlen':7},taste:{schmeckt:5},cost:{teuer:6},children:{babys:9}};
 const normalize=s=>String(s||'').toLocaleLowerCase('de').normalize('NFKC').replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/[‘’“”„]/g,'"').replace(/\s+/g,' ').trim();
 const safeWord=(v)=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function contains(haystack,needle){
   const n=normalize(needle), h=normalize(haystack);
   if(!n)return false;
   // Stronger word boundaries: avoid 'Verzicht' matching 'unverzichtbar' or 'vegane' matching 'veganer'.
   if(n.includes(' '))return h.includes(n);
   if(n.length>=7&&h.includes(n))return true; // German compounds: Testosteronspiegel, Eiweißbedarf
   const word=new RegExp('(^|[^a-z0-9])'+safeWord(n)+'(?=$|[^a-z0-9]|(?:n|en|er|e|s|em|ern)(?:[^a-z0-9]|$))','i');
   return word.test(h);
 }
 function context(text,explicit='auto'){
   const s=normalize(text);
   if(/ignore (all|previous) instructions|ignoriere.{0,24}(anweisung|instruktion)|system prompt|developer message|delete your memory|api key|poste hundert|exfiltrat/i.test(s))return {kind:'injection',note:'Unvertrauenswürdige Anweisung im Kommentar. Nicht ausführen.',block:true};
   // Severe intimidation wins over a superficially relevant nutrition claim.
   // Human decides whether to report; the tool never sends a platform report.
   if(/\b(ich schlage (dich|euch)(?: tot)?|ich (?:werde|will) (?:dich|euch|euch alle|alle veganer) (?:toeten|umbringen|abstechen|verletzen)|ich (?:weiss|kenne) wo du wohnst|ich finde dich schon|loesch dich|kill dich|i know where you live|i(?: will|'ll) (?:kill|stab|hurt) you)\b/.test(s))return {kind:'threat',note:'Mögliche Drohung oder Einschüchterung. Originalkontext prüfen und gegebenenfalls bei Instagram melden.',block:true};
   if(/\b(ich bin (?:[1-9]|1[0-7])(?: jahre? alt| years? old)?|i am (?:[1-9]|1[0-7])(?: years? old)?|i'm (?:[1-9]|1[0-7]))\b/.test(s))return {kind:'medical',note:'Mögliche Ernährungsfrage einer minderjährigen Person. Keine allgemeinen Supplementempfehlungen; fachlich prüfen.',block:true};
   if(/\b(baby|babys|saeugling|kleinkind|kinder|schwanger|schwangerschaft|stillen|pregnan|medikament|essstoerung|diagnose|ern(a|ae)hrungsstoerung)\b/.test(s))return {kind:'medical',note:'Medizinisch sensibles Thema: standardisierte Antworten zurückstellen, fachlich einordnen.',block:true};
   if(/\b(jemand sagt|jemand behauptet|leute sagen|mein freund sagt|someone said|someone says|people say|people claim|ich zitiere|ich widerspreche|wer sagt|ironie|sarkasmus|das stimmt nicht|es stimmt nicht|nicht wahr, dass|wer behauptet)\b/.test(s))return {kind:'quote',note:'Möglicherweise ein Zitat, eine Widerlegung oder Ironie. Bitte zuerst den Kontext prüfen.',block:true};
   if(/\b(veganer sind nicht schwach|vegane maenner sind nicht schwach|nicht schwach|kein beweis fuer|does not make.*weak)\b/.test(s))return {kind:'negated',note:'Die Aussage scheint ein Vorurteil zu widerlegen – nicht als eigene Falschinformation etikettieren.',block:true};
   if(/\b(ich werde dich toeten|ich bring dich um|kill yourself|i will kill you|ich verpruegel dich|i will hurt you)\b/.test(s))return {kind:'threat',note:'Mögliche Drohung. Bei akuter Gefahr Unterstützung holen, auf Plattform prüfen und gegebenenfalls melden.',block:true};
   if(/\b(tritt den veganern|schlagt die veganer|kill all vegans|toetet die veganer|verpruegelt die veganer)\b/.test(s))return {kind:'threat',note:'Mögliche Gewaltandrohung. Kontext prüfen und gegebenenfalls melden.',block:true};
   if(/\b(ihr veganer seid idioten|du bist ein idiot|halt maul|shut up vegan|stfu|loser|fresse halten)\b/.test(s))return {kind:'bait',note:'Persönliche Herabsetzung ohne erkennbare Sachfrage. Eine Antwort kann den Streit verstärken.',block:true};
   if(/\b(free followers|buy followers|crypto prize|krypto gewinn|dm for profit|gewinn versprochen)\b/.test(s))return {kind:'spam',note:'Möglicher Spam oder Betrugsversuch. Gegebenenfalls über Instagram melden.',block:true};
   if(explicit==='quote')return {kind:'quote',note:'Als Zitat markiert – nicht dem Verfasser als eigene Überzeugung zuordnen.',block:true};
   if(explicit==='irony')return {kind:'irony',note:'Ironie oder Sarkasmus. Erst die tatsächliche Aussage im Originalkontext klären.',block:true};
   if(explicit==='skeptic')return {kind:'skeptic',note:'Als skeptischer Einwand markiert. Zuerst die Sorge anerkennen, dann eine passende Quelle nennen.',block:false};
   if(explicit==='question')return {kind:'question',note:'Als echte Frage eingeordnet. Bei der Antwort behutsam formulieren.',block:false};
   if(/[?？]\s*$/.test(s)||/^(warum|wieso|wie |was |ist es|stimmt es|gibt es|kann man|aber warum|what|why|is it|can ).{6,}/.test(s))return {kind:'question',note:'Könnte eine ehrliche Frage sein. Verständnis vor Widerlegung.',block:false};
   return {kind:'claim',note:'Vermutlich eine Tatsachenbehauptung. Diese Einschätzung ist nicht sicher.',block:false};
 }
 function resolve(text,topics){
   const s=normalize(text), matches=[];
   for(const t of topics||[]){let score=0,signals=[];
     for(const k of TOKENS[t.id]||t.keywords||[]){if(contains(s,k)){let v=WEIGHTS[t.id]?.[k]||Math.min(4,Math.max(2,k.length/4));score+=v;signals.push(k)}}
     if(score>=3.5)matches.push({topic:t,score,signals});
   }
   matches.sort((a,b)=>b.score-a.score);
   if(!matches.length)return {topic:null,matches:[],reason:'Kein passendes Thema in der belegten Wissensbasis.'};
   if(matches[1]&&matches[0].score-matches[1].score<1.3)return {topic:null,matches:matches.slice(0,3),reason:'Mehrere Themen passen ähnlich gut; eine manuelle Zuordnung ist erforderlich.'};
   return {topic:matches[0].topic,matches:matches.slice(0,3),reason:'Vorläufige Themenzuordnung anhand erkennbarer Begriffe; menschliche Kontextprüfung erforderlich.'};
 }
 function evidence(topic,sourceMap){
   if(!topic)return {ready:false,sources:[],reason:'Unbekannte Behauptung; keine Quellenzuordnung.'};
   if(!Array.isArray(topic.sources)||!topic.sources.length||!topic.fact||!topic.limit)return {ready:false,sources:[],reason:'Die Faktenkarte enthält noch keine ausreichenden Belege oder Einschränkungen.'};
   const sources=topic.sources.map(id=>sourceMap.get(id));
   if(sources.some(s=>!s||!/^https:\/\/[^\s]+$/.test(s.url)||!s.name||!s.year||!s.note))return {ready:false,sources:sources.filter(Boolean),reason:'Ein Quellenbeleg ist unvollständig. Keine selbstsichere Antwort.'};
   return {ready:true,sources,reason:'Quellen vorhanden, aber nur redaktionell kuratiert – Originaltext und Aktualität müssen manuell geprüft werden.',review_status:'editorial_not_peer_reviewed',checked_at:null};
 }
 function decide(text,topics,sourceMap,explicit='auto'){
   const ctx=context(text,explicit),matched=ctx.block?{topic:null,matches:[],reason:ctx.note}:resolve(text,topics),ref=evidence(matched.topic,sourceMap);
   let action='save', reason='',hold=true;
   if(ctx.kind==='threat'||ctx.kind==='spam'){action='report';reason=ctx.note;}
   else if(ctx.kind==='bait'){action='ignore';reason=ctx.note;}
   else if(ctx.block){action='save';reason=ctx.note;}
   else if(ref.ready){action='reply';hold=false;reason='Belegtes Thema gefunden. ' + (ctx.kind==='question'?'Eine freundliche Antwort ist möglich. ':'Eine sachliche Einordnung könnte hilfreich sein. ')+'Vor Nutzung Originalquelle und Kontext persönlich prüfen.';}
   else{action='save';reason=ref.reason||matched.reason;}
   return {action,reason,hold,context:ctx.kind,context_note:ctx.note,topic:matched.topic,evidence:ref,alternatives:matched.matches.map(m=>({id:m.topic.id,label:m.topic.short,signals:m.signals})),method:'deterministic-local-v0.9',probability:null};
 }
 function groupIdeas(records){
   const counts=new Map();
   for(const r of records||[]){if(r.action!=='save')continue;
     const id=r.topicId||'unknown',key=id;
     const prev=counts.get(key)||{id,label:r.topicName||'Noch nicht eingeordnet',count:0,examples:[]};
     prev.count++;if(prev.examples.length<3&&r.idea)prev.examples.push(String(r.idea).slice(0,100));counts.set(key,prev);
   }
   return [...counts.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
 }
 return {normalize,contains,context,resolve,evidence,decide,groupIdeas};
});

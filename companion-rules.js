/* AV Companion v0.8 deterministic triage — not a moderation verdict */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.AV_COMPANION_RULES=api})(typeof window!=='undefined'?window:null,function(){
'use strict';
const ig=u=>{try{const x=new URL(String(u||'').trim());return x.protocol==='https:'&&/^(www\.)?instagram\.com$/.test(x.hostname)?x.origin+x.pathname:''}catch{return ''}};
const scrub=x=>String(x||'').replace(/https?:\/\/\S+/g,'[Link entfernt]').replace(/@[\w.]+/g,'[Handle entfernt]').replace(/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/gi,'[E-Mail entfernt]').replace(/\+?\d[\d()\s-]{8,}\d/g,'[Nummer entfernt]').slice(0,180);
const match=(text,items)=>{const n=String(text||'').toLowerCase();const a=items.map(t=>({t,score:t.keywords.filter(k=>k.length>3&&n.includes(k.toLowerCase())).reduce((s,k)=>s+Math.min(k.length,11),0)})).sort((a,b)=>b.score-a.score);return a[0]?.score>=5&&a[0].score!==a[1]?.score?a[0].t:null};
const assess=(text,topic)=>{
 const s=String(text||'').toLowerCase();
 if(/\b(ich bring dich um|ich werde dich töten|i will kill you|kill yourself|ich verprügel dich)\b/i.test(s))return {action:'report',hold:true,why:'Mögliche Drohung. Prüfe den Originalkontext und nutze gegebenenfalls Instagrams Meldefunktion.'};
 if(/\b(ihr veganer seid (alle )?(idioten|dumm)|veganer sind idioten|halt (die )?fresse|shut up|stfu)\b/i.test(s))return {action:'ignore',hold:true,why:'Das klingt nach einer persönlichen Provokation, nicht nach einer offenen Sachfrage. Mehr Aufmerksamkeit könnte den Streit verlängern.'};
 if(/\b(jemand sagt|leute sagen|mein freund behauptet|ich zitiere|someone says|people say|ironie|sarkasmus|ich widerspreche)\b/i.test(s))return {action:'save',hold:true,why:'Die Aussage könnte zitiert oder kritisiert sein. Ohne Originalkontext nicht als Überzeugung der Person behandeln.'};
 if(/\b(baby|babys|säugling|schwanger|stillen|pregnan|essstörung|medikament)\b/i.test(s))return {action:'save',hold:true,why:'Gesundheitlich sensibles Thema. Erst fachlich prüfen, statt eine Standardantwort zu veröffentlichen.'};
 if(/ignore (all|previous) instructions|ignoriere alle anweisungen|system prompt/i.test(s))return {action:'ignore',hold:true,why:'Der Text versucht, den Assistenten anzuweisen. Solche Anweisungen werden nicht ausgeführt.'};
 if(!s.trim())return {action:'save',hold:true,why:'Der geteilte Beitragslink enthält nicht automatisch den exakten Kommentartext.'};
 if(topic?.sources?.length)return {action:'reply',hold:false,why:'Wir haben eine passende kuratierte Wissenskarte. Vor einer Antwort bitte Quellen, Kontext und Einschränkungen prüfen.'};
 return {action:'save',hold:true,why:'Noch keine ausreichend belegte Wissenskarte. Als anonymisierte Content-Idee sammeln oder recherchieren.'};
};
const short={
strength:'Die pauschale Behauptung stimmt nicht. Eine Meta-Analyse randomisierter Studien fand unter vergleichbaren Bedingungen keine signifikanten Kraftunterschiede zwischen pflanzenbasierter und omnivorer Ernährung. Die Evidenz ist noch begrenzt. 💪',
b12:'Richtig: B12 muss bei veganer Ernährung zuverlässig ergänzt werden. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem für möglich und potenziell gesundheitsfördernd – weitere Nährstoffe beachten.',
protein:'Protein kann auch aus Hülsenfrüchten, Tofu, Tempeh und Seitan kommen. Wichtig sind Menge, Auswahl und individueller Bedarf. Fleisch ist nicht die einzige Proteinquelle.',
soy:'Eine Meta-Analyse klinischer Studien fand keine signifikanten Auswirkungen von Soja auf die untersuchten männlichen Sexualhormone. Das gilt für diese Marker, nicht automatisch für jede denkbare Wirkung.',
crop:'Ja, auch beim Pflanzenanbau können Tiere sterben. Genaue Zahlen sind schwer zu ermitteln. Weniger vermeidbares Leid und bessere Landwirtschaft bleiben wichtige Ziele. 💚',
nature:'Manche Tiere fressen andere Tiere. Das allein sagt aber nicht, was Menschen tun sollten. Wir können bewusst entscheiden, ob wir vermeidbares Leid reduzieren möchten.',
forest:'Sojaanbau kann Entwaldung verursachen. Historische globale Daten zeigen jedoch: Ein Grossteil der Sojaernte wird als Tierfutter genutzt. Die Herkunft einzelner Produkte muss man separat prüfen.',
climate:'Laut globalen Modellen kann eine stärker pflanzliche Ernährung erheblich Agrarfläche sparen. Die konkreten Effekte variieren – ein Modell ist kein Beweis für die Wirkung einer einzelnen Mahlzeit.',
sentience:'Tiere sind fühlende Wesen, auch im EU-Recht anerkannt. Die EFSA beschreibt bei Schweinen Belastungen wie Schmerz und Furcht. Ihr Wohlergehen zählt. ❤️',
taste:'Ich verstehe, dass Geschmack wichtig ist. Vielleicht testen wir einfach mal eine wirklich leckere pflanzliche Version deines Lieblingsgerichts – ganz ohne Druck? 🐷',
cost:'Das hängt von den Produkten, dem Wohnort und dem verfügbaren Budget ab. Ohne konkrete lokale Preise wäre ein pauschaler Preisvergleich unseriös.',
children:'Bei Babys, Kindern und Schwangeren ist eine pauschale Antwort nicht verantwortungsvoll. Individuelle Fragen gehören zu qualifizierter fachlicher Beratung.'
};
const share=query=>{const p=new URLSearchParams(query||'');const raw=(p.get('text')||'').slice(0,1800),url=ig(p.get('url')||raw.match(/https:\/\/(?:www\.)?instagram\.com\/\S+/i)?.[0]);return{shared:p.has('text')||p.has('url')||p.has('title'),postUrl:url,comment:raw.replace(/https:\/\/(?:www\.)?instagram\.com\/\S+/gi,'').trim()}};
return{ig,scrub,match,assess,short,share};
});
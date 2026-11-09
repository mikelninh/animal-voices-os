/* Animal Voices v1.3 — goal-first editorial strategy library.
 * Four independent approaches. No claims of measured persuasion or independently verified evidence.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.AV_STRATEGIES=api;
})(typeof window!=='undefined'?window:undefined,function(){
'use strict';
const GOALS={
 connect:{label:'Verbindung',short:'Gemeinsamkeiten finden',description:'Sorge ernst nehmen, ohne die Sache schönzureden.',metric:'Fühlt sich die Person respektiert?'},
 clarify:{label:'Verstehen',short:'Klarheit schaffen',description:'Die konkrete Frage fair und verständlich beantworten.',metric:'Ist die Antwort nachvollziehbar?'},
 explore:{label:'Neugier',short:'Gespräch öffnen',description:'Eine echte Einladung zum Weiterdenken, keine rhetorische Falle.',metric:'Möchte die Person freiwillig weiterreden?'},
 act:{label:'Möglichkeit',short:'Etwas ermöglichen',description:'Einen kleinen, freiwilligen nächsten Schritt anbieten.',metric:'Ist der nächste Schritt hilfreich und machbar?'}
};
const DRAFTS={
 strength:{
  connect:'Der Gedanke ist verständlich: Muskelaufbau soll funktionieren, egal wie man isst. Fleisch ist dafür aber keine zwingende Voraussetzung – Training und ausreichende Nährstoffversorgung bleiben wichtig.',
  clarify:'Ja, veganer Muskelaufbau ist möglich. In bisherigen kleinen Trainingsstudien gab es bei ähnlicher Proteinzufuhr vergleichbare Kraft- und Muskelzuwächse. Das gilt nicht automatisch für jede Person.',
  explore:'Was macht für dich einen guten Muskelaufbau aus – Kraft, Leistung oder Ernährung? Mich interessiert, warum Fleisch dabei unverzichtbar sein sollte.',
  act:'Du möchtest vegan Muskeln aufbauen? Wir könnten gemeinsam eine Mahlzeit mit ausreichend Protein planen. Entscheidend sind schließlich auch Training und die gesamte Ernährung.'
 },
 b12:{
  connect:'B12 ist ein berechtigter Punkt. Bei veganer Ernährung muss man es zuverlässig ergänzen. Gleichzeitig macht diese Notwendigkeit eine gut geplante vegane Ernährung nicht automatisch ungesund.',
  clarify:'Ja, bei veganer Ernährung ist ein zuverlässiges B12-Supplement nötig. Die Deutsche Gesellschaft für Ernährung bewertet eine gut geplante vegane Ernährung für gesunde Erwachsene dennoch grundsätzlich als möglich.',
  explore:'Stimmt, bei veganer Ernährung gehört B12 dazu. Wäre für dich entscheidend, ob eine Ernährung alle nötigen Nährstoffe zuverlässig liefert – auch mit Supplementen?',
  act:'Wenn du vegan essen möchtest, plane B12 von Anfang an als Supplement ein. Für andere wichtige Nährstoffe lohnt sich eine gut informierte Planung statt Raten.'
 },
 protein:{
  connect:'Genug Protein ist wichtig, egal wie jemand isst. Fleisch ist aber nicht die einzige Möglichkeit: Auch Bohnen, Linsen, Tofu und Seitan können dazu beitragen.',
  clarify:'Ja, der Proteinbedarf lässt sich auch pflanzlich decken. Hülsenfrüchte, Tofu und Seitan liefern Protein; entscheidend sind die gesamte Zufuhr und der persönliche Bedarf.',
  explore:'Was wäre für dich eine überzeugende pflanzliche Proteinquelle: etwas fürs Training oder eher eine einfache Mahlzeit für jeden Tag?',
  act:'Für den Einstieg: Probier eine Bowl mit Linsen oder Tofu. Damit kommt Protein ganz selbstverständlich auf den Teller – ohne komplizierte Ersatzprodukte.'
 },
 soy:{
  connect:'Bei Hormonen lohnt es sich, vorsichtig zu sein. Die bisherigen klinischen Studien finden allerdings keinen signifikanten Einfluss von Soja auf die untersuchten männlichen Sexualhormone.',
  clarify:'Eine Meta-Analyse von 41 klinischen Studien fand keine signifikanten Veränderungen der untersuchten männlichen Sexualhormone durch Soja oder Isoflavone. Das beantwortet nicht jede denkbare Gesundheitsfrage.',
  explore:'Was verunsichert dich an Soja am meisten? Die Studienlage zu männlichen Hormonmarkern ist viel nüchterner, als die Gerüchte vermuten lassen.',
  act:'Wenn du Soja ausprobieren möchtest, könntest du mit Tofu oder Edamame anfangen. Bei den untersuchten männlichen Hormonen fanden klinische Studien keinen signifikanten Effekt.'
 },
 crop:{
  connect:'Ja, leider. Auch die Tiere auf den Feldern zählen. Für mich heißt weniger Tierleid nicht, völlig schadlos zu leben, sondern vermeidbares Leid ernst zu nehmen.',
  clarify:'Ja, beim Pflanzenanbau können Tiere sterben; genaue Opferzahlen sind unsicher. Tierhaltung beansprucht zusätzlich viel Fläche und Futter. Das ist relevant, aber kein Beweis für eine genaue Zahl vermiedener Erntetode.',
  explore:'Ja, das stimmt, und diese Tiere zählen. Wie könnten wir sowohl Tiere auf den Feldern als auch in der Tierhaltung besser schützen?',
  act:'Das Problem sollten wir ernst nehmen: weniger Tierhaltung kann Flächenbedarf verringern. Gleichzeitig braucht es bessere Methoden, um Wildtiere beim Pflanzenanbau zu schützen.'
 },
 nature:{
  connect:'Es stimmt, dass manche Tiere andere Tiere fressen. Für mich bleibt trotzdem die Frage, welches Leid wir Menschen vermeiden können – unabhängig davon, was in der Wildnis passiert.',
  clarify:'Dass Wildtiere andere Tiere fressen, beschreibt Natur. Ob wir Menschen Tiere nutzen sollten, ist zusätzlich eine ethische Frage – keine automatische Folgerung aus dem Tierverhalten.',
  explore:'Ja, in der Natur fressen manche Tiere andere. Welche Verantwortung sollten wir Menschen deiner Meinung nach haben, wenn wir eine Wahl haben?',
  act:'Wir können das Verhalten von Wildtieren nicht ändern. Aber wir können selbst entscheiden, welche Produkte wir kaufen und welches Tierleid wir damit möglichst vermeiden möchten.'
 },
 forest:{
  connect:'Die Sorge um den Regenwald teile ich. Soja kann zu Entwaldung beitragen. Historisch wurde allerdings der Großteil der weltweiten Sojaernte als Tierfutter genutzt.',
  clarify:'Soja kann mit Entwaldung verbunden sein. Historische globale Auswertungen zeigen jedoch: Der überwiegende Teil der Sojaernte ging ins Tierfutter, nicht direkt in Tofu. Einzelne Lieferketten muss man gesondert prüfen.',
  explore:'Regenwaldschutz ist uns vermutlich beiden wichtig. Würde es für deine Bewertung einen Unterschied machen, ob Soja direkt gegessen oder erst an Tiere verfüttert wird?',
  act:'Wenn dir Regenwaldschutz wichtig ist, lohnt es sich, Herkunft und Lieferketten zu prüfen. Und weniger Tierprodukte können die Nachfrage nach Futtermitteln verringern.'
 },
 climate:{
  connect:'Ich verstehe, dass einzelne Mahlzeiten nach wenig aussehen. Die Wirkung entsteht im größeren Ernährungssystem: Modelle zeigen, dass stärker pflanzliche Ernährung landwirtschaftliche Fläche einsparen kann.',
  clarify:'Pflanzlichere Ernährung kann laut globalen Modellen den landwirtschaftlichen Flächenbedarf deutlich senken. Wie groß der Klimaeffekt konkret ist, hängt aber von den ersetzten Lebensmitteln und ihrer Herstellung ab.',
  explore:'Welche Veränderung beim Essen wäre für dich überhaupt realistisch? Vielleicht finden wir einen Schritt, der zum Alltag passt, statt über perfekte Ernährung zu streiten.',
  act:'Ein einfacher Anfang: Ersetze gelegentlich ein tierisches Hauptgericht durch eine pflanzliche Mahlzeit, die du gern isst. Was dir schmeckt, hält meist länger.'
 },
 sentience:{
  connect:'Wir müssen Tieren nicht menschliche Gefühle zuschreiben, um ihr Leiden ernst zu nehmen. Bei Schweinen sind Schmerz und Angst in wissenschaftlichen Tierwohlbewertungen dokumentiert.',
  clarify:'Ja. Die europäische Lebensmittelbehörde beschreibt bei Schweinen unter anderem Schmerz und Angst. Und das EU-Recht erkennt Tiere grundsätzlich als fühlende Wesen an.',
  explore:'Welche Erfahrungen eines Tieres würden für dich zählen – Schmerz, Angst oder Wohlbefinden? Bei Schweinen sind diese Fragen nicht bloß Spekulation.',
  act:'Wenn dir Tierwohl wichtig ist, könntest du dir die wissenschaftlichen Bewertungen zu Schweinen ansehen. Danach lässt sich bewusster entscheiden, welche Haltung und Produkte man unterstützen möchte.'
 },
 taste:{
  connect:'Dass dir Fleisch schmeckt, kann ich gut verstehen. Geschmack ist etwas Persönliches. Mir ist nur wichtig, dass wir auch das Leben der Tiere in unsere Entscheidungen einbeziehen.',
  clarify:'Geschmack ist ein echtes Argument dafür, was wir gern essen. Er beantwortet aber nicht die andere Frage, welche Interessen Tiere haben und wie wir mit ihnen umgehen sollten.',
  explore:'Welches Gericht würdest du niemals missen wollen? Vielleicht steckt gerade darin eine spannende Idee für eine pflanzliche Variante, die dir genauso Freude macht.',
  act:'Du musst deinen Geschmack nicht aufgeben, um Neues zu testen. Such dir ein Lieblingsgericht und probier eine pflanzliche Version – nur, wenn du Lust darauf hast.'
 }
};
function choose(text,context,topicId){
 const s=String(text||'').toLocaleLowerCase('de');
 if(topicId==='taste'||topicId==='cost')return 'connect';
 if(/\b(wie kann|wie geht|was kann ich|woher bekomme|was essen|welches rezept|ausprobieren|anfangen)\b/.test(s))return 'act';
 if(context==='question'||/[?]$/.test(s))return 'clarify';
 return 'connect';
}
function compose(topicId,goal,fallback){
 const text=DRAFTS[topicId]?.[goal];
 return typeof text==='string'&&text.length>=35?text:String(fallback||'');
}
return {GOALS,DRAFTS,choose,compose};
});
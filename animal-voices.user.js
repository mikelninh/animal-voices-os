// ==UserScript==
// @name         Animal Voices · Instagram Companion
// @namespace    https://animal-voices-os.vercel.app/
// @version      0.6.0
// @description  Einen Instagram-Kommentar auswählen, vorab geprüften Antwortvorschlag ansehen und selbst freigeben. Keine Veröffentlichung durch das Skript.
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @run-at       document-idle
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @connect      animal-voices-os.vercel.app
// @downloadURL  https://animal-voices-os.vercel.app/animal-voices.user.js
// @updateURL    https://animal-voices-os.vercel.app/animal-voices.user.js
// ==/UserScript==
/* © 2026 Animal Voices. Works on Instagram's browser website, NOT in the native Instagram app.
 * No automatic request, tracking, screenshots, account scraping, or automatic post.
 * Optional private AI request ONLY after explicit user consent; code stays in tab memory.
 * The verified source capsules below were manually checked against primary sites on 2026-11-10.
 */
(function(root){
'use strict';
const VERSION='0.3.1';
const REVIEWED_AT='2026-11-11';
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
   de:'Ja. Bei vielen Tieren, etwa Schweinen und Hühnern, ist Schmerzempfinden wissenschaftlich anerkannt. Deshalb berücksichtigt die Europäische Behörde für Lebensmittelsicherheit Schmerzen und Stress beim Tierwohl. Welche Konsequenzen wir daraus ziehen, bleibt auch eine ethische Frage.',
   en:'Yes. Pain and distress are recognised welfare concerns in many animals, including farmed pigs and poultry. European food-safety experts assess those harms. What that means for our food choices is also an ethical question.'
  },
  summary:'EFSA erklärt ausdrücklich, dass Schmerzen, Stress und Leiden zentrale Aspekte des Tierwohls sind, und bewertet Tierwohl bei Schweinen, Geflügel und weiteren Nutztieren.',
  sources:[{name:'EFSA · Animal welfare: Schmerzen und Stress',url:'https://www.efsa.europa.eu/en/topics/topic/animal-welfare'},{name:'EUR-Lex · Artikel 13 AEUV',url:EU}],
  limitation:'Die Aussage gilt nicht pauschal in gleicher Weise für jede Tierart. Ob und wie Menschen moralisch handeln sollten, folgt nicht allein aus einem wissenschaftlichen Befund.'
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
  kiki:{de:'Die Proteinfrage ist verständlich, besonders wenn dir eine gute Versorgung wichtig ist. Linsen, Bohnen, Tofu und Getreide können bei abwechslungsreicher, ausreichender Ernährung helfen, den Bedarf zu decken.',en:'Protein is a fair concern, especially if you train. You do not have to leave it to chance: legumes, tofu and other suitable foods can meet protein needs with good planning.'},
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
  kiki:{de:'Ja, Tiere wie Schweine und Hühner können Schmerzen und Stress erfahren. Das ist ein wichtiger Grund, ihr Wohlergehen ernst zu nehmen. Wie wir das im Alltag berücksichtigen, können wir miteinander besprechen.',en:'Yes. Animals such as pigs and chickens can experience pain and distress. That matters for their welfare. We can respectfully discuss how to take those experiences into account in everyday decisions.'},
  bao:{de:'Ja. Schweine und Hühner sind keine gefühllosen Produkte auf Beinen – Schmerz und Stress zählen für ihr Wohlergehen. Was wir daraus fürs Essen ableiten, ist eine wichtige Diskussion.',en:'Yes. Pigs and chickens are not unfeeling products on legs: pain and distress affect their welfare. What we do about that in our food choices is worth discussing.'},
  curious:{de:'Ja, viele Tiere können Schmerzen empfinden. Wenn wir das wissen: Wie sollte ihr Wohlergehen bei unseren Essensentscheidungen berücksichtigt werden? Die ethische Frage geht über die reine Biologie hinaus.',en:'Yes, many animals can feel pain. Knowing that, how much weight should their welfare carry in our food choices? The ethical question goes beyond biology alone.'}
 }
};
// Ethical and everyday obstacles are conversation drafts, not scientifically
// 'verified' moral conclusions. We only link sources for factual premises.
TOPICS.taste={
 name:'Geschmack & persönliche Motivation',
 patterns:[/fleisch.{0,80}schmeck|schmeck.{0,80}fleisch|geschmack.{0,60}fleisch|meat.{0,80}tast|tast.{0,80}meat|tastes better|taste of meat/i],
 answer:{
  de:'Kann ich verstehen: Geschmack ist wichtig. Gleichzeitig betrifft unser Essen auch die Tiere. Vielleicht ist es weniger die Frage, worauf du verzichten musst, sondern ob du pflanzliche Gerichte findest, die dir genauso gut schmecken.',
  en:'That makes sense: taste matters. But our food choices affect animals too. Maybe the question is not what you must give up, but whether you can find plant-based meals you genuinely enjoy.'
 },
 summary:'Diese Antwort ist ein Gesprächsangebot, keine wissenschaftlich geprüfte Behauptung über Geschmack oder persönliche Werte. EU-Recht erkennt Tiere als fühlende Wesen an.',
 sources:[{name:'EUR-Lex · Tiere als fühlende Wesen (Art. 13)',url:EU}],
 limitation:'Geschmack ist subjektiv. Die rechtliche Anerkennung tierlicher Empfindungsfähigkeit beweist keine individuelle moralische Pflicht.',
 evidenceStatus:'editorial'
};
TOPICS.cost={
 name:'Zeit, Kosten & Alltag',
 patterns:[/vegan.{0,50}teuer|zu teuer|kann ich mir nicht leisten|kostet.{0,30}mehr|zeit.{0,30}kochen|too expensive|can.t afford|cannot afford|afford vegan|plant.based.{0,30}expensive/i],
 answer:{
  de:'Das ist ein nachvollziehbares Hindernis – Geld und Zeit sind begrenzt. Wäre es hilfreich, erst ein einziges günstiges, schnelles Gericht auszuprobieren, das in deinen Alltag passt? Ein perfekter Umstieg ist dafür nicht nötig.',
  en:'That is a real barrier: time and money are limited. Would it help to start with just one quick, affordable meal that fits your routine? It need not be an all-or-nothing change.'
 },
 summary:'Redaktionelle Gesprächshilfe: keine aktuellen Preis-, Verfügbarkeits- oder Nährwertvergleiche und keine Behauptung, vegan sei grundsätzlich günstiger.',
 sources:[],
 limitation:'Konkrete Einkaufspreise hängen von Ort, Zeit und Zugang ab. Ein Beispielrezept ersetzt keine individuellen Ernährungsinformationen.',
 evidenceStatus:'editorial'
};
TOPICS.ethical_choice={
 name:'Warum Tierleid beim Essen zählt',
 patterns:[/why.{0,65}animal.{0,35}suffer.{0,50}matter|why.{0,65}animals?.{0,35}(?:matter|care)|why.{0,55}animal.{0,35}food.choice|warum.{0,55}(?:tierleid|tiere|tieren).{0,45}(?:wichtig|zählen|interessieren)|wieso.{0,55}(?:tierleid|tiere).{0,45}(?:wichtig|zählen)|wenn tiere.{0,60}fühl.{0,60}leben/i],
 answer:{
  de:'Weil unsere Essensentscheidungen nicht nur uns betreffen. Wenn Tiere leiden können, verdient ihr Wohlergehen ebenfalls Beachtung. Geschmack, Kosten und Alltag zählen auch – aber Tierleid sollte bei der Entscheidung nicht unsichtbar bleiben.',
  en:'Because our food choices affect more than just us. If animals can experience suffering, their wellbeing deserves consideration too. Taste, cost and convenience still matter — animal suffering simply should not be invisible in the decision.'
 },
 summary:'Ethisches Argument, keine naturwissenschaftlich beweisbare Moralregel. Artikel 13 AEUV erkennt Tiere rechtlich als fühlende Wesen an.',
 sources:[{name:'EUR-Lex · Artikel 13 AEUV',url:EU}],
 limitation:'Aus dem EU-Recht folgt nicht automatisch eine bestimmte Ernährungsentscheidung. Die Gewichtung moralischer Interessen ist eine ethische Diskussion.',
 evidenceStatus:'editorial'
};
TOPICS.life_ethics={
 name:'Zählt das Leben des Tiers?',
 patterns:[/wenn tiere.{0,50}fühl.{0,55}(?:leben|zählt|wert)|zählt.{0,50}(?:leben|lebens).{0,40}(?:tier|tieren)|life of an animal.{0,30}matter|does an animal.s life matter/i],
 answer:{
  de:'Ja, das ist eine wichtige Frage. Wenn Tiere fühlen können, zählt für viele nicht nur, ob sie leiden, sondern auch, dass sie weiterleben möchten oder könnten. Wie wir dieses Interesse gewichten, ist eine ethische Diskussion.',
  en:'Yes, that matters. For many people, animal ethics is not only about preventing pain but also about whether animals have an interest in continuing to live. How we weigh that interest is an ethical question.'
 },
 summary:'Ethische Einordnung, nicht direkte empirische Messung. Der EU-Vertrag erkennt Tiere als fühlende Wesen an, beantwortet aber nicht abschließend die Frage nach dem Lebensinteresse.',
 sources:[{name:'EUR-Lex · Tiere als fühlende Wesen',url:EU}],
 limitation:'Nicht behaupten, dass alle Tierarten identische Todeskonzepte oder Zukunftspräferenzen haben. Ethische Abwägungen bleiben umstritten.',
 evidenceStatus:'editorial'
};
TOPICS.painless_killing={
 name:'Töten ohne Schmerzen',
 patterns:[/töt.{0,55}ohne.{0,30}schmerz|töten.{0,70}schmerz|ohne.{0,30}schmerz.{0,60}(?:tier|töt|ethisch)|painlessly.{0,25}kill|painless.{0,25}kill|kill.{0,60}without pain|slaughter.{0,50}without pain/i],
 answer:{
  de:'Auch wenn ein Tier ohne Schmerzen sterben würde, bleibt die Frage nach seinem weiteren Leben. Für manche zählt deshalb nicht nur das Leid beim Sterben, sondern auch, ob wir ihm das Leben für einen vermeidbaren Zweck nehmen dürfen. Das ist eine ethische Abwägung.',
  en:'Even if an animal could die without pain, there is still a question about the life it would otherwise have lived. For many, ethics is not only about pain during death but whether taking that life is justified when alternatives exist.'
 },
 summary:'Philosophische Unterscheidung zwischen Schmerzvermeidung und dem Wert des Weiterlebens. Keine Einigkeit über die moralische Gewichtung.',
 sources:[{name:'EUR-Lex · Tiere als fühlende Wesen (Art. 13)',url:EU}],
 limitation:'Artikel 13 AEUV beantwortet die Frage nach moralischer Zulässigkeit schmerzloser Tötung nicht. Kein wissenschaftlicher Beweis einer Moralregel.',
 evidenceStatus:'editorial'
};
const MORE_VARIANTS={
 taste:{
  kiki:{de:'Verstehe ich gut – was wir gern essen, ist nicht nebensächlich. Mir hilft die Frage: Könnten wir Genuss und Rücksicht auf Tiere zusammenbringen? Vielleicht gibt es pflanzliche Gerichte, die dich wirklich überzeugen.',en:'I get it. Enjoying food matters. Could we find ways to keep that pleasure while considering animals too? Maybe there are plant-based meals you would genuinely love.'},
  bao:{de:'Fair! Essen soll Freude machen, nicht nach Hausaufgaben schmecken. 😄 Aber auch die Folgen für Tiere zählen. Vielleicht wäre die spannendere Challenge: Finde ein pflanzliches Gericht, das du freiwillig nochmal bestellst.',en:'Fair! Food should be a pleasure, not homework. 😄 But animals are part of the picture too. How about finding one plant-based dish you would happily order again?'},
  curious:{de:'Was genau schmeckt dir besser: die Würze, die Konsistenz oder ein bestimmtes Gericht? Vielleicht lohnt es sich, genau dort eine pflanzliche Alternative zu testen – wenn dir die Auswirkungen auf Tiere ebenfalls wichtig sind.',en:'What do you like most about it: the seasoning, the texture or a particular dish? Maybe that is the best place to try an alternative, if you also care about the impact on animals.'}
 },
 cost:{
  kiki:{de:'Kann ich nachvollziehen. Wer wenig Zeit oder Geld hat, braucht keine zusätzlichen Ansprüche. Wenn du magst, suchen wir ein schnelles Gericht ohne teure Spezialprodukte, das zu deinem Budget passt.',en:'I hear you. Limited time and money are real constraints. If you want, we can look for one quick meal without pricey specialty products that actually fits your budget.'},
  bao:{de:'Völlig fair: Niemand braucht eine teure Einkaufsliste als neue Lebensphilosophie. Vielleicht starten wir mit einem einfachen Gericht aus Zutaten, die du ohnehin kaufst?',en:'Totally fair. No one needs an expensive shopping list as a new lifestyle. What about starting with a simple meal made from ingredients you already buy?'},
  curious:{de:'Was ist für dich die größere Hürde: Preis, Kochzeit oder Angebot vor Ort? Dann können wir nach genau einer machbaren Alternative suchen – ohne zu behaupten, alles Pflanzliche sei immer günstiger.',en:'What is the biggest barrier for you: price, cooking time or availability? Then we can look for one practical option without pretending plant-based food is always cheaper.'}
 },
 ethical_choice:{
  kiki:{de:'Ich finde, wir dürfen Geschmack und Gewohnheiten wichtig nehmen. Gleichzeitig betrifft unser Essen auch Lebewesen, die leiden können. Deshalb möchte ich ihr Wohlergehen mitbedenken – nicht als Vorwurf, sondern als Teil einer fairen Entscheidung.',en:'I think taste and habits matter. But our food choices also affect living beings who can suffer. That is why I want to consider their wellbeing too — not as an accusation, but as part of a fair decision.'},
  bao:{de:'Weil auf dem Teller nicht die ganze Geschichte liegt. Tiere können leiden, und ihre Erfahrungen verschwinden nicht, nur weil wir sie nicht sehen. Geschmack ist wichtig – aber vielleicht nicht das einzige Kriterium.',en:'Because there is more to a meal than what reaches the plate. Animals can suffer, even when we do not see it. Taste matters — it just might not be the only consideration.'},
  curious:{de:'Wenn eine Entscheidung jemand anderem Leid zufügen kann, sollten wir das zumindest mitbedenken? Genau deshalb finde ich Tierwohl beim Essen relevant – neben Geschmack, Preis und Gewohnheit.',en:'If a choice can cause suffering to another being, should that count in our decision? That is why I think animal welfare matters in food choices, alongside taste, cost and convenience.'}
 },
 painless_killing:{
  kiki:{de:'Ich verstehe den Gedanken: Wenn kein Schmerz entsteht, was wäre dann noch das Problem? Für viele geht es auch darum, dass das Tier hätte weiterleben können. Ob wir ihm dieses Leben nehmen dürfen, ist eine echte ethische Frage.',en:'I understand the thought: if there is no pain, what is the harm? For many, the question also concerns the life the animal could have continued living. Whether taking it is justified is a real ethical debate.'},
  bao:{de:'Eine schmerzlose Tötung würde einen Teil des Problems verändern – nicht zwingend die ganze Frage. Es bleibt: Zählt das weitere Leben des Tieres? Darüber kann man reden, ohne eine fertige Moralformel vorzutäuschen.',en:'A painless death would change one part of the problem, but not necessarily the whole question. Does the animal’s future life count? It is worth discussing without pretending there is a one-line moral proof.'},
  curious:{de:'Geht es für dich beim Töten nur um Schmerzen – oder zählt auch die Möglichkeit, weiterzuleben? Daran hängt oft, wie wir eine vermeintlich schmerzlose Tötung ethisch einordnen.',en:'Is the only ethical issue pain during death, or does the chance to keep living count too? That distinction often shapes how people think about painless killing.'}
 }
};

MORE_VARIANTS.life_ethics={
 kiki:{de:'Gute Frage. Wenn wir Tiere als fühlende Wesen ernst nehmen, sollten wir vielleicht nicht nur Schmerzen vermeiden, sondern auch fragen, ob ihnen ihr weiteres Leben etwas bedeutet. Darauf gibt es keine einfache moralische Formel.',en:'That is a meaningful question. If we take animal sentience seriously, perhaps we should consider not only pain but also their continued lives. There is no simple formula for weighing that.'},
 bao:{de:'Tierwohl endet vielleicht nicht schon bei „möglichst wenig Schmerz“. Die größere Frage ist, ob ihr Leben selbst zählt. Darüber können wir respektvoll diskutieren, ohne die Antwort als naturwissenschaftliche Tatsache auszugeben.',en:'Animal welfare might be about more than minimising pain. There is also the question of whether an animal’s life itself matters. We can discuss that without pretending science settles morality.'},
 curious:{de:'Würdest du sagen, wir sollten bei Tieren nur Schmerz berücksichtigen – oder auch die Möglichkeit, weiterzuleben? Genau diese Unterscheidung macht die ethische Frage so spannend.',en:'Should we consider only animal pain, or also their opportunity to go on living? That distinction seems central to the ethical question.'}
};

for(const [topic,variants] of Object.entries(MORE_VARIANTS))VARIANTS[topic]=variants;

// Curated objection and humour library (not automatic persuasion or scientific verification).
const RAGE_TOPICS=[{"id":"plants","name":"Pflanzen haben Gefühle","re":"pflanzen.{0,35}(fühl|schmerz|schrei|leiden)|plants?.{0,40}(feel|pain|scream|suffer)","go":"momo","de":["Pflanzen reagieren auf Reize. Ob das mit bewusstem Schmerz vergleichbar ist, ist eine andere Frage. Für Tierhaltung werden auch Pflanzen angebaut – die Futtermengen gehören in einen fairen Vergleich.","Ich würde auch den Pflanzenanbau ernst nehmen. Gerade deshalb sollten wir die Pflanzen mitzählen, die für Tierfutter wachsen, statt nur die direkt gegessenen.","Die Pflanzenlobby ist da! 🌱 Fairer Vergleich: Was wächst direkt für uns – und was erst als Tierfutter?","Wäre es für dich fair, beim Vergleich auch die Futterpflanzen der Tierhaltung mitzuzählen?"],"en":["Plants respond to stimuli. Whether that equals conscious pain is a different question. Animal farming uses feed crops too, so those count in a fair comparison.","Concern about harm is valid. That makes it important to count the plants grown as animal feed as well as those we eat directly.","The plant lobby has arrived! 🌱 A fair comparison includes crops grown as animal feed too.","Would you also count crops grown for animal feed when comparing the impacts of different diets?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[{"name":"Our World in Data · Landnutzung","url":"https://ourworldindata.org/land-use-diets"}]},{"id":"pushy","name":"Veganer nerven","re":"veganer.{0,35}(nerv|belehr|missionier)|vegan.{0,35}(annoy|preach|pushy)|ihr veganer nervt","go":"kiki","de":["Nicht jeder mag es, über Essen diskutieren zu müssen. Ich würde lieber eine konkrete Frage beantworten als jemanden zu bekehren.","Verstehe ich, wenn sich das belehrend anfühlt. Mir geht es nicht darum, dich zu beschämen. Wenn du magst, können wir offen über die eigentliche Frage sprechen.","Versprochen: kein veganes PowerPoint mit 74 Folien. 😉 Eine ehrliche Frage beantworte ich trotzdem gern.","Was nervt dich mehr: der Ton, die Forderung oder das Thema selbst?"],"en":["Not everyone wants a food debate. I'd rather answer a specific question than try to convert someone.","I understand that preaching can be frustrating. I'm not here to shame you; I'd rather listen and discuss the actual concern.","I promise: no 74-slide vegan PowerPoint. 😉 Happy to answer an honest question, though.","What bothers you most: the tone, the demands or the topic itself?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"ban","name":"Fleischverbot","re":"fleisch.{0,35}verbiet|fleischverbot|wollt ihr.{0,40}(verbiet|zwing)|vegan.{0,45}(force|ban meat)|ban.{0,25}meat|tofu.{0,25}polizei|tofu police","go":"kiki","de":["Ich kann nicht für alle Veganer sprechen. Mir geht es darum, über Tierleid und bessere Möglichkeiten zu reden, ohne dir etwas vorzuschreiben.","Die Sorge um Entscheidungsfreiheit verstehe ich. Können wir zuerst über unsere tatsächlichen Möglichkeiten sprechen, statt einander Verbote zu unterstellen?","Die Tofu-Polizei hat heute frei. 😉 Aber über Freiheit und den Umgang mit Tieren können wir gern reden.","Geht es dir um Gesetze oder darum, dich persönlich unter Druck gesetzt zu fühlen? Das sind unterschiedliche Fragen."],"en":["I can't speak for every vegan. I want to discuss animal welfare and better options, not tell you what to do.","I understand concerns about freedom of choice. Can we talk about actual options before assuming each other's intentions?","The tofu police are off duty today. 😉 But freedom and animal welfare are worth discussing.","Are you concerned about laws or about feeling personally pressured? Those are different questions."],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"tofu","name":"Tofu ist Chemie","re":"tofu.{0,40}(chemie|chemisch|chemical|processed|künstlich|artificial|plastic|plastik)","go":"momo","de":["Was macht dir bei Tofu konkret Sorgen: die Zutaten oder die Verarbeitung? Eine echte Zutatenliste sagt mehr als das Wort „Chemie“.","Skepsis bei unbekannten Lebensmitteln ist verständlich. Wollen wir die Zutaten eines konkreten Produkts anschauen?","Wasser ist übrigens auch Chemie. 😉 Spannender ist doch: Was steht tatsächlich auf der Zutatenliste?","Geht es dir um Zusatzstoffe, Herstellungsverfahren oder Geschmack?"],"en":["What worries you about tofu: its ingredients or how it is made? An actual ingredient list tells us more than the word 'chemicals'.","It's fair to question unfamiliar foods. Want to look at the ingredients of a specific product together?","Water is chemistry too. 😉 Better question: what's actually on the ingredient list?","Is your concern additives, processing or taste?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"natural","name":"Vegan ist unnatürlich","re":"vegan.{0,40}(unnatürlich|unnatural)|ohne fleisch.{0,35}(unnatürlich|unnatural)|we are.{0,30}(natural carnivores|meant to eat meat)|menschen.{0,40}fleischfresser","go":"momo","de":["„Natürlich“ bedeutet nicht automatisch „gut“. Ich würde lieber konkrete Nährstoffe, Bedürfnisse und Folgen für Tiere vergleichen.","Ich verstehe die Frage. Vielleicht müssen wir gar nicht entscheiden, was natürlicher ist, sondern was gut funktioniert und welche Folgen es hat.","Unsere Smartphones sind auch nicht gerade Steinzeit. 😉 Mir sind die tatsächlichen Folgen wichtiger als das Etikett „natürlich“.","Was bedeutet „natürlich“ für dich: Tradition, Biologie oder wenig Verarbeitung?"],"en":["'Natural' doesn't automatically mean 'good'. I'd rather compare actual nutritional needs and impacts on animals.","I see your point. Perhaps the question is less about labels and more about what works and what effects it has.","Our smartphones aren't exactly prehistoric either. 😉 I'd focus on real consequences rather than the label 'natural'.","What do you mean by 'natural' here: history, biology or processing?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"tradition","name":"Schon immer Fleisch","re":"(schon immer|seit jahrtausenden|seit tausenden jahren).{0,32}fleisch|menschen.{0,30}(immer|früher).{0,30}fleisch|humans.{0,45}(always|forever).{0,25}meat|ancestors.{0,35}(ate|eat).{0,25}meat","go":"kiki","de":["Dass etwas Tradition hat, zeigt, wie wichtig es Menschen ist. Aber es beantwortet nicht automatisch, was wir heute entscheiden sollten.","Essen hat Geschichte und Bedeutung. Vielleicht können wir viel davon bewahren und trotzdem neue Möglichkeiten ausprobieren.","Unsere Vorfahren hatten auch kein Lieferando. 😉 Tradition ist wertvoll – aber kein starres Handbuch für heute.","Was bedeutet dir an dieser Tradition am meisten: Geschmack, das Gericht oder das Zusammensein?"],"en":["Food traditions matter, but a long history alone doesn't settle what we ought to choose today.","Food carries history and meaning. Maybe we can preserve much of that while trying new options.","Our ancestors didn't have food-delivery apps either. 😉 Tradition matters without deciding every choice today.","What matters most in that tradition: the taste, the dish or sharing the meal?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"lions","name":"Löwen essen Fleisch","re":"löwen.{0,30}(essen|fressen|fleisch)|löwe.{0,45}(fleisch|vegan)|lions?.{0,35}(eat meat|vegan)|what about lions","go":"bao","de":["Wildtiere müssen nicht unsere Entscheidungsregeln vorgeben. Uns Menschen kann man fragen, welche Möglichkeiten wir selbst haben.","Der Vergleich ist nachvollziehbar. Ich würde eher auf unsere eigenen Entscheidungen schauen als auf das Verhalten wilder Tiere.","Ich möchte dem Löwen ungern einen Brokkoli-Workshop aufdrängen. 🦁 Uns können wir trotzdem fragen, was wir selbst wählen wollen.","Sollten wir uns daran orientieren, was Wildtiere tun – oder daran, welche Alternativen wir selbst haben?"],"en":["Wild animals don't have to dictate our decisions. We can ask what options we ourselves have.","I see the comparison. I'd look at human choices rather than simply copying wild animals.","I'm not about to pitch a broccoli workshop to a lion. 🦁 But we can think about our own options.","Should our choices be guided by wild animals, or by the options available to us?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"meme","name":"Dem Essen das Essen wegessen","re":"(essen|esst).{0,20}(dem essen|den tieren).{0,20}(essen|weg)|vegan.{0,40}eat.{0,25}food.s food","go":"bao","de":["Der Spruch ist witzig. 😄 Aber auch für Tierfutter wachsen Pflanzen. Für einen fairen Vergleich müssen wir sie mitzählen.","Ich mag den Humor. 😄 Und genau deshalb würde ich die Futterpflanzen der Tierhaltung beim Vergleich nicht vergessen.","Plot Twist: Die Kuh bestellt auch am Pflanzenbuffet. 🐄🌱 Ihr Futter zählt beim Flächenverbrauch mit.","Wenn Tiere Pflanzen fressen, müssten wir beim Vergleich nicht genau diese Futtermengen mitrechnen?"],"en":["That's a funny one. 😄 But animals eat crops too, and those feed crops count in a fair comparison.","I appreciate the joke. 😄 Feed crops still belong in the comparison.","Plot twist: the cow visits the plant buffet too. 🐄🌱 Its feed counts in land use.","If animals eat plants, shouldn't we count the crops used to feed them too?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[{"name":"Our World in Data · Landnutzung","url":"https://ourworldindata.org/land-use-diets"}]},{"id":"trend","name":"Vegan nur ein Trend","re":"vegan.{0,35}(trend|mode|fad|hype)|plant.based.{0,35}(fad|trend|hype)","go":"curious","de":["Vielleicht wird es manchmal als Trend vermarktet. Wichtiger sind für mich die Gründe dahinter und die Auswirkungen auf Tiere.","Ich verstehe, wenn dich Ernährungstrends ermüden. Mir geht es weniger um Labels und mehr um nachvollziehbare Entscheidungen.","Wenn es ein Trend ist, hat er definitiv genug Bohnen-Content. 😄 Mir sind die Gründe dahinter aber wichtiger.","Was müsste dich überzeugen, dass hinter dem Thema mehr steckt als ein Modetrend?"],"en":["It may be marketed as a trend. What matters more are the reasons and impacts on animals.","I get the fatigue with food trends. I'm more interested in real reasons than labels.","If it's a trend, it certainly has a lot of bean content. 😄 But the reasons matter more to me.","What would make it feel like more than a fad to you?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]},{"id":"both","name":"Menschen oder Tiere","re":"(menschen|kinder|armut).{0,55}(wichtiger|als tiere|tierleid)|warum.{0,40}tiere.{0,35}(menschen|wichtiger)|care.{0,40}animals?.{0,40}(people|humans)|animal suffering.{0,50}human suffering","go":"kiki","de":["Menschliches Leid ist wichtig. Aber ich sehe keinen Widerspruch darin, auch vermeidbares Tierleid ernst zu nehmen.","Verstehe den Blick auf menschliche Not. Ich glaube nicht, dass Mitgefühl für Tiere weniger Mitgefühl für Menschen bedeutet.","Mitgefühl hat zum Glück kein Limit von genau einer Spezies. 😉 Wir können beides ernst nehmen.","Warum müssten wir menschliches Leid und Tierleid gegeneinander ausspielen, statt beides zu beachten?"],"en":["Human suffering matters. I don't see a conflict with also caring about avoidable animal suffering.","I understand the concern for people. I don't think caring about animals requires caring less about humans.","Compassion doesn't have a one-species subscription. 😉 We can care about both.","Why would concern for people and animals have to compete rather than coexist?"],"summary":"Redaktionell formulierter Gesprächsvorschlag. Dies ist keine naturwissenschaftliche Beweisführung oder Aussage über individuelle Motive.","limitation":"Individuellen Kontext prüfen; bei Tatsachenbehauptungen verlässliche Quellen nachreichen.","sources":[]}];
for(const r of RAGE_TOPICS){
 TOPICS[r.id]={name:r.name,patterns:[new RegExp(r.re,'i')],answer:{de:r.de[0],en:r.en[0]},summary:r.summary,sources:r.sources,limitation:r.limitation,evidenceStatus:'editorial',defaultVoice:r.go};
 VARIANTS[r.id]={kiki:{de:r.de[1],en:r.en[1]},bao:{de:r.de[2],en:r.en[2]},curious:{de:r.de[3],en:r.en[3]}};
}
// Provocation is not always silence: one dignified public reply is optional,
// never the automatic default. It is an editorial script, not a fact-check.
const RAGE_REPLY={
 steak:{
  de:{
   momo:'Die Zahl der Steaks sagt noch nichts darüber, wie wir mit Tieren umgehen sollten. Mir wäre eine sachliche Frage lieber als ein Wettbewerb.',
   kiki:'Du musst mir nichts beweisen. Ich möchte niemanden beschämen – mir geht es darum, ob wir vermeidbares Leid für Tiere verringern können.',
   bao:'Steak-Bingo gewonnen. 😄 Mir wäre ein Gespräch über Tiere lieber als ein Wettkampf, wer wen ärgert.',
   curious:'Wenn wir den Steak-Wettbewerb weglassen: Was wäre für dich eine faire Frage zum Umgang mit Tieren?'
  },
  en:{
   momo:'The number of steaks does not settle how we should treat animals. I would rather discuss a real question than keep score.',
   kiki:'You do not have to prove anything to me. I am not here to shame you; I care about whether we can reduce avoidable harm to animals.',
   bao:'Steak bingo: you win. 😄 I would rather discuss animals than compete over who can annoy whom.',
   curious:'If we skip the steak competition, what would be a fair question about how we treat animals?'
  }
 },
 generic:{
  de:{
   momo:'Provokation bringt uns selten weiter. Wenn du eine konkrete Frage zu Tieren oder Ernährung hast, beantworte ich sie gern.',
   kiki:'Wir müssen uns nicht einig sein. Ich möchte trotzdem respektvoll sprechen – über Tiere und Entscheidungen, nicht gegeneinander.',
   bao:'Provokation angekommen. 😄 Jetzt vielleicht ein echtes Gespräch statt eines Kommentar-Duells?',
   curious:'Hinter dem Spruch steckt vielleicht eine echte Frage. Welche davon möchtest du ernsthaft diskutieren?'
  },
  en:{
   momo:'Provocation rarely moves a conversation forward. If you have a real question about animals or food, I am happy to answer.',
   kiki:'We do not have to agree. I would still rather speak respectfully about animals and choices than fight each other.',
   bao:'Provocation received. 😄 Fancy an actual conversation instead of a comment duel?',
   curious:'Maybe there is a real question behind the joke. Which one would you actually like to discuss?'
  }
 }
};
const RAGE_SKIP=[/wegen euch.{0,25}esse ich.{0,45}(?:steaks?|schnitzel)/i,/ich esse.{0,50}(?:zwei|2|drei|3|extra|mehr).{0,30}(?:steak|schnitzel|burger).{0,40}(?:wegen euch|extra für euch|nur damit)/i,/(?:i'll eat|i will eat|i'm eating).{0,55}(?:extra|two more|2 more).{0,35}(?:steaks?|burgers?).{0,40}(?:because of you|to annoy)/i,/(?:heul doch|cry more|stay mad).{0,65}(?:vegan|pflanzen|tofu)/i];
const REPLIES=['antworten','reply','respond','répondre','responder','rispondi'];
const SENSITIVE=/\b(schwanger|schwangerschaft|stillend|baby|babys|kind|kinder|kid|kids|children|minor|minderjaehr|minderjähr|pregnan|child|infant|stillen|medikament|diagnose|eating disorder|essst[oö]rung|suizid|suicide|kill yourself|töte dich|bring dich um|ich bringe dich um|ich werde dich töten|ich töte dich|i will kill|i'm going to kill|threat|drohung)\b/i;
const PRIVATE=/(?:@[a-z0-9_.]{3,}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d()\s-]{8,}\d)/i;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();

// ANIMAL VOICES CODE v0.5: decision support only; no deletion/reporting or posting APIs.
const COMMUNITY_CODE=[
'Würde bewahren: Aussagen kritisieren, nicht Menschen abwerten.',
'Echte Sorgen suchen und beantworten.',
'Wahrheit vor Schlagfertigkeit; Wissenschaft von Ethik trennen.',
'Humor verbindet und schlägt nie nach unten.',
'Nie beschämen oder Menschen öffentlich vorführen.',
'Bei Beleidigung, Hass oder Drohung Grenzen setzen.',
'Die Tür offenlassen, ohne das letzte Wort haben zu müssen.'
];
const BOUNDARY_REPLIES={
de:{momo:'Kritik und andere Meinungen sind willkommen. Persönliche Beleidigungen helfen uns nicht weiter. Über die Sache können wir gern respektvoll sprechen.',
kiki:'Du musst mir nicht zustimmen. Ich möchte trotzdem respektvoll miteinander reden. Wenn du eine konkrete Frage hast, höre ich gern zu.',
bao:'Meinungsverschiedenheiten sind okay. 😊 Der Beleidigungswettbewerb fällt heute aber aus. Über die eigentliche Frage spreche ich gern.',
curious:'Was ist dein eigentlicher Einwand? Ohne persönliche Angriffe können wir ihn gern in Ruhe besprechen.'},
en:{momo:'Criticism and disagreement are welcome. Personal insults do not move the conversation forward. I am happy to discuss the actual issue respectfully.',
kiki:'You do not have to agree with me. I would still like us to speak respectfully. If you have a specific question, I am listening.',
bao:'Disagreement is fine. 😊 The insult championship is cancelled today, though. Happy to discuss the actual issue.',
curious:'What is your actual concern? Without personal attacks, we can discuss it calmly.'}
};
const DIRECT_THREAT=/(?:ich\s+(?:werde|will)\s+dich\s+(?:töten|umbringen|verletzen)|ich\s+bringe\s+dich\s+um|ich\s+töte\s+dich|(?:i\s+(?:will|am going to)|i.?ll)\s+(?:kill|hurt)\s+you|kill\s+yourself|bring\s+dich\s+um|töte\s+dich)/i;
const HATE_OR_TARGETED=/(?:go back to your country|geh zurück\s+(?:in dein land|wo du herkommst)|ihr gehört\s+(?:hier\s+)?nicht\s+her|(?:alle|die)\s+\S{3,25}\s+(?:sollen|sollten|müssen)\s+(?:sterben|verrecken)|all\s+\S{3,25}\s+(?:should|must)\s+die)/i;
const PERSONAL_ATTACK=/(?:\b(?:du|ihr)\s+(?:bist|seid)\s+(?:doch\s+)?(?:alle\s+)?(?:dumm|bescheuert|idiot(?:en)?|hirnlos|abschaum)|\b(?:you|you.?re|you are)\s+(?:an?\s+)?(?:stupid|idiot|moron|trash)|halt\s+die\s+fresse|shut\s+the\s+fuck\s+up|fuck\s+you)/i;
function moderate(text,flags={}){
 const s=norm(text),lang=language(s),de=lang==='de',own=flags.ownPost===true;
 const tip=own?(de?' Auf deinem Beitrag je nach Schwere verbergen/löschen; Verstöße melden.':' On your post consider hiding/deleting; report violations.'):
 (de?' Auf fremden Beiträgen kannst du nicht selbst löschen; bei Verstößen melden.':' On other posts you cannot delete; report violations.');
 const result=(action,severity,label,reason,guidance,optionalReply)=>({action,severity,language:lang,label,reason,guidance:guidance+tip,optionalReply});
 if(DIRECT_THREAT.test(s)||HATE_OR_TARGETED.test(s))
  return result('report','high',de?'Schützen & melden':'Protect & report',de?'Mögliche Drohung oder Hassrede.':'Possible threat or hateful attack.',
   de?'Nicht öffentlich diskutieren. Belege sichern, über Instagram melden, Betroffene schützen; bei akuter Gefahr Behörden kontaktieren.':'Do not argue. Preserve evidence, report through Instagram, protect people affected; contact authorities in immediate danger.',false);
 if(PRIVATE.test(s))
  return result('review','privacy',de?'Private Angaben prüfen':'Review private information',de?'Mögliche private Daten oder @Handles.':'Potential private data or handles.',
   de?'Nicht weiterverbreiten; persönliche Angaben vor jeder Bearbeitung entfernen.':'Do not repeat private details; remove them before drafting.',false);
 if(flags.repeated===true)
  return result('end','medium',de?'Gespräch beenden':'End the exchange',de?'Wiederholte Angriffe wurden von dir markiert.':'You marked this as repeated attacks.',
   de?'Nicht weiter antworten. Bei Belästigung einschränken oder blockieren, bei Verstößen melden.':'Stop replying. Restrict or block harassment; report violations.',false);
 if(PERSONAL_ATTACK.test(s))
  return result('boundary','medium',de?'Einmal Grenze setzen':'Set one boundary',de?'Direkte persönliche Beleidigung.':'Direct personal insult.',
   de?'Höchstens einmal ruhig reagieren, dann aufhören.':'Reply calmly at most once, then disengage.',true);
 if(RAGE_SKIP.some(p=>p.test(s)))
  return result('optional_one','low',de?'Weiterziehen oder einmal antworten':'Move on or answer once',de?'Reiner Spott ohne echte Frage.':'Bait without a genuine question.',
   de?'Nicht ins Pingpong einsteigen. Ein kurzer Satz kann Mitlesenden die Haltung zeigen.':'Avoid a back-and-forth. One short reply may model civility to bystanders.',true);
 return result('answer','none',de?'Die Frage ernst nehmen':'Address the question',
  de?'Kein klarer persönlicher Angriff erkannt.':'No obvious personal attack detected.',
  de?'Sachlich und freundlich antworten, wenn die Quellen passen.':'Respond warmly and accurately if sources support it.',true);
}

function classify(text){
 const s=norm(text);
 if(s.length<9)return {state:'unknown',reason:'Kommentar zu kurz oder nicht erkennbar.'};
 if(s.length>1400)return {state:'unknown',reason:'Mehrere Kommentare oder zu viel Kontext – bitte den genauen Kommentar wählen.'};
 if(SENSITIVE.test(s)||PRIVATE.test(s))return {state:'unsafe',reason:'Sensible oder private Angaben: kein automatischer Antwortvorschlag.'};
 if(RAGE_SKIP.some(p=>p.test(s)))return {state:'skip',reason:'Reine Provokation ohne überprüfbare Frage. Empfehlung: keine Antwort; nicht jede Eskalation braucht Aufmerksamkeit.'};
 const variants=Object.entries(TOPICS).filter(([id,v])=>v.patterns.some(p=>p.test(s)));
 if(variants.length===0)return {state:'unknown',reason:'Dazu haben wir noch keinen redaktionell geprüften Gesprächsentwurf.'};
 // Only known supersets/semantic overlaps are resolved. Unrelated topics hold.
 if(variants.some(([id])=>id==='b12dose')&&variants.every(([id])=>['b12dose','b12'].includes(id)))return {state:'reviewed',id:'b12dose'};
 if(variants.some(([id])=>id==='life_ethics')&&variants.every(([id])=>['life_ethics','ethical_choice','sentience'].includes(id)))return {state:'reviewed',id:'life_ethics'};
 if(variants.some(([id])=>id==='both')&&variants.every(([id])=>['both','ethical_choice','sentience'].includes(id)))return {state:'reviewed',id:'both'};
 if(variants.some(([id])=>id==='ethical_choice')&&variants.every(([id])=>['ethical_choice','sentience'].includes(id)))return {state:'reviewed',id:'ethical_choice'};
 if(variants.some(([id])=>id==='painless_killing')&&variants.every(([id])=>['painless_killing','sentience'].includes(id)))return {state:'reviewed',id:'painless_killing'};
 if(variants.length>1)return {state:'unknown',reason:'Mehrere unterschiedliche Themen erkannt. Bitte den Kommentar präzisieren.'};
 return {state:'reviewed',id:variants[0][0]};
}
const LANGUAGE_WORDS={
 de:new Set('aber warum wieso wie doch und nicht kein keine einer einem einen eine ein der die das den dem des beim bei mit für zum zur von vom ich du mir dir ihr wir man wenn obwohl dass weil sondern sollte sollten können kann müsste müssen musst muss schmeckt schmecken fleisch tier tiere tierleid essen einfach besser teurer teuer ist sind sind es gibt schon mal auch ob ohne oder welche welcher woher bekommst bekommen überhaupt genügend genug werden wird ja was halten hältst hören schmerz fühlen'.split(' ')),
 en:new Set('why what how where when who whose should would could does do did the and but from with our your you we they them their that this these those can enough get getting animal animals suffering suffer pain feel matter choices choice food foods meat taste tastes better because if whether veganism isnt there are is have has why would compared rather still care shouldnt dont should just chemicals bro vegans vegan i will eat two more steaks steak to annoy too for only even now really here why does this'.split(' '))
};
function language(text){
 const words=(norm(text).toLowerCase().match(/[\p{L}]+/gu)||[]);
 let de=0,en=0;
 for(const word of words){
  if(LANGUAGE_WORDS.de.has(word))de++;
  if(LANGUAGE_WORDS.en.has(word))en++;
 }
 // Shared words (protein, vegan, vitamin, soy, b12) are intentionally neutral.
 // A one-word tie is not sufficient to switch away from German.
 if(en>=2 && en>de)return 'en';
 if(de>=1 && de>=en)return 'de';
 // Very short English replies: only trust unmistakable English syntax.
 if(en>=1 && de===0 && /\b(why|what|how|should|would|could|does|isnt|dont|because)\b/i.test(text))return 'en';
 return 'de';
}
function suggest(text,voice='momo',flags={}){
 const m=moderate(text,flags);
 if(['report','end','review'].includes(m.action))return {state:m.action,topic:m.label,language:m.language,moderation:m,reason:m.reason,evidenceStatus:'none',sources:[]};
 if(m.action==='boundary'){
  const id=Object.prototype.hasOwnProperty.call(VOICES,voice)?voice:'kiki';
  return {state:'boundary',topic:m.label,language:m.language,voice:id,moderation:m,text:BOUNDARY_REPLIES[m.language][id],
   evidenceStatus:'editorial',summary:m.reason,limitation:m.guidance,sources:[]};
 }
 const result=classify(text);
 if(result.state==='skip'){
  const lang=language(text),id=Object.prototype.hasOwnProperty.call(VOICES,voice)?voice:'kiki';
  const kind=/steaks?|schnitzel|burgers?/i.test(text)?'steak':'generic';
  return {...result,language:lang,voice:id,topic:'Reine Provokation',moderation:m,
   text:RAGE_REPLY[kind][lang][id],evidenceStatus:'editorial',recommendedAction:'no_reply_or_one',
   summary:'Keine faktische Prüfung nötig: ein optionaler Gesprächsversuch für Mitlesende. Keine weitere Eskalation.',
   limitation:'Ein einziger respektvoller Satz ist optional. Nicht antworten bleibt eine gute Entscheidung.',
   sources:[]};
 }
 if(result.state!=='reviewed')return result;
 const t=TOPICS[result.id],lang=language(text);
 const id=Object.prototype.hasOwnProperty.call(VOICES,voice)?voice:'momo';
 const candidate=id==='momo'?t.answer[lang]:VARIANTS[result.id]?.[id]?.[lang];
 return {...result,topic:t.name,voice:id,voiceLabel:VOICES[id].label,language:lang,moderation:m,
  evidenceStatus:t.evidenceStatus||'source_linked',text:candidate||t.answer[lang],
  sources:t.sources,summary:t.summary,limitation:t.limitation,reviewedAt:REVIEWED_AT};
}
const DEFAULT_REASON={
 factual:'Sachfrage → zuerst eine klare, belegte Erklärung.',
 reflective:'Ethischer oder persönlicher Einwand → zuerst respektvoll anerkennen.',
 objection:'Skeptische Frage → zuerst die Sorge ernst nehmen.'
};
function recommendVoice(text,topicId){
 const s=norm(text).toLowerCase();
 // No hidden moral persuasion optimisation: prefer clear, civil engagement.
 if(TOPICS[topicId]?.defaultVoice)return TOPICS[topicId].defaultVoice;
 if(['taste','cost','ethical_choice','painless_killing','life_ethics'].includes(topicId))return 'kiki';
 if(topicId==='crop'||topicId==='sentience')return 'kiki';
 if(topicId==='forest'&&/(aber|doch|but|really|fake|lüg|gefälscht)/i.test(s))return 'kiki';
 if(topicId==='protein'&&/(kann ich|could i|i want|möchte|wie schaffe|muskelaufbau|krafttraining)/i.test(s))return 'kiki';
 return 'momo';
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
const API={VERSION,REVIEWED_AT,TOPICS,VOICES,VARIANTS,COMMUNITY_CODE,classify,suggest,moderate,language,recommendVoice,normalReplyLabel,extractComment};
if(typeof module==='object'&&module.exports)module.exports=API;
// Dedicated quality lab may inspect pure decision functions, but no Instagram UI is mounted.
if(root?.document&&root.location?.pathname==='/quality-review.html'){root.AV_QUALITY_CORE=API;return;}
if(root?.document&&root.location?.pathname==='/community-code.html'){root.AV_COMMUNITY_CORE=API;return;}
if(root?.document&&root.location?.pathname==='/live.html'){root.AV_LIVE_CORE=API;return;}
if(!root?.document||!root?.location)return;
const demo=root.location.pathname.startsWith('/instagram-demo');
if(!demo&&!/^\/?(?:www\.)?instagram\.com$/i.test(root.location.hostname))return;
if(root.__AV_INSTAGRAM_ACTIVE__)return;
root.__AV_INSTAGRAM_ACTIVE__=true;
const doc=root.document,seen=new WeakSet();
let selected=null,replyTrigger=null,sheet=null,overlayRoot=null,pickMode=false,observer=null,scanTimer=0,aiEditorCode=null;
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
function aiTransport(payload,editorCode){
 const options={method:'POST',url:'https://animal-voices-os.vercel.app/api/coach',timeout:47000,
  headers:{'Content-Type':'application/json','x-avos-editor':editorCode},data:JSON.stringify(payload),
  responseType:'text'};
 return new Promise((resolve,reject)=>{
  let settled=false;
  const success=result=>{
   if(settled)return;settled=true;
   let body;
   try{body=JSON.parse(result.responseText||result.response||'{}')}catch{return reject(Error('KI-Antwort konnte nicht gelesen werden.'))}
   if(Number(result.status)!==200||body.ok!==true)return reject(Error(body.error||'Die KI konnte den Kommentar nicht sicher bearbeiten.'));
   resolve(body);
  };
  const fail=()=>{if(settled)return;settled=true;reject(Error('Keine Verbindung zur KI. Die lokalen Antworten bleiben verfügbar.'))};
  try{
   const request=typeof GM!=='undefined'&&typeof GM.xmlHttpRequest==='function'?GM.xmlHttpRequest:
    typeof GM_xmlhttpRequest==='function'?GM_xmlhttpRequest:null;
   if(!request){reject(Error('Dein Userscript-Manager unterstützt den privaten KI-Zugriff noch nicht.'));return}
   const output=request({...options,onload:success,onerror:fail,ontimeout:fail,onabort:fail});
   if(output?.then)output.then(success,fail);
  }catch{fail()}
 });
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
 .ai-controls{border:1px solid #d8e7d6;background:#f1f7ee;border-radius:12px;margin:11px 0;padding:12px}
 .ai-controls .ai-consent{display:flex;align-items:flex-start;gap:8px;font-size:11px;color:#5a765d;line-height:1.5;margin:9px 0}
 .ai-consent input{margin-top:2px;width:17px;height:17px;flex:none;accent-color:#347c55}
 .ai-trigger{width:100%;padding:11px;background:#e0ede2;color:#27593a;font-weight:800;border:1px solid #cae0d0;min-height:44px}
 .ai-note{font-size:10px;color:#79947d;line-height:1.5;margin:7px 0 0}
 .ai-progress{font-size:11px;color:#35664c;font-weight:700;margin:8px 0 0}
 .ai-state{font-size:11px;color:#81662c;margin:6px 0 0}
 .mod{border:1px solid #d9e5d5;border-radius:12px;background:#f7faf3;padding:12px;margin:13px 0 10px}
 .mod-title{display:flex;align-items:center;justify-content:space-between;gap:7px;font-size:13px;color:#355e44;font-weight:800}
 .mod-title span:last-child{font-weight:600;color:#7b977e;font-size:10px}
 .mod-reason{color:#687f6d;font-size:12px;line-height:1.5;margin:6px 0}
 .mod-context{border-top:1px solid #e0eadb;padding:7px 0 0;margin:8px 0 0}
 .mod-context summary{font-size:11px}
 .mod-context label{display:flex;gap:9px;align-items:flex-start;color:#54745c;font-size:11px;padding:8px 0;cursor:pointer}
 .mod-context input{width:17px;height:17px;flex:none;accent-color:#286344}
 .mod-more{font-size:11px;color:#698873;line-height:1.5;margin:7px 0}
 .mod-code{font-size:11px;font-weight:800;color:#42714f}
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
 <section class="mod" aria-label="Animal Voices Moderationsempfehlung">
  <div class="mod-title"><span id="av-mod-label">Gespräch einschätzen</span><span>Empfehlung · kein Automatismus</span></div>
  <p class="mod-reason" id="av-mod-reason"></p>
  <details class="mod-context" id="av-mod-context"><summary>Kontext & Grenzen prüfen</summary>
   <label><input type="checkbox" id="av-repeat">Dieser Account greift wiederholt an / trollt</label>
   <label><input type="checkbox" id="av-own">Der Kommentar steht auf meinem eigenen Beitrag</label>
   <p id="av-mod-guide" class="mod-more"></p>
   <a class="mod-code" href="https://animal-voices-os.vercel.app/community-code.html" target="_blank" rel="noopener noreferrer">Unser Community Code ↗</a>
  </details>
 </section>
 <div class="row" style="margin-top:11px"><strong style="font-size:12px">Antwortvorschlag</strong><span class="pill" id="av-status-pill">Wird geprüft</span></div>
 <p class="micro" id="av-topic"></p>
 <div class="voices" role="group" aria-label="Antwortstimme wählen">
  <button type="button" data-av-voice="momo" aria-pressed="true">✦ Klar</button>
  <button type="button" data-av-voice="kiki" aria-pressed="false">♡ Warm</button>
  <button type="button" data-av-voice="bao" aria-pressed="false">☀ Locker</button>
  <button type="button" data-av-voice="curious" aria-pressed="false">? Neugierig</button>
 </div>
 <div class="row"><span class="voice-hint" id="av-voice-hint">Momo · Klar und faktenorientiert</span><button type="button" id="av-next-voice" class="alt">Andere Antwort ↻</button></div>
 <button type="button" id="av-optin" class="secondary" hidden style="width:100%;margin:7px 0">Optional: einmal respektvoll antworten ↗</button>
 <section class="ai-controls" id="av-ai-controls" aria-label="Privater KI-Coach">
  <button type="button" class="ai-trigger" id="av-ai-run">✦ Mit KI den Kontext verstehen · Beta</button>
  <label class="ai-consent"><input type="checkbox" id="av-ai-consent">Ich stimme zu, dass <strong>nur dieser bereinigte Kommentar</strong> an Animal Voices und den KI-Anbieter übermittelt wird. Keine automatische Veröffentlichung.</label>
  <p class="ai-note">Privater Testzugang · Editor-Code wird nur im Browserdialog abgefragt und nicht gespeichert. Modellcheck prüft Quellenkarten, keine Originalstudien live.</p>
  <p class="ai-progress" role="status" aria-live="polite" id="av-ai-progress"></p>
 </section>
 <textarea id="av-proposal" rows="3" maxlength="1200" placeholder="Für diese Frage liegt noch keine vorab geprüfte Antwort vor."></textarea>
 <details id="av-evidence" open><summary>Belege, Grenzen & Einordnung ansehen</summary><div id="av-sources"></div></details>
 <p class="micro" id="av-hint">Keine automatische Veröffentlichung. Deine Übernahme ist immer freiwillig.</p>
 <div class="actions"><button class="secondary" id="av-copy">Kopieren</button><button class="primary" id="av-insert">Antwort übernehmen ↗</button></div>
 <p class="status" role="status" aria-live="polite" id="av-feedback"></p>
 </div>`;
 doc.body.append(host);
 sheet=host;overlayRoot=shadow;
 const box=shadow.getElementById('av-comment'),proposal=shadow.getElementById('av-proposal'),feedback=shadow.getElementById('av-feedback');
 const repeated=shadow.getElementById('av-repeat'),ownPost=shadow.getElementById('av-own');
 let proposalModified=false,currentVoice='momo',lastTopicKey=null,optedIn=false,aiDraft=null,aiBusy=false;
 box.value=selected.text;
 const initial=classify(box.value);
 if(initial.state==='reviewed')currentVoice=recommendVoice(box.value,initial.id);
 if(initial.state==='skip')currentVoice='kiki';
 shadow.getElementById('av-close').addEventListener('click',closePanel);
 function update(){
  proposalModified=false;
  const selectedTopic=classify(box.value);
  if(lastTopicKey!==norm(box.value)){
   optedIn=false;aiDraft=null;
   shadow.getElementById('av-ai-progress').textContent='';
   if(selectedTopic.state==='reviewed')currentVoice=recommendVoice(box.value,selectedTopic.id);
   if(selectedTopic.state==='skip')currentVoice='kiki';
  }
  lastTopicKey=norm(box.value);
  const baseline=suggest(box.value,currentVoice,{repeated:repeated.checked,ownPost:ownPost.checked});
  const canUseAI=aiDraft&&aiDraft.comment===norm(box.value)&&
    !['report','review','end','boundary','skip','unsafe'].includes(baseline.state);
  const result=canUseAI?{...baseline,state:'reviewed',id:aiDraft.topic_id,topic:aiDraft.topic,
    text:aiDraft.variants[currentVoice],sources:aiDraft.sources,summary:aiDraft.source_summary,
    limitation:aiDraft.limitations,evidenceStatus:'model_reviewed',reviewedAt:REVIEWED_AT}:baseline;
  const pill=shadow.getElementById('av-status-pill'),src=shadow.getElementById('av-sources');
  const mod=result.moderation||moderate(box.value,{repeated:repeated.checked,ownPost:ownPost.checked});
  shadow.getElementById('av-mod-label').textContent=(result.state==='unknown'||result.state==='unsafe')?'Manuell prüfen':mod.label;
  shadow.getElementById('av-mod-reason').textContent=result.state==='unknown'?'Noch kein passender belegter Antwortentwurf. Nicht raten.':mod.reason;
  shadow.getElementById('av-mod-guide').textContent=mod.guidance;
  src.replaceChildren();feedback.textContent='';
  shadow.querySelectorAll('[data-av-voice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.avVoice===currentVoice)));
  const descriptions={momo:'Momo · Fakten & Klarheit',kiki:'Kiki · Warm & zugewandt',bao:'Bao · Locker & sympathisch',curious:'Neugier · Eine offene Frage'};
  shadow.getElementById('av-voice-hint').textContent=descriptions[currentVoice]+' · 4 unterschiedliche Antworten';
  const canDraft=result.state==='reviewed'||result.state==='boundary'||(result.state==='skip'&&optedIn);
  shadow.getElementById('av-optin').hidden=result.state!=='skip'||optedIn;
  if(canDraft){
   pill.textContent=result.evidenceStatus==='model_reviewed'?'KI · Modellcheck bestanden':result.state==='boundary'?'Grenze setzen · optional':result.state==='skip'?'Einmalige Antwort · freiwillig':(result.evidenceStatus==='editorial'?'Redaktioneller Gesprächsentwurf':'✓ Faktenbasis vorab geprüft');
   pill.className=result.state==='skip'||result.state==='boundary'||['editorial','model_reviewed'].includes(result.evidenceStatus)?'pill unverified':'pill';
   shadow.getElementById('av-topic').textContent=result.topic+' · '+(result.evidenceStatus==='model_reviewed'?'KI-Entwurf · Quellenkarten geprüft · Originalquellen bitte selbst kontrollieren':result.state==='skip'||result.state==='boundary'?'Höchstens eine ruhige Antwort':result.evidenceStatus==='editorial'?'ethische / praktische Einordnung':'Quellenstand '+result.reviewedAt)+' · kein Live-Check';
   proposal.value=result.text;proposal.readOnly=false;
   const p=make('p',{},result.summary);p.className='micro';src.append(p);
   for(const ref of result.sources){const a=make('a',{},ref.name+' ↗');a.href=ref.url;a.target='_blank';a.rel='noopener noreferrer';a.className='source';src.append(a,make('div'))}
   const lim=make('p',{},'Grenze: '+result.limitation);lim.className='micro';src.append(lim);
   shadow.getElementById('av-evidence').open=false;
  }else{
   pill.textContent=result.state==='report'?'Schützen & melden':result.state==='end'?'Gespräch beenden':result.state==='review'?'Private Angaben schützen':result.state==='skip'?'Lieber nicht antworten':'Nicht vorab geprüft';pill.className='pill unverified';
   shadow.getElementById('av-topic').textContent=result.reason;
   proposal.value='';proposal.readOnly=true;
   const message=result.state==='skip'?'Reine Provokation. Höchstens eine freundliche Antwort für Mitlesende – oder einfach weitergehen.':result.state==='report'?'Nicht antworten. Hinweise sichern, über Instagram melden und Betroffene schützen.':result.state==='end'?'Keine weitere öffentliche Runde. Bei Belästigung einschränken oder blockieren.':result.state==='review'?'Private Angaben nicht verbreiten. Kommentar vor einer Antwort anonymisieren.':'Kein belegter Entwurf. Bitte den konkreten Kontext manuell prüfen.';
   const p=make('p',{},message);p.className='micro alert';src.append(p);
   shadow.getElementById('av-evidence').open=true;
  }
  shadow.getElementById('av-copy').disabled=!canDraft;
  shadow.getElementById('av-insert').disabled=!canDraft;
  selected.suggestion=result;
 }
 shadow.getElementById('av-optin').addEventListener('click',()=>{
  if(classify(box.value).state!=='skip')return;
  optedIn=true;update();
 });
 shadow.getElementById('av-ai-run').addEventListener('click',async()=>{
  const progress=shadow.getElementById('av-ai-progress');
  if(aiBusy)return;
  if(!shadow.getElementById('av-ai-consent').checked){
   progress.textContent='Bitte zuerst ausdrücklich der Übermittlung dieses Kommentars zustimmen.';return;
  }
  const value=norm(box.value),m=moderate(value,{repeated:repeated.checked,ownPost:ownPost.checked});
  if(m.action!=='answer'){
   progress.textContent='Hier empfehlen wir zuerst die Moderationsentscheidung, keine KI-Generierung.';return;
  }
  if(value.length<10||value.length>900||PRIVATE.test(value)||/https?:\/\//i.test(value)){
   progress.textContent='Kommentar bitte auf 10–900 Zeichen begrenzen und Handles, Links sowie Kontaktdaten entfernen.';return;
  }
  if(!aiEditorCode){
   const entered=root.prompt?.('Privater Animal Voices Editor-Code (nur für diesen Browser-Tab, nicht gespeichert):');
   if(!entered)return;
   if(entered.length<16){progress.textContent='Ein gültiger privater Editor-Code ist erforderlich.';return}
   aiEditorCode=entered;
  }
  aiBusy=true;
  const button=shadow.getElementById('av-ai-run');button.disabled=true;
  progress.textContent='KI versteht Anliegen und Kontext; formuliert vier Stimmen; zweite Modellprüfung läuft …';
  try{
   const answer=await aiTransport({comment:value,consent:true},aiEditorCode);
   if(!sheet||!sheet.isConnected||norm(box.value)!==value)return;
   aiDraft={...answer,comment:value};
   currentVoice=VOICES[answer.recommended_voice]?answer.recommended_voice:'kiki';
   update();
   progress.textContent='✓ Vier neue KI-Entwürfe. Quellen- und Kontextgrenzen bitte vor Freigabe prüfen.';
  }catch(err){
   if(!sheet||!sheet.isConnected)return;
   const message=String(err?.message||'KI nicht verfügbar');
   if(/Editor-Zugang|privat|401|Zugang/i.test(message))aiEditorCode=null;
   progress.textContent=message+' · Die lokalen Antworten bleiben erhalten.';
  }finally{aiBusy=false;if(button?.isConnected)button.disabled=false}
 });
 box.addEventListener('input',update);
 repeated.addEventListener('change',update);
 ownPost.addEventListener('change',update);
 shadow.querySelectorAll('[data-av-voice]').forEach(button=>button.addEventListener('click',()=>{
  if(currentVoice===button.dataset.avVoice)return;
  currentVoice=button.dataset.avVoice;update();
 }));
 shadow.getElementById('av-next-voice').addEventListener('click',()=>{
  const ids=Object.keys(VOICES);
  currentVoice=ids[(ids.indexOf(currentVoice)+1)%ids.length];update();
 });
 proposal.addEventListener('input',()=>{
  if(!canPublishDraft())return;
  proposalModified=true;
  const pill=shadow.getElementById('av-status-pill');
  pill.textContent='Entwurf verändert · nicht vorab geprüft';pill.className='pill unverified';
  feedback.textContent='Du hast die geprüfte Vorlage verändert. Bitte neue Tatsachenbehauptungen selbst belegen. Veröffentlicht wird nichts automatisch.';
 });
 update();
 function canPublishDraft(){
  return selected?.suggestion?.state==='reviewed'||selected?.suggestion?.state==='boundary'||(selected?.suggestion?.state==='skip'&&optedIn);
 }
 async function copy(){
  if(!canPublishDraft())return false;
  const text=norm(proposal.value);
  if(!text){feedback.textContent='Bitte zuerst einen Antworttext eintragen.';return false;}
  try{await root.navigator.clipboard.writeText(text);closePanel();toast('Antwort kopiert. Jetzt direkt in Instagram einfügen und selbst senden.');return true}
  catch{proposal.focus();proposal.select();feedback.textContent='Text markiert. Wähle „Kopieren“ über das Textmenü.';return false}
 }
 shadow.getElementById('av-copy').addEventListener('click',copy);
 shadow.getElementById('av-insert').addEventListener('click',async()=>{
  if(!canPublishDraft())return;
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

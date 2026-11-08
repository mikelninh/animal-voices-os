/* Animal Voices v0.9.5 — Context Fit.
 * Curated editorial replies for different conversation intents.
 * No LLM inference, no live verification, no automatic posting.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.AV_CONTEXT_FIT=api;
})(typeof window!=='undefined'?window:undefined,function(){
'use strict';
const REPLIES={
 strength:{
  question:{
   momo:'Ja, Krafttraining funktioniert auch mit veganer Ernährung. In einer kleinen kontrollierten Studie mit 38 Männern erzielten Veganer und Omnivore bei vergleichbarer Proteinzufuhr ähnliche Muskel- und Kraftzuwächse. Das ist ein hilfreicher Befund, aber noch kein Beweis für Gleichwertigkeit in jeder Situation. 💪',
   kiki:'Du fragst, ob man vegan stark werden kann? Ja, das ist möglich. In einer kleinen Trainingsstudie entwickelten vegane und omnivore Männer bei ähnlicher Proteinzufuhr vergleichbare Zuwächse. Schön eigentlich: Man muss Kraft und Mitgefühl nicht gegeneinander ausspielen. 💚',
   bao:'Geht Muskelaufbau ohne Steak? Mein Seitan sagt: Herausforderung angenommen. 😄 In einer kleinen Trainingsstudie waren die Zuwächse bei Veganern und Omnivoren mit vergleichbarer Proteinzufuhr ähnlich. Entscheidend ist auch, wie du trainierst und isst.'
  },
  skeptic:{
   momo:'Dass Protein und Training wichtig sind, stimmt. Aber „vegan = schwach“ ist wissenschaftlich nicht belegt: Eine Meta-Analyse randomisierter Studien fand keinen signifikanten Kraftunterschied zwischen den untersuchten Ernährungsformen. Die Studienlage ist noch begrenzt; daraus folgt keine Garantie für jeden Menschen.',
   kiki:'Ich verstehe, warum das erstmal unplausibel wirken kann. Aber die bisherigen kontrollierten Studien zeigen keinen signifikanten Kraftnachteil pflanzenbasierter Ernährung. Die Evidenz hat Grenzen – trotzdem müssen wir körperliche Stärke nicht an Fleischkonsum knüpfen. 💚',
   bao:'Fair: Muskeln brauchen Training und gutes Essen. Aber Fleisch ist keine Eintrittskarte ins Fitnessstudio. 😄 Eine Meta-Analyse fand keinen signifikanten Kraftunterschied bei den untersuchten Ernährungsformen; die Datenlage ist noch begrenzt.'
  }
 },
 b12:{
  question:{
   momo:'Gute Frage. B12 ist für Blutbildung und Nervensystem wichtig. Bei veganer Ernährung muss es zuverlässig supplementiert werden. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene dennoch für möglich und potenziell gesundheitsfördernd – andere kritische Nährstoffe bleiben wichtig.',
   kiki:'Schön, dass du nachfragst. 💚 Bei veganer Ernährung gehört B12 zuverlässig dazu, am besten als Supplement. Das zu sagen ist kein Widerspruch zu Mitgefühl: Die DGE sieht für gesunde Erwachsene eine gut geplante vegane Ernährung als möglich an.',
   bao:'B12 ist wirklich ein Muss – mein Tofu kann es leider nicht herbeizaubern. 😄 Vegan lebende Menschen sollten B12 zuverlässig ergänzen. Das ist laut DGE Teil guter Planung, kein Grund, die ganze Ernährungsform pauschal abzuschreiben.'
  },
  skeptic:{
   momo:'Ja: B12 ist ein berechtigter Einwand, denn bei veganer Ernährung muss es ergänzt werden. Entscheidend ist aber die Versorgung mit Nährstoffen, nicht ob jedes Vitamin ohne Supplement kommt. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem für möglich.',
   kiki:'Da sprichst du etwas Wichtiges an. Ich würde B12 nie kleinreden: Es muss ergänzt werden. Gleichzeitig wäre es unfair, daraus zu schliessen, dass vegane Ernährung grundsätzlich ungesund ist. Beides lässt sich ehrlich anerkennen. 💚',
   bao:'Beim B12 haben wir einen Deal: Wir tun nicht so, als käme es magisch aus Brokkoli. 😄 Es muss bei veganer Ernährung ergänzt werden. Und ja, die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem für möglich.'
  }
 },
 protein:{
  question:{
   momo:'Ja, pflanzliche Lebensmittel können ausreichend Protein liefern. Tofu, Hülsenfrüchte und Seitan sind Beispiele; entscheidend sind Gesamtzufuhr und individueller Bedarf. Eine Trainingsstudie zeigte bei vergleichbarer Proteinzufuhr ähnliche Kraft- und Muskelzuwächse.',
   kiki:'Du möchtest sicher sein, dass du genug Protein bekommst? Eine gute Frage. 💚 Bohnen, Linsen, Tofu und Seitan können helfen. Wie viel du brauchst, hängt auch von dir und deinem Alltag ab.',
   bao:'Protein ohne Fleisch? Linsen, Bohnen, Tofu und Seitan sind schon am Start. 😄 Wichtig ist, dass du insgesamt ausreichend isst und deine Bedürfnisse deckst. Wenn du magst, suchen wir ein richtig gutes Gericht dafür.'
  },
  skeptic:{
   momo:'Der Proteinbedarf ist ein legitimes Thema. Doch Fleisch ist nicht die einzige Quelle: Hülsenfrüchte, Soja und Seitan können beitragen. Bei vergleichbarer Proteinzufuhr fand eine kleine Trainingsstudie ähnliche Zuwächse; das ersetzt keine individuelle Ernährungsplanung.',
   kiki:'Dass du dir um Protein Gedanken machst, verstehe ich. Gesundheit sollte immer zuerst kommen. Die gute Nachricht: Pflanzliche Lebensmittel können Protein liefern – die konkrete Menge und Auswahl müssen zu den eigenen Bedürfnissen passen. 💚',
   bao:'Skepsis okay. Aber mein Tofu will auch auf die Proteinliste. 😄 Fleisch ist nicht die einzige Quelle; auf Menge, Mischung und Bedarf kommt es an. Am besten vergleichen wir ein konkretes Tagesessen statt Schlagwörter.'
  }
 },
 soy:{
  question:{
   momo:'Die verfügbaren klinischen Daten sprechen nicht für die pauschale Testosteron-Behauptung. Eine Meta-Analyse von 41 Studien fand keine signifikanten Veränderungen der untersuchten männlichen Sexualhormone durch Soja oder Isoflavone. Das gilt für diese Messwerte, nicht für jede denkbare Gesundheitsfrage.',
   kiki:'Die Soja-Gerüchte können verunsichern. 💚 Eine Meta-Analyse von 41 klinischen Studien fand keine signifikanten Veränderungen der untersuchten männlichen Sexualhormone durch Soja. Für mich ist das ein guter Grund, die Forschung statt Memes anzuschauen.',
   bao:'Macht Tofu etwas mit dem Testosteron? Mein Tofu ist unschuldig, bis die Daten etwas anderes zeigen. 😄 Eine Meta-Analyse aus 41 klinischen Studien fand keinen signifikanten Effekt auf die untersuchten männlichen Sexualhormone.'
  },
  skeptic:{
   momo:'Die Sorge ist nachvollziehbar, weil Soja Isoflavone enthält. Aber aus dem Inhaltsstoff folgt nicht automatisch eine Hormonwirkung beim Menschen. Eine Meta-Analyse von 41 klinischen Studien fand keine signifikanten Effekte auf die untersuchten männlichen Sexualhormone.',
   kiki:'Vielleicht hast du die Behauptung schon oft gehört. Sie klingt eingängig, aber eine Meta-Analyse von 41 klinischen Studien stützt keinen signifikanten Effekt von Soja auf die untersuchten männlichen Sexualhormone. Lass uns auf die Messungen schauen. 💚',
   bao:'Ich verstehe den Verdacht – Soja hat wirklich den schlechtesten PR-Berater. 😄 Aber die Meta-Analyse aus 41 klinischen Studien fand keine signifikanten Effekte auf die untersuchten männlichen Hormone. Ein gutes Meme ist eben noch keine Studie.'
  }
 },
 crop:{
  question:{
   momo:'Ja, beim Pflanzenanbau können Tiere verletzt oder getötet werden. Die Zahlen sind unsicher und schwer zu vergleichen. Für mich ist die relevante Frage, wie wir möglichst viel vermeidbares Leid reduzieren – auch durch bessere Anbaumethoden und weniger Flächenbedarf.',
   kiki:'Ja, und diese Tiere zählen genauso. ❤️ Es wäre unehrlich, eine völlig leidfreie Landwirtschaft zu versprechen. Wir wissen nicht genau, wie viele Tiere bei der Ernte sterben. Gerade deshalb sollten wir auch die Landwirtschaft tierfreundlicher machen.',
   bao:'Leider ja: Selbst beim Anbau pflanzlicher Lebensmittel können Tiere sterben. Null Leid kann mein Küchentopf nicht garantieren. Aber weniger vermeidbares Leid ist trotzdem ein sinnvolles Ziel – auch auf dem Feld. 🌱'
  },
  skeptic:{
   momo:'Du hast recht, wenn du daran erinnerst, dass Pflanzenbau nicht schadensfrei ist. Verlässliche Opferzahlen fehlen allerdings. Zugleich zeigen globale Modelle einen hohen Flächenbedarf der Tierhaltung. Beide Punkte gehören in einen fairen Vergleich, keine erfundene Exaktheit.',
   kiki:'Das ist ein wichtiger Einwand. Auch die Mäuse auf den Feldern haben ein Leben. ❤️ Ich möchte ihr Leid nicht wegdiskutieren. Eine sinnvolle Frage wäre, welche Ernährungssysteme insgesamt weniger vermeidbaren Schaden verursachen – mit ehrlichen Unsicherheiten.',
   bao:'Guter Punkt, und den sollte niemand einfach weglachen: Auch auf Feldern kann Tierleid entstehen. Wir haben keine präzise Gesamtbilanz. Aber „nicht perfekt“ bedeutet für mich nicht „egal“ – wir können Landwirtschaft und Ernährung verbessern.'
  }
 },
 forest:{
  question:{
   momo:'Ja, Sojaanbau kann mit Entwaldung zusammenhängen. Historische globale Daten zeigen allerdings, dass der überwiegende Teil von Soja als Tierfutter verwendet wurde. Für die Bewertung eines konkreten Tofus muss man seine Herkunft getrennt prüfen.',
   kiki:'Regenwälder zu schützen ist wichtig. 🌳 Soja kann zu Entwaldung beitragen, aber historisch ging der Grossteil der weltweiten Ernte in Tierfutter. Darum lohnt der Blick auf Herkunft und Verwendung – statt Tofu pauschal verantwortlich zu machen.',
   bao:'Kann Tofu zur Entwaldung beitragen? Ja, die Herkunft zählt. Aber global wanderte Soja historisch überwiegend ins Tierfutter. Die Bohne hat eben mehr Jobs als Tofu zu werden. 😄'
  },
  skeptic:{
   momo:'Entwaldung durch Sojaanbau ist kein erfundenes Problem. Die Schlussfolgerung „also ist Tofu der Haupttreiber“ greift aber zu kurz: In globalen historischen Daten wurde der überwiegende Teil des Sojas als Tierfutter verwendet. Konkrete Lieferketten muss man einzeln prüfen.',
   kiki:'Deine Sorge um den Regenwald kann ich gut nachvollziehen. 🌳 Soja spielt eine Rolle bei Entwaldung – aber die weltweite Verwendung ist entscheidend: Historisch wurde der Grossteil verfüttert. Wir sollten gemeinsam bessere Lieferketten fordern.',
   bao:'Regenwaldschutz: unbedingt. Aber beim Blick auf Soja bitte nicht nur den Tofu festnehmen. 😄 Historisch wurde der Grossteil der globalen Sojaernte als Tierfutter verwendet. Für einzelne Produkte gilt: Lieferkette prüfen.'
  }
 },
 climate:{
  question:{
   momo:'Eine stärker pflanzliche Ernährung kann laut globalen Landnutzungsmodellen viel Agrarfläche einsparen. Wie gross die Wirkung wirklich ist, hängt von Lebensmitteln und Produktion ab. Es ist Potenzial auf Systemebene, keine Garantie für eine einzelne Mahlzeit.',
   kiki:'Ja, unsere Ernährung kann Lebensräume und Klima beeinflussen. 🌱 Modelle zeigen, dass stärker pflanzliche Ernährung weniger Agrarfläche brauchen kann. Keine Mahlzeit rettet allein den Planeten – aber gemeinsame Veränderungen können sinnvoll sein.',
   bao:'Rettet ein Haferdrink die Welt? So einfach leider nicht. 😄 Aber globale Modelle zeigen: Mehr pflanzliche Ernährung könnte viel Agrarfläche einsparen. Es kommt auch auf Herkunft, Anbau und das gesamte System an.'
  },
  skeptic:{
   momo:'Skepsis bei grossen Umweltaussagen ist sinnvoll. Globale Modelle zeigen jedoch deutliches Potenzial für weniger Agrarfläche bei stärker pflanzlicher Ernährung. Das ist ein Szenario, kein gemessener Effekt jeder einzelnen Person.',
   kiki:'Du hast recht: Ein einzelner Einkauf ändert nicht alles. Trotzdem beeinflussen Ernährungssysteme, wie viel Land wir nutzen. Modelle zeigen Potenzial für weniger Agrarfläche durch mehr Pflanzen – und das macht Hoffnung. 🌱',
   bao:'Mein Mittagessen trägt keinen Superheldenumhang. 😄 Aber „bringt gar nichts“ ist ebenfalls zu pauschal: Globale Modelle zeigen Flächenpotenzial durch stärker pflanzliche Ernährung. Der konkrete Effekt hängt davon ab, was wir ersetzen.'
  }
 },
 sentience:{
  question:{
   momo:'Ja, auch sogenannte Nutztiere können Schmerz und andere Belastungen erleben. Die EFSA beschreibt bei Schweinen beispielsweise Angst und Schmerzen; die EU erkennt Tiere rechtlich als fühlende Wesen an. Wie einzelne Tiere erleben, kann unterschiedlich sein.',
   kiki:'Was Tiere fühlen können, ist eine gute Frage. ❤️ Die EFSA beschreibt bei Schweinen Angst und Schmerz, und die EU erkennt Tiere als fühlende Wesen an. Für mich bedeutet das: Wir sollten ihre Erfahrungen ernst nehmen.',
   bao:'Können Schweine Gefühle und Schmerzen erleben? Ja – auch die EFSA beschäftigt sich mit Angst und Schmerz bei Schweinen. Deshalb verdienen sie Rücksicht, nicht nur einen Platz auf der Speisekarte. 🐷'
  },
  skeptic:{
   momo:'Über menschliche Begriffe wie „Gefühle“ kann man diskutieren. Aber die Fähigkeit von Schweinen, Schmerz und Angst zu erleben, ist in EFSA-Bewertungen dokumentiert. Die EU erkennt Tiere ausdrücklich als fühlende Wesen an.',
   kiki:'Du musst einem Schwein keine menschliche Persönlichkeit zuschreiben, um sein Leid ernst zu nehmen. ❤️ Schmerz und Angst sind relevante Tierwohlbelastungen, die auch die EFSA beschreibt.',
   bao:'Wir müssen nicht behaupten, Schweine wären kleine Menschen. 🐷 Dass Schweine Schmerz und Angst erleben können, ist aber wissenschaftlich begründet. Und das sollte für unseren Umgang mit ihnen zählen.'
  }
 },
 nature:{
  question:{
   momo:'Ja, manche Tiere fressen andere Tiere. Das beantwortet für sich noch nicht die ethische Frage, wie Menschen mit eigenen Wahlmöglichkeiten handeln sollten. Naturbeobachtung und moralische Entscheidung sind unterschiedliche Ebenen.',
   kiki:'In der Natur jagen manche Tiere, um zu überleben. Wir Menschen können häufig bewusster wählen. Mich beschäftigt dabei: Wie gehen wir mit dieser Möglichkeit um, vermeidbares Leid zu reduzieren? 🐔',
   bao:'Löwen essen andere Tiere, das stimmt. Zum Glück muss ich mein Abendessen nicht wie ein Löwe jagen. 😄 Ob wir etwas können und ob wir es tun möchten, sind unterschiedliche Fragen.'
  },
  skeptic:{
   momo:'Dass Fleischkonsum in der Natur vorkommt, ist korrekt. Daraus folgt aber keine moralische Pflicht für Menschen. Die Frage ist nicht nur, was natürlich ist, sondern was wir verantwortbar entscheiden können.',
   kiki:'Du hast recht: Die Natur ist nicht immer friedlich. ❤️ Gerade deshalb berührt mich, dass wir Menschen Leid manchmal bewusst vermeiden können. Das ist eine Wertfrage, kein Angriff auf jemanden.',
   bao:'Wenn Löwen mein Menü planen, wird es wild. 😄 Aber „in der Natur passiert es“ beantwortet noch nicht, was wir Menschen mit unseren Möglichkeiten tun sollten.'
  }
 },
 taste:{
  question:{
   momo:'Geschmack ist sehr persönlich. Wenn du pflanzliche Alternativen ausprobieren möchtest, wäre ein guter Start dein Lieblingsgericht: Welche Zutaten und Gewürze machen es für dich besonders?',
   kiki:'Essen verbindet uns mit Familie und Erinnerungen. ❤️ Vielleicht gibt es eine Version deines Lieblingsessens, die genauso viel Freude macht und für weniger Tierleid sorgt. Womit würdest du gern anfangen?',
   bao:'Nenn mir dein Lieblingsgericht – ich schlage eine pflanzliche Variante vor. 😄 Kein Geschmackstest nach Gesinnung, sondern nach Geschmack. Was darf auf keinen Fall fehlen?'
  },
  skeptic:{
   momo:'Dass du Fleisch gern isst, glaube ich dir sofort. Geschmack ist subjektiv; ich will ihn dir nicht absprechen. Vielleicht wäre ein fairer Test, eine konkrete pflanzliche Alternative auszuprobieren und selbst zu vergleichen.',
   kiki:'Ich verstehe, dass Essen mehr ist als Nährwerte. ❤️ Niemand muss seinen Geschmack leugnen. Vielleicht dürfen Genuss und Mitgefühl trotzdem gemeinsam auf den Tisch – ganz ohne Druck.',
   bao:'Du magst Fleisch? Fair. Ich nehme die Herausforderung an: Dein Lieblingsgericht, meine pflanzliche Version. 😄 Du darfst ehrlich sagen, wenn es nicht schmeckt. Deal?'
  }
 },
 cost:{
  question:{
   momo:'Ob vegan günstiger ist, hängt von lokalen Preisen und deiner Einkaufsliste ab. Ohne aktuelle Kassendaten wäre ein pauschaler Vergleich unseriös. Magst du ein konkretes Gericht nennen? Dann vergleichen wir die Zutaten.',
   kiki:'Bezahlbares Essen ist ein echtes Bedürfnis. 💚 Wenn bestimmte Alternativen bei dir teuer sind, sollten wir nicht darüber hinwegreden. Welche Produkte bekommst du gut und günstig?',
   bao:'Lass uns statt Preis-Mythen einen Einkaufskorb testen. 😄 Linsen, Bohnen und Haferflocken sind eine gute Idee – aber ob es bei dir wirklich günstiger wird, entscheidet der Kassenbon.'
  },
  skeptic:{
   momo:'Das ist ein legitimer Einwand. Preise unterscheiden sich je nach Laden und Produkt sehr stark. Ich würde ohne aktuelle lokale Daten weder „vegan ist immer günstig“ noch „vegan ist immer teuer“ behaupten.',
   kiki:'Wenn gutes Essen zu teuer ist, hilft niemandem ein moralischer Vortrag. 💚 Deinen Punkt sollten wir ernst nehmen und eher konkrete bezahlbare Optionen suchen.',
   bao:'Bei teuren Ersatzprodukten kann ich verstehen, wenn du abwinkst. Mein Vorschlag: Wir vergleichen einmal einen konkreten Einkauf mit Bohnen, Linsen und deinen normalen Zutaten. Der Kassenbon gewinnt. 😄'
  }
 },
 children:{
  question:{
   momo:'Bei Babys, Kindern oder Schwangerschaft ist eine pauschale Antwort nicht sicher. Hier müssen Nährstoffversorgung und B12 individuell mit qualifizierten Fachpersonen geklärt werden; die DGE betont besondere Anforderungen.',
   kiki:'Bei Kindern verdient die Gesundheit besondere Sorgfalt. 💚 Deshalb würde ich keine pauschale Zusage in einer Kommentarspalte machen. Qualifizierte Ernährungsberatung ist hier wichtig.',
   bao:'Bei Kinderernährung ist selbst bei mir der Küchenhumor Pause. 💚 Bitte sorgfältig fachlich beraten lassen und kritische Nährstoffe prüfen, statt Dosierungen aus Kommentarspalten zu übernehmen.'
  },
  skeptic:{
   momo:'Die Sorge ist verständlich, gerade bei Kindern. Die Datenlage und Anforderungen unterscheiden sich von gesunden Erwachsenen. Eine individuelle fachliche Einschätzung ist deshalb wichtiger als eine pauschale Pro- oder Contra-Behauptung.',
   kiki:'Wenn es um Kinder geht, darf niemand Gesundheit gegen Überzeugungen ausspielen. 💚 Eine qualifizierte Fachperson sollte die Versorgung prüfen.',
   bao:'Bei Kindern macht eine schnelle Kommentar-Antwort nicht genug Sinn. Gute Versorgung und fachliche Begleitung gehören zuerst – unabhängig davon, wer die Diskussion gewinnen möchte.'
  }
 }
};
function intentFrom(text,contextKind,explicit){
 if(['question','skeptic','claim'].includes(explicit))return {intent:explicit,method:'human_selected',reason:'Von dir ausgewählt; Kontext im Original überprüfen.'};
 const s=String(text||'').toLocaleLowerCase('de').trim();
 if(contextKind==='skeptic'||/^(aber|quatsch|blödsinn|unsinn|das glaube ich nicht|das glaub ich nicht|kann doch nicht|ist doch klar|come on|really|bullshit)\b/.test(s))
   return {intent:'skeptic',method:'heuristic',reason:'Klingt nach einem Einwand; bitte im Original prüfen.'};
 if(contextKind==='question')return {intent:'question',method:'heuristic',reason:'Könnte eine ehrliche Frage sein.'};
 return {intent:'claim',method:'heuristic',reason:'Vorläufig als Aussage eingeordnet; kann falsch sein.'};
}
function compose(topic,persona,form,intent,legacy){
 if(!topic)return '';
 if(!REPLIES[topic.id]||!REPLIES[topic.id][intent]?.[persona])return legacy(topic,persona,form);
 const short=REPLIES[topic.id][intent][persona];
 if(form==='short')return short;
 const limitation=String(topic.limit||'').trim();
 return short+(limitation?'\n\nWichtig zur Einordnung: '+limitation:'');
}
return {REPLIES,intentFrom,compose};
});
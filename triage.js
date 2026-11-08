/* Animal Voices v0.8 — deterministic, auditable decision support. NOT a moderation authority. */
(function(root, factory){
  const api=factory();
  if(typeof module==='object' && module.exports) module.exports=api;
  if(root) root.AV_TRIAGE=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const match=(re,s)=>re.test(String(s||''));
  const instagramUrl=(raw)=>{
    try{ const u=new URL(String(raw||'').trim());
      return (u.protocol==='https:' && /^(www\.)?instagram\.com$/.test(u.hostname))?u.origin+u.pathname:'';
    }catch{return ''}
  };
  const sanitizeIdea=(raw)=>String(raw||'')
    .replace(/https?:\/\/\S+/gi,'[Link entfernt]')
    .replace(/@[A-Za-z0-9_.]+/g,'[Handle entfernt]')
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[E-Mail entfernt]')
    .replace(/\+?\d[\d\s()\-]{7,}\d/g,'[Nummer entfernt]')
    .trim().slice(0,180);
  function classify(text,topic,context){
    const s=String(text||'').toLocaleLowerCase('de');
    if(match(/\b(ich bring(e)? dich um|ich werde dich töten|kill yourself|i will kill you|ich verprügel dich|i will hurt you)\b/i,s))return {action:'report',level:'possible_violation',reason:'Mögliche Drohung oder gezielte Einschüchterung. Bitte über Instagram melden und bei akuter Gefahr Unterstützung holen.',hold:true};
    if(match(/\b(du bist ein (idiot|opfer)|ihr veganer seid (alle )?(idioten|dumm)|alle veganer sind dumm|halt(s)? maul|stfu|loser)\b/i,s))return {action:'ignore',level:'bait',reason:'Hier steht eine persönliche Herabsetzung statt einer überprüfbaren Sachfrage im Mittelpunkt. Eine Antwort könnte den Streit verlängern.',hold:true};
    if(match(/\b(buy followers|free giveaway claim|krypto gewinn|crypto prize|dm for profit)\b/i,s))return {action:'report',level:'possible_violation',reason:'Möglicher Spam oder Betrugsversuch. Prüfe den Kontext und nutze bei Bedarf die Instagram-Meldefunktion.',hold:true};
    if(match(/\b(ich schlage (dich|euch)(?: tot)?|ich (werde|will) (dich|euch|euch alle|alle veganer) (töten|umbringen|abstechen|verletzen)|ich (weiß|weiss) wo du wohnst|lösch dich|kill dich|i know where you live)\b/i,s))return {action:'report',level:'possible_violation',reason:'Mögliche Bedrohung oder Einschüchterung. Originalkontext prüfen und bei Bedarf melden.',hold:true};
    if(match(/\b(ich bin (?:[1-9]|1[0-7])(?: jahre? alt)?|i am (?:[1-9]|1[0-7])(?: years? old)?)\b/i,s))return {action:'save',level:'sensitive',reason:'Minderjährige Person: Keine pauschalen Ernährungs- oder Supplementempfehlungen. Fachlich abklären.',hold:true};
    if(context){return {action:'save',level:'context',reason:context+' Nicht als eigene Behauptung des Kommentierenden behandeln.',hold:true};}
    if(!s.trim())return {action:'save',level:'missing',reason:'Ein geteilter Beitragslink enthält nicht automatisch den Kommentartext. Bitte den genauen Kommentar kopieren und einfügen.',hold:true};
    if(topic && Array.isArray(topic.sources)&&topic.sources.length>0)return {action:'reply',level:'sourced',reason:'Eine relevante Wissenskarte mit Quellen ist vorhanden. Antwort nur nach Prüfung von Kontext und Originalbelegen nutzen.',hold:false};
    return {action:'save',level:'unknown',reason:'Keine eindeutig belegte Antwort. Als wiederkehrende Frage merken oder erst genauer recherchieren.',hold:true};
  }
  // Editorially drafted short variants; do not derive fresh medical/numeric claims from input text.
  const SHORT={
    strength:'Der Mythos stimmt so pauschal nicht. Eine Meta-Analyse randomisierter Studien fand keine signifikanten Kraftunterschiede zwischen den untersuchten pflanzenbasierten und omnivoren Ernährungsformen. Die Studienlage ist noch begrenzt, aber „vegan = schwach“ ist nicht belegt. 💪',
    b12:'Stimmt: B12 muss bei veganer Ernährung zuverlässig supplementiert werden. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem für möglich und potenziell gesundheitsfördernd. Weitere Nährstoffe müssen ebenfalls beachtet werden.',
    protein:'Protein kann auch aus Hülsenfrüchten, Tofu, Tempeh und Seitan kommen. Wichtig sind die Gesamtmenge, die Auswahl der Lebensmittel und der individuelle Bedarf – Fleisch ist nicht die einzige Proteinquelle.',
    soy:'Eine Meta-Analyse klinischer Studien fand keine signifikanten Auswirkungen von Soja oder Isoflavonen auf die untersuchten männlichen Sexualhormone. Das gilt für diese Hormonmarker – nicht automatisch für jede Gesundheitsfrage.',
    crop:'Ja, auch bei der Ernte können Tiere zu Schaden kommen. Wie viele es sind, lässt sich schwer zuverlässig beziffern. Es geht darum, vermeidbares Leid insgesamt zu reduzieren und die Landwirtschaft weiter zu verbessern. 💚',
    nature:'Manche Tiere fressen andere Tiere – das stimmt. Aber was in der Natur geschieht, entscheidet nicht automatisch, was wir Menschen tun sollten. Wenn wir Leid vermeiden können, ist es zumindest eine gute Frage, ob wir das versuchen sollten.',
    forest:'Sojaanbau kann zur Entwaldung beitragen. Globale Daten zeigen jedoch, dass der überwiegende Teil der Sojaernte historisch als Tierfutter verwendet wurde, nicht für Tofu. Die Herkunft einzelner Produkte muss man getrennt prüfen.',
    climate:'Eine stärker pflanzliche Ernährung könnte laut globalen Modellen erheblich landwirtschaftliche Fläche sparen. Wie gross der Effekt tatsächlich ist, hängt von Produkten und Ernährungssystemen ab – eine einzelne Mahlzeit rettet nicht automatisch das Klima.',
    sentience:'Tiere sind fühlende Lebewesen – das erkennt auch das EU-Recht an. Die EFSA beschreibt bei Schweinen konkrete Belastungen wie Schmerz und Furcht. Deswegen ist ihr Wohlbefinden keine Nebensache. ❤️',
    taste:'Verstehe ich – Essen ist auch Freude, Familie und Geschmack. Vielleicht finden wir eine pflanzliche Variante, die dir genauso gut schmeckt? Das wäre ein schöner Anfang, ohne Druck. 🐷',
    cost:'Das ist eine faire Sorge. Preise hängen von Wohnort, Lebensmitteln und Einkaufsmöglichkeiten ab. Wir sollten konkrete Angebote vergleichen statt einfach zu behaupten, vegan sei immer günstig.',
    children:'Gerade bei Babys und Kindern sollte niemand pauschale Ernährungstipps aus einer Kommentarspalte übernehmen. Die Versorgung muss sorgfältig und fachlich begleitet werden.'
  };
  // v0.9.4: individually written, topic-specific replies. The scientific claim
  // is held constant across voices; tone varies but cannot add unsupported facts.
  const VOICE_V094={
    "strength": {
      "momo": "Das Klischee „vegan = schwach“ ist nicht belegt. In einer kleinen Studie mit 38 Männern entwickelten vegane und omnivore Teilnehmer bei vergleichbarer Proteinzufuhr über zwölf Wochen ähnliche Kraft- und Muskelzuwächse. Das beweist nicht alles – widerlegt aber die Pauschalbehauptung. 💪",
      "kiki": "Warum sollte Stärke davon abhängen, ob jemand Fleisch isst? Eine kleine Trainingsstudie fand bei vergleichbarer Proteinzufuhr ähnliche Kraftzuwächse bei veganen und omnivoren Männern. Man kann stark sein und gleichzeitig mitfühlend handeln. 💚",
      "bao": "Fleisch ist kein Trainingsplan. 😄 In einer Studie mit 38 Männern erzielten Veganer und Omnivore nach zwölf Wochen Krafttraining bei vergleichbarer Proteinzufuhr ähnliche Zuwächse. Die Stichprobe war klein – aber „vegan = schwach“ ist kein Fakt. 💪"
    },
    "b12": {
      "momo": "Ja, Vitamin B12 muss bei veganer Ernährung zuverlässig ergänzt werden. Die DGE sagt zugleich: Mit B12, einer guten Lebensmittelauswahl und ausreichenden weiteren Nährstoffen kann vegane Ernährung für gesunde Erwachsene gesundheitsfördernd sein. Beides gehört zur ehrlichen Antwort.",
      "kiki": "Gute Frage – und ein wichtiger Punkt. 💚 B12 muss bei veganer Ernährung ergänzt werden, das sollten wir nicht kleinreden. Die DGE hält eine gut geplante vegane Ernährung für gesunde Erwachsene trotzdem für gesundheitsfördernd möglich. Ehrlichkeit ist wichtiger als Lagerdenken.",
      "bao": "B12? Ja, bitte zuverlässig ergänzen – der Zauber-Tofu liefert es nicht. 😄 Die DGE sagt aber auch: Gut geplant kann eine vegane Ernährung für gesunde Erwachsene gesundheitsfördernd sein. Entscheidend ist eine ausreichende Versorgung, nicht das Etikett."
    },
    "protein": {
      "momo": "Protein kann auch aus Pflanzen kommen: etwa Linsen, Bohnen, Tofu und Seitan. Wichtig ist, ob insgesamt genug Energie und Protein aufgenommen werden. In einer kleinen Trainingsstudie waren die Kraftzuwächse bei angeglichener Proteinzufuhr ähnlich – auch ohne Fleisch.",
      "kiki": "Wenn es um Ernährung geht, zählt deine gute Versorgung. 💚 Pflanzen können Protein liefern, etwa Bohnen, Tofu und Linsen. Wie viel jemand braucht, ist individuell. Wir müssen Gesundheit und Mitgefühl nicht gegeneinander ausspielen.",
      "bao": "Linsen, Tofu, Bohnen, Seitan – das ist meine Protein-Besetzung. 😄 Entscheidend sind Menge und gute Ernährung, nicht das Steak als Pflichtzutat. Bei besonderem Bedarf lohnt sich ein genauer Ernährungsplan."
    },
    "soy": {
      "momo": "Die Behauptung zu Soja und Testosteron wird von einer Meta-Analyse aus 41 klinischen Studien nicht gestützt: Sie fand keine signifikanten Veränderungen der untersuchten männlichen Sexualhormone durch Soja oder Isoflavone. Das gilt für diese Hormonwerte, nicht für jede denkbare Wirkung.",
      "kiki": "Ich verstehe, dass Gerüchte über Hormone verunsichern können. In einer Meta-Analyse von 41 klinischen Studien zeigten Soja und Isoflavone aber keine signifikanten Effekte auf die untersuchten männlichen Sexualhormone. Lieber Studien lesen als Menschen abstempeln. 💚",
      "bao": "Mein Tofu hätte gern Urlaub vom Testosteron-Gerücht. 😄 Eine Meta-Analyse aus 41 klinischen Studien fand keine signifikanten Effekte von Soja auf die untersuchten männlichen Sexualhormone. Das ist der Befund – kein Versprechen zu jeder Gesundheitsfrage."
    },
    "crop": {
      "momo": "Stimmt: Auch Pflanzenanbau kann Tieren schaden. Wie viele Tiere dabei sterben, lässt sich schwer verlässlich zählen. Zugleich beansprucht Tierhaltung global sehr viel Fläche. Wir sollten beide Probleme ernst nehmen und die gesamte Landwirtschaft verbessern.",
      "kiki": "Ja. Auch die Tiere auf den Feldern zählen. ❤️ Wie viele bei der Ernte sterben, wissen wir nicht zuverlässig – und ich möchte ihr Leid nicht kleinreden. Die entscheidende Frage für mich ist: Wie können wir vermeidbares Leid *überall* reduzieren?",
      "bao": "Stimmt, auch beim Pflanzenanbau können Tiere sterben. Eine perfekte Null-Leid-Ernährung gibt's nicht. Aber das ist für mich kein Grund, auf Verbesserungen zu verzichten – weder beim Essen noch in der Landwirtschaft. 🌱"
    },
    "nature": {
      "momo": "Ja, manche Tiere fressen andere Tiere. Das ist eine Beschreibung der Natur, noch keine moralische Anleitung für uns. Wir können getrennt fragen: Was braucht unser Körper – und wie wollen wir mit anderen fühlenden Wesen umgehen?",
      "kiki": "Du hast recht: Manche Tiere jagen, um zu überleben. Wir Menschen haben oft mehr Auswahl. Mich beschäftigt die Frage, was wir mit dieser Wahl anfangen – besonders dann, wenn wir Leid vermeiden können. 🐔",
      "bao": "Löwen essen Fleisch, klar. Ich esse dafür lieber einen richtig guten Burger aus Bohnen. 😄 Naturbeobachtung und unsere eigenen Entscheidungen sind zwei verschiedene Fragen."
    },
    "forest": {
      "momo": "Sojaanbau kann Entwaldung verursachen – das ist real. In globalen historischen Daten ging jedoch der grösste Teil des Sojas in Tierfutter, nicht in Tofu. Entscheidend sind also Herkunft und Verwendung, nicht einfach „Soja = Tofu“.",
      "kiki": "Den Regenwald zu schützen ist ein echtes Anliegen. 🌳 Soja kann zur Entwaldung beitragen. Historisch ging der Grossteil der weltweiten Ernte aber in Tierfutter. Darum lohnt es sich, die Lieferketten gemeinsam anzuschauen statt Schuld pauschal zuzuteilen.",
      "bao": "Nicht jeder Sojabohne liegt ein Tofuvertrag bei. 😄 Entwaldung durch Soja ist ernst – doch global wurde Soja historisch überwiegend als Tierfutter genutzt. Wo ein konkretes Produkt herkommt, muss man separat prüfen."
    },
    "climate": {
      "momo": "Eine pflanzenbetontere Ernährung kann laut globalen Modellen deutlich weniger Agrarfläche benötigen. Auch die DGE bewertet vegane Ernährung als sehr umweltfreundlich. Wie gross ein konkreter Effekt ist, hängt von Lebensmitteln und Produktionsweise ab – keine einzelne Mahlzeit rettet allein das Klima.",
      "kiki": "Kein einzelnes Essen rettet die Welt. Aber was wir essen, beeinflusst Landnutzung und Lebensräume. Modelle zeigen Potenzial für deutlich weniger Agrarfläche durch stärker pflanzliche Ernährung. Ich finde das eine hoffnungsvolle Möglichkeit. 🌱",
      "bao": "Mein Mittagessen ist leider kein Superheldencape. 😄 Aber pflanzenbetonte Ernährung kann laut globalen Modellen viel Agrarfläche sparen. Entscheidend ist, wie und was wir tatsächlich essen – und ob es schmeckt."
    },
    "sentience": {
      "momo": "Die EU erkennt Tiere ausdrücklich als fühlende Wesen an. Die EFSA beschreibt bei Schweinen konkrete Belastungen wie Schmerz und Angst. „Nutztiere fühlen nichts“ ist daher keine haltbare pauschale Aussage.",
      "kiki": "Was wäre, wenn wir ein Schwein zuerst als Individuum sehen – und erst danach als „Nutztier“? 🐷 Die EFSA beschreibt bei Schweinen Schmerz und Angst; das EU-Recht erkennt Tiere als fühlende Wesen an. Für mich beginnt Mitgefühl beim Hinschauen.",
      "bao": "Ich habe Gefühle – und Schweine können auch Schmerz und Angst erleben. 🐷 Das ist nicht nur mein persönlicher Eindruck: Die EFSA untersucht genau solche Tierwohlbelastungen. Lass uns sie ernst nehmen."
    },
    "taste": {
      "momo": "Verstehe ich: Geschmack ist ein echtes Motiv und sehr persönlich. Daraus folgt aber nicht, dass es keine leckeren pflanzlichen Alternativen geben kann. Was ist dein Lieblingsgericht? Vielleicht gibt es eine Variante, die dich überrascht.",
      "kiki": "Essen bedeutet Erinnerung, Familie und Freude. Das respektiere ich. ❤️ Gleichzeitig hatte das Tier hinter dem Gericht ein eigenes Leben. Vielleicht können wir Genuss und Mitgefühl öfter zusammenbringen – ohne Vorwürfe.",
      "bao": "Challenge angenommen! 😄 Du nennst dein Lieblingsgericht, ich schlage eine pflanzliche Version vor. Keine Moralpredigt, nur Geschmackstest. Was darf's sein?"
    },
    "cost": {
      "momo": "Kann gut sein, dass pflanzliche Alternativen in deinem Laden teuer sind. Ohne aktuelle lokale Preise wäre jede pauschale Aussage unseriös. Wenn du magst, vergleichen wir ein konkretes Gericht oder einen Einkaufskorb.",
      "kiki": "Bezahlbares Essen ist keine Nebensache. 💚 Wenn vegane Alternativen bei dir teuer oder schwer erhältlich sind, sollten wir das ernst nehmen, statt dir Vorwürfe zu machen. Was wäre in deinem Alltag realistisch?",
      "bao": "Nicht jeder braucht teure Ersatzprodukte. Ich koche gern mit Bohnen, Haferflocken und Linsen. Ob das bei dir günstiger ist, prüfen wir am besten mit echten Ladenpreisen. Was steht auf deiner Einkaufsliste? 🐷"
    },
    "children": {
      "momo": "Bei Babys und Kindern sollten wir keine pauschale Sicherheit versprechen. Die DGE verweist auf eine eingeschränkte Datenlage und empfiehlt fachliche Begleitung, falls vegan ernährt wird. Individuelle Supplementdosen gehören nicht in Kommentarspalten.",
      "kiki": "Wenn es um Kinder geht, ist Vorsicht besonders wichtig. 💚 Die DGE empfiehlt qualifizierte Ernährungsberatung und sorgfältige Versorgung statt einfacher Ja-nein-Antworten. Hier geht es um Gesundheit, nicht ums Gewinnen einer Debatte.",
      "bao": "Bei der Ernährung von Kindern lasse ich den Küchenhumor lieber weg. 💚 Dafür braucht es sorgfältige Planung und qualifizierte Fachberatung – keine Tipps aus einer Kommentarspalte."
    }
  };
  function reply(topic,persona,form){
    if(!topic)return '';
    if(form==='short'){
      if(VOICE_V094[topic.id]?.[persona])return VOICE_V094[topic.id][persona];
      const text=SHORT[topic.id]||'';
      return persona==='kiki'?'Danke für die Frage. 💚 '+text:persona==='bao'?'Kurzer Reality-Check: 😄 '+text:text;
    }
    return topic.voices?.[persona]||topic.voices?.momo||'';
  }
  function readShared(search){
    const p=new URLSearchParams(search||'');
    const title=(p.get('title')||'').trim().slice(0,220),raw=(p.get('text')||'').trim().slice(0,1800);
    const link=instagramUrl(p.get('url')||raw.match(/https:\/\/(?:www\.)?instagram\.com\/\S+/i)?.[0]||'');
    const text=raw.replace(/https:\/\/(?:www\.)?instagram\.com\/\S+/gi,'').trim();
    return {shared:p.has('text')||p.has('url')||p.has('title')||p.has('share'),comment:text,postUrl:link,title};
  }
  return {classify,instagramUrl,sanitizeIdea,reply,readShared,SHORT};
});

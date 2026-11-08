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
  function reply(topic,persona,form){
    if(!topic)return '';
    if(form==='short'){
      const text=SHORT[topic.id]||'';
      if(!text)return '';
      // Voice alters only the opener; original editorial fact statement stays identical.
      if(persona==='kiki')return 'Danke für die Frage. 💚 '+text;
      if(persona==='bao')return 'Kurzer Reality-Check aus Baos Küche: 😄 '+text;
      return text;
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

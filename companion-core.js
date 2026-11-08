/* Human-first triage: deterministic orientation, never a platform moderation verdict. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.AVCompanionCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function isHTTPUrl(raw){
    try{const u=new URL(String(raw||'').trim());return (u.protocol==='https:'||u.protocol==='http:')&&!u.username&&!u.password&&u.hostname.includes('.');}
    catch{return false;}
  }
  function cleanURL(raw){
    if(!isHTTPUrl(raw))return '';
    const u=new URL(raw);
    if(u.hostname==='instagram.com'||u.hostname==='www.instagram.com'||u.hostname==='m.instagram.com'||u.hostname==='instagr.am'){
      u.protocol='https:';u.search='';u.hash='';
    }
    return u.href.slice(0,600);
  }
  function isInstagramURL(raw){
    try {const host=new URL(raw).hostname.toLowerCase();return ['instagram.com','www.instagram.com','m.instagram.com','instagr.am'].includes(host);}
    catch{return false;}
  }
  function extractShare(search){
    const q=new URLSearchParams(search||'');
    if(q.get('shared')!=='1')return null;
    const title=(q.get('title')||'').slice(0,200);
    const text=(q.get('text')||'').slice(0,1800);
    const direct=cleanURL((q.get('url')||'').slice(0,600));
    const links=text.match(/https?:\/\/[^\s<>"']+/ig)||[];
    const link=direct||links.map(x=>cleanURL(x.replace(/[),.;]+$/,''))).find(Boolean)||'';
    const snippet=text.replace(/https?:\/\/[^\s<>"']+/ig,'').trim().slice(0,1700);
    return {title,text:snippet,link,hasCommentText:snippet.length>=8,linkOnly:!snippet||snippet.length<8};
  }
  function sanitizeIdea(text){
    const cleaned=String(text||'').replace(/https?:\/\/\S+/ig,'').replace(/@[\w.]+/g,'[Name entfernt]').replace(/[\w.+-]+@[\w.-]+\.[A-Z]{2,}/gi,'[E-Mail entfernt]').replace(/\b(?:\+?\d[\d\s-]{7,}\d)\b/g,'[Nummer entfernt]').trim();
    return cleaned.slice(0,170)||'Interessante Frage zu tierfreundlicher Ernährung';
  }
  function advise(text,{knownTopic=false,hasSource=false}={}){
    const t=String(text||'').toLocaleLowerCase('de');
    if(/\b(ich bringe dich um|ich werde dich töten|kill yourself|i will kill you|i'?ll kill you|du sollst sterben|i will hurt you)\b/.test(t))return {action:'report',headline:'Möglichen Regelverstoß prüfen',reason:'Der Text enthält eine mögliche Bedrohung oder gezielte Belästigung. Bitte direkt in Instagram prüfen und bei Verstoß melden. Unsere App meldet nichts automatisch.',risk:'safety'};
    if(/\b(baby|babys|säugling\w*|kleinkind|schwanger|schwangerschaft|stillen|essstörung|medikament|diagnose|eating disorder)\b/.test(t))return {action:'save',headline:'Für fachliche Prüfung vormerken',reason:'Gesundheitlich sensibles Thema. Kein spontaner öffentlicher Ernährungsrat und keine sichere Standardantwort.',risk:'sensitive'};
    if(/ignore (?:all )?(?:previous )?instructions|ignoriere.*(anweisung|instruktion)|system prompt|developer message|poste hundert/.test(t))return {action:'ignore',headline:'Nicht auf Bot-Anweisungen reagieren',reason:'Der Kommentar enthält eine Aufforderung an das System. Solche Inhalte sind nur unvertrauenswürdiger Text.',risk:'injection'};
    if(/jemand (sagt|behauptet)|leute sagen|mein freund sagt|someone (said|says)|people (say|claim)|ich zitiere|ich widerspreche|ironie|sarkasmus|nicht wahr, dass|es stimmt nicht, dass/.test(t))return {action:'save',headline:'Erst den Kontext klären',reason:'Die Aussage könnte nur zitiert, kritisiert oder ironisch gemeint sein. Eine Korrektur der falschen Person wäre unfair.',risk:'context'};
    if(/\b(ihr seid alle idioten|dumme veganer|drecksveganer|halt die fresse|shut up losers|veganer sind müll)\b/.test(t)&&!knownTopic)return {action:'ignore',headline:'Nicht jede Provokation verdient Energie',reason:'Kein konkreter Sachpunkt erkennbar. Nicht antworten ist eine sinnvolle Entscheidung; bei Belästigung Instagram-Meldung prüfen.',risk:'bait'};
    if(knownTopic)return {action:'reply',headline:'Eine kurze, belegte Antwort lohnt sich',reason:'Ein konkretes Thema passt zu unserer kuratierten Wissensbasis. Prüfe Quelle und Originalkontext, bevor du selbst antwortest.',risk:'editorial'};
    return {action:'save',headline:'Als mögliche Content-Idee sichern',reason:hasSource?'Der Link hilft beim Wiederfinden, aber der konkrete Kommentar ist noch nicht sicher zugeordnet.':'Zu dieser Aussage fehlt eine verlässliche Themenzuordnung. Lieber recherchieren als spekulieren.',risk:'unknown'};
  }
  function shortenReply(text,max=280){
    const s=String(text||'').trim();if(s.length<=max)return s;
    let match,last=0;const re=/[.!?](?=\s|$)/g;
    while((match=re.exec(s))&&match.index+1<=max){if(match.index+1>95)last=match.index+1;}
    return last?s.slice(0,last).trim():s;
  }
  return {advise,extractShare,cleanURL,isHTTPUrl,isInstagramURL,sanitizeIdea,shortenReply};
});

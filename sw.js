/* Animal Voices v0.9 — offline app shell + local-only, POST Share Target inbox.
 * Text from the Android share sheet is written to IndexedDB on the device,
 * NOT to a backend and NOT into a URL query string. No binary file uploads.
 */
const VERSION='animal-voices-v10-shell-1';
const SHELL=['/quality.html','/quality.css','/quality.js','/','/index.html','/styles.css','/app.js','/triage.js','/engine.js','/context-fit.js','/data.js','/manifest.webmanifest','/characters/trio.webp','/characters/momo.webp','/characters/kiki.webp','/characters/bao.webp','/icons/icon-192.png','/icons/icon-512.png'];
const DB='animal-voices-inbox-v09';
function openInbox(){return new Promise((resolve,reject)=>{
 const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('items'))req.result.createObjectStore('items')};
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
});}
function storeShare(data){return openInbox().then(db=>new Promise((resolve,reject)=>{
 const tx=db.transaction('items','readwrite');tx.objectStore('items').put(data,'latest');
 tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)};
}));}
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('animal-voices-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.method==='POST'&&url.pathname==='/share'){
  event.respondWith((async()=>{
   try{
    const form=await req.formData();
    const data={title:String(form.get('title')||'').slice(0,220),text:String(form.get('text')||'').slice(0,1800),url:String(form.get('url')||'').slice(0,450),receivedAt:new Date().toISOString()};
    await storeShare(data);
    return Response.redirect(new URL('/?inbox=1#dialog',self.location.origin).href,303);
   }catch{
    // Fail closed. Never forward the raw POST to hosting/analytics infrastructure.
    return Response.redirect(new URL('/?share_error=1#dialog',self.location.origin).href,303);
   }
  })());return;
 }
 if(req.method!=='GET')return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).catch(()=>caches.match('/index.html')));return;
 }
 // Critical scripts/styles are network-first to avoid old editorial logic in new UI.
 // Installed PWAs keep a versioned offline fallback for network outages.
 if(SHELL.includes(url.pathname)){
  if(/\.(?:js|css|json)$/.test(url.pathname)){
   event.respondWith(fetch(req).then(response=>{
    if(response.ok){const duplicate=response.clone();event.waitUntil(caches.open(VERSION).then(c=>c.put(url.pathname,duplicate)))}
    return response;
   }).catch(()=>caches.match(url.pathname).then(cached=>cached||Response.error())));
  }else{
   event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
  }
 }
});

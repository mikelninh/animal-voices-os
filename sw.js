/* Offline shell only: never store or cache comment text or share query parameters. */
const CACHE='av-companion-v08-1';
const FILES=['/','/index.html','/styles.css','/data.js','/companion-core.js','/app.js','/companion.js','/manifest.webmanifest','/characters/app-icon.svg','/characters/icon-192.png','/characters/icon-512.png','/characters/trio.webp','/characters/momo.webp','/characters/kiki.webp','/characters/bao.webp'];
self.addEventListener('install', event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate', event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(u.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).catch(()=>caches.match('/index.html')));
    return;
  }
  if(!FILES.includes(u.pathname))return;
  // Query-free cache key; only pre-approved static assets. Untrusted GET share params never cached.
  event.respondWith(caches.match(u.pathname).then(hit=>hit||fetch(req)));
});

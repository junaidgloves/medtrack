const CACHE = 'medtrack-v2.5';
const ASSETS = [
  '/medtrack/',
  '/medtrack/index.html',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300&family=Instrument+Sans:wght@400;500;600&display=swap',
  'https://accounts.google.com/gsi/client',
  'https://apis.google.com/js/api.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(['/medtrack/','/medtrack/index.html']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  // Network first for Google APIs, cache first for app shell
  if(e.request.url.includes('googleapis.com')||e.request.url.includes('accounts.google.com')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        if(resp&&resp.status===200&&resp.type==='basic'){
          let clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return resp;
      }).catch(()=>caches.match('/medtrack/index.html'));
    })
  );
});

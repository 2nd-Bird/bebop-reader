const CACHE='bebop-reader-v6';
const CORE=['./','./index.html','./styles.css','./pitch-guide.css','./app.js','./manifest.webmanifest','./assets/icon.svg','./src/exercises.js','./src/storage.js','./src/notation.js','./src/audio.js','./src/mic.js','./src/pitchDetector.js','./src/scoring.js','./src/pitchGuide.js','./src/uiEnhancements.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});

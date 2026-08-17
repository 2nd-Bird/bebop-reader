const CACHE='bebop-reader-v09-slice-11';
const CORE=['./','./index.html','./styles.css','./pitch-guide.css','./v08.css','./session-v09.css','./app-v08.js','./app-v09.js','./manifest.webmanifest','./assets/icon.svg','./src/exercises.js','./src/storage.js','./src/storage-v3.js','./src/notation.js','./src/notation/layout.js','./src/notation/follow.js','./src/notation/morph.js','./src/audio.js','./src/audio/context.js','./src/audio/countIn.js','./src/audio/groove.js','./src/audio/model.js','./src/mic.js','./src/pitchDetector.js','./src/music/pitch.js','./src/scoring.js','./src/scoring/eventScoring.js','./src/scoring/sessionScoring.js','./src/pitchGuide.js','./src/curriculum/stages.js','./src/curriculum/phraseFamilies.js','./src/curriculum/variants.js','./src/curriculum/materialize.js','./src/curriculum/validate.js','./src/curriculum/scheduler.js','./src/curriculum/recovery.js','./src/curriculum/mastery.js','./src/session/transport.js','./src/session/timeline.js','./src/session/demoPlan.js','./src/session/engine.js','./src/session/player.js','./src/ui/sessionView.js','./src/ui/dashboardV09.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
});

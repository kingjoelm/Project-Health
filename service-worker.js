const CACHE='project-health-v090-2026-07-28';
const ASSETS=["./", "./index.html", "./app.js", "./manifest.webmanifest", "./data/workouts.json", "./assets/icons/icon-192.svg", "./assets/icons/icon-512.svg", "./assets/exercises/arms-superset.jpg", "./assets/exercises/arms.jpg", "./assets/exercises/cable-curl.jpg", "./assets/exercises/calf-raise.jpg", "./assets/exercises/chest-press.jpg", "./assets/exercises/chest-supported-row.jpg", "./assets/exercises/goblet-squat.jpg", "./assets/exercises/incline-press.jpg", "./assets/exercises/lat-pulldown.jpg", "./assets/exercises/lateral-raise.jpg", "./assets/exercises/leg-curl.jpg", "./assets/exercises/leg-extension.jpg", "./assets/exercises/leg-press.jpg", "./assets/exercises/legs.jpg", "./assets/exercises/mobility.jpg", "./assets/exercises/pec-deck.jpg", "./assets/exercises/pull.jpg", "./assets/exercises/push.jpg", "./assets/exercises/rear-delt.jpg", "./assets/exercises/seated-row.jpg", "./assets/exercises/shoulder-press.jpg", "./assets/exercises/treadmill-walk.jpg", "./assets/exercises/triceps-pressdown.jpg", "./assets/exercises/walk.jpg"];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))}); 
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const fresh=/\.(html|js|json|webmanifest)$/.test(url.pathname)||url.pathname.endsWith('/Project-Health/');
  if(fresh){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
  }else{
    event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return resp})));
  }
});
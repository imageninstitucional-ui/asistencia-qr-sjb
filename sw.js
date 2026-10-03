const CACHE='sjb-reader-v14.21';
const SHELL=['./','./index.html','./manifest.webmanifest','./jsQR-1.4.0.js','./icon.svg','./reset.html','./reconciliacion.html'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('sjb-reader-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  const wantsHtml=req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html');
  if(wantsHtml){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(r=>{
          if(r&&r.ok){
            const copy=r.clone();
            caches.open(CACHE).then(c=>c.put(req,copy));
          }
          return r;
        })
        .catch(async()=>{
          return (await caches.match(req)) || (await caches.match('./index.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const fresh=fetch(req).then(r=>{
        if(r&&r.ok){
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return r;
      }).catch(()=>cached);
      return cached||fresh;
    })
  );
});
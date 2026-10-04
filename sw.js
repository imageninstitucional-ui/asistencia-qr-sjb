const CACHE='sjb-reader-v14.54';
const SHELL=[
'./?v=14.50',
'./index.html?v=14.50',
'./manifest.webmanifest?v=14.50',
'./jsQR-1.4.0.js',
'./icon.svg',
'./reset.html?v=14.50',
'./reconciliacion.html?v=14.50',
'./rondas.html?v=14.50',
'./activar.html?v=14.50',
'./activar-personal.html?v=14.50',
'./movimientos.html?v=14.50',
'./horarios.html?v=14.50',
'./avisos.html?v=14.50',
'./carnets.html?v=14.50',
'./modulos.html?v=14.50'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('sjb-reader-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING') self.skipWaiting();
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
          return (await caches.match(req)) || (await caches.match('./index.html?v=14.50')) || (await caches.match('./index.html'));
        })
    );
    return;
  }

  event.respondWith(
    fetch(req,{cache:'no-store'})
      .then(r=>{
        if(r&&r.ok){
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return r;
      })
      .catch(()=>caches.match(req))
  );
});
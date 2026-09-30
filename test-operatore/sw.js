const CACHE='girotondo-operatore-test-0.9.13';
const SHELL=['./','./index.html','./manifest.json','../icons/icon-192.png','../icons/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('girotondo-operatore-test-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));
    return;
  }
  if(SHELL.some(path=>url.pathname.endsWith(path.replace('./','/')))){
    event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
  }
});

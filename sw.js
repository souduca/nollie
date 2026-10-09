const V="nollie-v3", SHELL=["./","index.html","shim.js","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>clients.claim()))});
function blobFor(id){return new Promise((res,rej)=>{const r=indexedDB.open("nollie-blobs",1);r.onupgradeneeded=()=>r.result.createObjectStore("b");
  r.onsuccess=()=>{const g=r.result.transaction("b").objectStore("b").get(id);g.onsuccess=()=>res(g.result);g.onerror=()=>rej(g.error)};r.onerror=()=>rej(r.error)})}
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  if(u.origin===location.origin&&u.pathname.includes("/_blob/")){
    const id=decodeURIComponent(u.pathname.split("/_blob/")[1]);
    e.respondWith(blobFor(id).then(b=>b?new Response(b,{headers:{"content-type":b.type}}):new Response("",{status:404})));return}
  if(u.origin===location.origin||u.hostname.endsWith("fonts.googleapis.com")||u.hostname.endsWith("fonts.gstatic.com")){
    e.respondWith(caches.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r.ok)caches.open(V).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>hit);return hit||net}))}
});

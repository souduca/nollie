/* Substitui o runtime do Claude: IA via API Anthropic (chave do usuário) e anexos em IndexedDB. */
(function(){
  const KEY="nollieApiKey", MODELS={quick:"claude-haiku-4-5-20251001",default:"claude-sonnet-5-5"};
  const err=(code,extra)=>Object.assign(new Error(code),{code},extra);
  function apiKey(force){
    let k=""; try{k=localStorage.getItem(KEY)||""}catch(e){}
    if(k&&!force)return k;
    k=(window.prompt("Cole sua chave da API da Anthropic (sk-ant-…). Ela fica só neste aparelho.")||"").trim();
    if(!k)throw err("not_granted");
    try{localStorage.setItem(KEY,k)}catch(e){}
    return k;
  }
  async function call(turns,{signal,onText,modelTier="default",system}={}){
    const msgs=[];
    for(const t of turns){const r=t.role==="assistant"?"assistant":"user";
      if(msgs.length&&msgs[msgs.length-1].role===r)msgs[msgs.length-1].content+="\n\n"+t.content;else msgs.push({role:r,content:String(t.content)})}
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",signal,
      headers:{"content-type":"application/json","x-api-key":apiKey(),"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
      body:JSON.stringify({model:MODELS[modelTier]||MODELS.default,max_tokens:2048,stream:!!onText,messages:msgs,...(system?{system}:{})})
    }).catch(e=>{throw e.name==="AbortError"?err("cancelled"):err("network")});
    if(res.status===401||res.status===403){try{localStorage.removeItem(KEY)}catch(e){}throw err("not_granted")}
    if(res.status===429)throw err("rate_limited");
    if(!res.ok)throw err("failed");
    if(!onText){const j=await res.json();return {text:j.content.map(c=>c.text||"").join("")}}
    let text="",buf="";const rd=res.body.getReader(),dec=new TextDecoder();
    try{
      for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});
        const lines=buf.split("\n");buf=lines.pop();
        for(const l of lines){if(!l.startsWith("data:"))continue;try{const d=JSON.parse(l.slice(5));
          if(d.type==="content_block_delta"&&d.delta?.text){text+=d.delta.text;onText({text})}}catch(e){}}}
    }catch(e){throw err(e.name==="AbortError"?"cancelled":"failed",{text})}
    return {text};
  }
  const sample=(turns,o)=>call(turns,o);
  sample.json=async(prompt,o={})=>{
    const {text}=await call([{role:"user",content:prompt}],o);
    const m=text.match(/```(?:json)?\s*([\s\S]*?)```/),s=(m?m[1]:text).trim();
    const a=s.search(/[\[{]/),b=Math.max(s.lastIndexOf("]"),s.lastIndexOf("}"));
    try{return JSON.parse(a>=0?s.slice(a,b+1):s)}catch(e){throw err("failed")}
  };

  // anexos: IndexedDB, servidos em /_blob/<id> pelo service worker
  const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open("nollie-blobs",1);r.onupgradeneeded=()=>r.result.createObjectStore("b");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const tx=async(mode,fn)=>{const db=await idb();return new Promise((res,rej)=>{const t=db.transaction("b",mode),q=fn(t.objectStore("b"));t.oncomplete=()=>res(q?.result);t.onerror=()=>rej(t.error)})};
  const assets={
    upload:async(blob,{type})=>{if(blob.size>20*1024*1024)throw err("too_large");const id=Date.now().toString(36)+Math.random().toString(36).slice(2,8);const bl=new Blob([blob],{type:type||blob.type});await tx("readwrite",s=>s.put(bl,id));ctx().then(c=>c&&pushBlob(c,id,bl)).catch(()=>{});return {id}},
    delete:async id=>{await tx("readwrite",s=>s.delete(id));ctx().then(c=>c&&dropBlob(c,id)).catch(()=>{})}
  };

  // backup: exporta/importa itens (localStorage) + anexos (IndexedDB) em um único .json
  const rq=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
  const b64=b=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=()=>rej(f.error);f.readAsDataURL(b)});
  const toast=m=>{const t=document.getElementById("toast");if(!t)return alert(m);t.textContent=m;t.hidden=false;setTimeout(()=>t.hidden=true,3500)};
  async function exportAll(){
    const items=JSON.parse(localStorage.getItem("lifeos")||"[]");
    const db=await idb(),st=db.transaction("b").objectStore("b");
    const [keys,vals]=await Promise.all([rq(st.getAllKeys()),rq(st.getAll())]);
    const blobs=await Promise.all(vals.map(async(b,i)=>({id:keys[i],type:b.type,data:await b64(b)})));
    const day=new Date().toISOString().slice(0,10);
    const file=new File([JSON.stringify({app:"nollie",v:1,at:new Date().toISOString(),items,blobs})],"nollie-backup-"+day+".json",{type:"application/json"});
    if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file]});return}catch(e){if(e.name==="AbortError")return}}
    const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    toast("Backup exportado ("+items.length+" itens, "+blobs.length+" anexos).");
  }
  async function importAll(file){
    const d=JSON.parse(await file.text());
    if(d.app!=="nollie"||!Array.isArray(d.items))throw new Error("formato");
    const cur=new Map(JSON.parse(localStorage.getItem("lifeos")||"[]").map(i=>[i.id,i]));
    let n=0;
    for(const it of d.items){const c=cur.get(it.id);if(!c||(it.updated||"")>(c.updated||"")){cur.set(it.id,it);n++}}
    for(const b of d.blobs||[]){const blob=await (await fetch(b.data)).blob();await tx("readwrite",s=>s.put(new Blob([blob],{type:b.type}),b.id))}
    localStorage.setItem("lifeos",JSON.stringify([...cur.values()]));
    toast(n+" itens importados. Recarregando…");setTimeout(()=>location.reload(),900);
  }
  window.nollieBackup={export:exportAll,import:importAll};
  const pick=document.createElement("input");pick.type="file";pick.accept=".json,application/json";pick.hidden=true;
  pick.onchange=async()=>{const f=pick.files[0];pick.value="";if(f)try{await importAll(f)}catch(e){toast("Arquivo inválido.")}};
  addEventListener("DOMContentLoaded",()=>document.body.appendChild(pick));
  document.addEventListener("click",e=>{const el=e.target.closest("[data-backup]");if(!el)return;
    const a=el.dataset.backup;
    if(a==="export")exportAll().catch(()=>toast("Não consegui exportar."));else if(a==="import")pick.click();else if(a==="login")login();else if(a==="logout")logout()});
  // pede armazenamento persistente para o navegador não apagar os dados offline
  navigator.storage?.persist?.().catch(()=>{});

  // sincronização: Firebase (Auth Google + Firestore com cache offline). Só liga se firebase-config.js estiver preenchido.
  const CFG=window.NOLLIE_FIREBASE, CDN="https://www.gstatic.com/firebasejs/10.12.2/", CH=700*1024;
  const pad=i=>String(i).padStart(4,"0");
  let fbP=null;
  const loadFb=()=>!(CFG&&CFG.apiKey)?Promise.resolve(null):(fbP||(fbP=(async()=>{
    try{
      const [A,F,Au]=await Promise.all([import(CDN+"firebase-app.js"),import(CDN+"firebase-firestore.js"),import(CDN+"firebase-auth.js")]);
      const app=A.initializeApp(CFG);
      const db=F.initializeFirestore(app,{ignoreUndefinedProperties:true,localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})});
      const auth=Au.getAuth(app);
      let red=false;try{red=!!sessionStorage.getItem("nollieRedir");sessionStorage.removeItem("nollieRedir")}catch(e){}
      if(red)await Au.getRedirectResult(auth).catch(()=>{});
      await auth.authStateReady();
      return {F,Au,db,auth};
    }catch(e){return null}
  })()));
  const ctx=async()=>{const f=await loadFb(),uid=f?.auth.currentUser?.uid;return uid?{...f,uid}:null};
  const has=id=>tx("readonly",s=>s.getKey(id)).then(k=>k!==undefined);
  const rerender=()=>{try{window.render?.();if(window.S?.editing)window.renderOverlay?.()}catch(e){}};

  async function pushBlob(c,id,blob){
    const {F,db,uid}=c, data=await b64(blob), n=Math.ceil(data.length/CH)||1, b=F.writeBatch(db);
    for(let i=0;i<n;i++)b.set(F.doc(db,"u",uid,"blobs",id,"chunks",pad(i)),{d:data.slice(i*CH,(i+1)*CH)});
    b.set(F.doc(db,"u",uid,"blobs",id),{type:blob.type||"",n,at:Date.now()});
    return b.commit();
  }
  async function pullBlob(c,id,meta){
    const {F,db,uid}=c, parts=[];
    for(let i=0;i<meta.n;i++){const d=await F.getDoc(F.doc(db,"u",uid,"blobs",id,"chunks",pad(i)));if(!d.exists())return false;parts.push(d.data().d)}
    const blob=await (await fetch(parts.join(""))).blob();
    await tx("readwrite",s=>s.put(new Blob([blob],{type:meta.type||blob.type}),id));
    return true;
  }
  async function dropBlob(c,id){
    const {F,db,uid}=c;
    await F.deleteDoc(F.doc(db,"u",uid,"blobs",id));
    const cs=await F.getDocs(F.collection(db,"u",uid,"blobs",id,"chunks"));
    await Promise.all(cs.docs.map(d=>F.deleteDoc(d.ref)));
  }
  let watching=false;
  async function watchBlobs(c){
    if(watching)return;watching=true;
    let busy=false,again=false;
    const run=async snap=>{
      if(busy){again=snap;return}busy=true;let got=false;
      try{for(const d of snap.docs){if(await has(d.id))continue;try{if(await pullBlob(c,d.id,d.data()))got=true}catch(e){}}}finally{busy=false}
      if(got)rerender();
      if(again){const a=again;again=false;run(a)}
    };
    c.F.onSnapshot(c.F.collection(c.db,"u",c.uid,"blobs"),run,()=>{});
  }
  // primeiro login: sobe o que já existia só neste aparelho
  async function migrate(c){
    const key="nollieMig:"+c.uid;try{if(localStorage.getItem(key))return}catch(e){}
    const {F,db,uid}=c;
    const cloud=new Map((await F.getDocs(F.collection(db,"u",uid,"items"))).docs.map(d=>[d.id,d.data()]));
    for(const it of JSON.parse(localStorage.getItem("lifeos")||"[]")){
      const o=cloud.get(it.id);if(o&&(o.updated||"")>=(it.updated||""))continue;
      const {id,...body}=it;F.setDoc(F.doc(db,"u",uid,"items",id),body).catch(()=>{});
    }
    const have=new Set((await F.getDocs(F.collection(db,"u",uid,"blobs"))).docs.map(d=>d.id));
    const idbx=await idb(),st=idbx.transaction("b").objectStore("b");
    const [keys,vals]=await Promise.all([rq(st.getAllKeys()),rq(st.getAll())]);
    for(let i=0;i<keys.length;i++)if(!have.has(keys[i]))pushBlob(c,keys[i],vals[i]).catch(()=>{});
    try{localStorage.setItem(key,"1")}catch(e){}
  }
  const userApi={id:async()=>(await ctx())?.uid||null};
  const dbApi={collection:()=>({
    onSnapshot:(ok,bad)=>{ctx().then(c=>{
      if(!c)return bad?.(err("no_auth"));
      migrate(c).catch(()=>{});watchBlobs(c);
      c.F.onSnapshot(c.F.collection(c.db,"u",c.uid,"items"),snap=>ok({docs:snap.docs}),bad);
    })},
    doc:id=>({
      set:async body=>{const c=await ctx();if(!c)throw err("no_auth");c.F.setDoc(c.F.doc(c.db,"u",c.uid,"items",id),body).catch(()=>{})},
      delete:async()=>{const c=await ctx();if(!c)throw err("no_auth");c.F.deleteDoc(c.F.doc(c.db,"u",c.uid,"items",id)).catch(()=>{})}
    })
  })};
  async function login(){
    const f=await loadFb();if(!f)return toast("Sincronização indisponível agora.");
    const p=new f.Au.GoogleAuthProvider();
    try{await f.Au.signInWithPopup(f.auth,p)}
    catch(e){
      if(e.code==="auth/popup-blocked"||e.code==="auth/operation-not-supported-in-this-environment"){try{sessionStorage.setItem("nollieRedir","1")}catch(_){}await f.Au.signInWithRedirect(f.auth,p);return}
      if(e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request")return;
      return toast("Não consegui entrar.");
    }
    location.reload();
  }
  async function logout(){const f=await loadFb();if(f)await f.Au.signOut(f.auth);location.reload()}
  window.nollieSync={available:!!(CFG&&CFG.apiKey),login,logout};
  window.claude={use:async n=>n==="sample"?sample:n==="assets"?assets:n==="db"?(await ctx()?dbApi:null):n==="user"?userApi:null};
  window.nollieSetKey=()=>{try{localStorage.removeItem(KEY)}catch(e){}apiKey(true)};
  if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();

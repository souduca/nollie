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
    upload:async(blob,{type})=>{if(blob.size>20*1024*1024)throw err("too_large");const id=Date.now().toString(36)+Math.random().toString(36).slice(2,8);await tx("readwrite",s=>s.put(new Blob([blob],{type:type||blob.type}),id));return {id}},
    delete:id=>tx("readwrite",s=>s.delete(id))
  };
  window.claude={use:async n=>n==="sample"?sample:n==="assets"?assets:null};
  window.nollieSetKey=()=>{try{localStorage.removeItem(KEY)}catch(e){}apiKey(true)};
  if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();

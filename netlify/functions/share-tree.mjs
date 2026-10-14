import { shares } from "./_shared.mjs";

export function addLegacyCopyAction(html,token){
 if(html.includes('id="sharecopy"')||!html.includes("</body>"))return html;
 const key=JSON.stringify("rodoslov:shared-copy:token:"+token);
 const ui=`<div id="sharecopy-legacy" style="padding:7px 10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;background:#e8f1ff;color:#17365f;border-bottom:1px solid #b7cceb;font:13px/1.3 system-ui,sans-serif"><span>Ovo je podeljeno stablo. Sačuvaj nezavisnu kopiju u ovom browseru.</span><button id="sharecopybtn-legacy" style="font:inherit;padding:5px 10px;border:1px solid #2f5d9e;background:#2f5d9e;color:#fff;border-radius:8px;cursor:pointer">Sačuvaj u moja stabla</button></div>`;
 const readonly=`<script>(()=>{document.documentElement.dataset.shared="readonly";const hide=()=>{for(const id of["undo","redo","panel","bulk","dimp","dshare","dnet","dvers","vshare","bk"]){const e=document.getElementById(id);if(e)e.hidden=true}const t=document.getElementById("title");if(t)t.readOnly=true;document.querySelectorAll("#tt input[data-f],#tt select[data-f],#tt input[type=checkbox]").forEach(e=>e.disabled=true)};hide();const table=document.getElementById("tt");if(table)new MutationObserver(hide).observe(table,{childList:true,subtree:true})})()</script>`;
 const script=`<script>(()=>{const K=${key},R="rodoslov:registry",A="rodoslov:active",b=document.getElementById("sharecopybtn-legacy"),read=()=>{try{const x=JSON.parse(localStorage.getItem(R)||"[]");return Array.isArray(x)?x:[]}catch(e){return[]}},existing=()=>{const id=localStorage.getItem(K);return id&&read().some(x=>x.id===id)?id:null},label=()=>b.textContent=existing()?"Otvori moje stablo":"Sačuvaj u moja stabla";label();b.onclick=()=>{try{let id=existing();if(!id){id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);const data=toJ(),name=title||"Podeljeno stablo",now=Date.now(),r=read();data.title=name;data.version=3;localStorage.setItem("rodoslov:tree:"+id,JSON.stringify(data));r.push({id,name,created:now,updated:now,count:(data.persons||[]).length});localStorage.setItem(R,JSON.stringify(r));localStorage.setItem(K,id)}localStorage.setItem(A,id);location.assign(location.origin+"/")}catch(e){alert("Kopija nije sačuvana — proveri raspoloživ prostor browsera")}}})()</script>`;
 return html.replace(/<body([^>]*)>/i,`<body$1>${ui}`).replace("</body>",readonly+script+"</body>")
}

export default async req=>{
 const url=new URL(req.url),pathToken=url.pathname.match(/\/(?:share-tree|s)\/([^/]+)\/?$/)?.[1]||"";
 const token=url.searchParams.get("token")||pathToken;
 if(!/^[A-Za-z0-9_-]{20,80}$/.test(token))return new Response("Link nije ispravan",{status:400});
 const store=shares(),entry=await store.get(token,{type:"json",consistency:"strong"});
 if(!entry)return new Response("Stablo nije pronađeno ili je uklonjeno",{status:404});
 if(entry.expires&&Date.now()>entry.expires){await store.delete(token);return new Response("Link je istekao",{status:410})}
 return new Response(addLegacyCopyAction(entry.html,token),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"private, max-age=300","content-security-policy":"default-src 'self' 'unsafe-inline' data: blob:; img-src 'self' data: blob:; connect-src 'self'","x-content-type-options":"nosniff","referrer-policy":"no-referrer","x-frame-options":"DENY"}})
};

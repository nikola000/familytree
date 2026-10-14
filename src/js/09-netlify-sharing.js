const NET_URL_KEY="rodoslov:netlify:url",NET_DAYS_KEY="rodoslov:netlify:days",NET_SESSION_KEY="rodoslov:netlify:admin";
const netBase=()=>{const saved=localStorage.getItem(NET_URL_KEY)||"";return saved.replace(/\/+$/,"")||(location.protocol.startsWith("http")?location.origin:"")};
const netAdmin=()=>sessionStorage.getItem(NET_SESSION_KEY)||"";
async function netCall(path,options={}){
 const base=netBase();if(!base)throw new Error("Prvo unesi adresu Netlify sajta");
 const headers={...(options.headers||{}),"x-rodoslov-key":netAdmin()};if(options.body)headers["content-type"]="application/json";
 const r=await fetch(base+path,{...options,headers});let d={};try{d=await r.json()}catch(_){}if(!r.ok)throw new Error(d.error||`Netlify greška (${r.status})`);return d
}
function saveNetlifySettings(){
 const url=$("neturl").value.trim().replace(/\/+$/,""),key=$("netkey").value,days=Math.max(1,Math.min(365,+$("netdays").value||30));
 if(url)localStorage.setItem(NET_URL_KEY,url);else localStorage.removeItem(NET_URL_KEY);sessionStorage.setItem(NET_SESSION_KEY,key);localStorage.setItem(NET_DAYS_KEY,String(days));msg("Netlify podešavanja su sačuvana za ovu sesiju")
}
function netlifySettingsDialog(){const base=netBase(),days=localStorage.getItem(NET_DAYS_KEY)||"30";
 openModal("Netlify deljenje",`<label>Adresa sajta<input id="neturl" type="text" placeholder="https://moj-rodoslov.netlify.app" value="${escA(base)}"></label><label>Administratorski ključ<input id="netkey" type="password" autocomplete="off" value="${escA(netAdmin())}"></label><label>Link važi<input id="netdays" type="number" min="1" max="365" value="${escA(days)}"></label><p style="font-size:12px;margin:0">Ključ se čuva samo u sessionStorage i nestaje zatvaranjem browser sesije. Nikada se ne ugrađuje u deljeno stablo.</p><button data-netlist>Prikaži objavljene linkove</button>`,saveNetlifySettings,"Sačuvaj")}
async function publishTreeOnline(html,title){
 try{const days=+(localStorage.getItem(NET_DAYS_KEY)||30),d=await netCall("/.netlify/functions/publish-tree",{method:"POST",body:JSON.stringify({html,title,days})});
  openModal("Link je napravljen",`<label>Link<input id="netlink" type="text" readonly value="${escA(d.url)}"></label><p>Važi do ${new Date(d.expires).toLocaleString("sr")}.</p>`,()=>{const i=$("netlink");i.select();if(navigator.clipboard)navigator.clipboard.writeText(i.value).catch(()=>document.execCommand("copy"));else document.execCommand("copy");msg("Link je kopiran")},"Kopiraj link")
 }catch(e){msg(e.message||"Netlify objava nije uspela")}
}
async function netlifyPublicationsDialog(){try{const d=await netCall("/.netlify/functions/manage-trees");const total=d.items.reduce((n,x)=>n+(x.size||0),0);openModal("Netlify objave",`<p style="margin:0">${d.items.length} linkova · ${fmtSize(total)}</p><div style="display:flex;flex-direction:column;gap:6px">${d.items.map(x=>`<div style="border:1px solid var(--bd);border-radius:8px;padding:7px"><b>${esc(x.title||"Stablo")}</b><small style="display:block">${new Date(x.created).toLocaleString("sr")} · ${fmtSize(x.size||0)} · ${x.expired?"istekao":"važi do "+new Date(x.expires).toLocaleDateString("sr")}</small><div class="row"><button data-netcopy="${x.token}">Kopiraj link</button><button class="d" data-netdel="${x.token}">Povuci link</button></div></div>`).join("")||"<p>Nema objavljenih stabala.</p>"}</div>`,()=>{},"Zatvori")}catch(e){msg(e.message);netlifySettingsDialog()}}
$("dnet").onclick=()=>{openDrawer(false);netlifySettingsDialog()};
$("mb").addEventListener("click",e=>{
 const list=e.target.closest("[data-netlist]");if(list){saveNetlifySettings();netlifyPublicationsDialog();return}
 const copy=e.target.closest("[data-netcopy]");if(copy){const url=netBase()+"/s/"+copy.dataset.netcopy;if(navigator.clipboard)navigator.clipboard.writeText(url).then(()=>msg("Link je kopiran"));return}
 const del=e.target.closest("[data-netdel]");if(del){const token=del.dataset.netdel;openModal("Povuci link",'<p>Link će odmah prestati da radi. Lokalno stablo neće biti obrisano.</p>',async()=>{try{await netCall("/.netlify/functions/manage-trees?token="+encodeURIComponent(token),{method:"DELETE"});msg("Link je povučen")}catch(x){msg(x.message)}},"Povuci")}
});

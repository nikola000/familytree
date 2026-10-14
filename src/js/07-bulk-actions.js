/* masovne izmene */
function updBulk(){const n=tsel.size;$("bulk").hidden=!n;const c=document.documentElement.dataset.th==="cards",m=n%10,k=(m===1&&n%100!==11)?"karta":(m>=2&&m<=4&&!(n%100>=12&&n%100<=14))?"karte":"karata";$("bn").textContent=c?`Izvučeno: ${n} ${k}`:"Izabrano: "+n}
const sids=()=>[...tsel].map(by).filter(Boolean);
$("bpol").onclick=()=>toggleMenu($("bpol"),()=>[["Muški","m"],["Ženski","f"],["Nepoznat",""]].map(([t,v])=>({t:t+" ("+tsel.size+")",f:()=>change(()=>{sids().forEach(p=>{p.x=v})})})));
$("bsn").onclick=()=>openModal("Prezime za "+tsel.size+" osoba",`<label>Prezime<input id="b1" type="text"></label><p style="font-size:12px;margin:0">Prazno briše upisano prezime (osoba onda nasleđuje od roditelja).</p>`,()=>change(()=>{const v=$("b1").value.trim();sids().forEach(p=>{p.sn=v})}));
$("binf").onclick=()=>{const f=(i,l)=>`<label>${l}<input id="${i}" type="text"></label>`;
 openModal("Podaci za "+tsel.size+" osoba",f("b2","Godina rođenja")+f("b3","Godina smrti")+f("b4","Mesto")+f("b5","Slava")+'<p style="font-size:12px;margin:0">Prazno polje se ne menja; upiši - da obrišeš vrednost.</p>',
 ()=>change(()=>{const m={by:"b2",dy:"b3",pl:"b4",sl:"b5"};sids().forEach(p=>{for(const k in m){const v=$(m[k]).value.trim();if(v==="")continue;if(v==="-")delete p[k];else p[k]=v}})}))};
$("bdel").onclick=()=>openModal("Obriši izabrane",`<p>Obrisati ${tsel.size} osoba? Njihova deca ostaju, bez ovih roditelja.</p>`,()=>change(()=>{const d=new Set(tsel);ps=ps.filter(p=>!d.has(p.id));ps.forEach(p=>p.par=p.par.filter(i=>!d.has(i)));U=U.filter(u=>!u.some(i=>d.has(i)));d.forEach(i=>collapsed.delete(i));if(d.has(focus))focus=null;if(d.has(sel))sel=null;linkFrom=null;tsel.clear()}),"Obriši");
$("bclr").onclick=()=>{tsel.clear();renderTable()};
const setTheme=v=>{document.documentElement.dataset.th=v;$("bdel").textContent=v==="cards"?"Odbaci":"Obriši";$("sq").placeholder=v==="cards"?"Izvuci kartu…":"Traži osobu…";if(typeof updBulk==="function")updBulk();try{localStorage.setItem("rodoslov_theme",v)}catch(e){}};
$("th").onchange=()=>{setTheme($("th").value);render()};


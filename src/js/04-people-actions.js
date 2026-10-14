/* akcije nad osobom */
const focusName=()=>{$("nm").focus();$("nm").select()};
const pair=(a,b)=>{const u=U.find(u=>u.includes(a)&&u.includes(b));return u?[...u]:[a,b]};
function addChild(q){change(()=>{const f=cur(),n=mkp(NEW,q?pair(f.id,q):[f.id]);collapsed.delete(f.id);sel=n.id});focusName()}
function addSib(){change(()=>{const f=cur(),n=mkp(NEW,[...f.par]);ps.pop();ps.splice(ps.indexOf(f)+1,0,n);sel=n.id});focusName()}
function addPar(front){change(()=>{const f=cur(),n=mkp(NEW);n.x=front?"m":"f";f.par=front?[n.id,...f.par]:[...f.par,n.id];if(f.par.length===2)addU(f.par[0],f.par[1]);delete f.parentageUnresolved;sel=n.id});focusName()}
function addPartner(){change(()=>{const f=cur(),q=mkp(NEW);if(f.x)q.x=f.x==="m"?"f":"m";addU(f.id,q.id);sel=q.id});focusName()}
function mv(k){change(()=>{const f=cur(),sb=ps.filter(c=>key(c)===key(f)),o=sb[sb.indexOf(f)+k],i=ps.indexOf(f),j=ps.indexOf(o);[ps[i],ps[j]]=[ps[j],ps[i]]})}
function unlink(a,b){change(()=>{U=U.filter(u=>!(u.includes(a)&&u.includes(b)))});msg("Veza partnera uklonjena")}
function delPar(f,q){change(()=>{if(f.par.includes(q))f.par=f.par.filter(i=>i!==q);delete f.parentageUnresolved});msg("Roditelj uklonjen")}
function delPerson(f){change(()=>{ps=ps.filter(p=>p!==f);ps.forEach(p=>p.par=p.par.filter(i=>i!==f.id));U=U.filter(u=>!u.includes(f.id));collapsed.delete(f.id);if(focus===f.id)focus=null;linkFrom=null;sel=null})}
function partnerOrderDialog(f){const pt=partners(f.id).map(by).filter(Boolean);openModal("Redosled partnera: "+nm(f),`<p style="font-size:12px;margin:0">Redosled kontroliše raspored partnera i njihovih grupa dece; ne menja vrstu veze.</p><div class="order-list">${pt.map((p,i)=>`<div><span>${i+1}. ${esc(nm(p)+" "+effS(p))}</span><button data-porder="${p.id}" data-dir="-1"${i?"":" disabled"}>↑</button><button data-porder="${p.id}" data-dir="1"${i===pt.length-1?" disabled":""}>↓</button></div>`).join("")}</div>`,()=>{},"Zatvori")}
function movePartner(personId,partnerId,dir){change(()=>{const ix=U.map((u,i)=>u.includes(personId)?i:-1).filter(i=>i>=0),at=ix.findIndex(i=>U[i].includes(partnerId)),to=at+dir;if(at<0||to<0||to>=ix.length)return;[U[ix[at]],U[ix[to]]]=[U[ix[to]],U[ix[at]]]});setTimeout(()=>partnerOrderDialog(by(personId)),0)}
const mergeFields=[["name","Ime"],["sn","Prezime"],["x","Pol"],["by","Godina rođenja"],["dy","Godina smrti"],["pl","Mesto"],["sl","Slava"],["nt","Napomena"]];
function mergePeopleDialog(A,B){const pars=[...new Set([...A.par,...B.par])].filter(i=>i!==A.id&&i!==B.id),issues=[];if(partners(A.id).includes(B.id))issues.push("Osobe su povezane kao partneri.");if(ancD(A.id).d[B.id]!==undefined||ancD(B.id).d[A.id]!==undefined)issues.push("Jedna osoba je predak druge.");if(pars.length>2)issues.push("Zajedno imaju više od dva različita roditelja.");
 const rows=mergeFields.map(([k,l])=>{const a=A[k]||"",b=B[k]||"";if(!a&&!b)return"";if(!a||!b||a===b)return`<p><b>${l}:</b> ${esc(a||b)}</p>`;return`<label>${l}<select data-merge="${k}"><option value="a">${esc(a)}</option><option value="b">${esc(b)}</option></select></label>`}).join("");
 openModal("Spoji duplikate",`<p>Ostaje <b>${esc(nm(A))}</b>; kartica <b>${esc(nm(B))}</b> biće uklonjena tek posle potvrde.</p>${issues.length?`<div class="merge-warning"><b>Spajanje je blokirano:</b><ul>${issues.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:`<p class="merge-safe">Roditelji, deca, partneri, alternativna imena i jedinstveni podaci obe osobe biće sačuvani.</p>${rows}<p style="font-size:12px">Pre spajanja pravi se automatska verzija i operacija se može poništiti.</p>`}`,
 ()=>{if(issues.length)return;recordVersion(true,"Pre spajanja duplikata");const chosen={};document.querySelectorAll("[data-merge]").forEach(x=>chosen[x.dataset.merge]=x.value);change(()=>{for(const[k]of mergeFields){const av=A[k]||"",bv=B[k]||"";if(!av&&bv)A[k]=bv;else if(av&&bv&&av!==bv&&chosen[k]==="b")A[k]=bv}const al=[...aliases(A),...aliases(B),focusedLabel(B)].map(x=>x.trim()).filter(x=>x&&FamilyData.searchKey(x)!==FamilyData.searchKey(focusedLabel(A)));A.aliases=[...new Map(al.map(x=>[FamilyData.searchKey(x),x])).values()];if(!A.aliases.length)delete A.aliases;A.par=pars;for(const p of ps)if(p!==B&&p.par.includes(B.id))p.par=[...new Set(p.par.map(i=>i===B.id?A.id:i))].filter(i=>i!==p.id).slice(0,2);const seen=new Set();U=U.map(u=>u.map(i=>i===B.id?A.id:i)).filter(u=>{if(u[0]===u[1])return false;const k=u.slice().sort((a,b)=>a-b).join(":");if(seen.has(k))return false;seen.add(k);return true});ps=ps.filter(p=>p!==B);if(focus===B.id)focus=A.id;sel=A.id});msg("Duplikati su spojeni")},issues.length?"Zatvori":"Spoji")}
function showDetails(){const f=cur(),fld=(id,l,k,ph)=>`<label>${l}<input id="${id}" type="text" value="${escA(f[k]||"")}"${ph?` placeholder="${escA(ph)}"`:""}></label>`;
 openModal("Podaci: "+nm(f),fld("d1","Godina rođenja","by")+fld("d2","Godina smrti","dy")+fld("d3","Mesto","pl")+fld("d4","Slava (prazno = nasleđuje od oca, - = nema)","sl",inhSl(f)||"nema")+`<label>Alternativna imena i nadimci <small>(jedno po redu)</small><textarea id="d6" rows="3">${esc(aliases(f).join("\n"))}</textarea></label><label>Napomena<textarea id="d5" rows="4">${esc(f.nt||"")}</textarea></label>`,
  ()=>change(()=>{setF(f,"by",$("d1").value);setF(f,"dy",$("d2").value);setF(f,"pl",$("d3").value);setF(f,"sl",$("d4").value);setF(f,"nt",$("d5").value);const a=[...new Set($("d6").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean))];if(a.length)f.aliases=a;else delete f.aliases}))}
$("mdet").onclick=showDetails;
$("mkin").onclick=()=>{const f=cur();if(f){kinFrom=f.id;render()}};
$("pclose").onclick=()=>{sel=null;render()};
$("mnav").onclick=()=>toggleMenu($("mnav"),()=>{const f=cur(),groups=[
 ["Roditelj",epar(f).map(by).filter(Boolean)],
 ["Partner",partners(f.id).map(by).filter(Boolean)],
 ["Dete",kids(f.id)]
],items=[];for(const[label,people]of groups)for(const p of people)items.push({t:label+": "+nm(p),f:()=>jump(p.id)});return items.length?items:[{t:"Nema povezanih osoba",d:true,f:()=>{}}]});
$("madd").onclick=()=>toggleMenu($("madd"),()=>{const f=cur(),pt=partners(f.id).map(by),it=[];
 if(!pt.length)it.push({t:"Dete",f:()=>addChild(null)});
 else{pt.forEach(q=>it.push({t:"Dete sa: "+nm(q),f:()=>addChild(q.id)}));it.push({t:"Dete samo sa ovom osobom",f:()=>addChild(0)})}
 it.push({t:"Brat / sestra",d:!f.par.length,f:addSib},{t:"Otac",d:epar(f).length>=2,f:()=>addPar(true)},{t:"Majka",d:epar(f).length>=2,f:()=>addPar(false)},{t:"Partner (nova osoba)",f:addPartner});return it});
$("mlink").onclick=()=>toggleMenu($("mlink"),()=>{const f=cur(),pt=partners(f.id).map(by),ep=epar(f).map(by).filter(Boolean),it=[];
 if(linkFrom!=null)it.push({t:"Otkaži povezivanje",f:()=>{linkFrom=null;render()}});
 else for(const[t,m]of[["Poveži postojeću osobu kao partnera…","partner"],["Poveži postojeću osobu kao dete…","child"],["Poveži postojeću osobu kao roditelja…","parent"]])it.push({t,f:()=>{linkFrom=f.id;linkMode=m;render()}});
 pt.forEach(q=>it.push({t:"Ukloni vezu partnera: "+nm(q),f:()=>unlink(f.id,q.id)}));
 ep.forEach(q=>it.push({t:"Ukloni roditelja: "+nm(q),f:()=>delPar(f,q.id)}));return it});
$("mmore").onclick=()=>toggleMenu($("mmore"),()=>{const f=cur(),sb=ps.filter(c=>key(c)===key(f));
 return[{t:"Pomeri gore među braćom",d:sb[0]===f,f:()=>mv(-1)},{t:"Pomeri dole među braćom",d:sb[sb.length-1]===f,f:()=>mv(1)},
 {t:"Redosled partnera…",d:partners(f.id).length<2,f:()=>partnerOrderDialog(f)},{t:"Spoji mogući duplikat…",d:ps.length<2,f:()=>{linkFrom=f.id;linkMode="merge";render()}},
 {t:collapsed.has(f.id)?"Otvori potomke":"Skupi potomke",d:!kids(f.id).length,f:()=>{if(collapsed.has(f.id))collapsed.delete(f.id);else collapsed.add(f.id);render()}},
 {t:"Označi ogranak (osoba + potomci) u tabeli",f:()=>markBranch(f)},{t:"Kako smo u rodu…",f:()=>{kinFrom=f.id;render()}},{t:"Loza po ocu…",f:()=>showLine(f)},
 {t:"Obriši osobu…",d:ps.length<2,f:()=>openModal("Obriši osobu",`<p>Obrisati „${esc(nm(f))}“?${kids(f.id).length?" Deca ostaju, bez ovog roditelja.":""}</p>`,()=>delPerson(f),"Obriši")}]});
$("foc").onclick=()=>{const f=cur();if(!f)return;vstack.push({vw:$("vw").value,focus});if(vstack.length>30)vstack.shift();focus=f.id;if($("vw").value==="all")$("vw").value="fam";render()};
$("mb").addEventListener("click",e=>{const b=e.target.closest("[data-porder]");if(b){const f=cur();if(f)movePartner(f.id,+b.dataset.porder,+b.dataset.dir)}});


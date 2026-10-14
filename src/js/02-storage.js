/* rezervna kopija */
const VMAX=10,VAUTO=3*60*1000,versionKey=()=>activeDataKey()+":versions";
let lastAutoVersion=0;
function readVersions(){try{const v=JSON.parse(localStorage.getItem(versionKey())||"[]");return Array.isArray(v)?v:[]}catch(e){return[]}}
function writeVersions(v){try{localStorage.setItem(versionKey(),JSON.stringify(v.slice(0,VMAX)));return true}catch(e){msg("Nema mesta za automatsku kopiju — izvezi JSON");return false}}
function recordVersion(force=false,label="Automatska kopija"){
 const now=Date.now();if(!force&&now-lastAutoVersion<VAUTO)return false;
 const data=snap(),v=readVersions();if(v[0]&&v[0].data===data){lastAutoVersion=now;return false}
 v.unshift({id:now.toString(36),at:now,label,title,count:ps.length,data});
 if(writeVersions(v)){lastAutoVersion=now;return true}return false
}
function noteChange(){recordVersion(false);meta.chg++;saveMeta();updBk()}
function updBk(){const show=meta.chg>=15&&meta.chg>=meta.snooze,when=meta.last?new Date(meta.last).toLocaleDateString("sr"):"nikad";
 $("bk").hidden=!show;$("bkt").textContent=`Imaš ${meta.chg} izmena od poslednje rezervne kopije (${when}).`;
 $("bkinfo").textContent=`Poslednja kopija: ${when}. Izmena od tada: ${meta.chg}.`}
$("bkex").onclick=()=>expJ();$("bklater").onclick=()=>{meta.snooze=meta.chg+15;saveMeta();updBk()};
function versionsDialog(){
 const v=readVersions();openModal("Prethodne verzije",v.length?`<div style="display:flex;flex-direction:column;gap:6px">${v.map(x=>`<div style="border:1px solid var(--bd);border-radius:8px;padding:7px"><b>${esc(x.title||"Bez naslova")}</b><small style="display:block">${new Date(x.at).toLocaleString("sr")} · ${x.count} osoba · ${esc(x.label||"")}</small><div class="row" style="margin-top:5px"><button data-vopen="${x.id}">Pregled i vraćanje</button><button data-vexp="${x.id}">Izvezi JSON</button><button class="d" data-vdel="${x.id}">Obriši</button></div></div>`).join("")}</div>`:"<p>Još nema automatskih verzija. Prva se pravi pre sledeće izmene.</p>",()=>{},"Zatvori")
}
$("mb").addEventListener("click",e=>{
 const b=e.target.closest("[data-vopen],[data-vexp],[data-vdel]");if(!b)return;const v=readVersions(),id=b.dataset.vopen||b.dataset.vexp||b.dataset.vdel,x=v.find(q=>q.id===id);if(!x)return;
 if(b.dataset.vexp){saveFile("rodoslov-verzija-"+new Date(x.at).toISOString().slice(0,10)+".json",new Blob([JSON.stringify(JSON.parse(x.data),null,2)],{type:"application/json"}));return}
 if(b.dataset.vdel){openModal("Obriši kopiju",`<p>Obrisati kopiju „${esc(x.title||"Bez naslova")}” od ${new Date(x.at).toLocaleString("sr")}?</p>`,()=>{writeVersions(v.filter(q=>q.id!==id));versionsDialog()},"Obriši");return}
 let d=null;try{d=JSON.parse(x.data)}catch(_){return}openModal("Vrati prethodnu verziju",`<p><b>${esc(x.title||"Bez naslova")}</b></p><p>${new Date(x.at).toLocaleString("sr")} · ${x.count} osoba</p><p>Trenutno stanje će prvo biti sačuvano kao posebna kopija.</p>`,()=>{recordVersion(true,"Pre vraćanja verzije");stack.push(snap());load(JSON.stringify(d));$("title").value=title;save();render();msg("Prethodna verzija je vraćena")},"Vrati verziju")
});

function renderStats(shown,gen){const g=gens(),v=Object.values(g),n=ps.length,gc=v.length?Math.max(...v)-Math.min(...v)+1:0,m=ps.filter(p=>p.x==="m").length,f=ps.filter(p=>p.x==="f").length;
 $("st1").textContent=`Osoba: ${n} · generacija: ${gc} · muških: ${m} · ženskih: ${f} · bez pola: ${n-m-f}`;
 const w=checks();$("warn").hidden=!w.length;$("warn").textContent="Provera: "+w.length+(w.length===1?" upozorenje":" upozorenja");
 if(gen&&shown!=null){$("gstat").hidden=false;$("gstat").textContent=`Na slici: ${shown} osoba · `+Object.keys(gen).map(Number).sort((a,b)=>a-b).map(k=>`${roman(k+1)}×${gen[k]}`).join(" · ")}else $("gstat").hidden=true}
function rows(){const g=gens(),q=FamilyData.searchKey(tq);
 let r=ps.map(p=>{const[f,m]=parentsOf(p);return{p,f,m,pt:partners(p.id).map(by),g:g[p.id],k:kids(p.id).length,d:dcount(p.id),sn:effS(p)}});
 if(q)r=r.filter(x=>FamilyData.searchKey(personSearchText(x.p)).includes(q));
 const kf={name:x=>x.p.name,sn:x=>x.sn,x:x=>x.p.x||"~",by:x=>x.p.by||"~",dy:x=>x.p.dy||"~",pl:x=>x.p.pl||"~",sl:x=>effSl(x.p)||"~",f:x=>x.f?x.f.name:"~",m:x=>x.m?x.m.name:"~",pt:x=>x.pt.map(nm).join(", ")||"~",gen:x=>x.g,k:x=>x.k,d:x=>x.d}[tsort.k];
 r.sort((a,b)=>{const x=kf(a),y=kf(b),c=typeof x==="number"?x-y:String(x).localeCompare(String(y),"sr");return(c||a.g-b.g||a.p.id-b.p.id)*tsort.d});
 return r}
function renderTable(){for(const i of[...tsel])if(!by(i))tsel.delete(i);const r=rows();tvis=r.map(x=>x.p.id),disabled=READ_ONLY?" disabled":"";const th=(k,l)=>`<th data-k="${k}">${l}${tsort.k===k?(tsort.d>0?" ▲":" ▼"):""}</th>`;
 const so=v=>["","m","f"].map((o,i)=>`<option value="${o}"${v===o?" selected":""}>${["?","Muški","Ženski"][i]}</option>`).join("");
 const inp=(f,v,ph)=>`<td><input data-f="${f}" value="${escA(v||"")}"${ph?` placeholder="${escA(ph)}"`:""}${disabled}></td>`;
 $("tt").innerHTML=`<thead><tr><th><input type="checkbox" id="tall" aria-label="Označi sve"${disabled}></th><th>#</th>${th("name","Ime")}${th("sn","Prezime")}${th("x","Pol")}${th("by","Rođ.")}${th("dy","Umr.")}${th("pl","Mesto")}${th("sl","Slava")}${th("f","Otac")}${th("m","Majka")}${th("pt","Partneri")}${th("gen","Gen.")}${th("k","Deca")}${th("d","Potomaka")}<th></th></tr></thead><tbody>`+
 r.map((x,i)=>`<tr data-id="${x.p.id}" class="${tsel.has(x.p.id)?"sel ":""}${x.p.id===sel?"cur":""}"><td><input type="checkbox" data-s${tsel.has(x.p.id)?" checked":""}${disabled}></td><td>${i+1}</td>${inp("name",x.p.name)}${inp("sn",x.p.sn,inhS(x.p))}<td><select data-f="x"${disabled}>${so(x.p.x||"")}</select></td>${inp("by",x.p.by)}${inp("dy",x.p.dy)}${inp("pl",x.p.pl)}${inp("sl",x.p.sl,inhSl(x.p))}<td>${x.f?esc(nm(x.f)):""}</td><td>${x.m?esc(nm(x.m)):""}</td><td>${esc(x.pt.map(nm).join(", "))}</td><td>${roman(x.g+1)}</td><td>${x.k}</td><td>${x.d}</td><td><button data-go>→</button></td></tr>`).join("")+"</tbody>";
 $("tcnt").textContent=`${r.length} / ${ps.length}`;
 const ta=$("tall");if(ta){const n=r.filter(x=>tsel.has(x.p.id)).length;ta.checked=n>0&&n===r.length;ta.indeterminate=n>0&&n<r.length}
 updBulk()}
function updInfo(){$("info").hidden=tab!=="tree"||!($("fl").textContent||$("msg").textContent)}
function applyTab(){const en=!!cur();$("stage").hidden=tab!=="tree";$("tbl").hidden=tab!=="tbl";$("panel").hidden=READ_ONLY||!(tab==="tree"&&en);$("tabT").classList.toggle("on",tab==="tree");$("tabB").classList.toggle("on",tab==="tbl")}
let lastSel=null;
function renderPanel(){const f=cur(),force=lastSel!==sel;lastSel=sel;
 if(f){if(force||document.activeElement!==$("nm"))$("nm").value=f.name;if(force||document.activeElement!==$("sn"))$("sn").value=f.sn;$("sn").placeholder=inhS(f)||"Prezime";$("sx").value=f.x||""}
 const fp=focus!=null?by(focus):null;
 $("fl").textContent=kinFrom!=null&&by(kinFrom)?"Dodirni drugu osobu (ili je nađi pretragom) da vidiš kako ste u rodu sa: "+nm(by(kinFrom))+" (Esc otkazuje).":linkFrom!=null&&by(linkFrom)?(linkMode==="merge"?"Izaberi mogući duplikat osobe: ":linkMode==="child"?"Dodirni (ili nađi pretragom) osobu koja je dete osobe: ":linkMode==="parent"?"Dodirni (ili nađi pretragom) osobu koja je roditelj osobe: ":"Dodirni (ili nađi pretragom) osobu koju povezuješ kao partnera sa: ")+nm(by(linkFrom))+" (Esc otkazuje).":"";updInfo()}
function render(){
 if(!ps.length){mkp(NEW);sel=null}
 if(sel!=null&&!by(sel))sel=null;
 applyTab();let shown=null,gen=null;
 if(tab==="tree"){const r=viewSvg(sel);$("wrap").innerHTML=r.s.replace(/width="\d+" height="\d+"( viewBox)/,`width="${r.w*zoom}" height="${r.h*zoom}"$1`);shown=r.shown||0;gen=r.gen;renderPanel()}
 else renderTable();
 renderStats(shown,gen);$("undo").disabled=!stack.length;$("redo").disabled=!redo.length;if(typeof updateNavigation==="function")updateNavigation();renderVbar();if(typeof syncControlUI==="function")syncControlUI();lastVw=$("vw").value}
let lastVw="all",vstack=[];
const VN={hourglass:"peščani sat osobe",fan:"lepeza predaka osobe",fam:"porodica osobe",desc:"potomci osobe",ped:"preci osobe"};
function renderVbar(){const fp=focus!=null?by(focus):null,vw=$("vw").value,on=tab==="tree"&&fp&&vw!=="all";
 $("vbar").hidden=!(tab==="tree"&&(on||hlSet.size));
 const back=vw!=="desc",forward=vw!=="ped"&&vw!=="fan";
 $("vtxt").textContent=on?`Prikaz: ${VN[vw]} ${nm(fp)}`+(back?` · unazad: ${$("gb").value==="99"?"sve":$("gb").value}`:"")+(forward?` · unapred: ${$("gf").value==="99"?"sve":$("gf").value}`:""):"";
 $("vback").hidden=!on;$("vall").hidden=!on;$("vshare").hidden=!on;$("hlclr").hidden=!hlSet.size}
$("vback").onclick=()=>{const v=vstack.pop();if(v){$("vw").value=v.vw;focus=v.focus}else $("vw").value="all";render()};
$("vall").onclick=()=>{vstack.push({vw:$("vw").value,focus});$("vw").value="all";render()};
$("hlclr").onclick=()=>{hlSet=new Set();render()};
function change(fn){if(READ_ONLY){msg("Podeljeno stablo je samo za pregled — sačuvaj kopiju da bi ga menjao/la");return}push();fn();invalidateIndex();save();render()}
function msg(t){$("msg").textContent=t;updInfo();setTimeout(()=>{if($("msg").textContent===t){$("msg").textContent="";updInfo()}},3500)}
for(const id of["gb","gf"])$(id).innerHTML='<option value="99">Sve generacije</option>';


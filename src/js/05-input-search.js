/* unos */
$("wrap").onclick=e=>{const g=e.target.closest("[data-id]"),id=g?+g.dataset.id:null;
 if(kinFrom!=null){if(id==null||id===kinFrom)return;kinDone(id);return}
 if(linkFrom!=null){if(id==null||id===linkFrom)return;linkDone(id);return}
 if(id==null){sel=null;render()}else jump(id)};
$("title").oninput=e=>{if(READ_ONLY)return;if(!e.target.dataset.p){push();e.target.dataset.p=1}title=e.target.value;save()};
$("title").onchange=e=>{delete e.target.dataset.p;render()};
$("title").onblur=e=>{delete e.target.dataset.p};
for(const s of["sm","gb","gf","yr","pn","gr"])$(s).onchange=()=>render();
$("vw").onchange=()=>{vstack.push({vw:lastVw,focus});if($("vw").value!=="all"&&(focus==null||!by(focus))){if(sel!=null)focus=sel;else{$("vw").value="all";msg("Izaberi osobu pa dodirni „Stablo osobe“")}}render()};
const live=(el,k)=>{el.oninput=e=>{if(READ_ONLY)return;const f=cur();if(!f)return;if(!el.dataset.p){push();el.dataset.p=1}f[k]=e.target.value;save();const w=$("wrap"),sc=w.scrollLeft,st=w.scrollTop;render();w.scrollLeft=sc;w.scrollTop=st};el.onblur=()=>{delete el.dataset.p}};
live($("nm"),"name");live($("sn"),"sn");
$("sx").onchange=()=>change(()=>{cur().x=$("sx").value});
$("zi").onclick=()=>{zoom=Math.min(3,zoom*1.2);render()};
$("zo").onclick=()=>{zoom=Math.max(.2,zoom/1.2);render()};
$("wrap").addEventListener("wheel",e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();
 const w=$("wrap"),rc=w.getBoundingClientRect(),mx=e.clientX-rc.left,my=e.clientY-rc.top,px=mx+w.scrollLeft,py=my+w.scrollTop;
 const nz=Math.min(3,Math.max(.2,zoom*(e.deltaY<0?1.1:1/1.1))),k=nz/zoom;if(k===1)return;zoom=nz;render();
 w.scrollLeft=px*k-mx;w.scrollTop=py*k-my},{passive:false});

/* pretraga */
function doSearch(){const q=FamilyData.searchKey($("sq").value),r=$("sres");if(!q){r.hidden=true;return}
 const g=gens(),base=$("gr").value==="0"?0:Math.min(...Object.values(g)),m=ps.filter(p=>FamilyData.searchKey(p.name+" "+effS(p)).includes(q)).slice(0,12);
 r.innerHTML=m.length?m.map(p=>{const f=parentsOf(p)[0];return`<button data-id="${p.id}">${esc(nm(p))} ${esc(effS(p))}<small> · ${roman(g[p.id]-base+1)}${f?" · otac: "+esc(nm(f)):""}${p.by?" · "+esc(p.by):""}</small></button>`}).join(""):'<div class="none">Nema rezultata</div>';
 r.hidden=false}
function pickSearch(id){$("sq").value="";$("sres").hidden=true;if(kinFrom!=null){if(id!==kinFrom)kinDone(id);return}if(linkFrom!=null){if(id!==linkFrom)linkDone(id);return}jump(id)}
$("sq").oninput=doSearch;$("sq").onfocus=doSearch;
$("sq").onkeydown=e=>{if(e.key==="Enter"){const b=$("sres").querySelector("button");if(b)pickSearch(+b.dataset.id)}};
$("sres").onclick=e=>{const b=e.target.closest("button");if(b)pickSearch(+b.dataset.id)};


/* unos */
$("wrap").onclick=e=>{if(suppressWrapClick){suppressWrapClick=false;return}const g=e.target.closest("[data-id]"),id=g?+g.dataset.id:null;
 if(kinFrom!=null){if(id==null||id===kinFrom)return;kinDone(id);return}
 if(linkFrom!=null){if(id==null||id===linkFrom)return;linkDone(id);return}
 if(id==null){sel=null;render()}else jump(id)};
$("title").oninput=e=>{if(READ_ONLY)return;if(!e.target.dataset.p){push();e.target.dataset.p=1}title=e.target.value;save()};
$("title").onchange=e=>{delete e.target.dataset.p;render()};
$("title").onblur=e=>{delete e.target.dataset.p};
for(const s of["sm","gb","gf","yr","pn","gr"])$(s).onchange=()=>render();
$("vw").onchange=()=>{vstack.push({vw:lastVw,focus});if($("vw").value!=="all"&&(focus==null||!by(focus))&&sel!=null)focus=sel;render()};
const live=(el,k)=>{el.oninput=e=>{if(READ_ONLY)return;const f=cur();if(!f)return;if(!el.dataset.p){push();el.dataset.p=1}f[k]=e.target.value;save();const w=$("wrap"),sc=w.scrollLeft,st=w.scrollTop;render();w.scrollLeft=sc;w.scrollTop=st};el.onblur=()=>{delete el.dataset.p}};
live($("nm"),"name");live($("sn"),"sn");
$("sx").onchange=()=>change(()=>{cur().x=$("sx").value});
$("zi").onclick=()=>{zoom=Math.min(3,zoom*1.2);render()};
$("zo").onclick=()=>{zoom=Math.max(.2,zoom/1.2);render()};
$("wrap").addEventListener("wheel",e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();
 const w=$("wrap"),rc=w.getBoundingClientRect(),mx=e.clientX-rc.left,my=e.clientY-rc.top,px=mx+w.scrollLeft,py=my+w.scrollTop;
 const nz=Math.min(3,Math.max(.2,zoom*(e.deltaY<0?1.1:1/1.1))),k=nz/zoom;if(k===1)return;zoom=nz;render();
 w.scrollLeft=px*k-mx;w.scrollTop=py*k-my},{passive:false});
let panStart=null,panMoved=false,suppressWrapClick=false,pinchStart=null;const touchPoints=new Map();
const pinchPair=()=>[...touchPoints.values()].slice(0,2);
const pinchDistance=a=>Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y);
$("wrap").addEventListener("pointerdown",e=>{if(e.button!==0)return;const w=$("wrap");
 if(e.pointerType==="touch"){touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});if(w.setPointerCapture)w.setPointerCapture(e.pointerId);
  if(touchPoints.size===1){panStart={x:e.clientX,y:e.clientY,l:w.scrollLeft,t:w.scrollTop};panMoved=false}
  else if(touchPoints.size===2){const a=pinchPair(),rc=w.getBoundingClientRect(),mx=(a[0].x+a[1].x)/2-rc.left,my=(a[0].y+a[1].y)/2-rc.top;pinchStart={d:Math.max(1,pinchDistance(a)),z:zoom,ux:(w.scrollLeft+mx)/zoom,uy:(w.scrollTop+my)/zoom};panStart=null;suppressWrapClick=true}w.classList.add("dragging");return}
 if(e.target.closest("[data-id]"))return;panStart={x:e.clientX,y:e.clientY,l:w.scrollLeft,t:w.scrollTop};panMoved=false;w.classList.add("dragging");if(w.setPointerCapture)w.setPointerCapture(e.pointerId)});
$("wrap").addEventListener("pointermove",e=>{const w=$("wrap");
 if(e.pointerType==="touch"&&touchPoints.has(e.pointerId)){touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinchStart&&touchPoints.size>=2){e.preventDefault();const a=pinchPair(),rc=w.getBoundingClientRect(),mx=(a[0].x+a[1].x)/2-rc.left,my=(a[0].y+a[1].y)/2-rc.top,nz=Math.min(3,Math.max(.2,pinchStart.z*pinchDistance(a)/pinchStart.d));if(Math.abs(nz-zoom)>.002){zoom=nz;render();w.scrollLeft=pinchStart.ux*zoom-mx;w.scrollTop=pinchStart.uy*zoom-my}panMoved=true;suppressWrapClick=true;return}}
 if(!panStart)return;const dx=e.clientX-panStart.x,dy=e.clientY-panStart.y;if(Math.abs(dx)+Math.abs(dy)>4){panMoved=true;suppressWrapClick=true}w.scrollLeft=panStart.l-dx;w.scrollTop=panStart.t-dy});
const endPointer=e=>{const w=$("wrap");if(e.pointerType==="touch")touchPoints.delete(e.pointerId);pinchStart=null;
 if(touchPoints.size===1){const q=pinchPair()[0];panStart={x:q.x,y:q.y,l:w.scrollLeft,t:w.scrollTop}}else if(!touchPoints.size){panStart=null;w.classList.remove("dragging")}
 else{const a=pinchPair();pinchStart={d:Math.max(1,pinchDistance(a)),z:zoom,ux:w.scrollLeft/zoom,uy:w.scrollTop/zoom}}};
$("wrap").addEventListener("pointerup",endPointer);$("wrap").addEventListener("pointercancel",endPointer);

/* pretraga */
function doSearch(){const q=FamilyData.searchKey($("sq").value),r=$("sres");if(!q){r.hidden=true;return}
 const g=gens(),base=$("gr").value==="0"?0:Math.min(...Object.values(g)),m=ps.filter(p=>FamilyData.searchKey(personSearchText(p)).includes(q)).slice(0,12);
 r.innerHTML=m.length?m.map(p=>{const f=parentsOf(p)[0];return`<button data-id="${p.id}">${esc(nm(p))} ${esc(effS(p))}<small> · ${roman(g[p.id]-base+1)}${f?" · otac: "+esc(nm(f)):""}${p.by?" · "+esc(p.by):""}</small></button>`}).join(""):'<div class="none">Nema rezultata</div>';
 r.hidden=false}
function pickSearch(id){$("sq").value="";$("sres").hidden=true;if(kinFrom!=null){if(id!==kinFrom)kinDone(id);return}if(linkFrom!=null){if(id!==linkFrom)linkDone(id);return}jump(id)}
$("sq").oninput=doSearch;$("sq").onfocus=doSearch;
$("sq").onkeydown=e=>{if(e.key==="Enter"){const b=$("sres").querySelector("button");if(b)pickSearch(+b.dataset.id)}};
$("sres").onclick=e=>{const b=e.target.closest("button");if(b)pickSearch(+b.dataset.id)};


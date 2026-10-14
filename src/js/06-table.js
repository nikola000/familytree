/* tabela */
$("tabT").onclick=()=>{tab="tree";render()};$("tabB").onclick=()=>{tab="tbl";render()};
$("tq").oninput=e=>{tq=e.target.value;renderTable()};
const navBack=[],navForward=[];
function updateNavigation(){$("nback").disabled=!navBack.length;$("nforward").disabled=!navForward.length}
function jump(id,record=true){if(!by(id)){msg("Osoba više ne postoji u ovom stablu");return}openDrawer(false);if(record&&sel!=null&&sel!==id){navBack.push(sel);if(navBack.length>50)navBack.shift();navForward.length=0}sel=id;if($("vw").value==="hourglass"||$("vw").value==="fan")focus=id;tab="tree";render();let g=document.querySelector(`#wrap [data-id="${id}"]`);
 if(!g){$("vw").value="all";collapsed.clear();render();g=document.querySelector(`#wrap [data-id="${id}"]`)}
 if(g&&g.scrollIntoView)g.scrollIntoView({block:"center",inline:"center"})}
$("nback").onclick=()=>{const id=navBack.pop();if(id==null)return;if(sel!=null)navForward.push(sel);jump(id,false)};
$("nforward").onclick=()=>{const id=navForward.pop();if(id==null)return;if(sel!=null)navBack.push(sel);jump(id,false)};
$("tt").addEventListener("input",e=>{if(READ_ONLY)return;const t=e.target,f=t.dataset.f;if(f!=="name"&&f!=="sn"&&!TF.includes(f))return;const p=by(+t.closest("tr").dataset.id);if(!t.dataset.p){push();t.dataset.p=1}if(f==="name"||f==="sn")p[f]=t.value;else setF(p,f,t.value);save()});
$("tt").addEventListener("focusout",e=>{const t=e.target;if(t.dataset&&t.dataset.p)delete t.dataset.p});
$("tt").addEventListener("change",e=>{const t=e.target;
 if(t.id==="tall"){tvis.forEach(i=>t.checked?tsel.add(i):tsel.delete(i));renderTable();return}
 if(t.dataset.s!==undefined){const id=+t.closest("tr").dataset.id;if(t.checked)tsel.add(id);else tsel.delete(id);t.closest("tr").classList.toggle("sel",t.checked);updBulk();return}
 if(t.dataset.f==="x"){if(READ_ONLY)return;const p=by(+t.closest("tr").dataset.id);change(()=>{p.x=t.value})}else if(t.dataset.f){renderTable();renderStats(null)}});
$("tt").addEventListener("click",e=>{const th=e.target.closest("th[data-k]");
 if(th){const k=th.dataset.k;tsort=tsort.k===k?{k,d:-tsort.d}:{k,d:1};renderTable();return}
 if(e.target.closest("[data-go]"))jump(+e.target.closest("tr").dataset.id)});


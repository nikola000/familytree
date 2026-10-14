/* Vizuelne kontrole zadržavaju postojeće select elemente kao jedini izvor stanja. */
function setNativeControl(id,value){const el=$(id);if(!el||el.value===String(value))return;el.value=String(value);el.dispatchEvent(new Event("change",{bubbles:true}))}
function relationDepth(start,next){if(!start)return 0;let depth=0,row=[start],seen=new Set([start.id]);while(row.length){const out=[];for(const p of row)for(const q of next(p))if(q&&!seen.has(q.id)){seen.add(q.id);out.push(q)}if(!out.length)break;depth++;row=out}return depth}
function generationLimits(){const p=by(focus)||by(sel);if(p)return{gb:relationDepth(p,q=>epar(q).map(by).filter(Boolean)),gf:relationDepth(p,q=>kids(q.id))};const g=gens(),v=Object.values(g),span=v.length?Math.max(...v)-Math.min(...v):0;return{gb:span,gf:span}}
function syncGenerationSelect(id,max){const el=$(id),old=el.value||"99",limit=Math.max(0,max);el.innerHTML='<option value="99">Sve generacije</option>'+Array.from({length:limit+1},(_,i)=>`<option value="${i}">${i} generacija</option>`).join("");el.value=old==="99"||+old>limit?"99":old;return limit}
function syncControlUI(){
 const v=$("vw").value,kind=v==="hourglass"||v==="fan"?v:"standard",scope=kind==="standard"?v:"all";
 document.querySelectorAll('[name="view-kind"]').forEach(x=>x.checked=x.value===kind);document.querySelectorAll('[name="view-scope"]').forEach(x=>x.checked=x.value===scope);$("view-scope").hidden=kind!=="standard";
 for(const id of["gr","sm","th"])document.querySelectorAll(`[data-sync="${id}"]`).forEach(x=>x.checked=x.value===$(id).value);
 document.querySelectorAll("[data-toggle]").forEach(x=>x.checked=$(x.dataset.toggle).value===x.dataset.on);
 const limits=generationLimits();for(const id of["gb","gf"]){const max=syncGenerationSelect(id,limits[id]),v=$(id).value,o=document.querySelector(`[data-gen-value="${id}"]`),all=document.querySelector(`[data-gen-all="${id}"]`),minus=document.querySelector(`[data-gen="${id}"][data-step="-1"]`),plus=document.querySelector(`[data-gen="${id}"][data-step="1"]`);if(o)o.value=v==="99"?`Sve (${max})`:v;if(all)all.classList.toggle("on",v==="99");if(minus)minus.disabled=max===0||v==="0";if(plus)plus.disabled=max===0||v!=="99"&&+v>=max}
 const gf=document.querySelector('[data-gen-row="gf"]');if(gf)gf.hidden=$("vw").value==="fan"||$("vw").value==="ped"
}
document.addEventListener("change",e=>{const t=e.target;
 if(t.name==="view-kind"&&t.checked){setNativeControl("vw",t.value==="standard"?(document.querySelector('[name="view-scope"]:checked')?.value||"all"):t.value);syncControlUI()}
 else if(t.name==="view-scope"&&t.checked){setNativeControl("vw",t.value);syncControlUI()}
 else if(t.dataset.sync&&t.checked){setNativeControl(t.dataset.sync,t.value);syncControlUI()}
 else if(t.dataset.toggle){setNativeControl(t.dataset.toggle,t.checked?t.dataset.on:t.dataset.off);syncControlUI()}
});
document.addEventListener("click",e=>{const step=e.target.closest("[data-gen]"),all=e.target.closest("[data-gen-all]");if(step){const id=step.dataset.gen,max=generationLimits()[id],cur=$(id).value==="99"?max:+$(id).value;setNativeControl(id,Math.max(0,Math.min(max,cur+(+step.dataset.step))));syncControlUI()}else if(all){setNativeControl(all.dataset.genAll,"99");syncControlUI()}});

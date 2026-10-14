const TREE_REGISTRY_KEY="rodoslov:registry",TREE_ACTIVE_KEY="rodoslov:active";
let activeTreeId=null;
const treeKey=id=>"rodoslov:tree:"+id,treeVersionKey=id=>treeKey(id)+":versions";
const activeDataKey=()=>EMB?SKEY:(activeTreeId?treeKey(activeTreeId):SKEY);
function readTreeRegistry(){try{const r=JSON.parse(localStorage.getItem(TREE_REGISTRY_KEY)||"[]");return Array.isArray(r)?r:[]}catch(e){return[]}}
function writeTreeRegistry(r){localStorage.setItem(TREE_REGISTRY_KEY,JSON.stringify(r));return r}
function newTreeId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function initTreeLibrary(){
 if(EMB)return;
 let r=readTreeRegistry(),active=localStorage.getItem(TREE_ACTIVE_KEY);
 if(!r.length){const id=newTreeId(),old=localStorage.getItem(SKEY);let name="Moje porodično stablo",count=0;
  if(old)try{const d=JSON.parse(old);name=d.title||name;count=Array.isArray(d.persons)?d.persons.length:0}catch(e){}
  r=[{id,name,created:Date.now(),updated:Date.now(),count}];writeTreeRegistry(r);if(old)localStorage.setItem(treeKey(id),old);const oldVersions=localStorage.getItem(SKEY+":versions");if(oldVersions)localStorage.setItem(treeVersionKey(id),oldVersions);active=id
 }
 if(!r.some(x=>x.id===active))active=r[0].id;
 activeTreeId=active;localStorage.setItem(TREE_ACTIVE_KEY,active)
}
function touchActiveTree(){if(EMB||!activeTreeId)return;const r=readTreeRegistry(),x=r.find(q=>q.id===activeTreeId);if(x){x.name=title||x.name;x.updated=Date.now();x.count=ps.length;writeTreeRegistry(r)}}
function createLocalTree(data,name,open=true){
 const id=newTreeId(),now=Date.now(),doc={...data,title:name||data.title||"Novo stablo",version:3};
 localStorage.setItem(treeKey(id),JSON.stringify(doc));const r=readTreeRegistry();r.push({id,name:doc.title,created:now,updated:now,count:(doc.persons||[]).length});writeTreeRegistry(r);
 if(open)switchLocalTree(id);return id
}
const sharedCopyKey=()=>EMB?"rodoslov:shared-copy:"+EMB.id:"";
function existingSharedCopy(){
 if(!EMB)return null;const id=localStorage.getItem(sharedCopyKey());return id&&readTreeRegistry().some(x=>x.id===id)?id:null
}
function updateSharedCopyBar(){
 const bar=$("sharecopy");if(!EMB||!location.protocol.startsWith("http")){bar.hidden=true;return}
 const exists=existingSharedCopy();bar.hidden=false;$("sharecopybtn").textContent=exists?"Otvori moje stablo":"Sačuvaj u moja stabla"
}
function saveSharedCopy(){
 try{let id=existingSharedCopy();if(!id){id=createLocalTree(toJ(),title||"Podeljeno stablo",false);localStorage.setItem(sharedCopyKey(),id)}
  localStorage.setItem(TREE_ACTIVE_KEY,id);location.assign(location.origin+"/")
 }catch(e){msg("Kopija nije sačuvana — proveri raspoloživ prostor browsera")}
}
$("sharecopybtn").onclick=saveSharedCopy;
function switchLocalTree(id,saveCurrent=true){
 const r=readTreeRegistry();if(!r.some(x=>x.id===id))return;if(saveCurrent)save();activeTreeId=id;localStorage.setItem(TREE_ACTIVE_KEY,id);
 const data=localStorage.getItem(activeDataKey());if(data)load(data);else{ps=[];U=[];uid=0;title=r.find(x=>x.id===id).name;mkp(NEW);invalidateIndex()}
 stack.length=0;redo.length=0;tsel.clear();navBack.length=0;navForward.length=0;focus=null;sel=null;$("vw").value="all";$("title").value=title;save();render();msg("Otvoreno stablo: "+title)
}
const byteSize=s=>new Blob([s||""]).size;
const fmtSize=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(2)+" MB";
function treeSpaceInfo(){return readTreeRegistry().map(x=>{const data=localStorage.getItem(treeKey(x.id))||"",versions=localStorage.getItem(treeVersionKey(x.id))||"";return{...x,dataBytes:byteSize(data),versionBytes:byteSize(versions),total:byteSize(data)+byteSize(versions)}})}
function treeManagerDialog(){
 const info=treeSpaceInfo(),appBytes=(()=>{let n=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("rodoslov"))n+=byteSize(k)+byteSize(localStorage.getItem(k))}return n})();
 openModal("Stabla i prostor",`<p id="quota" style="margin:0">Podaci aplikacije: <b>${fmtSize(appBytes)}</b></p><div class="row"><button data-tnew>Novo prazno</button><button data-tdup>Dupliraj trenutno</button></div><div style="display:flex;flex-direction:column;gap:7px">${info.map(x=>`<div style="border:1px solid var(--bd);border-radius:8px;padding:8px"><b>${x.id===activeTreeId?"● ":""}${esc(x.name)}</b><small style="display:block">${x.count} osoba · stablo ${fmtSize(x.dataBytes)} · verzije ${fmtSize(x.versionBytes)} · ukupno ${fmtSize(x.total)}</small><div class="row" style="margin-top:5px">${x.id!==activeTreeId?`<button data-topen="${x.id}">Otvori</button>`:""}<button data-trename="${x.id}">Preimenuj</button><button data-texport="${x.id}">Izvezi</button><button data-tversions="${x.id}">Verzije</button><button class="d" data-tdelete="${x.id}"${info.length<2?" disabled":""}>Obriši</button></div></div>`).join("")}</div><p style="font-size:12px;margin:0">Stara RSv8 kopija čuva se radi kompatibilnosti i uključena je u ukupan prostor.</p>`,()=>{},"Zatvori");
 if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(q=>{const e=$("quota");if(e&&q.quota)e.innerHTML+=` · browser/origin: ${fmtSize(q.usage||0)} od ${fmtSize(q.quota)}`}).catch(()=>{})
}
$("dvers").onclick=()=>{openDrawer(false);if(EMB)versionsDialog();else treeManagerDialog()};
$("mb").addEventListener("click",e=>{
 const b=e.target.closest("[data-tnew],[data-tdup],[data-topen],[data-trename],[data-texport],[data-tversions],[data-tdelete]");if(!b)return;
 const id=b.dataset.topen||b.dataset.trename||b.dataset.texport||b.dataset.tversions||b.dataset.tdelete;
 if(b.dataset.tnew!==undefined){openModal("Novo stablo",'<label>Naziv<input id="tn" type="text" value="Novo porodično stablo"></label>',()=>createLocalTree({persons:[],unions:[]},$("tn").value.trim()||"Novo porodično stablo"),"Napravi");return}
 if(b.dataset.tdup!==undefined){createLocalTree(toJ(),(title||"Stablo")+" — kopija");return}
 if(b.dataset.topen){closeModal();switchLocalTree(id);return}
 const r=readTreeRegistry(),x=r.find(q=>q.id===id);if(!x)return;
 if(b.dataset.trename){openModal("Preimenuj stablo",`<label>Naziv<input id="tn" type="text" value="${escA(x.name)}"></label>`,()=>{const name=$("tn").value.trim();if(!name)return;x.name=name;const raw=localStorage.getItem(treeKey(id));if(raw)try{const d=JSON.parse(raw);d.title=name;localStorage.setItem(treeKey(id),JSON.stringify(d))}catch(_){}writeTreeRegistry(r);if(id===activeTreeId){title=name;$("title").value=name;save();render()}},"Preimenuj");return}
 if(b.dataset.texport){const raw=localStorage.getItem(treeKey(id));if(raw)saveFile("rodoslov-"+slug(x.name)+".json",new Blob([JSON.stringify(JSON.parse(raw),null,2)],{type:"application/json"}));return}
 if(b.dataset.tversions){if(id!==activeTreeId){msg("Otvori stablo da upravljaš njegovim pojedinačnim verzijama");return}versionsDialog();return}
 if(b.dataset.tdelete){openModal("Obriši stablo",`<p>Obrisati stablo „${esc(x.name)}” i sve njegove automatske verzije? Pre toga ga možeš izvesti kao JSON.</p>`,()=>{localStorage.removeItem(treeKey(id));localStorage.removeItem(treeVersionKey(id));writeTreeRegistry(r.filter(q=>q.id!==id));if(id===activeTreeId)switchLocalTree(r.find(q=>q.id!==id).id,false)},"Obriši")}
});

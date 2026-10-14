/* meniji, drawer, modal */
function closePop(){if(popEl){popEl.remove();popEl=null}}
function openMenu(btn,items){closePop();const m=document.createElement("div");m.id="pop";m._b=btn;
 for(const it of items){const b=document.createElement("button");b.textContent=it.t;b.disabled=!!it.d;b.onclick=()=>{closePop();it.f()};m.appendChild(b)}
 document.body.appendChild(m);const r=btn.getBoundingClientRect(),h=m.offsetHeight,below=r.bottom+h+8<innerHeight||r.top<h+8;
 m.style.left=Math.max(4,Math.min(r.left,innerWidth-m.offsetWidth-4))+"px";m.style.top=Math.max(4,below?r.bottom+4:r.top-h-4)+"px";popEl=m}
const toggleMenu=(btn,build)=>{if(popEl&&popEl._b===btn){closePop();return}openMenu(btn,build())};
document.addEventListener("click",e=>{if(popEl&&!popEl.contains(e.target)&&!e.target.closest("[data-m]"))closePop();if(!e.target.closest("#sbox"))$("sres").hidden=true},true);
const openDrawer=o=>{$("drawer").hidden=!o;$("scrim").hidden=!o};
$("hb").onclick=()=>openDrawer(true);$("dclose").onclick=()=>openDrawer(false);$("scrim").onclick=()=>openDrawer(false);
let modalOk=null;
function openModal(title,body,ok,label){$("mt").textContent=title;$("mb").innerHTML=body;$("mok").textContent=label||"Sačuvaj";modalOk=ok;$("modal").hidden=false}
const closeModal=()=>{$("modal").hidden=true;modalOk=null};
$("mok").onclick=()=>{const f=modalOk;if(f)f();closeModal()};$("mno").onclick=closeModal;
$("modal").onclick=e=>{if(e.target===$("modal"))closeModal()};
function doUndo(){if(!stack.length)return;const s0=sel;redo.push(snap());load(stack.pop());sel=by(s0)?s0:null;$("title").value=title;save();render()}
function doRedo(){if(!redo.length)return;const s0=sel;stack.push(snap());load(redo.pop());sel=by(s0)?s0:null;$("title").value=title;save();render()}
$("undo").onclick=doUndo;$("redo").onclick=doRedo;
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"){closePop();openDrawer(false);closeModal();$("sres").hidden=true;if(linkFrom!=null||kinFrom!=null){linkFrom=null;kinFrom=null;render()}return}
 const t=e.target&&e.target.tagName;if((e.ctrlKey||e.metaKey)&&t!=="INPUT"&&t!=="TEXTAREA"&&t!=="SELECT"){const k=e.key.toLowerCase();if(k==="z"&&!e.shiftKey){e.preventDefault();doUndo()}else if(k==="y"||(k==="z"&&e.shiftKey)){e.preventDefault();doRedo()}}});


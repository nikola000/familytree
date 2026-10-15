/* meniji, drawer, modal */
function closePop(restore=false){if(popEl){const b=popEl._b;b.setAttribute("aria-expanded","false");popEl.remove();popEl=null;if(restore)b.focus()}}
function openMenu(btn,items){closePop();const m=document.createElement("div");m.id="pop";m._b=btn;m.setAttribute("role","menu");btn.setAttribute("aria-expanded","true");
 for(const it of items){const b=document.createElement("button");b.textContent=it.t;b.disabled=!!it.d;b.setAttribute("role","menuitem");b.onclick=()=>{closePop();it.f()};m.appendChild(b)}
 document.body.appendChild(m);const r=btn.getBoundingClientRect(),h=m.offsetHeight,below=r.bottom+h+8<innerHeight||r.top<h+8;
 m.style.left=Math.max(4,Math.min(r.left,innerWidth-m.offsetWidth-4))+"px";m.style.top=Math.max(4,below?r.bottom+4:r.top-h-4)+"px";popEl=m;const active=()=>[...m.querySelectorAll("button:not(:disabled)")];m.onkeydown=e=>{const a=active(),i=a.indexOf(document.activeElement);if(e.key==="Escape"){e.preventDefault();closePop(true)}else if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();a[(i+(e.key==="ArrowDown"?1:-1)+a.length)%a.length]?.focus()}else if(e.key==="Home"){e.preventDefault();a[0]?.focus()}else if(e.key==="End"){e.preventDefault();a[a.length-1]?.focus()}};active()[0]?.focus()}
const toggleMenu=(btn,build)=>{if(popEl&&popEl._b===btn){closePop(true);return}openMenu(btn,build())};
document.addEventListener("click",e=>{if(popEl&&!popEl.contains(e.target)&&!e.target.closest("[data-m]"))closePop();if(!e.target.closest("#sbox")){if(typeof closeSearch==="function")closeSearch();else $("sres").hidden=true}},true);
const openDrawer=o=>{$("drawer").hidden=!o;$("scrim").hidden=!o};
$("hb").onclick=()=>openDrawer(true);$("dclose").onclick=()=>openDrawer(false);$("scrim").onclick=()=>openDrawer(false);
let modalOk=null,modalReturnFocus=null;
function openModal(title,body,ok,label){
 $("mbox").classList.remove("wide","share-modal");$("mt").textContent=title;$("mb").innerHTML=body;$("mok").textContent=label||"Sačuvaj";$("mno").hidden=label==="Zatvori";modalOk=ok;modalReturnFocus=document.activeElement;$("modal").hidden=false;
 requestAnimationFrame(()=>{const first=$("mb").querySelector("input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled])");(first||$("mok")).focus()})
}
const closeModal=()=>{if($("modal").hidden)return;$("modal").hidden=true;modalOk=null;const f=modalReturnFocus;modalReturnFocus=null;if(f&&f.isConnected)f.focus()};
$("mok").onclick=()=>{const f=modalOk;if(f)f();closeModal()};$("mno").onclick=closeModal;$("mclose").onclick=closeModal;
$("modal").onclick=e=>{if(e.target===$("modal"))closeModal()};
$("modal").onkeydown=e=>{if(e.key!=="Tab")return;const a=[...$("mbox").querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(x=>x.offsetParent!==null||x===$("mok")||x===$("mclose"));if(!a.length)return;const first=a[0],last=a[a.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};
function doUndo(){if(!stack.length)return;const s0=sel;redo.push(snap());load(stack.pop());sel=by(s0)?s0:null;$("title").value=title;save();render()}
function doRedo(){if(!redo.length)return;const s0=sel;stack.push(snap());load(redo.pop());sel=by(s0)?s0:null;$("title").value=title;save();render()}
$("undo").onclick=doUndo;$("redo").onclick=doRedo;
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"){closePop(true);openDrawer(false);closeModal();if(typeof closeSearch==="function")closeSearch();else $("sres").hidden=true;if(linkFrom!=null||kinFrom!=null){linkFrom=null;kinFrom=null;render()}return}
 const t=e.target&&e.target.tagName;if((e.ctrlKey||e.metaKey)&&t!=="INPUT"&&t!=="TEXTAREA"&&t!=="SELECT"){const k=e.key.toLowerCase();if(k==="z"&&!e.shiftKey){e.preventDefault();doUndo()}else if(k==="y"||(k==="z"&&e.shiftKey)){e.preventDefault();doRedo()}}});


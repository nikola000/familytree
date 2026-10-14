/* fajlovi */
async function saveFile(name,data){
 let d=null;try{d=await claude.use("downloads")}catch(e){}
 if(d){try{await d.save({filename:name,data});msg("Sačuvano: "+name);return true}catch(e){if(!e||e.code!=="declined")msg("Čuvanje nije uspelo");return false}}
 const a=document.createElement("a"),url=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true
}
async function expJ(){const ok=await saveFile("rodoslov.json",new Blob([JSON.stringify(toJ(),null,2)],{type:"application/json"}));if(ok){meta.last=Date.now();meta.chg=0;meta.snooze=0;saveMeta();updBk()}}
function expC(){const q=v=>'"'+String(v).replace(/"/g,'""')+'"',head=["Ime","Prezime","Pol","Rođen/a","Umro/la","Mesto","Slava","Napomena","Otac","Majka","Partneri","Generacija","Deca","Potomaka"];
 const lines=[head.map(q).join(",")].concat(rows().map(x=>[nm(x.p),x.sn,x.p.x==="m"?"M":x.p.x==="f"?"Ž":"",x.p.by||"",x.p.dy||"",x.p.pl||"",effSl(x.p),x.p.nt||"",x.f?nm(x.f):"",x.m?nm(x.m):"",x.pt.map(nm).join("; "),roman(x.g+1),x.k,x.d].map(q).join(",")));
 saveFile("rodoslov.csv",new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv"}))}
function expI(){
 const r=svg(null),k=2,img=new Image();
 img.onload=()=>{const c=document.createElement("canvas");c.width=r.w*k;c.height=r.h*k;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
  c.toBlob(b=>b?saveFile("rodoslov.png",b):msg("Izvoz slike nije uspeo"),"image/png")};
 img.onerror=()=>msg("Izvoz slike nije uspeo");
 img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(r.s)}
let importMode="replace";
const ONBOARDING_PENDING_KEY="rodoslov:onboarding-pending";
let onboardingImport=false;
function finishOnboarding(){localStorage.removeItem(ONBOARDING_PENDING_KEY);$("onboarding").hidden=true}
function showOnboarding(){
 $("onboarding").hidden=false;$("onboard-choices").hidden=false;$("onboard-form").hidden=true;
 $("onboard-new").onclick=()=>{$("onboard-choices").hidden=true;$("onboard-form").hidden=false;$("onboard-first-name").focus()};
 $("onboard-back").onclick=()=>{$("onboard-form").hidden=true;$("onboard-choices").hidden=false};
 $("onboard-import").onclick=()=>{onboardingImport=true;importMode="replace";$("file").click()};
 $("onboard-form").onsubmit=e=>{e.preventDefault();const name=$("onboard-first-name").value.trim(),treeName=$("onboard-tree-name").value.trim();if(!name)return;
  ps=[];U=[];uid=0;title=treeName||"Moje porodično stablo";const p=mkp(name);p.sn=$("onboard-last-name").value.trim();p.x=$("onboard-sex").value;invalidateIndex();sel=p.id;focus=null;$("vw").value="all";$("title").value=title;save();finishOnboarding();render();msg("Stablo je napravljeno")};
}
$("dimp").onclick=()=>openModal("Uvezi JSON",`<label>Način uvoza<select id="imode"><option value="new">Uvezi kao novo stablo u biblioteci</option><option value="replace">Zameni trenutno stablo</option></select></label><p style="font-size:12px;margin:0">Pre zamene trenutnog stabla automatski se čuva njegova prethodna verzija.</p>`,()=>{importMode=$("imode").value;$("file").click()},"Izaberi fajl");$("dj").onclick=expJ;$("di").onclick=expI;$("dc").onclick=expC;
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader(),before=snap();let pushed=false;
 rd.onload=()=>{try{if(importMode==="new"&&!EMB){const raw=JSON.parse(rd.result);if(!Array.isArray(raw.persons))throw 0;const n=FamilyData.normalize(raw),name=n.title||f.name.replace(/\.json$/i,"")||"Uvezeno stablo",data=FamilyData.serialize({title:name,persons:n.persons,unions:n.unions});createLocalTree(data,name);msg("Uvezeno kao novo stablo");return}recordVersion(true,"Pre uvoza koji menja stablo");push();pushed=true;load(rd.result);focus=null;$("vw").value="all";$("title").value=title;save();openDrawer(false);if(onboardingImport)finishOnboarding();render();msg("Uvezeno")}catch(x){if(pushed)stack.pop();try{load(before)}catch(_){}render();msg("Neispravan JSON fajl — postojeći podaci nisu promenjeni")}finally{onboardingImport=false}};rd.readAsText(f);e.target.value=""};

let needsOnboarding=false;
try{needsOnboarding=!EMB&&(!readTreeRegistry().length&&!localStorage.getItem(SKEY)||localStorage.getItem(ONBOARDING_PENDING_KEY)==="1");if(needsOnboarding)localStorage.setItem(ONBOARDING_PENDING_KEY,"1");initTreeLibrary();const s=localStorage.getItem(activeDataKey());if(s)load(s);else if(EMB)load(JSON.stringify(EMB.data));else seed()}catch(e){try{if(EMB)load(JSON.stringify(EMB.data));else seed()}catch(_){seed()}}
let th0="light";try{th0=localStorage.getItem("rodoslov_theme")||"light"}catch(e){}
$("th").value=th0;setTheme(th0);
$("title").value=title;updBk();if(READ_ONLY){document.documentElement.dataset.shared="readonly";$("title").readOnly=true;for(const id of["undo","redo","dimp","dshare","dnet","dvers","vshare","bk"])$(id).hidden=true}render();save();updateSharedCopyBar();if(needsOnboarding)showOnboarding();


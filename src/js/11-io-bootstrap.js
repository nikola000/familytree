/* fajlovi */
async function saveFile(name,data){
 let d=null;try{d=await claude.use("downloads")}catch(e){}
 if(d){try{await d.save({filename:name,data});msg("Sačuvano: "+name);return true}catch(e){if(!e||e.code!=="declined")msg("Čuvanje nije uspelo");return false}}
 const a=document.createElement("a"),url=URL.createObjectURL(data instanceof Blob?data:new Blob([data]));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true
}
async function expJ(){const ok=await saveFile("rodoslov.json",new Blob([JSON.stringify(toJ(),null,2)],{type:"application/json"}));if(ok){meta.last=Date.now();meta.chg=0;meta.snooze=0;saveMeta();updBk()}}
async function expG(){try{await saveFile("rodoslov.ged",new Blob([Gedcom.exportGedcom(toJ())],{type:"text/plain;charset=utf-8"}));msg("GEDCOM je izvezen")}catch(e){msg("GEDCOM izvoz nije uspeo")}}
function expC(){const q=v=>'"'+String(v).replace(/"/g,'""')+'"',head=["Ime","Prezime","Pol","Rođen/a","Umro/la","Mesto","Slava","Napomena","Otac","Majka","Partneri","Generacija","Deca","Potomaka"];
 const lines=[head.map(q).join(",")].concat(rows().map(x=>[nm(x.p),x.sn,x.p.x==="m"?"M":x.p.x==="f"?"Ž":"",x.p.by||"",x.p.dy||"",x.p.pl||"",effSl(x.p),x.p.nt||"",x.f?nm(x.f):"",x.m?nm(x.m):"",x.pt.map(nm).join("; "),roman(x.g+1),x.k,x.d].map(q).join(",")));
 saveFile("rodoslov.csv",new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv"}))}
function expI(){
 const r=viewSvg(null),k=2,img=new Image();
 img.onload=()=>{const c=document.createElement("canvas");c.width=r.w*k;c.height=r.h*k;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
  c.toBlob(b=>b?saveFile("rodoslov.png",b):msg("Izvoz slike nije uspeo"),"image/png")};
 img.onerror=()=>msg("Izvoz slike nije uspeo");
 img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(r.s)}
let importMode="replace";
function importDiagnostic(level,event,details,error){
 const fn=console&&typeof console[level]==="function"?console[level]:console.log;
 fn.call(console,"[Rodoslov import] "+event,details,error||"")
}
function importFailureDialog(file,phase,error){
 const message=error&&error.message?error.message:String(error||"Nepoznata greška"),details={phase,file:file&&file.name||"",bytes:file&&file.size||0,type:file&&file.type||"",message};
 importDiagnostic("error","Uvoz nije uspeo",details,error);
 openModal("Uvoz nije uspeo",`<p>Postojeći podaci nisu promenjeni.</p><p><b>${esc(message)}</b></p><details><summary>Tehnički detalji</summary><pre style="white-space:pre-wrap;font-size:11px">${esc(JSON.stringify(details,null,2))}</pre></details><p style="font-size:12px;margin-bottom:0">Isti detalji i trag greške upisani su u konzolu browsera pod oznakom <code>[Rodoslov import]</code>.</p>`,()=>{},"Zatvori")
}
const ONBOARDING_PENDING_KEY="rodoslov:onboarding-pending";
let onboardingImport=false;
function finishOnboarding(){localStorage.removeItem(ONBOARDING_PENDING_KEY);$("onboarding").hidden=true}
function showOnboarding(){
 $("onboarding").hidden=false;$("onboard-choices").hidden=false;$("onboard-form").hidden=true;$("onboard-step").textContent="Početak";
 $("onboard-new").onclick=()=>{$("onboard-choices").hidden=true;$("onboard-form").hidden=false;$("onboard-step").textContent="Prva osoba";$("onboard-first-name").focus()};
 $("onboard-back").onclick=()=>{$("onboard-form").hidden=true;$("onboard-choices").hidden=false;$("onboard-step").textContent="Početak";$("onboard-new").focus()};
 $("onboard-import").onclick=()=>{onboardingImport=true;importMode="replace";$("file").click()};
 $("onboard-form").onsubmit=e=>{e.preventDefault();const name=$("onboard-first-name").value.trim(),treeName=$("onboard-tree-name").value.trim();if(!name)return;
  ps=[];U=[];uid=0;title=treeName||"Moje porodično stablo";const p=mkp(name);p.sn=$("onboard-last-name").value.trim();p.x=$("onboard-sex").value;invalidateIndex();sel=p.id;focus=null;$("vw").value="all";$("title").value=title;save();finishOnboarding();render();msg("Stablo je napravljeno")};
}
$("dimp").onclick=()=>openModal("Uvezi JSON / GEDCOM",`<label>Način uvoza<select id="imode"><option value="new">Uvezi kao novo stablo u biblioteci</option><option value="replace">Zameni trenutno stablo</option></select></label><p style="font-size:12px;margin:0">JSON je potpuna rezervna kopija. GEDCOM prenosi podržane osobe i veze; izvori, mediji i dodatni događaji biće preskočeni. Pre zamene se čuva prethodna verzija.</p>`,()=>{importMode=$("imode").value;$("file").click()},"Izaberi fajl");$("dj").onclick=expJ;$("dg").onclick=expG;$("di").onclick=expI;$("dc").onclick=expC;
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader(),before=snap();let pushed=false,phase="čitanje fajla";
 importDiagnostic("info","Početak uvoza",{file:f.name,bytes:f.size,type:f.type||"",mode:importMode});
 rd.onload=()=>{try{phase="prepoznavanje formata";const isGed=/\.(ged|gedcom)$/i.test(f.name)||/^\uFEFF?0\s+(?:@[^@]+@\s+)?(?:HEAD|INDI)\b/m.test(rd.result),format=isGed?"GEDCOM":"JSON",fallback=f.name.replace(/\.(json|ged|gedcom)$/i,"")||"Uvezeno stablo";let data,report=null;
   phase=isGed?"GEDCOM parsiranje":"JSON parsiranje";if(isGed){const imported=Gedcom.importGedcom(rd.result,fallback);data=imported.data;report=imported.report}else{const raw=JSON.parse(rd.result);if(!Array.isArray(raw.persons))throw new Error("JSON ne sadrži listu osoba");const n=FamilyData.normalize(raw),name=n.title||fallback;data=FamilyData.serialize({title:name,persons:n.persons,unions:n.unions})}
   phase="normalizacija podataka";const n=FamilyData.normalize(data),name=n.title||fallback;data=FamilyData.serialize({title:name,persons:n.persons,unions:n.unions});
   importDiagnostic("info","Fajl je pročitan",{file:f.name,bytes:f.size,format,persons:data.persons.length,unions:data.unions.length,report});
   const summary=report?`GEDCOM uvezen: ${report.persons} osoba, ${report.families} porodica${report.ignored.length?"; preskočene oznake: "+report.ignored.slice(0,6).join(", ")+(report.ignored.length>6?"…":""):""}`:"JSON je uvezen";
   phase="čuvanje novog stabla";if(importMode==="new"&&!EMB){createLocalTree(data,name);if(onboardingImport)finishOnboarding();msg(summary+" — napravljeno je novo stablo");return}
   phase="zamena trenutnog stabla";recordVersion(true,"Pre uvoza koji menja stablo");push();pushed=true;load(JSON.stringify(data));focus=null;$("vw").value="all";$("title").value=title;save();openDrawer(false);if(onboardingImport)finishOnboarding();phase="iscrtavanje stabla";render();msg(summary)
  }catch(x){if(pushed)stack.pop();try{load(before);render()}catch(rollbackError){importDiagnostic("error","Vraćanje prethodnog stanja nije uspelo",{phase},rollbackError)}importFailureDialog(f,phase,x)}finally{onboardingImport=false}};
 rd.onerror=()=>{importFailureDialog(f,"čitanje fajla",rd.error||new Error("Browser nije mogao da pročita fajl"));onboardingImport=false};rd.onabort=()=>{importDiagnostic("warn","Čitanje fajla je prekinuto",{file:f.name,bytes:f.size});onboardingImport=false};rd.readAsText(f,"UTF-8");e.target.value=""};

let needsOnboarding=false;
try{needsOnboarding=!EMB&&(!readTreeRegistry().length&&!localStorage.getItem(SKEY)||localStorage.getItem(ONBOARDING_PENDING_KEY)==="1");if(needsOnboarding)localStorage.setItem(ONBOARDING_PENDING_KEY,"1");initTreeLibrary();const s=localStorage.getItem(activeDataKey());if(s)load(s);else if(EMB)load(JSON.stringify(EMB.data));else seed()}catch(e){try{if(EMB)load(JSON.stringify(EMB.data));else seed()}catch(_){seed()}}
let th0="album";try{th0=localStorage.getItem("rodoslov_theme")||"album"}catch(e){}
$("th").value=th0;setTheme(th0);
$("title").value=title;updBk();if(READ_ONLY){document.documentElement.dataset.shared="readonly";$("title").readOnly=true;for(const id of["undo","redo","dimp","dshare","dnet","dvers","vshare","bk"])$(id).hidden=true}render();save();updateSharedCopyBar();if(needsOnboarding)showOnboarding();


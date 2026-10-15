const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM,VirtualConsole}=require("jsdom");

const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"dist","index.html"),"utf8");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"dist","manifest.webmanifest"),"utf8"));
const serviceWorker=fs.readFileSync(path.join(root,"dist","sw.js"),"utf8");
const installIcon=fs.readFileSync(path.join(root,"dist","pwa-icon-512.png"));
const quiet=new VirtualConsole();

assert.equal(manifest.display,"standalone");
assert.ok(manifest.icons.some(x=>x.purpose.includes("maskable")),"PWA ima maskable ikonu");
assert.equal(installIcon.readUInt32BE(16),512,"build pravi PNG ikonu za instalaciju");
assert.match(serviceWorker,/rodoslov-[a-f0-9]{12}/,"build upisuje verzionisan offline cache");
assert.match(serviceWorker,/pathname\.startsWith\("\/s\/"\)/,"deljeni linkovi se ne kesiraju kao lokalna aplikacija");

function app(options={}){
 const source=options.embed?html.replace("<script>",`<script id="embed">const EMBED=${JSON.stringify(options.embed)};</script><script>`):html;
 return new JSDOM(source,{runScripts:"dangerously",url:"https://example.test/",pretendToBeVisual:true,virtualConsole:quiet,beforeParse(window){
  if(options.data){const id="test-tree";window.localStorage.setItem("rodoslov:registry",JSON.stringify([{id,name:options.data.title,created:1,updated:1,count:options.data.persons.length}]));window.localStorage.setItem("rodoslov:active",id);window.localStorage.setItem("rodoslov:tree:"+id,JSON.stringify(options.data))}
  if(options.net){window.localStorage.setItem("rodoslov:netlify:url","https://trees.test");window.sessionStorage.setItem("rodoslov:netlify:admin","test-key");window.fetch=options.net}
  if(options.share){window.navigator.share=options.share;window.navigator.canShare=()=>true}
 }});
}

{
 const dom=app(),d=dom.window.document;
 assert.equal(d.querySelector("#title").value,"Moje porodično stablo");
 assert.equal(d.querySelector("#th").value,"light");
 assert.equal(d.documentElement.dataset.th,"light");
 assert.equal(d.querySelectorAll("#wrap [data-id]").length,1);
 assert.equal(d.querySelector("#onboarding").hidden,false);
 assert.equal(d.querySelector("#onboard-step").textContent,"Početak");
 assert.match(d.querySelector(".onboard-storage").textContent,/ovog browsera/);
 assert.match(d.querySelector("#onboard-import").textContent,/GEDCOM/);
 assert.ok(d.querySelector("#dg"),"meni nudi GEDCOM izvoz");
 assert.ok(d.querySelector("#dpdf"),"meni nudi direktan PDF izvoz");
 assert.ok(d.querySelector("#dpwa"),"meni nudi instalaciju aplikacije");
 assert.equal(d.querySelector('link[rel="manifest"]').getAttribute("href"),"manifest.webmanifest");
 assert.match(html,/function seed\(\)\{ps=\[\];U=\[\];uid=0;title="Moje porodično stablo";mkp\(NEW\)/);
 d.querySelector("#onboard-new").click();assert.equal(d.querySelector("#onboard-step").textContent,"Prva osoba");d.querySelector("#onboard-first-name").value="Milena";d.querySelector("#onboard-last-name").value="Jovanović";d.querySelector("#onboard-sex").value="f";d.querySelector("#onboard-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
 assert.equal(d.querySelector("#onboarding").hidden,true);const saved=JSON.parse(dom.window.localStorage.getItem("rodoslov:tree:"+dom.window.localStorage.getItem("rodoslov:active")));assert.equal(saved.persons[0].name,"Milena");assert.equal(saved.persons[0].surname,"Jovanović");assert.equal(saved.persons[0].sex,"f");
 const theme=d.querySelector("#th");theme.value="cards";theme.dispatchEvent(new dom.window.Event("change",{bubbles:true}));assert.equal(d.documentElement.dataset.th,"cards");theme.value="light";theme.dispatchEvent(new dom.window.Event("change",{bubbles:true}));assert.equal(d.documentElement.dataset.th,"light");
 const pdf=dom.window.jpegPdfDocument(Uint8Array.from([255,216,255,217]),10,10,841.89,595.28);const pdfText=Buffer.from(pdf).toString("latin1");assert.match(pdfText,/^%PDF-1\.4/);assert.match(pdfText,/\/Subtype \/Image/);assert.match(pdfText,/xref\n/);
 d.querySelector("#dimp").click();assert.equal(d.querySelector("#modal").hidden,false);assert.equal(d.querySelector("#modal").getAttribute("aria-modal"),"true");d.querySelector("#mclose").click();assert.equal(d.querySelector("#modal").hidden,true);
 dom.window.close();
}

{
 const data={title:"Pretraga",version:3,persons:[{id:1,name:"Ђорђе",surname:"Петровић"},{id:2,name:"Ljiljana",surname:"Njegoš"},{id:3,name:"Ljubica",surname:"Jovanović"}],unions:[]};
 const dom=app({data}),d=dom.window.document,q=d.querySelector("#sq");
 q.value="djordje petrovic";q.dispatchEvent(new dom.window.Event("input",{bubbles:true}));assert.match(d.querySelector("#sres").textContent,/Ђорђе/);
 q.value="љиљана његош";q.dispatchEvent(new dom.window.Event("input",{bubbles:true}));assert.match(d.querySelector("#sres").textContent,/Ljiljana/);
 q.value="lj";q.dispatchEvent(new dom.window.Event("input",{bubbles:true}));q.dispatchEvent(new dom.window.KeyboardEvent("keydown",{key:"ArrowDown",bubbles:true,cancelable:true}));assert.match(d.querySelector("#sres button.active").textContent,/Ljiljana/);q.dispatchEvent(new dom.window.KeyboardEvent("keydown",{key:"ArrowDown",bubbles:true,cancelable:true}));assert.match(d.querySelector("#sres button.active").textContent,/Ljubica/);q.dispatchEvent(new dom.window.KeyboardEvent("keydown",{key:"ArrowUp",bubbles:true,cancelable:true}));assert.match(d.querySelector("#sres button.active").textContent,/Ljiljana/);q.dispatchEvent(new dom.window.KeyboardEvent("keydown",{key:"ArrowDown",bubbles:true,cancelable:true}));q.dispatchEvent(new dom.window.KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));assert.equal(d.querySelector("#nm").value,"Ljubica","Enter bira aktivni rezultat pretrage");assert.equal(q.getAttribute("aria-expanded"),"false");
 dom.window.close();
}

{
 const embed={id:"shared-test",data:{title:"Podeljeno",version:3,persons:[{id:1,name:"Osoba"}],unions:[]}},dom=app({embed}),d=dom.window.document;
 assert.equal(d.querySelector("#title").readOnly,true);
 assert.equal(d.querySelector("#sharecopy").hidden,false);
 assert.equal(d.querySelector("#undo").hidden,true);
 d.querySelector("#tabB").click();
 assert.ok([...d.querySelectorAll("#tt input[data-f],#tt select[data-f]")].every(x=>x.disabled));
 assert.equal(dom.window.localStorage.getItem("rodoslov:shared-test"),null,"read-only prikaz se ne upisuje kao radno stablo");
 d.querySelector("#sharecopybtn").click();
 const registry=JSON.parse(dom.window.localStorage.getItem("rodoslov:registry"));
 assert.equal(registry.length,1);assert.equal(registry[0].name,"Podeljeno");assert.equal(dom.window.localStorage.getItem("rodoslov:active"),registry[0].id);
 dom.window.close();
}

{
 const data={title:"Fokus",version:3,persons:[
  {id:1,name:"Root",parents:[2]},{id:2,name:"Parent",surname:"Family",parents:[4]},{id:3,name:"Partner"},{id:4,name:"Grandparent"},
  {id:5,name:"Child",parents:[1,3]},{id:6,name:"Grandchild",parents:[5]},{id:7,name:"Sibling",parents:[2]},{id:8,name:"Unrelated"},{id:9,name:"Second child",parents:[1,3]}
 ],unions:[[1,3]]},dom=app({data}),d=dom.window.document;
 d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));
 const view=d.querySelector("#vw");view.value="hourglass";view.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(d.querySelector("#wrap svg").dataset.view,"hourglass");
 assert.ok(d.querySelector('#wrap [data-id="1"]'),"fokusna osoba je prikazana");
 assert.ok(d.querySelector('#wrap [data-id="3"]'),"partner fokusne osobe je prikazan");
 const family=d.querySelector('#wrap [data-parent-set="1:3"]');assert.ok(family,"zajednička deca koriste porodični čvor");assert.equal(family.querySelectorAll("[data-family-trunk]").length,1,"roditeljski par ima jednu zajedničku granu");assert.equal(family.querySelectorAll("[data-family-branch]").length,2,"zajednička grana se račva ka oba deteta");const parentBottom=Math.max(...["1","3"].map(id=>{const r=d.querySelector(`#wrap [data-id="${id}"] rect`);return+r.getAttribute("y")+(+r.getAttribute("height"))}));assert.ok(+family.dataset.busY>=parentBottom+10,"porodični koridor prolazi ispod roditeljskih kartica");
 const lanes=dom.window.routeFamilyLanes([{source:{y:0},minTop:90,lo:0,hi:100},{source:{y:0},minTop:90,lo:50,hi:150},{source:{y:0},minTop:90,lo:170,hi:220}]);assert.deepEqual(lanes.map(x=>x.lane),[1,0,0],"preklopljene porodice dobijaju odvojene koridore bez presecanja grana");
 const direct=d.querySelector('#wrap [data-parent-set="2"][data-family-direct]');assert.ok(direct,"jedno dete koristi zasebnu direktnu porodičnu putanju");assert.equal(direct.querySelectorAll("[data-family-bus]").length,0,"direktna veza nema nepotrebnu horizontalnu sabirnicu");assert.ok(direct.querySelector("[data-family-underlay]"),"ukrštanja veza ostaju vizuelno razdvojena");
 assert.equal(d.querySelector('#wrap [data-id="7"]'),null,"bočna grana pretka nije prikazana");
 assert.equal(d.querySelector('#wrap [data-id="8"]'),null,"nepovezana osoba nije prikazana");
 d.querySelector("#gb").value="1";d.querySelector("#gf").value="1";d.querySelector("#gf").dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.ok(d.querySelector('#wrap [data-id="2"]'));assert.ok(d.querySelector('#wrap [data-id="5"]'));
 assert.equal(d.querySelector('#wrap [data-id="4"]'),null,"ograničenje predaka radi");assert.equal(d.querySelector('#wrap [data-id="6"]'),null,"ograničenje potomaka radi");
 d.querySelector('#wrap [data-id="5"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));assert.equal(d.querySelector("#nm").value,"Child","klik bira osobu za editor");assert.equal(d.querySelector('#wrap [data-id="5"]').dataset.kind,"person","klik menja centar peščanog sata");
 view.value="fan";view.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(d.querySelector("#wrap svg").dataset.view,"fan");assert.equal(d.querySelector('#wrap [data-id="5"]').dataset.kind,"root","izabrana osoba je u centru lepeze");assert.ok(d.querySelector('#wrap [data-kind="root"] path'),"centar lepeze je polukružni segment");assert.equal(d.querySelector('#wrap [data-kind="root"] rect'),null,"centar lepeze nije pravougaona kartica");assert.equal(d.querySelector('#wrap [data-id="2"] [data-fan-name]').textContent,"Parent");assert.equal(d.querySelector('#wrap [data-id="2"] [data-fan-surname]').textContent,"Family","ime i prezime pretka su odvojeni redovi");assert.ok(d.querySelectorAll("#wrap [data-empty]").length>0,"nepoznati preci zadržavaju slotove");
 assert.equal(d.querySelector('#wrap [data-id="7"]'),null,"lepeza ne uključuje braću i sestre");
 dom.window.close();
}

{
 const embed={id:"focused-shared",data:{title:"Podeljeno",version:3,persons:[{id:1,name:"Root",parents:[2]},{id:2,name:"Parent"}],unions:[]}},dom=app({embed}),d=dom.window.document;
 d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));const view=d.querySelector("#vw");view.value="hourglass";view.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(d.querySelector("#wrap svg").dataset.view,"hourglass");assert.equal(d.querySelector("#panel").hidden,true,"fokusirani read-only prikaz ne otvara editor");
 view.value="fan";view.dispatchEvent(new dom.window.Event("change",{bubbles:true}));assert.equal(d.querySelector("#wrap svg").dataset.view,"fan");
 assert.equal(dom.window.localStorage.getItem("rodoslov:focused-shared"),null);
 dom.window.close();
}

{
 const data={title:"Nove kontrole",version:3,persons:Array.from({length:16},(_,i)=>({id:i+1,name:"G"+(i+1),...(i<15?{parents:[i+2]}:{})})),unions:[]},dom=app({data}),d=dom.window.document;
 d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));
 const hourglass=d.querySelector('[name="view-kind"][value="hourglass"]');hourglass.click();
 assert.equal(d.querySelector("#vw").value,"hourglass","vizuelni izbor prikaza ažurira postojeće stanje");
 assert.equal(d.querySelector("#wrap svg").dataset.view,"hourglass");
 assert.equal(d.querySelector("#view-scope").hidden,true,"obim se ne prikazuje kada nije standardni dijagram");
 d.querySelector('[data-gen="gb"][data-step="-1"]').click();
 assert.equal(d.querySelector("#gb").options.length,17,"izbor obuhvata svih 15 stvarnih generacija i opciju Sve");
 assert.equal(d.querySelector("#gb").value,"14","minus iz režima Sve polazi od stvarne dubine stabla");
 assert.equal(d.querySelector('[data-gen-value="gb"]').value,"14");
 const years=d.querySelector('[data-toggle="yr"]');years.click();assert.equal(d.querySelector("#yr").value,"0","prekidač ažurira postojeću opciju");
 const standard=d.querySelector('[name="view-kind"][value="standard"]');standard.click();d.querySelector('[name="view-scope"][value="ped"]').click();
 assert.equal(d.querySelector("#vw").value,"ped","obim standardnog prikaza koristi isti renderer");
 dom.window.close();
}

{
 const data={title:"Meni",version:3,persons:[{id:1,name:"Root"}],unions:[]},dom=app({data}),d=dom.window.document;
 d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));const button=d.querySelector("#madd");button.click();
 assert.equal(button.getAttribute("aria-expanded"),"true");assert.equal(d.querySelector("#pop").getAttribute("role"),"menu");assert.equal(d.activeElement.getAttribute("role"),"menuitem","prva stavka dobija fokus");
 d.activeElement.dispatchEvent(new dom.window.KeyboardEvent("keydown",{key:"Escape",bubbles:true}));assert.equal(d.querySelector("#pop"),null);assert.equal(button.getAttribute("aria-expanded"),"false");assert.equal(d.activeElement,button,"Escape vraća fokus na dugme");
 assert.ok(d.querySelector("#morder svg use"),"akcija redosleda ima internu ikonicu");dom.window.close();
}

{
 const dom=app({data:{title:"Dodir",version:3,persons:[{id:1,name:"Root"}],unions:[]}}),d=dom.window.document,w=d.querySelector("#wrap"),svg=()=>d.querySelector("#wrap svg"),pointer=(type,id,x,y)=>{const e=new dom.window.Event(type,{bubbles:true,cancelable:true});Object.defineProperties(e,{pointerId:{value:id},pointerType:{value:"touch"},button:{value:0},clientX:{value:x},clientY:{value:y}});w.dispatchEvent(e)};
 const before=+svg().getAttribute("width");pointer("pointerdown",1,100,100);pointer("pointerdown",2,200,100);pointer("pointermove",2,300,100);
 assert.ok(+svg().getAttribute("width")>before*1.8,"pinch razmicanje uvećava prikaz");pointer("pointerup",2,300,100);pointer("pointerup",1,100,100);dom.window.close();
}

{
 const data={title:"Redosled dece",version:3,persons:[{id:1,name:"Root"},{id:2,name:"Older",parents:[1]},{id:3,name:"Younger long",parents:[1]},{id:4,name:"Long 2",parents:[3]},{id:5,name:"Long 3",parents:[4]}],unions:[]},dom=app({data}),d=dom.window.document;
 const y=id=>+d.querySelector(`#wrap g[data-id="${id}"] rect`).getAttribute("y");
 assert.ok(y(2)<y(3),"ručni redosled braće i sestara ima prednost nad veličinom grane");dom.window.close();
}

{
 const data={title:"Odvojene grane",version:3,persons:[{id:1,name:"Short root"},{id:2,name:"Short child",parents:[1]},{id:3,name:"Long root"},{id:4,name:"Long child",parents:[3]},{id:5,name:"Long grandchild",parents:[4]}],unions:[]},dom=app({data}),d=dom.window.document;
 const y=id=>+d.querySelector(`#wrap g[data-id="${id}"] rect`).getAttribute("y");
 assert.ok(y(3)<y(1),"duže odvojeno stablo se raspoređuje iznad kraćeg");dom.window.close();
}

{
 const data={title:"Alternativna imena",version:3,persons:[{id:1,name:"Aleksandar",aliases:["Aca"]}],unions:[]},dom=app({data}),d=dom.window.document,q=d.querySelector("#sq");q.value="aca";q.dispatchEvent(new dom.window.Event("input",{bubbles:true}));assert.match(d.querySelector("#sres").textContent,/Aleksandar/);
 d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));d.querySelector("#mdet").click();assert.equal(d.querySelector("#d6").value,"Aca");d.querySelector("#d6").value="Aca\nSasa";d.querySelector("#mok").click();const saved=JSON.parse(dom.window.localStorage.getItem("rodoslov:tree:test-tree"));assert.deepEqual(saved.persons[0].aliases,["Aca","Sasa"]);dom.window.close();
}

{
 const data={title:"Partneri",version:3,persons:[{id:1,name:"Main"},{id:2,name:"First"},{id:3,name:"Second"}],unions:[[1,2],[1,3]]},dom=app({data}),d=dom.window.document;d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));d.querySelector("#morder").click();d.querySelector('[data-porder="2"][data-dir="1"]').click();const saved=JSON.parse(dom.window.localStorage.getItem("rodoslov:tree:test-tree"));assert.deepEqual(saved.unions,[[1,3],[1,2]],"ručni redosled partnera opstaje");dom.window.close();
}

{
 const data={title:"Braća",version:3,persons:[{id:1,name:"Parent"},{id:2,name:"First",parents:[1]},{id:3,name:"Second",parents:[1]}],unions:[]},dom=app({data}),d=dom.window.document;d.querySelector('#wrap [data-id="2"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));d.querySelector("#morder").click();d.querySelector('[data-sorder="2"][data-dir="1"]').click();const saved=JSON.parse(dom.window.localStorage.getItem("rodoslov:tree:test-tree"));assert.deepEqual(saved.persons.map(p=>p.id),[1,3,2],"zajednički dijalog čuva ručni redosled braće i sestara");dom.window.close();
}

{
 const data={title:"Duplikati",version:3,persons:[{id:1,name:"Main",parents:[3]},{id:2,name:"Duplicate",parents:[3],aliases:["Dule"]},{id:3,name:"Parent"},{id:4,name:"Child",parents:[2]},{id:5,name:"Partner"}],unions:[[2,5]]},dom=app({data}),d=dom.window.document;d.querySelector('#wrap [data-id="1"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));d.querySelector("#mmore").click();[...d.querySelectorAll("#pop button")].find(b=>/Spoji mogući duplikat/.test(b.textContent)).click();d.querySelector('#wrap [data-id="2"]').dispatchEvent(new dom.window.MouseEvent("click",{bubbles:true}));assert.match(d.querySelector("#mt").textContent,/Spoji duplikate/);d.querySelector("#mok").click();const saved=JSON.parse(dom.window.localStorage.getItem("rodoslov:tree:test-tree"));assert.equal(saved.persons.some(p=>p.id===2),false);assert.deepEqual(saved.persons.find(p=>p.id===4).parents,[1]);assert.deepEqual(saved.unions,[[1,5]]);assert.ok(saved.persons.find(p=>p.id===1).aliases.includes("Duplicate"));dom.window.close();
}

{
 const data={title:"Privatnost",version:3,persons:[{id:1,name:"Living",born:"2000",place:"Town",note:"Private"}],unions:[]},dom=app({data}),d=dom.window.document;assert.equal(d.querySelectorAll(".drawer-section").length,2,"fajl i štampa su kompaktne grupe");d.querySelector("#dshare").click();assert.equal(d.querySelector("#s3").value,"netlify","Netlify link je prva opcija deljenja");assert.match(d.querySelector("#sprev").textContent,/Pregled privatnosti/);assert.match(d.querySelector("#sprev").textContent,/1 verovatno živih/);assert.match(d.querySelector("#sprev").textContent,/biće sakrivene/);d.querySelector("#s5").checked=false;d.querySelector("#s5").dispatchEvent(new dom.window.Event("change",{bubbles:true}));assert.match(d.querySelector("#sprev").textContent,/neće biti sakriveni/);dom.window.close();
}

(async()=>{
 const {addLegacyCopyAction}=await import("../netlify/functions/share-tree.mjs");
 const legacy=addLegacyCopyAction("<!doctype html><body><main>Staro stablo</main></body>","abcdefghijklmnopqrstuvwx");
 assert.match(legacy,/sharecopybtn-legacy/);assert.match(legacy,/dataset\.shared="readonly"/);
 const calls=[],token="abcdefghijklmnopqrstuvwx",fetch=async(url,options={})=>{calls.push({url,options});return{ok:true,status:200,json:async()=>options.method==="PATCH"?{token,expires:Date.now()+90*86400000}:options.method==="POST"?{token,url:"https://trees.test/s/"+token,expires:Date.now()+30*86400000}:{items:[{token,title:"Test objava",created:Date.now()-1000,expires:Date.now()+30*86400000,size:1234}],totalSize:1234,removedExpired:0}}};
 let shared=null;const dom=app({data:{title:"Mreža",version:3,persons:[{id:1,name:"Osoba"}],unions:[]},net:fetch,share:async data=>{shared=data}}),d=dom.window.document;d.querySelector("#dnet").click();await new Promise(r=>setTimeout(r,0));
 assert.equal(d.querySelector("#mt").textContent,"Netlify objave");assert.ok(d.querySelector("[data-netextend]"));assert.ok(d.querySelector("[data-netdel]"));assert.match(d.querySelector(".net-summary").textContent,/1.*aktivnih linkova/);
 d.querySelector("[data-netshare]").click();await new Promise(r=>setTimeout(r,0));assert.equal(shared.url,"https://trees.test/s/"+token,"sistemsko deljenje dobija Netlify link");
 d.querySelector("[data-netqr]").click();assert.match(d.querySelector(".net-qr img").src,/qr-code\?token=abcdefghijklmnopqrstuvwx/);
 d.querySelector("#dnet").click();await new Promise(r=>setTimeout(r,0));d.querySelector("[data-netextend]").click();d.querySelector("#mok").click();await new Promise(r=>setTimeout(r,10));assert.ok(calls.some(x=>x.options.method==="PATCH"),"produženje koristi PATCH");
 d.querySelector("[data-netsettings]").click();d.querySelector("#netremember").checked=true;d.querySelector("#mok").click();assert.equal(dom.window.localStorage.getItem("rodoslov:netlify:admin-device"),"test-key","ključ može da ostane zapamćen samo na uređaju");
 shared=null;d.querySelector("#dshare").click();d.querySelector("#mok").click();await new Promise(r=>setTimeout(r,10));assert.ok(calls.some(x=>x.options.method==="POST"),"Netlify objava koristi POST");assert.equal(shared.url,"https://trees.test/s/"+token,"sistemsko deljenje se pokušava odmah po nastanku linka");assert.match(d.querySelector("#mt").textContent,/Link je napravljen/);dom.window.close();
 console.log("ui: svi testovi su prošli");
})().catch(e=>{console.error(e);process.exitCode=1});

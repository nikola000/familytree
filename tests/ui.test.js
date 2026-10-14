const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {JSDOM,VirtualConsole}=require("jsdom");

const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"dist","index.html"),"utf8");
const quiet=new VirtualConsole();

function app(options={}){
 const source=options.embed?html.replace("<script>",`<script id="embed">const EMBED=${JSON.stringify(options.embed)};</script><script>`):html;
 return new JSDOM(source,{runScripts:"dangerously",url:"https://example.test/",pretendToBeVisual:true,virtualConsole:quiet,beforeParse(window){
  if(options.data){const id="test-tree";window.localStorage.setItem("rodoslov:registry",JSON.stringify([{id,name:options.data.title,created:1,updated:1,count:options.data.persons.length}]));window.localStorage.setItem("rodoslov:active",id);window.localStorage.setItem("rodoslov:tree:"+id,JSON.stringify(options.data))}
 }});
}

{
 const dom=app(),d=dom.window.document;
 assert.equal(d.querySelector("#title").value,"Moje porodično stablo");
 assert.equal(d.querySelector("#th").value,"light");
 assert.equal(d.documentElement.dataset.th,"light");
 assert.equal(d.querySelectorAll("#wrap [data-id]").length,1);
 assert.equal(d.querySelector("#onboarding").hidden,false);
 assert.match(d.querySelector(".onboard-storage").textContent,/ovog browsera/);
 assert.match(html,/function seed\(\)\{ps=\[\];U=\[\];uid=0;title="Moje porodično stablo";mkp\(NEW\)/);
 d.querySelector("#onboard-new").click();d.querySelector("#onboard-first-name").value="Milena";d.querySelector("#onboard-last-name").value="Jovanović";d.querySelector("#onboard-sex").value="f";d.querySelector("#onboard-form").dispatchEvent(new dom.window.Event("submit",{bubbles:true,cancelable:true}));
 assert.equal(d.querySelector("#onboarding").hidden,true);const saved=JSON.parse(dom.window.localStorage.getItem("rodoslov:tree:"+dom.window.localStorage.getItem("rodoslov:active")));assert.equal(saved.persons[0].name,"Milena");assert.equal(saved.persons[0].surname,"Jovanović");assert.equal(saved.persons[0].sex,"f");
 const theme=d.querySelector("#th");theme.value="cards";theme.dispatchEvent(new dom.window.Event("change",{bubbles:true}));assert.equal(d.documentElement.dataset.th,"cards");theme.value="light";theme.dispatchEvent(new dom.window.Event("change",{bubbles:true}));assert.equal(d.documentElement.dataset.th,"light");
 dom.window.close();
}

{
 const data={title:"Pretraga",version:3,persons:[{id:1,name:"Ђорђе",surname:"Петровић"},{id:2,name:"Ljiljana",surname:"Njegoš"}],unions:[]};
 const dom=app({data}),d=dom.window.document,q=d.querySelector("#sq");
 q.value="djordje petrovic";q.dispatchEvent(new dom.window.Event("input",{bubbles:true}));assert.match(d.querySelector("#sres").textContent,/Ђорђе/);
 q.value="љиљана његош";q.dispatchEvent(new dom.window.Event("input",{bubbles:true}));assert.match(d.querySelector("#sres").textContent,/Ljiljana/);
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

(async()=>{
 const {addLegacyCopyAction}=await import("../netlify/functions/share-tree.mjs");
 const legacy=addLegacyCopyAction("<!doctype html><body><main>Staro stablo</main></body>","abcdefghijklmnopqrstuvwx");
 assert.match(legacy,/sharecopybtn-legacy/);assert.match(legacy,/dataset\.shared="readonly"/);
 console.log("ui: svi testovi su prošli");
})().catch(e=>{console.error(e);process.exitCode=1});

(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.Gedcom=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 const SUPPORTED_VERSIONS=/^(5\.5(?:\.1)?|7(?:\.\d+){1,2})$/;
 const CORE_TAGS=new Set(["HEAD","TRLR","GEDC","VERS","FORM","CHAR","SOUR","FILE","INDI","FAM","NAME","GIVN","SURN","NICK","SEX","BIRT","DEAT","DATE","PLAC","RESI","NOTE","CONT","CONC","FAMC","FAMS","HUSB","WIFE","CHIL","_SLAVA"]);

 function parseLines(text){
  if(typeof text!=="string")throw new Error("GEDCOM sadržaj nije tekst");
  if(text.length>20*1024*1024)throw new Error("GEDCOM fajl je veći od podržanih 20 MB");
  const rows=text.replace(/^\uFEFF/,"").split(/\r\n|\n|\r/),roots=[],stack=[];
  for(let i=0;i<rows.length;i++){
   if(!rows[i].trim())continue;
   const m=rows[i].match(/^(\d+)\s+(?:(@[^@\r\n]+@)\s+)?([A-Za-z0-9_]+)(?:\s(.*))?$/);
   if(!m)throw new Error("Neispravna GEDCOM linija "+(i+1));
   const level=Number(m[1]);if(level>99)throw new Error("Neispravan GEDCOM nivo u liniji "+(i+1));
   const node={level,xref:m[2]||"",tag:m[3].toUpperCase(),value:m[4]||"",children:[],line:i+1};
   while(stack.length&&stack[stack.length-1].level>=level)stack.pop();
   if(level===0)roots.push(node);else{
    const parent=stack[stack.length-1];if(!parent||parent.level!==level-1)throw new Error("Prekinuta GEDCOM hijerarhija u liniji "+(i+1));
    parent.children.push(node)
   }
   stack.push(node)
  }
  return roots
 }
 const child=(n,tag)=>n&&n.children.find(x=>x.tag===tag);
 const children=(n,tag)=>n?n.children.filter(x=>x.tag===tag):[];
 function textOf(n){
  if(!n)return"";let out=n.value;
  for(const x of n.children)if(x.tag==="CONC")out+=x.value;else if(x.tag==="CONT")out+="\n"+x.value;
  return out.replace(/@@/g,"@").trim()
 }
 function nameParts(n){
  const givn=textOf(child(n,"GIVN")),surn=textOf(child(n,"SURN"));
  if(givn||surn)return{name:givn||"Nepoznata osoba",surname:surn};
  const raw=textOf(n),m=raw.match(/^(.*?)\s*\/([^/]*)\/(.*)$/);
  if(m)return{name:(m[1]+" "+m[3]).replace(/\s+/g," ").trim()||"Nepoznata osoba",surname:m[2].trim()};
  return{name:raw||"Nepoznata osoba",surname:""}
 }
 function importGedcom(text,fallbackTitle="Uvezeno GEDCOM stablo"){
  const roots=parseLines(text),head=roots.find(x=>x.tag==="HEAD"),version=textOf(child(child(head,"GEDC"),"VERS"));
  const charset=textOf(child(head,"CHAR")).toUpperCase();
  if(charset==="ANSEL")throw new Error("ANSEL kodiranje nije podržano; izvezi GEDCOM kao UTF-8 u izvornom programu");
  if(version&&!SUPPORTED_VERSIONS.test(version))throw new Error("GEDCOM verzija "+version+" nije podržana (podržane su 5.5, 5.5.1 i 7.x)");
  const records=roots.filter(x=>x.tag==="INDI"),families=roots.filter(x=>x.tag==="FAM");
  if(!records.length)throw new Error("GEDCOM ne sadrži osobe");
  const ids=new Map(),persons=[],used=new Set();let next=0,unnamed=0;
  for(const r of records){let id=Number((r.xref.match(/\d+/)||[])[0]);if(!Number.isSafeInteger(id)||id<=0||used.has(id))while(used.has(++next));else next=Math.max(next,id);used.add(id);ids.set(r.xref,id);
   const names=children(r,"NAME"),np=nameParts(names[0]);if(np.name==="Nepoznata osoba")unnamed++;
   const p={id,name:np.name};if(np.surname)p.surname=np.surname;
   const aliases=[];for(const nick of children(names[0],"NICK")){const v=textOf(nick);if(v)aliases.push(v)}for(const alt of names.slice(1)){const a=nameParts(alt),v=[a.name,a.surname].filter(Boolean).join(" ");if(v&&v!==p.name+" "+(p.surname||""))aliases.push(v)}if(aliases.length)p.aliases=[...new Set(aliases)].slice(0,30);
   const sex=textOf(child(r,"SEX")).toUpperCase();if(sex==="M"||sex==="F")p.sex=sex.toLowerCase();
   const birth=child(r,"BIRT"),death=child(r,"DEAT"),resi=child(r,"RESI"),born=textOf(child(birth,"DATE")),died=textOf(child(death,"DATE"));if(born)p.born=born;if(died)p.died=died;
   const place=textOf(child(birth,"PLAC"))||textOf(child(resi,"PLAC"))||textOf(child(death,"PLAC"));if(place)p.place=place;
   const notes=children(r,"NOTE").map(textOf).filter(Boolean);if(notes.length)p.note=notes.join("\n\n");const slava=textOf(child(r,"_SLAVA"));if(slava)p.slava=slava;
   persons.push(p)
  }
  const unions=[],seenUnions=new Set(),parents=new Map(persons.map(p=>[p.id,[]]));let truncatedParents=0;
  const addUnion=(a,b)=>{if(!a||!b||a===b)return;const k=[a,b].sort((x,y)=>x-y).join(":");if(!seenUnions.has(k)){seenUnions.add(k);unions.push([a,b])}};
  for(const f of families){const adults=[...children(f,"HUSB"),...children(f,"WIFE")].map(x=>ids.get(textOf(x))).filter(Boolean);for(let i=0;i<adults.length;i++)for(let j=i+1;j<adults.length;j++)addUnion(adults[i],adults[j]);
   const kids=[...children(f,"CHIL").map(x=>ids.get(textOf(x))).filter(Boolean)];
   for(const r of records)if(children(r,"FAMC").some(x=>textOf(x)===f.xref))kids.push(ids.get(r.xref));
   for(const kid of new Set(kids)){const dest=parents.get(kid);if(!dest)continue;for(const adult of adults)if(!dest.includes(adult)){if(dest.length<2)dest.push(adult);else truncatedParents++}}
  }
  for(const p of persons){const par=parents.get(p.id);if(par.length)p.parents=par}
  const ignored=new Set();for(const r of roots){if(!CORE_TAGS.has(r.tag))ignored.add(r.tag);const walk=n=>n.children.forEach(x=>{if(!CORE_TAGS.has(x.tag))ignored.add(x.tag);walk(x)});walk(r)}
  const title=textOf(child(head,"FILE")).replace(/\.(ged|gedcom)$/i,"")||fallbackTitle;
  return{data:{title,version:3,persons,unions},report:{version:version||"nepoznata",persons:persons.length,families:families.length,unnamed,truncatedParents,ignored:[...ignored].sort()}}
 }
 function safeValue(value){return String(value??"").replace(/\r\n?|\n/g,"\n").replace(/^@/,"@@")}
 function valueLines(level,tag,value){
  const logical=safeValue(value).split("\n"),out=[];
  logical.forEach((line,li)=>{const chunks=[];for(let s=line;s.length;s=s.slice(180))chunks.push(s.slice(0,180));if(!chunks.length)chunks.push("");chunks.forEach((part,ci)=>out.push(`${level+(li||ci?1:0)} ${li?(ci?"CONC":"CONT"):(ci?"CONC":tag)}${part?" "+part:""}`))});return out
 }
 function exportGedcom(data){
  if(!data||!Array.isArray(data.persons))throw new Error("Neispravni podaci stabla");
  const persons=data.persons,unions=Array.isArray(data.unions)?data.unions:[],byId=new Map(persons.map(p=>[p.id,p])),families=[],familyKeys=new Map();
  const addFamily=parents=>{const a=[...new Set(parents.filter(id=>byId.has(id)))],key=a.slice().sort((x,y)=>x-y).join(":");if(!familyKeys.has(key)){familyKeys.set(key,families.length);families.push({parents:a,children:[]})}return families[familyKeys.get(key)]};
  for(const u of unions)if(Array.isArray(u)&&u.length===2)addFamily(u);
  for(const p of persons)if(Array.isArray(p.parents)&&p.parents.length)addFamily(p.parents).children.push(p.id);
  const famRefs=new Map(persons.map(p=>[p.id,{asParent:[],asChild:[]} ]));families.forEach((f,i)=>{for(const id of f.parents)famRefs.get(id)?.asParent.push(i+1);for(const id of f.children)famRefs.get(id)?.asChild.push(i+1)});
  const out=["0 HEAD","1 SOUR RODOSLOV","2 VERS 1.0","1 GEDC","2 VERS 5.5.1","2 FORM LINEAGE-LINKED","1 CHAR UTF-8","1 FILE rodoslov.ged"];
  for(const p of persons){out.push(`0 @I${p.id}@ INDI`);const given=safeValue(p.name||"Nepoznata osoba"),surname=safeValue(p.surname||"");out.push(`1 NAME ${given}${surname?" /"+surname+"/":""}`,`2 GIVN ${given}`);if(surname)out.push(`2 SURN ${surname}`);for(const a of Array.isArray(p.aliases)?p.aliases:[])out.push(...valueLines(2,"NICK",a));if(p.sex==="m"||p.sex==="f")out.push("1 SEX "+p.sex.toUpperCase());if(p.born){out.push("1 BIRT");out.push(...valueLines(2,"DATE",p.born))}if(p.died){out.push("1 DEAT");out.push(...valueLines(2,"DATE",p.died))}if(p.place){out.push("1 RESI");out.push(...valueLines(2,"PLAC",p.place))}if(p.slava)out.push(...valueLines(1,"_SLAVA",p.slava));if(p.note)out.push(...valueLines(1,"NOTE",p.note));for(const n of famRefs.get(p.id).asChild)out.push(`1 FAMC @F${n}@`);for(const n of famRefs.get(p.id).asParent)out.push(`1 FAMS @F${n}@`)}
  families.forEach((f,i)=>{out.push(`0 @F${i+1}@ FAM`);f.parents.forEach((id,j)=>{const p=byId.get(id),tag=p&&p.sex==="f"?"WIFE":p&&p.sex==="m"?"HUSB":j?"WIFE":"HUSB";out.push(`1 ${tag} @I${id}@`)});for(const id of f.children)out.push(`1 CHIL @I${id}@`)});out.push("0 TRLR");return"\uFEFF"+out.join("\r\n")+"\r\n"
 }
 return{importGedcom,exportGedcom,parseLines};
});

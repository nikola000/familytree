(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.FamilyData=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 const FIELDS=[["by","born"],["dy","died"],["pl","place"],["sl","slava"],["nt","note"]];
 const CYR={"а":"a","б":"b","в":"v","г":"g","д":"d","ђ":"dj","е":"e","ж":"z","з":"z","и":"i","ј":"j","к":"k","л":"l","љ":"lj","м":"m","н":"n","њ":"nj","о":"o","п":"p","р":"r","с":"s","т":"t","ћ":"c","у":"u","ф":"f","х":"h","ц":"c","ч":"c","џ":"dz","ш":"s"};
 const partnerIds=(unions,id)=>unions.filter(u=>u.includes(id)).map(u=>u[0]===id?u[1]:u[0]);

 function searchKey(value){
  return[...String(value??"").toLocaleLowerCase("sr")].map(c=>CYR[c]||c).join("").replace(/đ/g,"dj").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim()
 }

 function migratePeople(persons,unions){
  for(const p of persons){
   if(p.par.length===1&&!p.solo){
    const pt=partnerIds(unions,p.par[0]);
    if(pt.length===1&&partnerIds(unions,pt[0]).length===1)p.par.push(pt[0]);
    else if(pt.length>1)p.parentageUnresolved=true
   }
   delete p.solo
  }
  return persons
 }

 function normalize(input){
  if(!input||!Array.isArray(input.persons))throw new Error("Neispravan format stabla");
  const version=Number(input.version)||1;
  const persons=input.persons.map(x=>{
   if(!x||typeof x.name!=="string"||!x.name.trim())throw new Error("Osoba nema ime");
   const id=Number(x.id);if(!Number.isSafeInteger(id)||id<=0)throw new Error("Neispravan ID osobe");
   const p={id,name:x.name,sn:typeof x.surname==="string"?x.surname:"",par:Array.isArray(x.parents)?x.parents.map(Number):[]};
   if(Array.isArray(x.aliases)){p.aliases=[...new Set(x.aliases.filter(a=>typeof a==="string").map(a=>a.trim()).filter(Boolean))].slice(0,30)}
   if(version<3&&x.soloParent===true)p.solo=true;
   if(version>=3&&x.parentageUnresolved===true)p.parentageUnresolved=true;
   if(x.sex==="m"||x.sex==="f")p.x=x.sex;
   for(const[k,j]of FIELDS)if(typeof x[j]==="string"&&x[j])p[k]=x[j];
   return p
  });
  const ids=new Set(persons.map(p=>p.id));if(ids.size!==persons.length)throw new Error("Dupliran ID osobe");
  persons.forEach(p=>p.par=p.par.filter(i=>ids.has(i)&&i!==p.id).slice(0,2));
  const seen=new Set(),unions=(Array.isArray(input.unions)?input.unions:[]).map(u=>Array.isArray(u)?u.map(Number):[]).filter(u=>{
   if(u.length!==2||u[0]===u[1]||!ids.has(u[0])||!ids.has(u[1]))return false;
   const key=u.slice().sort((a,b)=>a-b).join(":");if(seen.has(key))return false;seen.add(key);return true
  });
  if(version<3)migratePeople(persons,unions);
  return{title:typeof input.title==="string"?input.title:null,persons,unions,uid:Math.max(0,...ids),sourceVersion:version}
 }

 function serialize({title,persons,unions}){
  return{title,version:3,persons:persons.map(p=>{const o={id:p.id,name:p.name};if(p.sn)o.surname=p.sn;if(p.aliases&&p.aliases.length)o.aliases=[...p.aliases];if(p.par.length)o.parents=[...p.par];if(p.parentageUnresolved)o.parentageUnresolved=true;if(p.x)o.sex=p.x;for(const[k,j]of FIELDS)if(p[k])o[j]=p[k];return o}),unions:unions.map(u=>[...u])}
 }

 return{normalize,serialize,migratePeople,partnerIds,searchKey};
});

const assert=require("node:assert/strict");
const FamilyData=require("../src/js/00-family-data.js");

function person(id,name,parents){const p={id,name};if(parents)p.parents=parents;return p}

{
 const d=FamilyData.normalize({version:2,persons:[person(1,"Otac"),person(2,"Majka"),person(3,"Dete",[1])],unions:[[1,2]]});
 assert.deepEqual(d.persons.find(p=>p.id===3).par,[1,2],"jedini partner postaje eksplicitni drugi roditelj");
}

{
 const d=FamilyData.normalize({version:2,persons:[person(1,"Roditelj"),person(2,"Partner"),{...person(3,"Dete",[1]),soloParent:true}],unions:[[1,2]]});
 assert.deepEqual(d.persons.find(p=>p.id===3).par,[1],"soloParent zadržava jednog roditelja");
}

{
 const d=FamilyData.normalize({version:2,persons:[person(1,"Roditelj"),person(2,"Partner A"),person(3,"Partner B"),person(4,"Dete",[1])],unions:[[1,2],[1,3]]});
 const child=d.persons.find(p=>p.id===4);
 assert.deepEqual(child.par,[1],"migracija ne nagađa između više partnera");
 assert.equal(child.parentageUnresolved,true,"nejasno roditeljstvo dobija oznaku za proveru");
}

{
 const d=FamilyData.normalize({version:3,persons:[person(1,"Roditelj"),person(2,"Partner"),person(3,"Dete",[1])],unions:[[1,2]]});
 assert.deepEqual(d.persons.find(p=>p.id===3).par,[1],"v3 nikada ne zaključuje roditelja iz partnerstva");
}

{
 const d=FamilyData.normalize({version:3,persons:[person(1,"A"),person(2,"B")],unions:[[1,2],[2,1],[1,1],[1,99]]});
 assert.deepEqual(d.unions,[[1,2]],"veze se deduplikuju i nevažeće veze odbacuju");
}

{
 const out=FamilyData.serialize({title:"Test",persons:[{id:1,name:"Roditelj",sn:"",par:[]},{id:2,name:"Dete",sn:"",par:[1],parentageUnresolved:true}],unions:[]});
 assert.equal(out.version,3);
 assert.deepEqual(out.persons[1].parents,[1]);
 assert.equal(out.persons[1].parentageUnresolved,true);
 assert.equal("soloParent" in out.persons[1],false);
}

{
 const d=FamilyData.normalize({version:3,persons:[{id:1,name:"Aleksandar",aliases:["Aca"," Aca ","Sasa",""]}],unions:[]});assert.deepEqual(d.persons[0].aliases,["Aca","Sasa"]);
 const out=FamilyData.serialize({title:"Aliasi",persons:d.persons,unions:[]});assert.deepEqual(out.persons[0].aliases,["Aca","Sasa"],"alternativna imena opstaju u JSON v3")
}

assert.throws(()=>FamilyData.normalize({version:3,persons:[person(1,"A"),person(1,"B")]}),/Dupliran ID/);
assert.throws(()=>FamilyData.normalize({version:3,persons:[person(0,"A")]}),/Neispravan ID/);
assert.throws(()=>FamilyData.normalize({version:3,persons:[person(1,"")]}),/nema ime/);

assert.equal(FamilyData.searchKey("Ђорђе Љиљана Његош Џони"),"djordje ljiljana njegos dzoni");
assert.equal(FamilyData.searchKey("Đorđe Ljiljana Njegoš Džoni"),"djordje ljiljana njegos dzoni");
assert.ok(FamilyData.searchKey("Петровић Никола").includes(FamilyData.searchKey("petrovic")));

console.log("family-data: svi testovi su prošli");

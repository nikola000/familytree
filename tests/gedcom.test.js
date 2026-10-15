const assert=require("node:assert/strict");
const Gedcom=require("../src/js/00-gedcom.js");

const fixture=`0 HEAD
1 SOUR Test
1 FILE primer.ged
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I10@ INDI
1 NAME Petar /Petrović/
2 GIVN Petar
2 SURN Petrović
2 NICK Pera
1 SEX M
1 BIRT
2 DATE 3 MAR 1901
2 PLAC Novi Sad
1 NOTE Prvi red
2 CONT Drugi red
1 _SLAVA Sveti Nikola
0 @I20@ INDI
1 NAME Ana /Jovanović/
1 SEX F
0 @I30@ INDI
1 NAME Dete /Petrović/
0 @F1@ FAM
1 HUSB @I10@
1 WIFE @I20@
1 CHIL @I30@
0 TRLR`;

{
 const {data,report}=Gedcom.importGedcom(fixture,"Rezerva");
 assert.equal(data.title,"primer");assert.equal(report.version,"5.5.1");assert.equal(report.persons,3);
 assert.deepEqual(data.unions,[[10,20]]);assert.deepEqual(data.persons.find(p=>p.id===30).parents,[10,20]);
 const petar=data.persons.find(p=>p.id===10);assert.equal(petar.surname,"Petrović");assert.deepEqual(petar.aliases,["Pera"]);assert.equal(petar.born,"3 MAR 1901");assert.equal(petar.place,"Novi Sad");assert.equal(petar.note,"Prvi red\nDrugi red");assert.equal(petar.slava,"Sveti Nikola");
}

{
 const source={title:"Krug",version:3,persons:[{id:1,name:"Mila",surname:"Ilić",aliases:["Miki"],sex:"f",born:"ABT 1980",place:"Niš",note:"Red 1\nRed 2",slava:"Đurđevdan"},{id:2,name:"Ivan",sex:"m"},{id:3,name:"Luka",parents:[1,2]}],unions:[[1,2]]};
 const text=Gedcom.exportGedcom(source);assert.match(text,/2 VERS 5\.5\.1/);assert.match(text,/1 CHAR UTF-8/);assert.match(text,/1 _SLAVA Đurđevdan/);
 const round=Gedcom.importGedcom(text,"Krug").data,mila=round.persons.find(p=>p.id===1);assert.equal(mila.surname,"Ilić");assert.deepEqual(mila.aliases,["Miki"]);assert.equal(mila.note,"Red 1\nRed 2");assert.deepEqual(round.persons.find(p=>p.id===3).parents.slice().sort(),[1,2]);assert.deepEqual(round.unions[0].slice().sort(),[1,2]);
}

assert.throws(()=>Gedcom.importGedcom(fixture.replace("1 CHAR UTF-8","1 CHAR ANSEL")),/ANSEL/);
assert.throws(()=>Gedcom.importGedcom(fixture.replace("2 VERS 5.5.1","2 VERS 4.0")),/nije podržana/);

console.log("gedcom: svi testovi su prošli");

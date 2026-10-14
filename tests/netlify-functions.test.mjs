import assert from "node:assert/strict";
import { manageTrees } from "../netlify/functions/manage-trees.mjs";
import qrCode from "../netlify/functions/qr-code.mjs";

const key="test-admin-key",now=2_000_000_000_000,active="abcdefghijklmnopqrstuvwx",expired="zyxwvutsrqponmlkjihgfedc";
process.env.RODOSLOV_ADMIN_KEY=key;
const data=new Map([
 [active,{title:"Aktivno",created:now-1000,expires:now+86400000,size:120,html:"<html></html>"}],
 [expired,{title:"Isteklo",created:now-2000,expires:now-1,size:80,html:"<html></html>"}]
]);
const reads=[],store={list:async()=>({blobs:[...data.keys()].map(key=>({key}))}),get:async(token,options)=>{reads.push(options);return data.get(token)||null},delete:async token=>data.delete(token),setJSON:async(token,value)=>data.set(token,value)};
const request=(method,url="https://example.test/.netlify/functions/manage-trees",body)=>new Request(url,{method,headers:{"x-rodoslov-key":key,...(body?{"content-type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});

{
 const r=await manageTrees(request("GET"),{store,now}),d=await r.json();assert.equal(r.status,200);assert.equal(d.items.length,1);assert.equal(d.items[0].token,active);assert.equal(d.removedExpired,1);assert.equal(d.totalSize,120);assert.equal(data.has(expired),false,"istekla objava se automatski briše");assert.ok(reads.every(x=>x.consistency==="strong"),"pregled odmah vidi izmene u Blob skladištu")
}
{
 const old=data.get(active).expires,r=await manageTrees(request("PATCH",undefined,{token:active,days:30}),{store,now}),d=await r.json();assert.equal(r.status,200);assert.equal(d.expires,old+30*86400000);assert.equal(data.get(active).expires,d.expires)
}
{
 const r=await manageTrees(request("DELETE",`https://example.test/.netlify/functions/manage-trees?token=${active}`),{store,now});assert.equal(r.status,200);assert.equal(data.has(active),false)
}
{
 const bad=await manageTrees(new Request("https://example.test/.netlify/functions/manage-trees",{headers:{"x-rodoslov-key":"wrong"}}),{store,now});assert.equal(bad.status,401)
}
{
 const r=await qrCode(new Request(`https://example.test/.netlify/functions/qr-code?token=${active}`)),svg=await r.text();assert.equal(r.status,200);assert.match(r.headers.get("content-type"),/image\/svg\+xml/);assert.match(svg,/<svg/)
 const bad=await qrCode(new Request("https://example.test/.netlify/functions/qr-code?token=x"));assert.equal(bad.status,400)
}

console.log("netlify funkcije: svi testovi su prošli");

import { adminKeyConfigured, authorized, cors, json, options, shares } from "./_shared.mjs";

const DAY=86400000,validToken=t=>/^[A-Za-z0-9_-]{20,80}$/.test(t);
export async function manageTrees(req,{store=null,now=Date.now()}={}){
 const pre=options(req);if(pre)return pre;
 if(!adminKeyConfigured())return json({error:"RODOSLOV_ADMIN_KEY nije dostupan Netlify funkcijama. Proveri Environment variables i pokreni novi deploy."},503,cors);
 if(!authorized(req))return json({error:"Pogrešan administratorski ključ"},401,cors);
 if(!store)store=shares();
 const url=new URL(req.url);
 if(req.method==="DELETE"){
  const token=url.searchParams.get("token")||"";if(!validToken(token))return json({error:"Neispravan token"},400,cors);
  await store.delete(token);return json({deleted:true},200,cors)
 }
 if(req.method==="PATCH"){
  let body;try{body=await req.json()}catch{return json({error:"Neispravan JSON"},400,cors)}
  const token=String(body.token||""),days=Math.max(1,Math.min(365,Number(body.days)||30));if(!validToken(token))return json({error:"Neispravan token"},400,cors);
  const x=await store.get(token,{type:"json",consistency:"strong"});if(!x)return json({error:"Objava nije pronađena"},404,cors);
  x.expires=Math.min(Math.max(now,+x.expires||now)+days*DAY,now+365*DAY);await store.setJSON(token,x);
  return json({token,expires:x.expires},200,cors)
 }
 if(req.method!=="GET")return json({error:"Method not allowed"},405,cors);
 const {blobs}=await store.list(),items=[];let removedExpired=0;
 for(const b of blobs){const x=await store.get(b.key,{type:"json"});if(!x)continue;if(x.expires&&now>x.expires){await store.delete(b.key);removedExpired++;continue}items.push({token:b.key,title:x.title,created:x.created,expires:x.expires,size:x.size})}
 items.sort((a,b)=>b.created-a.created);return json({items,removedExpired,totalSize:items.reduce((n,x)=>n+(x.size||0),0)},200,cors)
}
export default req=>manageTrees(req);

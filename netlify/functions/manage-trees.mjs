import { adminKeyConfigured, authorized, cors, json, options, shares } from "./_shared.mjs";

export default async req=>{
 const pre=options(req);if(pre)return pre;
 if(!adminKeyConfigured())return json({error:"RODOSLOV_ADMIN_KEY nije dostupan Netlify funkcijama. Proveri Environment variables i pokreni novi deploy."},503,cors);
 if(!authorized(req))return json({error:"Pogrešan administratorski ključ"},401,cors);
 const store=shares(),url=new URL(req.url);
 if(req.method==="DELETE"){
  const token=url.searchParams.get("token")||"";if(!/^[A-Za-z0-9_-]{20,80}$/.test(token))return json({error:"Neispravan token"},400,cors);
  await store.delete(token);return json({deleted:true},200,cors)
 }
 if(req.method!=="GET")return json({error:"Method not allowed"},405,cors);
 const {blobs}=await store.list(),items=[];
 for(const b of blobs){const x=await store.get(b.key,{type:"json"});if(x)items.push({token:b.key,title:x.title,created:x.created,expires:x.expires,size:x.size,expired:!!x.expires&&Date.now()>x.expires})}
 items.sort((a,b)=>b.created-a.created);return json({items},200,cors)
};

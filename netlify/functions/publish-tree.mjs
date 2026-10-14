import { randomBytes } from "node:crypto";
import { adminKeyConfigured, authorized, cors, json, options, shares } from "./_shared.mjs";

export default async req=>{
 const pre=options(req);if(pre)return pre;
 if(req.method!=="POST")return json({error:"Method not allowed"},405,cors);
 if(!adminKeyConfigured())return json({error:"RODOSLOV_ADMIN_KEY nije dostupan Netlify funkcijama. Proveri Environment variables i pokreni novi deploy."},503,cors);
 if(!authorized(req))return json({error:"Pogrešan administratorski ključ"},401,cors);
 let body;try{body=await req.json()}catch{return json({error:"Neispravan JSON"},400,cors)}
 const html=typeof body.html==="string"?body.html:"";if(!html||new Blob([html]).size>2_000_000)return json({error:"HTML nedostaje ili je veći od 2 MB"},413,cors);
 const days=Math.max(1,Math.min(365,Number(body.days)||30)),created=Date.now(),expires=created+days*86400000,token=randomBytes(24).toString("base64url");
 await shares().setJSON(token,{title:String(body.title||"Porodično stablo").slice(0,160),created,expires,size:new Blob([html]).size,html},{onlyIfNew:true});
 const base=process.env.URL||new URL(req.url).origin;
 return json({token,url:`${base}/s/${token}`,created,expires},201,cors)
};

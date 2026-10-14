import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

export const shares=()=>getStore("rodoslov-shares");
export const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extra}});
export const adminKeyConfigured=()=>Boolean(process.env.RODOSLOV_ADMIN_KEY);
export function authorized(req){
 const expected=process.env.RODOSLOV_ADMIN_KEY||"",actual=req.headers.get("x-rodoslov-key")||"";
 const a=Buffer.from(expected),b=Buffer.from(actual);if(!a.length||a.length!==b.length)return false;
 return timingSafeEqual(a,b)
}
export const cors={"access-control-allow-origin":"*","access-control-allow-headers":"content-type,x-rodoslov-key","access-control-allow-methods":"GET,POST,PATCH,DELETE,OPTIONS"};
export const options=req=>req.method==="OPTIONS"?new Response(null,{status:204,headers:cors}):null;

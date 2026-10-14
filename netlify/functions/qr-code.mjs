import QRCode from "qrcode";

export default async req=>{
 const token=new URL(req.url).searchParams.get("token")||"";
 if(!/^[A-Za-z0-9_-]{20,80}$/.test(token))return new Response("Neispravan token",{status:400});
 const base=(process.env.URL||new URL(req.url).origin).replace(/\/+$/,"");
 const svg=await QRCode.toString(`${base}/s/${token}`,{type:"svg",errorCorrectionLevel:"M",margin:2,width:320,color:{dark:"#172033",light:"#ffffff"}});
 return new Response(svg,{headers:{"content-type":"image/svg+xml; charset=utf-8","cache-control":"public, max-age=86400","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'","x-content-type-options":"nosniff"}})
};

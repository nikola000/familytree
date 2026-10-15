import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const template=await readFile(join(root,"index.html"),"utf8");
const css=await readFile(join(root,"src","styles","app.css"),"utf8");
const jsDir=join(root,"src","js");
const names=(await readdir(jsDir)).filter(x=>x.endsWith(".js")).sort((a,b)=>a.localeCompare(b,"en"));
const scripts=(await Promise.all(names.map(x=>readFile(join(jsDir,x),"utf8")))).join("\n");
const manifest=await readFile(join(root,"pwa","manifest.webmanifest"),"utf8");
const icon=await readFile(join(root,"pwa","pwa-icon.svg"),"utf8");
const swTemplate=await readFile(join(root,"pwa","sw.js"),"utf8");

let output=template.replace(/<!-- DEV:STYLE -->[\s\S]*?<!-- \/DEV:STYLE -->/,`<style>\n${css}</style>`);
output=output.replace(/<!-- DEV:SCRIPTS -->[\s\S]*?<!-- \/DEV:SCRIPTS -->/,`<script>\n${scripts}</script>`);
if(output===template||/<script src="src\/js\//.test(output))throw new Error("Build markeri nisu pravilno zamenjeni.");
const cacheVersion=createHash("sha256").update(output).update(manifest).update(icon).update(swTemplate).digest("hex").slice(0,12);
const sw=swTemplate.replaceAll("__CACHE_VERSION__",cacheVersion);

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function pngChunk(type,data){const name=Buffer.from(type),body=Buffer.concat([name,data]);let crc=0xffffffff;for(const byte of body)crc=crcTable[(crc^byte)&255]^(crc>>>8);const end=Buffer.alloc(4);end.writeUInt32BE((crc^0xffffffff)>>>0);const length=Buffer.alloc(4);length.writeUInt32BE(data.length);return Buffer.concat([length,body,end])}
function appIcon(size){
 const raw=Buffer.alloc((size*4+1)*size),blue=[47,93,158,255],white=[255,255,255,255],circle=(x,y,cx,cy,r)=>(x-cx)**2+(y-cy)**2<=r*r,segment=(x,y,x1,y1,x2,y2,r)=>{const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));return(x-x1-t*dx)**2+(y-y1-t*dy)**2<=r*r};
 for(let py=0;py<size;py++){const row=py*(size*4+1);raw[row]=0;for(let px=0;px<size;px++){const x=(px+.5)/size,y=(py+.5)/size,on=circle(x,y,.5,.25,.095)||circle(x,y,.285,.69,.082)||circle(x,y,.715,.69,.082)||segment(x,y,.5,.345,.5,.49,.027)||segment(x,y,.285,.53,.715,.53,.027)||segment(x,y,.285,.53,.285,.608,.027)||segment(x,y,.715,.53,.715,.608,.027),color=on?white:blue,i=row+1+px*4;raw[i]=color[0];raw[i+1]=color[1];raw[i+2]=color[2];raw[i+3]=color[3]}}
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk("IHDR",ihdr),pngChunk("IDAT",deflateSync(raw,{level:9})),pngChunk("IEND",Buffer.alloc(0))])
}

const dist=join(root,"dist");await mkdir(dist,{recursive:true});
await Promise.all([
 writeFile(join(dist,"index.html"),output,"utf8"),
 writeFile(join(dist,"RSv9-dev.html"),output,"utf8"),
 writeFile(join(dist,"manifest.webmanifest"),manifest,"utf8"),
 writeFile(join(dist,"pwa-icon.svg"),icon,"utf8"),
 writeFile(join(dist,"pwa-icon-192.png"),appIcon(192)),
 writeFile(join(dist,"pwa-icon-512.png"),appIcon(512)),
 writeFile(join(dist,"sw.js"),sw,"utf8")
]);
console.log(`Build završen: ${names.length} modula + PWA (${cacheVersion}) → dist/index.html`);

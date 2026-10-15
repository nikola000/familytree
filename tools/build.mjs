import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const template=await readFile(join(root,"index.html"),"utf8");
const css=await readFile(join(root,"src","styles","app.css"),"utf8");
const jsDir=join(root,"src","js");
const names=(await readdir(jsDir)).filter(x=>x.endsWith(".js")).sort((a,b)=>a.localeCompare(b,"en"));
const scripts=(await Promise.all(names.map(x=>readFile(join(jsDir,x),"utf8")))).join("\n");
const manifest=await readFile(join(root,"pwa","manifest.webmanifest"),"utf8");
const swTemplate=await readFile(join(root,"pwa","sw.js"),"utf8");
const pwaAssetNames=["favicon-32.png","apple-touch-icon.png","pwa-icon-192.png","pwa-icon-512.png","pwa-maskable-512.png"];
const pwaAssets=Object.fromEntries(await Promise.all(pwaAssetNames.map(async name=>[name,await readFile(join(root,"pwa",name))])));

let output=template.replace(/<!-- DEV:STYLE -->[\s\S]*?<!-- \/DEV:STYLE -->/,`<style>\n${css}</style>`);
output=output.replace(/<!-- DEV:SCRIPTS -->[\s\S]*?<!-- \/DEV:SCRIPTS -->/,`<script>\n${scripts}</script>`);
if(output===template||/<script src="src\/js\//.test(output))throw new Error("Build markeri nisu pravilno zamenjeni.");
const hash=createHash("sha256").update(output).update(manifest).update(swTemplate);for(const name of pwaAssetNames)hash.update(pwaAssets[name]);const cacheVersion=hash.digest("hex").slice(0,12);
const sw=swTemplate.replaceAll("__CACHE_VERSION__",cacheVersion);

const dist=join(root,"dist");await mkdir(dist,{recursive:true});
await rm(join(dist,"pwa-icon.svg"),{force:true});
await Promise.all([
 writeFile(join(dist,"index.html"),output,"utf8"),
 writeFile(join(dist,"RSv9-dev.html"),output,"utf8"),
 writeFile(join(dist,"manifest.json"),manifest,"utf8"),
 writeFile(join(dist,"manifest.webmanifest"),manifest,"utf8"),
 ...pwaAssetNames.map(name=>writeFile(join(dist,name),pwaAssets[name])),
 writeFile(join(dist,"sw.js"),sw,"utf8")
]);
console.log(`Build završen: ${names.length} modula + PWA (${cacheVersion}) → dist/index.html`);

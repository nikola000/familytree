import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const template=await readFile(join(root,"index.html"),"utf8");
const css=await readFile(join(root,"src","styles","app.css"),"utf8");
const jsDir=join(root,"src","js");
const names=(await readdir(jsDir)).filter(x=>x.endsWith(".js")).sort((a,b)=>a.localeCompare(b,"en"));
const scripts=(await Promise.all(names.map(x=>readFile(join(jsDir,x),"utf8")))).join("\n");

let output=template.replace(/<!-- DEV:STYLE -->[\s\S]*?<!-- \/DEV:STYLE -->/,`<style>\n${css}</style>`);
output=output.replace(/<!-- DEV:SCRIPTS -->[\s\S]*?<!-- \/DEV:SCRIPTS -->/,`<script>\n${scripts}</script>`);
if(output===template||/<script src="src\/js\//.test(output))throw new Error("Build markeri nisu pravilno zamenjeni.");

const dist=join(root,"dist");await mkdir(dist,{recursive:true});
await Promise.all([
 writeFile(join(dist,"index.html"),output,"utf8"),
 writeFile(join(dist,"RSv9-dev.html"),output,"utf8")
]);
console.log(`Build završen: ${names.length} modula → dist/index.html`);

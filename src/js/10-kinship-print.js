/* srodstvo, loza, provera, štampa */
const sexTxt=(q,m,f,n)=>q.x==="m"?m:q.x==="f"?f:n;
const ORD=["","prvi","drugi","treći","četvrti","peti","šesti","sedmi","osmi"],ORF=["","prva","druga","treća","četvrta","peta","šesta","sedma","osma"];
function ancD(id){const d={[id]:0},via={},q=[id];while(q.length){const x=q.shift();for(const a of epar(by(x)))if(d[a]===undefined){d[a]=d[x]+1;via[a]=x===id?a:via[x];q.push(a)}}return{d,via}}
function lcas(A,B){const a=ancD(A),b=ancD(B),com=Object.keys(a.d).filter(k=>b.d[k]!==undefined).map(Number);
 const isAnc=(x,y)=>x!==y&&ancD(y).d[x]!==undefined;
 return com.filter(c=>!com.some(o=>o!==c&&isAnc(c,o))).map(c=>({c,a:a.d[c],b:b.d[c],va:a.via[c],vb:b.via[c]}))}
function bterm(A,B){const pa=by(A),pb=by(B),mp={},bx=(m,f,n)=>sexTxt(pb,m,f,n);
 for(const L of lcas(A,B)){const{c,a,b}=L,C=by(c),va=L.va!==undefined?by(L.va):null,vb=L.vb!==undefined?by(L.vb):null;
  const side=q=>q?(q.x==="m"?" (po ocu)":q.x==="f"?" (po majci)":""):"",via="";let t=null;
  if(a===0&&b===0)continue;
  if(a===0)t=[0,bx("sin","ćerka","dete"),bx("unuk","unuka","unuče"),bx("praunuk","praunuka","praunuče"),bx("čukununuk","čukununuka","čukununuče")][b]||`potomak (${b}. koleno)`;
  else if(b===0)t=(a===1?bx("otac","majka","roditelj"):[0,0,bx("deda","baba","deda/baba"),bx("pradeda","prababa","pradeda/prababa"),bx("čukundeda","čukunbaba","čukundeda/čukunbaba"),bx("navrndeda","navrnbaba","navrndeda/navrnbaba")][a]||`predak (${a}. koleno)`)+(a>=2?side(va):"");
  else if(a===1&&b===1){const sh=epar(pa).filter(x=>epar(pb).includes(x)).length;t=(sh>=2?"":"polu")+bx("brat","sestra","brat/sestra")+via}
  else if(a===1&&b===2)t=(vb&&vb.x==="m"?bx("bratanac","bratanica","dete brata"):vb&&vb.x==="f"?bx("sestrić","sestričina","dete sestre"):bx("bratanac/sestrić","bratanica/sestričina","dete brata ili sestre"))+via;
  else if(a===2&&b===1)t=(va&&va.x==="m"?bx("stric","tetka","brat/sestra oca"):va&&va.x==="f"?bx("ujak","tetka","brat/sestra majke"):bx("stric/ujak","tetka","brat/sestra roditelja"))+via;
  else if(a===3&&b===1)t=bx("brat dede ili babe","sestra dede ili babe","brat/sestra dede ili babe")+side(va)+via;
  else if(a===1&&b===3)t=bx("unuk brata ili sestre","unuka brata ili sestre","unuče brata ili sestre")+via;
  else if(a===b)t=(pb.x==="f"?ORF:ORD)[a-1]+" "+bx("rođak","rođaka","rođak/rođaka")+side(va)+via;
  else{const n=Math.min(a,b)-1,k=Math.abs(a-b);t=n>=1?`${(pb.x==="f"?ORF:ORD)[n]||n+"."} ${bx("rođak","rođaka","rođak/rođaka")}, ${k} ${k===1?"koleno":"kolena"} ${b<a?"starije":"mlađe"} generacije`+via:`srodnik (${a}. i ${b}. koleno)`+via}
  const e=mp[t]||(mp[t]={names:[],show:a>0&&b>0});e.names.push(nm(C))}
 return Object.keys(mp).map(t=>`${nm(pb)} je ${t}${mp[t].show?" (preko pretka: "+mp[t].names.join(" i ")+")":""} osobi ${nm(pa)}`)}
const rk=(X,Y)=>lcas(X,Y).sort((p,q)=>(p.a+p.b)-(q.a+q.b))[0]||null;
function mterm(A,B){const pa=by(A),pb=by(B),out=[],bx=(m,f,n)=>sexTxt(pb,m,f,n),ax=pa.x;
 if(partners(A).includes(B))out.push(bx("muž","žena","partner")+" (supružnik)");
 for(const S of partners(A)){if(S===B)continue;const k=rk(S,B);if(!k)continue;const{a,b}=k;
  if(a===0&&b===1&&!epar(pb).includes(A))out.push(bx("posinak","pastorka","pastorče")+" (dete supružnika)");
  if(b===0&&a===1)out.push(ax==="m"?bx("tast","punica","tast/punica"):ax==="f"?bx("svekar","svekrva","svekar/svekrva"):bx("tast/svekar","punica/svekrva","roditelj supružnika"));
  if(a===1&&b===1)out.push(ax==="m"?bx("šurak","svastika","šurak/svastika"):ax==="f"?bx("dever","zaova","dever/zaova"):bx("šurak/dever","svastika/zaova","brat/sestra supružnika"))}
 for(const P of partners(B)){if(P===A)continue;const k=rk(A,P);if(!k)continue;const{a,b}=k,pp=by(P);
  if(a===1&&b===1)out.push(pb.x==="m"&&pp.x!=="m"?"zet (muž sestre)":pb.x==="f"&&pp.x!=="f"?"snaha (žena brata)":"zet/snaha (partner brata ili sestre)");
  if(a===0&&b===1)out.push(bx("zet","snaha","zet/snaha")+" (partner deteta)");
  if(a===1&&b===0&&!epar(pa).includes(B))out.push(bx("očuh","maćeha","očuh/maćeha"));
  if(a===2&&b===1){const va=k.va!==undefined?by(k.va):null;out.push(pb.x==="f"?(va&&va.x==="m"?"strina (žena strica)":"ujna (žena ujaka)"):pb.x==="m"?"tetak (muž tetke)":"stric/ujak/tetka po braku")}}
 for(const C of kids(A)){for(const P of partners(C.id)){if(epar(by(P)).includes(B)&&!epar(C).includes(B))out.push(bx("svat","svatica","svat")+" (roditelj partnera deteta)")}}
 return out}
function spath(A,B){const prev={[A]:null},q=[A];while(q.length){const x=q.shift();if(x===B)break;for(const y of[...epar(by(x)),...kids(x).map(c=>c.id),...partners(x)])if(!(y in prev)){prev[y]=x;q.push(y)}}
 if(!(B in prev))return null;const p=[];for(let x=B;x!==null;x=prev[x])p.push(x);return p.reverse()}
const fmtP=v=>{const t=v>=10?v.toFixed(1):v>=1?v.toFixed(2):v.toFixed(3);return(t.includes(".")?t.replace(/\.?0+$/,""):t)+"%"};
function wUp(x,C,d=0){if(x===C)return 1;if(d>40)return 0;let t=0;for(const q of epar(by(x)))t+=.5*wUp(q,C,d+1);return t}
function dnaShare(A,B){let r=0;const parts=[];for(const L of lcas(A,B)){const v=wUp(A,L.c)*wUp(B,L.c);if(v>0){r+=v;parts.push({c:L.c,v})}}return{r,parts}}
function kinDone(B){const A=kinFrom;kinFrom=null;const pa=by(A),pb=by(B),lines=[...bterm(A,B),...mterm(A,B)],path=spath(A,B),dna=dnaShare(A,B);
 const dh=dna.r>0?`<p style="margin:6px 0 0"><b>Zajednička DNK (očekivano):</b> oko ${fmtP(dna.r*100)}</p><p style="font-size:12px;margin:0;opacity:.75">${dna.parts.map(x=>`preko ${esc(nm(by(x.c)))}: ${fmtP(x.v*100)}`).join(" · ")}. To je statistički prosek po zajedničkim precima; stvarna vrednost varira.</p>`:(lines.length?`<p style="margin:6px 0 0"><b>Zajednička DNK:</b> nema (srodstvo preko braka)</p>`:"");
 openModal("Kako smo u rodu",`<p style="margin:0"><b>${esc(nm(pa))}</b> i <b>${esc(nm(pb))}</b></p>`+(lines.length?`<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">${lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`:"<p>Nije pronađena veza u stablu.</p>")+dh+(path?`<p style="font-size:12px;margin:0">Putanja: ${esc(path.map(i=>nm(by(i))).join(" → "))}</p>`:""),
  ()=>{hlSet=new Set(path||[]);$("vw").value="all";collapsed.clear();jump(A)},path?"Označi putanju":"Zatvori");render()}
function showLine(f){const ch=[f];for(let q=inhFrom(f);q&&ch.length<300&&!ch.includes(q);q=inhFrom(q))ch.push(q);const g=gens(),base=$("gr").value==="0"?0:Math.min(...Object.values(g));
 openModal("Loza po ocu: "+nm(f),`<div style="display:flex;flex-direction:column;gap:4px">${ch.map(p=>`<button data-j="${p.id}" style="text-align:left">${roman(g[p.id]-base+1)} · ${esc(nm(p))} ${esc(effS(p))}${p.by?" ("+esc(p.by)+")":""}</button>`).join("")}</div><p style="font-size:12px;margin:0">${esc(ch.map(nm).join(" ← "))}</p>`,()=>{},"Zatvori")}
function descIds(id){const seen=new Set(),st=[id];while(st.length){const x=st.pop();for(const c of kids(x))if(!seen.has(c.id)){seen.add(c.id);st.push(c.id)}}return[...seen]}
function markBranch(f){tsel.clear();[f.id,...descIds(f.id)].forEach(i=>tsel.add(i));tab="tbl";render();msg("Označeno: "+tsel.size+" osoba")}
function checks(){const out=[],yr=v=>/^\d{4}$/.test(String(v||"").trim())?+v:null,add=(id,t)=>out.push({id,t});
 for(const p of ps)if(p.parentageUnresolved)add(p.id,`${nm(p)}: stari podatak ima više mogućih drugih roditelja; poveži odgovarajućeg roditelja kroz „Veze“`);
 for(const p of ps){const seen=new Set(),st=[...epar(p)];let cyc=false;while(st.length){const x=st.pop();if(x===p.id){cyc=true;break}if(seen.has(x))continue;seen.add(x);const q=by(x);if(q)st.push(...epar(q))}if(cyc)add(p.id,`${nm(p)} je sam/a sebi predak (ciklus u vezama)`)}
 for(const p of ps){const f=yr(p.by),d=yr(p.dy);
  if(f&&d&&d<f)add(p.id,`${nm(p)}: godina smrti je pre rođenja`);
  for(const q of epar(p).map(by).filter(Boolean)){const qb=yr(q.by),qd=yr(q.dy);
   if(f&&qb){if(f<=qb)add(p.id,`${nm(p)} je rođen/a pre ili iste godine kad i roditelj ${nm(q)}`);else if(f-qb<15)add(p.id,`${nm(p)}: razlika sa roditeljem ${nm(q)} je samo ${f-qb} god.`)}
   if(f&&qd&&f>qd+(q.x==="f"?0:1))add(p.id,`${nm(p)} je rođen/a posle smrti roditelja ${nm(q)}`)}}
 const grp={};for(const p of ps){const k=key(p);if(k)(grp[k]=grp[k]||[]).push(p)}
 for(const k in grp){const m={};for(const p of grp[k]){const n=p.name.toLowerCase().trim();(m[n]=m[n]||[]).push(p)}for(const n in m)if(m[n].length>1)add(m[n][0].id,`Isto ime kod braće/sestara: ${nm(m[n][0])} (${m[n].length}×)`)}
 const dm={};for(const p of ps)if(p.by){const k=(p.name+"|"+effS(p)+"|"+p.by).toLowerCase();(dm[k]=dm[k]||[]).push(p)}
 for(const k in dm)if(dm[k].length>1)add(dm[k][0].id,`Moguć duplikat: ${nm(dm[k][0])}, ${dm[k][0].by}`);
 if(ps.length>1)for(const p of ps)if(!epar(p).length&&!partners(p.id).length&&!kids(p.id).length)add(p.id,`${nm(p)} nije ni sa kim povezan/a`);
 return out}
function showChecks(){const w=checks(),nox=ps.filter(p=>!p.x).length,noy=ps.filter(p=>!p.by).length;
 openModal("Provera grešaka",(w.length?`<div style="display:flex;flex-direction:column;gap:4px">${w.map(x=>`<button data-j="${x.id}" style="text-align:left">${esc(x.t)}</button>`).join("")}</div>`:"<p>Nema upozorenja.</p>")+`<p style="font-size:12px;margin:0">Info: bez pola ${nox}, bez godine rođenja ${noy}.</p>`,()=>{},"Zatvori")}
$("warn").onclick=showChecks;$("dchk").onclick=()=>{openDrawer(false);showChecks()};
$("mb").addEventListener("click",e=>{const b=e.target.closest("[data-j]");if(b){closeModal();jump(+b.dataset.j)}});
let printPrev=null;
function doPrint(){openDrawer(false);tab="tree";printPrev=$("th").value;if(printPrev!=="print"){$("th").value="print";setTheme("print")}render();setTimeout(()=>window.print(),50)}
window.onafterprint=()=>{if(printPrev&&printPrev!=="print"){$("th").value=printPrev;setTheme(printPrev);render()}printPrev=null};
$("dprint").onclick=doPrint;
function expS(){saveFile("rodoslov.svg",new Blob([viewSvg(null,"print").s],{type:"image/svg+xml"}))}
function expP(){const r=viewSvg(null,"print"),k=Math.min(4,16000/Math.max(r.w,r.h)),img=new Image();
 img.onload=()=>{const c=document.createElement("canvas");c.width=Math.round(r.w*k);c.height=Math.round(r.h*k);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);c.toBlob(b=>b?saveFile("rodoslov-stampa.png",b):msg("Izvoz slike nije uspeo"),"image/png")};
 img.onerror=()=>msg("Izvoz slike nije uspeo");img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(r.s)}
const pdfEncoder=new TextEncoder();
function pdfJoin(parts){let size=0;const bytes=parts.map(x=>{const b=typeof x==="string"?pdfEncoder.encode(x):x;size+=b.length;return b}),out=new Uint8Array(size);let at=0;for(const b of bytes){out.set(b,at);at+=b.length}return out}
function jpegPdfDocument(jpeg,imageWidth,imageHeight,pageWidth,pageHeight,margin=28){
 const availW=pageWidth-margin*2,availH=pageHeight-margin*2,scale=Math.min(availW/imageWidth,availH/imageHeight),drawW=imageWidth*scale,drawH=imageHeight*scale,x=(pageWidth-drawW)/2,y=(pageHeight-drawH)/2;
 const content=`q\n${drawW.toFixed(3)} 0 0 ${drawH.toFixed(3)} ${x.toFixed(3)} ${y.toFixed(3)} cm\n/Im0 Do\nQ\n`;
 const objects=[null,"<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [4 0 R] /Count 1 >>",[ `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,jpeg,"\nendstream"],`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(3)} ${pageHeight.toFixed(3)}] /Resources << /XObject << /Im0 3 0 R >> >> /Contents 5 0 R >>`,`<< /Length ${pdfEncoder.encode(content).length} >>\nstream\n${content}endstream`];
 const parts=["%PDF-1.4\n%Rodoslov\n"],offsets=[0];let length=pdfEncoder.encode(parts[0]).length;
 for(let i=1;i<objects.length;i++){offsets[i]=length;const body=Array.isArray(objects[i])?objects[i]:[objects[i]],obj=pdfJoin([`${i} 0 obj\n`,...body,"\nendobj\n"]);parts.push(obj);length+=obj.length}
 const xref=length;parts.push(`xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.slice(1).map(n=>String(n).padStart(10,"0")+" 00000 n \n").join("")}trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);return pdfJoin(parts)
}
function pdfPage(r,kind){
 if(kind==="a4")return[841.89,595.28];if(kind==="a3")return[1190.55,841.89];
 const margin=28,maxSide=2000,scale=Math.min(1,(maxSide-margin*2)/Math.max(r.w,r.h));return[Math.max(220,r.w*scale+margin*2),Math.max(220,r.h*scale+margin*2)]
}
function pdfCanvasSize(r,pageWidth,pageHeight,dpi){
 const margin=28,fit=Math.min((pageWidth-margin*2)/r.w,(pageHeight-margin*2)/r.h),drawW=r.w*fit,drawH=r.h*fit;let w=Math.max(1,Math.round(drawW*dpi/72)),h=Math.max(1,Math.round(drawH*dpi/72));const factor=Math.min(1,9000/Math.max(w,h),Math.sqrt(40000000/(w*h)));return[Math.max(1,Math.round(w*factor)),Math.max(1,Math.round(h*factor))]
}
function makePdf(){
 const kind=$("pdf-page").value,dpi=+$("pdf-quality").value||300,r=viewSvg(null,"print"),[pageWidth,pageHeight]=pdfPage(r,kind),[width,height]=pdfCanvasSize(r,pageWidth,pageHeight,dpi),img=new Image();msg("Pripremam PDF…");
 img.onload=()=>{const c=document.createElement("canvas");c.width=width;c.height=height;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,width,height);x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(img,0,0,width,height);c.toBlob(async blob=>{if(!blob){msg("PDF izvoz nije uspeo");return}try{const pdf=jpegPdfDocument(new Uint8Array(await blob.arrayBuffer()),width,height,pageWidth,pageHeight);await saveFile("rodoslov.pdf",new Blob([pdf],{type:"application/pdf"}));msg("PDF je izvezen")}catch(e){msg("PDF izvoz nije uspeo")}},"image/jpeg",.96)};
 img.onerror=()=>msg("PDF izvoz nije uspeo");img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(r.s)
}
function expPdf(){openDrawer(false);openModal("Izvezi kvalitetan PDF",`<div class="pdf-options"><label>Veličina stranice<select id="pdf-page"><option value="large">Velika stranica — najbolje za ekran</option><option value="a3">A3 položeno — za štampu</option><option value="a4">A4 položeno — za štampu</option></select></label><label>Kvalitet<select id="pdf-quality"><option value="300">Visok — 300 dpi</option><option value="220">Standardan — 220 dpi</option></select></label></div><p class="pdf-note">Celo trenutno stablo biće smešteno na jednu belu stranicu. „Velika stranica” čuva najviše detalja pri uvećavanju; A3/A4 su praktičniji za klasičnu štampu.</p>`,makePdf,"Izvezi PDF")}
$("dps").onclick=expS;$("dpp").onclick=expP;$("dpdf").onclick=expPdf;


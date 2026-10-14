const EMB=typeof EMBED!=="undefined"?EMBED:null,SKEY="rodoslov"+(EMB?":"+EMB.id:"");
const SRC=document.documentElement.outerHTML.replace(new RegExp("<"+"script id=\"embed\">[\\s\\S]*?<"+"/script>"),"");
const READ_ONLY=!!EMB;
const FL=[["by","born"],["dy","died"],["pl","place"],["sl","slava"],["nt","note"]];
const yrs=p=>p.by&&p.dy?p.by+"–"+p.dy:p.by||(p.dy?"†"+p.dy:"");
const GF={"":"#e4e9f0",m:"#d3e4fb",f:"#fbe0ea"};
const TH={light:{bg:"#ffffff",line:"#333333",grid:"#dddddd",head:"#34507a",cap:"#222222",ring:"#ffffff",cs:"#4a6fa5",pc:["#b5572a","#2a7b5f","#7a3fa0","#2f6fb0","#8a6d00"],cards:false},cards:{bg:"#3a1630",line:"#ead9a6",grid:"#5b2b4b",head:"#d9b45a",cap:"#f6e7c1",ring:"#3a1630",cs:"#c9a24a",pc:["#ffb36b","#ff7a9c","#c9a7ff","#ffd86b","#f08a5d"],cards:true},print:{bg:"#ffffff",line:"#000000",grid:"#cccccc",head:"#000000",cap:"#000000",ring:"#ffffff",cs:"#000000",pc:["#000000","#555555","#888888","#333333","#666666"],cards:false,print:true}};
let hlSet=new Set(),kinFrom=null,linkMode="partner";
let W=120,H=38,GX=156,GY=56;const PX=24,TOP=62,BOT=64,NEW="Nova osoba";
let ps=[],U=[],uid=0,title="Moje porodično stablo",sel=null,linkFrom=null,focus=null,zoom=1,stack=[],redo=[],collapsed=new Set();
const $=id=>document.getElementById(id);
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
/* Sloj podataka: izvedeni indeksi drže ostatak aplikacije nezavisnim od načina čuvanja nizova. */
let indexDirty=true,personById=new Map(),childrenByParent=new Map(),partnersByPerson=new Map();
function invalidateIndex(){indexDirty=true}
function ensureIndex(){
 if(!indexDirty)return;
 personById=new Map(ps.map(p=>[p.id,p]));childrenByParent=new Map();partnersByPerson=new Map();
 for(const p of ps){childrenByParent.set(p.id,[]);partnersByPerson.set(p.id,[])}
 for(const[a,b]of U){if(personById.has(a)&&personById.has(b)){partnersByPerson.get(a).push(b);partnersByPerson.get(b).push(a)}}
 for(const c of ps)for(const id of effectiveParents(c))if(childrenByParent.has(id))childrenByParent.get(id).push(c);
 indexDirty=false
}
const by=id=>{ensureIndex();return personById.get(id)};
const mkp=(name,par=[])=>{const p={id:++uid,name,sn:"",par};ps.push(p);return p};
const addU=(a,b)=>{if(!U.some(u=>u.includes(a)&&u.includes(b)))U.push([a,b])};
const rawPartners=id=>U.filter(u=>u.includes(id)).map(u=>u[0]===id?u[1]:u[0]);
const effectiveParents=c=>c.par;
const epar=c=>effectiveParents(c);
const partners=id=>{ensureIndex();return partnersByPerson.get(id)||[]};
const kids=id=>{ensureIndex();return childrenByParent.get(id)||[]};
const key=p=>epar(p).slice().sort().join(",");
const roman=n=>{const m=[[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];let r="";for(const[v,s]of m)while(n>=v){r+=s;n-=v}return r};
function seed(){ps=[];U=[];uid=0;title="Moje porodično stablo";mkp(NEW);invalidateIndex()}
function legacy(t){ps=[];U=[];uid=0;
 const cp=j=>{if(!j||typeof j.name!=="string")throw 0;const p=mkp(j.name);p.sn=typeof j.surname==="string"?j.surname:"";const f=j.father&&cp(j.father),m=j.mother&&cp(j.mother);p.par=[f,m].filter(Boolean).map(x=>x.id);if(f&&m)addU(f.id,m.id);return p};
 const cv=j=>{const p=cp(j);const sp=(Array.isArray(j.spouses)?j.spouses:[]).map(s=>{const q=cp(s);addU(p.id,q.id);return q});
  for(const c of Array.isArray(j.children)?j.children:[]){const k=cv(c);const o=c.otherParent===-1?null:typeof c.otherParent==="number"?sp[c.otherParent]:sp.length===1?sp[0]:null;k.par=o?[p.id,o.id]:[p.id];if(!o)k.solo=true}
  return p};
 cv(t)}
const toJ=()=>FamilyData.serialize({title,persons:ps,unions:U});
const snap=()=>JSON.stringify(toJ());
function load(s){const o=JSON.parse(s);
 if(Array.isArray(o.persons)){const d=FamilyData.normalize(o);ps=d.persons;U=d.unions;uid=d.uid;if(d.title!==null)title=d.title}
 else if(o.tree){legacy(o.tree);FamilyData.migratePeople(ps,U);if(typeof o.title==="string")title=o.title}else throw 0;
 sel=null;linkFrom=null;collapsed=new Set();invalidateIndex()}
function push(){if(READ_ONLY)return false;stack.push(snap());if(stack.length>80)stack.shift();redo.length=0;noteChange();return true}
function save(){if(READ_ONLY)return true;try{const k=typeof activeDataKey==="function"?activeDataKey():SKEY;localStorage.setItem(k,snap());if(typeof touchActiveTree==="function")touchActiveTree();return true}catch(e){setTimeout(()=>{if(typeof msg==="function")msg("Čuvanje nije uspelo — izvezi JSON rezervnu kopiju")},0);return false}}
function gens(){
 const g={},comp={},members={},adj={};let nc=0;ps.forEach(p=>adj[p.id]=[]);
 ps.forEach(p=>epar(p).forEach(a=>{adj[a].push([p.id,1]);adj[p.id].push([a,-1])}));
 for(const s of ps){if(g[s.id]!==undefined)continue;const c=nc++,mem=[s.id],q=[s.id];g[s.id]=0;comp[s.id]=c;
  while(q.length){const x=q.shift();for(const[y,d]of adj[x])if(g[y]===undefined){g[y]=g[x]+d;comp[y]=c;mem.push(y);q.push(y)}}
  const m=Math.min(...mem.map(i=>g[i]));mem.forEach(i=>g[i]-=m);members[c]=mem}
 for(const[a,b]of U){const ca=comp[a],cb=comp[b];if(ca===cb)continue;const dl=g[a]-g[b];
  for(const i of members[cb]){g[i]+=dl;comp[i]=ca;members[ca].push(i)}delete members[cb]}
 const mn=Math.min(...ps.map(p=>g[p.id]));ps.forEach(p=>g[p.id]-=mn);return g}
const inhFrom=p=>{const a=epar(p).map(by).filter(Boolean);if(!a.length)return null;const m=a.find(q=>q.x==="f");return a.find(q=>q.x==="m")||a.find(q=>q!==m&&q.x!=="f")||a[0]};
const effS=(p,d=0)=>{if(p.sn)return p.sn;const q=d<40?inhFrom(p):null;return q?effS(q,d+1):""};
const inhS=p=>{const q=inhFrom(p);return q?effS(q):""};
const effSl=(p,d=0)=>{if(p.sl)return p.sl==="-"?"":p.sl;const q=d<40?inhFrom(p):null;return q?effSl(q,d+1):""};
const inhSl=p=>{const q=inhFrom(p);return q?effSl(q):""};
function patro(fn){const n=(fn||"").split("|")[0].trim().split(" ")[0];if(!n)return"";const l=n.toLowerCase(),e=l.slice(-1),cap=x=>x,cut=k=>n.slice(0,n.length-k);
 const cy=/[\u0400-\u04FF]/.test(n);
 if(cy){if(e==="о")return cut(1)+"ов";if(e==="а")return cut(1)+"ин";if(e==="е"||e==="и")return cut(1)+"ев";if("јчћжшџљњђ".includes(e))return n+"ев";return n+"ов"}
 if(e==="o")return cut(1)+"ov";if(e==="a")return cut(1)+"in";if(e==="e"||e==="i")return cut(1)+"ev";if("jčćžšđ".includes(e)||l.endsWith("dž")||l.endsWith("lj")||l.endsWith("nj"))return n+"ev";return n+"ov"}
function wrapLines(t,mc){const o=[];let cur="";for(const w of t.split(" ")){if(!cur)cur=w;else if((cur+" "+w).length<=mc)cur+=" "+w;else{o.push(cur);cur=w}}o.push(cur);return o}
function nameLines(name,mw,maxh,base,spc=2){
 for(let fs=base;fs>=8;fs--){const mc=Math.max(1,Math.floor(mw/(0.62*fs)));let out=[],ok=true;
  for(const seg of name.split("|")){let cur="";for(const w of seg.split(" ")){if(w.length>mc){ok=false;break}if(!cur)cur=w;else if((cur+" "+w).length<=mc)cur+=" "+w;else{out.push(cur);cur=w}}if(!ok)break;out.push(cur)}
  if(ok&&out.length*(fs+spc)<=maxh)return out.map(t=>({t,fs}))}
 const mc=Math.max(1,Math.floor(mw/(0.62*8)));let out=[];
 for(const seg of name.split("|")){let cur="";for(const w of seg.split(" ")){let word=w;while(word.length>mc){if(cur){out.push(cur);cur=""}out.push(word.slice(0,mc));word=word.slice(mc)}if(!cur)cur=word;else if((cur+" "+word).length<=mc)cur+=" "+word;else{out.push(cur);cur=word}}out.push(cur)}
 return out.map(t=>({t,fs:8}))}
const fit=(t,b,mw=104)=>Math.max(8,Math.min(b,Math.floor(mw/(0.6*Math.max(1,t.length)))));

function svg(selId,thOv){
 const K0=TH[thOv||$("th").value]||TH.light;W=K0.cards?84:120;H=K0.cards?116:38;GX=K0.cards?124:156;GY=K0.cards?136:56;
 const K=TH[thOv||$("th").value]||TH.light,yrOn=$("yr").value!=="0",pnOn=$("pn").value==="1",g=gens(),mode=$("sm").value,P=focus!=null?by(focus):null,vw=P?$("vw").value:"all",bk=+$("gb").value,fw=+$("gf").value,minG=P&&(vw==="fam"||vw==="ped")?g[P.id]-bk:-1e9,maxG=P&&(vw==="fam"||vw==="desc")?g[P.id]+fw:1e9;
 let cnt=0,minC=1e9,maxC=-1e9,ov={},claim={};const occ={},recs=[],exp=new Set(),pd=new Set();
 const place=(col,y,h)=>{y=Math.max(0,y);minC=Math.min(minC,col);maxC=Math.max(maxC,col);const L=occ[col]||(occ[col]=[]);for(let go=true;go;){go=false;for(const[a,b]of L)if(y<b-1e-6&&y+h>a+1e-6){y=b;go=true}}L.push([y,y+h]);cnt=Math.max(cnt,y+h);return y};
 const lay=p=>{exp.add(p.id);
  const pt=partners(p.id).map(by),all=kids(p.id),hid=collapsed.has(p.id)||g[p.id]>=maxG;
  const gi=c=>{const j=pt.findIndex(q=>epar(c).includes(q.id));return j<0?0:j%2===0?j/2+1:-(j+1)/2};
  const vis=hid?[]:all.filter(c=>!exp.has(c.id)&&(ov[c.id]===undefined||ov[c.id]===p.id)).sort((a,b)=>gi(a)-gi(b));vis.forEach(c=>{exp.add(c.id);claim[c.id]=p.id});
  const kr=vis.map(lay),col=g[p.id],h=1+pt.length,nA=Math.floor(pt.length/2);
  const y=nA+(kr.length?place(col,(kr[0].y+kr[kr.length-1].y)/2-nA,h):place(col,cnt,h));
  const rows=pt.map((_,k)=>k%2===0?y+1+k/2:y-(k+1)/2);
  pt.forEach(q=>pd.add(q.id));
  const r={p,col,y,pt,rows,kr,badge:hid?(all.length?"+"+all.length:""):(all.length>vis.length?"↑":"")};recs.push(r);return r};
 const ped=p=>{exp.add(p.id);const rs=epar(p).map(by).filter(q=>q&&!exp.has(q.id)&&g[q.id]>=minG).map(ped);
  const y=place(g[p.id],rs.length?rs.reduce((a,r)=>a+r.y,0)/rs.length:cnt,1);const r={p,col:g[p.id],y,pt:[],kr:[],pr:rs};recs.push(r);return r};
 const roots=()=>{
 if(vw==="desc")lay(P);else if(vw==="ped")ped(P);
 else if(vw==="fam"){const up=new Set([P.id]),st=[P];while(st.length){const x=st.pop();for(const q of epar(x).map(by))if(q&&!up.has(q.id)&&g[q.id]>=minG){up.add(q.id);st.push(q)}}
  for(const t of ps){if(!up.has(t.id)||epar(t).some(i=>up.has(i))||exp.has(t.id)||pd.has(t.id))continue;if(cnt)cnt+=.5;lay(t)}}
 else for(const p of ps){if(p.par.length||exp.has(p.id)||pd.has(p.id)||partners(p.id).some(q=>by(q).par.length))continue;if(cnt)cnt+=.5;lay(p)}
 };
 const reset=()=>{cnt=0;minC=1e9;maxC=-1e9;for(const k in occ)delete occ[k];recs.length=0;exp.clear();pd.clear()};
 roots();
 if(vw!=="ped"){const E=new Set(exp),cl=claim,o2={};
  for(const c of ps){const u=cl[c.id];if(u===undefined)continue;const f=inhFrom(c),ep=epar(c);if(f&&f.id!==u&&E.has(f.id)&&ep.length>=2&&ep.includes(f.id))o2[c.id]=f.id}
  if(Object.keys(o2).length){ov=o2;claim={};reset();roots()}}
 if(!recs.length)return{w:300,h:80,s:'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><rect width="300" height="80" fill="#fff"/></svg>'};
 const w=PX*2+(maxC-minC)*GX+W,cl=wrapLines(title,Math.max(12,Math.floor((w-40)/8.5))),h=TOP+(cnt-1)*GY+H+BOT+(cl.length-1)*20;
 const g0=$("gr").value==="0"?0:minC;
 const X=c=>PX+(c-minC)*GX,Y=r=>TOP+r*GY+H/2;
 let lines="",nodes="",heads="";
 for(let c=minC;c<=maxC;c++){const cx=X(c)+W/2;
  heads+=`<line x1="${cx}" y1="40" x2="${cx}" y2="${h-BOT+10}" stroke="${K.grid}" stroke-dasharray="2 4"/><text x="${cx}" y="28" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="16" fill="${K.head}">${roman(c-g0+1)}</text>`}
 const ln=(d,c=K.line,wd=1.4)=>`<path d="${d}" stroke="${c}" stroke-width="${wd}" fill="none"/>`;
 const ar=(x,y,c=K.line)=>`<path d="M${x} ${y}l-8 -4v8z" fill="${c}"/>`;
 const showSn=p=>mode==="none"?"":mode==="diff"?(p.sn&&p.sn!==inhS(p)?p.sn:""):effS(p);
 const cn=p=>p.name.split("|")[0].trim()||p.name,ex=p=>p.name.split("|").slice(1).join(" ").trim();
 const dn=p=>{const b=cn(p);if(!pnOn||b==="син")return b;const f=inhFrom(p);return f&&cn(f)!=="син"?b+" "+patro(cn(f)):b};
 const pcard=(p,x,cy,badge,sc,tag)=>{
  const son=p.name==="син",on=p.id===selId,hl=hlSet.has(p.id),cx=x+W/2,y0=cy-H/2;
  const col=son?"#777":p.x==="f"?"#b3152f":p.x==="m"?"#1a1a1a":"#5b4a3a",sy=p.x==="f"?"●":p.x==="m"?"▲":"◆",rot=((p.id*37)%9)-4;
  const corner=`<text x="${x+8}" y="${y0+15}" font-size="12" font-weight="bold" fill="${col}" font-family="DejaVu Sans,Arial,sans-serif">${roman(g[p.id]-g0+1)}</text><text x="${x+8}" y="${y0+29}" font-size="12" fill="${col}" font-family="DejaVu Sans,Arial,sans-serif">${sy}</text>`;
  const sn=showSn(p),items=nameLines(dn(p),74,sn?62:76,15).map(l=>({t:l.t,fs:l.fs,it:son}));
  if(sn)items.push({t:sn,fs:fit(sn,10,74),it:false,sub:1});
  const tot=items.reduce((a,b)=>a+b.fs+2,0);let acc=0,tx="";
  for(const it of items){tx+=`<tspan x="${cx}" y="${cy-tot/2+acc+it.fs*0.85}" font-size="${it.fs}"${it.sub?' fill="#6b5a48"':` fill="${col}"`}${it.it?' font-style="italic"':""}>${esc(it.t)}</tspan>`;acc+=it.fs+2}
  const ys=yrOn?yrs(p):"",yt=ys?`<text x="${cx}" y="${y0+H-9}" text-anchor="middle" font-size="9" fill="#6b5a48" font-family="DejaVu Sans,Arial,sans-serif">${esc(ys)}</text>`:"";
  const bd=badge?`<text x="${x+W-6}" y="${y0+14}" text-anchor="end" font-size="10" fill="#a0601f" font-family="DejaVu Sans,Arial,sans-serif">${badge}</text>`:"";
  const tg=tag?`<text x="${cx}" y="${y0-4}" text-anchor="middle" font-size="10" fill="${sc}" font-family="DejaVu Sans,Arial,sans-serif">${tag}</text>`:"";
  const exs=ex(p),ext=exs?`<g data-id="${p.id}">${wrapLines(exs,Math.floor((W+50)/5.6)).map((t,i)=>`<text x="${cx}" y="${y0+H+14+i*12}" text-anchor="middle" font-size="10" font-style="italic" fill="${K.cap}" font-family="Georgia,serif">${esc(t)}</text>`).join("")}</g>`:"";
  return `<g data-id="${p.id}" transform="rotate(${rot} ${cx} ${cy})"><rect x="${x}" y="${y0}" width="${W}" height="${H}" rx="9" fill="${on?"#fff1b8":hl?"#ffd9c8":son?"#e9e1d0":"#fffaf0"}" stroke="${on?"#ff9d2e":hl?"#ff5a2a":(sc||"#d9b45a")}" stroke-width="${on||hl?4:sc?3:2}"/>${corner}<g transform="rotate(180 ${cx} ${cy})">${corner}</g><text text-anchor="middle" font-family="Georgia,serif">${tx}</text>${yt}${bd}${tg}</g>${ext}`};
 const card=(p,x,cy,badge,sc,tag)=>{
  if(K.cards)return pcard(p,x,cy,badge,sc,tag);
  const son=p.name==="син",on=p.id===selId,hl=hlSet.has(p.id),items=[];
  const sn=showSn(p);
  for(const l of nameLines(dn(p),108,sn?25:34,13,1))items.push({t:l.t,fs:l.fs,f:son?"#555":"#111",i:son});
  if(sn)items.push({t:sn,fs:fit(sn,10),f:"#44556f",i:false});
  const tot=items.reduce((a,b)=>a+b.fs+1,0);let acc=0,tx="";
  for(const it of items){tx+=`<tspan x="${x+W/2+(K.cards?7:0)}" y="${cy-tot/2+acc+it.fs*0.8}" font-size="${it.fs}" fill="${it.f}"${it.i?' font-style="italic"':''}>${esc(it.t)}</tspan>`;acc+=it.fs+1}
  const ys=yrOn?yrs(p):"",yt=ys?`<text x="${x+W-4}" y="${cy+H/2-3}" text-anchor="end" font-size="8" font-family="DejaVu Sans,Arial,sans-serif" fill="#6a7384">${esc(ys)}</text>`:"";
  const bd=badge?`<text x="${x+W-4}" y="${cy-H/2+10}" text-anchor="end" font-size="10" font-family="DejaVu Sans,Arial,sans-serif" fill="#a0601f">${badge}</text>`:"";
  const ib=K.cards?`<rect x="${x+2.5}" y="${cy-H/2+2.5}" width="${W-5}" height="${H-5}" rx="5" fill="none" stroke="#c9a24a" stroke-width=".6"/>`:"";
  const ci=K.cards?(()=>{const col=p.x==="f"?"#b3152f":p.x==="m"?"#1a1a1a":"#8a8a8a",sy=p.x==="f"?"●":p.x==="m"?"▲":"◆";return `<text x="${x+6}" y="${cy-H/2+12}" font-size="9" font-weight="bold" fill="${col}" font-family="DejaVu Sans,Arial,sans-serif">${roman(g[p.id]-g0+1)}</text><text x="${x+6}" y="${cy-H/2+23}" font-size="9" fill="${col}" font-family="DejaVu Sans,Arial,sans-serif">${sy}</text>`})():"";
  const exs=ex(p),ext=exs?`<g data-id="${p.id}">${wrapLines(exs,Math.floor((W+60)/5.6)).map((t,i)=>`<text x="${x+W/2}" y="${cy+H/2+13+i*12}" text-anchor="middle" font-size="10" font-style="italic" fill="${K.cap}" font-family="Georgia,serif">${esc(t)}</text>`).join("")}</g>`:"";
  return `<g data-id="${p.id}"><rect x="${x}" y="${cy-H/2}" width="${W}" height="${H}" rx="7" fill="${on||hl?"#ffe08a":son?"#f4f4f4":(K.print?(p.x==="f"?"#e8e8e8":"#ffffff"):K.cards?"#fffaf0":(GF[p.x]||GF[""]))}" stroke="${on?"#d08a00":hl?"#ff5a2a":son?"#aaa":(sc||K.cs)}" stroke-width="${on||hl?2.5:sc?2:K.print?1.1:1.3}"/>${ib}${ci}<text text-anchor="middle" font-family="DejaVu Sans,Arial,sans-serif">${tx}</text>${bd}${yt}${tag?`<text x="${x+5}" y="${cy-H/2+11}" font-size="9" font-family="DejaVu Sans,Arial,sans-serif" fill="${sc}">${tag}</text>`:""}</g>${ext}`};
 for(const r of recs){
  const x=X(r.col),cy=Y(r.y),cx=x+W/2;
  nodes+=card(r.p,x,cy,r.badge);
  r.pt.forEach((q,k)=>{const sy=Y(r.rows[k]),c=K.pc[k%K.pc.length],up=r.rows[k]<r.y,ir=k<2?r.y:r.rows[k-2];
   const e1=up?Y(ir)-H/2:Y(ir)+H/2,e2=up?sy+H/2:sy-H/2,gp=(e1+e2)/2;
   lines+=`<path d="M${cx} ${e1}V${e2}" stroke="${c}" stroke-width="1.8"${k>1?' stroke-dasharray="4 3"':''}/><circle cx="${cx-2.5}" cy="${gp}" r="4" fill="${K.ring}" stroke="${c}" stroke-width="1.4"/><circle cx="${cx+2.5}" cy="${gp}" r="4" fill="${K.ring}" stroke="${c}" stroke-width="1.4"/>`;
   nodes+=card(q,x,sy,"",c,r.pt.length>1?(k+1)+". brak":"")});
  if(r.kr.length){
   const gs=[],idx={};
   for(const k of r.kr){const j=r.pt.findIndex(q=>epar(k.p).includes(q.id));if(idx[j]===undefined){idx[j]=gs.length;gs.push({j,ks:[]})}gs[idx[j]].ks.push(k)}
   const out=gs.map((gr,n)=>{const c=gr.j>=0?K.pc[gr.j%K.pc.length]:K.line,mx=x+W+8+Math.min(n,3)*8,py=gr.j>=0?Y(r.rows[gr.j]):null;
    const ys=[cy,...(py===null?[]:[py]),...gr.ks.map(k=>Y(k.y))];
    let o=ln(`M${x+W} ${cy}H${mx}`,c);if(py!==null)o+=ln(`M${x+W} ${py}H${mx}`,c);
    o+=ln(`M${mx} ${Math.min(...ys)}V${Math.max(...ys)}`,c);
    for(const k of gr.ks){const yy=Y(k.y),xx=X(k.col);o+=ln(`M${mx} ${yy}H${xx-2}`,c)+ar(xx,yy,c)}
    return o});
   lines+=out.reverse().join("");
  }
  if(r.pr&&r.pr.length){
   const mx=Math.max(...r.pr.map(q=>X(q.col)+W))+14,ys=[cy,...r.pr.map(q=>Y(q.y))];
   for(const q of r.pr)lines+=ln(`M${X(q.col)+W} ${Y(q.y)}H${mx}`);
   lines+=ln(`M${mx} ${Math.min(...ys)}V${Math.max(...ys)}`)+ln(`M${mx} ${cy}H${x-2}`)+ar(x,cy);
  }
 }
 const sh=new Set();recs.forEach(r=>{sh.add(r.p.id);r.pt.forEach(q=>sh.add(q.id))});
 const bgn={};sh.forEach(i=>{const k=g[i]-g0;bgn[k]=(bgn[k]||0)+1});
 const cap=cl.map((t,i)=>`<text x="${w/2}" y="${h-22-(cl.length-1-i)*20}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-size="17" fill="${K.cap}">${esc(t)}</text>`).join("");
 return {w,h,shown:sh.size,gen:bgn,ids:[...sh],s:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${K.bg}"/>${heads}${lines}${nodes}${cap}</svg>`};
}
const cur=()=>sel==null?null:by(sel)||null;
const tsel=new Set();let tvis=[];
let tab="tree",tsort={k:"gen",d:1},tq="",popEl=null,meta={last:0,chg:0,snooze:0};
try{Object.assign(meta,JSON.parse(localStorage.getItem("rodoslov_meta")||"{}"))}catch(e){}
const saveMeta=()=>{try{localStorage.setItem("rodoslov_meta",JSON.stringify(meta))}catch(e){}};
const escA=s=>esc(s).replace(/"/g,"&quot;");
const parentsOf=p=>{const a=epar(p).map(by).filter(Boolean),m0=a.find(q=>q.x==="f"),f0=a.find(q=>q.x==="m")||a.find(q=>q!==m0&&q.x!=="f");return[f0||null,m0||a.find(q=>q!==f0)||null]};
const dcount=id=>{const seen=new Set(),st=[id];while(st.length){const x=st.pop();for(const c of kids(x))if(!seen.has(c.id)){seen.add(c.id);st.push(c.id)}}return seen.size};
const nm=p=>p.name.replace("|"," ");
const setF=(p,k,v)=>{v=(v||"").trim();if(v)p[k]=v;else delete p[k]};
const TF=["by","dy","pl","sl"];


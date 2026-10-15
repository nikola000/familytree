/* Fokusirani prikazi dele isti, read-only skup predaka i potomaka. */
function focusedFamily(rootId,back,forward){
 const root=by(rootId),anc=[],desc=[],ids=new Set(root?[root.id]:[]);if(!root)return{root:null,anc,desc,ids};
 let row=[root];
 for(let depth=1;depth<=back&&row.length;depth++){const next=[];for(const p of row)for(const q of epar(p).map(by).filter(Boolean))if(!ids.has(q.id)){ids.add(q.id);next.push(q)}anc.push(next);row=next}
 row=[root];
 for(let depth=1;depth<=forward&&row.length;depth++){const next=[];for(const p of row)for(const q of kids(p.id))if(!ids.has(q.id)){ids.add(q.id);next.push(q)}desc.push(next);row=next}
 return{root,anc,desc,ids}
}
const focusDepth=(id,fallback,max)=>{const v=+$(id).value;return v===99?fallback:Math.max(0,Math.min(max,v))};
const focusTheme=th=>TH[th||$("th").value]||TH.album;
const focusedLabel=p=>nm(p)+(effS(p)?" "+effS(p):"");
function routeFamilyLanes(plans){const bands=new Map();for(const p of plans){const k=p.minTop.toFixed(2),a=bands.get(k)||[];a.push(p);bands.set(k,a)}for(const a of bands.values()){const starts=[];a.sort((x,y)=>y.hi-x.hi||y.lo-x.lo).forEach(p=>{let lane=starts.findIndex(x=>p.hi<x-12);if(lane<0)lane=starts.length;starts[lane]=p.lo;p.lane=lane});for(const p of a)p.lanes=starts.length}return plans}
function focusCard(p,x,y,K,selected,kind="person"){
 const w=132,h=48,on=p.id===selected,fill=on?"#fff0bd":K.cards?"#fffaf0":(GF[p.x]||GF[""]),stroke=on?"#d88700":K.cs;
 const full=focusedLabel(p),name=full.length>24?full.slice(0,23)+"…":full,years=yrs(p);
 return `<g data-id="${p.id}" data-kind="${kind}"><rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${on?3:1.5}"/><text x="${x}" y="${y-(years?3:-4)}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="#202735">${esc(name)}</text>${years?`<text x="${x}" y="${y+14}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#667085">${esc(years)}</text>`:""}</g>`
}
function fanCenter(p,cx,cy,r,K,selected){
 const full=focusedLabel(p),raw=nameLines(full,r*1.55,38,13,1),lines=raw.slice(0,2);if(raw.length>2&&lines.length)lines[1].t=lines[1].t.replace(/…?$/,"…");
 const years=yrs(p),fill=p.x==="f"?"#f7dce5":p.x==="m"?"#dceafb":K.cards?"#fff4d2":"#eef1f5",stroke=p.id===selected?"#d88700":K.cs,y0=cy-r*.48-(lines.length-1)*7-(years?4:0);
 return `<g data-id="${p.id}" data-kind="root"><path d="M${cx-r} ${cy}A${r} ${r} 0 0 1 ${cx+r} ${cy}Z" fill="${fill}" stroke="${stroke}" stroke-width="${p.id===selected?3:1.8}"/><g clip-path="url(#fan-center)"><text x="${cx}" y="${y0}" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" fill="#202735">${lines.map((l,i)=>`<tspan x="${cx}" dy="${i?14:0}" font-size="${l.fs}">${esc(l.t)}</tspan>`).join("")}</text>${years?`<text x="${cx}" y="${cy-12}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#667085">${esc(years)}</text>`:""}</g></g>`
}
function emptyFocusSvg(label){return{w:560,h:220,shown:0,gen:{},ids:[],s:`<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220" viewBox="0 0 560 220"><rect width="560" height="220" fill="${focusTheme().bg}"/><text x="280" y="96" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="${focusTheme().head}">${label}</text><text x="280" y="126" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="${focusTheme().cap}">Izaberi osobu u stablu ili pretragom, pa ponovo otvori ovaj prikaz.</text></svg>`}}
function hourglassSvg(selected,th){
 const P=focus!=null?by(focus):null;if(!P)return emptyFocusSvg("Za peščani sat je potrebna izabrana osoba");
 const back=focusDepth("gb",4,ps.length),forward=focusDepth("gf",4,ps.length),F=focusedFamily(P.id,back,forward),K=focusTheme(th),levels=[...F.anc].reverse().concat([[P]],F.desc),gapY=118,pad=90;
 const partnersShown=new Set(),rows=levels.map(row=>{const items=[];for(const p of row){items.push({p,partner:false});for(const id of partners(p.id)){const q=by(id);if(q&&!F.ids.has(id)&&!partnersShown.has(id)){partnersShown.add(id);items.push({p:q,partner:true,of:p.id})}}}return items});
 const maxN=Math.max(1,...rows.map(r=>r.length)),w=Math.max(620,pad*2+maxN*178),h=Math.max(300,pad*2+(levels.length-1)*gapY),pos=new Map(),partnerOf=new Map();
 rows.forEach((row,ri)=>row.forEach((it,i)=>{const y=pad+ri*gapY,x=w/2+(i-(row.length-1)/2)*178;pos.set(it.p.id,{x,y});if(it.partner)partnerOf.set(it.p.id,it.of)}));
 let lines="",nodes="";const familyGroups=new Map(),pairKey=ids=>ids.slice().sort((a,b)=>a-b).join(":"),unionIndex=ids=>ids.length<2?-1:U.findIndex(u=>u.includes(ids[0])&&u.includes(ids[1])),familyColor=ids=>{if(ids.length<2)return K.line;const ix=unionIndex(ids);return K.pc[(ix>=0?ix:ids[0]+ids[1])%K.pc.length]},drawnPairs=new Set();
 const pairLine=(ids,c)=>{const key=pairKey(ids);if(drawnPairs.has(key))return"";drawnPairs.add(key);const a=pos.get(ids[0]),b=pos.get(ids[1]);if(!a||!b)return"";const l=a.x<=b.x?a:b,r=a.x<=b.x?b:a,mx=(a.x+b.x)/2,my=(a.y+b.y)/2,partnered=unionIndex(ids)>=0,mark=partnered?`<circle cx="${mx-2.5}" cy="${my}" r="3.5" fill="${K.ring}" stroke="${c}"/><circle cx="${mx+2.5}" cy="${my}" r="3.5" fill="${K.ring}" stroke="${c}"/>`:`<rect x="${mx-3}" y="${my-3}" width="6" height="6" transform="rotate(45 ${mx} ${my})" fill="${K.ring}" stroke="${c}"/>`;return`<g data-union="${key}" data-recorded="${partnered}"><path d="M${l.x+66} ${l.y} C${mx-20} ${my},${mx+20} ${my},${r.x-66} ${r.y}" fill="none" stroke="${c}" stroke-width="2"/>${mark}</g>`};
 for(const id of F.ids){const child=by(id),b=pos.get(id);if(!child||!b)continue;const ids=epar(child).filter(pid=>pos.has(pid));if(!ids.length)continue;const key=pairKey(ids),gr=familyGroups.get(key)||{ids,children:[]};gr.children.push(b);familyGroups.set(key,gr)}
 const plans=[];for(const[key,gr]of familyGroups){const pp=gr.ids.map(id=>pos.get(id)),source=gr.ids.length>1?{x:(pp[0].x+pp[1].x)/2,y:(pp[0].y+pp[1].y)/2}:{x:pp[0].x,y:pp[0].y+25},tops=gr.children.map(q=>q.y-25),xs=gr.children.map(q=>q.x);plans.push({key,gr,source,minTop:Math.min(...tops),lo:Math.min(source.x,...xs),hi:Math.max(source.x,...xs)})}routeFamilyLanes(plans.filter(p=>p.gr.children.length>1));
 const familyPath=(d,c,attr="")=>`<path data-family-underlay d="${d}" fill="none" stroke="${K.bg}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path ${attr} d="${d}" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
 for(const p of plans){const{key,gr,source}=p,c=familyColor(gr.ids);if(gr.children.length===1){const q=gr.children[0],top=q.y-25,mid=(source.y+top)/2,d=`M${source.x} ${source.y}C${source.x} ${mid},${q.x} ${mid},${q.x} ${top}`;lines+=`<g data-parent-set="${key}" data-family-direct>${familyPath(d,c,"data-family-route")}</g>`}else{const base=source.y+(gr.ids.length>1?36:12),room=Math.max(0,p.minTop-10-base),spacing=p.lanes>1?Math.min(12,Math.max(6,room/(p.lanes-1))):0,bus=Math.min(p.minTop-10,base+p.lane*spacing),parts=[[`M${source.x} ${source.y}V${bus}`,"data-family-trunk"],[`M${p.lo} ${bus}H${p.hi}`,"data-family-bus"],...gr.children.map(q=>[`M${q.x} ${bus}V${q.y-25}`,"data-family-branch"] )];lines+=`<g data-parent-set="${key}" data-bus-lane="${p.lane}" data-bus-y="${bus}">${parts.map(([d,a])=>familyPath(d,c,a)).join("")}</g>`}if(gr.ids.length>1)lines+=pairLine(gr.ids,c)}
 for(const[id,of]of partnerOf){const ids=[id,of],a=pos.get(id),b=pos.get(of);if(a&&b)lines+=pairLine(ids,familyColor(ids))}
 for(const row of rows)for(const it of row){const q=pos.get(it.p.id);nodes+=focusCard(it.p,q.x,q.y,K,selected,it.partner?"partner":"person")}
 const all=new Set([...F.ids,...partnersShown]),gen={};levels.forEach((r,i)=>{if(r.length)gen[i]=r.length});
 return{w,h,shown:all.size,gen,ids:[...all],s:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-view="hourglass"><rect width="${w}" height="${h}" fill="${K.bg}"/><text x="24" y="30" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${K.head}">PRECI</text><text x="24" y="${h-22}" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${K.head}">POTOMCI</text>${lines}${nodes}</svg>`}
}
function fanSvg(selected,th){
 const P=focus!=null?by(focus):null;if(!P)return emptyFocusSvg("Za lepezu je potrebna izabrana osoba");
 const depth=Math.max(3,focusDepth("gb",5,8)),K=focusTheme(th),ring=78,r0=68,outer=r0+depth*ring,w=Math.max(680,outer*2+56),h=outer+104,cx=w/2,cy=h-42,slots=[[P]],known=new Set([P.id]);
 for(let d=1;d<=depth;d++){const prev=slots[d-1],row=[];for(const p of prev){const pair=p?parentsOf(p):[null,null];row.push(pair[0],pair[1]);for(const q of pair)if(q)known.add(q.id)}slots.push(row)}
 const pt=(r,a)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)],path=(ri,ro,a0,a1)=>{const p0=pt(ri,a0),p1=pt(ro,a0),p2=pt(ro,a1),p3=pt(ri,a1);return`M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}A${ro} ${ro} 0 0 1 ${p2[0]} ${p2[1]}L${p3[0]} ${p3[1]}A${ri} ${ri} 0 0 0 ${p0[0]} ${p0[1]}Z`};
 let defs=`<clipPath id="fan-center"><path d="M${cx-r0+3} ${cy-2}A${r0-3} ${r0-3} 0 0 1 ${cx+r0-3} ${cy-2}Z"/></clipPath>`,segments="";
 for(let d=1;d<=depth;d++){const count=2**d,ri=r0+(d-1)*ring,ro=ri+ring;
  for(let i=0;i<count;i++){const a0=Math.PI+i*Math.PI/count,a1=Math.PI+(i+1)*Math.PI/count,p=slots[d][i],id=`fan-${d}-${i}`,fill=p?(p.x==="f"?"#f7dce5":p.x==="m"?"#dceafb":K.cards?"#fff4d2":"#eef1f5"):(K.cards?"#432039":"#f7f8fa"),stroke=K.grid;
   defs+=`<clipPath id="${id}"><path d="${path(ri+3,ro-3,a0+.006,a1-.006)}"/></clipPath>`;
   const mid=(a0+a1)/2,rr=(ri+ro)/2,q=pt(rr,mid),arc=rr*(a1-a0),show=arc>34,limit=Math.max(4,Math.floor(arc/7)),cut=s=>s.length>limit?s.slice(0,Math.max(3,limit-1))+"…":s,name=p?cut((p.name||"").split("|")[0].trim()):cut("Nepoznat predak"),surname=p?cut(effS(p)):"",years=p&&arc>62?yrs(p):"",fs=Math.max(8,12-d*.45),ty=q[1]-(surname?6:years?3:0);
   segments+=`<g ${p?`data-id="${p.id}"`:"data-empty=\"1\""} data-depth="${d}" data-side="${i<count/2?"father":"mother"}"><path d="${path(ri,ro,a0,a1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>${show?`<g clip-path="url(#${id})"><text x="${q[0]}" y="${ty}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${fs}" font-weight="${d<3?600:500}" fill="${p?"#202735":"#8a93a3"}"><tspan data-fan-name x="${q[0]}">${esc(name)}</tspan>${surname?`<tspan data-fan-surname x="${q[0]}" dy="${fs+1}" font-weight="500">${esc(surname)}</tspan>`:""}</text>${years?`<text x="${q[0]}" y="${q[1]+(surname?17:12)}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="8" fill="#667085">${esc(years)}</text>`:""}</g>`:""}</g>`
  }
 }
 const center=fanCenter(P,cx,cy,r0,K,selected),gen={0:1};for(let d=1;d<=depth;d++)gen[d]=slots[d].filter(Boolean).length;
 return{w,h,shown:known.size,gen,ids:[...known],s:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-view="fan"><rect width="${w}" height="${h}" fill="${K.bg}"/><defs>${defs}</defs><text x="28" y="30" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${K.head}">OČINSKA STRANA</text><text x="${w-28}" y="30" text-anchor="end" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${K.head}">MAJČINSKA STRANA</text>${segments}${center}</svg>`}
}
function viewSvg(selected,th){const v=$("vw").value;return v==="hourglass"?hourglassSvg(selected,th):v==="fan"?fanSvg(selected,th):svg(selected,th)}

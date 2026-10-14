/* deljenje */
const LM={"А":"A","Б":"B","В":"V","Г":"G","Д":"D","Ђ":"Dj","Е":"E","Ж":"Z","З":"Z","И":"I","Ј":"J","К":"K","Л":"L","Љ":"Lj","М":"M","Н":"N","Њ":"Nj","О":"O","П":"P","Р":"R","С":"S","Т":"T","Ћ":"C","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"C","Џ":"Dz","Ш":"S","а":"a","б":"b","в":"v","г":"g","д":"d","ђ":"dj","е":"e","ж":"z","з":"z","и":"i","ј":"j","к":"k","л":"l","љ":"lj","м":"m","н":"n","њ":"nj","о":"o","п":"p","р":"r","с":"s","т":"t","ћ":"c","у":"u","ф":"f","х":"h","ц":"c","ч":"c","џ":"dz","ш":"s"};
const slug=t=>t.replace(/[^\s\S]|./g,c=>LM[c]||c).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"stablo";
const likelyLiving=p=>!p.dy&&(!/^\d{4}$/.test(p.by||"")||new Date().getFullYear()-(+p.by)<110);
function subsetJ(S,ttl,noNotes,protectLiving){const bake={};ps.forEach(p=>{if(S.has(p.id)){const f=inhFrom(p);bake[p.id]=!f||!S.has(f.id)}});
 const persons=ps.filter(p=>S.has(p.id)).map(p=>{const q={id:p.id,name:p.name},sn=bake[p.id]?effS(p):p.sn;if(sn)q.surname=sn;
  const par=p.par.filter(i=>S.has(i));if(par.length)q.parents=par;
  if(p.parentageUnresolved)q.parentageUnresolved=true;
  if(p.x)q.sex=p.x;
  let sl=p.sl;if(!sl&&bake[p.id])sl=effSl(p);
  const priv=protectLiving&&likelyLiving(p),o={by:"born",dy:"died",pl:"place"};for(const k in o)if(p[k]&&!priv)q[o[k]]=p[k];if(sl)q.slava=sl;if(p.nt&&!noNotes&&!priv)q.note=p.nt;return q});
 return{title:ttl,version:3,persons,unions:U.filter(u=>S.has(u[0])&&S.has(u[1]))}}
function buildShare(S,ttl,noNotes,protectLiving,fmt){const data=subsetJ(S,ttl,noNotes,protectLiving);
 if(fmt==="json")return{text:JSON.stringify(data,null,2),count:data.persons.length,mime:"application/json",ext:"json"};
 const emb={id:Date.now().toString(36),data},js=JSON.stringify(emb).replace(/</g,"\\u003c").replace(/\u2028|\u2029/g,"");
 const html="<!DOCTYPE html>\n"+SRC.replace(/^<!DOCTYPE[^>]*>\s*/i,"").replace("<"+"script>","<"+"script id=\"embed\">const EMBED="+js+";<"+"/script>\n<"+"script>").replace(/<title>[\s\S]*?<\/title>/,"<title>"+esc(ttl)+"</title>");
 return{text:html,count:data.persons.length,mime:"text/html",ext:"html"}}
function shareDialog(){const r=viewSvg(null),ids=new Set(r.ids),sel_=tsel.size?new Set(tsel):null,fp=focus!=null?by(focus):null,dflt=fp&&$("vw").value!=="all"?"Породично стабло: "+nm(fp):title;
 openModal("Napravi stablo za deljenje",`<label>Naziv novog stabla<input id="s1" type="text" value="${escA(dflt)}"></label>
<label>Šta uključiti<select id="s2"><option value="view">Ono što je sada na slici (${ids.size} osoba)</option>${sel_?`<option value="sel">Označene u tabeli (${sel_.size} osoba)</option>`:""}</select></label>
<label>Odredište<select id="s3"><option value="html">Samostalna stranica (HTML) – otvara se dvoklikom</option><option value="json">JSON – za uvoz ili rezervnu kopiju</option>${EMB?"":'<option value="local">Novo lokalno stablo u biblioteci</option><option value="netlify">Netlify link</option>'}</select></label>
<label style="flex-direction:row;gap:8px;align-items:center"><input id="s4" type="checkbox" checked> Izostavi napomene</label>
<label style="flex-direction:row;gap:8px;align-items:center"><input id="s5" type="checkbox" checked> Sakrij godine, mesta i napomene verovatno živih osoba</label>
<p id="sprev" style="font-size:12px;margin:0">Pregled: ${ids.size} osoba · ${[...ids].map(by).filter(p=>p&&likelyLiving(p)).length} verovatno živih</p>
<p style="font-size:12px;margin:0;opacity:.8">Ulaze samo osobe iz izbora; veze ka osobama van njega se prekidaju. Nasleđeno prezime i slava se upisuju osobama kojima je otac ostao van izbora.</p>`,
 ()=>{const S=$("s2").value==="sel"&&sel_?sel_:ids,ttl=$("s1").value.trim()||dflt,fmt=$("s3").value;
  if(fmt==="local"){const data=subsetJ(S,ttl,$("s4").checked,$("s5").checked);createLocalTree(data,ttl);return}
  if(fmt==="netlify"){const res=buildShare(S,ttl,$("s4").checked,$("s5").checked,"html");publishTreeOnline(res.text,ttl);return}
  const res=buildShare(S,ttl,$("s4").checked,$("s5").checked,fmt);saveFile("rodoslov-"+slug(ttl)+"."+res.ext,new Blob([res.text],{type:res.mime}));msg("Napravljeno stablo sa "+res.count+" osoba")},"Napravi i sačuvaj");
 const preview=()=>{const S=$("s2").value==="sel"&&sel_?sel_:ids,n=[...S].map(by).filter(Boolean),live=n.filter(likelyLiving).length;$("sprev").textContent=`Pregled: ${n.length} osoba · ${live} verovatno živih`};
 $("s2").onchange=preview;preview()
}
$("vshare").onclick=shareDialog;$("dshare").onclick=()=>{openDrawer(false);shareDialog()};


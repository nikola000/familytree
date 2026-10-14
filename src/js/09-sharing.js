/* deljenje */
const LM={"А":"A","Б":"B","В":"V","Г":"G","Д":"D","Ђ":"Dj","Е":"E","Ж":"Z","З":"Z","И":"I","Ј":"J","К":"K","Л":"L","Љ":"Lj","М":"M","Н":"N","Њ":"Nj","О":"O","П":"P","Р":"R","С":"S","Т":"T","Ћ":"C","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"C","Џ":"Dz","Ш":"S","а":"a","б":"b","в":"v","г":"g","д":"d","ђ":"dj","е":"e","ж":"z","з":"z","и":"i","ј":"j","к":"k","л":"l","љ":"lj","м":"m","н":"n","њ":"nj","о":"o","п":"p","р":"r","с":"s","т":"t","ћ":"c","у":"u","ф":"f","х":"h","ц":"c","ч":"c","џ":"dz","ш":"s"};
const slug=t=>t.replace(/[^\s\S]|./g,c=>LM[c]||c).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"stablo";
const likelyLiving=p=>!p.dy&&(!/^\d{4}$/.test(p.by||"")||new Date().getFullYear()-(+p.by)<110);
function subsetJ(S,ttl,noNotes,protectLiving){const bake={};ps.forEach(p=>{if(S.has(p.id)){const f=inhFrom(p);bake[p.id]=!f||!S.has(f.id)}});
 const persons=ps.filter(p=>S.has(p.id)).map(p=>{const q={id:p.id,name:p.name},sn=bake[p.id]?effS(p):p.sn;if(sn)q.surname=sn;
  if(aliases(p).length)q.aliases=[...aliases(p)];
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
function sharePrivacy(S,noNotes,protectLiving){const people=[...S].map(by).filter(Boolean),living=people.filter(likelyLiving),withNotes=people.filter(p=>p.nt),hidden=protectLiving?living.filter(p=>p.by||p.dy||p.pl||p.nt):[];
 return `<div class="share-privacy"><b>Pregled privatnosti</b><div>${people.length} osoba · ${living.length} verovatno živih · ${withNotes.length} sa napomenom</div><div>${noNotes?"Sve napomene biće izostavljene.":protectLiving?"Napomene živih osoba biće izostavljene.":"Napomene će biti uključene."}</div><div>${protectLiving?`Za ${hidden.length} živih osoba biće sakrivene godine, mesta i napomene.`:"Godine i mesta živih osoba neće biti sakriveni."}</div>${living.length?`<details><summary>Verovatno žive osobe (${living.length})</summary><ul>${living.map(p=>`<li>${esc(nm(p)+" "+effS(p))}${p.by?" · "+esc(p.by):""}</li>`).join("")}</ul></details>`:""}</div>`}
function shareDialog(defaultFmt="netlify"){const r=viewSvg(null),ids=new Set(r.ids),sel_=tsel.size?new Set(tsel):null,fp=focus!=null?by(focus):null,dflt=fp&&$("vw").value!=="all"?"Породично стабло: "+nm(fp):title;
 openModal("Podeli porodično stablo",`<div class="share-intro"><svg class="ico"><use href="#i-share"/></svg><div><b>Pripremi bezbednu kopiju</b><span>Originalno lokalno stablo ostaje nepromenjeno.</span></div></div><div class="share-form"><label>Naziv kopije<input id="s1" type="text" value="${escA(dflt)}"></label>
<label>Sadržaj<select id="s2"><option value="view">Trenutni prikaz · ${ids.size} osoba</option>${sel_?`<option value="sel">Označene osobe · ${sel_.size}</option>`:""}</select></label>
<label>Način deljenja<select id="s3">${EMB?"":'<option value="netlify">Netlify link · preporučeno</option>'}<option value="html">Samostalna HTML stranica</option><option value="json">JSON kopija</option>${EMB?"":'<option value="local">Novo lokalno stablo</option>'}</select></label></div>
<div class="share-switches"><label><input id="s4" type="checkbox" checked><span><b>Izostavi napomene</b><small>Privatne beleške neće biti u kopiji.</small></span></label>
<label><input id="s5" type="checkbox" checked><span><b>Zaštiti verovatno žive osobe</b><small>Sakrij godine, mesta i napomene.</small></span></label></div>
<div id="sprev"></div>
<p style="font-size:12px;margin:0;opacity:.8">Ulaze samo osobe iz izbora; veze ka osobama van njega se prekidaju. Nasleđeno prezime i slava se upisuju osobama kojima je otac ostao van izbora.</p>`,
 ()=>{const S=$("s2").value==="sel"&&sel_?sel_:ids,ttl=$("s1").value.trim()||dflt,fmt=$("s3").value;
  if(fmt==="local"){const data=subsetJ(S,ttl,$("s4").checked,$("s5").checked);createLocalTree(data,ttl);return}
  if(fmt==="netlify"){const res=buildShare(S,ttl,$("s4").checked,$("s5").checked,"html");publishTreeOnline(res.text,ttl);return}
  const res=buildShare(S,ttl,$("s4").checked,$("s5").checked,fmt);saveFile("rodoslov-"+slug(ttl)+"."+res.ext,new Blob([res.text],{type:res.mime}));msg("Napravljeno stablo sa "+res.count+" osoba")},"Napravi i sačuvaj");
 if([...$("s3").options].some(o=>o.value===defaultFmt))$("s3").value=defaultFmt;
 $("mbox").classList.add("share-modal");
 const preview=()=>{const S=$("s2").value==="sel"&&sel_?sel_:ids;$("sprev").innerHTML=sharePrivacy(S,$("s4").checked,$("s5").checked)};
 for(const id of["s2","s4","s5"])$(id).onchange=preview;preview()
}
$("vshare").onclick=shareDialog;$("dshare").onclick=()=>{openDrawer(false);shareDialog()};


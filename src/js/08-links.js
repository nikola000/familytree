/* povezivanje postojećih osoba */
function linkDone(id){const a=linkFrom,mode=linkMode,A=by(a),B=by(id);linkFrom=null;
 const no=t=>{msg(t);render()};
 if(mode==="partner"){if(partners(a).includes(id))return no("Već su partneri");change(()=>addU(a,id));msg("Povezani kao partneri");return}
 if(mode==="child"){
  if(ancD(a).d[id]!==undefined)return no("Ne može: ta osoba je predak ove osobe (napravilo bi krug u vezama).");
  if(epar(B).includes(a))return no(nm(B)+" je već dete ove osobe.");
  if(B.par.length>=2)return no(nm(B)+" već ima dva roditelja. Prvo ukloni jednog (Veze ▾).");
  change(()=>{B.par=[...B.par,a];if(B.par.length===2)addU(B.par[0],B.par[1]);delete B.parentageUnresolved});msg(nm(B)+" je sada dete osobe "+nm(A));return}
 if(mode==="parent"){
  if(ancD(id).d[a]!==undefined)return no("Ne može: ta osoba je potomak ove osobe (napravilo bi krug u vezama).");
  if(epar(A).includes(id))return no(nm(B)+" je već roditelj ove osobe.");
  if(A.par.length>=2)return no(nm(A)+" već ima dva roditelja. Prvo ukloni jednog (Veze ▾).");
  change(()=>{A.par=B.x==="m"&&A.par.length?[id,...A.par]:[...A.par,id];if(A.par.length===2)addU(A.par[0],A.par[1]);delete A.parentageUnresolved});msg(nm(B)+" je sada roditelj osobe "+nm(A))}}


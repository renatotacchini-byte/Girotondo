
const trips={
1040:{a:[["07:50","Michele","Rezzago","Ns. Famiglia – Ponte Lambro",1],["≈ 08:00","Impake + Deghene","Fermata bus – Asso","Ns. Famiglia – Ponte Lambro"],["≈ 08:05","Yad","Banca – Asso","Ns. Famiglia – Ponte Lambro"],["≈ 08:10","Leo + Nicole","Scarenna – Asso","Ns. Famiglia – Ponte Lambro"],["≈ 08:25","Angelica","Eupilio","Ns. Famiglia – Ponte Lambro"],["≈ 08:35","Morgan","Longone al Segrino","Ns. Famiglia – Ponte Lambro"]],r:[["15:20","Elisabetta + Leo + Nicole + altri","Ns. Famiglia – Ponte Lambro","Rientro alle abitazioni"]]},
1042:{a:[["08:00","Kevin","Boggio – Asso","Ns. Famiglia – Bosisio Parini",1],["≈ 08:10","Suleyman + Sofia + Martina","Asso","Ns. Famiglia – Bosisio Parini"],["≈ 08:30","Kelledy + Kelvin","Eupilio","Ns. Famiglia – Bosisio Parini"]],r:[["15:40","Suleyman + Sofia + Martina + Kelledy + Kelvin","Ns. Famiglia – Bosisio Parini","Rientro alle fermate di salita"]]},
1043:{a:[["08:00","Davide","Abitazione – Eupilio","Scuola Beldosso – Eupilio",1],["≈ 08:25","Michele","Abitazione – Canzo","Noi Genitori – Erba"],["≈ 08:40","Raffaella","Abitazione – Proserpio","Noi Genitori – Erba"],["≈ 08:50","Gaetana","Abitazione – Eupilio","Noi Genitori – Erba"],["≈ 09:00","Alessandro","Stazione – Erba","Noi Genitori – Erba"]],r:[["12:00","Davide","Scuola Beldosso – Eupilio","Abitazione – Eupilio"],["12:30","Yaya","Ns. Famiglia – Bosisio Parini","Abitazione – Canzo"],["15:15","Morgan","Asilo – P. Lambro","Abitazione – Longone al Segrino"],["15:20","Angelica","Ns. Famiglia – P. Lambro","Casa – Eupilio"],["15:40","Michele + Raffaella + Gaetana + Gabriele","Ns. Famiglia – P. Lambro","Rispettive abitazioni"]]}}
const assign={1040:["Elga","Renny"],1042:["Renny","Marco"],1043:["Marco","Elga"]};
let currentDay="Lunedì";
const $=id=>document.getElementById(id);
["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì"].forEach((d,i)=>{let b=document.createElement("button");b.className="day"+(!i?" active":"");b.textContent=d.slice(0,3);b.onclick=()=>{document.querySelectorAll(".day").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentDay=d;$("dayLabel").textContent=d+" • settimana tipo"};$("days").appendChild(b)});
function show(id){["opView","autoView","orgView","detail"].forEach(x=>$(x).classList.add("hidden"));$(id).classList.remove("hidden");$("tOp").classList.toggle("active",id==="opView");$("tAuto").classList.toggle("active",id==="autoView"||id==="detail");$("tOrg").classList.toggle("active",id==="orgView");$("role").textContent=id==="orgView"?"ORGANIZZATORE":id==="opView"?"OPERATORE":"CONSULTAZIONE"}
$("tOp").onclick=()=>show("opView");$("tAuto").onclick=()=>{renderCars();show("autoView")};$("tOrg").onclick=()=>show("orgView");
function renderCars(){$("cars").innerHTML=Object.keys(trips).map(n=>`<button class="card" onclick="trip(${n})"><div class="carTop"><span class="num">🚐 ${n}</span><span class="op"><small>OPERATORE</small><b>${assign[n][0]}</b></span></div><div class="meta">Andata: ${assign[n][0]} · Ritorno: ${assign[n][1]}</div></button>`).join("")}
function trip(n){let t=trips[n],a=assign[n];$("detail").innerHTML=`<button class="back" onclick="show('autoView')">← Torna ai giri</button><h2>🚐 Giro ${n}</h2><div class="sub">${currentDay}</div><div class="info"><b>ANDATA · ${a[0].toUpperCase()}</b><br>Stesso operatore per tutto il giro.</div><div class="title" style="margin-top:16px">ANDATA</div>${stops(t.a)}<div class="info"><b>RITORNO · ${a[1].toUpperCase()}</b><br>Il cambio auto/operatore è possibile solo perché inizia il giro di ritorno.</div><div class="title" style="margin-top:16px">RITORNO</div>${stops(t.r)}`;show("detail")}
function stops(arr){
 return arr.map(function(s){
   const names=String(s[1]).split(/\s*\+\s*/).map(function(x){return x.trim();}).filter(Boolean);
   const peopleHtml=names.map(function(name){
     return '<div class="person-row"><div><div class="people">'+name+'</div></div><button type="button" class="abs" onclick="absence(\''+name.replace(/'/g,"\\'")+'\')">⚠️ Assente</button></div>';
   }).join("");
   return '<div class="stop '+(s[4]?"fixed":"")+'"><div class="time">'+s[0]+' <span class="hint">• '+(s[4]?"fisso":"indicativo")+'</span></div>'+
     '<div class="route">📍 '+s[2]+'<br>➡️ '+s[3]+'</div>'+
     '<div class="people-list">'+peopleHtml+'</div></div>';
 }).join("")
}
function maps(p){window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p),"_blank")}
function absence(p){alert("Assenza registrata nel prototipo: "+p+"\nIl giro programmato resta invariato. Nella versione definitiva verranno salvati data, ora, auto, giro e operatore.")}
function exportCSV(){let c="Data;Giro;Auto;Direzione;Assistito;Esito;Operatore;Ora segnalazione\n11/09/2026;1042;1042;Andata;Michele;Assente;Renny;08:27\n";let b=new Blob(["\ufeff"+c],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="Girotondo_registro.csv";a.click()}
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
renderCars();

// Programmazione 0.6.3
const girotondoOperatori=[
 {id:"3a446f21-e713-438c-91e4-42fe1e8a4a3b",nome:"Angelo Marchesi"},
 {id:"f2ea1285-46ef-4247-8723-2ba7c3b6512d",nome:"Fabiola Giacomelli"},
 {id:"32530245-87b6-4334-9731-2ea12b6b81c4",nome:"Luigi Stefanoni"},
 {id:"e4a5f9a1-3606-4393-8770-cfa2ccc42f5b",nome:"Renato Tacchini"}
];
function girotondoProgKey(day,giro,dir){return "girotondo_prog_"+day+"_"+giro+"_"+dir;}
function girotondoProgValue(day,giro,dir){try{return localStorage.getItem(girotondoProgKey(day,giro,dir))||"";}catch(e){return "";}}
function girotondoProgSelect(day,giro,dir,label){
 const value=girotondoProgValue(day,giro,dir);
 return '<label class="prog-label">'+label+'<select class="prog-select" data-giro="'+giro+'" data-dir="'+dir+'"><option value="">— Non assegnato —</option>'+
 girotondoOperatori.map(function(o){return '<option value="'+o.id+'" '+(o.id===value?'selected':'')+'>'+o.nome+'</option>';}).join("")+
 '</select></label>';
}
function renderProgrammazione(){
 const day=document.getElementById("progGiorno"),list=document.getElementById("progLista");
 if(!day||!list)return;
 const d=day.value;
 list.innerHTML=Object.keys(trips).map(function(giro){
  return '<div class="prog-card"><div class="carTop"><span class="num">🚐 '+giro+'</span></div><div class="prog-grid">'+
   girotondoProgSelect(d,giro,"andata","Andata")+girotondoProgSelect(d,giro,"ritorno","Ritorno")+
   '</div></div>';
 }).join("");
 list.querySelectorAll("select[data-giro]").forEach(function(sel){
  sel.addEventListener("change",function(){
   try{
    const k=girotondoProgKey(d,sel.dataset.giro,sel.dataset.dir);
    if(sel.value)localStorage.setItem(k,sel.value);else localStorage.removeItem(k);
   }catch(e){}
  });
 });
}
document.getElementById("progGiorno").addEventListener("change",renderProgrammazione);
const oldOrgClick=document.getElementById("tOrg").onclick;
document.getElementById("tOrg").onclick=function(){
 if(oldOrgClick)oldOrgClick();
 renderProgrammazione();
};


(function(){
  const absenceStoreKey=(day,giro,dir,child)=>`girotondo_abs_${day}_${giro}_${dir}_${child}`;
  const readAbs=(day,g,dir,child)=>{const v=localStorage.getItem(absenceStoreKey(day,g,dir,child));return v?JSON.parse(v):null};
  const writeAbs=(day,g,dir,child,source="organizzatore")=>localStorage.setItem(absenceStoreKey(day,g,dir,child),JSON.stringify({source,at:new Date().toISOString()}));
  const delAbs=(day,g,dir,child)=>localStorage.removeItem(absenceStoreKey(day,g,dir,child));
  function renderAssenze(){
    const box=document.getElementById("assenzeLista"); if(!box)return;
    const day=document.getElementById("assGiorno").value;
    box.innerHTML=Object.keys(trips).map(g=>{
      return `<div class="card" style="margin:8px 0"><div class="carTop"><span class="num">🚐 Giro ${g}</span></div>` +
      [["andata","a","Andata"],["ritorno","r","Ritorno"]].map(([dir,key,label])=>{
        const names=[]; trips[g][key].forEach(s=>String(s[1]).split(" + ").forEach(n=>{if(!names.includes(n))names.push(n)}));
        return `<div style="margin-top:10px"><b>${label}</b>` + names.map(n=>{
          const a=readAbs(day,g,dir,n);
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #e8ecef"><div><b>${n}</b><small style="display:block;opacity:.65">${label}</small></div>` +
            (a ? `<div style="display:flex;align-items:center;gap:7px"><span style="font-weight:700;color:#a12626">🔴 ASSENTE</span><button type="button" data-clear="${g}|${dir}|${encodeURIComponent(n)}">Annulla</button></div>` : `<button type="button" data-set="${g}|${dir}|${encodeURIComponent(n)}">Segna assente</button>`) +
          `</div>`;
        }).join("") + `</div>`;
      }).join("") + `</div>`;
    }).join("");
    box.querySelectorAll("[data-set]").forEach(b=>b.addEventListener("click",()=>{const [g,dir,n]=b.dataset.set.split("|");writeAbs(day,g,dir,decodeURIComponent(n));renderAssenze();window.renderOpAbsences?.();window.refreshGiroStats?.();}));
    box.querySelectorAll("[data-clear]").forEach(b=>b.addEventListener("click",()=>{const [g,dir,n]=b.dataset.clear.split("|");delAbs(day,g,dir,decodeURIComponent(n));renderAssenze();window.renderOpAbsences?.();window.refreshGiroStats?.();}));
  }
  window.openAssenze=function(){["opView","autoView","orgView","detail","programmazione"].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hidden")});const e=document.getElementById("assenzeView");if(e)e.classList.remove("hidden");renderAssenze();};
  document.getElementById("backFromAssenze")?.addEventListener("click",()=>show("orgView"));
  document.getElementById("openAssenze")?.addEventListener("click",openAssenze);
  document.getElementById("assGiorno")?.addEventListener("change",renderAssenze);
})();


(function(){
 const b=document.getElementById("openProgrammazione");
 if(b)b.addEventListener("click",()=>{show("orgView");const e=document.getElementById("programmazione");if(e){e.classList.remove("hidden");e.scrollIntoView({behavior:"smooth",block:"start"});}});
})();


(function(){
  const dayNumber=()=>({Lunedì:1,Martedì:2,Mercoledì:3,Giovedì:4,Venerdì:5,Sabato:6,Domenica:7})[window.currentDay||"Lunedì"]||1;
  function absKey(day,g,child){return `girotondo_abs_${day}_${g}_${child}`;}
  function read(day,g,child){const v=localStorage.getItem(absKey(day,g,child));return v?JSON.parse(v):null;}
  function renderOpAbsences(){
    const panel=document.getElementById("opAssenzePanel"), list=document.getElementById("opAssenzeList");
    if(!panel||!list||typeof trips==="undefined")return;
    const day=dayNumber(), rows=[];
    Object.keys(trips).forEach(g=>{
      const seen=new Set();
      [...trips[g].a,...trips[g].r].forEach(s=>s[1].split(" + ").forEach(child=>{
        if(seen.has(child))return; seen.add(child);
        const a=read(day,g,child);
        if(a)rows.push({g,child});
      }));
    });
    panel.style.display=rows.length?"block":"none";
    list.innerHTML=rows.map(x=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><b>🔴 ${x.child}</b><br><small>Giro ${x.g} · Assenza segnalata dall'organizzatore</small></div>`).join("");
  }
  window.renderOpAbsences=renderOpAbsences;

  // Keep the currently selected day available globally.
  const oldShow=window.show;
  // Existing show is a global function declaration, so patch button listeners instead.
  document.addEventListener("click",e=>{
    const b=e.target.closest && e.target.closest(".day");
    if(b)setTimeout(renderOpAbsences,0);
  });

  const op=document.getElementById("tOp");
  if(op)op.addEventListener("click",()=>setTimeout(renderOpAbsences,0));
  setTimeout(renderOpAbsences,0);
})();


/* Girotondo 0.6.9 - correzioni UI e gestione locale del prototipo */
(function(){
  const ME="Renato Tacchini";
  const dayNum=()=>({Lunedì:1,Martedì:2,Mercoledì:3,Giovedì:4,Venerdì:5,Sabato:6,Domenica:7})[currentDay]||1;
  const absKey=(d,g,dir,c)=>`girotondo_abs_${d}_${g}_${dir}_${c}`;
  const readAbs=(d,g,dir,c)=>{try{const v=localStorage.getItem(absKey(d,g,dir,c));return v?JSON.parse(v):null}catch(e){return null}};
  const writeAbs=(d,g,dir,c,source="operatore")=>localStorage.setItem(absKey(d,g,dir,c),JSON.stringify({source,at:new Date().toISOString()}));
  const delAbs=(d,g,dir,c)=>localStorage.removeItem(absKey(d,g,dir,c));
  const overrideKey=(d,g,dir,i)=>`girotondo_stop_${d}_${g}_${dir}_${i}`;
  function getStop(d,g,dir,i,s){try{const v=localStorage.getItem(overrideKey(d,g,dir,i));return v?Object.assign({},s,JSON.parse(v)):s}catch(e){return s}}
  function setStop(d,g,dir,i,time,pickup){localStorage.setItem(overrideKey(d,g,dir,i),JSON.stringify({time,pickup}))}
  function currentAssignments(){
    const out={};
    Object.keys(trips).forEach(g=>{out[g]=[girotondoProgValue(dayNum(),g,"andata"),girotondoProgValue(dayNum(),g,"ritorno")];});
    return out;
  }
  function operatorName(id){const o=girotondoOperatori.find(x=>x.id===id);return o?o.nome:"Non assegnato"}
  function assignedToMe(g,dir){const idx=dir==="andata"?0:1; const a=currentAssignments()[g]?.[idx]; return a?operatorName(a)===ME:false}
  function assignedName(g,dir){const idx=dir==="andata"?0:1;const a=currentAssignments()[g]?.[idx];return a?operatorName(a):"Non assegnato"}

  window.renderOpAbsences=function(){
    const panel=$("opAssenzePanel"),list=$("opAssenzeList"); if(!panel||!list)return;
    const rows=[];
    Object.keys(trips).forEach(g=>["andata","ritorno"].forEach(dir=>{
      if(!assignedToMe(g,dir))return;
      const arr=trips[g][dir[0]==="a"?"a":"r"];
      arr.forEach((s,i)=>{const x=getStop(dayNum(),g,dir,i,s);String(x[1]).split(" + ").forEach(child=>{if(readAbs(dayNum(),g,dir,child))rows.push({g,dir,child,time:x[0]})})});
    }));
    panel.style.display=rows.length?"block":"none";
    list.innerHTML=rows.map(x=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><b>🔴 ${x.child}</b><br><small>Giro ${x.g} · ${x.dir} · ${x.time}</small></div>`).join("");
  };

  function renderOperator(){
    const v=$("opView"); if(!v)return;
    const cards=[];
    Object.keys(trips).forEach(g=>["andata","ritorno"].forEach(dir=>{
      if(!assignedToMe(g,dir))return;
      const arr=trips[g][dir==="andata"?"a":"r"];
      cards.push(`<div class="card" role="button" tabindex="0" onclick="openOperatorTrip(${g},'${dir}')" onkeydown="if(event.key==='Enter'||event.key===' ')openOperatorTrip(${g},'${dir}')"><span class="badge">${dir.toUpperCase()}</span><h3>🚐 ${g}</h3>${arr.map((s,i)=>{const x=getStop(dayNum(),g,dir,i,s);return `<div class="item"><b>${x[0]} · ${x[1]}</b><br>${x[2]} → ${x[3]}</div>`}).join("")}<div class="hint" style="margin-top:8px">Tocca per aprire la scaletta</div></div>`);
    }));
    v.innerHTML=`<div id="opAssenzePanel" class="card" style="display:none;border-left:4px solid #c62828;margin-bottom:10px"><div class="title">⚠️ Assenze di oggi</div><div id="opAssenzeList"></div></div><div class="title">I miei incarichi</div><div class="sub">Operatore: ${ME}</div>${cards.join("")||'<div class="info">Nessun incarico assegnato per questa giornata.</div>'}<div class="info">🔒 L'operatore non modifica la programmazione. Può segnalare ciò che accade sul posto, come un'assenza.</div>`;
    renderOpAbsences();
  }
  window.openGiroMap=function(q){window.location.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);};
  window.openOperatorTrip=function(g,dir){
    const arr=trips[g][dir==="andata"?"a":"r"];
    $("detail").innerHTML=`<button class="back" onclick="show('opView');renderOperatorView()">← Torna ai miei incarichi</button><h2>🚐 Giro ${g}</h2><div class="sub">${currentDay} · ${dir.toUpperCase()} · ${assignedName(g,dir)}</div><div class="info"><b>Sola consultazione</b><br>Puoi segnalare l'assenza di un singolo assistito. La programmazione non viene modificata.</div>${arr.map((s,i)=>{const x=getStop(dayNum(),g,dir,i,s);const names=String(x[1]).split(" + ");return `<div class="stop ${x[4]?'fixed':''}"><div class="time">${x[0]} <span class="hint">• ${x[4]?'fisso':'indicativo'}</span></div><button type="button" class="maplink" onclick="openGiroMap(${JSON.stringify(x[2])})">📍 Apri punto sulla mappa</button><div class="route">📍 ${x[2]}<br>➡️ ${x[3]}</div>${names.map(n=>{const absent=readAbs(dayNum(),g,dir,n);return `<div class="person-row"><div class="people">${n}${absent?' <span style="color:#a12626">· ASSENTE</span>':''}</div>${absent?`<button type="button" class="abs" onclick="undoOperatorAbsence(${g},'${dir}','${n.replace(/'/g,"\\'")}')">↩️ Annulla</button>`:`<button type="button" class="abs" onclick="markOperatorAbsence(${g},'${dir}','${n.replace(/'/g,"\\'")}')">⚠️ Assente</button>`}</div>`}).join("")}</div>`}).join("")}`;
    show("detail");
  }
  window.markOperatorAbsence=function(g,dir,child){writeAbs(dayNum(),g,dir,child,"operatore");openOperatorTrip(g,dir);refreshStats();}
  window.undoOperatorAbsence=function(g,dir,child){delAbs(dayNum(),g,dir,child);openOperatorTrip(g,dir);refreshStats();}
  window.renderOperatorView=renderOperator;

  function refreshStats(){
    const stats=document.querySelectorAll("#orgView .stats b");if(!stats.length)return;
    let abs=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf("girotondo_abs_")===0)abs++;}
    stats[0].textContent=Object.keys(trips).length;stats[1].textContent=abs;
    let un=0;Object.keys(trips).forEach(g=>["andata","ritorno"].forEach(d=>{if(!girotondoProgValue(dayNum(),g,d))un++;}));stats[2].textContent=un;
  }
  window.refreshGiroStats=refreshStats;
  function roleLabel(){ $("role").textContent="ORGANIZZATORE + OPERATORE"; }

  // Replace the original static organizer list with live assignments and editing controls.
  window.renderProgrammazione=function(){
    const day=$("progGiorno"),list=$("progLista");if(!day||!list)return;const d=day.value;
    list.innerHTML=Object.keys(trips).map(g=>`<div class="prog-card"><div class="carTop"><span class="num">🚐 ${g}</span><button type="button" class="map" style="border:0;border-radius:9px;padding:7px 9px;font-weight:800" onclick="toggleStopEditor(${g})">✏️ Modifica fermate</button></div><div class="prog-grid">${girotondoProgSelect(d,g,"andata","Andata")}${girotondoProgSelect(d,g,"ritorno","Ritorno")}</div><div id="stopEditor_${g}" class="edit-panel hidden"></div></div>`).join("");
    list.querySelectorAll("select[data-giro]").forEach(sel=>sel.addEventListener("change",function(){const k=girotondoProgKey(d,sel.dataset.giro,sel.dataset.dir);if(sel.value)localStorage.setItem(k,sel.value);else localStorage.removeItem(k);renderProgrammazione();refreshStats();renderOperator();}));
    refreshStats();
  }
  window.toggleStopEditor=function(g){const box=$("stopEditor_"+g);if(!box)return;if(!box.classList.contains("hidden")){box.classList.add("hidden");return;}const d=$("progGiorno").value;box.classList.remove("hidden");box.innerHTML=`<b>Modifica fermate — ${currentDay}</b><div class="hint" style="margin:5px 0 8px">Queste modifiche sono solo per il giorno selezionato nel prototipo.</div>${["andata","ritorno"].map(dir=>{const arr=trips[g][dir==="andata"?"a":"r"];return `<div style="font-weight:850;margin-top:10px">${dir.toUpperCase()}</div>`+arr.map((s,i)=>{const x=getStop(d,g,dir,i,s);return `<div class="edit-row"><b>${x[1]}</b><div><input id="time_${g}_${dir}_${i}" value="${x[0]}" placeholder="orario"><input id="pick_${g}_${dir}_${i}" value="${x[2]}" placeholder="punto di ritiro" style="margin-top:5px"><button type="button" class="maplink" onclick="openGiroMap(document.getElementById('pick_${g}_${dir}_${i}').value)">📍 Verifica sulla mappa</button></div></div>`}).join("")}).join("")}<div class="edit-actions"><button class="cancel" type="button" onclick="toggleStopEditor(${g})">Annulla</button><button class="save" type="button" onclick="saveStopEdits(${g})">Salva modifiche</button></div>`;}
  window.saveStopEdits=function(g){const d=$("progGiorno").value;["andata","ritorno"].forEach(dir=>{const arr=trips[g][dir==="andata"?"a":"r"];arr.forEach((s,i)=>{const t=$("time_"+g+"_"+dir+"_"+i),p=$("pick_"+g+"_"+dir+"_"+i);if(t&&p)setStop(d,g,dir,i,t.value,p.value);});});renderProgrammazione();renderOperator();alert("Modifiche salvate per "+currentDay+". La programmazione base resta invariata.");}

  // Patch the navigation after the original listeners are installed.
  const opBtn=$("tOp"),orgBtn=$("tOrg");
  if(opBtn)opBtn.addEventListener("click",()=>setTimeout(()=>{roleLabel();renderOperator();},0));
  if(orgBtn)orgBtn.addEventListener("click",()=>setTimeout(()=>{roleLabel();renderProgrammazione();refreshStats();},0));
  const dayButtons=document.querySelectorAll(".day");dayButtons.forEach(b=>b.addEventListener("click",()=>setTimeout(()=>{renderOperator();refreshStats();},0)));
  const oldProgDay=$("progGiorno");if(oldProgDay)oldProgDay.addEventListener("change",()=>setTimeout(()=>{currentDay=["","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"][Number(oldProgDay.value)]||currentDay;renderProgrammazione();refreshStats();},0));
  setTimeout(()=>{roleLabel();renderOperator();refreshStats();},50);
})();


/* Girotondo 0.8.0 - gestione assenze per tipo/intervallo + mappe via link esterno */
(function(){
  const ABS_PREFIX='girotondo_abs_v8_';
  const weekStart=new Date(2026,8,21); // lunedì della settimana prototipo
  const dayNames=['','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
  const dirLabel=d=>d==='andata'?'Andata':'Ritorno';
  const key=(g,child)=>ABS_PREFIX+g+'_'+encodeURIComponent(child);
  function load(g,child){try{const v=localStorage.getItem(key(g,child));return v?JSON.parse(v):null}catch(e){return null}}
  function save(g,child,obj){localStorage.setItem(key(g,child),JSON.stringify(obj))}
  function remove(g,child){localStorage.removeItem(key(g,child))}
  function dateForDay(n){const d=new Date(weekStart);d.setDate(d.getDate()+Number(n)-1);return d}
  function iso(d){return d.toISOString().slice(0,10)}
  function fmt(d){return new Date(d+'T12:00:00').toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'})}
  function todayDay(){return ({Lunedì:1,Martedì:2,Mercoledì:3,Giovedì:4,Venerdì:5,Sabato:6,Domenica:7})[window.currentDay||'Lunedì']||1}
  function allChildren(g){const a=[];['a','r'].forEach(k=>(trips[g][k]||[]).forEach(s=>String(s[1]).split(' + ').forEach(n=>{n=n.trim();if(n&&!a.includes(n))a.push(n)})));return a}
  function statusFor(abs,day,g,dir,child){
    if(!abs)return null;
    const dt=iso(dateForDay(day));
    const start=abs.start,end=abs.end;
    if(abs.mode==='giorno') return (dt===start||dt===end)?'absente':null;
    if(abs.mode==='andata') return dt>=start&&dt<=end&&dir==='andata'?'absente':null;
    if(abs.mode==='ritorno') return dt>=start&&dt<=end&&dir==='ritorno'?'absente':null;
    if(abs.mode==='tutto') return dt>=start&&dt<=end?'absente':null;
    return null;
  }
  function returningToday(abs,day){
    if(!abs||!abs.end)return false;
    const dt=iso(dateForDay(day));
    const next=new Date(abs.end+'T12:00:00');next.setDate(next.getDate()+1);
    return iso(next)===dt;
  }
  function rangeLabel(abs){
    if(abs.mode==='giorno')return 'Assente tutto il giorno · '+fmt(abs.start);
    if(abs.mode==='andata')return 'Assente solo andata · '+fmt(abs.start)+(abs.start!==abs.end?' → '+fmt(abs.end):'');
    if(abs.mode==='ritorno')return 'Assente solo ritorno · '+fmt(abs.start)+(abs.start!==abs.end?' → '+fmt(abs.end):'');
    return 'Assente tutto il giorno · '+fmt(abs.start)+' → '+fmt(abs.end);
  }
  function uniqueStops(g,dir){
    const arr=trips[g][dir==='andata'?'a':'r']||[], out=[];
    arr.forEach((s,i)=>String(s[1]).split(' + ').forEach(n=>{n=n.trim();if(!out.some(x=>x.child===n))out.push({child:n,index:i,stop:s})}));
    return out;
  }
  function installAssenze(){
    const old=document.getElementById('openAssenze'); if(!old)return;
    const fresh=old.cloneNode(true); old.replaceWith(fresh);
    fresh.addEventListener('click',()=>openAssenzeV8());
  }
  function openAssenzeV8(){
    ['opView','autoView','orgView','detail'].forEach(id=>{const e=$(id);if(e)e.classList.add('hidden')});
    const e=$('assenzeView');if(e)e.classList.remove('hidden');
    renderAssenzeV8();
  }
  window.openAssenzeV8=openAssenzeV8;
  function renderAssenzeV8(){
    const box=$('assenzeLista');if(!box)return;
    const day=Number($('assGiorno')?.value||1);
    box.innerHTML=Object.keys(trips).map(g=>{
      const children=allChildren(g);
      return `<div class="card" style="margin:8px 0"><div class="carTop"><span class="num">🚐 Giro ${g}</span></div>`+
      children.map(child=>{
        const a=load(g,child); const st=a?rangeLabel(a):'Nessuna assenza attiva';
        const returning=returningToday(a,day);
        return `<div class="person-row" style="align-items:flex-start"><div><div class="people">${child}</div><small style="display:block;opacity:.72;margin-top:3px">${st}</small>${returning?'<div style="margin-top:5px;color:#217a3a;font-weight:800">🟢 Rientra oggi</div>':''}</div><button type="button" class="abs" data-abs-menu="${g}|${encodeURIComponent(child)}">${a?'✏️ Modifica assenza':'🚫 Segna assenza'} ▾</button></div>`;
      }).join('')+'</div>';
    }).join('');
    box.querySelectorAll('[data-abs-menu]').forEach(b=>b.addEventListener('click',()=>openAbsMenu(b.dataset.absMenu.split('|')[0],decodeURIComponent(b.dataset.absMenu.split('|')[1]))));
  }
  function openAbsMenu(g,child){
    const old=document.getElementById('absModal');if(old)old.remove();
    const a=load(g,child), base=a||{mode:'tutto',start:iso(dateForDay(Number($('assGiorno')?.value||1))),end:iso(dateForDay(Number($('assGiorno')?.value||1)))};
    const m=document.createElement('div');m.id='absModal';m.style.cssText='position:fixed;inset:0;background:#0006;z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:10px';
    m.innerHTML=`<div style="background:#fff;border-radius:16px;padding:16px;width:min(540px,100%);max-height:90vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">🚫 Assenza · ${child}</h3><button type="button" id="absClose" style="border:0;background:#eef1f4;border-radius:8px;padding:7px 10px">✕</button></div><div class="sub" style="margin-top:4px">Scegli il tipo di assenza</div><label class="prog-label" style="display:block;margin-top:12px">Tipo<select id="absType" class="prog-select"><option value="tutto">Assente tutto il giorno</option><option value="andata">Assente solo andata</option><option value="ritorno">Assente solo ritorno</option><option value="intervallo">Assente dal giorno … al giorno …</option></select></label><div id="absDates" style="margin-top:10px"><label class="prog-label">Dal<input id="absStart" type="date" value="${base.start}" class="prog-select"></label><label class="prog-label" style="display:block;margin-top:8px">Al<input id="absEnd" type="date" value="${base.end}" class="prog-select"></label></div><div class="edit-actions"><button type="button" class="cancel" id="absCancel">Annulla</button><button type="button" class="save" id="absSave">Salva assenza</button></div>${a?'<button type="button" class="btn" id="absDelete" style="background:#8a2f1d">🗑️ Cancella assenza</button>':''}</div>`;
    document.body.appendChild(m);
    const type=m.querySelector('#absType');const dates=m.querySelector('#absDates');
    type.value=a?(a.mode==='giorno'?'tutto':a.mode):'tutto';
    const sync=()=>{const showDates=type.value==='intervallo';dates.style.setProperty('display',showDates?'block':'none','important');}; sync(); type.addEventListener('change',sync);
    type.addEventListener('change',sync);
    m.querySelector('#absClose').onclick=m.querySelector('#absCancel').onclick=()=>m.remove();
    m.querySelector('#absSave').onclick=()=>{
      let mode=type.value,start=m.querySelector('#absStart').value,end=m.querySelector('#absEnd').value;
      if(!start)start=iso(dateForDay(Number($('assGiorno')?.value||1))); if(!end)end=start;
      if(mode!=='intervallo'){mode=mode==='tutto'?'giorno':mode;end=start;}
      if(end<start){alert('La data finale non può precedere quella iniziale.');return;}
      save(g,child,{mode,start,end,createdAt:new Date().toISOString()});m.remove();renderAssenzeV8();window.renderOpAbsences?.();window.refreshGiroStats?.();
    };
    const del=m.querySelector('#absDelete');if(del)del.onclick=()=>{remove(g,child);m.remove();renderAssenzeV8();window.renderOpAbsences?.();window.refreshGiroStats?.();};
  }
  window.renderAssenzeV8=renderAssenzeV8;

  function mapsHref(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)}
  window.openGiroMap=function(q){window.location.assign(mapsHref(q));};
  function mapAnchor(q){return `<a class="maplink" href="${mapsHref(q)}" target="_blank" rel="noopener noreferrer">📍 Apri punto sulla mappa</a>`}

  window.renderOpAbsences=function(){
    const panel=$('opAssenzePanel'),list=$('opAssenzeList');if(!panel||!list)return;
    const day=todayDay(),rows=[],returns=[];
    Object.keys(trips).forEach(g=>['andata','ritorno'].forEach(dir=>{
      if(!assignedToMe(g,dir))return;
      uniqueStops(g,dir).forEach(x=>{const a=load(g,x.child);if(statusFor(a,day,g,dir,x.child)==='absente')rows.push({g,dir,child:x.child});if(returningToday(a,day))returns.push({g,dir,child:x.child});});
    }));
    panel.style.display=(rows.length||returns.length)?'block':'none';
    list.innerHTML=returns.map(x=>`<div style="padding:9px 0;border-bottom:1px solid #e3eee5"><b style="color:#217a3a">🟢 OGGI RIENTRA ${x.child.toUpperCase()}</b><br><small>Era assente · Giro ${x.g} · ${dirLabel(x.dir)}</small></div>`).join('')+rows.map(x=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><b>🔴 ${x.child}</b><br><small>Giro ${x.g} · ${dirLabel(x.dir)} · assente</small></div>`).join('');
  };

  window.renderOperatorView=function(){
    const v=$('opView');if(!v)return;const cards=[];
    Object.keys(trips).forEach(g=>['andata','ritorno'].forEach(dir=>{
      if(!assignedToMe(g,dir))return;const arr=trips[g][dir==='andata'?'a':'r'];
      cards.push(`<div class="card" role="button" tabindex="0" onclick="openOperatorTrip(${g},'${dir}')"><span class="badge">${dir.toUpperCase()}</span><h3>🚐 ${g}</h3>${arr.map((s,i)=>{const x=getStop(dayNum(),g,dir,i,s);return `<div class="item"><b>${x[0]} · ${x[1]}</b><br>${x[2]} → ${x[3]}</div>`}).join('')}<div class="hint" style="margin-top:8px">Tocca per aprire la scaletta</div></div>`);
    }));
    v.innerHTML=`<div id="opAssenzePanel" class="card" style="display:none;border-left:4px solid #c62828;margin-bottom:10px"><div class="title">⚠️ Avvisi di oggi</div><div id="opAssenzeList"></div></div><div class="title">I miei incarichi</div><div class="sub">Operatore: Renato Tacchini</div>${cards.join('')||'<div class="info">Nessun incarico assegnato per questa giornata.</div>'}<div class="info">🔒 L'operatore non modifica la programmazione.</div>`;
    renderOpAbsences();
  };
  window.openOperatorTrip=function(g,dir){
    const arr=trips[g][dir==='andata'?'a':'r'];
    $('detail').innerHTML=`<button class="back" onclick="show('opView');renderOperatorView()">← Torna ai miei incarichi</button><h2>🚐 Giro ${g}</h2><div class="sub">${currentDay} · ${dir.toUpperCase()} · ${assignedName(g,dir)}</div><div class="info"><b>Sola consultazione</b><br>Puoi segnalare l'assenza di un singolo assistito.</div>${arr.map((s,i)=>{const x=getStop(dayNum(),g,dir,i,s);const names=String(x[1]).split(' + ');return `<div class="stop ${x[4]?'fixed':''}"><div class="time">${x[0]} <span class="hint">• ${x[4]?'fisso':'indicativo'}</span></div>${mapAnchor(x[2])}<div class="route">📍 ${x[2]}<br>➡️ ${x[3]}</div>${names.map(n=>{const a=load(g,n),abs=statusFor(a,dayNum(),g,dir,n)==='absente',ret=returningToday(a,dayNum());return `<div class="person-row"><div class="people">${n}${abs?' <span style="color:#a12626">· ASSENTE</span>':''}${ret?' <span style="color:#217a3a">· RIENTRA OGGI</span>':''}</div>${abs?'<span style="color:#a12626;font-weight:800">🔴 Assente</span>':''}</div>`}).join('')}</div>`}).join('')}`;
    show('detail');
  };

  // Update map links in organizer stop editor as real external links.
  const oldToggle=window.toggleStopEditor;
  window.toggleStopEditor=function(g){oldToggle(g);setTimeout(()=>{document.querySelectorAll('#stopEditor_'+g+' .maplink').forEach(el=>{const onclick=el.getAttribute('onclick')||'';const m=onclick.match(/value\)\.value\)/);});},0)};

  // Stats count active absence records, not per-direction flags.
  window.refreshGiroStats=function(){const stats=document.querySelectorAll('#orgView .stats b');if(!stats.length)return;let abs=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(ABS_PREFIX)===0)abs++;}stats[0].textContent=Object.keys(trips).length;stats[1].textContent=abs;let un=0;Object.keys(trips).forEach(g=>['andata','ritorno'].forEach(d=>{if(!girotondoProgValue(todayDay(),g,d))un++;}));stats[2].textContent=un;};

  installAssenze();
  const daySel=$('assGiorno');if(daySel)daySel.addEventListener('change',renderAssenzeV8);
  const oldOp=$('tOp');if(oldOp)oldOp.addEventListener('click',()=>setTimeout(()=>{renderOperatorView();},0));
  setTimeout(()=>{installAssenze();renderAssenzeV8();renderOperatorView();},80);
})();


/* Girotondo 0.8.1 - assistiti indipendenti, eccezioni individuali, assenze sincronizzate */
(function(){
  const CHILD_PREFIX='girotondo_childstop_v81_';
  // 0.8.3 fix: the 0.8.1 block is a separate scope, so it must not call
  // helper functions that belong to the older 0.8.0 closure.
  const ABS_PREFIX_V81='girotondo_abs_v8_';
  const dayNumV81=()=>({Lunedì:1,Martedì:2,Mercoledì:3,Giovedì:4,Venerdì:5,Sabato:6,Domenica:7})[currentDay]||1;
  const absKeyV81=(g,child)=>ABS_PREFIX_V81+g+'_'+encodeURIComponent(child);
  const loadAbsV81=(g,child)=>{try{const v=localStorage.getItem(absKeyV81(g,child));return v?JSON.parse(v):null}catch(e){return null}};
  const statusAbsV81=(abs,day,dir)=>{
    if(!abs)return false;
    const weekStart=new Date(2026,8,21); const dt=new Date(weekStart); dt.setDate(dt.getDate()+Number(day)-1);
    const iso=dt.toISOString().slice(0,10);
    if(abs.mode==='giorno') return iso===abs.start;
    if(abs.mode==='andata') return iso>=abs.start&&iso<=abs.end&&dir==='andata';
    if(abs.mode==='ritorno') return iso>=abs.start&&iso<=abs.end&&dir==='ritorno';
    if(abs.mode==='tutto') return iso>=abs.start&&iso<=abs.end;
    return false;
  };
  const returningV81=(abs,day)=>{
    if(!abs||!abs.end)return false;
    const d=new Date(abs.end+'T12:00:00');d.setDate(d.getDate()+1);
    const weekStart=new Date(2026,8,21);const target=new Date(weekStart);target.setDate(target.getDate()+Number(day)-1);
    return d.toISOString().slice(0,10)===target.toISOString().slice(0,10);
  };
  const assignedNameV81=(g,dir)=>{
    const id=girotondoProgValue(dayNumV81(),g,dir);
    const o=girotondoOperatori.find(x=>x.id===id);
    return o?o.nome:'Non assegnato';
  };
  const assignedToMeV81=(g,dir)=>assignedNameV81(g,dir)==='Renato Tacchini';

  const childKey=(d,g,dir,child)=>CHILD_PREFIX+d+'_'+g+'_'+dir+'_'+encodeURIComponent(child);
  const readChild=(d,g,dir,child)=>{try{const v=localStorage.getItem(childKey(d,g,dir,child));return v?JSON.parse(v):null}catch(e){return null}};
  const writeChild=(d,g,dir,child,obj)=>localStorage.setItem(childKey(d,g,dir,child),JSON.stringify(obj));
  const childrenOf=s=>String(s[1]).split(' + ').map(x=>x.trim()).filter(Boolean);
  const childStop=(d,g,dir,i,s,child)=>{const o=readChild(d,g,dir,child);return {time:o?.time||s[0],pickup:o?.pickup||s[2],dropoff:o?.dropoff||s[3],fixed:s[4]};};
  const todayNum=()=>({Lunedì:1,Martedì:2,Mercoledì:3,Giovedì:4,Venerdì:5,Sabato:6,Domenica:7})[currentDay]||1;

  // Keep the selected day synchronized for all prototype modules.
  document.querySelectorAll('.day').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{window.currentDay=currentDay; window.renderOperatorView?.(); window.renderOpAbsences?.();},0)));
  window.currentDay=currentDay;

  // Assenze: first three options always refer to the selected/current day; dates only appear for interval.
  const oldOpenAbs=window.openAbsMenu;
  window.openAbsMenu=function(g,child){
    const old=document.getElementById('absModal'); if(old)old.remove();
    const day=todayNum();
    const baseDate=iso(dateForDay(day));
    const a=load(g,child);
    const base=a||{mode:'giorno',start:baseDate,end:baseDate};
    const m=document.createElement('div');m.id='absModal';m.style.cssText='position:fixed;inset:0;background:#0006;z-index:50;display:flex;align-items:flex-end;justify-content:center;padding:10px';
    m.innerHTML=`<div style="background:#fff;border-radius:16px;padding:16px;width:min(540px,100%);max-height:90vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">🚫 Assenza · ${child}</h3><button type="button" id="absClose" style="border:0;background:#eef1f4;border-radius:8px;padding:7px 10px">✕</button></div><div class="sub" style="margin-top:4px">Oggi: ${currentDay} · ${fmt(baseDate)}</div><label class="prog-label" style="display:block;margin-top:12px">Tipo<select id="absType" class="prog-select"><option value="tutto">Assente tutto il giorno</option><option value="andata">Assente solo andata</option><option value="ritorno">Assente solo ritorno</option><option value="intervallo">Assente dal giorno … al giorno …</option></select></label><div id="absDates" style="display:none !important;margin-top:10px"><label class="prog-label">Dal<input id="absStart" type="date" value="${base.start||baseDate}" class="prog-select"></label><label class="prog-label" style="display:block;margin-top:8px">Al<input id="absEnd" type="date" value="${base.end||baseDate}" class="prog-select"></label></div><div class="edit-actions"><button type="button" class="cancel" id="absCancel">Annulla</button><button type="button" class="save" id="absSave">Salva assenza</button></div>${a?'<button type="button" class="btn" id="absDelete" style="background:#8a2f1d">🗑️ Cancella assenza</button>':''}</div>`;
    document.body.appendChild(m);
    const type=m.querySelector('#absType'), dates=m.querySelector('#absDates');
    type.value=a?(a.mode==='giorno'?'tutto':a.mode):'tutto';
    const sync=()=>{dates.style.setProperty('display', type.value==='intervallo'?'block':'none','important');}; sync(); type.addEventListener('change',sync);
    m.querySelector('#absClose').onclick=m.querySelector('#absCancel').onclick=()=>m.remove();
    m.querySelector('#absSave').onclick=()=>{
      let mode=type.value,start=baseDate,end=baseDate;
      if(mode==='intervallo'){
        start=m.querySelector('#absStart').value||baseDate; end=m.querySelector('#absEnd').value||start;
        if(end<start){alert('La data finale non può precedere quella iniziale.');return;}
      }else mode=mode==='tutto'?'giorno':mode;
      save(g,child,{mode,start,end,createdAt:new Date().toISOString()});
      m.remove(); renderAssenzeV8(); window.renderOpAbsences?.(); window.refreshGiroStats?.();
    };
    const del=m.querySelector('#absDelete'); if(del)del.onclick=()=>{remove(g,child);m.remove();renderAssenzeV8();window.renderOpAbsences?.();window.refreshGiroStats?.();};
  };

  // Operator view: every child is rendered separately even when sharing the same physical stop.
  window.renderOperatorView=function(){
    const v=$('opView'); if(!v)return; const cards=[];
    Object.keys(trips).forEach(g=>['andata','ritorno'].forEach(dir=>{
      if(!assignedToMeV81(g,dir))return;
      const arr=trips[g][dir==='andata'?'a':'r'];
      cards.push(`<div class="card" role="button" tabindex="0" onclick="openOperatorTrip(${g},'${dir}')"><span class="badge">${dir.toUpperCase()}</span><h3>🚐 ${g}</h3>${arr.map((s,i)=>{
        const kids=childrenOf(s); const shown=kids.map(ch=>{const x=childStop(todayNum(),g,dir,i,s,ch);return `<div class="item"><b>${x.time} · ${ch}</b><br>${x.pickup} → ${x.dropoff}</div>`}).join('');
        return shown;
      }).join('')}<div class="hint" style="margin-top:8px">Tocca per aprire la scaletta</div></div>`);
    }));
    v.innerHTML=`<div id="opAssenzePanel" class="card" style="display:none;border-left:4px solid #c62828;margin-bottom:10px"><div class="title">⚠️ Avvisi di oggi</div><div id="opAssenzeList"></div></div><div class="title">I miei incarichi</div><div class="sub">Operatore: Renato Tacchini</div>${cards.join('')||'<div class="info">Nessun incarico assegnato per questa giornata.</div>'}<div class="info">🔒 L'operatore non modifica la programmazione.</div>`;
    window.renderOpAbsences?.();
  };

  window.openOperatorTrip=function(g,dir){
    const arr=trips[g][dir==='andata'?'a':'r'];
    $('detail').innerHTML=`<button class="back" onclick="show('opView');renderOperatorView()">← Torna ai miei incarichi</button><h2>🚐 Giro ${g}</h2><div class="sub">${currentDay} · ${dir.toUpperCase()} · ${assignedNameV81(g,dir)}</div><div class="info"><b>Sola consultazione</b><br>Ogni assistito è gestito singolarmente, anche quando condivide la stessa fermata.</div>${arr.map((s,i)=>{
      const kids=childrenOf(s);
      return `<div class="stop ${s[4]?'fixed':''}"><div class="time">${s[0]} <span class="hint">• ${s[4]?'fisso':'indicativo'}</span></div><a class="maplink" href="${mapsHref(s[2])}" target="_blank" rel="noopener noreferrer">📍 Apri punto sulla mappa</a><div class="route">📍 ${s[2]}<br>➡️ ${s[3]}</div>${kids.map(ch=>{const x=childStop(todayNum(),g,dir,i,s,ch);const a=loadAbsV81(g,ch),abs=statusAbsV81(a,todayNum(),dir),ret=returningV81(a,todayNum());return `<div class="person-row" style="padding:8px 0;border-top:1px solid #edf0f2"><div><div class="people">${ch}${abs?' <span style="color:#a12626">· ASSENTE</span>':''}${ret?' <span style="color:#217a3a">· RIENTRA OGGI</span>':''}</div><div class="route">📍 ${x.pickup}<br>➡️ ${x.dropoff}</div></div>${abs?'<span style="color:#a12626;font-weight:800">🔴 Assente</span>':''}</div>`}).join('')}</div>`;
    }).join('')}`;
    show('detail');
  };

  // Organizer: edit each child's stop independently.
  window.toggleStopEditor=function(g){
    const box=$('stopEditor_'+g); if(!box)return;
    if(!box.classList.contains('hidden')){box.classList.add('hidden');return;}
    const d=$('progGiorno')?.value||todayNum(); box.classList.remove('hidden');
    let html=`<b>Modifica fermate individuali — ${currentDay}</b><div class="hint" style="margin:5px 0 8px">La modifica riguarda il singolo bambino e solo il giorno selezionato.</div>`;
    ['andata','ritorno'].forEach(dir=>{
      const arr=trips[g][dir==='andata'?'a':'r']; html+=`<div style="font-weight:850;margin-top:10px">${dir.toUpperCase()}</div>`;
      arr.forEach((s,i)=>childrenOf(s).forEach(ch=>{
        const x=childStop(d,g,dir,i,s,ch);
        html+=`<div class="edit-row"><div><b>${ch}</b><small style="display:block;opacity:.65">${s[2]}</small></div><div><input id="ct_${g}_${dir}_${i}_${encodeURIComponent(ch)}" value="${x.time}" placeholder="orario"><input id="cp_${g}_${dir}_${i}_${encodeURIComponent(ch)}" value="${x.pickup}" placeholder="punto di ritiro" style="margin-top:5px"><input id="cd_${g}_${dir}_${i}_${encodeURIComponent(ch)}" value="${x.dropoff}" placeholder="destinazione" style="margin-top:5px"><a class="maplink" href="${mapsHref(x.pickup)}" target="_blank" rel="noopener noreferrer">📍 Verifica sulla mappa</a></div></div>`;
      }));
    });
    html+=`<div class="edit-actions"><button class="cancel" type="button" onclick="toggleStopEditor(${g})">Annulla</button><button class="save" type="button" onclick="saveChildStopEdits(${g})">Salva modifiche</button></div>`;
    box.innerHTML=html;
  };
  window.saveChildStopEdits=function(g){
    const d=$('progGiorno')?.value||todayNum();
    ['andata','ritorno'].forEach(dir=>{
      const arr=trips[g][dir==='andata'?'a':'r']; arr.forEach((s,i)=>childrenOf(s).forEach(ch=>{
        const id=encodeURIComponent(ch),t=$(`ct_${g}_${dir}_${i}_${id}`),p=$(`cp_${g}_${dir}_${i}_${id}`),drop=$(`cd_${g}_${dir}_${i}_${id}`);
        if(t&&p&&drop)writeChild(d,g,dir,ch,{time:t.value,pickup:p.value,dropoff:drop.value});
      }));
    });
    toggleStopEditor(g); renderOperatorView(); alert('Modifiche individuali salvate per il giorno selezionato.');
  };

  // Stats: count children with active absence records, not just direction flags.
  window.refreshGiroStats=function(){const stats=document.querySelectorAll('#orgView .stats b');if(!stats.length)return;let abs=0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('girotondo_abs_v8_')===0)abs++;}stats[0].textContent=Object.keys(trips).length;stats[1].textContent=abs;let un=0;Object.keys(trips).forEach(g=>['andata','ritorno'].forEach(d=>{if(!girotondoProgValue(todayNum(),g,d))un++;}));stats[2].textContent=un;};
  setTimeout(()=>{window.currentDay=currentDay;renderOperatorView();renderAssenzeV8();window.refreshGiroStats?.();},120);
})();

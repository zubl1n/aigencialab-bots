/* ── AGENTE ATENCIÓN v2 — app.js ─────────────────────────────
   Base de Clientes con localStorage + tabs + historial.
─────────────────────────────────────────────────────────── */
var STORAGE_KEY = 'AigenciaLab_atencion_clientes';
function dbLoad()  { try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch(e){ return []; } }
function dbSave(r) { try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); }catch(e){} }
function dbUpsert(c) { var all=dbLoad(),idx=-1; for(var i=0;i<all.length;i++){ if(all[i].id===c.id){ idx=i; break; } } if(idx>=0) all[idx]=c; else all.unshift(c); dbSave(all); }
function uid() { return Date.now().toString(36)+Math.random().toString(36).substr(2,6); }
function ts()  { return new Date().toISOString(); }
function fmtDate(iso) { return iso?new Date(iso).toLocaleString('es-CL',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'; }

var TICKET_COUNTER = 1000, TOTAL_RESOLVED = 0, TOTAL_ESCALATED = 0;
var CSAT_SCORES = [], TICKETS_DB = [];
var currentClient = null, currentTicketId = null, chatOpen = false, awaitingCSAT = false;

var SUPPORT_RESPONSES = [
  { keys:['horario','hora','atienden','abierto'], reply:function(){ return '🕐 Nuestro horario de atención es:\n\n**Lunes a Viernes:** 8:30 – 19:00 hrs\n**Sábado:** 9:00 – 14:00 hrs\n\nEste chat está disponible 24/7. ¿Te puedo ayudar en algo más?'; }, resolves:true, csat:5 },
  { keys:['devolucion','devolución','cambio','reembolso','garantia'], reply:function(){ return '↩ Política de devoluciones:\n\n✅ **30 días** desde la compra (sin uso)\n✅ **60 días** para productos defectuosos\n⚠ Productos personalizados sin devolución\n\n¿Tienes el número de orden?'; }, resolves:false, csat:4 },
  { keys:['pedido','envio','envío','tracking','despacho','delivery'], reply:function(){ return '📦 Consultando sistema de despacho...\n\nEnvío **Nro. #'+Math.floor(Math.random()*90000+10000)+'**: En tránsito con Starken — estimado de llegada **mañana 10:00-14:00 hrs**. ¿Te envío el link de seguimiento?'; }, resolves:true, csat:5 },
  { keys:['factura','boleta','sii','tributario','rut'], reply:function(){ return '🧾 Por seguridad (**Ley N°21.663**) no procesamos RUTs por chat público. Reenviaré la boleta al email registrado en los próximos 5 minutos. ¿Es correcto el email de tu cuenta?'; }, resolves:false, csat:4 },
  { keys:['humano','persona','ejecutivo','hablar','real','escalar'], reply:function(){ return '👤 Te transfiero a un ejecutivo en Santiago.\n\n⏱ Espera estimada: **3-7 minutos**'; }, resolves:false, csat:3, escalates:true },
  { keys:['gracias','perfecto','listo','solucionó','resuelto'], reply:function(){ return '¡Me alegra haber podido ayudarte! 🎉\n\n¿Qué tan satisfecho/a estás con esta atención?\n⭐⭐⭐⭐⭐ ← Responde del 1 al 5'; }, resolves:true, csat:null, asksCsat:true }
];
var DEFAULT_REPLY = '¡Gracias por contactarnos 😊! Dame un momento para revisar la información más actualizada. ¿Podrías darme un poco más de detalle?';

function matchAny(str, keys){ return keys.some(function(k){ return str.indexOf(k)!==-1; }); }
function timeNow(){ return new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}); }

/* DOM */
var chatMessages=document.getElementById('chatMessages');
var userInput=document.getElementById('userInput');
var sendBtn=document.getElementById('sendBtn');
var newTicketBtn=document.getElementById('newTicketBtn');
var escalateBtn=document.getElementById('escalateBtn');
var ticketList=document.getElementById('ticketList');
var ticketIdEl=document.getElementById('ticketId');
var kpiResolved=document.getElementById('kpiResolved');
var kpiCSAT=document.getElementById('kpiCSAT');
var kpiTMO=document.getElementById('kpiTMO');
var kpiEscalated=document.getElementById('kpiEscalated');
var activityLog=document.getElementById('activityLog');

function updateKPIs(){
  kpiResolved.textContent=TOTAL_RESOLVED; kpiEscalated.textContent=TOTAL_ESCALATED;
  var avg=CSAT_SCORES.length?(CSAT_SCORES.reduce(function(a,b){return a+b;},0)/CSAT_SCORES.length).toFixed(1)+'  ★':'—';
  kpiCSAT.textContent=avg; kpiTMO.textContent=Math.round(Math.random()*60+25)+'s';
}

function refreshTicketList(){
  ticketList.innerHTML='';
  TICKETS_DB.slice(-5).reverse().forEach(function(t){
    var el=document.createElement('div'); el.className='ticket-item';
    el.innerHTML='<div class="t-id">'+t.id+'</div><div class="t-subject">'+t.subject+'</div><div class="t-status">'+t.status+' · '+t.time+'</div>';
    ticketList.appendChild(el);
  });
}

function addActivity(msg){
  if(!activityLog) return;
  var li=document.createElement('li'); li.textContent=timeNow()+' — '+msg;
  activityLog.insertBefore(li, activityLog.firstChild);
  if(activityLog.children.length>6) activityLog.removeChild(activityLog.lastChild);
}

function appendMsg(text, who){
  var div=document.createElement('div'); div.className='msg '+who;
  var bub=document.createElement('div'); bub.className='msg-bubble';
  bub.innerHTML=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  var meta=document.createElement('div'); meta.className='msg-meta';
  meta.textContent=timeNow()+(who==='agent'?' · Nova Soporte IA':' · Cliente');
  div.appendChild(bub); div.appendChild(meta); chatMessages.appendChild(div);
  chatMessages.scrollTop=chatMessages.scrollHeight;
}

function appendEscalated(){
  var div=document.createElement('div'); div.className='escalated-msg';
  div.innerHTML='⚠ <strong>Escalado a agente humano</strong> — Un ejecutivo en Santiago te contactará en 5-10 minutos.';
  chatMessages.appendChild(div); chatMessages.scrollTop=chatMessages.scrollHeight;
  TOTAL_ESCALATED++;
  if(currentClient){ currentClient.tickets.push({id:currentTicketId,subject:'Escalado a humano',status:'Escalado',ts:ts()}); dbUpsert(currentClient); }
  updateKPIs(); refreshTicketList();
  addActivity('Escalado a humano: '+currentTicketId);
}

function newClientRecord(){
  return { id:uid(), name:'Visitante '+uid().slice(0,4), company:'', phone:'', firstContact:ts(), lastContact:ts(), interactionCount:0, tickets:[], csatScores:[], chatHistory:[], status:'Activo' };
}

function startNewTicket(subject){
  chatOpen=true; awaitingCSAT=false;
  if(!currentClient){ currentClient=newClientRecord(); dbUpsert(currentClient); }
  currentTicketId='TKT-'+(++TICKET_COUNTER);
  ticketIdEl.textContent=currentTicketId+' · Abierto';
  chatMessages.innerHTML='';
  userInput.disabled=false; sendBtn.disabled=false; userInput.focus();
  TICKETS_DB.push({id:currentTicketId, subject:subject||'Consulta general', status:'Abierto', time:timeNow()});
  refreshTicketList(); addActivity('Nuevo ticket: '+currentTicketId);
  setTimeout(function(){ appendMsg('¡Hola! 👋 Soy **Nova**, asistente de soporte. Tu ticket **'+currentTicketId+'** fue creado. ¿Cuál es tu consulta?','agent'); }, 400);
}

function handleSend(){
  var text=userInput.value.trim(); if(!text) return;
  appendMsg(text,'user'); userInput.value='';
  if(!currentClient){ currentClient=newClientRecord(); }
  currentClient.lastContact=ts(); currentClient.interactionCount++;
  currentClient.chatHistory.push({role:'user',text:text,ts:ts()});

  if(awaitingCSAT){
    var score=parseInt(text);
    if(!isNaN(score)&&score>=1&&score<=5){
      CSAT_SCORES.push(score); currentClient.csatScores.push(score); awaitingCSAT=false;
      var r='¡Gracias por la valoración de **'+score+' ⭐**! Seguimos mejorando para ti. ¡Hasta pronto! 🙌';
      currentClient.chatHistory.push({role:'agent',text:r,ts:ts()}); dbUpsert(currentClient);
      setTimeout(function(){ appendMsg(r,'agent'); updateKPIs(); },600); return;
    }
  }

  var lower=text.toLowerCase(), matched=null;
  for(var i=0;i<SUPPORT_RESPONSES.length;i++){ if(matchAny(lower,SUPPORT_RESPONSES[i].keys)){ matched=SUPPORT_RESPONSES[i]; break; } }

  var delay=Math.random()*700+400;
  setTimeout(function(){
    var reply;
    if(matched){
      reply=matched.reply();
      if(matched.escalates) appendEscalated();
      if(matched.resolves){ TOTAL_RESOLVED++; if(matched.csat) CSAT_SCORES.push(matched.csat); currentClient.csatScores.push(matched.csat||4); }
      if(matched.asksCsat) awaitingCSAT=true;
    } else { reply=DEFAULT_REPLY; }
    appendMsg(reply,'agent');
    currentClient.chatHistory.push({role:'agent',text:reply,ts:ts()});
    dbUpsert(currentClient); updateKPIs(); refreshTicketList();
    addActivity('Respondido ticket '+currentTicketId);
  }, delay);
}

newTicketBtn.addEventListener('click', function(){ startNewTicket(); });
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', function(e){ if(e.key==='Enter') handleSend(); });
escalateBtn.addEventListener('click', function(){ if(!chatOpen) return; appendEscalated(); });

window.injectFAQ = function(text){ if(!chatOpen){ alert('Primero inicia un nuevo ticket.'); return; } userInput.value=text; userInput.focus(); };

/* ── TABS ──────────────────────────────────────────────────── */
function initTabs(){
  document.querySelectorAll('.stab').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.stab').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.style.display='none'; });
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).style.display='flex';
      if(btn.dataset.tab==='clientes') renderClientDB();
    });
  });
}

/* ── BASE DE CLIENTES ───────────────────────────────────────── */
function renderClientDB(){
  var container=document.getElementById('clientTable'); if(!container) return;
  var all=dbLoad();
  if(all.length===0){ container.innerHTML='<div class="empty-state">Sin registros. Inicia un ticket primero.</div>'; return; }
  container.innerHTML=[
    '<div class="db-toolbar">',
      '<input type="text" class="db-search" placeholder="Buscar..." oninput="filterClients(this.value)"/>',
      '<button onclick="exportCSV()" class="btn-export">⬇ CSV</button>',
    '</div>',
    '<div class="client-list" id="clientList"></div>'
  ].join('');
  renderClientList(all);
}

function renderClientList(records){
  var container=document.getElementById('clientList'); if(!container) return;
  container.innerHTML=records.map(function(c){
    var initials=(c.name||'?').split(' ').map(function(w){ return w[0]||''; }).join('').toUpperCase().slice(0,2);
    var avgCSAT=c.csatScores&&c.csatScores.length?(c.csatScores.reduce(function(a,b){return a+b;},0)/c.csatScores.length).toFixed(1)+' ★':'—';
    return [
      '<div class="client-card" onclick="showHistory(\''+c.id+'\')">',
        '<div class="cc-avatar" style="background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(123,44,191,.15));color:#00E5FF;">'+initials+'</div>',
        '<div class="cc-body">',
          '<div class="cc-top"><span class="cc-name">'+(c.name||'Visitante')+'</span><span class="cc-status" style="background:rgba(37,211,102,.15);color:#25D366;border-color:rgba(37,211,102,.3);">'+c.status+'</span></div>',
          '<div class="cc-company">'+(c.company||'Empresa no registrada')+'</div>',
          '<div class="cc-meta">',
            '<span>📅 '+fmtDate(c.firstContact)+'</span>',
            '<span>💬 '+c.interactionCount+' msgs</span>',
            '<span>🎫 '+(c.tickets?c.tickets.length:0)+' tickets</span>',
            '<span>⭐ CSAT '+avgCSAT+'</span>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }).join('');
}

window.filterClients=function(q){ q=q.toLowerCase(); renderClientList(dbLoad().filter(function(c){ return (c.name||'').toLowerCase().indexOf(q)!==-1; })); };

window.showHistory=function(id){
  var all=dbLoad(), c=null; for(var i=0;i<all.length;i++){ if(all[i].id===id){ c=all[i]; break; } } if(!c) return;
  var modal=document.getElementById('historyModal');
  document.getElementById('historyTitle').textContent=(c.name||'Visitante')+' · '+(c.tickets&&c.tickets.length?c.tickets.length+' tickets':'sin tickets');
  var content=document.getElementById('historyContent');
  content.innerHTML=(c.chatHistory||[]).map(function(msg){
    return '<div class="hist-msg '+(msg.role==='user'?'hist-user':'hist-agent')+'"><div class="hist-bubble">'+msg.text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</div><div class="hist-time">'+fmtDate(msg.ts)+(msg.role==='user'?' · Cliente':' · Nova IA')+'</div></div>';
  }).join('')||'<div class="empty-state">Sin historial.</div>';
  modal.style.display='flex';
};
window.closeHistory=function(){ document.getElementById('historyModal').style.display='none'; };

function exportCSV(){
  var records=dbLoad();
  var h=['Nombre','Estado','Primer Contacto','Último Contacto','Mensajes','Tickets','CSAT Promedio'];
  var rows=records.map(function(r){
    var avg=r.csatScores&&r.csatScores.length?(r.csatScores.reduce(function(a,b){return a+b;},0)/r.csatScores.length).toFixed(1):'N/A';
    return [r.name||'Visitante',r.status,r.firstContact,r.lastContact,r.interactionCount,r.tickets?r.tickets.length:0,avg]
      .map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  var csv=[h.join(',')].concat(rows).join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='clientes_atencion_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
}

/* ── SEED ──────────────────────────────────────────────────── */
(function(){
  if(dbLoad().length===0){
    var seed=[
      {id:uid(),name:'Carolina Vidal',company:'RetailSur',phone:'+56987654321',firstContact:new Date(Date.now()-86400000*3).toISOString(),lastContact:new Date(Date.now()-3600000).toISOString(),interactionCount:5,tickets:[{id:'TKT-997',subject:'Devolución producto',status:'Resuelto'},{id:'TKT-998',subject:'Estado envío',status:'Resuelto'}],csatScores:[5,4],chatHistory:[{role:'user',text:'¿Cuánto tarda la devolución?',ts:ts()},{role:'agent',text:'Tienes 30 días desde la compra.',ts:ts()}],status:'Activo'},
      {id:uid(),name:'Marco Fuentes',company:'ContaFast',phone:'',firstContact:new Date(Date.now()-86400000).toISOString(),lastContact:new Date(Date.now()-7200000).toISOString(),interactionCount:2,tickets:[{id:'TKT-999',subject:'Problema factura SII',status:'Escalado'}],csatScores:[3],chatHistory:[{role:'user',text:'Tengo problema con mi boleta',ts:ts()}],status:'Escalado'},
    ];
    dbSave(seed); TOTAL_RESOLVED=47; TOTAL_ESCALATED=3;
  } else { TOTAL_RESOLVED=47; TOTAL_ESCALATED=3; }
  CSAT_SCORES=[5,4,5,5,4,5,3,5,4,5]; TICKETS_DB=[
    {id:'TKT-1000',subject:'Tracking envío pendiente',status:'Resuelto',time:'10:34'},
    {id:'TKT-999',subject:'Problema facturación SII',status:'Escalado',time:'09:58'},
    {id:'TKT-998',subject:'Consulta horario',status:'Resuelto',time:'09:12'},
  ];
  updateKPIs(); refreshTicketList(); initTabs();
  addActivity('Sistema cargado — Base de clientes activa');
})();


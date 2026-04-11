/* ── AGENTE VENTAS DASHBOARD v2 — app.js ──────────────────────
   Agrega: Base de Clientes, tabs, localStorage persistente.
─────────────────────────────────────────────────────────── */

/* ── STORAGE (Ley N°21.663: solo localStorage) ─────────────── */
var STORAGE_KEY = 'AigenciaLab_ventas_clientes';
function dbLoad() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; } }
function dbSave(r)  { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch(e) {} }
function dbUpsert(lead) {
  var all = dbLoad(), idx = -1;
  for (var i = 0; i < all.length; i++) { if (all[i].id === lead.id) { idx = i; break; } }
  if (idx >= 0) all[idx] = lead; else all.unshift(lead);
  dbSave(all);
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
function ts()  { return new Date().toISOString(); }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString('es-CL', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'; }

/* ── DATOS ─────────────────────────────────────────────────── */
var LEADS_DB    = [];
var MEETINGS    = 0;
var CONVERSIONS = 0;

var FAKE_NAMES = ['Carlos Muñoz','María González','Felipe Rojas','Andrea Torres','Diego López','Valentina Pérez','Rodrigo Soto','Javiera Morales','Sebastián Vargas','Camila Fuentes'];
var COMPANIES  = ['ClinicaPro SpA','Transportes Andino','Retail Sur Ltda','ContaFast SpA','InmobiliariaVerde','LogiChile SA','SaludMás','AgriSur SA'];

/* ── FLUJO DE CONVERSACIÓN ──────────────────────────────────── */
function matchAny(str, keys) { return keys.some(function(k){ return str.indexOf(k) !== -1; }); }
function extractNumber(str) { var m = str.match(/\d+/); return m ? parseInt(m[0]) : null; }
function timeNow() { return new Date().toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' }); }

var FLOW = [
  {
    step:1,
    agent: function(lead, msg) {
      var lower = msg.toLowerCase();
      if (matchAny(lower,['precio','cuánto','costo','valor'])) {
        lead.score+=30; lead.status='Caliente'; lead.tags.push('Consultó precio');
        return '📊 Nuestros planes parten desde **UF 12/mes** todo incluido. ¿Cuántas personas atienden clientes en tu empresa?';
      }
      if (matchAny(lower,['demo','ver','mostrar','interesa'])) {
        lead.score+=20; lead.tags.push('Solicitó demo');
        return '🚀 ¡Con gusto! Agendamos una demo de 30 min para tu rubro. ¿Cuál es el nombre de tu empresa y a qué se dedican?';
      }
      if (matchAny(lower,['whatsapp','wsp','bot'])) {
        lead.score+=15; lead.tags.push('Interés WhatsApp');
        return '💬 ¡La integración WhatsApp es nuestra estrella! Usa API Oficial de Meta. ¿Para cuántos ejecutivos la necesitas?';
      }
      lead.score+=5;
      return '¡Gracias por contactarnos! Para orientarte mejor, ¿en qué área quieres usar IA? (ventas / atención / procesos internos)';
    }, nextStep:2
  },
  {
    step:2,
    agent: function(lead, msg) {
      var n = extractNumber(msg);
      if (n) {
        lead.score+=20; if(n>=5) lead.score+=15; lead.tags.push('Equipo: '+n);
        return 'Con '+n+' persona(s), el ROI esperado es **250-400%** en 6 meses. 📈\n¿Te agendo una **Auditoría Gratuita** de 45 min para mostrarte exactamente qué automatizamos?';
      }
      return 'Interesante. ¿Me puedes contar más sobre tu empresa? ¿A qué rubro pertenecen?';
    }, nextStep:3
  },
  {
    step:3,
    agent: function(lead, msg) {
      var lower = msg.toLowerCase();
      if (matchAny(lower,['sí','si','dale','claro','ok','quiero','agenda'])) {
        lead.score=95; lead.status='Convertido'; lead.reunionAgendada=true; lead.tags.push('Auditoría agendada');
        MEETINGS++; CONVERSIONS++;
        return '🎉 ¡Excelente! Tu **Auditoría Gratuita** fue registrada.\n\n📅 Un consultor de Santiago te contactará en las próximas 2 horas. ¡Hasta pronto! 🤝';
      }
      return '¡No hay problema! ¿Hay alguna duda más que pueda resolver hoy sobre nuestros agentes de IA?';
    }, nextStep:3
  }
];
var currentLead = null, currentStep = 0;

/* ── TABS ──────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.stab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.stab').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.style.display='none'; });
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).style.display='flex';
      if (btn.dataset.tab === 'clientes') renderClientDB();
    });
  });
}

/* ── BASE DE CLIENTES ───────────────────────────────────────── */
function renderClientDB() {
  var container = document.getElementById('clientTable');
  if (!container) return;
  var all = dbLoad();
  if (all.length === 0) {
    container.innerHTML = '<div class="empty-state">Sin registros aún. Inicia una conversación con "+ Nuevo Lead".</div>';
    return;
  }
  container.innerHTML = [
    '<div class="db-toolbar">',
      '<input type="text" id="clientSearch" placeholder="Buscar por nombre, empresa..." oninput="filterClients(this.value)" class="db-search"/>',
      '<button onclick="exportCSV()" class="btn-export">⬇ Exportar CSV</button>',
    '</div>',
    '<div class="client-list" id="clientList"></div>'
  ].join('');
  renderClientList(all);
}

function renderClientList(records) {
  var container = document.getElementById('clientList');
  if (!container) return;
  container.innerHTML = records.map(function(c) {
    var initials = (c.name||'?').split(' ').map(function(w){ return w[0]||''; }).join('').toUpperCase().slice(0,2);
    var statusColor = { 'Convertido':'#25D366', 'Caliente':'#ff6b6b', 'Tibio':'#FFB347', 'Nuevo':'#00E5FF' }[c.status] || '#A9B0BB';
    return [
      '<div class="client-card" onclick="showHistory(\''+c.id+'\')">',
        '<div class="cc-avatar" style="background:linear-gradient(135deg,rgba(0,229,255,.2),rgba(123,44,191,.2));color:#00E5FF;">'+initials+'</div>',
        '<div class="cc-body">',
          '<div class="cc-top">',
            '<span class="cc-name">'+c.name+'</span>',
            '<span class="cc-status" style="background:'+statusColor+'22;color:'+statusColor+';border-color:'+statusColor+'44;">'+c.status+'</span>',
          '</div>',
          '<div class="cc-company">'+( c.company||'Empresa no registrada')+'</div>',
          '<div class="cc-meta">',
            '<span>📅 Primer contacto: '+fmtDate(c.firstContact)+'</span>',
            '<span>🕐 Último: '+fmtDate(c.lastContact)+'</span>',
          '</div>',
          '<div class="cc-meta">',
            '<span>💬 '+c.interactionCount+' interacciones</span>',
            '<span>⭐ Puntaje: '+c.score+'</span>',
            (c.tags&&c.tags.length?'<span>🏷 '+c.tags.slice(0,2).join(', ')+'</span>':''),
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }).join('');
}

window.filterClients = function(query) {
  var q = query.toLowerCase();
  var filtered = dbLoad().filter(function(c){
    return c.name.toLowerCase().indexOf(q)!==-1 || (c.company||'').toLowerCase().indexOf(q)!==-1;
  });
  renderClientList(filtered);
};

window.showHistory = function(id) {
  var all = dbLoad(), lead = null;
  for(var i=0;i<all.length;i++){ if(all[i].id===id){ lead=all[i]; break; } }
  if(!lead) return;
  var modal = document.getElementById('historyModal');
  var content = document.getElementById('historyContent');
  document.getElementById('historyTitle').textContent = lead.name + ' · ' + (lead.company||'Sin empresa');
  content.innerHTML = (lead.chatHistory||[]).map(function(msg){
    var isUser = msg.role === 'user';
    return '<div class="hist-msg '+(isUser?'hist-user':'hist-agent')+'">'+
      '<div class="hist-bubble">'+msg.text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')+'</div>'+
      '<div class="hist-time">'+fmtDate(msg.ts)+(isUser?' · Cliente':' · Agente IA')+'</div>'+
    '</div>';
  }).join('') || '<div style="color:#A9B0BB;text-align:center;padding:20px;">Sin historial de chat disponible.</div>';
  modal.style.display = 'flex';
};

window.closeHistory = function() { document.getElementById('historyModal').style.display = 'none'; };

function exportCSV() {
  var records = dbLoad();
  var h = ['Nombre','Empresa','Estado','Puntaje','Primer Contacto','Último Contacto','Interacciones','Tags','Reunión Agendada'];
  var rows = records.map(function(r){
    return [r.name,r.company||'',r.status,r.score,r.firstContact,r.lastContact,r.interactionCount,(r.tags||[]).join('|'),r.reunionAgendada?'Sí':'No']
      .map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  var csv = [h.join(',')].concat(rows).join('\n');
  var blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'base_clientes_ventas_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
}

/* ── KPIs ──────────────────────────────────────────────────── */
var kpiLeads    = document.getElementById('kpiLeads');
var kpiConv     = document.getElementById('kpiConv');
var kpiResp     = document.getElementById('kpiResp');
var kpiMeet     = document.getElementById('kpiMeet');
var leadsBody   = document.getElementById('leadsBody');
var activityLog = document.getElementById('activityLog');
var contactName = document.getElementById('contactName');
var chatMessages= document.getElementById('chatMessages');
var userInput   = document.getElementById('userInput');
var sendBtn     = document.getElementById('sendBtn');
var newLeadBtn  = document.getElementById('newLeadBtn');

function updateKPIs() {
  LEADS_DB = dbLoad();
  kpiLeads.textContent = LEADS_DB.length;
  var conv = LEADS_DB.length > 0 ? Math.round((CONVERSIONS / LEADS_DB.length) * 100) : 0;
  kpiConv.textContent = conv + '%';
  kpiResp.textContent = (Math.random()*1+0.3).toFixed(1)+'s';
  kpiMeet.textContent = MEETINGS;
}

function formatScore(s, status) {
  var colors = { 'Convertido':'#25D366','Caliente':'#ff6b6b','Tibio':'#FFB347','Nuevo':'#00E5FF' };
  var c = colors[status] || '#A9B0BB';
  return '<span class="badge" style="background:'+c+'22;color:'+c+';border:1px solid '+c+'44;">'+status+' '+s+'</span>';
}

function refreshLeadsTable() {
  leadsBody.innerHTML = '';
  var show = dbLoad().slice(0,8);
  show.forEach(function(l){
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>'+l.firstName+'</td><td>'+formatScore(l.score, l.status)+'</td><td>'+l.score+'</td>';
    leadsBody.appendChild(tr);
  });
}

function addActivity(msg) {
  var li = document.createElement('li');
  li.textContent = timeNow()+' — '+msg;
  activityLog.insertBefore(li, activityLog.firstChild);
  if (activityLog.children.length > 8) activityLog.removeChild(activityLog.lastChild);
}

function appendMsg(text, who) {
  var wrap = document.createElement('div'); wrap.className = 'msg '+who;
  var bubble = document.createElement('div'); bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  var meta = document.createElement('div'); meta.className = 'msg-meta';
  meta.textContent = timeNow()+(who==='agent'?' · Agente IA':' · Cliente');
  wrap.appendChild(bubble); wrap.appendChild(meta); chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ── NUEVA SESIÓN ───────────────────────────────────────────── */
newLeadBtn.addEventListener('click', function() {
  var rnd = Math.floor(Math.random() * FAKE_NAMES.length);
  var parts = FAKE_NAMES[rnd].split(' ');
  currentLead = {
    id: uid(), name: FAKE_NAMES[rnd], firstName: parts[0],
    company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
    score: 10, status: 'Nuevo', reunionAgendada: false, tags: [],
    chatHistory: [], firstContact: ts(), lastContact: ts(), interactionCount: 0, phone: ''
  };
  dbUpsert(currentLead);
  LEADS_DB = dbLoad();
  currentStep = 0;
  chatMessages.innerHTML = '';
  contactName.textContent = currentLead.name + ' · ' + currentLead.company;
  userInput.disabled = false; sendBtn.disabled = false; userInput.focus();
  addActivity('Nuevo lead: '+currentLead.name);
  updateKPIs(); refreshLeadsTable();
  setTimeout(function(){
    appendMsg('¡Hola, '+currentLead.firstName+'! 👋 Soy el asistente IA de AigenciaLab.cl. ¿En qué puedo ayudarte hoy?', 'agent');
    currentStep = 1;
  }, 500);
});

/* ── ENVÍO DE MENSAJE ───────────────────────────────────────── */
function handleSend() {
  var text = userInput.value.trim(); if (!text || !currentLead) return;
  appendMsg(text, 'user'); userInput.value = '';
  currentLead.interactionCount++;
  currentLead.lastContact = ts();
  currentLead.chatHistory.push({ role:'user', text:text, ts:ts() });

  var step = null;
  for (var i=0;i<FLOW.length;i++){ if(FLOW[i].step===currentStep){ step=FLOW[i]; break; } }
  var delay = Math.random()*700+400;
  setTimeout(function() {
    var reply = step ? step.agent(currentLead, text) : '¿Hay algo más en lo que te pueda ayudar? 😊';
    if (step) currentStep = step.nextStep;
    currentLead.chatHistory.push({ role:'agent', text:reply, ts:ts() });
    appendMsg(reply, 'agent');
    dbUpsert(currentLead);
    refreshLeadsTable(); updateKPIs();
    addActivity(currentLead.firstName+': '+text.substring(0,30)+'…');
    if (currentLead.status==='Convertido') CONVERSIONS++;
  }, delay);
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', function(e){ if(e.key==='Enter') handleSend(); });

/* ── SEED HISTÓRICO ─────────────────────────────────────────── */
(function seed() {
  if (dbLoad().length === 0) {
    var seed = [
      { id:uid(), name:'Roberto Palma', firstName:'Roberto', company:'LogiChile SA', score:90, status:'Convertido', reunionAgendada:true, tags:['Auditoría agendada'], chatHistory:[{role:'user',text:'Quiero ver el precio',ts:ts()},{role:'agent',text:'Nuestros planes desde UF 12/mes...',ts:ts()}], firstContact:new Date(Date.now()-86400000*2).toISOString(), lastContact:new Date(Date.now()-3600000).toISOString(), interactionCount:4, phone:'+56912345678' },
      { id:uid(), name:'Paola Sáez',    firstName:'Paola',   company:'SaludMás SpA', score:65, status:'Caliente', reunionAgendada:false, tags:['Interés WhatsApp','Consultó precio'], chatHistory:[{role:'user',text:'Me interesa el bot de whatsapp',ts:ts()}], firstContact:new Date(Date.now()-86400000).toISOString(), lastContact:new Date(Date.now()-7200000).toISOString(), interactionCount:2, phone:'' },
      { id:uid(), name:'Andrés Vega',   firstName:'Andrés',  company:'AgriSur SA',   score:40, status:'Tibio', reunionAgendada:false, tags:['Solicitó demo'], chatHistory:[{role:'user',text:'Cómo funciona la demo?',ts:ts()}], firstContact:new Date(Date.now()-86400000*3).toISOString(), lastContact:new Date(Date.now()-86400000).toISOString(), interactionCount:1, phone:'' },
    ];
    dbSave(seed); CONVERSIONS=1; MEETINGS=1;
  } else {
    var all = dbLoad();
    CONVERSIONS = all.filter(function(l){ return l.status==='Convertido'; }).length;
    MEETINGS = all.filter(function(l){ return l.reunionAgendada; }).length;
  }
  updateKPIs(); refreshLeadsTable();
  addActivity('Sistema cargado — Base de clientes activa');
  initTabs();
})();


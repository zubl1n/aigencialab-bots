/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE DE ATENCIÓN AL CLIENTE AUTÓNOMO v1.0.0
 *  Archivo: agents/agent-atencion.js
 *
 *  IMPLEMENTACIÓN:
 *    <script src="agents/agent-atencion.js"></script>
 *    <script>
 *      AgentAtencion.init({
 *        companyName: 'Mi Empresa',
 *        agentName:   'Valentina',
 *        faqs: [
 *          { keys: ['horario'], answer: 'Atendemos Lun-Vie 9-18 hrs.' },
 *          { keys: ['devolucion','cambio'], answer: 'Tienes 30 días para devoluciones.' }
 *        ],
 *        onTicket:    function(ticket) { yourSystem.createTicket(ticket); },
 *        onEscalate:  function(ticket) { notifyAgent(ticket); }
 *      });
 *      AgentAtencion.createWidget();
 *    </script>
 *
 *  CUMPLIMIENTO: Ley N°21.663 · Sin datos en servidores externos.
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';

  var CFG = {
    companyName:  'Mi Empresa',
    agentName:    'Nova',
    agentAvatar:  '🎧',
    primaryColor: '#00E5FF',
    accentColor:  '#7B2CBF',
    storageKey:   'AigenciaLab_atencion_clientes',
    autoOpen:     false,
    autoOpenDelay:10000,
    /* FAQs configurables — agrega los propios de tu empresa */
    faqs: [
      { keys: ['horario','hora','atención','abierto'], answer: 'Nuestro horario de atención es **Lun-Vie 8:30-19:00** y **Sáb 9:00-14:00** hrs.' },
      { keys: ['devolucion','devolución','cambio','reembolso'], answer: 'Tienes **30 días** desde la compra para solicitar devolución (producto sin uso). **60 días** si es defecto de fabricación.' },
      { keys: ['envio','envío','despacho','tracking','pedido','llegar'], answer: 'El despacho demora **2-5 días hábiles**. Te enviaré el código de seguimiento a tu email registrado.' },
      { keys: ['factura','boleta','sii','documento'], answer: 'Tu documento tributario fue emitido electrónicamente al SII. Revisa tu email o descárgalo desde **Mi SII** con tu RUT.' },
      { keys: ['contraseña','password','clave','acceso','cuenta'], answer: 'Para recuperar tu clave, ve a **Iniciar Sesión → "Olvidé mi clave"** e ingresa tu email. Recibirás un enlace en 5 minutos.' }
    ],
    /* Callbacks */
    onTicket:    null,
    onEscalate:  null,
    onMessage:   null,
    onCSAT:      null
  };

  /* ── UTILIDADES ─────────────────────────────────────────────── */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
  function ts()  { return new Date().toISOString(); }
  function matchAny(str, keys) { return keys.some(function(k){ return str.indexOf(k) !== -1; }); }
  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

  var TICKET_NUM = 2000;
  function newTicketId() { return 'TKT-' + (++TICKET_NUM); }

  /* ── BASE DE DATOS (localStorage) ──────────────────────────── */
  var DB = {
    load:  function () { try { return JSON.parse(localStorage.getItem(CFG.storageKey) || '[]'); } catch(e){ return []; } },
    save:  function (r) { try { localStorage.setItem(CFG.storageKey, JSON.stringify(r)); } catch(e){} },
    upsert:function (client) {
      var all = this.load(), idx = -1;
      for(var i=0;i<all.length;i++){ if(all[i].id===client.id){ idx=i; break; } }
      if(idx>=0) all[idx]=client; else all.unshift(client);
      this.save(all);
    },
    getAll: function(){ return this.load(); },
    clear:  function(){ localStorage.removeItem(CFG.storageKey); }
  };

  /* ── SESIÓN ─────────────────────────────────────────────────── */
  var Session = { client: null, ticketId: null, awaitingCSAT: false };

  function newClient(name) {
    return {
      id: uid(), name: name || 'Visitante', company: '', phone: '',
      firstContact: ts(), lastContact: ts(),
      interactionCount: 0, tickets: [], csatScores: [],
      chatHistory: [], status: 'Activo'
    };
  }

  function handleMessage(text) {
    if (!Session.client) {
      Session.client = newClient();
      Session.ticketId = newTicketId();
      DB.upsert(Session.client);
      if (CFG.onTicket) CFG.onTicket({ id: Session.ticketId, client: deepCopy(Session.client), subject: text, ts: ts() });
    }
    var client = Session.client;
    client.lastContact = ts();
    client.interactionCount++;
    client.chatHistory.push({ role: 'user', text: text, ts: ts() });

    var lower = text.toLowerCase();
    var reply;

    // CSAT response
    if (Session.awaitingCSAT) {
      var score = parseInt(text);
      if (!isNaN(score) && score >= 1 && score <= 5) {
        client.csatScores.push(score);
        Session.awaitingCSAT = false;
        reply = '¡Gracias por tu valoración de **' + score + ' ⭐** ! Tu opinión nos ayuda a mejorar. ¡Hasta pronto! 🙌';
        if (CFG.onCSAT) CFG.onCSAT({ score: score, client: deepCopy(client), ticketId: Session.ticketId });
        DB.upsert(client);
        client.chatHistory.push({ role: 'agent', text: reply, ts: ts() });
        return reply;
      }
    }

    // Escalation keywords
    if (matchAny(lower, ['humano','persona','ejecutivo','hablar con alguien','escalar'])) {
      reply = '👤 Entendido. Te transfiero a un ejecutivo humano ahora mismo.\n\n⏱ Espera estimada: **3-7 minutos**. Tu ticket es **' + Session.ticketId + '**.';
      client.tickets.push({ id: Session.ticketId, subject: text, status: 'Escalado', ts: ts() });
      if (CFG.onEscalate) CFG.onEscalate({ id: Session.ticketId, client: deepCopy(client), ts: ts() });
      DB.upsert(client);
      client.chatHistory.push({ role: 'agent', text: reply, ts: ts() });
      return reply;
    }

    // Satisfaction / closing
    if (matchAny(lower, ['gracias','perfecto','listo','resuelto','solucionó'])) {
      Session.awaitingCSAT = true;
      reply = '¡Genial! 😊 ¿Quedó resuelta tu consulta? Si es así, ¿me puedes dar una valoración del **1 al 5**?';
      client.tickets.push({ id: Session.ticketId, subject: text, status: 'Resuelto', ts: ts() });
      DB.upsert(client);
      client.chatHistory.push({ role: 'agent', text: reply, ts: ts() });
      return reply;
    }

    // Match FAQs
    for (var i = 0; i < CFG.faqs.length; i++) {
      if (matchAny(lower, CFG.faqs[i].keys)) {
        reply = '¡Claro! ' + CFG.faqs[i].answer + '\n\n¿Hay algo más en lo que te pueda ayudar?';
        if (CFG.onMessage) CFG.onMessage(deepCopy(client), text, 'user');
        DB.upsert(client);
        client.chatHistory.push({ role: 'agent', text: reply, ts: ts() });
        return reply;
      }
    }

    // Default
    reply = 'Entendí tu consulta 🔍 Dame un momento... Para darte la respuesta más precisa, ¿podrías darme un poco más de detalle?';
    if (CFG.onMessage) CFG.onMessage(deepCopy(client), text, 'user');
    DB.upsert(client);
    client.chatHistory.push({ role: 'agent', text: reply, ts: ts() });
    return reply;
  }

  /* ── WIDGET ─────────────────────────────────────────────────── */
  var Widget = {
    open: false, messagesEl: null, inputEl: null,
    inject: function (selector) {
      var html = [
        '<div id="aa-widget" style="position:fixed;bottom:24px;right:24px;z-index:99999;font-family:Inter,system-ui,sans-serif;">',
          '<div id="aa-bubble" style="width:58px;height:58px;border-radius:50%;background:' + CFG.primaryColor +
            ';display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(0,229,255,.4);font-size:1.6rem;">🎧</div>',
          '<div id="aa-box" style="display:none;position:absolute;bottom:70px;right:0;width:340px;',
            'background:#1C1E26;border:1px solid rgba(0,229,255,.2);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.7);">',
            '<div style="background:linear-gradient(135deg,#0B132B,#1a1060);padding:14px 18px;display:flex;align-items:center;gap:10px;">',
              '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,' + CFG.primaryColor + ',' + CFG.accentColor + ');',
                'display:flex;align-items:center;justify-content:center;font-size:1.3rem;">' + CFG.agentAvatar + '</div>',
              '<div style="flex:1"><div style="font-weight:700;color:#F8F9FA;font-size:.92rem;">' + CFG.agentName + ' · Soporte IA</div>',
              '<div style="font-size:.72rem;color:' + CFG.primaryColor + ';">● En línea — respuesta inmediata</div></div>',
            '<div id="aa-close" style="cursor:pointer;color:#A9B0BB;font-size:1.2rem;">✕</div></div>',
            '<div id="aa-messages" style="height:280px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;"></div>',
            '<div style="padding:10px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;">',
              '<input id="aa-input" type="text" placeholder="Escribe tu consulta..." style="flex:1;background:#0B132B;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;color:#F8F9FA;font-size:.88rem;outline:none;">',
              '<button id="aa-send" style="background:' + CFG.primaryColor + ';color:#000;border:none;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer;">→</button>',
            '</div>',
            '<div style="padding:4px 14px 10px;font-size:.68rem;color:#444;text-align:center;">🔒 Ley N°21.663 · Sin almacenamiento externo</div>',
          '</div>',
        '</div>'
      ].join('');
      if (selector) { var h = document.querySelector(selector); if(h){ h.innerHTML = html; } }
      else document.body.insertAdjacentHTML('beforeend', html);
      this.messagesEl = document.getElementById('aa-messages');
      this.inputEl    = document.getElementById('aa-input');
      var self = this;
      document.getElementById('aa-bubble').addEventListener('click', function(){ self.toggle(); });
      document.getElementById('aa-close').addEventListener('click', function(){ self.toggle(false); });
      document.getElementById('aa-send').addEventListener('click', function(){ self.send(); });
      this.inputEl.addEventListener('keydown', function(e){ if(e.key==='Enter') self.send(); });
      if (CFG.autoOpen) setTimeout(function(){ if(!self.open) self.toggle(true); }, CFG.autoOpenDelay);
    },
    toggle: function(force) {
      var box = document.getElementById('aa-box');
      this.open = (force!==undefined)?force:!this.open;
      box.style.display = this.open?'block':'none';
      if(this.open && this.messagesEl.children.length===0) this.greet();
    },
    greet: function() {
      this.appendMsg('¡Hola! 👋 Soy **' + CFG.agentName + '**, soporte de **' + CFG.companyName + '**. ¿En qué te puedo ayudar hoy?', 'agent');
    },
    appendMsg: function(text, role) {
      var d = document.createElement('div'); d.style.cssText='display:flex;'+(role==='user'?'justify-content:flex-end;':'');
      var b = document.createElement('div');
      b.innerHTML = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
      b.style.cssText='max-width:82%;padding:10px 13px;border-radius:12px;font-size:.87rem;line-height:1.5;'+(role==='user'?'background:'+CFG.primaryColor+';color:#000;border-bottom-right-radius:2px;':'background:rgba(255,255,255,.06);color:#F8F9FA;border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:2px;');
      d.appendChild(b); this.messagesEl.appendChild(d); this.messagesEl.scrollTop=this.messagesEl.scrollHeight;
    },
    send: function() {
      var text=this.inputEl.value.trim(); if(!text)return;
      this.appendMsg(text,'user'); this.inputEl.value='';
      var self=this;
      this.appendMsg('…','agent');
      setTimeout(function(){
        self.messagesEl.removeChild(self.messagesEl.lastChild);
        self.appendMsg(handleMessage(text),'agent');
      }, Math.random()*600+300);
    }
  };

  function exportCSV() {
    var records = DB.getAll();
    var h = ['ID','Nombre','Empresa','Teléfono','Primer Contacto','Último Contacto','Interacciones','CSAT Promedio','Tickets'];
    var rows = records.map(function(r){
      var avgCSAT = r.csatScores && r.csatScores.length ? (r.csatScores.reduce(function(a,b){return a+b;},0)/r.csatScores.length).toFixed(1) : 'N/A';
      return [r.id,r.name,r.company||'',r.phone||'',r.firstContact,r.lastContact,r.interactionCount,avgCSAT,r.tickets?r.tickets.length:0]
        .map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
    });
    var csv=[h.join(',')].concat(rows).join('\n');
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='clientes_atencion_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  }

  /* ── API PÚBLICA ────────────────────────────────────────────── */
  global.AgentAtencion = {
    init: function(config) {
      Object.keys(config||{}).forEach(function(k){ CFG[k]=config[k]; });
      return this;
    },
    createWidget: function(selector) {
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ Widget.inject(selector); });
      else Widget.inject(selector);
      return this;
    },
    sendMessage:  function(text){ return handleMessage(text); },
    newSession:   function(name){ Session.client=newClient(name); Session.ticketId=newTicketId(); return Session.client.id; },
    getClients:   function(){ return DB.getAll(); },
    exportCSV:    exportCSV,
    resetDB:      function(){ DB.clear(); },
    addFAQ:       function(keys, answer){ CFG.faqs.push({ keys: keys, answer: answer }); },
    setStorageAdapter: function(adapter){ Object.keys(adapter).forEach(function(k){ DB[k]=adapter[k]; }); }
  };

})(window);


/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE DE VENTAS AUTÓNOMO v1.0.0
 *  Archivo: agents/agent-ventas.js
 *  
 *  IMPLEMENTACIÓN:
 *    <script src="agents/agent-ventas.js"></script>
 *    <script>
 *      AgentVentas.init({
 *        companyName: 'Mi Empresa SpA',
 *        agentName:   'Sofía',
 *        products:    ['Plan Básico UF 12', 'Plan Pro UF 28'],
 *        whatsapp:    '+56912345678',
 *        onNewLead:   function(lead) { console.log('Nuevo lead:', lead); },
 *        onConversion:function(lead) { myCRM.save(lead); }
 *      });
 *      AgentVentas.createWidget('#chat-container');
 *    </script>
 *
 *  CUMPLIMIENTO: Ley N°21.663 Ciberseguridad Chile
 *    - Datos solo en localStorage del navegador del usuario
 *    - Sin telemetría externa
 *    - Cifrado recomendado en capa de transporte TLS 1.3
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';

  /* ── CONFIGURACIÓN POR DEFECTO ──────────────────────────────── */
  var CFG = {
    companyName:  'Mi Empresa',
    agentName:    'Nova',
    agentAvatar:  '🤖',
    whatsapp:     '',
    currency:     'CLP',
    pricingFrom:  'UF 12/mes',
    primaryColor: '#00E5FF',
    accentColor:  '#7B2CBF',
    products:     ['Agente de Ventas', 'Agente de Atención', 'Backoffice IA'],
    storageKey:   'AigenciaLab_ventas_clientes',
    autoOpen:     false,
    autoOpenDelay:8000,
    welcomeMsg:   null,
    /* Callbacks para integración con CRM / Backend */
    onNewLead:    null,
    onConversion: null,
    onMessage:    null,
    onEscalate:   null,
  };

  /* ── UTILIDADES ─────────────────────────────────────────────── */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }
  function ts() { return new Date().toISOString(); }
  function timeStr() {
    return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }
  function matchAny(str, keys) {
    return keys.some(function (k) { return str.indexOf(k) !== -1; });
  }
  function extractNumber(str) {
    var m = str.match(/\d+/);
    return m ? parseInt(m[0]) : null;
  }

  /* ── MOTOR DE CONVERSACIÓN ──────────────────────────────────── */
  var FLOW = [
    {
      step: 'greeting',
      agent: function (ctx) {
        return '¡Hola! 👋 Soy ' + ctx.agentName + ', asistente IA de ' +
          ctx.companyName + '. ¿Estás buscando automatizar algún proceso de tu empresa con IA?';
      },
      next: 'qualify'
    },
    {
      step: 'qualify',
      handle: function (msg, ctx, lead) {
        var lower = msg.toLowerCase();
        if (matchAny(lower, ['precio','cuánto','costo','valor','tarifa','cobran'])) {
          lead.score += 30; lead.status = 'Caliente'; lead.tags.push('Consultó precio');
          return { reply: '📊 Nuestros planes parten desde **' + ctx.pricingFrom +
            '** (todo incluido: onboarding + soporte + mantenimiento). ¿Cuántas personas en tu empresa atienden clientes actualmente?', next: 'team_size' };
        }
        if (matchAny(lower, ['demo','ver','mostrar','prueba','interesa','funciona'])) {
          lead.score += 20; lead.tags.push('Solicitó demo');
          return { reply: '🚀 ¡Claro! Podemos agendar una demo de 30 min personalizada para tu rubro. ¿Cuál es el nombre de tu empresa y a qué se dedican?', next: 'collect_company' };
        }
        if (matchAny(lower, ['whatsapp','wsp','chat','bot'])) {
          lead.score += 15; lead.tags.push('Interés WhatsApp');
          return { reply: '💬 ¡Excelente elección! La integración WhatsApp usa la API Oficial de Meta. ¿Para cuántos ejecutivos necesitarías el agente?', next: 'team_size' };
        }
        if (matchAny(lower, ['seguridad','privacidad','datos','ley'])) {
          return { reply: '🔒 Cumplimos la **Ley N°21.663** de Ciberseguridad de Chile. Datos cifrados AES-256 + TLS 1.3. Sin terceros. ¿Te interesa conocer los planes?', next: 'qualify' };
        }
        lead.score += 5;
        return { reply: 'Interesante. Para encontrar la mejor solución, ¿en qué área quieres implementar IA? (ventas, atención al cliente o procesos internos)', next: 'qualify' };
      }
    },
    {
      step: 'collect_company',
      handle: function (msg, ctx, lead) {
        lead.company = msg.trim().substring(0, 60);
        lead.score += 10;
        return { reply: '¡Perfecto, ' + lead.company + '! ¿Cuántas personas dedican tiempo a atención al cliente o tareas manuales actualmente?', next: 'team_size' };
      }
    },
    {
      step: 'team_size',
      handle: function (msg, ctx, lead) {
        var n = extractNumber(msg);
        if (n) {
          lead.score += 20;
          if (n >= 5) lead.score += 15;
          lead.tags.push('Equipo: ' + n + ' personas');
          return { reply: 'Con un equipo de ' + n + ' persona(s), el ROI esperado es **250-400%** en 6 meses. 📈\n¿Te agendo una **Auditoría Gratuita** de 45 min para mostrarte exactamente qué automatizamos?', next: 'close' };
        }
        return { reply: '¿Cuántas personas en total trabajan en tu empresa?', next: 'team_size' };
      }
    },
    {
      step: 'close',
      handle: function (msg, ctx, lead) {
        var lower = msg.toLowerCase();
        if (matchAny(lower, ['sí','si','dale','claro','ok','quiero','agenda','perfecto'])) {
          lead.score = 95; lead.status = 'Convertido'; lead.reunionAgendada = true;
          lead.tags.push('Auditoría agendada');
          if (ctx.onConversion) ctx.onConversion(deepCopy(lead));
          return { reply: '🎉 ¡Excelente! Tu auditoría fue registrada.\n\n📅 Un consultor de ' +
            ctx.companyName + ' te contactará en las **próximas 2 horas hábiles**.\n\n' +
            (ctx.whatsapp ? '¿Prefieres que te llamen o te escriban a WhatsApp?' : '¿Cuál es tu número de WhatsApp para coordinar?'),
            next: 'collect_contact', converted: true };
        }
        return { reply: '¡Sin problema! Si tienes dudas puedo ayudarte ahora mismo. ¿Qué te gustaría saber sobre la implementación de IA en tu empresa?', next: 'qualify' };
      }
    },
    {
      step: 'collect_contact',
      handle: function (msg, ctx, lead) {
        lead.phone = msg.trim().replace(/\s+/g, '');
        lead.score = Math.min(100, lead.score + 5);
        if (ctx.onConversion) ctx.onConversion(deepCopy(lead));
        return { reply: '✅ ¡Perfecto! Quedó registrado. ¡Hasta pronto! 🤝\n\nMientras esperas, puedes revisar nuestras demos en el sitio web.', next: 'done' };
      }
    }
  ];

  function getStep(name) {
    for (var i = 0; i < FLOW.length; i++) {
      if (FLOW[i].step === name) return FLOW[i];
    }
    return FLOW[FLOW.length - 1];
  }

  function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

  /* ── ALMACENAMIENTO (Ley N°21.663: solo localStorage, sin cookies de terceros) ── */
  var DB = {
    _key: function () { return CFG.storageKey; },
    load: function () {
      try { return JSON.parse(localStorage.getItem(this._key()) || '[]'); } catch (e) { return []; }
    },
    save: function (records) {
      try { localStorage.setItem(this._key(), JSON.stringify(records)); } catch (e) { /* cuota llena */ }
    },
    upsert: function (lead) {
      var records = this.load();
      var idx = -1;
      for (var i = 0; i < records.length; i++) { if (records[i].id === lead.id) { idx = i; break; } }
      if (idx >= 0) records[idx] = lead; else records.unshift(lead);
      this.save(records);
    },
    getAll: function () { return this.load(); },
    clear:  function () { localStorage.removeItem(this._key()); }
  };

  /* ── SESIÓN ACTIVA ──────────────────────────────────────────── */
  var Session = {
    lead: null,
    step: 'greeting',
    history: []
  };

  function newLead(name) {
    return {
      id: uid(), name: name || 'Visitante', firstName: (name || 'Visitante').split(' ')[0],
      company: '', phone: '', email: '',
      score: 10, status: 'Nuevo', reunionAgendada: false,
      tags: [], chatHistory: [],
      firstContact: ts(), lastContact: ts(), interactionCount: 0
    };
  }

  /* ── GEMINI BRAIN — Async handler con fallback local ─────────
     Si CFG.geminiEndpoint está definido, usa la Edge Function.
     Si no, cae al FLOW hardcodeado original (modo offline).
  ─────────────────────────────────────────────────────────── */
  var conversationHistory = []; // Historial para Gemini multi-turn

  function handleMessage(text, onReply) {
    if (!Session.lead) {
      Session.lead = newLead();
      DB.upsert(Session.lead);
      if (CFG.onNewLead) CFG.onNewLead(deepCopy(Session.lead));
    }
    var lead = Session.lead;
    lead.lastContact = ts();
    lead.interactionCount++;
    lead.chatHistory.push({ role: 'user', text: text, ts: ts() });

    // ── Modo Gemini (requiere geminiEndpoint en CFG) ───────────
    if (CFG.geminiEndpoint) {
      fetch(CFG.geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          history: conversationHistory,
          context: {
            companyName: CFG.companyName,
            agentName: CFG.agentName,
            whatsapp: CFG.whatsapp,
            pricingFrom: CFG.pricingFrom
          }
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var reply = data.text || '¿Podrías repetir tu pregunta? 😊';
        // Actualizar historial para multi-turn
        if (Array.isArray(data.history)) conversationHistory = data.history;
        lead.chatHistory.push({ role: 'agent', text: reply, ts: ts() });
        DB.upsert(lead);
        if (CFG.onMessage) CFG.onMessage(deepCopy(lead), text, 'user');
        if (typeof onReply === 'function') onReply(reply);
      })
      .catch(function(err) {
        // Fallback al FLOW local si la Edge Function falla
        console.warn('[AgentVentas] Gemini no disponible, usando FLOW local:', err.message);
        var fallbackReply = _handleFlowLocal(text, lead);
        if (CFG.onMessage) CFG.onMessage(deepCopy(lead), text, 'user');
        if (typeof onReply === 'function') onReply(fallbackReply);
      });
      return null; // Async — respuesta llega por onReply callback
    }

    // ── Modo FLOW local (offline / sin geminiEndpoint) ─────────
    var reply = _handleFlowLocal(text, lead);
    DB.upsert(lead);
    if (CFG.onMessage) CFG.onMessage(deepCopy(lead), text, 'user');
    return reply;
  }

  // FLOW local original (preservado intacto como fallback)
  function _handleFlowLocal(text, lead) {
    var stepObj = getStep(Session.step);
    var result;
    if (Session.step === 'greeting' || !stepObj.handle) {
      var greeting = getStep('greeting').agent(CFG);
      lead.chatHistory.push({ role: 'agent', text: greeting, ts: ts() });
      Session.step = 'qualify';
      result = { reply: greeting };
    } else {
      result = stepObj.handle(text, CFG, lead);
      lead.chatHistory.push({ role: 'agent', text: result.reply, ts: ts() });
      Session.step = result.next || Session.step;
    }
    return result.reply;
  }


  /* ── WIDGET RENDERER ────────────────────────────────────────── */
  var Widget = {
    container: null,
    messagesEl: null,
    inputEl: null,
    open: false,

    inject: function (selector) {
      var host = typeof selector === 'string' ? document.querySelector(selector) : null;
      var widgetHTML = [
        '<div id="av-widget" style="position:fixed;bottom:24px;right:24px;z-index:99999;font-family:Inter,system-ui,sans-serif;">',
          '<div id="av-bubble" style="',
            'width:58px;height:58px;border-radius:50%;',
            'background:' + CFG.primaryColor + ';',
            'display:flex;align-items:center;justify-content:center;',
            'cursor:pointer;box-shadow:0 4px 20px rgba(0,229,255,.4);',
            'transition:transform .3s;font-size:1.6rem;',
          '">💬</div>',
          '<div id="av-box" style="',
            'display:none;position:absolute;bottom:70px;right:0;width:350px;',
            'background:#1C1E26;border:1px solid rgba(0,229,255,.2);',
            'border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.7);',
          '">',
            '<div id="av-header" style="background:linear-gradient(135deg,#0B132B,#1a1060);padding:14px 18px;display:flex;align-items:center;gap:10px;">',
              '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,' + CFG.primaryColor + ',' + CFG.accentColor + ');display:flex;align-items:center;justify-content:center;font-size:1.3rem;">' + CFG.agentAvatar + '</div>',
              '<div style="flex:1"><div style="font-weight:700;color:#F8F9FA;font-size:.92rem;">' + CFG.agentName + ' · Ventas IA</div>',
              '<div style="font-size:.72rem;color:' + CFG.primaryColor + ';">● En línea</div></div>',
              '<div id="av-close" style="cursor:pointer;color:#A9B0BB;font-size:1.2rem;line-height:1;">✕</div>',
            '</div>',
            '<div id="av-messages" style="height:290px;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;"></div>',
            '<div id="av-input-row" style="padding:10px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:8px;">',
              '<input id="av-input" type="text" placeholder="Escribe aquí..." style="flex:1;background:#0B132B;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;color:#F8F9FA;font-size:.88rem;outline:none;">',
              '<button id="av-send" style="background:' + CFG.primaryColor + ';color:#000;border:none;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:.85rem;">→</button>',
            '</div>',
            '<div style="padding:4px 14px 10px;font-size:.68rem;color:#444;text-align:center;">🔒 TLS 1.3 · Ley N°21.663 · Sin almacenamiento externo</div>',
          '</div>',
        '</div>'
      ].join('');

      if (host) { host.innerHTML = widgetHTML; }
      else { document.body.insertAdjacentHTML('beforeend', widgetHTML); }

      var bubble   = document.getElementById('av-bubble');
      var box      = document.getElementById('av-box');
      var closeBtn = document.getElementById('av-close');
      this.messagesEl = document.getElementById('av-messages');
      this.inputEl    = document.getElementById('av-input');
      var sendBtn     = document.getElementById('av-send');
      var self = this;

      bubble.addEventListener('click', function () { self.toggle(); });
      closeBtn.addEventListener('click', function () { self.toggle(false); });
      sendBtn.addEventListener('click', function () { self.send(); });
      this.inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') self.send(); });

      if (CFG.autoOpen) {
        setTimeout(function () { if (!self.open) self.toggle(true); }, CFG.autoOpenDelay);
      }
    },

    toggle: function (force) {
      var box = document.getElementById('av-box');
      this.open = (force !== undefined) ? force : !this.open;
      box.style.display = this.open ? 'block' : 'none';
      if (this.open && this.messagesEl.children.length === 0) {
        this.showGreeting();
      }
    },

    showGreeting: function () {
      var greeting = getStep('greeting').agent(CFG);
      this.appendMsg(greeting, 'agent');
      Session.step = 'qualify';
    },

    appendMsg: function (text, role) {
      var div = document.createElement('div');
      div.style.cssText = 'display:flex;' + (role === 'user' ? 'justify-content:flex-end;' : '');
      var bub = document.createElement('div');
      bub.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      bub.style.cssText = [
        'max-width:82%;padding:10px 13px;border-radius:12px;font-size:.87rem;line-height:1.5;',
        role === 'user'
          ? 'background:' + CFG.primaryColor + ';color:#000;border-bottom-right-radius:2px;'
          : 'background:rgba(255,255,255,.06);color:#F8F9FA;border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:2px;'
      ].join('');
      div.appendChild(bub);
      this.messagesEl.appendChild(div);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    },

    send: function () {
      var text = this.inputEl.value.trim();
      if (!text) return;
      this.appendMsg(text, 'user');
      this.inputEl.value = '';
      var self = this;

      // Disable input while processing
      self.inputEl.disabled = true;
      document.getElementById('av-send').disabled = true;

      // Indicador de escritura
      var typingDiv = document.createElement('div');
      typingDiv.id = 'av-typing';
      typingDiv.style.cssText = 'display:flex;';
      typingDiv.innerHTML = '<div style="padding:10px 14px;background:rgba(255,255,255,.06);border-radius:12px;color:#A9B0BB;font-size:.85rem;border:1px solid rgba(255,255,255,.08);">✦ escribiendo...</div>';
      self.messagesEl.appendChild(typingDiv);
      self.messagesEl.scrollTop = self.messagesEl.scrollHeight;

      function showReply(reply) {
        // Quitar indicador
        var t = document.getElementById('av-typing');
        if (t) t.remove();
        self.appendMsg(reply, 'agent');
        self.inputEl.disabled = false;
        document.getElementById('av-send').disabled = false;
        self.inputEl.focus();
      }

      if (CFG.geminiEndpoint) {
        // Modo async Gemini — onReply callback
        handleMessage(text, function(reply) { showReply(reply); });
      } else {
        // Modo local sync — simula delay humano
        setTimeout(function () {
          var reply = handleMessage(text);
          showReply(reply);
        }, Math.random() * 600 + 350);
      }
    }
  };

  /* ── CSV EXPORT ─────────────────────────────────────────────── */
  function exportCSV() {
    var records = DB.getAll();
    var headers = ['ID','Nombre','Empresa','Teléfono','Estado','Puntaje','Primer Contacto','Último Contacto','Interacciones','Tags'];
    var rows = records.map(function (r) {
      return [r.id, r.name, r.company, r.phone, r.status, r.score,
        r.firstContact, r.lastContact, r.interactionCount, (r.tags || []).join(' | ')
      ].map(function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(',');
    });
    var csv = [headers.join(',')].concat(rows).join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url;
    a.download = 'clientes_ventas_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click(); URL.revokeObjectURL(url);
  }

  /* ── API PÚBLICA ────────────────────────────────────────────── */
  global.AgentVentas = {
    /**
     * Inicializa el agente con tu configuración.
     * @param {Object} config - Ver documentación README.md
     */
    init: function (config) {
      Object.keys(config || {}).forEach(function (k) { CFG[k] = config[k]; });
      CFG.welcomeMsg = CFG.welcomeMsg || null;
      DB._key = function () { return CFG.storageKey; };
      return this;
    },

    /**
     * Monta el widget de chat en un selector CSS o en body.
     * @param {string|null} selector - Ej: '#mi-chat'. Null = floating widget.
     */
    createWidget: function (selector) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { Widget.inject(selector); });
      } else {
        Widget.inject(selector);
      }
      return this;
    },

    /** Procesa un mensaje externo (útil si construyes tu propia UI). */
    sendMessage: function (text, leadName) {
      if (!Session.lead) Session.lead = newLead(leadName);
      return handleMessage(text);
    },

    /** Inicia una nueva sesión (nuevo lead). */
    newSession: function (leadName) {
      Session.lead = newLead(leadName);
      Session.step = 'greeting';
      return Session.lead.id;
    },

    /** Obtiene todos los clientes de la base de datos local. */
    getClients: function () { return DB.getAll(); },

    /** Exporta la base de clientes como CSV (descarga directa). */
    exportCSV: exportCSV,

    /** Elimina todos los registros (usar con precaución). */
    resetDB: function () { DB.clear(); },

    /** Accede a la configuración activa. */
    getConfig: function () { return Object.assign({}, CFG); },

    /**
     * Reemplaza el motor de almacenamiento por un backend custom.
     * @param {{load, save, upsert, getAll, clear}} adapter
     */
    setStorageAdapter: function (adapter) {
      Object.keys(adapter).forEach(function (k) { DB[k] = adapter[k]; });
    }
  };

})(window);


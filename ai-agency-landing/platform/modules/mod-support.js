/* ═══════════════════════════════════════════════════════════════
   mod-support.js — Sistema de Tickets / Soporte / Postventa
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'AigenciaLab_support_tickets';
  var SLA_HOURS = { critico: 4, alto: 24, medio: 72, bajo: 168 };
  var SLA_LABELS = { critico: '4h', alto: '24h', medio: '72h', bajo: '7d' };

  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
  function ts() { return new Date().toISOString(); }
  function rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  var DB = {
    load: function() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; } },
    save: function(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch(e) {} },
    getAll: function() { return this.load(); },
    upsert: function(ticket) {
      var all = this.load(), idx = -1;
      for(var i=0;i<all.length;i++){ if(all[i].id===ticket.id){idx=i;break;} }
      if(idx>=0) all[idx]=ticket; else all.unshift(ticket);
      this.save(all);
    }
  };

  function slaStatus(ticket) {
    var h = SLA_HOURS[ticket.priority] || 72;
    var deadline = new Date(ticket.createdAt).getTime() + h * 3600000;
    var remaining = deadline - Date.now();
    if (ticket.status === 'Resuelto') return { label: '✅ Resuelto', cls: 'sla-ok' };
    if (remaining < 0) return { label: '🚨 Vencido', cls: 'sla-error' };
    if (remaining < 3600000) return { label: '⚠️ <1h', cls: 'sla-warn' };
    var hrs = Math.floor(remaining / 3600000);
    return { label: '⏱ ' + hrs + 'h restantes', cls: 'sla-ok' };
  }

  function seedTickets() {
    if (DB.getAll().length > 0) return;
    var COMPANIES = ['RetailSur SpA', 'ClinicaPro Ltda', 'LogiFast', 'Moda Urbana', 'AgriSur SA'];
    var ISSUES = [
      'El agente de WhatsApp no está respondiendo correctamente',
      'Necesito agregar nuevas preguntas al flujo del chatbot',
      'La sincronización con WooCommerce falló esta mañana',
      'Solicito reporte de métricas del último mes',
      'El tracking de envíos muestra información incorrecta',
      'Necesito onboarding para un nuevo usuario del equipo',
      'El sistema de recuperación de carritos no envía mensajes'
    ];
    var PRIORITIES = ['critico', 'alto', 'medio', 'bajo'];
    var STATUSES = ['Abierto', 'En progreso', 'Esperando cliente', 'Resuelto'];
    var tickets = Array.from({length: 10}, function(_, i) {
      var priority = i < 2 ? 'critico' : pick(PRIORITIES);
      var status = i < 4 ? pick(['Abierto','En progreso']) : pick(STATUSES);
      var created = new Date(Date.now() - rand(0,72) * 3600000).toISOString();
      return {
        id: uid(), ticket: 'TKT-' + (1000 + i),
        company: pick(COMPANIES), issue: pick(ISSUES),
        priority: priority, status: status, createdAt: created,
        updatedAt: ts(), assignedTo: pick(['Carlos T.', 'Ana M.', 'Sin asignar']),
        notes: '', channel: pick(['WhatsApp', 'Email', 'Dashboard'])
      };
    });
    DB.save(tickets);
  }

  function renderSupport() {
    var view = document.getElementById('view-support');
    if (!view) return;
    var tickets = DB.getAll();
    var open = tickets.filter(function(t){ return t.status !== 'Resuelto'; });
    var criticos = tickets.filter(function(t){ return t.priority === 'critico' && t.status !== 'Resuelto'; });
    var slaVencidos = tickets.filter(function(t){ return slaStatus(t).cls === 'sla-error'; });

    view.querySelector('.support-kpis').innerHTML = [
      kpi('Tickets Abiertos', open.length, '', '#D97706'),
      kpi('Críticos Activos', criticos.length, '', '#DC2626'),
      kpi('SLA Vencidos', slaVencidos.length, '', slaVencidos.length > 0 ? '#DC2626' : '#059669'),
      kpi('Resueltos Hoy', tickets.filter(function(t){ return t.status==='Resuelto' && isToday(t.updatedAt); }).length, '', '#059669')
    ].join('');

    renderTicketTable(view, tickets);
  }

  function isToday(iso) {
    var d = new Date(iso), now = new Date();
    return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }

  function kpi(label, value, delta, color) {
    return '<div class="kpi-card"><div class="kpi-label">'+label+'</div><div class="kpi-value" style="color:'+color+'">'+value+'</div>'+(delta?'<div class="kpi-delta">'+delta+'</div>':'')+'</div>';
  }

  var PRIORITY_COLORS = { critico: '#DC2626', alto: '#D97706', medio: '#2563EB', bajo: '#6B7280' };
  var STATUS_COLORS   = { 'Abierto': 'error', 'En progreso': 'info', 'Esperando cliente': 'warning', 'Resuelto': 'success' };

  function renderTicketTable(view, tickets) {
    var tbody = view.querySelector('#ticketsTbody');
    if (!tbody) return;
    var filter = (view.querySelector('#ticketFilter') || {}).value || 'all';
    var search = ((view.querySelector('#ticketSearch') || {}).value || '').toLowerCase();
    var filtered = tickets.filter(function(t) {
      if (filter !== 'all' && t.status !== filter && filter !== t.priority) return false;
      if (search && t.company.toLowerCase().indexOf(search) === -1 && t.issue.toLowerCase().indexOf(search) === -1) return false;
      return true;
    });
    tbody.innerHTML = filtered.map(function(t) {
      var sla = slaStatus(t);
      var pColor = PRIORITY_COLORS[t.priority] || '#6B7280';
      var sCls = STATUS_COLORS[t.status] || 'muted';
      return '<tr>' +
        '<td><strong>'+t.ticket+'</strong></td>' +
        '<td>'+t.company+'</td>' +
        '<td class="ticket-issue" title="'+t.issue+'">'+t.issue.substring(0,45)+(t.issue.length>45?'…':'')+'</td>' +
        '<td><span class="status status-text" style="color:'+pColor+';font-weight:600;">'+t.priority.toUpperCase()+'</span><br/><span style="font-size:.7rem;color:#9CA3AF;">SLA: '+SLA_LABELS[t.priority]+'</span></td>' +
        '<td><span class="status status-'+sCls+'">'+t.status+'</span></td>' +
        '<td><span class="'+sla.cls+'">'+sla.label+'</span></td>' +
        '<td>'+t.assignedTo+'</td>' +
        '<td>' +
          '<button class="lead-btn btn-resolve" data-id="'+t.id+'" title="Resolver">✅</button> ' +
          '<button class="lead-btn btn-note-ticket" data-id="'+t.id+'" title="Nota interna">📝</button> ' +
          '<button class="lead-btn btn-progress" data-id="'+t.id+'" title="En progreso">▶️</button>' +
        '</td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:#9CA3AF;padding:20px;">Sin tickets</td></tr>';

    // Bind actions
    view.querySelectorAll('.btn-resolve').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var all = DB.getAll(), id = btn.getAttribute('data-id');
        for(var i=0;i<all.length;i++){ if(all[i].id===id){ all[i].status='Resuelto'; all[i].updatedAt=ts(); break; } }
        DB.save(all); renderSupport();
      });
    });
    view.querySelectorAll('.btn-progress').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var all = DB.getAll(), id = btn.getAttribute('data-id');
        for(var i=0;i<all.length;i++){ if(all[i].id===id && all[i].status==='Abierto'){ all[i].status='En progreso'; all[i].updatedAt=ts(); break; } }
        DB.save(all); renderSupport();
      });
    });
    view.querySelectorAll('.btn-note-ticket').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        var note = prompt('Nota interna (no visible al cliente):');
        if (note) {
          var all = DB.getAll();
          for(var i=0;i<all.length;i++){ if(all[i].id===id){ all[i].notes=note; break; } }
          DB.save(all); renderSupport();
        }
      });
    });
  }

  function injectHTML() {
    // Sidebar nav
    var logsNav = document.querySelector('[data-view="logs"]');
    if (logsNav && logsNav.parentNode) {
      var item = document.createElement('div');
      item.className = 'nav-item';
      item.setAttribute('data-view', 'support');
      item.innerHTML = '<span class="nav-icon">🎫</span><span>Soporte</span><span class="nav-badge" id="supportBadge">0</span>';
      logsNav.parentNode.insertBefore(item, logsNav);
    }

    var pageContent = document.querySelector('.page-content');
    if (!pageContent) return;
    var div = document.createElement('div');
    div.className = 'module-view';
    div.id = 'view-support';
    div.innerHTML = [
      '<div class="kpi-row support-kpis"></div>',
      '<div class="panel">',
        '<div class="panel-header" style="display:flex;justify-content:space-between;align-items:center;">',
          '<div class="panel-title">Tickets de Soporte</div>',
          '<div style="display:flex;gap:8px;align-items:center;">',
            '<input id="ticketSearch" type="text" placeholder="Buscar..." style="padding:6px 12px;border:1px solid var(--hw-border);border-radius:6px;font-size:.8rem;background:var(--hw-surface);color:var(--hw-text);outline:none;"/>',
            '<select id="ticketFilter" style="padding:6px 10px;border:1px solid var(--hw-border);border-radius:6px;font-size:.8rem;background:var(--hw-surface);color:var(--hw-text);outline:none;">',
              '<option value="all">Todos</option>',
              '<option value="Abierto">Abiertos</option>',
              '<option value="En progreso">En progreso</option>',
              '<option value="Resuelto">Resueltos</option>',
              '<option value="critico">Críticos</option>',
            '</select>',
            '<button id="btnNewTicket" class="btn-outline-sm">+ Nuevo Ticket</button>',
          '</div>',
        '</div>',
        '<div class="panel-body" style="overflow-x:auto;">',
          '<table class="data-table"><thead><tr>',
            '<th>ID</th><th>Empresa</th><th>Problema</th><th>Prioridad</th><th>Estado</th><th>SLA</th><th>Asignado</th><th>Acciones</th>',
          '</tr></thead><tbody id="ticketsTbody"></tbody></table>',
        '</div>',
      '</div>',
      // New ticket modal
      '<div id="newTicketModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:none;align-items:center;justify-content:center;">',
        '<div style="background:var(--hw-card);border:1px solid var(--hw-border);border-radius:16px;padding:28px;width:min(480px,95vw);box-shadow:var(--hw-shadow-lg);">',
          '<h3 style="margin-bottom:20px;">Nuevo Ticket de Soporte</h3>',
          '<div style="display:flex;flex-direction:column;gap:12px;">',
            '<input id="nt-company" placeholder="Empresa cliente" style="padding:10px 14px;border:1px solid var(--hw-border);border-radius:8px;background:var(--hw-surface);color:var(--hw-text);font-size:.88rem;outline:none;"/>',
            '<textarea id="nt-issue" placeholder="Descripción del problema..." rows="3" style="padding:10px 14px;border:1px solid var(--hw-border);border-radius:8px;background:var(--hw-surface);color:var(--hw-text);font-size:.88rem;outline:none;resize:vertical;font-family:inherit;"></textarea>',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">',
              '<select id="nt-priority" style="padding:10px;border:1px solid var(--hw-border);border-radius:8px;background:var(--hw-surface);color:var(--hw-text);font-size:.88rem;"><option value="medio">Medio</option><option value="alto">Alto</option><option value="critico">Crítico</option><option value="bajo">Bajo</option></select>',
              '<select id="nt-channel" style="padding:10px;border:1px solid var(--hw-border);border-radius:8px;background:var(--hw-surface);color:var(--hw-text);font-size:.88rem;"><option>WhatsApp</option><option>Email</option><option>Dashboard</option><option>Llamada</option></select>',
            '</div>',
          '</div>',
          '<div style="display:flex;gap:8px;margin-top:20px;">',
            '<button id="btnSaveTicket" style="flex:1;padding:11px;background:var(--hw-primary);border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;">Crear Ticket</button>',
            '<button id="btnCancelTicket" style="padding:11px 16px;background:transparent;border:1px solid var(--hw-border);border-radius:8px;color:var(--hw-sub);cursor:pointer;">Cancelar</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
    pageContent.appendChild(div);

    var style = document.createElement('style');
    style.textContent = [
      '.sla-ok{color:#059669;font-size:.78rem;font-weight:600;}',
      '.sla-warn{color:#D97706;font-size:.78rem;font-weight:600;}',
      '.sla-error{color:#DC2626;font-size:.78rem;font-weight:700;}',
      '.ticket-issue{max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.btn-outline-sm{padding:6px 12px;border:1px solid var(--hw-border);border-radius:6px;background:transparent;color:var(--hw-text);cursor:pointer;font-size:.8rem;transition:all .15s;}',
      '.btn-outline-sm:hover{background:var(--hw-primary-l);border-color:var(--hw-primary);}'
    ].join('');
    document.head.appendChild(style);

    // New ticket modal
    var modal = div.querySelector('#newTicketModal');
    div.querySelector('#btnNewTicket').addEventListener('click', function() {
      modal.style.display = 'flex';
    });
    div.querySelector('#btnCancelTicket').addEventListener('click', function() {
      modal.style.display = 'none';
    });
    div.querySelector('#btnSaveTicket').addEventListener('click', function() {
      var company = div.querySelector('#nt-company').value.trim();
      var issue = div.querySelector('#nt-issue').value.trim();
      var priority = div.querySelector('#nt-priority').value;
      var channel = div.querySelector('#nt-channel').value;
      if (!company || !issue) { alert('Completa empresa y problema.'); return; }
      var all = DB.getAll();
      all.unshift({
        id: uid(), ticket: 'TKT-' + (1000 + all.length + 1),
        company: company, issue: issue, priority: priority, status: 'Abierto',
        createdAt: ts(), updatedAt: ts(), assignedTo: 'Sin asignar',
        notes: '', channel: channel
      });
      DB.save(all);
      modal.style.display = 'none';
      renderSupport();
    });

    // Filter/search live
    div.querySelector('#ticketSearch').addEventListener('input', renderSupport);
    div.querySelector('#ticketFilter').addEventListener('change', renderSupport);
  }

  function init() {
    injectHTML();
    seedTickets();
    var open = DB.getAll().filter(function(t){ return t.status !== 'Resuelto'; }).length;
    var badge = document.getElementById('supportBadge');
    if (badge) badge.textContent = open;
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-view="support"]')) { setTimeout(renderSupport, 50); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.ModSupport = { refresh: renderSupport, getTickets: DB.getAll.bind(DB) };
})();


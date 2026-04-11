/* pwa.js — Mobile Dashboard Logic */
(function () {
  'use strict';
  function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* GREETING */
  var hour = new Date().getHours();
  var saludo = hour < 12 ? 'Buenos días' : (hour < 19 ? 'Buenas tardes' : 'Buenas noches');
  document.getElementById('greeting').textContent = saludo + ' — Panel General';

  /* PAGE NAVIGATION */
  window.selectPage = function(pageId) {
    document.querySelectorAll('.pwa-page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.pwa-nav-item').forEach(function(n) { n.classList.remove('active'); });
    document.getElementById(pageId).classList.add('active');
    var navBtn = document.querySelector('[data-page="' + pageId + '"]');
    if (navBtn) navBtn.classList.add('active');
  };

  document.querySelectorAll('.pwa-nav-item[data-page]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      selectPage(btn.getAttribute('data-page'));
      if (btn.getAttribute('data-page') === 'pg-leads') renderLeads('all');
      if (btn.getAttribute('data-page') === 'pg-tickets') renderTickets();
    });
  });

  /* LEADS */
  var LEADS_DATA = [
    { id: 1, company: 'RetailSur SpA',    rubro: 'Ecommerce', score: 89, prob: 82, tier: 'hot',  wa: '+56998765432' },
    { id: 2, company: 'ClinicaPro Ltda',  rubro: 'Salud',     score: 74, prob: 68, tier: 'hot',  wa: '+56987654321' },
    { id: 3, company: 'LogiFast Chile',   rubro: 'Logística', score: 55, prob: 44, tier: 'warm', wa: '+56912345678' },
    { id: 4, company: 'Moda Urbana',      rubro: 'Fashion',   score: 48, prob: 38, tier: 'warm', wa: '+56976543210' },
    { id: 5, company: 'AgriSur SA',       rubro: 'Agro',      score: 30, prob: 18, tier: 'cold', wa: '' },
    { id: 6, company: 'ConstruSol Ltda',  rubro: 'Construcción', score: 22, prob: 12, tier: 'cold', wa: '' }
  ];

  // Load from Pipeline localStorage
  try {
    var pipelineData = JSON.parse(localStorage.getItem('AigenciaLab_pipeline_leads') || '[]');
    if (pipelineData.length > 0) {
      LEADS_DATA = pipelineData.slice(0, 10).map(function(l) {
        return { id: l.id, company: l.company, rubro: l.rubro, score: l.score, prob: l.prob, tier: l.score >= 70 ? 'hot' : (l.score >= 40 ? 'warm' : 'cold'), wa: l.whatsapp || '' };
      });
    }
  } catch(e) {}

  var hotCount = LEADS_DATA.filter(function(l){ return l.tier === 'hot'; }).length;
  var badgeLeads = document.getElementById('badgeLeads');
  if (badgeLeads && hotCount > 0) { badgeLeads.textContent = hotCount; }
  document.getElementById('kpiLeads').textContent = hotCount;

  function renderLeads(filter) {
    var list = document.getElementById('leadsList');
    if (!list) return;
    var filtered = filter === 'all' ? LEADS_DATA : LEADS_DATA.filter(function(l){ return l.tier === filter; });
    list.innerHTML = filtered.map(function(lead) {
      var badgeClass = 'badge-' + lead.tier;
      var tierLabel = lead.tier === 'hot' ? '🔥 Caliente' : (lead.tier === 'warm' ? '🌡️ Tibio' : '❄️ Frío');
      return '<div class="lead-card-m">' +
        '<div class="lcm-top"><span class="lcm-badge ' + badgeClass + '">' + tierLabel + '</span><span class="lcm-prob">' + lead.prob + '% prob.</span></div>' +
        '<div class="lcm-company">' + lead.company + '</div>' +
        '<div class="lcm-rubro">' + lead.rubro + ' · Score: ' + lead.score + '/100</div>' +
        '<div class="lcm-actions">' +
          (lead.wa ? '<button class="lcm-btn primary" onclick="window.open(\'https://wa.me/' + lead.wa.replace(/[+\s]/g,'') + '\')">💬 WhatsApp</button>' : '') +
          '<button class="lcm-btn" onclick="window.open(\'../platform/index.html#pipeline\')">📄 Ver Pipeline</button>' +
        '</div>' +
      '</div>';
    }).join('') || '<div style="text-align:center;color:var(--muted);padding:30px;">Sin leads en esta categoría</div>';
  }

  document.querySelectorAll('.lf-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.lf-btn').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      renderLeads(btn.getAttribute('data-f'));
    });
  });

  /* TICKETS */
  var TICKETS_DATA = [
    { id: 'TKT-1001', company: 'RetailSur SpA', issue: 'Agente WhatApp no responde correctamente', priority: 'critico', status: 'Abierto', slaLeft: 'Vence en 2h' },
    { id: 'TKT-1002', company: 'ClinicaPro Ltda', issue: 'Solicitud de reporte mensual de métricas', priority: 'medio', status: 'En progreso', slaLeft: '48h restantes' },
    { id: 'TKT-1003', company: 'AgriSur SA', issue: 'Nueva integración con sistema de inventario', priority: 'alto', status: 'Abierto', slaLeft: '18h restantes' }
  ];

  try {
    var supportData = JSON.parse(localStorage.getItem('AigenciaLab_support_tickets') || '[]');
    if (supportData.length > 0) {
      TICKETS_DATA = supportData.filter(function(t){ return t.status !== 'Resuelto'; }).slice(0, 6).map(function(t) {
        return { id: t.ticket, company: t.company, issue: t.issue, priority: t.priority, status: t.status, slaLeft: '' };
      });
    }
  } catch(e) {}

  var openTickets = TICKETS_DATA.filter(function(t){ return t.status !== 'Resuelto'; }).length;
  document.getElementById('kpiTickets').textContent = openTickets;
  var badgeTickets = document.getElementById('badgeTickets');
  if (badgeTickets) badgeTickets.textContent = openTickets > 0 ? openTickets : '';

  function renderTickets() {
    var list = document.getElementById('ticketsList');
    if (!list) return;
    list.innerHTML = TICKETS_DATA.map(function(t) {
      return '<div class="ticket-card-m">' +
        '<div class="tcm-row"><span class="tcm-id">' + t.id + '</span><span class="tcm-priority pri-' + t.priority + '">' + t.priority.toUpperCase() + '</span></div>' +
        '<div class="tcm-company">' + t.company + '</div>' +
        '<div class="tcm-issue">' + t.issue + '</div>' +
        '<div class="tcm-footer"><span class="tcm-status" style="color:' + (t.status==='Abierto'?'#D97706':t.status==='En progreso'?'#2563EB':'#059669') + '">' + t.status + '</span>' +
        (t.slaLeft ? '<span class="tcm-sla">' + t.slaLeft + '</span>' : '') +
        '</div>' +
      '</div>';
    }).join('') || '<div style="text-align:center;color:var(--muted);padding:30px;">Sin tickets abiertos ✅</div>';
  }

  /* PWA INSTALL PROMPT */
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    var banner = document.createElement('div');
    banner.className = 'install-banner show';
    banner.innerHTML = '<span class="ib-text">📱 Instala AigenciaLab en tu teléfono</span><button class="ib-btn" id="ibInstall">Instalar</button><button class="ib-close" id="ibClose">✕</button>';
    document.querySelector('.pwa-app').appendChild(banner);
    document.getElementById('ibInstall').addEventListener('click', function() {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function() { banner.remove(); deferredPrompt = null; });
    });
    document.getElementById('ibClose').addEventListener('click', function() { banner.remove(); });
  });

  /* SERVICE WORKER */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js').catch(function(e) { console.log('SW not registered:', e); });
    });
  }

  /* LIVE UPDATES */
  setInterval(function() {
    var kpiAlertas = document.getElementById('kpiAlertas');
    if (kpiAlertas) {
      try {
        var alertsData = JSON.parse(localStorage.getItem('AigenciaLab_biz_alerts') || '[]');
        var count = alertsData.filter(function(a){ return !a.dismissed; }).length;
        kpiAlertas.textContent = count || '0';
        var badge = document.getElementById('badgeAlerts');
        if (badge) badge.textContent = count > 0 ? count : '';
      } catch(e) {}
    }
  }, 10000);

})();


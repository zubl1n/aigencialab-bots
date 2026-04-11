/* ═══════════════════════════════════════════════════════════════
   mod-pipeline.js — Pipeline Inteligente con Lead Scoring
   Inyectar DESPUÉS de dashboard.js en platform/index.html
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'AigenciaLab_pipeline_leads';
  var AUDIT_KEY   = 'AigenciaLab_audit_leads';

  function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function ts() { return new Date().toISOString(); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }

  /* ── SCORING ENGINE ──────────────────────────────────────── */
  var SCORE_RULES = {
    visitedPricing:    30,
    usedDemo:          25,
    completedAudit:    40,
    clickedWhatsApp:   15,
    abandonedForm:     10,
    longSession:       20,  // >3 min
    multipleVisits:    15,
    requestedProposal: 35
  };

  function calculateTier(score) {
    if (score >= 70) return { label: 'Caliente 🔥', cls: 'tier-hot', prob: rand(65, 90) };
    if (score >= 40) return { label: 'Tibio 🌡️', cls: 'tier-warm', prob: rand(30, 64) };
    return { label: 'Frío ❄️', cls: 'tier-cold', prob: rand(5, 29) };
  }

  function suggestedAction(score, lead) {
    if (score >= 70) {
      if (lead.completedAudit) return '📞 Llamar hoy — Completó auditoría. Alta intención.';
      if (lead.usedDemo) return '📨 Enviar propuesta PDF — Ya vio el demo.';
      return '💬 WhatsApp personalizado — Caliente sin contacto.';
    }
    if (score >= 40) {
      if (lead.visitedPricing) return '🎁 Enviar caso de éxito de su rubro.';
      return '🔄 Reenviar demo del agente que más le interesa.';
    }
    return '📧 Agregar a secuencia educativa (3 emails).';
  }

  /* ── STORAGE ─────────────────────────────────────────────── */
  var DB = {
    load: function () { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; } },
    save: function (d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch (e) {} },
    upsert: function (lead) {
      var all = this.load();
      var idx = -1;
      for (var i = 0; i < all.length; i++) { if (all[i].id === lead.id) { idx = i; break; } }
      if (idx >= 0) all[idx] = lead; else all.unshift(lead);
      this.save(all);
    },
    getAll: function () { return this.load(); }
  };

  /* ── SEED DATA ──────────────────────────────────────────────*/
  function seedLeads() {
    if (DB.getAll().length > 0) return;

    // Try importing from audit leads first
    var auditLeads = [];
    try { auditLeads = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); } catch (e) {}

    var COMPANIES = ['RetailSur SpA', 'ClinicaPro Ltda', 'AgriSur SA', 'LogiFast',
                     'Moda Urbana', 'InmoPro Chile', 'TechSur', 'ConstruSol Ltda'];
    var RUBROS = ['Ecommerce Retail', 'Clínica', 'Agro', 'Logística', 'Moda', 'Inmobiliaria', 'Tech', 'Construcción'];
    var CONTACTS = ['María González', 'Carlos Herrera', 'Ana Morales', 'Luis Pérez', 'Valentina Ríos', 'Jorge Castro'];

    var leads = COMPANIES.map(function (c, i) {
      var score = rand(15, 95);
      var events = {};
      if (score > 60) { events.completedAudit = true; events.usedDemo = true; events.visitedPricing = true; }
      else if (score > 40) { events.usedDemo = rand(0,1) === 1; events.visitedPricing = rand(0,1) === 1; }
      else { events.multipleVisits = true; }

      var tier = calculateTier(score);
      return {
        id: uid(), company: c, contact: CONTACTS[i % CONTACTS.length],
        rubro: RUBROS[i % RUBROS.length], whatsapp: '+569' + rand(10000000, 99999999),
        score: score, tier: tier.label, tierCls: tier.cls, prob: tier.prob,
        action: suggestedAction(score, events),
        lastActivity: new Date(Date.now() - rand(0, 15) * 86400000).toISOString(),
        createdAt: ts(), notes: '', events: events, auditScore: events.completedAudit ? rand(28, 72) : null
      };
    });

    // Merge audit leads
    auditLeads.slice(0, 3).forEach(function (a) {
      var score = Math.min(95, a.score + 40); // Audit = alto score
      var tier = calculateTier(score);
      leads.unshift({
        id: uid(), company: a.url || 'Web Lead', contact: a.name || 'Prospecto',
        rubro: a.rubro || 'General', whatsapp: a.whatsapp || '—',
        score: score, tier: tier.label, tierCls: tier.cls, prob: tier.prob,
        action: suggestedAction(score, { completedAudit: true }),
        lastActivity: a.ts || ts(), createdAt: a.ts || ts(), notes: '',
        events: { completedAudit: true }, auditScore: a.score
      });
    });

    DB.save(leads);
  }

  /* ── RENDER ───────────────────────────────────────────────── */
  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    var diff = Math.round((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return 'Hace ' + diff + ' días';
  }

  function renderPipeline() {
    var leads = DB.getAll();
    var hot   = leads.filter(function(l){ return l.score >= 70; });
    var warm  = leads.filter(function(l){ return l.score >= 40 && l.score < 70; });
    var cold  = leads.filter(function(l){ return l.score < 40; });

    var view = document.getElementById('view-pipeline');
    if (!view) return;

    // KPI row
    var totalValue = leads.length * rand(150000, 400000);
    view.querySelector('.pipeline-kpis').innerHTML =
      kpiCard('Total Prospectos', leads.length, '', '#2563EB') +
      kpiCard('Calientes 🔥', hot.length, '+' + rand(1,4) + ' esta semana', '#DC2626') +
      kpiCard('Prob. Cierre Promedio', Math.round(leads.reduce(function(s,l){return s+l.prob;},0)/Math.max(leads.length,1)) + '%', '', '#059669') +
      kpiCard('Pipeline Estimado', '$' + Math.round(totalValue/1000000*10)/10 + 'M', 'Valor potencial', '#6C3AED');

    // Boards
    view.querySelector('#boardHot').innerHTML   = renderBoard(hot, 'hot');
    view.querySelector('#boardWarm').innerHTML  = renderBoard(warm, 'warm');
    view.querySelector('#boardCold').innerHTML  = renderBoard(cold, 'cold');

    // Count badges
    view.querySelector('#cntHot').textContent  = hot.length;
    view.querySelector('#cntWarm').textContent = warm.length;
    view.querySelector('#cntCold').textContent = cold.length;

    // Bind buttons
    view.querySelectorAll('.btn-wa-lead').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var phone = btn.getAttribute('data-wa');
        var company = btn.getAttribute('data-company');
        if (phone && phone !== '—') {
          window.open('https://wa.me/' + phone.replace(/[+\s]/g,'') + '?text=' +
            encodeURIComponent('Hola ' + company + ', soy de AigenciaLab.cl — quería conversar sobre la automatización IA para tu negocio. ¿Tienes 15 min esta semana?'));
        }
      });
    });
    view.querySelectorAll('.btn-note-lead').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        var note = prompt('Agregar nota para este lead:');
        if (note) {
          var leads = DB.getAll();
          for (var i = 0; i < leads.length; i++) {
            if (leads[i].id === id) { leads[i].notes = note; break; }
          }
          DB.save(leads);
          renderPipeline();
        }
      });
    });
    view.querySelectorAll('.btn-proposal-lead').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.getAttribute('data-id');
        var all = DB.getAll();
        var lead = null;
        for (var i = 0; i < all.length; i++) { if (all[i].id === id) { lead = all[i]; break; } }
        if (lead && window.ModProposal) window.ModProposal.generate(lead);
        else alert('Módulo de propuesta cargando...');
      });
    });
  }

  function kpiCard(label, value, delta, color) {
    return '<div class="kpi-card"><div class="kpi-label">' + label + '</div>' +
      '<div class="kpi-value" style="color:' + color + '">' + value + '</div>' +
      (delta ? '<div class="kpi-delta">' + delta + '</div>' : '') + '</div>';
  }

  function renderBoard(leads, type) {
    if (leads.length === 0) {
      return '<div style="color:#9CA3AF;font-size:.82rem;text-align:center;padding:20px;">Sin leads en esta etapa</div>';
    }
    return leads.map(function(lead) {
      return '<div class="lead-card" data-id="' + lead.id + '">' +
        '<div class="lead-card-top">' +
          '<div class="lead-badge ' + lead.tierCls + '">' + lead.tier + '</div>' +
          '<div class="lead-prob">' + lead.prob + '% prob.</div>' +
        '</div>' +
        '<div class="lead-company">' + lead.company + '</div>' +
        '<div class="lead-contact">' + lead.contact + ' · ' + lead.rubro + '</div>' +
        (lead.auditScore ? '<div class="lead-audit-tag">🔍 Auditoría: ' + lead.auditScore + '/100</div>' : '') +
        '<div class="lead-score-bar"><div class="lead-score-fill" style="width:' + lead.score + '%;"></div></div>' +
        '<div class="lead-action">💡 ' + lead.action + '</div>' +
        (lead.notes ? '<div class="lead-note">📝 ' + lead.notes + '</div>' : '') +
        '<div class="lead-footer">' +
          '<span class="lead-date">' + formatDate(lead.lastActivity) + '</span>' +
          '<div class="lead-actions">' +
            '<button class="lead-btn btn-wa-lead" data-wa="' + lead.whatsapp + '" data-company="' + lead.company + '">💬</button>' +
            '<button class="lead-btn btn-note-lead" data-id="' + lead.id + '">📝</button>' +
            '<button class="lead-btn btn-proposal-lead" data-id="' + lead.id + '">📄</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ── ADD LEAD FROM AUDIT ─────────────────────────────────── */
  function addLeadFromAudit(auditData) {
    var score = Math.min(95, (auditData.score || 50) + 40);
    var tier = calculateTier(score);
    var lead = {
      id: uid(), company: auditData.url || 'Web Lead', contact: auditData.name || 'Prospecto',
      rubro: auditData.rubro || 'General', whatsapp: auditData.whatsapp || '',
      score: score, tier: tier.label, tierCls: tier.cls, prob: tier.prob,
      action: suggestedAction(score, { completedAudit: true }),
      lastActivity: ts(), createdAt: ts(), notes: '',
      events: { completedAudit: true }, auditScore: auditData.score
    };
    DB.upsert(lead);
    return lead;
  }

  /* ── INJECT HTML ─────────────────────────────────────────── */
  function injectHTML() {
    // Add sidebar nav item
    var navSections = document.querySelector('.sidebar-nav');
    if (navSections) {
      var item = document.createElement('div');
      item.className = 'nav-item';
      item.setAttribute('data-view', 'pipeline');
      item.innerHTML = '<span class="nav-icon">🎯</span><span>Pipeline IA</span><span class="nav-badge" style="background:rgba(220,38,38,.1);color:#DC2626;" id="pipelineHotCount">0</span>';
      // Insert before logs section
      var logsSection = document.querySelector('[data-view="logs"]');
      if (logsSection && logsSection.parentNode) {
        logsSection.parentNode.insertBefore(item, logsSection);
      } else {
        navSections.appendChild(item);
      }
    }

    // Add view
    var pageContent = document.querySelector('.page-content');
    if (!pageContent) return;
    var div = document.createElement('div');
    div.className = 'module-view';
    div.id = 'view-pipeline';
    div.innerHTML = [
      '<div class="kpi-row pipeline-kpis"></div>',
      '<div class="pipeline-grid">',
        '<div class="pipeline-col">',
          '<div class="pipeline-col-header" style="border-color:#DC2626">',
            '<span>❄️ Frío</span><span class="pipeline-count" id="cntCold">0</span>',
          '</div>',
          '<div id="boardCold" class="pipeline-board"></div>',
        '</div>',
        '<div class="pipeline-col">',
          '<div class="pipeline-col-header" style="border-color:#D97706">',
            '<span>🌡️ Tibio</span><span class="pipeline-count" id="cntWarm">0</span>',
          '</div>',
          '<div id="boardWarm" class="pipeline-board"></div>',
        '</div>',
        '<div class="pipeline-col">',
          '<div class="pipeline-col-header" style="border-color:#059669">',
            '<span>🔥 Caliente</span><span class="pipeline-count" id="cntHot">0</span>',
          '</div>',
          '<div id="boardHot" class="pipeline-board"></div>',
        '</div>',
      '</div>'
    ].join('');
    pageContent.appendChild(div);

    // Add CSS
    var style = document.createElement('style');
    style.textContent = [
      '.pipeline-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:4px;}',
      '.pipeline-col{display:flex;flex-direction:column;gap:0;}',
      '.pipeline-col-header{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--hw-bg);border-top:3px solid;border-radius:8px 8px 0 0;font-weight:700;font-size:.85rem;}',
      '.pipeline-count{background:var(--hw-border);border-radius:50px;padding:2px 8px;font-size:.72rem;}',
      '.pipeline-board{min-height:200px;display:flex;flex-direction:column;gap:10px;padding:10px;background:var(--hw-bg);border-radius:0 0 8px 8px;}',
      '.lead-card{background:var(--hw-card);border:1px solid var(--hw-border);border-radius:10px;padding:14px;transition:box-shadow .2s;}',
      '.lead-card:hover{box-shadow:var(--hw-shadow-lg);}',
      '.lead-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}',
      '.lead-badge{font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:50px;}',
      '.tier-hot{background:rgba(220,38,38,.1);color:#DC2626;}',
      '.tier-warm{background:rgba(217,119,6,.1);color:#D97706;}',
      '.tier-cold{background:rgba(37,99,235,.1);color:#2563EB;}',
      '.lead-prob{font-size:.72rem;color:var(--hw-sub);font-weight:600;}',
      '.lead-company{font-weight:700;font-size:.9rem;margin-bottom:2px;}',
      '.lead-contact{font-size:.78rem;color:var(--hw-sub);margin-bottom:6px;}',
      '.lead-audit-tag{font-size:.72rem;color:#059669;background:rgba(5,150,105,.08);padding:2px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;}',
      '.lead-score-bar{height:4px;background:var(--hw-border);border-radius:2px;margin-bottom:6px;overflow:hidden;}',
      '.lead-score-fill{height:100%;background:linear-gradient(90deg,#2563EB,#6C3AED);border-radius:2px;}',
      '.lead-action{font-size:.75rem;color:var(--hw-sub);margin-bottom:8px;line-height:1.4;}',
      '.lead-note{font-size:.75rem;color:var(--hw-primary);background:var(--hw-primary-l);padding:4px 8px;border-radius:4px;margin-bottom:6px;}',
      '.lead-footer{display:flex;justify-content:space-between;align-items:center;}',
      '.lead-date{font-size:.72rem;color:var(--hw-muted);}',
      '.lead-actions{display:flex;gap:4px;}',
      '.lead-btn{padding:4px 8px;border:1px solid var(--hw-border);border-radius:6px;background:var(--hw-surface);cursor:pointer;font-size:.8rem;transition:all .15s;}',
      '.lead-btn:hover{background:var(--hw-primary-l);border-color:var(--hw-primary);}',
      '@media(max-width:900px){.pipeline-grid{grid-template-columns:1fr;}}'
    ].join('');
    document.head.appendChild(style);
  }

  /* ── REGISTER ROUTE ──────────────────────────────────────── */
  function registerRoute() {
    if (!window._dashboardViews) window._dashboardViews = {};
    window._dashboardViews['pipeline'] = {
      title: 'Pipeline Inteligente — Lead Scoring',
      sub: 'Priorización automática de prospectos por probabilidad de cierre'
    };
    // Patch navigate if available
    var origNavigate = window._navigate;
    window._navigate = function(viewId) {
      if (viewId === 'pipeline') renderPipeline();
      if (origNavigate) origNavigate(viewId);
    };
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function init() {
    injectHTML();
    seedLeads();
    registerRoute();
    var hot = DB.getAll().filter(function(l){ return l.score >= 70; }).length;
    var badge = document.getElementById('pipelineHotCount');
    if (badge) badge.textContent = hot;

    // Re-render when view is clicked
    document.addEventListener('click', function(e) {
      var item = e.target.closest('[data-view="pipeline"]');
      if (item) { setTimeout(renderPipeline, 50); }
    });

    // Cross-module: listen for audit leads
    window.AigenciaLabOnAuditLead = function(data) { addLeadFromAudit(data); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ModPipeline = { getLeads: DB.getAll.bind(DB), addLead: addLeadFromAudit, refresh: renderPipeline };
})();


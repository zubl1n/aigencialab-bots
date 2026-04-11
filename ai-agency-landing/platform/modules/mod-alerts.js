/* ═══════════════════════════════════════════════════════════════
   mod-alerts.js — Motor de Alertas de Negocio IA
   Detecta y notifica eventos críticos de negocio
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'AigenciaLab_biz_alerts';
  var WA_SALES = '56912345678';

  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
  function ts() { return new Date().toISOString(); }
  function rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  var ALERT_TYPES = {
    conversion_drop:    { icon: '📉', label: 'Caída de Conversiones', color: '#DC2626', priority: 'critical' },
    low_stock:          { icon: '📦', label: 'Stock Crítico',          color: '#D97706', priority: 'high' },
    no_response:        { icon: '🤐', label: 'Cliente Sin Respuesta',  color: '#D97706', priority: 'high' },
    abandoned_cart:     { icon: '🛒', label: 'Carrito Abandonado',     color: '#6C3AED', priority: 'medium' },
    sla_breach:         { icon: '🚚', label: 'SLA Incumplido',         color: '#DC2626', priority: 'critical' },
    security_threat:    { icon: '🛡️', label: 'Amenaza de Seguridad',  color: '#DC2626', priority: 'critical' },
    churn_risk:         { icon: '⚠️', label: 'Riesgo de Churn',       color: '#D97706', priority: 'high' },
    payment_failed:     { icon: '💳', label: 'Pago Fallido',           color: '#DC2626', priority: 'critical' }
  };

  var DB = {
    load: function() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; } },
    save: function(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch(e) {} },
    getAll: function() { return this.load().slice(0, 100); },
    add: function(alert) {
      var all = this.load();
      all.unshift(alert);
      this.save(all.slice(0, 200));
    },
    dismiss: function(id) {
      var all = this.load().map(function(a) {
        if (a.id === id) a.dismissed = true;
        return a;
      });
      this.save(all);
    },
    dismissAll: function() {
      var all = this.load().map(function(a) { a.dismissed = true; return a; });
      this.save(all);
    }
  };

  /* ── ALERT RULES ENGINE ───────────────────────────────────── */
  var RULES = [
    {
      id: 'rule_conversion',
      check: function() { return rand(0, 10) < 2; }, // 20% chance per check
      generate: function() {
        var drop = rand(16, 35);
        var companies = ['RetailSur SpA', 'Moda Urbana', 'TechSur Ltda'];
        return {
          id: uid(), type: 'conversion_drop', ts: ts(), dismissed: false,
          title: 'Caída de conversiones: -' + drop + '% en 7 días',
          detail: 'Cliente: ' + pick(companies) + ' — Checkout móvil mostrando tasa de abandono inusual.',
          action: '📊 Ver dashboard de ecommerce', actionType: 'navigate', actionTarget: 'ecommerce',
          waText: 'Alerta: Cliente detectó caída de ' + drop + '% en conversiones esta semana. Requiere revisión urgente del flujo de checkout.'
        };
      }
    },
    {
      id: 'rule_stock',
      check: function() { return rand(0, 10) < 3; },
      generate: function() {
        var products = ['Monitor 4K 27"', 'Notebook Pro 15"', 'SSD 1TB NVMe', 'RAM DDR5 32GB'];
        var p = pick(products);
        var qty = rand(0, 5);
        return {
          id: uid(), type: 'low_stock', ts: ts(), dismissed: false,
          title: 'Stock crítico: ' + p + ' (' + qty + ' unidades)',
          detail: 'Demanda semanal estimada: ' + rand(8, 25) + ' uds. Cobertura restante: ' + rand(1, 4) + ' días.',
          action: '📦 Ver inventario', actionType: 'navigate', actionTarget: 'ecommerce',
          waText: '🚨 Alerta de stock: ' + p + ' con solo ' + qty + ' unidades. Restock urgente recomendado.'
        };
      }
    },
    {
      id: 'rule_noresponse',
      check: function() { return rand(0, 10) < 3; },
      generate: function() {
        var clients = ['ClinicaPro SpA', 'AgriSur SA', 'ConstruSol Ltda', 'LogiFast'];
        var c = pick(clients);
        var hours = rand(48, 120);
        return {
          id: uid(), type: 'no_response', ts: ts(), dismissed: false,
          title: 'Sin respuesta: ' + c + ' (' + hours + 'h)',
          detail: 'El cliente no responde desde hace ' + hours + 'h. Riesgo de churn elevado.',
          action: '💬 Enviar WhatsApp', actionType: 'whatsapp',
          waText: 'Seguimiento para ' + c + ' — Sin actividad por ' + hours + 'h. Por favor verificar estado del servicio.'
        };
      }
    },
    {
      id: 'rule_cart',
      check: function() { return rand(0, 10) < 4; },
      generate: function() {
        var amount = rand(85000, 450000);
        return {
          id: uid(), type: 'abandoned_cart', ts: ts(), dismissed: false,
          title: 'Carrito abandonado: $' + amount.toLocaleString('es-CL'),
          detail: rand(2, 5) + ' productos. Recuperación automática disponible.',
          action: '🔄 Activar recuperación', actionType: 'navigate', actionTarget: 'ecommerce',
          waText: '🛒 Carrito abandonado detectado por $' + amount.toLocaleString('es-CL') + '. Enviando mensaje de recuperación WhatsApp.'
        };
      }
    },
    {
      id: 'rule_sla',
      check: function() { return rand(0, 10) < 2; },
      generate: function() {
        var ids = ['ENV-' + rand(50000,99999)];
        var couriers = ['Starken', 'Chilexpress'];
        return {
          id: uid(), type: 'sla_breach', ts: ts(), dismissed: false,
          title: 'SLA vencido: Envío ' + ids[0],
          detail: 'Courier ' + pick(couriers) + ' — Plazo de 72h superado. Cliente notificado automáticamente.',
          action: '🚚 Ver logística', actionType: 'navigate', actionTarget: 'logistics',
          waText: '⚠️ SLA incumplido en envío ' + ids[0] + '. Cliente fue notificado. Requiere gestión de incidencia.'
        };
      }
    },
    {
      id: 'rule_churn',
      check: function() { return rand(0, 10) < 2; },
      generate: function() {
        var clients = ['RetailSur SpA', 'AgriSur SA', 'LogiChile'];
        var c = pick(clients);
        var risk = rand(72, 95);
        return {
          id: uid(), type: 'churn_risk', ts: ts(), dismissed: false,
          title: 'Riesgo de churn: ' + c + ' (' + risk + '%)',
          detail: 'Sin actividad en los últimos ' + rand(45, 90) + ' días. Valor en riesgo: $' + rand(500000, 5000000).toLocaleString('es-CL') + '/mes.',
          action: '📈 Ver análisis BI', actionType: 'navigate', actionTarget: 'bi',
          waText: '⚠️ ' + c + ' tiene ' + risk + '% de probabilidad de churn. Recomendada intervención proactiva.'
        };
      }
    }
  ];

  /* ── ALERT ENGINE LOOP ────────────────────────────────────── */
  function runRules() {
    RULES.forEach(function(rule) {
      if (rule.check()) {
        var alert = rule.generate();
        DB.add(alert);
        showToast(alert);
        updateBadge();
      }
    });
  }

  function showToast(alert) {
    var cfg = ALERT_TYPES[alert.type] || ALERT_TYPES.conversion_drop;
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--hw-card);border:1px solid ' + cfg.color + ';border-left:4px solid ' + cfg.color + ';border-radius:10px;padding:14px 16px;max-width:320px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:9999;font-family:Inter,sans-serif;font-size:.82rem;cursor:pointer;transition:all .3s;';
    toast.innerHTML = '<div style="display:flex;gap:8px;align-items:flex-start;"><span style="font-size:1.1rem">' + cfg.icon + '</span><div><div style="font-weight:700;color:var(--hw-text);margin-bottom:2px;">' + alert.title + '</div><div style="color:var(--hw-sub)">' + alert.detail.substring(0, 60) + '…</div></div></div>';
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 5000);
    toast.addEventListener('click', function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (!document.getElementById('view-alerts')) return;
      if (window._navigate) window._navigate('alerts'); else navigate('alerts');
    });
  }

  function updateBadge() {
    var active = DB.getAll().filter(function(a) { return !a.dismissed; });
    var badge = document.getElementById('alertsBadge');
    if (badge) { badge.textContent = active.length > 9 ? '9+' : active.length; badge.style.display = active.length > 0 ? '' : 'none'; }
  }

  /* ── RENDER ───────────────────────────────────────────────── */
  function renderAlerts() {
    var view = document.getElementById('view-alerts');
    if (!view) return;
    var all = DB.getAll();
    var active = all.filter(function(a){ return !a.dismissed; });
    var dismissed = all.filter(function(a){ return a.dismissed; });

    view.querySelector('.alerts-kpis').innerHTML = [
      kpi('Alertas Activas', active.length, '', active.length > 0 ? '#DC2626' : '#059669'),
      kpi('Críticas', active.filter(function(a){ var t=ALERT_TYPES[a.type]; return t&&t.priority==='critical'; }).length, '', '#DC2626'),
      kpi('Resueltas (24h)', dismissed.filter(function(a){ return (Date.now()-new Date(a.ts).getTime())<86400000; }).length, '', '#059669'),
      kpi('Total (30d)', all.length, '', '#6B7280')
    ].join('');

    var listEl = view.querySelector('#alertsList');
    if (!active.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:var(--hw-sub);">✅ Sin alertas activas. Todo en orden.</div>';
    } else {
      listEl.innerHTML = active.map(function(a) {
        var cfg = ALERT_TYPES[a.type] || {};
        var timeAgo = Math.round((Date.now() - new Date(a.ts).getTime()) / 60000);
        var timeStr = timeAgo < 60 ? 'Hace ' + timeAgo + ' min' : 'Hace ' + Math.round(timeAgo/60) + 'h';
        return '<div class="alert-card ' + (cfg.priority === 'critical' ? 'critical' : (cfg.priority === 'high' ? 'warning' : 'info')) + '" style="position:relative;">' +
          '<div class="alert-icon">' + (cfg.icon || '⚡') + '</div>' +
          '<div class="alert-body"><div class="alert-title">' + a.title + '</div><div class="alert-desc">' + a.detail + '</div>' +
          '<div style="display:flex;gap:8px;margin-top:8px;">' +
            (a.actionType === 'navigate' ? '<button class="lead-btn" onclick="if(window._navigate)window._navigate(\''+a.actionTarget+'\')">🔍 ' + a.action + '</button>' : '') +
            '<button class="lead-btn btn-wa-alert" data-text="' + encodeURIComponent(a.waText) + '">💬 WhatsApp</button>' +
            '<button class="lead-btn btn-dismiss-alert" data-id="' + a.id + '">✓ Resolver</button>' +
          '</div></div>' +
          '<div class="alert-time">' + timeStr + '</div>' +
        '</div>';
      }).join('');
    }

    listEl.querySelectorAll('.btn-dismiss-alert').forEach(function(btn) {
      btn.addEventListener('click', function() { DB.dismiss(btn.getAttribute('data-id')); renderAlerts(); updateBadge(); });
    });
    listEl.querySelectorAll('.btn-wa-alert').forEach(function(btn) {
      btn.addEventListener('click', function() {
        window.open('https://wa.me/' + WA_SALES + '?text=' + btn.getAttribute('data-text'));
      });
    });
    updateBadge();
  }

  function kpi(label, value, delta, color) {
    return '<div class="kpi-card"><div class="kpi-label">'+label+'</div><div class="kpi-value" style="color:'+color+'">'+value+'</div>'+(delta?'<div class="kpi-delta">'+delta+'</div>':'')+'</div>';
  }

  /* ── INJECT HTML ─────────────────────────────────────────── */
  function injectHTML() {
    var logsNav = document.querySelector('[data-view="logs"]');
    if (logsNav && logsNav.parentNode) {
      var item = document.createElement('div');
      item.className = 'nav-item';
      item.setAttribute('data-view', 'alerts');
      item.innerHTML = '<span class="nav-icon">🔔</span><span>Alertas IA</span><span class="nav-badge" id="alertsBadge" style="background:rgba(220,38,38,.1);color:#DC2626;">0</span>';
      logsNav.parentNode.insertBefore(item, logsNav);
    }

    var pageContent = document.querySelector('.page-content');
    if (!pageContent) return;
    var div = document.createElement('div');
    div.className = 'module-view';
    div.id = 'view-alerts';
    div.innerHTML = [
      '<div class="kpi-row alerts-kpis"></div>',
      '<div class="panel">',
        '<div class="panel-header" style="display:flex;justify-content:space-between;align-items:center;">',
          '<div class="panel-title">🔔 Alertas de Negocio Activas</div>',
          '<button id="btnDismissAll" class="btn-outline-sm">✓ Resolver todas</button>',
        '</div>',
        '<div class="panel-body"><div id="alertsList"></div></div>',
      '</div>'
    ].join('');
    pageContent.appendChild(div);

    div.querySelector('#btnDismissAll').addEventListener('click', function() {
      DB.dismissAll(); renderAlerts(); updateBadge();
    });
  }

  /* ── SEED & INIT ─────────────────────────────────────────── */
  function seedAlerts() {
    if (DB.getAll().length > 0) return;
    // Generate initial batch
    for (var i = 0; i < 5; i++) {
      var rule = RULES[i % RULES.length];
      DB.add(rule.generate());
    }
  }

  function init() {
    injectHTML();
    seedAlerts();
    updateBadge();
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-view="alerts"]')) { setTimeout(renderAlerts, 50); }
    });
    // Run alert engine every 30 seconds
    setInterval(runRules, rand(25000, 45000));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.ModAlerts = { refresh: renderAlerts, addAlert: function(a) { DB.add(a); updateBadge(); } };
})();


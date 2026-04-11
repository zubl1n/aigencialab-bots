/* ═══════════════════════════════════════════════════════════════
   dashboard.js — Router, data seeding, and module orchestration
   AigenciaLab Enterprise Dashboard · Harmonic Workspace
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── HELPERS ──────────────────────────────────────────────── */
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function fmtCLP(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }
  function statusBadge(text, type) { return '<span class="status status-' + type + '">' + text + '</span>'; }
  function progressBar(pct, color) { return '<div class="progress-bar"><div class="fill ' + color + '" style="width:' + pct + '%;"></div></div>'; }

  /* ── ROUTER ──────────────────────────────────────────────── */
  var views = {
    overview:      { title: 'Overview — Ecosistema de Agentes',        sub: 'Vista consolidada de todos los agentes enterprise' },
    ecommerce:     { title: 'Sales & Inventory Sync',                  sub: 'Sincronización WooCommerce / Shopify en tiempo real' },
    logistics:     { title: 'Logística & Trazabilidad',                sub: 'Tracking de última milla y gestión de incidencias' },
    bi:            { title: 'Business Intelligence',                   sub: 'Forecasting de demanda, churn y segmentación' },
    cybersecurity: { title: 'Ciberseguridad & Compliance',             sub: 'Monitoreo WAF, anomalías y auditoría Ley 19.628' },
    logs:          { title: 'Logs del Sistema',                        sub: 'Registros en tiempo real de todos los agentes' },
    // Growth Layer v3 — registered at load, modules add content dynamically
    pipeline:      { title: 'Pipeline Inteligente — Lead Scoring',     sub: 'Priorización automática de prospectos por probabilidad de cierre' },
    support:       { title: 'Soporte & Tickets',                       sub: 'Gestión de tickets, SLA y comunicación con clientes' },
    alerts:        { title: 'Alertas de Negocio IA',                   sub: 'Motor de detección automática de eventos críticos' }
  };

  function navigate(viewId) {
    document.querySelectorAll('.module-view').forEach(function (v) { v.classList.remove('active'); });
    document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
    var viewEl = document.getElementById('view-' + viewId);
    var navEl  = document.querySelector('[data-view="' + viewId + '"]');
    if (viewEl) viewEl.classList.add('active');
    if (navEl)  navEl.classList.add('active');
    var info = views[viewId] || (window._dashboardViews && window._dashboardViews[viewId]) || {};
    document.getElementById('pageTitle').textContent = info.title || viewId;
    document.getElementById('pageSub').textContent   = info.sub   || '';
    window.location.hash = viewId;
    // Notify cross-module router (Growth Layer modules listen here)
    if (window._navigate) window._navigate(viewId);
  }

  // EVENT DELEGATION — handles nav items injected AFTER DOMContentLoaded
  document.addEventListener('click', function (e) {
    var item = e.target.closest('.nav-item[data-view]');
    if (item) navigate(item.getAttribute('data-view'));
  });

  // Expose globally so Growth Layer modules can call navigate()
  window._dashboardNavigate = navigate;

  // Handle hash on load (allow any known or module-registered view)
  var hash = window.location.hash.replace('#', '');
  if (hash) { navigate(hash); } else { navigate('overview'); }

  /* ── SEED DATA ──────────────────────────────────────────── */
  var PRODUCTS = ['Notebook Pro 15"', 'Monitor 4K 27"', 'Teclado Mecánico', 'Mouse Ergonómico', 'Webcam HD', 'Silla Gamer', 'Auriculares BT', 'Hub USB-C', 'SSD 1TB NVMe', 'RAM DDR5 32GB', 'GPU RTX 4070', 'Cable HDMI 2.1'];
  var COURIERS = ['Starken', 'Chilexpress', 'Blue Express', 'Correos de Chile'];
  var CITIES = ['Santiago', 'Valparaíso', 'Concepción', 'Temuco', 'Antofagasta', 'La Serena', 'Puerto Montt', 'Iquique'];
  var CLIENTS = ['ClinicaPro SpA', 'TechSur Ltda', 'AgriSur SA', 'LogiChile', 'Retail Sur', 'ContaFast', 'SaludMás', 'ConstruSol'];
  var STATUSES_SHIP = ['En bodega', 'En tránsito', 'En reparto', 'Entregado', 'Con incidencia'];

  function genSalesData(days) {
    var data = [];
    for (var i = 0; i < days; i++) {
      var d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      data.push({ label: d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }), value: rand(800000, 3200000) });
    }
    return data;
  }

  function genHourlyData() {
    var data = [];
    for (var h = 8; h <= 20; h++) data.push({ label: h + ':00', value: rand(50000, 450000) });
    return data;
  }

  function genForecast() {
    var data = [];
    var base = rand(1200000, 2000000);
    for (var i = 0; i < 30; i++) {
      var d = new Date(); d.setDate(d.getDate() + i);
      base += rand(-100000, 150000);
      if (base < 500000) base = 700000;
      data.push({ label: d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }), value: base });
    }
    return data;
  }

  function genInventory() {
    return PRODUCTS.map(function (p) {
      var stock = rand(0, 200);
      var minStock = rand(10, 50);
      return { sku: 'SKU-' + rand(10000, 99999), product: p, stock: stock, minStock: minStock, price: rand(15000, 890000), channel: pick(['WooCommerce', 'Shopify', 'Ambos']), status: stock <= minStock ? (stock === 0 ? 'Sin stock' : 'Bajo mínimo') : 'OK' };
    });
  }

  function genCarts() {
    return Array.from({ length: 8 }, function () {
      return {
        id: 'CART-' + rand(10000, 99999), cliente: pick(CLIENTS), productos: rand(1, 5), total: rand(25000, 450000),
        abandonado: rand(30, 720) + ' min', canal: pick(['Web', 'WhatsApp']), estado: pick(['Pendiente', 'WhatsApp enviado', 'Recuperado'])
      };
    });
  }

  function genShipments() {
    return Array.from({ length: 15 }, function () {
      var status = pick(STATUSES_SHIP);
      return {
        id: '#' + rand(50000, 99999), destino: pick(CITIES), courier: pick(COURIERS),
        fecha: new Date(Date.now() - rand(0, 5) * 86400000).toLocaleDateString('es-CL'),
        status: status, sla: status === 'Con incidencia' ? 'Vencido' : (rand(0, 10) > 2 ? 'OK' : 'En riesgo'), cliente: pick(CLIENTS)
      };
    });
  }

  function genChurn() {
    return Array.from({ length: 8 }, function () {
      return {
        cliente: pick(CLIENTS), ultimaCompra: rand(30, 180) + ' días', totalCompras: rand(2, 45),
        valor: rand(200000, 8000000), riesgo: rand(55, 98), segmento: pick(['Premium', 'Recurrente', 'Ocasional'])
      };
    }).sort(function (a, b) { return b.riesgo - a.riesgo; });
  }

  function genRestock() {
    return PRODUCTS.slice(0, 6).map(function (p) {
      var stock = rand(0, 15);
      return {
        producto: p, stockActual: stock, demandaSemanal: rand(5, 30),
        diasCobertura: stock > 0 ? Math.round(stock / rand(2, 8)) : 0,
        sugerencia: rand(20, 100), proveedor: pick(['DistribuTech', 'ImportChile', 'MegaStock']),
        prioridad: stock === 0 ? 'Crítica' : (stock < 10 ? 'Alta' : 'Media')
      };
    });
  }

  function genCompliance() {
    return [
      { control: 'Consentimiento de datos personales', ley: 'Art. 4 Ley 19.628', estado: 'Cumple', pct: 100 },
      { control: 'Cifrado de datos en reposo (AES-256)', ley: 'Art. 23 Ley 21.663', estado: 'Cumple', pct: 100 },
      { control: 'Cifrado en tránsito (TLS 1.3)', ley: 'Art. 23 Ley 21.663', estado: 'Cumple', pct: 100 },
      { control: 'Política de retención de datos', ley: 'Art. 6 Ley 19.628', estado: 'Cumple', pct: 95 },
      { control: 'Notificación de brechas (≤72h)', ley: 'Art. 9 Ley 21.663', estado: 'Cumple', pct: 100 },
      { control: 'Derecho de acceso del titular', ley: 'Art. 12 Ley 19.628', estado: 'Parcial', pct: 78 },
      { control: 'Evaluación de impacto privacidad', ley: 'Art. 15 Ley 19.628', estado: 'Pendiente', pct: 45 },
      { control: 'DPO designado', ley: 'Ley 21.663', estado: 'Cumple', pct: 100 }
    ];
  }

  /* ── RENDER CHARTS ──────────────────────────────────────── */
  // Overview
  ChartEngine.line('#overviewSalesChart', genSalesData(30), { color: '#2563EB', height: 220 });
  ChartEngine.donut('#overviewDonut', [
    { value: 42, color: '#2563EB' }, { value: 28, color: '#6C3AED' },
    { value: 18, color: '#059669' }, { value: 12, color: '#DC2626' }
  ], { size: 150, centerText: '7', centerSub: 'Agentes' });

  // Ecommerce
  ChartEngine.line('#ecomSalesChart', genHourlyData(), { color: '#2563EB', height: 200 });
  ChartEngine.bar('#ecomTopProducts', PRODUCTS.slice(0, 8).map(function (p) {
    return { label: p.split(' ')[0], value: rand(10, 85), color: '#2563EB' };
  }), { height: 200 });

  DataTable.create('#ecomInventoryTable', {
    columns: [
      { key: 'sku', label: 'SKU' },
      { key: 'product', label: 'Producto' },
      { key: 'stock', label: 'Stock', render: function (v, r) { return '<strong>' + v + '</strong>' + (v <= r.minStock ? ' ⚠' : ''); } },
      { key: 'minStock', label: 'Mín.' },
      { key: 'price', label: 'Precio', render: function (v) { return fmtCLP(v); } },
      { key: 'channel', label: 'Canal' },
      { key: 'status', label: 'Estado', render: function (v) {
        if (v === 'Sin stock') return statusBadge(v, 'error');
        if (v === 'Bajo mínimo') return statusBadge(v, 'warning');
        return statusBadge(v, 'success');
      }}
    ],
    data: genInventory(), pageSize: 8
  });

  DataTable.create('#ecomCartsTable', {
    columns: [
      { key: 'id', label: 'ID' }, { key: 'cliente', label: 'Cliente' },
      { key: 'productos', label: 'Items' },
      { key: 'total', label: 'Monto', render: function (v) { return fmtCLP(v); } },
      { key: 'abandonado', label: 'Hace' }, { key: 'canal', label: 'Canal' },
      { key: 'estado', label: 'Estado', render: function (v) {
        if (v === 'Recuperado') return statusBadge(v, 'success');
        if (v === 'WhatsApp enviado') return statusBadge(v, 'info');
        return statusBadge(v, 'warning');
      }}
    ],
    data: genCarts(), pageSize: 6
  });

  // Logistics
  ChartEngine.bar('#logCourierChart', COURIERS.map(function (c) {
    return { label: c.split(' ')[0], value: rand(50, 350), color: pick(['#2563EB', '#059669', '#6C3AED', '#D97706']) };
  }), { height: 200 });

  DataTable.create('#logShipmentsTable', {
    columns: [
      { key: 'id', label: 'Envío' }, { key: 'cliente', label: 'Cliente' },
      { key: 'destino', label: 'Destino' }, { key: 'courier', label: 'Courier' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'status', label: 'Estado', render: function (v) {
        var m = { 'Entregado': 'success', 'En tránsito': 'info', 'En reparto': 'info', 'En bodega': 'muted', 'Con incidencia': 'error' };
        return statusBadge(v, m[v] || 'muted');
      }},
      { key: 'sla', label: 'SLA', render: function (v) {
        if (v === 'Vencido') return statusBadge(v, 'error');
        if (v === 'En riesgo') return statusBadge(v, 'warning');
        return statusBadge(v, 'success');
      }}
    ],
    data: genShipments(), pageSize: 8
  });

  // Business Intelligence
  ChartEngine.line('#biForecastChart', genForecast(), { color: '#6C3AED', height: 220 });
  ChartEngine.donut('#biSegmentDonut', [
    { value: 22, color: '#2563EB' }, { value: 34, color: '#6C3AED' },
    { value: 28, color: '#059669' }, { value: 16, color: '#D97706' }
  ], { size: 140, centerText: '5', centerSub: 'Segmentos' });

  DataTable.create('#biChurnTable', {
    columns: [
      { key: 'cliente', label: 'Cliente' },
      { key: 'ultimaCompra', label: 'Última Compra' },
      { key: 'totalCompras', label: 'Compras' },
      { key: 'valor', label: 'Valor Total', render: function (v) { return fmtCLP(v); } },
      { key: 'riesgo', label: 'Riesgo Churn', render: function (v) {
        var color = v >= 80 ? 'red' : (v >= 65 ? 'yellow' : 'green');
        return '<div style="display:flex;align-items:center;gap:8px;"><strong>' + v + '%</strong>' + progressBar(v, color) + '</div>';
      }},
      { key: 'segmento', label: 'Segmento', render: function (v) { return statusBadge(v, 'info'); } }
    ],
    data: genChurn(), pageSize: 8
  });

  DataTable.create('#biRestockTable', {
    columns: [
      { key: 'producto', label: 'Producto' },
      { key: 'stockActual', label: 'Stock', render: function (v) { return v === 0 ? '<strong style="color:#DC2626">0</strong>' : v; } },
      { key: 'demandaSemanal', label: 'Demanda/Sem' },
      { key: 'diasCobertura', label: 'Cobertura', render: function (v) { return v + ' días'; } },
      { key: 'sugerencia', label: 'Pedir', render: function (v) { return '<strong>' + v + ' uds</strong>'; } },
      { key: 'proveedor', label: 'Proveedor' },
      { key: 'prioridad', label: 'Prioridad', render: function (v) {
        return statusBadge(v, v === 'Crítica' ? 'error' : (v === 'Alta' ? 'warning' : 'info'));
      }}
    ],
    data: genRestock(), pageSize: 6
  });

  // Cybersecurity
  ChartEngine.bar('#cyberAttackChart', [
    { label: 'SQLi', value: 847, color: '#DC2626' },
    { label: 'XSS', value: 523, color: '#D97706' },
    { label: 'Brute', value: 412, color: '#6C3AED' },
    { label: 'DDoS', value: 189, color: '#2563EB' },
    { label: 'CSRF', value: 112, color: '#059669' },
    { label: 'Otros', value: 73, color: '#94A3B8' }
  ], { height: 200 });

  DataTable.create('#cyberComplianceTable', {
    columns: [
      { key: 'control', label: 'Control' },
      { key: 'ley', label: 'Referencia Legal' },
      { key: 'estado', label: 'Estado', render: function (v) {
        return statusBadge(v, v === 'Cumple' ? 'success' : (v === 'Parcial' ? 'warning' : 'error'));
      }},
      { key: 'pct', label: 'Completitud', render: function (v) {
        var color = v >= 90 ? 'green' : (v >= 60 ? 'yellow' : 'red');
        return '<div style="display:flex;align-items:center;gap:8px;">' + v + '%' + progressBar(v, color) + '</div>';
      }}
    ],
    data: genCompliance(), pageSize: 10
  });

  // Logs
  var logViewer = LogViewer.create('#systemLogs');
  var LOG_MSGS = [
    { level: 'info', msg: 'Stock sincronizado: WooCommerce → Defontana (347 SKUs)', agent: 'Ecommerce' },
    { level: 'info', msg: 'Orden #58412 creada — $127,500 — Shopify', agent: 'Ecommerce' },
    { level: 'warn', msg: 'SLA en riesgo: Envío #58392 Starken (Stgo→Temuco)', agent: 'Logística' },
    { level: 'info', msg: 'Envío #58391 entregado exitosamente — Chilexpress', agent: 'Logística' },
    { level: 'info', msg: 'Forecast Semana 16 generado — Accuracy 91.7%', agent: 'BI' },
    { level: 'warn', msg: 'Cliente "AgriSur SA" en riesgo de churn (87%)', agent: 'BI' },
    { level: 'error', msg: 'SQL Injection bloqueada: IP 45.33.32.156 → /api/v1/products', agent: 'Cibersec' },
    { level: 'info', msg: 'Escaneo de vulnerabilidades completado — 0 críticas', agent: 'Cibersec' },
    { level: 'info', msg: 'Carrito abandonado CART-34821 — WhatsApp de recuperación enviado', agent: 'Ecommerce' },
    { level: 'warn', msg: 'Certificado SSL expira en 14 días: api.cliente-ejemplo.cl', agent: 'Cibersec' },
    { level: 'info', msg: 'Restock sugerido: "SSD 1TB NVMe" — Pedir 45 uds a DistribuTech', agent: 'BI' },
    { level: 'info', msg: 'Incidencia #IR-447 resuelta — Envío reenviado', agent: 'Logística' }
  ];

  // Seed logs
  LOG_MSGS.forEach(function (l) { logViewer.add(l.level, l.msg, l.agent); });

  // Simulate live logs
  setInterval(function () {
    var l = pick(LOG_MSGS);
    logViewer.add(l.level, l.msg + ' [' + rand(1, 999) + ']', l.agent);
  }, 4000 + rand(0, 3000));

})();


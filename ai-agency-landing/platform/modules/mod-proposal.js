/* ═══════════════════════════════════════════════════════════════
   mod-proposal.js — Generador de Propuesta Comercial PDF
   Usa window.print() + @media print — ZERO dependencias
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var RUBRO_SOLUTIONS = {
    'Ecommerce Retail': ['Sales & Inventory Sync', 'Recuperación de Carritos WhatsApp', 'Agente de Atención 24/7'],
    'Ecommerce Moda':   ['Asistente de Tallas y Estilismo IA', 'Stock Sync WooCommerce/Shopify', 'Bot de Recuperación de Carritos'],
    'Clínica':          ['Agendamiento Automático de Citas', 'Recordatorio WhatsApp Pre-Consulta', 'Recepción Virtual 24/7'],
    'Logística':        ['Tracking Auto-Respuesta WhatsApp', 'Alertas SLA Inteligentes', 'Dashboard de Operaciones IA'],
    'Inmobiliaria':     ['Calificador de Leads IA', 'Seguimiento WhatsApp Automático', 'CRM Pipeline con Scoring'],
    'Moda':             ['Bot Estilismo IA', 'Recuperación de Carritos', 'Sync de Stock Multicana'],
    'Manufactura':      ['Dashboard OEE Tiempo Real', 'Predicción de Insumos IA', 'Backoffice Automático'],
    'default':          ['Agente de Ventas Autónomo', 'Automatización de Atención al Cliente', 'Dashboard de BI Predictivo']
  };

  var PLANS = [
    { name: 'STARTER', price: 'UF 18/mes', setup: 'Setup: UF 80', features: ['1 agente IA incluido', '10.000 consultas/mes', 'Soporte por email ≤24h', 'Dashboard básico', 'SLA Uptime 99.5%'] },
    { name: 'ADVANCED', price: 'UF 45/mes', setup: 'Setup: UF 180', features: ['2 agentes IA incluidos', '50.000 consultas/mes', 'Soporte Slack ≤4h', 'Dashboard avanzado + Logística', 'Multi-canal WhatsApp+Web+Email', 'SLA Uptime 99.9%'], recommended: true },
    { name: 'ENTERPRISE', price: 'UF 85+/mes', setup: 'Setup: UF 350+ (custom)', features: ['4 agentes Enterprise', 'Consultas ilimitadas', 'Soporte Slack + PM dedicado', 'Dashboard completo + BI Predictivo', 'Servidores dedicados en Chile', 'Ciberseguridad SOC 24/7', 'SLA 99.9% + penalidades'] }
  ];

  function fmtDate() {
    return new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function getRubroSolutions(rubro) {
    for (var key in RUBRO_SOLUTIONS) {
      if (rubro && rubro.toLowerCase().indexOf(key.toLowerCase()) !== -1) return RUBRO_SOLUTIONS[key];
    }
    return RUBRO_SOLUTIONS['default'];
  }

  function randomSavings(rubro) {
    var ranges = {
      'Clínica': [2500000, 7000000], 'Logística': [3000000, 9000000],
      'Inmobiliaria': [4000000, 12000000], 'Manufactura': [5000000, 15000000],
      'default': [800000, 4500000]
    };
    for (var key in ranges) {
      if (rubro && rubro.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        var r = ranges[key];
        return Math.floor(Math.random() * (r[1] - r[0]) + r[0]);
      }
    }
    var d = ranges['default'];
    return Math.floor(Math.random() * (d[1] - d[0]) + d[0]);
  }

  function fmtCLP(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }

  function generate(lead) {
    var solutions = getRubroSolutions(lead.rubro || '');
    var savings = randomSavings(lead.rubro || '');
    var recommendedPlan = lead.score >= 70 ? 2 : (lead.score >= 40 ? 1 : 0);

    var html = [
      '<!DOCTYPE html><html lang="es-CL"><head>',
      '<meta charset="UTF-8"/>',
      '<meta name="viewport" content="width=device-width,initial-scale=1"/>',
      '<title>Propuesta Comercial AigenciaLab — ' + (lead.company || 'Cliente') + '</title>',
      '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>',
      '<style>',
      ':root{--primary:#2563EB;--violet:#6C3AED;--dark:#0A0A0F;--text:#1A1D23;--sub:#6B7280;--border:#E2E5EA;--success:#059669;}',
      '*{box-sizing:border-box;margin:0;padding:0;}body{font-family:"Inter",sans-serif;color:var(--text);background:#fff;}',
      '.page{max-width:800px;margin:0 auto;padding:40px 48px;}',
      '@media print{.page{max-width:100%;padding:24px 32px;} .no-print{display:none!important;}}',
      '.cover{background:linear-gradient(135deg,var(--dark) 60%,#1e1e40);color:#fff;border-radius:16px;padding:48px;margin-bottom:40px;position:relative;overflow:hidden;}',
      '.cover::after{content:"";position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(circle,rgba(108,58,237,.3),transparent);border-radius:50%;}',
      '.cover-logo{font-size:1.4rem;font-weight:800;margin-bottom:32px;letter-spacing:-.5px;}',
      '.cover-logo span{color:#00D4FF;}',
      '.cover-title{font-size:2rem;font-weight:800;line-height:1.2;margin-bottom:8px;}',
      '.cover-sub{font-size:1rem;opacity:.7;margin-bottom:32px;}',
      '.cover-meta{display:flex;gap:24px;flex-wrap:wrap;}',
      '.meta-item{font-size:.82rem;opacity:.7;}',
      '.meta-item strong{display:block;color:#fff;opacity:1;font-size:.9rem;}',
      '.section{margin-bottom:36px;}',
      '.section-title{font-size:1.1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:2px solid var(--border);}',
      '.section-title::before{content:"";width:4px;height:18px;background:linear-gradient(to bottom,var(--primary),var(--violet));border-radius:2px;}',
      '.pain-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
      '.pain-card{background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:14px;font-size:.85rem;}',
      '.pain-card .p-icon{font-size:1.2rem;margin-bottom:4px;}',
      '.pain-card .p-title{font-weight:700;margin-bottom:2px;}',
      '.pain-card .p-desc{color:var(--sub);font-size:.78rem;}',
      '.solution-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}',
      '.solution-row:last-child{border-bottom:none;}',
      '.sol-num{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--violet));color:#fff;font-size:.78rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.sol-title{font-weight:600;font-size:.9rem;}',
      '.sol-desc{font-size:.78rem;color:var(--sub);}',
      '.savings-block{background:linear-gradient(135deg,#EEF7F2,#EFF6FF);border:1px solid #D1FAE5;border-radius:14px;padding:24px;text-align:center;}',
      '.savings-label{font-size:.85rem;color:var(--sub);margin-bottom:4px;}',
      '.savings-amount{font-size:2.4rem;font-weight:800;color:var(--success);font-variant-numeric:tabular-nums;}',
      '.savings-sub{font-size:.78rem;color:var(--sub);margin-top:4px;}',
      '.plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}',
      '.plan-card{border:1px solid var(--border);border-radius:12px;padding:18px;position:relative;}',
      '.plan-recommended{border-color:var(--primary);box-shadow:0 0 0 3px rgba(37,99,235,.1);}',
      '.plan-badge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;font-size:.65rem;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;}',
      '.plan-name{font-size:.75rem;font-weight:700;letter-spacing:1px;color:var(--sub);margin-bottom:6px;}',
      '.plan-price{font-size:1.3rem;font-weight:800;color:var(--text);margin-bottom:2px;}',
      '.plan-setup{font-size:.72rem;color:var(--sub);margin-bottom:10px;}',
      '.plan-feature{font-size:.75rem;color:var(--text);margin-bottom:4px;display:flex;align-items:flex-start;gap:6px;}',
      '.plan-feature::before{content:"✓";color:var(--success);font-weight:700;flex-shrink:0;}',
      '.timeline{display:flex;flex-direction:column;gap:12px;}',
      '.timeline-item{display:flex;gap:14px;}',
      '.tl-num{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--violet));color:#fff;font-size:.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.tl-title{font-weight:700;font-size:.9rem;margin-bottom:2px;}',
      '.tl-desc{font-size:.78rem;color:var(--sub);}',
      '.footer-proposal{margin-top:40px;padding-top:20px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:.75rem;color:var(--sub);}',
      '.cta-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 24px;background:linear-gradient(135deg,#25D366,#128C7E);border-radius:10px;color:#fff;font-weight:700;font-size:.9rem;text-decoration:none;margin-bottom:20px;}',
      '.proposal-actions{text-align:center;padding:24px 0;}',
      '</style></head><body>',
      '<div class="page">',

      // Print button
      '<div class="proposal-actions no-print">',
      '<a href="#" onclick="window.print();return false;" class="cta-btn">🖨️ Descargar / Imprimir PDF</a>',
      '</div>',

      // Cover
      '<div class="cover">',
      '<div class="cover-logo">AigenciaLab<span>.cl</span></div>',
      '<div class="cover-title">Propuesta de Automatización IA</div>',
      '<div class="cover-sub">Soluciones Enterprise para ' + (lead.company || 'Tu Empresa') + '</div>',
      '<div class="cover-meta">',
      '<div class="meta-item"><strong>' + (lead.company || '—') + '</strong>Empresa</div>',
      '<div class="meta-item"><strong>' + (lead.contact || '—') + '</strong>Contacto</div>',
      '<div class="meta-item"><strong>' + (lead.rubro || '—') + '</strong>Industria</div>',
      '<div class="meta-item"><strong>' + fmtDate() + '</strong>Fecha</div>',
      (lead.prob ? '<div class="meta-item"><strong>' + lead.prob + '%</strong>Prob. Aceptación</div>' : ''),
      '</div></div>',

      // Resumen ejecutivo
      '<div class="section">',
      '<div class="section-title">📋 Resumen Ejecutivo</div>',
      '<p style="font-size:.9rem;line-height:1.7;color:var(--sub);">Esta propuesta ha sido generada automáticamente para <strong>' + (lead.company || 'tu empresa') + '</strong> del rubro <strong>' + (lead.rubro || 'general') + '</strong>. ',
      'Basándonos en el análisis de madurez digital y los patrones de automatización típicos de tu industria en Chile, ',
      'identificamos <strong>' + solutions.length + ' áreas de automatización IA</strong> con alto impacto en eficiencia y ROI.</p>',
      '</div>',

      // Dolores detectados
      '<div class="section">',
      '<div class="section-title">🔴 Dolores Detectados</div>',
      '<div class="pain-grid">',
      '<div class="pain-card"><div class="p-icon">⏰</div><div class="p-title">Atención fuera de horario</div><div class="p-desc">El 35% de consultas llegan fuera de horario sin respuesta. Pérdida directa de leads.</div></div>',
      '<div class="pain-card"><div class="p-icon">📊</div><div class="p-title">Procesos manuales repetitivos</div><div class="p-desc">Tareas de backoffice que se pueden automatizar al 100% con IA, ahorrando 80-120h/mes.</div></div>',
      '<div class="pain-card"><div class="p-icon">💬</div><div class="p-title">Tiempo de respuesta lento</div><div class="p-desc">Cada hora de espera reduce la satisfacción en 15% y aumenta el riesgo de churn.</div></div>',
      '<div class="pain-card"><div class="p-icon">📈</div><div class="p-title">Sin datos accionables</div><div class="p-desc">Decisiones basadas en intuición en lugar de datos predictivos en tiempo real.</div></div>',
      '</div></div>',

      // Soluciones IA
      '<div class="section">',
      '<div class="section-title">🚀 Soluciones IA Propuestas</div>',
      solutions.map(function(sol, i) {
        var descs = ['Implementación en 2 semanas. Integración nativa con tus herramientas actuales.',
          'ROI positivo en menos de 90 días. Disponible 24/7 sin costo adicional por hora.',
          'Cumplimiento total Ley 19.628 y Ley 21.663. Datos en Chile.'];
        return '<div class="solution-row"><div class="sol-num">'+(i+1)+'</div><div><div class="sol-title">'+sol+'</div><div class="sol-desc">'+descs[i%descs.length]+'</div></div></div>';
      }).join(''),
      '</div>',

      // Ahorro estimado
      '<div class="section">',
      '<div class="section-title">💰 Ahorro Estimado</div>',
      '<div class="savings-block">',
      '<div class="savings-label">Ahorro mensual estimado con automatización IA</div>',
      '<div class="savings-amount">' + fmtCLP(savings) + '</div>',
      '<div class="savings-sub">Basado en benchmarks del rubro ' + (lead.rubro||'') + ' en Chile · Garantía de ROI en 90 días o ajustamos sin costo.</div>',
      '</div></div>',

      // Planes
      '<div class="section">',
      '<div class="section-title">📦 Plan Recomendado</div>',
      '<div class="plans-grid">',
      PLANS.map(function(plan, i) {
        return '<div class="plan-card'+(i===recommendedPlan?' plan-recommended':'')+'">'+
          (i===recommendedPlan?'<div class="plan-badge">⭐ RECOMENDADO</div>':'')+
          '<div class="plan-name">'+plan.name+'</div>'+
          '<div class="plan-price">'+plan.price+'</div>'+
          '<div class="plan-setup">'+plan.setup+'</div>'+
          plan.features.map(function(f){ return '<div class="plan-feature">'+f+'</div>'; }).join('')+
        '</div>';
      }).join(''),
      '</div></div>',

      // Timeline
      '<div class="section">',
      '<div class="section-title">🗓️ Timeline de Implementación</div>',
      '<div class="timeline">',
      '<div class="timeline-item"><div class="tl-num">1</div><div><div class="tl-title">Semana 1-2 — Onboarding y Configuración</div><div class="tl-desc">Integración con sistemas actuales, carga de FAQs, configuración de flujos específicos del rubro.</div></div></div>',
      '<div class="timeline-item"><div class="tl-num">2</div><div><div class="tl-title">Semana 3-4 — Piloto y Ajuste</div><div class="tl-desc">Prueba en producción con tráfico real. Ajuste de respuestas y flujos según feedback.</div></div></div>',
      '<div class="timeline-item"><div class="tl-num">3</div><div><div class="tl-title">Mes 2 en adelante — Optimización Continua</div><div class="tl-desc">Reportes mensuales, mejoras proactivas y escalamiento según crecimiento del cliente.</div></div></div>',
      '</div></div>',

      // CTA
      '<div class="section" style="text-align:center;">',
      '<div class="section-title" style="justify-content:center;">✅ Siguiente Paso</div>',
      '<p style="font-size:.9rem;color:var(--sub);margin-bottom:20px;">Esta propuesta tiene validez de 30 días. Agenda una sesión de 45 min para revisar detalles y comenzar el onboarding.</p>',
      '<a href="https://wa.me/56912345678?text='+encodeURIComponent('Hola AigenciaLab! Recibí la propuesta para '+( lead.company||'mi empresa')+' y quiero avanzar. ¿Cuándo podemos agendar?')+'" class="cta-btn" target="_blank">💬 Aceptar Propuesta por WhatsApp</a>',
      '</div>',

      // Footer
      '<div class="footer-proposal">',
      '<span>AigenciaLab.cl · Santiago, Chile · contacto@AigenciaLab.cl</span>',
      '<span>🔒 Ley N°21.663 + Ley N°19.628 · Datos protegidos en Chile</span>',
      '</div>',

      '</div></body></html>'
    ].join('');

    // Open in new window and auto-print
    var w = window.open('', '_blank', 'width=900,height=700');
    if (w) {
      w.document.write(html);
      w.document.close();
    } else {
      alert('Permite ventanas emergentes para descargar la propuesta PDF.');
    }
  }

  window.ModProposal = { generate: generate };
})();


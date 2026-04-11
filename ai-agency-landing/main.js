/* =====================================================================
   AigenciaLab.cl — main.js (Enterprise v2)
   Stack: Vanilla JS (sin dependencias)
   Cumplimiento: Ley N°21.663 + Ley N°19.628
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ── SCROLL REVEAL (IntersectionObserver) ──────────────────── */
  var revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(function (el) { observer.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── COUNTER ANIMATION ────────────────────────────────────── */
  function animateCounter(el, target, suffix, duration) {
    if (!el) return;
    var start = 0; var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current.toLocaleString('es-CL') + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Trigger counters when hero is visible
  var heroTerminal = document.querySelector('.hero-terminal');
  if (heroTerminal && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        animateCounter(document.getElementById('counterLeads'), 14283, '', 2000);
        animateCounter(document.getElementById('counterDocs'), 8741, '', 2200);
        animateCounter(document.getElementById('counterThreats'), 2156, '', 1800);
        counterObserver.disconnect();
      }
    }, { threshold: 0.5 });
    counterObserver.observe(heroTerminal);
  }

  /* ── ROI CALCULATOR ───────────────────────────────────────── */
  var hoursSlider  = document.getElementById('hoursSlider');
  var salarySlider = document.getElementById('salarySlider');
  var hoursVal     = document.getElementById('hoursVal');
  var salaryVal    = document.getElementById('salaryVal');
  var savingsEl    = document.getElementById('savingsAmount');

  function formatCLP(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }

  function recalcROI() {
    var h = parseInt(hoursSlider.value, 10);
    var s = parseInt(salarySlider.value, 10);
    var costPerHour = s / 160;
    var savings = h * costPerHour * 0.70;
    hoursVal.textContent = h + ' hrs';
    salaryVal.textContent = formatCLP(s);
    savingsEl.innerHTML = formatCLP(savings) +
      '<span style="font-size:1rem;color:var(--text-sub);font-weight:400;"> /mes</span>';
  }

  if (hoursSlider && salarySlider) {
    hoursSlider.addEventListener('input', recalcROI);
    salarySlider.addEventListener('input', recalcROI);
    recalcROI();
  }

  /* ── PRICING TOGGLE (Mensual / Anual) ─────────────────────── */
  var toggleMonthly = document.getElementById('toggleMonthly');
  var toggleAnnual  = document.getElementById('toggleAnnual');
  var priceEls      = document.querySelectorAll('.tier-price');

  function setPricing(period) {
    priceEls.forEach(function (el) {
      var m = el.getAttribute('data-m');
      var a = el.getAttribute('data-a');
      if (!m || !a) return;
      var val = period === 'annual' ? a : m;
      var suffix = period === 'annual' ? '+' : '';
      // Keep the "+" only for enterprise tier
      var isEnterprise = parseInt(m) >= 85;
      el.innerHTML = 'UF ' + val + (isEnterprise ? '+' : '') + ' <span>/mes</span>';
    });
    if (toggleMonthly && toggleAnnual) {
      toggleMonthly.classList.toggle('active', period === 'monthly');
      toggleAnnual.classList.toggle('active', period === 'annual');
    }
  }

  if (toggleMonthly) toggleMonthly.addEventListener('click', function () { setPricing('monthly'); });
  if (toggleAnnual)  toggleAnnual.addEventListener('click', function () { setPricing('annual'); });

  /* ── CONTACT FORM ─────────────────────────────────────────── */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = document.getElementById('fname').value.trim();
      var company = document.getElementById('fcompany').value.trim();
      var phone   = document.getElementById('fphone').value.trim();
      var area    = document.getElementById('farea').value;
      if (!name || !company || !phone || !area) return;
      var btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = '✅ ¡Recibido! Te contactaremos.';
      btn.disabled = true;
      btn.style.background = '#059669';
      btn.style.boxShadow = '0 0 20px rgba(5,150,105,.3)';
    });
  }

  /* ── CHAT WIDGET (Nova IA — Enterprise) ────────────────────── */
  var RESPONSES = [
    { keys:['hola','buenas','saludos','hey'], msg:'¡Hola! 👋 Soy <strong>Nova</strong>, IA de AigenciaLab.cl. ¿Buscas automatizar ecommerce, logística, BI o seguridad? Cuéntame sobre tu empresa.' },
    { keys:['precio','costo','cuanto','valor','tarifa'], msg:'📊 Nuestros planes Enterprise parten desde <strong>UF 18/mes</strong> (Starter) hasta <strong>UF 85+/mes</strong> (Enterprise 4 agentes). Setup único desde UF 80. ¿Quieres una cotización personalizada?' },
    { keys:['ecommerce','shopify','woocommerce','tienda','inventario','stock'], msg:'🛒 Nuestro agente <strong>Sales & Inventory Sync</strong> conecta WooCommerce/Shopify con tu ERP en tiempo real. Stock bidireccional + recuperación de carritos vía WhatsApp. <a href="platform/index.html#ecommerce" style="color:#00D4FF">→ Ver Dashboard</a>' },
    { keys:['logistica','envio','tracking','despacho','starken','chilexpress'], msg:'🚚 El agente de <strong>Logística y Trazabilidad</strong> integra Starken, Chilexpress y Blue Express con alertas de SLA. <a href="platform/index.html#logistics" style="color:#00D4FF">→ Ver Dashboard</a>' },
    { keys:['bi','analytics','prediccion','forecast','demanda','inteligencia'], msg:'📈 Nuestro agente de <strong>Business Intelligence</strong> hace forecasting de demanda, detección de churn y sugerencias de reabastecimiento. <a href="platform/index.html#bi" style="color:#00D4FF">→ Ver Dashboard</a>' },
    { keys:['seguridad','ciberseguridad','hack','vulnerabilidad','waf'], msg:'🛡 El agente de <strong>Ciberseguridad</strong> monitorea 24/7 con WAF, detección de anomalías y auditoría Ley 19.628. Notificación a ANCI en 72h.' },
    { keys:['whatsapp','wsp','wa','bot'], msg:'💬 Integración con <strong>WhatsApp Business API</strong> (Meta oficial). Ventas, soporte y recuperación de carritos. ¿Cuántos ejecutivos tienen?' },
    { keys:['demo','ver','mostrar','prueba'], msg:'🚀 Tenemos demos interactivos:<br><a href="demos/agente-ventas/index.html" style="color:#00D4FF">→ Ventas</a> · <a href="demos/agente-atencion/index.html" style="color:#00D4FF">→ Atención</a> · <a href="demos/agente-backoffice/index.html" style="color:#00D4FF">→ Backoffice</a><br><a href="platform/index.html" style="color:#A855F7">→ Dashboard Enterprise (4 agentes)</a>' },
    { keys:['ley','19628','21663','compliance','datos','privacidad'], msg:'🔒 Cumplimos <strong>Ley N°21.663</strong> (Ciberseguridad) + <strong>Ley N°19.628</strong> (Protección de Datos). Cifrado AES-256 + TLS 1.3. Servidores opcionales en Chile.' },
    { keys:['contacto','llamar','agendar','reunion','hablar','asesor'], msg:'📅 ¡Perfecto! Deja tu WhatsApp (+56 9 XXXX XXXX) y un consultor Enterprise te contacta hoy. Sin compromiso.' },
    { keys:['gracias','genial','perfecto','ok'], msg:'🙌 ¡Encantada de ayudar! Agenda tu <strong>Auditoría Gratuita</strong> → <a href="#contacto" style="color:#00D4FF">aquí</a>. Estoy disponible 24/7.' }
  ];
  var DEFAULT_MSG = '🤖 ¡Interesante! Para darte la mejor respuesta, ¿podrías contarme más sobre tu empresa y qué procesos quieres optimizar con IA?';

  function getResponse(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < RESPONSES.length; i++) {
      for (var j = 0; j < RESPONSES[i].keys.length; j++) {
        if (lower.indexOf(RESPONSES[i].keys[j]) !== -1) return RESPONSES[i].msg;
      }
    }
    return DEFAULT_MSG;
  }

  var widgetHTML = [
    '<div id="chatWidget" style="position:fixed;bottom:28px;right:28px;z-index:9999;font-family:Inter,system-ui,sans-serif;">',
      '<div id="chatBubble" title="Habla con Nova IA" style="width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#6C3AED);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 24px rgba(0,212,255,.4);transition:transform .3s,box-shadow .3s;">',
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      '</div>',
      '<div id="chatBox" style="display:none;position:absolute;bottom:72px;right:0;width:360px;background:#101018;border:1px solid rgba(0,212,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.7);">',
        '<div style="background:linear-gradient(135deg,#0A0A0F,#1a0e40);padding:16px 20px;display:flex;align-items:center;gap:12px;">',
          '<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#00D4FF,#6C3AED);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🤖</div>',
          '<div style="flex:1"><div style="font-weight:700;color:#EAEDF3;font-size:.92rem;">Nova · Enterprise IA</div><div style="font-size:.72rem;color:#00D4FF;">● En línea</div></div>',
          '<div id="chatClose" style="cursor:pointer;color:#555;font-size:1.2rem;">✕</div>',
        '</div>',
        '<div id="chatMessages" style="height:290px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;"></div>',
        '<div style="padding:10px 12px;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:8px;">',
          '<input id="chatInput" type="text" placeholder="Escribe tu consulta..." style="flex:1;background:#0A0A0F;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 14px;color:#EAEDF3;font-size:.88rem;outline:none;">',
          '<button id="chatSend" style="background:linear-gradient(135deg,#00D4FF,#6C3AED);color:#fff;border:none;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer;font-size:.85rem;">→</button>',
        '</div>',
        '<div style="padding:4px 16px 10px;font-size:.68rem;color:#333;text-align:center;">🔒 TLS 1.3 · Ley N°21.663 · Ley N°19.628 · Sin almacenamiento externo</div>',
      '</div>',
    '</div>'
  ].join('');

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  var bubble   = document.getElementById('chatBubble');
  var chatBox  = document.getElementById('chatBox');
  var closeBtn = document.getElementById('chatClose');
  var chatInput = document.getElementById('chatInput');
  var chatSend = document.getElementById('chatSend');
  var chatMsgs = document.getElementById('chatMessages');
  var chatOpen = false;

  function addMsg(text, who) {
    var div = document.createElement('div');
    div.style.cssText = 'display:flex;' + (who === 'user' ? 'justify-content:flex-end;' : '');
    var bub = document.createElement('div');
    bub.innerHTML = text;
    bub.style.cssText = 'max-width:82%;padding:10px 14px;border-radius:12px;font-size:.87rem;line-height:1.5;' +
      (who === 'user'
        ? 'background:linear-gradient(135deg,#00D4FF,#6C3AED);color:#fff;border-bottom-right-radius:2px;'
        : 'background:rgba(255,255,255,.05);color:#EAEDF3;border:1px solid rgba(255,255,255,.07);border-bottom-left-radius:2px;');
    div.appendChild(bub); chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function sendMsg() {
    var text = chatInput.value.trim(); if (!text) return;
    addMsg(text, 'user'); chatInput.value = '';
    setTimeout(function () { addMsg(getResponse(text), 'bot'); }, 600);
  }

  bubble.addEventListener('click', function () {
    chatOpen = !chatOpen; chatBox.style.display = chatOpen ? 'block' : 'none';
    if (chatOpen && chatMsgs.children.length === 0) {
      setTimeout(function () { addMsg('¡Hola! 👋 Soy <strong>Nova</strong>, asistente Enterprise de AigenciaLab.cl.<br>¿Buscas soluciones de IA para ecommerce, logística, BI o ciberseguridad?', 'bot'); }, 300);
    }
  });
  closeBtn.addEventListener('click', function () { chatOpen = false; chatBox.style.display = 'none'; });
  chatSend.addEventListener('click', sendMsg);
  chatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendMsg(); });

  setTimeout(function () { if (!chatOpen) bubble.click(); }, 10000);

  /* ── SMOOTH SCROLL NAV ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ── HEADER BG ON SCROLL ──────────────────────────────────── */
  var header = document.querySelector('header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) header.style.borderBottomColor = 'rgba(0,212,255,.08)';
    else header.style.borderBottomColor = 'rgba(255,255,255,.06)';
  }, { passive: true });
});


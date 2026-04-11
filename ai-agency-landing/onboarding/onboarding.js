/* ═══════════════════════════════════════════════════════════════
   onboarding.js — Wizard Logic
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var currentStep = 1;
  var totalSteps = 5;
  var config = { company: {}, products: [], faqs: [], channels: [], team: [] };

  // Default FAQs
  var defaultFaqs = [
    { q: '¿Cuáles son los horarios de atención?', a: '' },
    { q: '¿Hacen envíos a todo Chile?', a: '' },
    { q: '¿Cuáles son las formas de pago?', a: '' }
  ];

  // Default team
  var defaultTeam = [{ email: '', role: 'Admin' }];

  function goTo(step) {
    document.getElementById('panel' + currentStep).classList.remove('active');
    document.getElementById('sn' + currentStep).className = 'step-num done';
    document.getElementById('sn' + currentStep).textContent = '✓';
    if (currentStep < totalSteps && document.getElementById('sc' + currentStep)) {
      document.getElementById('sc' + currentStep).classList.add('done');
    }
    currentStep = step;
    if (step <= totalSteps) {
      document.getElementById('panel' + step).classList.add('active');
      document.getElementById('sn' + step).className = 'step-num active';
    } else {
      document.getElementById('panelSuccess').classList.add('active');
    }
    document.getElementById('stepIndicator').textContent = 'Paso ' + Math.min(step, totalSteps) + ' de ' + totalSteps;
    document.getElementById('btnPrev').style.display = step > 1 ? '' : 'none';
    document.getElementById('btnNext').style.display = step > totalSteps ? 'none' : '';
    if (step === totalSteps) document.getElementById('btnNext').textContent = 'Finalizar ✓';
    else document.getElementById('btnNext').textContent = 'Siguiente →';
    document.getElementById('obNav').style.display = step > totalSteps ? 'none' : '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function collectStep1() {
    config.company = {
      name: document.getElementById('s1-company').value.trim(),
      rubro: document.getElementById('s1-rubro').value,
      url: document.getElementById('s1-url').value.trim(),
      region: document.getElementById('s1-region').value,
      description: document.getElementById('s1-desc').value.trim()
    };
  }

  function collectStep2() {
    config.products = [];
    document.querySelectorAll('#productsBody tr').forEach(function(row) {
      var inputs = row.querySelectorAll('input');
      if (inputs[0] && inputs[0].value.trim()) {
        config.products.push({ name: inputs[0].value, price: inputs[1].value, stock: inputs[2].value, description: inputs[3].value });
      }
    });
  }

  function collectStep3() {
    config.faqs = [];
    document.querySelectorAll('.faq-item').forEach(function(item) {
      var inputs = item.querySelectorAll('input');
      if (inputs[0].value.trim()) config.faqs.push({ q: inputs[0].value, a: inputs[1].value });
    });
  }

  function collectStep4() {
    config.channels = [];
    document.querySelectorAll('.toggle-item.selected').forEach(function(item) {
      var ch = { type: item.getAttribute('data-channel') };
      var inp = document.getElementById('ch-' + ch.type);
      if (inp) ch.value = inp.value;
      config.channels.push(ch);
    });
  }

  function collectStep5() {
    config.team = [];
    document.querySelectorAll('.team-item').forEach(function(item) {
      var email = item.querySelector('input') ? item.querySelector('input').value.trim() : '';
      var role  = item.querySelector('select') ? item.querySelector('select').value : 'Operador';
      if (email) config.team.push({ email: email, role: role });
    });
  }

  document.getElementById('btnNext').addEventListener('click', function () {
    if (currentStep === 1) collectStep1();
    if (currentStep === 2) collectStep2();
    if (currentStep === 3) collectStep3();
    if (currentStep === 4) collectStep4();
    if (currentStep === 5) { collectStep5(); finalize(); }
    if (currentStep < totalSteps) goTo(currentStep + 1);
  });

  document.getElementById('btnPrev').addEventListener('click', function () {
    if (currentStep > 1) goTo(currentStep - 1);
  });

  /* ── PRODUCTS ─────────────────────────────────────────────── */
  function addProductRow(name, price, stock, desc) {
    var tbody = document.getElementById('productsBody');
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><input placeholder="Nombre" value="'+(name||'')+'"/></td>' +
      '<td><input type="number" placeholder="15000" value="'+(price||'')+'"/></td>' +
      '<td><input type="number" placeholder="0" value="'+(stock||'')+'"/></td>' +
      '<td><input placeholder="Descripción breve" value="'+(desc||'')+'"/></td>' +
      '<td><button onclick="this.closest(\'tr\').remove()" style="background:none;border:none;color:#DC2626;cursor:pointer;font-size:1rem;">🗑</button></td>';
    tbody.appendChild(tr);
  }
  addProductRow('Producto Ejemplo', '25990', '100', 'Descripción del producto');

  document.getElementById('btnAddProduct').addEventListener('click', function() { addProductRow(); });

  document.getElementById('csvFile').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var lines = ev.target.result.split('\n').slice(1);
      lines.forEach(function(line) {
        if (!line.trim()) return;
        var cols = line.split(',');
        addProductRow(cols[0], cols[1], cols[2], cols[3]);
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  /* ── FAQs ────────────────────────────────────────────────── */
  function addFaqRow(q, a) {
    var list = document.getElementById('faqList');
    var div = document.createElement('div');
    div.className = 'faq-item';
    div.innerHTML = '<div style="flex:1;display:flex;flex-direction:column;gap:4px;">' +
      '<input placeholder="Pregunta del cliente..." value="'+(q||'')+'"/>' +
      '<input placeholder="Respuesta del agente..." value="'+(a||'')+'"/>' +
    '</div><button onclick="this.closest(\'.faq-item\').remove()">✕</button>';
    list.appendChild(div);
  }
  defaultFaqs.forEach(function(f) { addFaqRow(f.q, f.a); });
  document.getElementById('btnAddFaq').addEventListener('click', function() { addFaqRow(); });

  /* ── CHANNELS ────────────────────────────────────────────── */
  var CHANNEL_FIELDS = {
    whatsapp: { label: '📱 Número WhatsApp Business (+56...)', placeholder: '+56 9 XXXX XXXX' },
    web:      { label: '🌐 URL de tu sitio web', placeholder: 'https://tu-empresa.cl' },
    email:    { label: '📧 Email de soporte', placeholder: 'soporte@empresa.cl' },
    instagram:{ label: '📸 Usuario de Instagram', placeholder: '@tuempresa' },
    facebook: { label: '👤 ID de Page de Facebook', placeholder: 'tuEmpresaPage' },
    slack:    { label: '💼 Webhook de Slack', placeholder: 'https://hooks.slack.com/...' }
  };

  document.querySelectorAll('.toggle-item').forEach(function(item) {
    item.addEventListener('click', function() {
      item.classList.toggle('selected');
      renderChannelFields();
    });
  });

  function renderChannelFields() {
    var fields = document.getElementById('channelFields');
    fields.innerHTML = '';
    document.querySelectorAll('.toggle-item.selected').forEach(function(item) {
      var ch = item.getAttribute('data-channel');
      var cfg = CHANNEL_FIELDS[ch];
      if (!cfg) return;
      var div = document.createElement('div');
      div.className = 'form-group';
      div.innerHTML = '<label>' + cfg.label + '</label><input id="ch-' + ch + '" placeholder="' + cfg.placeholder + '"/>';
      fields.appendChild(div);
    });
  }
  renderChannelFields();

  /* ── TEAM ────────────────────────────────────────────────── */
  function addTeamRow(email, role) {
    var list = document.getElementById('teamList');
    var div = document.createElement('div');
    div.className = 'team-item';
    div.innerHTML = '<input type="email" placeholder="email@empresa.cl" value="'+(email||'')+'"/>' +
      '<select><option value="Admin">Admin</option><option value="Operador">Operador</option><option value="Solo lectura">Solo lectura</option></select>' +
      '<button onclick="this.closest(\'.team-item\').remove()">✕</button>';
    if (role) div.querySelector('select').value = role;
    list.appendChild(div);
  }
  addTeamRow('', 'Admin');
  document.getElementById('btnAddTeam').addEventListener('click', function() { addTeamRow(); });

  /* ── LOGO UPLOAD ─────────────────────────────────────────── */
  var logoArea = document.getElementById('logoUploadArea');
  logoArea.addEventListener('click', function() { document.getElementById('logoFile').click(); });
  logoArea.addEventListener('dragover', function(e) { e.preventDefault(); logoArea.classList.add('drag-over'); });
  logoArea.addEventListener('dragleave', function() { logoArea.classList.remove('drag-over'); });
  logoArea.addEventListener('drop', function(e) { e.preventDefault(); logoArea.classList.remove('drag-over'); var f = e.dataTransfer.files[0]; if (f) loadLogo(f); });
  document.getElementById('logoFile').addEventListener('change', function(e) { if (e.target.files[0]) loadLogo(e.target.files[0]); });
  function loadLogo(file) {
    document.getElementById('logoPreview').textContent = '✅ ' + file.name + ' (' + Math.round(file.size/1024) + 'KB)';
    config.company.logoName = file.name;
  }

  /* ── SUPABASE SAVE ───────────────────────────────────────── */
  var SB_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbmJienB1Y2VmY2xkeml3cnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mzg3MTcsImV4cCI6MjA5MTQxNDcxN30.hlGA0SKaivCnp6x-gZ0_BbhhSD9Q7T_g2hSu--rLkSQ';

  function saveToSupabase(json) {
    var payload = {
      company: config.company.name || 'Onboarding',
      contact_name: (config.team[0] && config.team[0].email) || '',
      email: (config.team[0] && config.team[0].email) || '',
      url: config.company.url || '',
      rubro: config.company.rubro || '',
      source: 'onboarding',
      tier: 'hot',
      score: 100,
      whatsapp: '',
      notes: 'Onboarding completado. Canales: ' + config.channels.map(function(c){return c.type;}).join(', ')
    };
    return fetch(SB_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    }).then(function(r){ if(r.ok) console.log('[Onboarding] Lead guardado en Supabase ✅'); else console.warn('[Onboarding] Error Supabase:', r.status); })
      .catch(function(e){ console.warn('[Onboarding] Red no disponible, offline:', e.message); });
  }

  /* ── FINALIZE ────────────────────────────────────────────── */
  function finalize() {
    config.metadata = {
      generatedAt: new Date().toISOString(),
      platform: 'AigenciaLab.cl · Onboarding Self-Service v2',
      compliance: ['Ley N\u00b021.663', 'Ley N\u00b019.628'],
      version: '2.0'
    };
    var json = JSON.stringify(config, null, 2);
    document.getElementById('configOutput').textContent = json;
    saveToSupabase(json);
    document.getElementById('btnDownload').addEventListener('click', function() {
      var blob = new Blob([json], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'AigenciaLab-config-' + (config.company.name || 'empresa').replace(/\s+/g, '-').toLowerCase() + '-' + Date.now() + '.json';
      a.click();
    });
    goTo(totalSteps + 1);
  }
})();


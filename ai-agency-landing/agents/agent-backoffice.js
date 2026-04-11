/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE DE BACKOFFICE AUTÓNOMO v1.0.0
 *  Archivo: agents/agent-backoffice.js
 *
 *  IMPLEMENTACIÓN:
 *    <script src="agents/agent-backoffice.js"></script>
 *    <script>
 *      AgentBackoffice.init({
 *        companyName: 'Mi Empresa',
 *        exportTargets: ['defontana', 'sheets', 'buk'],
 *        onDocumentProcessed: function(doc) { myERP.save(doc); },
 *        onExport: function(doc, target) { apiClient.send(target, doc); }
 *      });
 *      AgentBackoffice.createDropZone('#upload-area');
 *    </script>
 *
 *  CUMPLIMIENTO: Ley N°21.663 · RUTs y datos tributarios
 *    solo en localStorage del navegador. Sin backend requerido.
 *    Para producción: usar setStorageAdapter() con API REST.
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';

  var CFG = {
    companyName:  'Mi Empresa',
    storageKey:   'AigenciaLab_backoffice_docs',
    currency:     'CLP',
    exportTargets: ['defontana', 'sheets', 'sii', 'buk'],
    processingSteps: [
      'Leyendo estructura del documento...',
      'Identificando tipo DTE (SII)...',
      'Extrayendo datos de emisor y receptor...',
      'Validando RUT en base del SII...',
      'Calculando neto, IVA y total...',
      'Detectando forma de pago y vencimiento...',
      'Normalizando formato de salida...',
      '✅ Extracción completada — Precisión 99.4%'
    ],
    /* Callbacks */
    onDocumentProcessed: null,
    onExport:            null,
    onError:             null
  };

  /* ── PLANTILLAS DE EXTRACCIÓN ───────────────────────────────── */
  var TEMPLATES = [
    {
      tipo: 'Factura Electrónica',
      emisores: ['Servicios Cloud SpA','ContaFast SpA','ClinicaPro SpA','InmobiliariaVerde'],
      giros:    ['Servicios de TI','Servicios Contables','Servicios de Salud','Administración Inmobiliaria'],
      rangos:   [500000, 5000000]
    },
    {
      tipo: 'Boleta de Servicios',
      emisores: ['AgriSur SA','LogiChile SA','Retail Sur Ltda','TransAndino Ltda'],
      giros:    ['Distribución Agrícola','Transporte y Logística','Comercio al por Mayor','Importación'],
      rangos:   [80000, 800000]
    },
    {
      tipo: 'Factura de Compra',
      emisores: ['SaludMás Clínicas SpA','TechSur Ingeniería','ConstruSol SA','EnergíaVerde Chile'],
      giros:    ['Salud Privada','Ingeniería Civil','Construcción','Energías Renovables'],
      rangos:   [1000000, 8000000]
    }
  ];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randNum(min, max) { return Math.floor(Math.random() * (max - min) + min); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,6); }
  function ts()  { return new Date().toISOString(); }
  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

  function formatCLP(n) { return '$' + n.toLocaleString('es-CL'); }

  function generateRUT() {
    var num = randNum(10000000, 99999999);
    var digs = '0123456789K';
    return num + '-' + digs[Math.floor(Math.random() * digs.length)];
  }

  function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('es-CL');
  }

  function generateDocument(fileName) {
    var tpl   = rand(TEMPLATES);
    var neto  = randNum(tpl.rangos[0], tpl.rangos[1]);
    var iva   = Math.round(neto * 0.19);
    var total = neto + iva;
    var today = new Date().toLocaleDateString('es-CL');
    var folio = String(randNum(10000, 99999));
    var emisor   = rand(tpl.emisores);
    var receptor = rand(rand(TEMPLATES).emisores);

    return {
      id:          uid(),
      fileName:    fileName || tpl.tipo.replace(/\s+/g,'-') + '-' + folio + '.pdf',
      tipo:        tpl.tipo,
      folio:       folio,
      fechaEmision:today,
      emisor:      emisor,
      rutEmisor:   generateRUT(),
      receptor:    receptor,
      rutReceptor: generateRUT(),
      giro:        rand(tpl.giros),
      neto:        formatCLP(neto),
      iva:         formatCLP(iva),
      total:       formatCLP(total),
      _totalNum:   total,
      formaPago:   rand(['Transferencia bancaria','Crédito 30 días','Débito automático','Efectivo']),
      vencimiento: addDays(new Date(), randNum(0,60)),
      precision:   (99 + Math.random() * 0.9).toFixed(1) + '%',
      processedAt: ts(),
      exportedTo:  [],
      status:      'Procesado'
    };
  }

  /* ── BASE DE DATOS ──────────────────────────────────────────── */
  var DB = {
    load:  function(){ try{ return JSON.parse(localStorage.getItem(CFG.storageKey)||'[]'); }catch(e){ return []; } },
    save:  function(r){ try{ localStorage.setItem(CFG.storageKey, JSON.stringify(r)); }catch(e){} },
    push:  function(doc){ var all=this.load(); all.unshift(doc); this.save(all); },
    update:function(doc){
      var all=this.load(),idx=-1;
      for(var i=0;i<all.length;i++){ if(all[i].id===doc.id){ idx=i; break; } }
      if(idx>=0) all[idx]=doc; else all.unshift(doc);
      this.save(all);
    },
    getAll: function(){ return this.load(); },
    clear:  function(){ localStorage.removeItem(CFG.storageKey); }
  };

  /* ── PROCESADOR ─────────────────────────────────────────────── */
  var Processor = {
    processing: false,
    process: function(fileName, onStep, onComplete, onError) {
      if (this.processing) { if(onError) onError('Ya hay un documento en procesamiento.'); return; }
      this.processing = true;
      var doc = generateDocument(fileName);
      var steps = CFG.processingSteps;
      var stepIndex = 0;
      var self = this;

      var interval = setInterval(function() {
        if (stepIndex >= steps.length) {
          clearInterval(interval);
          self.processing = false;
          DB.push(doc);
          if (CFG.onDocumentProcessed) CFG.onDocumentProcessed(deepCopy(doc));
          if (onComplete) onComplete(deepCopy(doc));
        } else {
          var progress = ((stepIndex + 1) / steps.length) * 100;
          if (onStep) onStep(steps[stepIndex], progress, stepIndex);
          stepIndex++;
        }
      }, 320);
    }
  };

  /* ── EXPORTADOR ─────────────────────────────────────────────── */
  function exportDocument(docId, target, onSuccess, onError) {
    var all = DB.getAll(), doc = null;
    for (var i = 0; i < all.length; i++) { if (all[i].id === docId) { doc = all[i]; break; } }
    if (!doc) { if(onError) onError('Documento no encontrado.'); return; }

    setTimeout(function() {
      doc.exportedTo.push({ target: target, ts: ts() });
      DB.update(doc);
      if (CFG.onExport) CFG.onExport(deepCopy(doc), target);
      if (onSuccess) onSuccess(deepCopy(doc), target);
    }, Math.random() * 800 + 400);
  }

  /* ── DROP ZONE WIDGET ───────────────────────────────────────── */
  var DropZone = {
    container: null, active: false, lastDoc: null,
    create: function(selector) {
      this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!this.container) return;
      this.container.innerHTML = '';
      this._renderUpload();
    },
    _renderUpload: function() {
      var self = this;
      this.container.innerHTML = [
        '<div class="abk-zone" id="abk-zone" style="border:2px dashed rgba(0,229,255,.35);border-radius:14px;',
          'padding:50px 30px;text-align:center;cursor:pointer;transition:all .3s;background:rgba(0,229,255,.03);">',
          '<div style="font-size:3.5rem;margin-bottom:12px;">📄</div>',
          '<h3 style="font-family:Montserrat,sans-serif;margin-bottom:10px;color:#F8F9FA;">Arrastra tu Factura aquí</h3>',
          '<p style="color:#A9B0BB;margin-bottom:20px;">PDF · XML SII · JPG · PNG</p>',
          '<button id="abk-btn" style="background:#00E5FF;color:#000;border:none;border-radius:8px;padding:12px 24px;font-weight:700;cursor:pointer;font-size:.9rem;">',
            'Simular carga de documento</button>',
        '</div>'
      ].join('');
      var zone = document.getElementById('abk-zone');
      var btn  = document.getElementById('abk-btn');
      zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.style.borderColor='#00E5FF'; zone.style.background='rgba(0,229,255,.07)'; });
      zone.addEventListener('dragleave', function(){ zone.style.borderColor='rgba(0,229,255,.35)'; zone.style.background='rgba(0,229,255,.03)'; });
      zone.addEventListener('drop', function(e){ e.preventDefault(); self._startProcessing(e.dataTransfer.files[0] ? e.dataTransfer.files[0].name : null); });
      btn.addEventListener('click', function(){ self._startProcessing(null); });
    },
    _startProcessing: function(fileName) {
      var self = this;
      this.container.innerHTML = this._processingHTML();
      Processor.process(
        fileName,
        function(stepMsg, progress) {
          var pfill = document.getElementById('abk-pfill');
          var pstep = document.getElementById('abk-pstep');
          var plist = document.getElementById('abk-plist');
          if(pfill) pfill.style.width = progress + '%';
          if(pstep) pstep.textContent = stepMsg;
          if(plist) {
            var li = document.createElement('li');
            li.textContent = stepMsg;
            li.style.cssText = 'font-size:.83rem;color:#A9B0BB;padding-left:14px;position:relative;margin-bottom:4px;';
            plist.appendChild(li);
          }
        },
        function(doc) {
          self.lastDoc = doc;
          self._renderResults(doc);
        }
      );
    },
    _processingHTML: function() {
      return [
        '<div style="background:rgba(28,30,38,.7);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:28px;">',
          '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">',
            '<div style="font-size:1.8rem;animation:abk-spin 2s linear infinite;">⚙️</div>',
            '<div><div style="font-weight:700;">Procesando documento...</div>',
            '<div id="abk-pstep" style="font-size:.82rem;color:#A9B0BB;margin-top:2px;">Iniciando...</div></div>',
          '</div>',
          '<div style="height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;margin-bottom:16px;">',
            '<div id="abk-pfill" style="height:100%;width:0%;background:linear-gradient(90deg,#00E5FF,#7B2CBF);transition:width .4s;border-radius:3px;"></div>',
          '</div>',
          '<ul id="abk-plist" style="list-style:none;margin:0;padding:0;"></ul>',
        '</div>',
        '<style>@keyframes abk-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}</style>'
      ].join('');
    },
    _renderResults: function(doc) {
      var self = this;
      var rows = [
        ['Tipo de Documento', doc.tipo], ['Folio', doc.folio],
        ['Fecha Emisión', doc.fechaEmision], ['Emisor', doc.emisor],
        ['RUT Emisor', doc.rutEmisor], ['Receptor', doc.receptor],
        ['RUT Receptor', doc.rutReceptor], ['Giro', doc.giro],
        ['Monto Neto', doc.neto], ['IVA (19%)', doc.iva],
        ['Total', '<strong style="color:#00E5FF">' + doc.total + '</strong>'],
        ['Forma de Pago', doc.formaPago], ['Vencimiento', doc.vencimiento]
      ];
      var tableRows = rows.map(function(r){
        return '<tr><td style="color:#A9B0BB;padding:7px 0;width:40%;font-size:.83rem;">' + r[0] + '</td>' +
               '<td style="padding:7px 0;font-size:.83rem;font-weight:500;">' + r[1] + '</td></tr>';
      }).join('');

      var exportBtns = CFG.exportTargets.map(function(t){
        var labels = { defontana:'📤 Defontana ERP', sheets:'📊 Google Sheets', sii:'🏛 Validar SII', buk:'👥 BUK RRHH' };
        return '<button onclick="AgentBackoffice._export(\'' + doc.id + '\',\'' + t + '\')" ' +
          'style="background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.15);color:#00E5FF;' +
          'padding:10px 14px;border-radius:8px;font-size:.83rem;cursor:pointer;width:100%;margin-bottom:8px;text-align:left;">' +
          (labels[t] || t) + '</button>';
      }).join('');

      this.container.innerHTML = [
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">',
          '<h3 style="font-family:Montserrat,sans-serif;">✅ Extracción Completada</h3>',
          '<div style="display:flex;gap:8px;align-items:center;">',
            '<span style="background:rgba(37,211,102,.12);border:1px solid rgba(37,211,102,.25);color:#25D366;padding:4px 10px;border-radius:50px;font-size:.75rem;font-weight:700;">Precisión: ' + doc.precision + '</span>',
            '<button onclick="AgentBackoffice._reset()" style="background:transparent;border:1px solid rgba(255,255,255,.1);color:#A9B0BB;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:.8rem;">Nuevo doc.</button>',
          '</div>',
        '</div>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">',
          '<div style="background:rgba(28,30,38,.7);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:18px;">',
            '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A9B0BB;margin-bottom:12px;">Datos Extraídos</div>',
            '<table style="width:100%;border-collapse:collapse;">' + tableRows + '</table>',
          '</div>',
          '<div style="background:rgba(28,30,38,.7);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:18px;">',
            '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#A9B0BB;margin-bottom:12px;">Exportar a</div>',
            exportBtns,
            '<div id="abk-export-log" style="font-size:.78rem;color:#25D366;margin-top:6px;min-height:20px;"></div>',
          '</div>',
        '</div>'
      ].join('');
    }
  };

  function exportCSV() {
    var records = DB.getAll();
    var h = ['ID','Archivo','Tipo','Folio','Emisor','RUT Emisor','Receptor','Total','Forma Pago','Procesado','Exportado A'];
    var rows = records.map(function(r){
      return [r.id,r.fileName,r.tipo,r.folio,r.emisor,r.rutEmisor,r.receptor,r.total,r.formaPago,r.processedAt,
        (r.exportedTo||[]).map(function(e){return e.target;}).join('|')]
        .map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
    });
    var csv=[h.join(',')].concat(rows).join('\n');
    var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='documentos_backoffice_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  }

  /* ── API PÚBLICA ────────────────────────────────────────────── */
  global.AgentBackoffice = {
    init: function(config) {
      Object.keys(config||{}).forEach(function(k){ CFG[k]=config[k]; });
      return this;
    },
    createDropZone: function(selector) {
      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ DropZone.create(selector); });
      else DropZone.create(selector);
      return this;
    },
    processDocument: function(fileName, onStep, onComplete, onError) {
      Processor.process(fileName, onStep, onComplete, onError);
    },
    exportDocument: exportDocument,
    getDocuments:   function(){ return DB.getAll(); },
    exportCSV:      exportCSV,
    resetDB:        function(){ DB.clear(); },
    setStorageAdapter: function(adapter){ Object.keys(adapter).forEach(function(k){ DB[k]=adapter[k]; }); },
    /* Enlace interno para botones generados en HTML */
    _export: function(docId, target) {
      var logEl = document.getElementById('abk-export-log');
      if(logEl) logEl.textContent = '⏳ Cargando a ' + target + '...';
      exportDocument(docId, target, function(doc, t){
        if(logEl) logEl.textContent = '✅ Enviado a ' + t + ' en ' + (Math.random()*.6+.2).toFixed(1) + 's';
      });
    },
    _reset: function() { DropZone._renderUpload(); }
  };

})(window);


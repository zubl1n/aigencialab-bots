/* ── AGENTE BACKOFFICE v2 — app.js ──────────────────────────
   Base de documentos por empresa + tabs + historial.
─────────────────────────────────────────────────────────── */
var STORAGE_KEY = 'AigenciaLab_backoffice_docs';
function dbLoad()  { try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); }catch(e){ return []; } }
function dbSave(r) { try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); }catch(e){} }
function dbPush(doc){ var all=dbLoad(); all.unshift(doc); dbSave(all); }
function dbUpdate(doc){ var all=dbLoad(),idx=-1; for(var i=0;i<all.length;i++){ if(all[i].id===doc.id){ idx=i; break; } } if(idx>=0) all[idx]=doc; else all.unshift(doc); dbSave(all); }
function uid() { return Date.now().toString(36)+Math.random().toString(36).substr(2,6); }
function ts()  { return new Date().toISOString(); }
function fmtDate(iso){ return iso?new Date(iso).toLocaleString('es-CL',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):'—'; }

var DOCS_PROCESSED=0, HOURS_SAVED=0;
var TEMPLATES=[
  { tipo:'Factura Electrónica', emisores:['Servicios Cloud SpA','ContaFast SpA','ClinicaPro SpA'], giros:['Servicios de TI','Servicios Contables','Salud Ocupacional'], rangos:[500000,5000000] },
  { tipo:'Boleta de Servicios', emisores:['AgriSur SA','LogiChile SA','Retail Sur Ltda'], giros:['Distribución Agrícola','Logística','Comercio al por Mayor'], rangos:[80000,800000] },
  { tipo:'Factura de Compra', emisores:['SaludMás Clínicas SpA','TechSur','ConstruSol SA'], giros:['Salud Privada','Ingeniería','Construcción'], rangos:[1000000,8000000] }
];

function rand(a){ return a[Math.floor(Math.random()*a.length)]; }
function randNum(min,max){ return Math.floor(Math.random()*(max-min)+min); }
function formatCLP(n){ return '$'+n.toLocaleString('es-CL'); }
function genRUT(){ return randNum(10000000,99999999)+'-'+'0123456789K'[Math.floor(Math.random()*11)]; }
function addDays(d,n){ var dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toLocaleDateString('es-CL'); }

function generateDoc(fileName){
  var tpl=rand(TEMPLATES);
  var neto=randNum(tpl.rangos[0],tpl.rangos[1]);
  var iva=Math.round(neto*0.19); var total=neto+iva;
  var folio=String(randNum(10000,99999));
  var emisor=rand(tpl.emisores); var receptor=rand(rand(TEMPLATES).emisores);
  return {
    id:uid(), fileName:fileName||tpl.tipo.replace(/\s+/g,'-')+'-'+folio+'.pdf',
    tipo:tpl.tipo, folio:folio, fechaEmision:new Date().toLocaleDateString('es-CL'),
    emisor:emisor, rutEmisor:genRUT(), receptor:receptor, rutReceptor:genRUT(),
    giro:rand(tpl.giros), neto:formatCLP(neto), iva:formatCLP(iva), total:formatCLP(total), _totalNum:total,
    formaPago:rand(['Transferencia bancaria','Crédito 30 días','Débito automático','Efectivo']),
    vencimiento:addDays(new Date(),randNum(0,60)), precision:(99+Math.random()*.9).toFixed(1)+'%',
    processedAt:ts(), exportedTo:[], status:'Procesado'
  };
}

var PROC_STEPS=[
  'Leyendo estructura del documento...','Identificando tipo DTE (SII)...',
  'Extrayendo datos emisor y receptor...','Validando RUT en base del SII...',
  'Calculando neto, IVA y total...','Detectando forma de pago...',
  'Normalizando formato de salida...','✅ Extracción completada — Precisión 99.4%'
];

var uploadZone=document.getElementById('uploadZone');
var uploadBtn=document.getElementById('uploadBtn');
var processingPanel=document.getElementById('processingPanel');
var resultsPanel=document.getElementById('resultsPanel');
var progressFill=document.getElementById('progressFill');
var procStepEl=document.getElementById('procStep');
var procStepsEl=document.getElementById('procSteps');
var resultTable=document.getElementById('resultTable');
var historyBody=document.getElementById('historyBody');
var resultTimeEl=document.getElementById('resultTime');
var exportLogEl=document.getElementById('exportLog');
var resetBtn=document.getElementById('resetBtn');
var kpiDocs=document.getElementById('kpiDocs');
var kpiTime=document.getElementById('kpiTime');
var kpiSaved=document.getElementById('kpiSaved');
var queueList=document.getElementById('queueList');
var currentDoc=null;

function updateKPIs(){ kpiDocs.textContent=DOCS_PROCESSED; kpiTime.textContent=(Math.random()*.8+.9).toFixed(1)+'s'; kpiSaved.textContent=HOURS_SAVED.toFixed(1)+' hrs'; }

function addToQueue(name,status,done){
  var el=document.createElement('div'); el.className='queue-item'+(done?' done':'');
  el.innerHTML='<span class="q-name">'+name.substring(0,22)+'…</span><span class="q-st">'+status+'</span>';
  queueList.insertBefore(el,queueList.firstChild);
  if(queueList.children.length>5) queueList.removeChild(queueList.lastChild);
}

function buildResultTable(doc){
  resultTable.innerHTML='';
  [['Tipo de Documento',doc.tipo],['Folio',doc.folio],['Fecha Emisión',doc.fechaEmision],
   ['Emisor',doc.emisor],['RUT Emisor',doc.rutEmisor],['Receptor',doc.receptor],['RUT Receptor',doc.rutReceptor],
   ['Giro Comercial',doc.giro],['Monto Neto',doc.neto],['IVA (19%)',doc.iva],
   ['Total','<strong style="color:#00E5FF">'+doc.total+'</strong>'],
   ['Forma de Pago',doc.formaPago],['Vencimiento',doc.vencimiento]
  ].forEach(function(r){ var tr=document.createElement('tr'); tr.innerHTML='<td>'+r[0]+'</td><td>'+r[1]+'</td>'; resultTable.appendChild(tr); });
}

function addToHistory(doc, dest){
  doc.exportedTo.push({target:dest,ts:ts()}); dbUpdate(doc);
  historyBody.innerHTML='';
  dbLoad().slice(0,8).forEach(function(d){
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+d.fileName+'</td><td>'+d.rutEmisor+'</td><td>'+d.total+'</td>'+
      '<td class="st-done">✅ Procesado</td><td>'+(d.exportedTo.length?d.exportedTo.map(function(e){return e.target;}).join(', '):'Pendiente')+'</td>';
    historyBody.appendChild(tr);
  });
}

function refreshHistoryTable(){
  if(!historyBody) return;
  historyBody.innerHTML='';
  dbLoad().slice(0,8).forEach(function(d){
    var tr=document.createElement('tr');
    tr.innerHTML='<td>'+d.fileName+'</td><td>'+d.rutEmisor+'</td><td>'+d.total+'</td>'+
      '<td class="st-done">✅ Procesado</td><td>'+(d.exportedTo&&d.exportedTo.length?d.exportedTo.map(function(e){return e.target;}).join(', '):'Pendiente')+'</td>';
    historyBody.appendChild(tr);
  });
}

function startProcessing(fileName){
  currentDoc=generateDoc(fileName);
  var startTime=Date.now();
  uploadZone.style.display='none'; processingPanel.style.display='block'; resultsPanel.style.display='none';
  procStepsEl.innerHTML=''; progressFill.style.width='0%';
  addToQueue(currentDoc.fileName,'Procesando…',false);
  var stepIndex=0;
  var interval=setInterval(function(){
    if(stepIndex>=PROC_STEPS.length){
      clearInterval(interval);
      var elapsed=((Date.now()-startTime)/1000).toFixed(2);
      resultTimeEl.textContent=elapsed;
      DOCS_PROCESSED++; HOURS_SAVED+=0.25;
      updateKPIs(); addToQueue(currentDoc.fileName,'Completado ✅',true);
      dbPush(currentDoc); refreshHistoryTable();
      setTimeout(function(){
        processingPanel.style.display='none'; resultsPanel.style.display='block';
        buildResultTable(currentDoc); exportLogEl.textContent='';
      },300);
      return;
    }
    var msg=PROC_STEPS[stepIndex];
    procStepEl.textContent=msg; progressFill.style.width=((stepIndex+1)/PROC_STEPS.length*100)+'%';
    var li=document.createElement('li'); li.textContent=msg; procStepsEl.appendChild(li);
    stepIndex++;
  },320);
}

window.simulateExport=function(dest){ exportLogEl.textContent='⏳ Cargando a '+dest+'...'; setTimeout(function(){ exportLogEl.textContent='✅ Enviado a '+dest+' en '+(Math.random()*.6+.2).toFixed(1)+'s'; if(currentDoc) addToHistory(currentDoc,dest); },1200); };

uploadZone.addEventListener('dragover',function(e){ e.preventDefault(); uploadZone.style.borderColor='#00E5FF'; });
uploadZone.addEventListener('dragleave',function(){ uploadZone.style.borderColor='rgba(0,229,255,.3)'; });
uploadZone.addEventListener('drop',function(e){ e.preventDefault(); startProcessing(e.dataTransfer.files[0]?e.dataTransfer.files[0].name:null); });
uploadBtn.addEventListener('click',function(){ startProcessing(null); });
resetBtn.addEventListener('click',function(){ uploadZone.style.display='block'; processingPanel.style.display='none'; resultsPanel.style.display='none'; currentDoc=null; });

/* ── TABS ──────────────────────────────────────────────────── */
function initTabs(){
  document.querySelectorAll('.stab').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.stab').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p){ p.style.display='none'; });
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).style.display='flex';
      if(btn.dataset.tab==='documentos') renderDocDB();
    });
  });
}

/* ── BASE DE DOCUMENTOS POR EMPRESA ────────────────────────── */
function renderDocDB(){
  var container=document.getElementById('docTable'); if(!container) return;
  var all=dbLoad();
  if(all.length===0){ container.innerHTML='<div class="empty-state">Sin documentos. Procesa una factura primero.</div>'; return; }

  // Agrupar por emisor
  var byEmisor={};
  all.forEach(function(d){
    if(!byEmisor[d.emisor]) byEmisor[d.emisor]={ count:0, total:0, docs:[] };
    byEmisor[d.emisor].count++;
    byEmisor[d.emisor].total+=d._totalNum||0;
    byEmisor[d.emisor].docs.push(d);
  });

  container.innerHTML=[
    '<div class="db-toolbar">',
      '<input type="text" class="db-search" placeholder="Buscar empresa o RUT..." oninput="filterDocs(this.value)"/>',
      '<button onclick="exportCSV()" class="btn-export">⬇ CSV</button>',
    '</div>',
    '<div class="doc-summary">',
      Object.keys(byEmisor).map(function(emisor){
        var info=byEmisor[emisor];
        var initials=emisor.split(' ').map(function(w){ return w[0]||''; }).join('').toUpperCase().slice(0,2);
        return [
          '<div class="client-card" onclick="showEmisorDocs(\''+encodeURIComponent(emisor)+'\')">',
            '<div class="cc-avatar" style="background:linear-gradient(135deg,rgba(123,44,191,.2),rgba(0,229,255,.1));color:#00E5FF;">'+initials+'</div>',
            '<div class="cc-body">',
              '<div class="cc-top"><span class="cc-name">'+emisor+'</span><span class="cc-status" style="background:rgba(0,229,255,.1);color:#00E5FF;border-color:rgba(0,229,255,.2);">'+info.count+' doc.</span></div>',
              '<div class="cc-company">Total acumulado: <strong style="color:#00E5FF">$'+info.total.toLocaleString('es-CL')+'</strong></div>',
              '<div class="cc-meta"><span>📅 Último: '+fmtDate(info.docs[0].processedAt)+'</span><span>📤 Exportados: '+info.docs.filter(function(d){return d.exportedTo.length>0;}).length+'</span></div>',
            '</div>',
          '</div>'
        ].join('');
      }).join(''),
    '</div>'
  ].join('');
}

window.filterDocs=function(q){
  q=q.toLowerCase();
  var filtered=dbLoad().filter(function(d){ return d.emisor.toLowerCase().indexOf(q)!==-1||d.rutEmisor.indexOf(q)!==-1; });
  /* re-group filtered */
  document.getElementById('doc-summary') && (document.getElementById('doc-summary').innerHTML='...');
};

window.showEmisorDocs=function(emisorEncoded){
  var emisor=decodeURIComponent(emisorEncoded);
  var docs=dbLoad().filter(function(d){ return d.emisor===emisor; });
  var modal=document.getElementById('historyModal');
  document.getElementById('historyTitle').textContent=emisor+' — '+docs.length+' documentos';
  var content=document.getElementById('historyContent');
  content.innerHTML=docs.map(function(d){
    return [
      '<div style="padding:12px;background:rgba(28,30,38,.7);border:1px solid rgba(255,255,255,.07);border-radius:10px;font-size:.83rem;">',
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px;">',
          '<strong>'+d.tipo+' Nro. '+d.folio+'</strong>',
          '<span style="color:#00E5FF;font-weight:700;">'+d.total+'</span>',
        '</div>',
        '<div style="color:#A9B0BB;">📅 '+d.fechaEmision+' · IVA: '+d.iva+'</div>',
        '<div style="color:#A9B0BB;">💳 '+d.formaPago+' · Vence: '+d.vencimiento+'</div>',
        '<div style="color:#A9B0BB;margin-top:4px;">📤 '+( d.exportedTo.length?d.exportedTo.map(function(e){return e.target;}).join(', '):'Sin exportar')+'</div>',
      '</div>'
    ].join('');
  }).join('')||'<div class="empty-state">Sin documentos.</div>';
  modal.style.display='flex';
};
window.closeHistory=function(){ document.getElementById('historyModal').style.display='none'; };

function exportCSV(){
  var records=dbLoad();
  var h=['Archivo','Tipo','Folio','Fecha','Emisor','RUT Emisor','Receptor','Total','Forma Pago','Procesado','Exportado A'];
  var rows=records.map(function(r){
    return [r.fileName,r.tipo,r.folio,r.fechaEmision,r.emisor,r.rutEmisor,r.receptor,r.total,r.formaPago,r.processedAt,
      (r.exportedTo||[]).map(function(e){return e.target;}).join('|')]
      .map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }).join(',');
  });
  var csv=[h.join(',')].concat(rows).join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='documentos_backoffice_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
}

/* ── SEED ──────────────────────────────────────────────────── */
(function(){
  if(dbLoad().length===0){
    var seedDocs=[generateDoc('Factura_34921_ClinicaPro.pdf'),generateDoc('Boleta_SII_52847_AgriSur.xml'),generateDoc('FC_00187_LogiChile.pdf')];
    seedDocs[0].exportedTo=[{target:'Defontana ERP',ts:ts()}];
    seedDocs[1].exportedTo=[{target:'Google Sheets',ts:ts()}];
    dbSave(seedDocs); DOCS_PROCESSED=127; HOURS_SAVED=31.75;
  } else { var all=dbLoad(); DOCS_PROCESSED=Math.max(127,all.length); HOURS_SAVED=DOCS_PROCESSED*0.25; }
  updateKPIs(); refreshHistoryTable();
  addToQueue('FC_00187_LogiChile.pdf','Completado ✅',true);
  addToQueue('Boleta_SII_52847.xml','Completado ✅',true);
  addToQueue('Factura_34921_ClinicaPro.pdf','Completado ✅',true);
  initTabs();
})();


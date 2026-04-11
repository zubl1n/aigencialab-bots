/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE CIBERSEGURIDAD & COMPLIANCE v1.0
 *  Archivo: agents/agent-cybersecurity.js
 *
 *  WAF, detección de anomalías, auditoría Ley 19.628/21.663,
 *  gestión de incidentes, monitoreo de infraestructura.
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';
  var CFG = {
    companyName: 'Mi Empresa', storageKey: 'AigenciaLab_cybersec_data',
    complianceLaws: ['Ley N°19.628', 'Ley N°21.663'],
    anciNotifyHours: 72, scanIntervalHours: 24,
    onThreat: null, onIncident: null, onComplianceChange: null
  };
  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 6); }
  function ts() { return new Date().toISOString(); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var DB = {
    _key: function () { return CFG.storageKey; },
    load: function () { try { return JSON.parse(localStorage.getItem(this._key()) || '{}'); } catch (e) { return {}; } },
    save: function (d) { try { localStorage.setItem(this._key(), JSON.stringify(d)); } catch (e) {} },
    get: function (c) { var d = this.load(); return d[c] || []; },
    set: function (c, r) { var d = this.load(); d[c] = r; this.save(d); }
  };

  var ATTACK_TYPES = ['SQL Injection', 'XSS (Cross-Site Scripting)', 'Brute Force', 'DDoS', 'CSRF', 'Path Traversal', 'Command Injection'];
  var SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  /* ── THREAT DETECTION ────────────────────────────────────── */
  var Threats = {
    getAll: function () { return DB.get('threats'); },
    getActive: function () { return DB.get('threats').filter(function (t) { return t.status === 'Active'; }); },
    detect: function (source) {
      var threat = {
        id: 'THR-' + uid(), type: pick(ATTACK_TYPES), severity: pick(SEVERITIES),
        sourceIP: rand(1, 255) + '.' + rand(0, 255) + '.' + rand(0, 255) + '.' + rand(0, 255),
        targetEndpoint: pick(['/api/v1/products', '/api/v1/orders', '/login', '/admin', '/api/v1/users']),
        detectedAt: ts(), status: 'Blocked', attempts: rand(1, 50),
        geoLocation: pick(['US', 'CN', 'RU', 'BR', 'VN', 'IN', 'UA', 'KR']),
        wafRule: 'WAF-' + rand(100, 999)
      };
      var all = DB.get('threats'); all.unshift(threat);
      if (all.length > 500) all = all.slice(0, 300);
      DB.set('threats', all);
      if (CFG.onThreat) CFG.onThreat(threat);
      return threat;
    },
    getStats: function () {
      var all = DB.get('threats');
      var byType = {};
      all.forEach(function (t) { byType[t.type] = (byType[t.type] || 0) + 1; });
      return {
        total: all.length,
        blocked: all.filter(function (t) { return t.status === 'Blocked'; }).length,
        byType: byType,
        bySeverity: {
          critical: all.filter(function (t) { return t.severity === 'CRITICAL'; }).length,
          high: all.filter(function (t) { return t.severity === 'HIGH'; }).length,
          medium: all.filter(function (t) { return t.severity === 'MEDIUM'; }).length,
          low: all.filter(function (t) { return t.severity === 'LOW'; }).length
        }
      };
    }
  };

  /* ── VULNERABILITY SCANNER ───────────────────────────────── */
  var Scanner = {
    run: function () {
      var vulns = [
        { id: 'VLN-' + uid(), name: 'Outdated dependency: lodash 4.17.15', severity: 'MEDIUM', cve: 'CVE-2021-23337', status: 'Open', discoveredAt: ts() },
        { id: 'VLN-' + uid(), name: 'Missing Content-Security-Policy header', severity: 'LOW', cve: 'N/A', status: 'Open', discoveredAt: ts() },
      ];
      DB.set('vulnerabilities', vulns);
      DB.set('lastScan', { completedAt: ts(), vulnerabilities: vulns.length, critical: 0, high: 0, medium: 1, low: 1 });
      return DB.get('lastScan');
    },
    getVulnerabilities: function () { return DB.get('vulnerabilities'); },
    getLastScan: function () { return DB.get('lastScan'); }
  };

  /* ── COMPLIANCE AUDIT (Ley 19.628 + 21.663) ─────────────── */
  var Compliance = {
    getControls: function () {
      var controls = DB.get('controls');
      if (controls.length === 0) controls = this._seedControls();
      return controls;
    },
    getScore: function () {
      var controls = this.getControls();
      if (controls.length === 0) return 0;
      var total = controls.reduce(function (s, c) { return s + c.completeness; }, 0);
      return Math.round(total / controls.length);
    },
    updateControl: function (controlId, data) {
      var controls = DB.get('controls');
      for (var i = 0; i < controls.length; i++) {
        if (controls[i].id === controlId) {
          Object.keys(data).forEach(function (k) { controls[i][k] = data[k]; });
          controls[i].lastAudit = ts();
          DB.set('controls', controls);
          if (CFG.onComplianceChange) CFG.onComplianceChange(controls[i]);
          return controls[i];
        }
      }
      return null;
    },
    _seedControls: function () {
      var controls = [
        { id: 'CTL-001', control: 'Consentimiento de datos personales', law: 'Art. 4 Ley 19.628', status: 'Cumple', completeness: 100, lastAudit: ts() },
        { id: 'CTL-002', control: 'Cifrado de datos en reposo (AES-256)', law: 'Art. 23 Ley 21.663', status: 'Cumple', completeness: 100, lastAudit: ts() },
        { id: 'CTL-003', control: 'Cifrado en tránsito (TLS 1.3)', law: 'Art. 23 Ley 21.663', status: 'Cumple', completeness: 100, lastAudit: ts() },
        { id: 'CTL-004', control: 'Política de retención de datos', law: 'Art. 6 Ley 19.628', status: 'Cumple', completeness: 95, lastAudit: ts() },
        { id: 'CTL-005', control: 'Notificación de brechas (≤72h ANCI)', law: 'Art. 9 Ley 21.663', status: 'Cumple', completeness: 100, lastAudit: ts() },
        { id: 'CTL-006', control: 'Derecho de acceso del titular', law: 'Art. 12 Ley 19.628', status: 'Parcial', completeness: 78, lastAudit: ts() },
        { id: 'CTL-007', control: 'Evaluación de impacto privacidad', law: 'Art. 15 Ley 19.628', status: 'Pendiente', completeness: 45, lastAudit: ts() },
        { id: 'CTL-008', control: 'DPO designado', law: 'Ley 21.663', status: 'Cumple', completeness: 100, lastAudit: ts() },
        { id: 'CTL-009', control: 'Plan de respuesta a incidentes', law: 'Ley 21.663', status: 'Cumple', completeness: 90, lastAudit: ts() },
        { id: 'CTL-010', control: 'Registro de bases de datos (SERNAC)', law: 'Art. 22 Ley 19.628', status: 'Cumple', completeness: 100, lastAudit: ts() }
      ];
      DB.set('controls', controls);
      return controls;
    }
  };

  /* ── INCIDENT MANAGEMENT ─────────────────────────────────── */
  var IncidentMgmt = {
    create: function (data) {
      var incident = Object.assign({
        id: 'SEC-' + uid(), status: 'Abierto', severity: 'HIGH', category: 'Intrusión',
        createdAt: ts(), anciNotified: false, anciDeadline: new Date(Date.now() + CFG.anciNotifyHours * 3600000).toISOString(),
        timeline: [{ action: 'Incidente creado', timestamp: ts(), actor: 'Sistema' }]
      }, data);
      var all = DB.get('incidents'); all.unshift(incident); DB.set('incidents', all);
      if (CFG.onIncident) CFG.onIncident(incident);
      return incident;
    },
    getAll: function () { return DB.get('incidents'); },
    notifyANCI: function (incidentId) {
      var all = DB.get('incidents');
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === incidentId) {
          all[i].anciNotified = true; all[i].anciNotifiedAt = ts();
          all[i].timeline.push({ action: 'Notificación enviada a ANCI', timestamp: ts(), actor: 'DPO' });
          DB.set('incidents', all); return all[i];
        }
      }
      return null;
    },
    resolve: function (incidentId, resolution) {
      var all = DB.get('incidents');
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === incidentId) {
          all[i].status = 'Resuelto'; all[i].resolvedAt = ts(); all[i].resolution = resolution;
          all[i].timeline.push({ action: 'Incidente resuelto: ' + resolution, timestamp: ts(), actor: 'SecOps' });
          DB.set('incidents', all); return all[i];
        }
      }
      return null;
    }
  };

  /* ── IP BLACKLIST ────────────────────────────────────────── */
  var Blacklist = {
    get: function () { return DB.get('blacklist'); },
    add: function (ip, reason) {
      var list = DB.get('blacklist');
      if (list.some(function (e) { return e.ip === ip; })) return null;
      var entry = { ip: ip, reason: reason, addedAt: ts(), id: uid() };
      list.push(entry); DB.set('blacklist', list);
      return entry;
    },
    remove: function (ip) {
      var list = DB.get('blacklist').filter(function (e) { return e.ip !== ip; });
      DB.set('blacklist', list);
    }
  };

  function seed() {
    if (DB.get('threats').length === 0) {
      for (var i = 0; i < 30; i++) Threats.detect();
    }
    if (DB.get('controls').length === 0) Compliance._seedControls();
    if (!DB.get('lastScan') || !DB.get('lastScan').completedAt) Scanner.run();
    if (DB.get('blacklist').length === 0) {
      ['45.33.32.156', '185.220.101.42', '89.248.167.131', '23.129.64.210'].forEach(function (ip) {
        Blacklist.add(ip, 'Auto-blocked by WAF');
      });
    }
  }

  global.AgentCybersecurity = {
    init: function (config) { Object.keys(config || {}).forEach(function (k) { CFG[k] = config[k]; }); seed(); return this; },
    threats: Threats, scanner: Scanner, compliance: Compliance, incidents: IncidentMgmt, blacklist: Blacklist,
    getConfig: function () { return Object.assign({}, CFG); },
    exportCSV: function () {
      var threats = Threats.getAll().slice(0, 100);
      var h = ['ID', 'Tipo', 'Severidad', 'IP Origen', 'Endpoint', 'Estado', 'Fecha'];
      var rows = threats.map(function (t) { return [t.id, t.type, t.severity, t.sourceIP, t.targetEndpoint, t.status, t.detectedAt].map(function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(','); });
      var csv = [h.join(',')].concat(rows).join('\n');
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'amenazas_cybersec_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    },
    resetDB: function () { localStorage.removeItem(CFG.storageKey); },
    setStorageAdapter: function (adapter) { Object.keys(adapter).forEach(function (k) { DB[k] = adapter[k]; }); }
  };
})(window);


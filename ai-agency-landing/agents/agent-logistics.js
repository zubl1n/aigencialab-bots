/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE LOGÍSTICA & TRAZABILIDAD v1.0
 *  Archivo: agents/agent-logistics.js
 *
 *  Tracking última milla, gestión de incidencias, alertas SLA.
 *  Couriers: Starken, Chilexpress, Blue Express, Correos de Chile.
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';
  var CFG = {
    companyName: 'Mi Empresa', storageKey: 'AigenciaLab_logistics_data',
    couriers: ['Starken', 'Chilexpress', 'Blue Express', 'Correos de Chile'],
    slaHours: 72, timezone: 'America/Santiago',
    onDelivery: null, onIncident: null, onSLABreach: null
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

  var CITIES = ['Santiago', 'Valparaíso', 'Concepción', 'Temuco', 'Antofagasta', 'La Serena', 'Puerto Montt', 'Iquique', 'Rancagua', 'Talca'];
  var STATUSES = ['En bodega', 'Retirado por courier', 'En tránsito', 'En centro de distribución', 'En reparto', 'Entregado', 'Con incidencia'];

  var Shipments = {
    getAll: function () { return DB.get('shipments'); },
    create: function (data) {
      var shipment = Object.assign({
        id: 'ENV-' + uid(), status: 'En bodega', courier: pick(CFG.couriers),
        origin: 'Santiago', destination: pick(CITIES),
        createdAt: ts(), slaDeadline: new Date(Date.now() + CFG.slaHours * 3600000).toISOString(),
        history: [{ status: 'En bodega', timestamp: ts(), location: 'Santiago' }], incidents: []
      }, data);
      var all = DB.get('shipments'); all.unshift(shipment); DB.set('shipments', all);
      return shipment;
    },
    updateStatus: function (id, status, location) {
      var all = DB.get('shipments');
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) {
          all[i].status = status; all[i].updatedAt = ts();
          all[i].history.push({ status: status, timestamp: ts(), location: location || all[i].destination });
          if (status === 'Entregado') { all[i].deliveredAt = ts(); if (CFG.onDelivery) CFG.onDelivery(all[i]); }
          DB.set('shipments', all); return all[i];
        }
      }
      return null;
    },
    getActive: function () { return DB.get('shipments').filter(function (s) { return s.status !== 'Entregado'; }); },
    getByStatus: function (status) { return DB.get('shipments').filter(function (s) { return s.status === status; }); },
    track: function (id) {
      var all = DB.get('shipments');
      for (var i = 0; i < all.length; i++) { if (all[i].id === id) return all[i]; }
      return null;
    }
  };

  var Incidents = {
    create: function (shipmentId, type, description) {
      var all = DB.get('shipments');
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === shipmentId) {
          var incident = { id: 'INC-' + uid(), type: type, description: description, createdAt: ts(), status: 'Abierta' };
          all[i].incidents.push(incident); all[i].status = 'Con incidencia';
          all[i].history.push({ status: 'Incidencia: ' + type, timestamp: ts() });
          DB.set('shipments', all);
          if (CFG.onIncident) CFG.onIncident(incident, all[i]);
          return incident;
        }
      }
      return null;
    },
    resolve: function (shipmentId, incidentId) {
      var all = DB.get('shipments');
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === shipmentId) {
          for (var j = 0; j < all[i].incidents.length; j++) {
            if (all[i].incidents[j].id === incidentId) { all[i].incidents[j].status = 'Resuelta'; all[i].incidents[j].resolvedAt = ts(); }
          }
          if (all[i].incidents.every(function (inc) { return inc.status === 'Resuelta'; })) all[i].status = 'En tránsito';
          DB.set('shipments', all); return all[i];
        }
      }
      return null;
    }
  };

  var SLA = {
    check: function () {
      var now = Date.now();
      return DB.get('shipments').filter(function (s) {
        return s.status !== 'Entregado' && s.slaDeadline && new Date(s.slaDeadline).getTime() < now;
      });
    },
    getAtRisk: function (hoursThreshold) {
      var threshold = (hoursThreshold || 4) * 3600000;
      var now = Date.now();
      return DB.get('shipments').filter(function (s) {
        if (s.status === 'Entregado') return false;
        var deadline = new Date(s.slaDeadline).getTime();
        return (deadline - now) > 0 && (deadline - now) < threshold;
      });
    }
  };

  var Stats = {
    onTimeRate: function () {
      var delivered = DB.get('shipments').filter(function (s) { return s.status === 'Entregado'; });
      if (delivered.length === 0) return 0;
      var onTime = delivered.filter(function (s) { return new Date(s.deliveredAt) <= new Date(s.slaDeadline); });
      return Math.round((onTime.length / delivered.length) * 1000) / 10;
    },
    byCourier: function () {
      var counts = {};
      DB.get('shipments').forEach(function (s) { counts[s.courier] = (counts[s.courier] || 0) + 1; });
      return counts;
    },
    avgDeliveryDays: function () {
      var delivered = DB.get('shipments').filter(function (s) { return s.deliveredAt; });
      if (delivered.length === 0) return 0;
      var total = delivered.reduce(function (sum, s) {
        return sum + (new Date(s.deliveredAt) - new Date(s.createdAt)) / 86400000;
      }, 0);
      return Math.round(total / delivered.length * 10) / 10;
    }
  };

  function seed() {
    if (DB.get('shipments').length > 0) return;
    var shipments = [];
    for (var i = 0; i < 20; i++) {
      var s = STATUSES[rand(0, STATUSES.length - 1)];
      var created = new Date(Date.now() - rand(0, 7) * 86400000);
      var ship = {
        id: 'ENV-' + uid(), status: s, courier: pick(CFG.couriers),
        origin: 'Santiago', destination: pick(CITIES), customer: pick(['ClinicaPro SpA', 'TechSur Ltda', 'AgriSur SA', 'LogiChile', 'Retail Sur']),
        createdAt: created.toISOString(), slaDeadline: new Date(created.getTime() + CFG.slaHours * 3600000).toISOString(),
        history: [{ status: 'En bodega', timestamp: created.toISOString(), location: 'Santiago' }], incidents: []
      };
      if (s === 'Entregado') ship.deliveredAt = new Date(created.getTime() + rand(1, 4) * 86400000).toISOString();
      if (s === 'Con incidencia') ship.incidents.push({ id: 'INC-' + uid(), type: 'Dirección incorrecta', description: 'No se pudo entregar', createdAt: ts(), status: 'Abierta' });
      shipments.push(ship);
    }
    DB.set('shipments', shipments);
  }

  global.AgentLogistics = {
    init: function (config) { Object.keys(config || {}).forEach(function (k) { CFG[k] = config[k]; }); seed(); return this; },
    shipments: Shipments, incidents: Incidents, sla: SLA, stats: Stats,
    getConfig: function () { return Object.assign({}, CFG); },
    exportCSV: function () {
      var all = Shipments.getAll();
      var h = ['ID', 'Cliente', 'Destino', 'Courier', 'Estado', 'SLA', 'Creado', 'Entregado'];
      var rows = all.map(function (s) { return [s.id, s.customer || '', s.destination, s.courier, s.status, s.slaDeadline, s.createdAt, s.deliveredAt || ''].map(function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(','); });
      var csv = [h.join(',')].concat(rows).join('\n');
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'envios_logistica_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    },
    resetDB: function () { localStorage.removeItem(CFG.storageKey); },
    setStorageAdapter: function (adapter) { Object.keys(adapter).forEach(function (k) { DB[k] = adapter[k]; }); }
  };
})(window);


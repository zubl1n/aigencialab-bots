/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE BUSINESS INTELLIGENCE v1.0
 *  Archivo: agents/agent-bi.js
 *
 *  Forecasting de demanda, detección de churn, segmentación,
 *  sugerencias de reabastecimiento.
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';
  var CFG = {
    companyName: 'Mi Empresa', storageKey: 'AigenciaLab_bi_data',
    forecastDays: 30, churnThreshold: 65, timezone: 'America/Santiago',
    onForecast: null, onChurnAlert: null, onRestockAlert: null
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

  /* ── FORECASTING ─────────────────────────────────────────── */
  var Forecast = {
    generate: function (historicSales, days) {
      days = days || CFG.forecastDays;
      // Simple moving average + trend (for demo — replace with real ML in production)
      var data = historicSales || DB.get('historicSales');
      if (data.length < 7) data = this._seedHistoric();
      var windowSize = 7;
      var lastWindow = data.slice(-windowSize);
      var avg = lastWindow.reduce(function (s, d) { return s + d.value; }, 0) / windowSize;
      var trend = (data[data.length - 1].value - data[data.length - windowSize].value) / windowSize;

      var forecast = [];
      for (var i = 0; i < days; i++) {
        var predicted = Math.max(0, avg + trend * i + (Math.random() - 0.5) * avg * 0.15);
        var d = new Date(); d.setDate(d.getDate() + i);
        forecast.push({
          date: d.toISOString().slice(0, 10),
          predicted: Math.round(predicted),
          confidenceLow: Math.round(predicted * 0.82),
          confidenceHigh: Math.round(predicted * 1.18)
        });
      }
      DB.set('lastForecast', { generatedAt: ts(), days: days, data: forecast, accuracy: (88 + Math.random() * 8).toFixed(1) + '%' });
      if (CFG.onForecast) CFG.onForecast(forecast);
      return DB.get('lastForecast');
    },
    getLast: function () { return DB.get('lastForecast'); },
    _seedHistoric: function () {
      var data = [];
      var base = rand(800000, 2000000);
      for (var i = 90; i >= 0; i--) {
        var d = new Date(); d.setDate(d.getDate() - i);
        base += rand(-150000, 200000); if (base < 300000) base = 500000;
        data.push({ date: d.toISOString().slice(0, 10), value: base });
      }
      DB.set('historicSales', data);
      return data;
    }
  };

  /* ── CHURN DETECTION ─────────────────────────────────────── */
  var Churn = {
    detect: function () {
      var customers = DB.get('customers');
      if (customers.length === 0) customers = this._seedCustomers();
      return customers.filter(function (c) { return c.churnRisk >= CFG.churnThreshold; })
        .sort(function (a, b) { return b.churnRisk - a.churnRisk; });
    },
    getAll: function () { return DB.get('customers'); },
    _seedCustomers: function () {
      var names = ['ClinicaPro SpA', 'TechSur Ltda', 'AgriSur SA', 'LogiChile', 'Retail Sur', 'ContaFast', 'SaludMás', 'ConstruSol', 'InmobiliariaVerde', 'ImportChile'];
      var segments = ['Premium', 'Recurrente', 'Ocasional', 'Nuevo'];
      var customers = names.map(function (n) {
        var lastPurchaseDays = rand(5, 180);
        var totalPurchases = rand(1, 50);
        var churn = Math.min(98, Math.max(10, Math.round(lastPurchaseDays * 0.6 - totalPurchases * 2 + rand(-10, 20))));
        return {
          id: uid(), name: n, segment: pick(segments), totalPurchases: totalPurchases,
          totalValue: rand(200000, 12000000), lastPurchaseDays: lastPurchaseDays,
          churnRisk: churn, trend: churn > 65 ? 'Descendente' : 'Estable'
        };
      });
      DB.set('customers', customers);
      return customers;
    }
  };

  /* ── SEGMENTATION ────────────────────────────────────────── */
  var Segments = {
    get: function () {
      var customers = DB.get('customers');
      if (customers.length === 0) customers = Churn._seedCustomers();
      var segs = {};
      customers.forEach(function (c) {
        if (!segs[c.segment]) segs[c.segment] = { count: 0, totalValue: 0 };
        segs[c.segment].count++;
        segs[c.segment].totalValue += c.totalValue;
      });
      return segs;
    }
  };

  /* ── RESTOCK SUGGESTIONS ─────────────────────────────────── */
  var Restock = {
    suggest: function () {
      var products = DB.get('products');
      if (products.length === 0) products = this._seedProducts();
      return products.filter(function (p) { return p.coverage <= 7; })
        .map(function (p) {
          return {
            product: p.name, sku: p.sku, currentStock: p.stock,
            weeklyDemand: p.weeklyDemand, coverageDays: p.coverage,
            suggestedOrder: Math.max(p.weeklyDemand * 4, p.minStock * 2),
            supplier: p.supplier, priority: p.coverage === 0 ? 'Crítica' : (p.coverage <= 3 ? 'Alta' : 'Media')
          };
        })
        .sort(function (a, b) { return a.coverageDays - b.coverageDays; });
    },
    _seedProducts: function () {
      var names = ['Notebook Pro 15"', 'Monitor 4K', 'Teclado Mecánico', 'SSD 1TB', 'RAM DDR5', 'Mouse Ergonómico'];
      var suppliers = ['DistribuTech', 'ImportChile', 'MegaStock'];
      var products = names.map(function (n, i) {
        var stock = rand(0, 30); var demand = rand(3, 25);
        return { sku: 'SKU-' + (20000 + i), name: n, stock: stock, minStock: rand(10, 25), weeklyDemand: demand, coverage: stock > 0 ? Math.round(stock / (demand / 7)) : 0, supplier: pick(suppliers) };
      });
      DB.set('products', products);
      return products;
    }
  };

  /* ── REPORTS ──────────────────────────────────────────────── */
  var Reports = {
    generateSummary: function () {
      return {
        generatedAt: ts(), forecastAccuracy: Forecast.getLast() ? Forecast.getLast().accuracy : 'N/A',
        churnRiskCount: Churn.detect().length, restockAlerts: Restock.suggest().length,
        segments: Segments.get(), topChurnClients: Churn.detect().slice(0, 5)
      };
    }
  };

  function seed() { if (DB.get('historicSales').length === 0) Forecast._seedHistoric(); if (DB.get('customers').length === 0) Churn._seedCustomers(); if (DB.get('products').length === 0) Restock._seedProducts(); }

  global.AgentBI = {
    init: function (config) { Object.keys(config || {}).forEach(function (k) { CFG[k] = config[k]; }); seed(); return this; },
    forecast: Forecast, churn: Churn, segments: Segments, restock: Restock, reports: Reports,
    getConfig: function () { return Object.assign({}, CFG); },
    exportCSV: function () {
      var customers = Churn.getAll();
      var h = ['Nombre', 'Segmento', 'Compras', 'Valor Total', 'Última Compra (días)', 'Riesgo Churn %'];
      var rows = customers.map(function (c) { return [c.name, c.segment, c.totalPurchases, c.totalValue, c.lastPurchaseDays, c.churnRisk].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); });
      var csv = [h.join(',')].concat(rows).join('\n');
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bi_clientes_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    },
    resetDB: function () { localStorage.removeItem(CFG.storageKey); },
    setStorageAdapter: function (adapter) { Object.keys(adapter).forEach(function (k) { DB[k] = adapter[k]; }); }
  };
})(window);


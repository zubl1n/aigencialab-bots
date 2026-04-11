/**
 * ═══════════════════════════════════════════════════════════════
 *  AigenciaLab.cl — AGENTE ECOMMERCE: Sales & Inventory Sync v1.0
 *  Archivo: agents/agent-ecommerce.js
 *
 *  API REST Spec, Webhooks, Lógica de sincronización.
 *  Stack: Vanilla JS · Persistencia: localStorage (adaptable)
 *  Compliance: Ley N°21.663 + Ley N°19.628
 * ═══════════════════════════════════════════════════════════════
 */
(function (global) {
  'use strict';
  var CFG = {
    companyName: 'Mi Empresa', storageKey: 'AigenciaLab_ecommerce_data',
    platforms: ['woocommerce', 'shopify'],
    currency: 'CLP', timezone: 'America/Santiago',
    onStockSync: null, onOrderCreate: null, onCartRecovery: null, onUpsell: null
  };
  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 6); }
  function ts() { return new Date().toISOString(); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  /* ── STORAGE ─────────────────────────────────────────────── */
  var DB = {
    _key: function () { return CFG.storageKey; },
    load: function () { try { return JSON.parse(localStorage.getItem(this._key()) || '{}'); } catch (e) { return {}; } },
    save: function (data) { try { localStorage.setItem(this._key(), JSON.stringify(data)); } catch (e) {} },
    get: function (collection) { var d = this.load(); return d[collection] || []; },
    set: function (collection, records) { var d = this.load(); d[collection] = records; this.save(d); }
  };

  /* ── PRODUCT / INVENTORY ENGINE ──────────────────────────── */
  var Products = {
    getAll: function () { return DB.get('products'); },
    updateStock: function (sku, qty, platform) {
      var products = DB.get('products');
      for (var i = 0; i < products.length; i++) {
        if (products[i].sku === sku) {
          products[i].stock = qty;
          products[i].lastSync = ts();
          products[i].syncedFrom = platform || 'manual';
          DB.set('products', products);
          if (CFG.onStockSync) CFG.onStockSync({ sku: sku, stock: qty, platform: platform });
          return products[i];
        }
      }
      return null;
    },
    getLowStock: function (threshold) {
      return DB.get('products').filter(function (p) { return p.stock <= (threshold || p.minStock || 10); });
    },
    syncAll: function (sourceData, platform) {
      var products = DB.get('products');
      var synced = 0;
      (sourceData || []).forEach(function (src) {
        for (var i = 0; i < products.length; i++) {
          if (products[i].sku === src.sku) {
            products[i].stock = src.stock;
            products[i].price = src.price || products[i].price;
            products[i].lastSync = ts();
            products[i].syncedFrom = platform;
            synced++;
            break;
          }
        }
      });
      DB.set('products', products);
      return { synced: synced, total: products.length, timestamp: ts() };
    }
  };

  /* ── ORDERS ──────────────────────────────────────────────── */
  var Orders = {
    getAll: function () { return DB.get('orders'); },
    create: function (orderData) {
      var order = Object.assign({ id: 'ORD-' + uid(), status: 'Pendiente', createdAt: ts() }, orderData);
      var orders = DB.get('orders'); orders.unshift(order); DB.set('orders', orders);
      if (CFG.onOrderCreate) CFG.onOrderCreate(order);
      return order;
    },
    updateStatus: function (orderId, status) {
      var orders = DB.get('orders');
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === orderId) { orders[i].status = status; orders[i].updatedAt = ts(); break; }
      }
      DB.set('orders', orders);
    }
  };

  /* ── CART RECOVERY ───────────────────────────────────────── */
  var Carts = {
    getAbandoned: function (minutesThreshold) {
      var threshold = (minutesThreshold || 30) * 60000;
      return DB.get('carts').filter(function (c) {
        return c.status === 'abandoned' && (Date.now() - new Date(c.lastActivity).getTime()) > threshold;
      });
    },
    recover: function (cartId, channel) {
      var carts = DB.get('carts');
      for (var i = 0; i < carts.length; i++) {
        if (carts[i].id === cartId) {
          carts[i].recoveryAttempt = ts();
          carts[i].recoveryChannel = channel || 'whatsapp';
          carts[i].status = 'recovery_sent';
          DB.set('carts', carts);
          if (CFG.onCartRecovery) CFG.onCartRecovery(carts[i]);
          return carts[i];
        }
      }
      return null;
    }
  };

  /* ── UPSELLING ───────────────────────────────────────────── */
  var Upsell = {
    suggest: function (productSku) {
      var products = DB.get('products');
      var current = null;
      for (var i = 0; i < products.length; i++) { if (products[i].sku === productSku) { current = products[i]; break; } }
      if (!current) return [];
      return products.filter(function (p) {
        return p.sku !== productSku && p.category === current.category && p.price > current.price && p.stock > 0;
      }).slice(0, 3).map(function (p) {
        return { sku: p.sku, name: p.name, price: p.price, reason: 'Mismo categoría, gama superior' };
      });
    }
  };

  /* ── WEBHOOK SIMULATOR ───────────────────────────────────── */
  var Webhooks = {
    handlers: {},
    on: function (event, handler) { if (!this.handlers[event]) this.handlers[event] = []; this.handlers[event].push(handler); },
    emit: function (event, data) { (this.handlers[event] || []).forEach(function (h) { h(data); }); },
    /* Simulates incoming webhook from WooCommerce/Shopify */
    simulateIncoming: function (platform, event, data) {
      var payload = { platform: platform, event: event, data: data, receivedAt: ts(), id: 'wh-' + uid() };
      this.emit(event, payload);
      return payload;
    }
  };

  /* ── SEED ────────────────────────────────────────────────── */
  function seed() {
    if (DB.get('products').length > 0) return;
    var cats = ['Computación', 'Periféricos', 'Almacenamiento', 'Componentes'];
    var names = ['Notebook Pro 15"', 'Monitor 4K 27"', 'Teclado Mecánico', 'Mouse Ergonómico', 'Webcam HD', 'Silla Gamer', 'Auriculares BT', 'Hub USB-C', 'SSD 1TB NVMe', 'RAM DDR5 32GB'];
    DB.set('products', names.map(function (n, i) {
      return { sku: 'SKU-' + (10000 + i), name: n, stock: rand(0, 200), minStock: rand(5, 25), price: rand(15000, 890000), category: cats[i % cats.length], channel: i % 2 === 0 ? 'WooCommerce' : 'Shopify', lastSync: ts(), syncedFrom: 'seed' };
    }));
    DB.set('orders', [
      { id: 'ORD-' + uid(), customer: 'ClinicaPro SpA', total: 1250000, items: 3, status: 'Pagado', platform: 'WooCommerce', createdAt: ts() },
      { id: 'ORD-' + uid(), customer: 'TechSur Ltda', total: 450000, items: 1, status: 'Pendiente', platform: 'Shopify', createdAt: ts() }
    ]);
    DB.set('carts', [
      { id: 'CART-' + uid(), customer: 'AgriSur SA', total: 320000, items: 2, status: 'abandoned', lastActivity: new Date(Date.now() - 3600000).toISOString(), channel: 'Web' }
    ]);
  }

  /* ── PUBLIC API ──────────────────────────────────────────── */
  global.AgentEcommerce = {
    init: function (config) { Object.keys(config || {}).forEach(function (k) { CFG[k] = config[k]; }); seed(); return this; },
    products: Products, orders: Orders, carts: Carts, upsell: Upsell, webhooks: Webhooks,
    getConfig: function () { return Object.assign({}, CFG); },
    exportCSV: function () {
      var products = Products.getAll();
      var h = ['SKU', 'Producto', 'Stock', 'Mín', 'Precio', 'Canal', 'Última Sync'];
      var rows = products.map(function (p) { return [p.sku, p.name, p.stock, p.minStock, p.price, p.channel, p.lastSync].map(function (v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(','); });
      var csv = [h.join(',')].concat(rows).join('\n');
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'inventario_ecommerce_' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    },
    resetDB: function () { localStorage.removeItem(CFG.storageKey); },
    setStorageAdapter: function (adapter) { Object.keys(adapter).forEach(function (k) { DB[k] = adapter[k]; }); }
  };

})(window);


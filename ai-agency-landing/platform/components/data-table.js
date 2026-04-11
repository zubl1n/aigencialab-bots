/* ═══════════════════════════════════════════════════════════════
   data-table.js — Tablas densas sortables con paginación
   ═══════════════════════════════════════════════════════════════ */
var DataTable = (function () {
  'use strict';

  function create(container, config) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return null;

    var state = {
      columns: config.columns || [],
      data: config.data || [],
      sortCol: null, sortDir: 'asc',
      page: 0, pageSize: config.pageSize || 10,
      filter: ''
    };

    function getFiltered() {
      if (!state.filter) return state.data;
      var q = state.filter.toLowerCase();
      return state.data.filter(function (row) {
        return state.columns.some(function (col) {
          return String(row[col.key] || '').toLowerCase().indexOf(q) !== -1;
        });
      });
    }

    function getSorted() {
      var filtered = getFiltered();
      if (!state.sortCol) return filtered;
      var col = state.sortCol;
      var dir = state.sortDir === 'asc' ? 1 : -1;
      return filtered.slice().sort(function (a, b) {
        var va = a[col], vb = b[col];
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return String(va || '').localeCompare(String(vb || '')) * dir;
      });
    }

    function getPaged() {
      var sorted = getSorted();
      var start = state.page * state.pageSize;
      return { rows: sorted.slice(start, start + state.pageSize), total: sorted.length };
    }

    function render() {
      var result = getPaged();
      var totalPages = Math.ceil(result.total / state.pageSize);

      var html = '<div style="margin-bottom:10px;display:flex;gap:8px;align-items:center;">' +
        '<input type="text" placeholder="Buscar..." value="' + state.filter + '" style="flex:1;padding:7px 12px;border:1px solid #E2E5EA;border-radius:6px;font-size:.82rem;outline:none;font-family:Inter,sans-serif;" onkeyup="this._dtFilter(this.value)"/>' +
        '<span style="font-size:.75rem;color:#9CA3AF;">' + result.total + ' registros</span></div>';

      html += '<div style="overflow-x:auto;"><table class="data-table"><thead><tr>';
      state.columns.forEach(function (col) {
        var icon = state.sortCol === col.key ? (state.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
        html += '<th data-col="' + col.key + '">' + col.label + '<span class="sort-icon">' + icon + '</span></th>';
      });
      html += '</tr></thead><tbody>';

      if (result.rows.length === 0) {
        html += '<tr><td colspan="' + state.columns.length + '" style="text-align:center;color:#9CA3AF;padding:20px;">Sin datos</td></tr>';
      } else {
        result.rows.forEach(function (row) {
          html += '<tr>';
          state.columns.forEach(function (col) {
            var val = row[col.key] != null ? row[col.key] : '—';
            if (col.render) val = col.render(val, row);
            html += '<td>' + val + '</td>';
          });
          html += '</tr>';
        });
      }
      html += '</tbody></table></div>';

      // Pagination
      if (totalPages > 1) {
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:.78rem;">';
        html += '<span style="color:#9CA3AF;">Página ' + (state.page + 1) + ' de ' + totalPages + '</span>';
        html += '<div style="display:flex;gap:4px;">';
        html += '<button class="dt-prev" style="padding:4px 10px;border:1px solid #E2E5EA;border-radius:4px;background:#fff;cursor:pointer;font-size:.78rem;"' + (state.page === 0 ? ' disabled' : '') + '>← Anterior</button>';
        html += '<button class="dt-next" style="padding:4px 10px;border:1px solid #E2E5EA;border-radius:4px;background:#fff;cursor:pointer;font-size:.78rem;"' + (state.page >= totalPages - 1 ? ' disabled' : '') + '>Siguiente →</button>';
        html += '</div></div>';
      }

      container.innerHTML = html;

      // Bind events
      var input = container.querySelector('input');
      if (input) input._dtFilter = function (v) { state.filter = v; state.page = 0; render(); };

      container.querySelectorAll('th[data-col]').forEach(function (th) {
        th.addEventListener('click', function () {
          var col = th.getAttribute('data-col');
          if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
          else { state.sortCol = col; state.sortDir = 'asc'; }
          render();
        });
      });

      var prev = container.querySelector('.dt-prev');
      var next = container.querySelector('.dt-next');
      if (prev) prev.addEventListener('click', function () { if (state.page > 0) { state.page--; render(); } });
      if (next) next.addEventListener('click', function () { if (state.page < totalPages - 1) { state.page++; render(); } });
    }

    render();
    return {
      setData: function (d) { state.data = d; state.page = 0; render(); },
      refresh: render
    };
  }

  return { create: create };
})();

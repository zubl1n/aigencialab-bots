/* ═══════════════════════════════════════════════════════════════
   log-viewer.js — Visor de logs en tiempo real con colores
   ═══════════════════════════════════════════════════════════════ */
var LogViewer = (function () {
  'use strict';

  function create(container, opts) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return null;
    opts = opts || {};

    var logs = [], filterLevel = 'all', filterText = '', autoScroll = true;

    container.innerHTML = [
      '<div class="log-viewer">',
        '<div class="log-toolbar">',
          '<input type="text" placeholder="Filtrar logs..." class="log-search"/>',
          '<button class="log-filter active" data-level="all">Todos</button>',
          '<button class="log-filter" data-level="info">INFO</button>',
          '<button class="log-filter" data-level="warn">WARN</button>',
          '<button class="log-filter" data-level="error">ERROR</button>',
        '</div>',
        '<div class="log-entries" id="logEntries"></div>',
      '</div>'
    ].join('');

    var entriesEl = container.querySelector('.log-entries');
    var searchEl = container.querySelector('.log-search');

    function render() {
      var filtered = logs.filter(function (l) {
        if (filterLevel !== 'all' && l.level !== filterLevel) return false;
        if (filterText && l.msg.toLowerCase().indexOf(filterText) === -1 && (l.agent || '').toLowerCase().indexOf(filterText) === -1) return false;
        return true;
      });
      entriesEl.innerHTML = filtered.slice(-200).map(function (l) {
        return '<div class="log-entry">' +
          '<span class="log-ts">' + l.time + '</span>' +
          '<span class="log-level ' + l.level + '">' + l.level.toUpperCase() + '</span>' +
          '<span class="log-msg">' + l.msg + '</span>' +
          (l.agent ? '<span class="log-agent">' + l.agent + '</span>' : '') +
        '</div>';
      }).join('');
      if (autoScroll) entriesEl.scrollTop = entriesEl.scrollHeight;
    }

    // Bind filter buttons
    container.querySelectorAll('.log-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.log-filter').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        filterLevel = btn.getAttribute('data-level');
        render();
      });
    });

    searchEl.addEventListener('input', function () { filterText = searchEl.value.toLowerCase(); render(); });

    entriesEl.addEventListener('mouseenter', function () { autoScroll = false; });
    entriesEl.addEventListener('mouseleave', function () { autoScroll = true; });

    return {
      add: function (level, msg, agent) {
        var now = new Date();
        logs.push({
          time: now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          level: level, msg: msg, agent: agent || ''
        });
        if (logs.length > 500) logs = logs.slice(-300);
        render();
      },
      clear: function () { logs = []; render(); },
      setLogs: function (newLogs) { logs = newLogs; render(); }
    };
  }

  return { create: create };
})();

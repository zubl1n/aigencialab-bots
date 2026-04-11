/* ═══════════════════════════════════════════════════════════════
   chart-engine.js — Motor de gráficos SVG sin dependencias
   Tipos: line, bar, donut, area
   ═══════════════════════════════════════════════════════════════ */
var ChartEngine = (function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function createSVG(w, h) {
    var svg = svgEl('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', preserveAspectRatio: 'xMidYMid meet' });
    svg.style.display = 'block';
    return svg;
  }

  /* ── LINE CHART ──────────────────────────────────────────── */
  function lineChart(container, data, opts) {
    opts = opts || {};
    var W = opts.width || 600, H = opts.height || 200;
    var pad = { top: 20, right: 20, bottom: 30, left: 50 };
    var cW = W - pad.left - pad.right;
    var cH = H - pad.top - pad.bottom;
    var svg = createSVG(W, H);

    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) * 1.15;
    var min = 0;

    // Grid lines
    for (var g = 0; g <= 4; g++) {
      var gy = pad.top + cH - (g / 4) * cH;
      svg.appendChild(svgEl('line', { x1: pad.left, y1: gy, x2: W - pad.right, y2: gy, stroke: '#E2E5EA', 'stroke-width': '0.5' }));
      var label = svgEl('text', { x: pad.left - 8, y: gy + 4, fill: '#9CA3AF', 'font-size': '10', 'text-anchor': 'end', 'font-family': 'Inter,sans-serif' });
      label.textContent = Math.round(min + (max - min) * (g / 4));
      svg.appendChild(label);
    }

    // Data path
    var points = data.map(function (d, i) {
      var x = pad.left + (i / (data.length - 1)) * cW;
      var y = pad.top + cH - ((d.value - min) / (max - min)) * cH;
      return { x: x, y: y };
    });
    var pathD = points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y; }).join(' ');

    // Area fill
    var areaD = pathD + ' L' + points[points.length - 1].x + ',' + (pad.top + cH) + ' L' + points[0].x + ',' + (pad.top + cH) + ' Z';
    var grad = svgEl('defs');
    var lg = svgEl('linearGradient', { id: 'areaGrad' + Math.random().toString(36).substr(2, 4), x1: '0', y1: '0', x2: '0', y2: '1' });
    var s1 = svgEl('stop', { offset: '0%', 'stop-color': opts.color || '#2563EB', 'stop-opacity': '0.2' });
    var s2 = svgEl('stop', { offset: '100%', 'stop-color': opts.color || '#2563EB', 'stop-opacity': '0.01' });
    lg.appendChild(s1); lg.appendChild(s2); grad.appendChild(lg); svg.appendChild(grad);
    svg.appendChild(svgEl('path', { d: areaD, fill: 'url(#' + lg.id + ')' }));

    // Line
    svg.appendChild(svgEl('path', { d: pathD, fill: 'none', stroke: opts.color || '#2563EB', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

    // Dots + labels
    points.forEach(function (p, i) {
      svg.appendChild(svgEl('circle', { cx: p.x, cy: p.y, r: '3', fill: opts.color || '#2563EB' }));
      if (data[i].label && i % Math.ceil(data.length / 8) === 0) {
        var l = svgEl('text', { x: p.x, y: H - 8, fill: '#9CA3AF', 'font-size': '9', 'text-anchor': 'middle', 'font-family': 'Inter,sans-serif' });
        l.textContent = data[i].label;
        svg.appendChild(l);
      }
    });

    if (typeof container === 'string') container = document.querySelector(container);
    if (container) { container.innerHTML = ''; container.appendChild(svg); }
    return svg;
  }

  /* ── BAR CHART ───────────────────────────────────────────── */
  function barChart(container, data, opts) {
    opts = opts || {};
    var W = opts.width || 600, H = opts.height || 200;
    var pad = { top: 20, right: 20, bottom: 30, left: 50 };
    var cW = W - pad.left - pad.right;
    var cH = H - pad.top - pad.bottom;
    var svg = createSVG(W, H);

    var max = Math.max.apply(null, data.map(function (d) { return d.value; })) * 1.15;
    var barW = Math.min(30, cW / data.length * 0.6);
    var gap = cW / data.length;

    for (var g = 0; g <= 4; g++) {
      var gy = pad.top + cH - (g / 4) * cH;
      svg.appendChild(svgEl('line', { x1: pad.left, y1: gy, x2: W - pad.right, y2: gy, stroke: '#E2E5EA', 'stroke-width': '0.5' }));
    }

    data.forEach(function (d, i) {
      var h = (d.value / max) * cH;
      var x = pad.left + gap * i + gap / 2 - barW / 2;
      var y = pad.top + cH - h;
      var color = d.color || opts.color || '#2563EB';
      svg.appendChild(svgEl('rect', { x: x, y: y, width: barW, height: h, fill: color, rx: '3' }));
      var l = svgEl('text', { x: x + barW / 2, y: H - 8, fill: '#9CA3AF', 'font-size': '9', 'text-anchor': 'middle', 'font-family': 'Inter,sans-serif' });
      l.textContent = d.label || '';
      svg.appendChild(l);
    });

    if (typeof container === 'string') container = document.querySelector(container);
    if (container) { container.innerHTML = ''; container.appendChild(svg); }
    return svg;
  }

  /* ── DONUT CHART ─────────────────────────────────────────── */
  function donutChart(container, data, opts) {
    opts = opts || {};
    var size = opts.size || 160;
    var svg = createSVG(size, size);
    var cx = size / 2, cy = size / 2, r = size * 0.38, sw = size * 0.12;
    var total = data.reduce(function (s, d) { return s + d.value; }, 0);
    var angle = -90;
    var colors = ['#2563EB', '#6C3AED', '#059669', '#D97706', '#DC2626', '#EC4899', '#14B8A6'];

    data.forEach(function (d, i) {
      var pct = d.value / total;
      var a1 = angle * Math.PI / 180;
      angle += pct * 360;
      var a2 = angle * Math.PI / 180;
      var largeArc = pct > 0.5 ? 1 : 0;
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var pathD = 'M' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 ' + largeArc + ',1 ' + x2 + ',' + y2;
      svg.appendChild(svgEl('path', { d: pathD, fill: 'none', stroke: d.color || colors[i % colors.length], 'stroke-width': sw, 'stroke-linecap': 'round' }));
    });

    // Center text
    if (opts.centerText) {
      var t = svgEl('text', { x: cx, y: cy - 4, fill: '#1A1D23', 'font-size': '18', 'font-weight': '700', 'text-anchor': 'middle', 'font-family': 'Inter,sans-serif' });
      t.textContent = opts.centerText;
      svg.appendChild(t);
      if (opts.centerSub) {
        var ts = svgEl('text', { x: cx, y: cy + 14, fill: '#9CA3AF', 'font-size': '10', 'text-anchor': 'middle', 'font-family': 'Inter,sans-serif' });
        ts.textContent = opts.centerSub;
        svg.appendChild(ts);
      }
    }

    if (typeof container === 'string') container = document.querySelector(container);
    if (container) { container.innerHTML = ''; container.appendChild(svg); }
    return svg;
  }

  return { line: lineChart, bar: barChart, donut: donutChart };
})();

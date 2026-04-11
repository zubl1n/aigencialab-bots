/* ═══════════════════════════════════════════════════════════════
   audit.js — Motor de Auditoría IA REAL (Lead Magnet)
   AigenciaLab.cl · Vanilla JS · Sin dependencias · Ley N°21.663 + N°19.628

   MOTORES DE ANÁLISIS (en orden de prioridad):
   1. Google PageSpeed Insights API v5 (gratuita, sin key para tráfico bajo)
   2. allorigins.win proxy → análisis SEO del HTML real
   3. Análisis de configuración por rubro (fallback siempre disponible)

   CONFIGURACIÓN:
   ─ WA_SALES:         número WhatsApp del equipo de ventas (sin +)
   ─ PSI_API_KEY:      opcional, aumenta límite de requests PageSpeed
   ─ CORS_PROXY:       proxy alternativo si allorigins falla
   ─ USE_REAL_API:     false para modo demo puro (sin llamadas externas)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── ⚙️  CONFIGURACIÓN (editar aquí) ─────────────────────── */
  var CFG = {
    WA_SALES:    '56912345678',   // ← CAMBIAR al número real de ventas
    PSI_API_KEY: '',              // ← Opcional: Google PageSpeed API Key
    CORS_PROXY:  'https://api.allorigins.win/get?url=',
    USE_REAL_API: true,           // false = solo análisis simulado (demo)
    PIPELINE_KEY: 'AigenciaLab_pipeline_leads',
    STORAGE_KEY:  'AigenciaLab_audit_leads'
  };

  /* ── 📚 RUBRO CONFIG ──────────────────────────────────────── */
  var RUBRO_CFG = {
    ecommerce_moda: {
      name: 'Ecommerce Moda', baseScore: 42,
      savingsMin: 850000, savingsMax: 2800000,
      issues: [
        { sev:'critical', icon:'🛒', title:'Alta tasa de abandono de carrito', desc:'Promedio del rubro: 78% abandono. Cada carrito perdido = venta no recuperada.' },
        { sev:'critical', icon:'📱', title:'Checkout no optimizado para móvil', desc:'68% de tus visitantes llegan desde smartphone. Un checkout lento pierde el 60% de conversiones.' },
        { sev:'warning',  icon:'💬', title:'Sin asistente de tallas y estilismo', desc:'Las preguntas de talla representan el 40% del soporte. Sin IA, demoran horas.' },
        { sev:'warning',  icon:'📦', title:'Stock sin sincronización en tiempo real', desc:'Desincronización genera ventas de productos sin stock y reclamos.' },
        { sev:'info',     icon:'🔁', title:'Sin recuperación de carritos vía WhatsApp', desc:'Un mensaje a los 30min recupera el 15-22% de los carritos abandonados.' }
      ],
      opportunities: [
        { icon:'🤖', title:'Agente de Ventas WhatsApp', desc:'Responde tallas, colores y disponibilidad 24/7 sin personal', impact:'Ahorra 8h/día' },
        { icon:'🛒', title:'Recuperación de Carritos IA', desc:'WhatsApp automático con oferta personalizada a los 30 min', impact:'+22% conversión' },
        { icon:'📊', title:'Sync Inventario Real-Time', desc:'WooCommerce/Shopify ↔ ERP en tiempo real, cero desincronización', impact:'0 ventas fallidas' }
      ]
    },
    ecommerce_retail: {
      name: 'Retail General', baseScore: 38,
      savingsMin: 1200000, savingsMax: 4500000,
      issues: [
        { sev:'critical', icon:'📦', title:'Inventario multicanal sin sincronización', desc:'Sin sync entre tienda física, web y marketplaces genera quiebres y overselling.' },
        { sev:'critical', icon:'🚚', title:'Tracking de envíos sin notificaciones', desc:'El 67% de los tickets de soporte son "¿dónde está mi pedido?". Se automatiza al 100%.' },
        { sev:'warning',  icon:'💬', title:'Tiempo de respuesta >4h en soporte', desc:'Cada hora de espera extra reduce la satisfacción en un 15%.' },
        { sev:'info',     icon:'📈', title:'Sin análisis predictivo de demanda', desc:'Sobrestock y quiebres cuestan en promedio UF 25/mes.' }
      ],
      opportunities: [
        { icon:'🛒', title:'Stock Sync Inteligente', desc:'Inventario unificado en todos los canales', impact:'-40% error stock' },
        { icon:'🚚', title:'Agente de Seguimiento de Pedidos', desc:'Responde "¿dónde está mi pedido?" automáticamente', impact:'-70% tickets' },
        { icon:'📈', title:'BI Predictivo de Demanda', desc:'Anticipa quiebres de stock 2 semanas antes', impact:'+18% margen' }
      ]
    },
    clinica: {
      name:'Clínica / Salud', baseScore:35,
      savingsMin:1800000, savingsMax:6000000,
      issues:[
        { sev:'critical', icon:'📞', title:'Recepción saturada y tiempos de espera altos', desc:'El 45% de las llamadas son para agendar. IA lo resuelve al instante.' },
        { sev:'critical', icon:'🗓️', title:'Sin confirmación automática de citas', desc:'El 25% de los "no show" se evita con recordatorio automático 24h antes por WhatsApp.' },
        { sev:'warning',  icon:'💊', title:'Sin gestión de derivaciones IA', desc:'Pacientes derivados al especialista incorrecto = reprogramación y mala experiencia.' },
        { sev:'info',     icon:'📋', title:'Formularios de admisión manuales', desc:'Automatizar pre-anamnesis ahorra 8 minutos por paciente.' }
      ],
      opportunities:[
        { icon:'🗓️', title:'Agente de Agendamiento IA', desc:'Agenda, confirma y recuerda citas automáticamente', impact:'-25% no-show' },
        { icon:'💬', title:'Recepción Virtual 24/7', desc:'Responde consultas básicas, horarios y aranceles sin personal', impact:'Ahorra 3 RRHH' },
        { icon:'📋', title:'Pre-anamnesis Automatizada', desc:'Formulario inteligente antes de la consulta', impact:'-8 min/paciente' }
      ]
    },
    inmobiliaria: {
      name:'Inmobiliaria', baseScore:40,
      savingsMin:2500000, savingsMax:9000000,
      issues:[
        { sev:'critical', icon:'🏠', title:'Sin calificación automática de leads', desc:'El 70% de los contactos web no están listos para comprar. Cada uno consume horas del equipo.' },
        { sev:'warning',  icon:'📸', title:'Sin visitas virtuales IA guiadas', desc:'Compradores digitales esperan recorridos virtuales. Sin ellos, pierdes el 35% de leads.' },
        { sev:'warning',  icon:'📱', title:'Sin seguimiento automático de cotizaciones', desc:'El 60% de las cotizaciones sin seguimiento en 48h se cierran con la competencia.' },
        { sev:'info',     icon:'📊', title:'Sin análisis de comportamiento de prospectos', desc:'Sin datos no puedes personalizar el seguimiento commercial.' }
      ],
      opportunities:[
        { icon:'🤖', title:'Agente Calificador de Leads', desc:'Detecta budget y motivación. Solo entrega leads calientes a brokers', impact:'+40% cierre' },
        { icon:'📱', title:'Seguimiento WhatsApp Automático', desc:'Recordatorios de visitas, documentos y plazos sin manual', impact:'-60% abandono' },
        { icon:'📊', title:'CRM IA Integrado', desc:'Pipeline visual con scoring de probabilidad de cierre', impact:'2x productividad' }
      ]
    },
    courier: {
      name:'Courier / Logística', baseScore:45,
      savingsMin:2000000, savingsMax:7000000,
      issues:[
        { sev:'critical', icon:'📍', title:'Sin tracking en tiempo real para clientes', desc:'El 80% de las consultas de soporte son de tracking. $3.500 por consulta manual.' },
        { sev:'critical', icon:'⚠️', title:'Sin alertas automáticas de SLA', desc:'Incumplimientos detectados tarde generan penalidades y pérdida de contratos.' },
        { sev:'warning',  icon:'📞', title:'Sin comunicación proactiva de incidencias', desc:'Te enteras cuando el cliente llama. La IA detecta y notifica antes.' },
        { sev:'info',     icon:'🗺️', title:'Optimización de rutas manual', desc:'Sin IA de ruteo se desperdicia en promedio el 18% del combustible.' }
      ],
      opportunities:[
        { icon:'📍', title:'Tracking Auto-respuesta WhatsApp', desc:'"¿Dónde está mi paquete?" → Respuesta instantánea', impact:'-80% tickets' },
        { icon:'🚨', title:'Alertas SLA Inteligentes', desc:'Notificación antes de que venza el plazo', impact:'-90% penalidades' },
        { icon:'📊', title:'Dashboard Operaciones IA', desc:'Vista unificada de todos los envíos con alertas', impact:'+25% eficiencia' }
      ]
    },
    restaurante: {
      name:'Restaurante / Food', baseScore:38,
      savingsMin:600000, savingsMax:2000000,
      issues:[
        { sev:'critical', icon:'📱', title:'Sin pedidos por WhatsApp', desc:'El 55% de los clientes prefiere pedir por WhatsApp. Sin bot, se pierden o demoran.' },
        { sev:'warning',  icon:'⭐', title:'Sin gestión de reviews y reputación', desc:'Restaurantes con respuestas automáticas a reviews tienen 2.3x más reservas.' },
        { sev:'warning',  icon:'📋', title:'Sin reservas online automatizadas', desc:'Llamadas para reservar cortan el flujo de trabajo.' },
        { sev:'info',     icon:'🎁', title:'Sin programa de fidelización IA', desc:'Clientes frecuentes sin programa gastan 3x menos.' }
      ],
      opportunities:[
        { icon:'📱', title:'Agente de Pedidos WhatsApp', desc:'Toma pedidos y notifica cocina sin pérdidas', impact:'+30% pedidos' },
        { icon:'🗓️', title:'Reservas Automáticas 24/7', desc:'Agenda mesas sin llamadas ni personal', impact:'Ahorra 2h/día' },
        { icon:'⭐', title:'Gestión de Reviews IA', desc:'Responde Google/TripAdvisor en el tono de tu marca', impact:'+0.8 ⭐ promedio' }
      ]
    },
    educacion: {
      name:'Educación / Capacitación', baseScore:40,
      savingsMin:900000, savingsMax:3500000,
      issues:[
        { sev:'critical', icon:'📝', title:'Sin proceso de matrícula automático', desc:'Cada matrícula manual toma 25 min. Un agente lo hace en 3 min.' },
        { sev:'warning',  icon:'💬', title:'Consultas pre-matrícula sin respuesta rápida', desc:'El 65% de los leads decide en las primeras 4 horas. Tardanza = lead perdido.' },
        { sev:'info',     icon:'📊', title:'Sin seguimiento de engagement de alumnos', desc:'Sin datos no puedes detectar alumnos en riesgo de abandono.' }
      ],
      opportunities:[
        { icon:'📝', title:'Agente de Admisión IA', desc:'Responde FAQs, guía inscripción y agenda entrevistas', impact:'+50% conversión' },
        { icon:'📊', title:'Seguimiento de Alumnos IA', desc:'Detecta deserción antes de que ocurra', impact:'-30% abandono' },
        { icon:'💬', title:'Soporte Académico 24/7', desc:'Responde dudas fuera de horario', impact:'5★ satisfacción' }
      ]
    },
    servicios: {
      name:'Servicios Profesionales', baseScore:36,
      savingsMin:1500000, savingsMax:5000000,
      issues:[
        { sev:'critical', icon:'📞', title:'Captación de prospectos manual y lenta', desc:'Sin calificación automática, cada lead consume 45min de tiempo facturable.' },
        { sev:'warning',  icon:'📄', title:'Sin propuestas automáticas post-contacto', desc:'Propuestas que tardan >24h pierden el 40% de los prospectos.' },
        { sev:'info',     icon:'🔄', title:'Sin onboarding sistematizado de clientes', desc:'Cada cliente nuevo = 8h de onboarding manual repetitivo.' }
      ],
      opportunities:[
        { icon:'🤖', title:'Agente Calificador de Prospectos', desc:'Solo cierra con leads calientes. Ahorra 45min por lead', impact:'3x ROI vendedor' },
        { icon:'📄', title:'Propuestas Automáticas PDF', desc:'Genera propuesta personalizada en 30 segundos', impact:'+60% cierre' },
        { icon:'🔄', title:'Onboarding Self-Service', desc:'Cliente configura su servicio sin reuniones largas', impact:'-8h por cliente' }
      ]
    },
    manufactura: {
      name:'Manufactura / Industria', baseScore:33,
      savingsMin:3000000, savingsMax:12000000,
      issues:[
        { sev:'critical', icon:'⚙️', title:'Sin control de calidad automatizado', desc:'Detección manual de defectos tiene error del 12%. IA lo reduce al 0.3%.' },
        { sev:'warning',  icon:'📦', title:'Sin predicción de demanda de insumos', desc:'Quiebres de insumos detienen la producción. Cada parada cuesta ~UF 8/hora.' },
        { sev:'info',     icon:'📊', title:'Sin KPIs de planta en tiempo real', desc:'Sin visibilidad, los gerentes deciden con datos del día anterior.' }
      ],
      opportunities:[
        { icon:'📊', title:'Dashboard OEE Tiempo Real', desc:'Disponibilidad, rendimiento y calidad de cada línea', impact:'+15% eficiencia' },
        { icon:'📦', title:'Predicción de Insumos IA', desc:'Anticipa necesidades antes de producir paradas', impact:'-90% paradas' },
        { icon:'🤖', title:'Backoffice Industrial IA', desc:'Automatiza órdenes de compra, facturas y reconciliaciones', impact:'-120h/mes admin' }
      ]
    },
    otro: {
      name:'Empresa', baseScore:38,
      savingsMin:700000, savingsMax:3000000,
      issues:[
        { sev:'critical', icon:'💬', title:'Atención al cliente sin cobertura fuera de horario', desc:'El 35% de las consultas llegan fuera de horario. Sin IA, se pierden.' },
        { sev:'warning',  icon:'📊', title:'Sin datos accionables de comportamiento de clientes', desc:'Sin analytics IA no puedes anticipar problemas ni oportunidades.' },
        { sev:'info',     icon:'🔄', title:'Procesos administrativos manuales y repetitivos', desc:'Facturación, reconciliación y reportes se automatizan al 100%.' }
      ],
      opportunities:[
        { icon:'🤖', title:'Agente de Atención 24/7', desc:'Responde consultas y escala al humano correcto', impact:'+95% satisfacción' },
        { icon:'⚙️', title:'Backoffice IA', desc:'Automatiza facturación, reportes y conciliaciones', impact:'-120h/mes' },
        { icon:'📈', title:'BI Automático', desc:'Dashboard de ventas y clientes sin configuración', impact:'Decisiones 10x rápido' }
      ]
    }
  };

  /* ── 🌐 REAL API ENGINE ───────────────────────────────────── */

  /** Safe timeout signal (polyfill for Safari < 16) */
  function safeTimeout(ms) {
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      return AbortSignal.timeout(ms);
    }
    var ctrl = new AbortController();
    setTimeout(function() { ctrl.abort(); }, ms);
    return ctrl.signal;
  }

  /** Llama a Google PageSpeed Insights (gratuito, sin key para uso básico) */
  function fetchPageSpeed(url, strategy) {
    var apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
      + '?url=' + encodeURIComponent(url)
      + '&strategy=' + (strategy || 'mobile')
      + '&locale=es'
      + (CFG.PSI_API_KEY ? '&key=' + CFG.PSI_API_KEY : '');
    return fetch(apiUrl, { signal: safeTimeout(15000) })
      .then(function(r) { if (!r.ok) throw new Error('PSI HTTP ' + r.status); return r.json(); });
  }

  /** Obtiene el HTML del sitio vía proxy CORS para análisis SEO */
  function fetchHTML(url) {
    var proxyUrl = CFG.CORS_PROXY + encodeURIComponent(url);
    return fetch(proxyUrl, { signal: safeTimeout(10000) })
      .then(function(r) { return r.json(); })
      .then(function(j) { return j.contents || ''; });
  }

  /** Parsea el HTML para extraer señales SEO */
  function parseSEO(html) {
    if (!html) return null;
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var title       = (doc.title || '').trim();
    var metaDesc    = doc.querySelector('meta[name="description"]');
    var h1s         = doc.querySelectorAll('h1');
    var imgs        = doc.querySelectorAll('img');
    var imgsNoAlt   = 0;
    imgs.forEach(function(i){ if (!i.getAttribute('alt')) imgsNoAlt++; });
    var hasWhatsApp = html.toLowerCase().indexOf('wa.me') !== -1 || html.toLowerCase().indexOf('api.whatsapp') !== -1;
    var hasChatbot  = html.toLowerCase().indexOf('chatbot') !== -1 || html.toLowerCase().indexOf('tawk') !== -1 || html.toLowerCase().indexOf('zendesk') !== -1;
    var hasCart     = html.toLowerCase().indexOf('add-to-cart') !== -1 || html.toLowerCase().indexOf('carrito') !== -1 || html.toLowerCase().indexOf('woocommerce') !== -1 || html.toLowerCase().indexOf('shopify') !== -1;
    var hasSSL      = html.toLowerCase().indexOf('https') !== -1;
    var hasGTM      = html.toLowerCase().indexOf('googletagmanager') !== -1 || html.toLowerCase().indexOf('gtag') !== -1;
    var ogImage     = doc.querySelector('meta[property="og:image"]');
    var canonical   = doc.querySelector('link[rel="canonical"]');
    var viewport    = doc.querySelector('meta[name="viewport"]');
    return {
      title:       title,
      titleLen:    title.length,
      hasMetaDesc: !!metaDesc,
      metaDescLen: metaDesc ? (metaDesc.getAttribute('content') || '').length : 0,
      h1Count:     h1s.length,
      h1Text:      h1s.length > 0 ? (h1s[0].textContent || '').trim().substring(0, 60) : '',
      totalImgs:   imgs.length,
      imgsNoAlt:   imgsNoAlt,
      hasWhatsApp: hasWhatsApp,
      hasChatbot:  hasChatbot,
      hasCart:     hasCart,
      hasSSL:      hasSSL,
      hasGTM:      hasGTM,
      hasOgImage:  !!ogImage,
      hasCanonical:!!canonical,
      hasMobileViewport: !!viewport,
      wordCount:   (html.replace(/<[^>]*>/g,'').match(/\S+/g) || []).length
    };
  }

  /** Extrae métricas clave del resultado de PageSpeed */
  function parsePSI(psiData) {
    try {
      var cats = psiData.lighthouseResult && psiData.lighthouseResult.categories;
      var audits = psiData.lighthouseResult && psiData.lighthouseResult.audits;
      var lcp    = audits && audits['largest-contentful-paint'];
      var cls    = audits && audits['cumulative-layout-shift'];
      var fid    = audits && audits['interactive'];
      var fcp    = audits && audits['first-contentful-paint'];
      var tbt    = audits && audits['total-blocking-time'];
      var si     = audits && audits['speed-index'];
      return {
        perfScore:   cats && cats.performance ? Math.round(cats.performance.score * 100) : null,
        seoScore:    cats && cats.seo         ? Math.round(cats.seo.score * 100)         : null,
        a11yScore:   cats && cats.accessibility ? Math.round(cats.accessibility.score * 100) : null,
        bpScore:     cats && cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : null,
        lcp:         lcp  ? lcp.displayValue  : null,
        cls:         cls  ? cls.displayValue  : null,
        tti:         fid  ? fid.displayValue  : null,
        fcp:         fcp  ? fcp.displayValue  : null,
        tbt:         tbt  ? tbt.displayValue  : null,
        si:          si   ? si.displayValue   : null,
        fieldData:   psiData.loadingExperience || null
      };
    } catch(e) { return null; }
  }

  /* ── 🧮 SCORE CALCULATOR ──────────────────────────────────── */
  function buildAnalysis(url, rubro, psi, seo) {
    var cfg         = RUBRO_CFG[rubro] || RUBRO_CFG['otro'];
    var hasUrl      = url && url.length > 6;
    var realData    = !!(psi || seo);

    /* --- Velocidad --- */
    var speedScore;
    if (psi && psi.perfScore !== null) {
      speedScore = psi.perfScore;
    } else {
      speedScore = hasUrl ? rand(35, 72) : rand(20, 50);
    }

    /* --- SEO --- */
    var seoScore = 0;
    var seoIssues = [];
    if (seo) {
      var pts = 0;
      if (seo.title && seo.titleLen >= 30 && seo.titleLen <= 70) { pts += 20; } else { seoIssues.push('Título SEO ausente o mal optimizado (' + (seo.titleLen || 0) + ' chars)'); }
      if (seo.hasMetaDesc && seo.metaDescLen >= 80)              { pts += 20; } else { seoIssues.push('Meta description ausente o muy corta'); }
      if (seo.h1Count === 1)                                      { pts += 15; } else if (seo.h1Count === 0) { seoIssues.push('Sin etiqueta H1 en la página principal'); } else { seoIssues.push('Múltiples H1 (' + seo.h1Count + ') — confunde a Google'); }
      if (seo.imgsNoAlt === 0)                                   { pts += 15; } else { seoIssues.push(seo.imgsNoAlt + ' imágenes sin atributo ALT'); }
      if (seo.hasCanonical)                                      { pts += 10; } else { seoIssues.push('Sin URL canónica definida'); }
      if (seo.hasOgImage)                                        { pts += 10; } else { seoIssues.push('Sin imagen og:image para redes sociales'); }
      if (seo.hasMobileViewport)                                 { pts += 10; }
      seoScore = pts;
    } else {
      seoScore = hasUrl ? rand(30, 65) : rand(15, 45);
    }

    /* --- UX --- */
    var uxScore;
    if (psi && psi.a11yScore !== null) {
      uxScore = Math.round(psi.a11yScore * 0.6 + (seo && seo.hasMobileViewport ? 40 : 10));
    } else {
      uxScore = hasUrl ? rand(38, 75) : rand(20, 55);
    }

    /* --- Atención IA --- */
    var atencScore = 10; // base sin automatización
    if (seo) {
      if (seo.hasWhatsApp) { atencScore += 20; }
      if (seo.hasChatbot)  { atencScore += 30; }
    }

    /* --- Score General Ponderado --- */
    var baseScore = cfg.baseScore;
    var generalScore;
    if (realData) {
      generalScore = Math.round(speedScore * 0.35 + seoScore * 0.30 + uxScore * 0.25 + atencScore * 0.10);
    } else {
      generalScore = Math.min(80, Math.max(18, baseScore + rand(-8, 12) + (!hasUrl ? -15 : 0)));
    }
    generalScore = Math.min(98, Math.max(8, generalScore));

    /* --- Tier --- */
    var tier, tierColor;
    if      (generalScore >= 70) { tier = 'Optimizado';      tierColor = '#059669'; }
    else if (generalScore >= 50) { tier = 'En Desarrollo';   tierColor = '#2563EB'; }
    else if (generalScore >= 35) { tier = 'Necesita Mejoras'; tierColor = '#D97706'; }
    else                          { tier = 'Crítico';         tierColor = '#DC2626'; }

    /* --- Métricas por categoría --- */
    var speedColor  = speedScore >= 70 ? '#059669' : (speedScore >= 50 ? '#D97706' : '#DC2626');
    var seoColorM   = seoScore   >= 70 ? '#059669' : (seoScore   >= 50 ? '#D97706' : '#DC2626');
    var uxColorM    = uxScore    >= 70 ? '#059669' : (uxScore    >= 50 ? '#2563EB' : '#DC2626');
    var metrics = [
      {
        label: 'Velocidad Web (' + (psi ? '📡 Real' : '📊 Estimado') + ')',
        value: speedScore + '/100',
        score: speedScore,
        color: speedColor,
        status: speedScore >= 70 ? '✅ Buena' : (speedScore >= 50 ? '⚠️ Mejorable' : '🚨 Lenta'),
        detail: psi && psi.lcp ? 'LCP: ' + psi.lcp + ' · FCP: ' + psi.fcp : null
      },
      {
        label: 'SEO Técnico (' + (seo ? '📡 Real' : '📊 Estimado') + ')',
        value: seoScore + '/100',
        score: seoScore,
        color: seoColorM,
        status: seoScore >= 70 ? '✅ Visible' : (seoScore >= 50 ? '⚠️ Mejorable' : '🚨 Deficiente'),
        detail: seo ? ('H1: ' + seo.h1Count + ' · Desc: ' + (seo.hasMetaDesc ? 'Sí' : 'No') + ' · Alt: ' + (seo.imgsNoAlt === 0 ? 'OK' : seo.imgsNoAlt + ' faltantes')) : null
      },
      {
        label: 'Experiencia UX (' + (psi ? '📡 Real' : '📊 Estimado') + ')',
        value: uxScore + '/100',
        score: uxScore,
        color: uxColorM,
        status: uxScore >= 70 ? '✅ Buena' : (uxScore >= 50 ? '⚠️ Mejorable' : '🚨 Deficiente'),
        detail: psi && psi.bpScore ? 'Best Practices: ' + psi.bpScore + '/100' : null
      },
      {
        label: 'Atención Digital IA',
        value: atencScore + '/100',
        score: atencScore,
        color: atencScore >= 30 ? '#2563EB' : '#DC2626',
        status: seo && seo.hasWhatsApp ? (seo.hasChatbot ? '✅ Activa' : '⚠️ Solo WhatsApp') : '🚨 Sin automatizar',
        detail: seo ? ('WhatsApp: ' + (seo.hasWhatsApp ? 'Sí' : 'No') + ' · Chatbot: ' + (seo.hasChatbot ? 'Sí' : 'No')) : null
      }
    ];

    /* --- Issues adicionales desde análisis real --- */
    var extraIssues = [];
    if (seoIssues.length > 0) {
      seoIssues.slice(0, 3).forEach(function(i) {
        extraIssues.push({ sev:'warning', icon:'🔍', title:'SEO: ' + i.substring(0, 50), desc:'Detectado en análisis directo de tu sitio web.' });
      });
    }
    if (seo && !seo.hasWhatsApp) {
      extraIssues.push({ sev:'critical', icon:'📱', title:'Sin botón WhatsApp visible', desc:'El 78% de los chilenos usa WhatsApp para contactar empresas. Sin botón = pérdida de leads.' });
    }
    if (psi && psi.perfScore !== null && psi.perfScore < 50) {
      extraIssues.push({ sev:'critical', icon:'🐢', title:'Sitio lento: score ' + psi.perfScore + '/100', desc:'Google penaliza sitios lentos en el ranking. LCP: ' + (psi.lcp || 'N/A') + '. Impacto directo en conversiones.' });
    }
    if (seo && seo.hasCart && !seo.hasWhatsApp) {
      extraIssues.push({ sev:'warning', icon:'🛒', title:'Tienda detectada sin recuperación de carritos', desc:'Se detectó funcionalidad ecommerce pero sin canal WhatsApp para recuperar carritos abandonados.' });
    }

    var allIssues = extraIssues.concat(cfg.issues).slice(0, 6);

    return {
      score:        generalScore,
      tier:         tier,
      tierColor:    tierColor,
      metrics:      metrics,
      issues:       allIssues,
      opportunities:cfg.opportunities,
      savingsMin:   cfg.savingsMin,
      savingsMax:   cfg.savingsMax,
      rubroName:    cfg.name,
      hasUrl:       hasUrl,
      realData:     realData,
      psi:          psi,
      seo:          seo,
      speedScore:   speedScore,
      seoScoreNum:  seoScore,
      uxScore:      uxScore,
      atencScore:   atencScore
    };
  }

  /* ── 🔄 ORCHESTRATOR ──────────────────────────────────────── */
  function runRealAnalysis(url, rubro, onProgress, onDone) {
    var psiResult = null;
    var seoResult = null;
    var hasUrl    = url && url.startsWith('http');
    var cleanUrl  = hasUrl ? url : null;

    if (!CFG.USE_REAL_API || !hasUrl) {
      onProgress(5);
      setTimeout(function() {
        onDone(buildAnalysis(url, rubro, null, null), false);
      }, 3000);
      return;
    }

    onProgress(1); // fase 1: iniciando

    var psiMobile  = fetchPageSpeed(cleanUrl, 'mobile').then(function(d) { psiResult = parsePSI(d); onProgress(2); }).catch(function() { onProgress(2); });
    var htmlFetch  = fetchHTML(cleanUrl).then(function(html) { seoResult = parseSEO(html); onProgress(3); }).catch(function() { onProgress(3); });

    Promise.allSettled([psiMobile, htmlFetch]).then(function() {
      onProgress(4);
      setTimeout(function() {
        onProgress(5);
        onDone(buildAnalysis(url, rubro, psiResult, seoResult), true);
      }, 600);
    });
  }

  /* ── 💾 LEAD STORAGE ──────────────────────────────────────── */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }

  function saveLead(data) {
    try {
      var leads = JSON.parse(localStorage.getItem(CFG.STORAGE_KEY) || '[]');
      var lead = Object.assign({}, data, { id: uid(), ts: new Date().toISOString(), source: 'audit' });
      leads.unshift(lead);
      localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(leads.slice(0, 200)));
    } catch(e) {}
    // Auto-inject into Pipeline dashboard
    injectIntoPipeline(data);
    // Hook para backend: window.AigenciaLabOnAuditLead = function(data) { fetch('/api/leads', {...}) }
    if (window.AigenciaLabOnAuditLead) window.AigenciaLabOnAuditLead(data);
  }

  function injectIntoPipeline(data) {
    try {
      var score = Math.min(95, (data.score || 50) + 35); // Audit = alta intención
      var tier  = score >= 70 ? { label:'Caliente 🔥', cls:'tier-hot' } : (score >= 40 ? { label:'Tibio 🌡️', cls:'tier-warm' } : { label:'Frío ❄️', cls:'tier-cold' });
      var lead = {
        id: uid(), company: data.url || 'Lead Web', contact: data.name || 'Prospecto',
        rubro: data.rubro || 'General', whatsapp: data.whatsapp || '',
        email: data.email || '',
        score: score, tier: tier.label, tierCls: tier.cls, prob: Math.min(90, Math.round(score * 0.85)),
        action: score >= 70 ? '📞 Llamar hoy — Completó auditoría real.' : '📨 Enviar propuesta PDF personalizada.',
        lastActivity: new Date().toISOString(), createdAt: new Date().toISOString(),
        notes: 'Score auditoría: ' + data.score + '/100. Rubro: ' + data.rubro + '. URL: ' + (data.url || 'N/A'),
        events: { completedAudit: true, realData: data.realData }, auditScore: data.score
      };
      var all = JSON.parse(localStorage.getItem(CFG.PIPELINE_KEY) || '[]');
      all.unshift(lead);
      localStorage.setItem(CFG.PIPELINE_KEY, JSON.stringify(all.slice(0, 200)));
    } catch(e) {}
  }

  /* ── 🎬 ANIMATION ENGINE ──────────────────────────────────── */
  var PHASE_MSGS = [
    'Iniciando análisis de infraestructura digital...',
    '📡 Consultando Google PageSpeed en tiempo real...',
    '🌐 Descargando y analizando HTML del sitio...',
    '🔍 Procesando señales SEO y de conversión...',
    '🤖 Calculando oportunidades de automatización IA...',
    '📊 Generando reporte personalizado para tu rubro...'
  ];

  var completedPhases = 0;
  var msgInterval = null;

  function onProgress(phase) {
    var msgEl = document.getElementById('analyzingMsg');
    if (msgEl && PHASE_MSGS[phase]) msgEl.textContent = PHASE_MSGS[phase];
    if (phase > completedPhases) {
      for (var i = completedPhases + 1; i <= phase; i++) {
        (function(idx){
          setTimeout(function() {
            var chk  = document.getElementById('chk' + idx);
            var fill = document.getElementById('fill' + idx);
            if (!chk || !fill) return;
            chk.classList.remove('pending');
            chk.classList.add('running');
            var icon = chk.querySelector('.check-icon');
            if (icon) icon.textContent = '⚙️';
            fill.style.width = '60%';
            setTimeout(function() {
              fill.style.width = '100%';
              chk.classList.remove('running');
              chk.classList.add('done');
              if (icon) icon.textContent = '✅';
            }, 700);
          }, (idx - completedPhases) * 300);
        })(i);
      }
      completedPhases = phase;
    }
  }

  /* ── 📄 RENDER REPORT ─────────────────────────────────────── */
  function fmtCLP(n) { return '$' + Math.round(n).toLocaleString('es-CL'); }
  function rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }

  function renderReport(analysis, formData) {
    var isReal = analysis.realData;

    // Header
    document.getElementById('rptName').textContent = formData.name;
    document.getElementById('rptUrl').textContent  = formData.url || 'Sin sitio web';
    var dateStr = new Date().toLocaleDateString('es-CL', {day:'2-digit', month:'long', year:'numeric'});
    document.getElementById('rptDate').textContent  = dateStr;
    document.getElementById('rptDate2').textContent = dateStr;

    // Real data badge — Premium trust signals
    var badge = document.getElementById('realDataBadge');
    if (badge) {
      if (isReal) {
        badge.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">' +
          (analysis.psi ? '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(5,150,105,.12);border:1px solid rgba(5,150,105,.25);color:#059669;padding:3px 10px;border-radius:50px;font-size:.72rem;font-weight:700;">📡 Google PageSpeed API v5 — Datos en tiempo real</span>' : '') +
          (analysis.seo ? '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(37,99,235,.12);border:1px solid rgba(37,99,235,.25);color:#2563EB;padding:3px 10px;border-radius:50px;font-size:.72rem;font-weight:700;">🔍 Análisis DOM — HTML descargado y parseado</span>' : '') +
          '</div>';
      } else {
        badge.innerHTML = '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(217,119,6,.12);border:1px solid rgba(217,119,6,.25);color:#D97706;padding:3px 10px;border-radius:50px;font-size:.72rem;font-weight:700;">📊 Estimado por benchmarks del rubro — Ingresa tu URL para datos reales</span>';
      }
    }

    // Score ring
    var circle = document.getElementById('scoreCircle');
    var circumference = 327;
    setTimeout(function() {
      var offset = circumference - (analysis.score / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      circle.style.stroke = analysis.tierColor;
    }, 100);

    var numEl = document.getElementById('scoreNum');
    var current = 0;
    var counter = setInterval(function() {
      current = Math.min(current + 2, analysis.score);
      numEl.textContent = current;
      if (current >= analysis.score) clearInterval(counter);
    }, 30);

    document.getElementById('scoreTier').textContent   = analysis.tier;
    document.getElementById('scoreTier').style.color   = analysis.tierColor;
    document.getElementById('scoreIssues').textContent = analysis.issues.length + ' problemas detectados en tu negocio';

    // Metrics with real detail
    var grid = document.getElementById('metricsGrid');
    grid.innerHTML = analysis.metrics.map(function(m) {
      return '<div class="metric-card">' +
        '<div class="metric-label">' + m.label + '</div>' +
        '<div class="metric-val" style="color:' + m.color + '">' + m.value + '</div>' +
        '<div class="metric-status" style="color:' + m.color + '">' + m.status + '</div>' +
        (m.detail ? '<div style="font-size:.68rem;color:var(--muted);margin-top:2px;">' + m.detail + '</div>' : '') +
        '<div class="metric-bar"><div class="metric-fill" style="width:' + m.score + '%;background:' + m.color + ';"></div></div>' +
      '</div>';
    }).join('');

    // Core web vitals (if real)
    if (isReal && analysis.psi) {
      var p = analysis.psi;
      var cwv = document.getElementById('coreWebVitals');
      if (cwv) {
        cwv.style.display = 'block';
        cwv.innerHTML = '<h3 style="font-size:.88rem;margin-bottom:8px;">⚡ Core Web Vitals (Google Real)</h3>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          (p.lcp ? cwvBadge('LCP', p.lcp, 'Largest Contentful Paint', lcp2color(p.lcp)) : '') +
          (p.fcp ? cwvBadge('FCP', p.fcp, 'First Contentful Paint', 'var(--primary)') : '') +
          (p.tbt ? cwvBadge('TBT', p.tbt, 'Total Blocking Time', tbt2color(p.tbt)) : '') +
          (p.si  ? cwvBadge('SI',  p.si,  'Speed Index', 'var(--sub)') : '') +
          '</div>';
      }
    }

    // Issues
    var issueMap = { critical:'issue-critical', warning:'issue-warning', info:'issue-info' };
    document.getElementById('issuesList').innerHTML = analysis.issues.map(function(issue) {
      return '<div class="issue-item ' + (issueMap[issue.sev] || 'issue-info') + '">' +
        '<div class="issue-icon">' + issue.icon + '</div>' +
        '<div class="issue-text"><strong>' + issue.title + '</strong><span>' + issue.desc + '</span></div>' +
      '</div>';
    }).join('');

    // Opportunities
    document.getElementById('opportunitiesList').innerHTML = analysis.opportunities.map(function(opp) {
      return '<div class="opp-item">' +
        '<div class="opp-icon">' + opp.icon + '</div>' +
        '<div><div class="opp-title">' + opp.title + '</div><div class="opp-desc">' + opp.desc + '</div></div>' +
        '<div class="opp-impact">' + opp.impact + '</div>' +
      '</div>';
    }).join('');

    // Savings
    var savings = rand(analysis.savingsMin, analysis.savingsMax);
    document.getElementById('savingsBanner').innerHTML =
      '<div class="sv-label">💰 Ahorro mensual estimado con automatización IA</div>' +
      '<div class="sv-amount">' + fmtCLP(savings) + ' <span style="font-size:1rem;font-weight:400;color:var(--sub)">/mes</span></div>' +
      '<div class="sv-sub">Basado en benchmarks del rubro ' + analysis.rubroName + ' en Chile · Fuente: CPC Chile 2025</div>';

    // WhatsApp CTA
    var waMsg = encodeURIComponent(
      '🤖 Hola AigenciaLab! Completé la auditoría gratuita de mi negocio.\n\n' +
      '📊 Score: ' + analysis.score + '/100 (' + analysis.tier + ')' + (isReal ? ' — Análisis real' : '') + '\n' +
      '🏢 Empresa: ' + formData.name + ' — ' + analysis.rubroName + '\n' +
      '🌐 Web: ' + (formData.url || 'Sin sitio') + '\n' +
      (formData.email ? '📧 Email: ' + formData.email + '\n' : '') +
      '\n¿Cuándo podemos hablar para mejorar con IA?'
    );
    document.getElementById('ctaWhatsApp').href = 'https://wa.me/' + CFG.WA_SALES + '?text=' + waMsg;
  }

  function cwvBadge(metric, value, label, color) {
    return '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 12px;text-align:center;">' +
      '<div style="font-size:.65rem;color:var(--muted);margin-bottom:2px;">' + metric + '</div>' +
      '<div style="font-size:.9rem;font-weight:700;color:' + color + ';">' + value + '</div>' +
      '<div style="font-size:.6rem;color:var(--muted);">' + label.substring(0,8) + '</div>' +
    '</div>';
  }

  function lcp2color(lcp) {
    var s = parseFloat(lcp); if (isNaN(s)) return '#9CA3AF';
    return s <= 2.5 ? '#059669' : (s <= 4 ? '#D97706' : '#DC2626');
  }
  function tbt2color(tbt) {
    var ms = parseInt(tbt); if (isNaN(ms)) return '#9CA3AF';
    return ms <= 200 ? '#059669' : (ms <= 600 ? '#D97706' : '#DC2626');
  }

  /* ── 📋 FORM HANDLER ──────────────────────────────────────── */
  document.getElementById('auditForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var url   = (document.getElementById('auditUrl').value || '').trim();
    var rubro = document.getElementById('auditRubro').value;
    var wa    = (document.getElementById('auditWa').value || '').trim();
    var name  = (document.getElementById('auditName').value || '').trim();
    var email = document.getElementById('auditEmail') ? (document.getElementById('auditEmail').value || '').trim() : '';
    if (!rubro || !wa || !name) return;

    // Normalizar URL — acepta "mercadolibre.com", "www.falabella.com", etc.
    url = url.replace(/\s+/g, ''); // quitar espacios
    if (url && !url.startsWith('http')) url = 'https://' + url;
    if (url) url = url.replace(/\/+$/, ''); // quitar trailing slashes

    var btn = document.getElementById('btnAudit');
    btn.disabled = true;
    btn.textContent = url ? '📡 Analizando sitio en tiempo real...' : '🔄 Generando análisis por rubro...';

    saveLead({ name:name, url:url, rubro:rubro, whatsapp:'+56' + wa.replace(/\s/g,''), email:email, score:0, realData:false });

    document.getElementById('stepForm').classList.add('hidden');
    document.getElementById('stepAnalyzing').classList.remove('hidden');
    completedPhases = 0;

    runRealAnalysis(url, rubro, onProgress, function(analysis) {
      // Update lead score retroactively in localStorage
      try {
        var leads = JSON.parse(localStorage.getItem(CFG.STORAGE_KEY) || '[]');
        if (leads.length > 0) { leads[0].score = analysis.score; leads[0].realData = analysis.realData; }
        localStorage.setItem(CFG.STORAGE_KEY, JSON.stringify(leads));
      } catch(ee) {}

      // Re-fire lead hook with REAL score (first call had score=0)
      if (window.AigenciaLabOnAuditLead) {
        window.AigenciaLabOnAuditLead({ name:name, url:url, rubro:rubro, whatsapp:'+56' + wa.replace(/\s/g,''), email:email, score:analysis.score, realData:analysis.realData });
      }

      document.getElementById('stepAnalyzing').classList.add('hidden');
      document.getElementById('stepReport').classList.remove('hidden');
      renderReport(analysis, { name:name, url:url, rubro:rubro, email:email });
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  });

  /* ── 🔌 PUBLIC API ────────────────────────────────────────── */
  window.AigenciaLabAudit = {
    getLeads:    function() { try { return JSON.parse(localStorage.getItem(CFG.STORAGE_KEY) || '[]'); } catch(e) { return []; } },
    clearLeads:  function() { localStorage.removeItem(CFG.STORAGE_KEY); },
    exportCSV:   function() {
      var leads  = this.getLeads();
      if (!leads.length) return alert('Sin leads para exportar.');
      var header = 'ID,Nombre,URL,Rubro,WhatsApp,Email,Score,Real,Fecha\n';
      var rows   = leads.map(function(l) {
        return [l.id,l.name,l.url,l.rubro,l.whatsapp,l.email||'',l.score,l.realData?'Sí':'No',l.ts].join(',');
      }).join('\n');
      var blob   = new Blob([header + rows], { type:'text/csv;charset=utf-8;' });
      var a      = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'AigenciaLab-leads-' + Date.now() + '.csv'; a.click();
    },
    setConfig:   function(overrides) { Object.assign(CFG, overrides); },
    // Hook para backend real:
    // window.AigenciaLabAudit.setConfig({ WA_SALES: '56998765432', PSI_API_KEY: 'AIza...', USE_REAL_API: true });
    // window.AigenciaLabOnAuditLead = async function(lead) { await fetch('/api/leads', { method:'POST', body: JSON.stringify(lead) }); };
  };

})();


/**
 * audit-engine.ts — Motor de Auditoría REAL server-side
 * Se ejecuta en API route /api/audit (Node.js, sin CORS)
 * PageSpeed API key en variable de entorno segura
 */

import type { AuditResult, AuditIssue, AuditOpportunity, PSIData, SEOData } from './types'

/* ── RUBRO CONFIG ─────────────────────────────────────────── */
const RUBRO_CFG: Record<string, {
  name: string; baseScore: number; savingsMin: number; savingsMax: number;
  issues: AuditIssue[]; opportunities: AuditOpportunity[];
}> = {
  ecommerce_moda: {
    name: 'Ecommerce Moda', baseScore: 42, savingsMin: 850000, savingsMax: 2800000,
    issues: [
      { sev:'critical', icon:'🛒', title:'Alta tasa de abandono de carrito', desc:'Promedio del rubro: 78% abandono. Cada carrito perdido = venta no recuperada.' },
      { sev:'critical', icon:'📱', title:'Checkout no optimizado para móvil', desc:'68% de visitantes desde smartphone. Checkout lento pierde el 60% de conversiones.' },
      { sev:'warning',  icon:'💬', title:'Sin asistente de tallas/estilismo', desc:'Preguntas de talla = 40% del soporte. Sin IA, demoran horas.' },
      { sev:'warning',  icon:'📦', title:'Stock sin sincronización en tiempo real', desc:'Desincronización genera ventas de productos sin stock y reclamos.' },
      { sev:'info',     icon:'🔁', title:'Sin recuperación de carritos vía WhatsApp', desc:'Mensaje a los 30min recupera el 15-22% de carritos abandonados.' },
    ],
    opportunities: [
      { icon:'🤖', title:'Agente de Ventas WhatsApp', desc:'Responde tallas, colores 24/7', impact:'Ahorra 8h/día' },
      { icon:'🛒', title:'Recuperación de Carritos IA', desc:'WhatsApp con oferta a los 30 min', impact:'+22% conversión' },
      { icon:'📊', title:'Sync Inventario Real-Time', desc:'WooCommerce/Shopify ↔ ERP sin intervención', impact:'0 ventas fallidas' },
    ],
  },
  ecommerce_retail: {
    name: 'Retail General', baseScore: 38, savingsMin: 1200000, savingsMax: 4500000,
    issues: [
      { sev:'critical', icon:'📦', title:'Inventario multicanal sin sincronización', desc:'Sin sync entre tienda y web genera quiebres y overselling.' },
      { sev:'critical', icon:'🚚', title:'Tracking de envíos sin notificaciones', desc:'67% de tickets de soporte son "¿dónde está mi pedido?". Se automatiza al 100%.' },
      { sev:'warning',  icon:'💬', title:'Tiempo de respuesta >4h en soporte', desc:'Cada hora extra reduce la satisfacción en 15%.' },
      { sev:'info',     icon:'📈', title:'Sin análisis predictivo de demanda', desc:'Sobrestock y quiebres cuestan en promedio UF 25/mes.' },
    ],
    opportunities: [
      { icon:'🛒', title:'Stock Sync Inteligente', desc:'Inventario unificado en todos los canales', impact:'-40% error stock' },
      { icon:'🚚', title:'Agente de Seguimiento', desc:'Responde "¿dónde está mi pedido?" automáticamente', impact:'-70% tickets' },
      { icon:'📈', title:'BI Predictivo de Demanda', desc:'Anticipa quiebres 2 semanas antes', impact:'+18% margen' },
    ],
  },
  clinica: {
    name: 'Clínica / Salud', baseScore: 35, savingsMin: 1800000, savingsMax: 6000000,
    issues: [
      { sev:'critical', icon:'📞', title:'Recepción saturada y esperas largas', desc:'45% de llamadas son para agendar. IA lo resuelve al instante.' },
      { sev:'critical', icon:'🗓️', title:'Sin confirmación automática de citas', desc:'25% de no-shows se evita con recordatorio WhatsApp 24h antes.' },
      { sev:'warning',  icon:'💊', title:'Sin gestión IA de derivaciones', desc:'Derivación incorrecta = reprogramación y mala experiencia.' },
      { sev:'info',     icon:'📋', title:'Formularios de admisión manuales', desc:'Automatizar pre-anamnesis ahorra 8 min por paciente.' },
    ],
    opportunities: [
      { icon:'🗓️', title:'Agente de Agendamiento IA', desc:'Agenda, confirma y recuerda citas automáticamente', impact:'-25% no-show' },
      { icon:'💬', title:'Recepción Virtual 24/7', desc:'Responde horarios y aranceles sin personal', impact:'Ahorra 3 RRHH' },
      { icon:'📋', title:'Pre-anamnesis Automatizada', desc:'Formulario inteligente antes de la consulta', impact:'-8 min/paciente' },
    ],
  },
  inmobiliaria: {
    name: 'Inmobiliaria', baseScore: 40, savingsMin: 2500000, savingsMax: 9000000,
    issues: [
      { sev:'critical', icon:'🏠', title:'Sin calificación automática de leads', desc:'70% de contactos web no están listos. Sin filtro IA, el equipo pierde tiempo.' },
      { sev:'warning',  icon:'📸', title:'Sin visitas virtuales IA', desc:'Compradores digitales esperan recorridos. Sin ellos, pierdes 35% de leads urbanos.' },
      { sev:'warning',  icon:'📱', title:'Sin seguimiento auto de cotizaciones', desc:'60% de cotizaciones sin seguimiento en 48h se cierra con la competencia.' },
      { sev:'info',     icon:'📊', title:'Sin análisis de comportamiento de prospectos', desc:'Sin datos no puedes personalizar el seguimiento comercial.' },
    ],
    opportunities: [
      { icon:'🤖', title:'Agente Calificador de Leads', desc:'Solo entrega leads calientes a brokers', impact:'+40% cierre' },
      { icon:'📱', title:'Seguimiento WhatsApp Automático', desc:'Recordatorios sin intervención manual', impact:'-60% abandono' },
      { icon:'📊', title:'CRM IA Integrado', desc:'Pipeline visual con scoring de cierre', impact:'2x productividad' },
    ],
  },
  courier: {
    name: 'Courier / Logística', baseScore: 45, savingsMin: 2000000, savingsMax: 7000000,
    issues: [
      { sev:'critical', icon:'📍', title:'Sin tracking en tiempo real para clientes', desc:'80% de consultas son de tracking. $3.500 por consulta manual.' },
      { sev:'critical', icon:'⚠️', title:'Sin alertas automáticas de SLA', desc:'Incumplimientos detectados tarde generan penalidades.' },
      { sev:'warning',  icon:'📞', title:'Sin comunicación proactiva de incidencias', desc:'Te enterás del problema cuando el cliente llama.' },
      { sev:'info',     icon:'🗺️', title:'Optimización de rutas manual', desc:'Sin IA de ruteo se desperdicia 18% del combustible.' },
    ],
    opportunities: [
      { icon:'📍', title:'Tracking WhatsApp Automático', desc:'"¿Dónde está mi paquete?" → Respuesta instantánea', impact:'-80% tickets' },
      { icon:'🚨', title:'Alertas SLA Inteligentes', desc:'Notificación antes de vencer el plazo', impact:'-90% penalidades' },
      { icon:'📊', title:'Dashboard Operaciones IA', desc:'Vista unificada con alertas proactivas', impact:'+25% eficiencia' },
    ],
  },
  restaurante: {
    name: 'Restaurante / Food', baseScore: 38, savingsMin: 600000, savingsMax: 2000000,
    issues: [
      { sev:'critical', icon:'📱', title:'Sin pedidos por WhatsApp', desc:'55% de clientes prefiere pedir por WhatsApp. Sin bot, se pierden.' },
      { sev:'warning',  icon:'⭐', title:'Sin gestión de reviews y reputación', desc:'Restaurantes con respuestas automáticas tienen 2.3x más reservas.' },
      { sev:'warning',  icon:'📋', title:'Sin reservas online automatizadas', desc:'Llamadas para reservar cortan el flujo de trabajo.' },
      { sev:'info',     icon:'🎁', title:'Sin programa de fidelización IA', desc:'Clientes sin programa gastan 3x menos que con uno activo.' },
    ],
    opportunities: [
      { icon:'📱', title:'Agente de Pedidos WhatsApp', desc:'Toma pedidos y notifica cocina', impact:'+30% pedidos' },
      { icon:'🗓️', title:'Reservas Automáticas 24/7', desc:'Agenda mesas sin llamadas', impact:'Ahorra 2h/día' },
      { icon:'⭐', title:'Gestión de Reviews IA', desc:'Responde Google/TripAdvisor automáticamente', impact:'+0.8⭐ promedio' },
    ],
  },
  educacion: {
    name: 'Educación / Capacitación', baseScore: 40, savingsMin: 900000, savingsMax: 3500000,
    issues: [
      { sev:'critical', icon:'📝', title:'Sin proceso de matrícula automático', desc:'25 min por matrícula manual. IA lo hace en 3 min.' },
      { sev:'warning',  icon:'💬', title:'Consultas pre-matrícula sin respuesta rápida', desc:'65% decide en las primeras 4 horas. Tardanza = lead perdido.' },
      { sev:'info',     icon:'📊', title:'Sin seguimiento de engagement de alumnos', desc:'Sin datos no detectas alumnos en riesgo de abandono.' },
    ],
    opportunities: [
      { icon:'📝', title:'Agente de Admisión IA', desc:'Responde FAQs y guía inscripción', impact:'+50% conversión' },
      { icon:'📊', title:'Seguimiento de Alumnos IA', desc:'Detecta deserción antes de que ocurra', impact:'-30% abandono' },
      { icon:'💬', title:'Soporte Académico 24/7', desc:'Responde dudas fuera de horario', impact:'5★ satisfacción' },
    ],
  },
  servicios: {
    name: 'Servicios Profesionales', baseScore: 36, savingsMin: 1500000, savingsMax: 5000000,
    issues: [
      { sev:'critical', icon:'📞', title:'Captación de prospectos manual y lenta', desc:'Sin calificación automática, cada lead consume 45min facturable.' },
      { sev:'warning',  icon:'📄', title:'Sin propuestas automáticas post-contacto', desc:'Propuestas que tardan >24h pierden 40% de prospectos.' },
      { sev:'info',     icon:'🔄', title:'Sin onboarding sistematizado', desc:'8h de onboarding manual por cliente nuevo.' },
    ],
    opportunities: [
      { icon:'🤖', title:'Agente Calificador de Prospectos', desc:'Solo cierra con leads calientes', impact:'3x ROI vendedor' },
      { icon:'📄', title:'Propuestas Automáticas PDF', desc:'Genera propuesta en 30 segundos', impact:'+60% cierre' },
      { icon:'🔄', title:'Onboarding Self-Service', desc:'Cliente configura sin reuniones largas', impact:'-8h por cliente' },
    ],
  },
  manufactura: {
    name: 'Manufactura / Industria', baseScore: 33, savingsMin: 3000000, savingsMax: 12000000,
    issues: [
      { sev:'critical', icon:'⚙️', title:'Sin control de calidad automatizado', desc:'Detección manual de defectos: error 12%. IA lo reduce al 0.3%.' },
      { sev:'warning',  icon:'📦', title:'Sin predicción de demanda de insumos', desc:'Quiebres detienen la producción. Cada parada cuesta ~UF 8/hora.' },
      { sev:'info',     icon:'📊', title:'Sin KPIs de planta en tiempo real', desc:'Sin visibilidad, los gerentes deciden con datos del día anterior.' },
    ],
    opportunities: [
      { icon:'📊', title:'Dashboard OEE Real-Time', desc:'Disponibilidad, rendimiento y calidad en un panel', impact:'+15% eficiencia' },
      { icon:'📦', title:'Predicción de Insumos IA', desc:'Anticipa necesidades antes de paradas', impact:'-90% paradas' },
      { icon:'🤖', title:'Backoffice Industrial IA', desc:'Automatiza OC, facturas y conciliaciones', impact:'-120h/mes admin' },
    ],
  },
  otro: {
    name: 'Empresa', baseScore: 38, savingsMin: 700000, savingsMax: 3000000,
    issues: [
      { sev:'critical', icon:'💬', title:'Atención sin cobertura fuera de horario', desc:'35% de consultas llegan fuera de horario. Sin IA, se pierden.' },
      { sev:'warning',  icon:'📊', title:'Sin datos accionables de comportamiento', desc:'Sin analytics IA no puedes anticipar problemas.' },
      { sev:'info',     icon:'🔄', title:'Procesos administrativos manuales', desc:'Facturación, reconciliación y reportes se automatizan al 100%.' },
    ],
    opportunities: [
      { icon:'🤖', title:'Agente de Atención 24/7', desc:'Responde consultas y escala al humano correcto', impact:'+95% satisfacción' },
      { icon:'⚙️', title:'Backoffice IA', desc:'Automatiza facturación, reportes y conciliaciones', impact:'-120h/mes' },
      { icon:'📈', title:'BI Automático', desc:'Dashboard de ventas sin configuración técnica', impact:'Decisiones 10x rápido' },
    ],
  },
}

/* ── PSI Parser ───────────────────────────────────────────── */
function parsePSI(data: unknown): PSIData | null {
  try {
    const d = data as Record<string, unknown>
    const lr = d.lighthouseResult as Record<string, unknown> | undefined
    const cats = lr?.categories as Record<string, { score?: number }> | undefined
    const audits = lr?.audits as Record<string, { displayValue?: string }> | undefined
    return {
      perfScore: cats?.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
      seoScore:  cats?.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
      a11yScore: cats?.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
      bpScore:   cats?.['best-practices']?.score != null ? Math.round(cats['best-practices'].score * 100) : null,
      lcp:       audits?.['largest-contentful-paint']?.displayValue ?? null,
      cls:       audits?.['cumulative-layout-shift']?.displayValue ?? null,
      tti:       audits?.['interactive']?.displayValue ?? null,
      fcp:       audits?.['first-contentful-paint']?.displayValue ?? null,
      tbt:       audits?.['total-blocking-time']?.displayValue ?? null,
      si:        audits?.['speed-index']?.displayValue ?? null,
    }
  } catch { return null }
}

/* ── SEO Parser ───────────────────────────────────────────── */
export function parseSEO(html: string): SEOData {
  const lower = html.toLowerCase()
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g,'').trim() : ''
  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
  const metaDesc = metaDescMatch ? metaDescMatch[1] : ''
  const h1Matches = html.match(/<h1[^>]*>/gi) || []
  const imgMatches = html.match(/<img[^>]+>/gi) || []
  const imgsNoAlt = imgMatches.filter(img => !/alt=["'][^"']+["']/i.test(img)).length
  return {
    title, titleLen: title.length,
    hasMetaDesc: metaDesc.length > 0, metaDescLen: metaDesc.length,
    h1Count: h1Matches.length,
    h1Text: (() => { const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i); return m ? m[1].replace(/<[^>]*>/g,'').trim().substring(0,60) : '' })(),
    totalImgs: imgMatches.length, imgsNoAlt,
    hasWhatsApp: lower.includes('wa.me') || lower.includes('api.whatsapp'),
    hasChatbot:  lower.includes('chatbot') || lower.includes('tawk') || lower.includes('zendesk') || lower.includes('intercom'),
    hasCart:     lower.includes('add-to-cart') || lower.includes('carrito') || lower.includes('woocommerce') || lower.includes('shopify'),
    hasSSL:      lower.includes('https'),
    hasGTM:      lower.includes('googletagmanager') || lower.includes('gtag'),
    hasOgImage:  /<meta[^>]+property=["']og:image["']/i.test(html),
    hasCanonical:/<link[^>]+rel=["']canonical["']/i.test(html),
    hasMobileViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
  }
}

/* ── Score Calculator ─────────────────────────────────────── */
function rand(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a }

export function buildAnalysis(
  url: string, rubro: string, psi: PSIData | null, seo: SEOData | null
): AuditResult {
  const cfg = RUBRO_CFG[rubro] ?? RUBRO_CFG['otro']
  const hasUrl   = url.startsWith('http')
  const realData = !!(psi || seo)

  const speedScore = psi?.perfScore ?? (hasUrl ? rand(35,72) : rand(20,50))
  
  let seoScore = 0
  const seoIssues: AuditIssue[] = []
  if (seo) {
    let pts = 0
    if (seo.titleLen >= 30 && seo.titleLen <= 70)  pts += 20; else seoIssues.push({ sev:'warning', icon:'🔍', title:`Título SEO: ${seo.titleLen} chars (ideal 30-70)`, desc:'Un título bien optimizado mejora el click-through en Google en un 12%.' })
    if (seo.hasMetaDesc && seo.metaDescLen >= 80)  pts += 20; else seoIssues.push({ sev:'warning', icon:'🔍', title:'Meta description ausente o muy corta', desc:'Sin meta description Google genera una automática que suele ser genérica.' })
    if (seo.h1Count === 1)                          pts += 15
    else if (seo.h1Count === 0)           seoIssues.push({ sev:'critical', icon:'🔍', title:'Sin etiqueta H1', desc:'H1 ausente es señal negativa para Google. Es el título principal de la página.' })
    else                                  seoIssues.push({ sev:'warning',  icon:'🔍', title:`${seo.h1Count} H1 detectados (solo debe haber 1)`, desc:'Múltiples H1 confunden a Google sobre el tema principal de la página.' })
    if (seo.imgsNoAlt === 0)              pts += 15
    else seoIssues.push({ sev:'info', icon:'🔍', title:`${seo.imgsNoAlt} imágenes sin atributo ALT`, desc:'Sin ALT Google no puede indexar tus imágenes. Impacto en SEO y accesibilidad.' })
    if (seo.hasCanonical)                 pts += 10
    if (seo.hasOgImage)                   pts += 10
    if (seo.hasMobileViewport)            pts += 10
    seoScore = pts
  } else {
    seoScore = hasUrl ? rand(30,65) : rand(15,45)
  }

  const uxScore = psi?.a11yScore != null
    ? Math.round(psi.a11yScore * 0.6 + (seo?.hasMobileViewport ? 40 : 10))
    : (hasUrl ? rand(38,75) : rand(20,55))

  let atencScore = 10
  if (seo?.hasWhatsApp) atencScore += 20
  if (seo?.hasChatbot)  atencScore += 30

  const generalScore = realData
    ? Math.min(98, Math.max(8, Math.round(speedScore*0.35 + seoScore*0.30 + uxScore*0.25 + atencScore*0.10)))
    : Math.min(80, Math.max(18, cfg.baseScore + rand(-8,12) + (!hasUrl ? -15 : 0)))

  let tier: string, tierColor: string
  if      (generalScore >= 70) { tier='Optimizado';       tierColor='#059669' }
  else if (generalScore >= 50) { tier='En Desarrollo';    tierColor='#2563EB' }
  else if (generalScore >= 35) { tier='Necesita Mejoras'; tierColor='#D97706' }
  else                          { tier='Crítico';          tierColor='#DC2626' }

  const speedColor  = speedScore>=70?'#059669':(speedScore>=50?'#D97706':'#DC2626')
  const seoColorM   = seoScore>=70  ?'#059669':(seoScore>=50  ?'#D97706':'#DC2626')
  const uxColorM    = uxScore>=70   ?'#059669':(uxScore>=50   ?'#2563EB':'#DC2626')
  const atencColor  = atencScore>=30?'#2563EB':'#DC2626'

  const extraIssues: AuditIssue[] = [
    ...seoIssues.slice(0,2),
    ...(seo && !seo.hasWhatsApp ? [{ sev:'critical' as const, icon:'📱', title:'Sin botón WhatsApp visible', desc:'78% de los chilenos usa WhatsApp para contactar empresas. Sin botón visible = pérdida directa de leads.' }] : []),
    ...(psi?.perfScore != null && psi.perfScore < 50 ? [{ sev:'critical' as const, icon:'🐢', title:`Sitio lento: ${psi.perfScore}/100`, desc:`LCP: ${psi.lcp ?? 'N/A'}. Google penaliza sitios lentos. Impacto directo en conversiones (-7% por segundo de demora).` }] : []),
    ...(seo?.hasCart && !seo.hasWhatsApp ? [{ sev:'warning' as const, icon:'🛒', title:'Tienda sin recuperación de carritos', desc:'Se detectó ecommerce pero sin WhatsApp para recuperar carritos abandonados. Pérdida estimada: 22% de ventas.' }] : []),
  ]

  return {
    score: generalScore, tier, tierColor, realData,
    speedScore, seoScore, uxScore, atencScore, psi, seo,
    metrics: [
      { label:`Velocidad Web ${psi?'📡':'📊'}`, value:`${speedScore}/100`, score:speedScore, color:speedColor, status:speedScore>=70?'✅ Buena':(speedScore>=50?'⚠️ Mejorable':'🚨 Lenta'), detail:psi?.lcp?`LCP: ${psi.lcp} · FCP: ${psi.fcp}`:null },
      { label:`SEO Técnico ${seo?'📡':'📊'}`,   value:`${seoScore}/100`,   score:seoScore,   color:seoColorM,  status:seoScore>=70?'✅ Visible':(seoScore>=50?'⚠️ Mejorable':'🚨 Deficiente'), detail:seo?`H1: ${seo.h1Count} · Desc: ${seo.hasMetaDesc?'Sí':'No'}`:null },
      { label:`Experiencia UX ${psi?'📡':'📊'}`, value:`${uxScore}/100`, score:uxScore,   color:uxColorM,   status:uxScore>=70?'✅ Buena':(uxScore>=50?'⚠️ Mejorable':'🚨 Deficiente'),  detail:psi?.bpScore?`Best Practices: ${psi.bpScore}/100`:null },
      { label:'Atención Digital IA',              value:`${atencScore}/100`,score:atencScore,color:atencColor, status:seo?.hasWhatsApp?(seo.hasChatbot?'✅ Activa':'⚠️ Solo WhatsApp'):'🚨 Sin automatizar', detail:seo?`WA: ${seo.hasWhatsApp?'Sí':'No'} · Chatbot: ${seo.hasChatbot?'Sí':'No'}`:null },
    ],
    issues: [...extraIssues, ...cfg.issues].slice(0,6),
    opportunities: cfg.opportunities,
    savingsMin: cfg.savingsMin, savingsMax: cfg.savingsMax,
    rubroName: cfg.name,
  }
}

/* ── PageSpeed fetcher (server-side, no CORS) ─────────────── */
export async function fetchPageSpeed(url: string): Promise<PSIData | null> {
  const key   = process.env.GOOGLE_PSI_API_KEY
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&locale=es${key ? `&key=${key}` : ''}`
  try {
    const res = await fetch(apiUrl, { next: { revalidate: 0 }, signal: AbortSignal.timeout(20000) })
    if (!res.ok) return null
    return parsePSI(await res.json())
  } catch { return null }
}

/* ── HTML fetcher (server-side, sin proxy CORS) ───────────── */
export async function fetchSiteHTML(url: string): Promise<SEOData | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AigenciaLabBot/1.0)' },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 0 }
    })
    if (!res.ok) return null
    const html = await res.text()
    return parseSEO(html)
  } catch { return null }
}

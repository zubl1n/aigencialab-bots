import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'

const BLOG_SLUGS = [
  'triplicar-ventas-con-ia',
  'chatbot-vs-agente-ia',
  'caso-maxfps-1200-consultas',
  'implementar-ia-sin-codigo',
  'metricas-agente-ia',
  'costo-no-tener-ia-2026',
  'automatizacion-ia-ecommerce-chile',
  'ley-21663-ia-empresas-chile',
  'whatsapp-ia-triplicar-leads',
]

const STATIC_ROUTES = [
  // ── Core conversion pages ─────────────────────────────────
  { url: '/',                            priority: 1.0,  changeFreq: 'weekly'  as const },
  { url: '/precios',                     priority: 0.95, changeFreq: 'weekly'  as const },
  { url: '/audit',                       priority: 0.92, changeFreq: 'monthly' as const },
  { url: '/register',                    priority: 0.90, changeFreq: 'monthly' as const },
  // ── Trust & social proof ──────────────────────────────────
  { url: '/casos-exito',                 priority: 0.88, changeFreq: 'monthly' as const },
  { url: '/nosotros',                    priority: 0.65, changeFreq: 'monthly' as const },
  // ── Blog ─────────────────────────────────────────────────
  { url: '/blog',                        priority: 0.82, changeFreq: 'weekly'  as const },
  // ── Contact & support ────────────────────────────────────
  { url: '/contacto',                    priority: 0.72, changeFreq: 'monthly' as const },
  // ── Widget install guide (SEO: "instalar chatbot web") ───
  { url: '/instalar-widget',             priority: 0.80, changeFreq: 'monthly' as const },
  // ── Auth (low priority — not for search engines) ─────────
  { url: '/login',                       priority: 0.40, changeFreq: 'yearly'  as const },
  // ── Productos ────────────────────────────────────────────
  { url: '/productos/agente-ventas',     priority: 0.78, changeFreq: 'monthly' as const },
  { url: '/productos/atencion-cliente',  priority: 0.78, changeFreq: 'monthly' as const },
  { url: '/productos/captura-leads',     priority: 0.78, changeFreq: 'monthly' as const },
  { url: '/productos/ia-conversacional', priority: 0.78, changeFreq: 'monthly' as const },
  { url: '/productos/integraciones',     priority: 0.72, changeFreq: 'monthly' as const },
  { url: '/productos/widget-web',        priority: 0.76, changeFreq: 'monthly' as const },
  // ── Soluciones ───────────────────────────────────────────
  { url: '/soluciones/ecommerce',        priority: 0.82, changeFreq: 'monthly' as const },
  { url: '/soluciones/salud',            priority: 0.78, changeFreq: 'monthly' as const },
  { url: '/soluciones/inmobiliarias',    priority: 0.78, changeFreq: 'monthly' as const },
  { url: '/soluciones/educacion',        priority: 0.72, changeFreq: 'monthly' as const },
  { url: '/soluciones/agencias',         priority: 0.72, changeFreq: 'monthly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const statics = STATIC_ROUTES.map(({ url, priority, changeFreq }) => ({
    url:             `${BASE}${url}`,
    lastModified:    now,
    changeFrequency: changeFreq,
    priority,
  }))

  const blogPosts = BLOG_SLUGS.map(slug => ({
    url:             `${BASE}/blog/${slug}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.70,
  }))

  return [...statics, ...blogPosts]
}

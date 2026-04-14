/**
 * plans.ts — Single Source of Truth for AIgenciaLab pricing.
 * ALL components must import prices from here. No hardcoded prices anywhere.
 * Prices in CLP (Chilean Pesos). USD rates approximate.
 */

export type PlanId = 'starter' | 'pro' | 'business' | 'enterprise'

// Legacy alias for backwards compatibility
export type PlanName = 'Starter' | 'Pro' | 'Business' | 'Enterprise'

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  monthlyPriceCLP: number
  annualPriceCLP: number  // per month when billed annually (−20%)
  monthlyPriceUSD: number
  annualPriceUSD: number
  highlight: boolean
  badge?: string
  cta: string
  features: string[]
  limits: {
    agents: number | 'unlimited'
    chatbots: number | 'unlimited'
    conversations: number | 'unlimited'
    leads: number | 'unlimited'
  }
  /** MercadoPago subscription plan ID (optional) */
  mpPlanId?: string | null
  /** Trial days for new accounts */
  trialDays: number
}

export const PLANS_LIST: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Responde a tus clientes las 24hs',
    monthlyPriceCLP: 39900,
    annualPriceCLP: 31920,
    monthlyPriceUSD: 45,
    annualPriceUSD: 36,
    highlight: false,
    cta: 'Comenzar prueba gratis',
    trialDays: 14,
    features: [
      'Widget de chat en tu web',
      '1 Agente IA conversacional',
      '3 Chatbots programables',
      '500 conversaciones/mes',
      'Captura de leads automática',
      'Panel de leads básico',
      'Soporte por email',
    ],
    limits: { agents: 1, chatbots: 3, conversations: 500, leads: 500 },
    mpPlanId: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'La mejor atención IA personalizada',
    monthlyPriceCLP: 89900,
    annualPriceCLP: 71920,
    monthlyPriceUSD: 99,
    annualPriceUSD: 79,
    highlight: true,
    badge: 'Más elegido',
    cta: 'Comenzar prueba gratis',
    trialDays: 14,
    features: [
      'Todo lo de Starter',
      '3 Agentes IA especializados',
      '10 Chatbots IA',
      '2.000 conversaciones IA/mes',
      'CRM de leads integrado',
      'Historial de conversaciones',
      'IA Copilot para tus agentes',
      'Integración WhatsApp Business',
      'Soporte prioritario',
    ],
    limits: { agents: 3, chatbots: 10, conversations: 2000, leads: 2000 },
    mpPlanId: process.env.NEXT_PUBLIC_MP_PLAN_PRO_ID ?? null,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Crecimiento inteligente para tu empresa',
    monthlyPriceCLP: 189900,
    annualPriceCLP: 151920,
    monthlyPriceUSD: 199,
    annualPriceUSD: 159,
    highlight: false,
    cta: 'Comenzar prueba gratis',
    trialDays: 14,
    features: [
      'Todo lo de Pro',
      '5 Agentes IA especializados',
      '20 Chatbots IA',
      '4.000 conversaciones IA/mes',
      'Mensajes salientes (HSM)',
      'Integración WhatsApp API oficial',
      'Multi-idioma (ES/EN/PT)',
      'Reportes y analytics avanzados',
      'Soporte dedicado + onboarding',
    ],
    limits: { agents: 5, chatbots: 20, conversations: 4000, leads: 'unlimited' },
    mpPlanId: process.env.NEXT_PUBLIC_MP_PLAN_ENTERPRISE_ID ?? null,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Infraestructura de IA para grandes equipos',
    monthlyPriceCLP: 0,
    annualPriceCLP: 0,
    monthlyPriceUSD: 0,
    annualPriceUSD: 0,
    highlight: false,
    cta: 'Hablar con un ejecutivo',
    trialDays: 0,
    features: [
      'Todo lo de Business',
      'Agentes y bots ilimitados',
      'Conversaciones ilimitadas',
      'CRM personalizado con tu marca',
      'Integraciones y desarrollos a medida',
      'SLA garantizado (99.9% uptime)',
      'Soporte 24/7 con ejecutivo dedicado',
      'Capacitación y onboarding premium',
    ],
    limits: { agents: 'unlimited', chatbots: 'unlimited', conversations: 'unlimited', leads: 'unlimited' },
    mpPlanId: null,
  },
]

/** Legacy Record<PlanName, Plan> map for backwards compatibility */
export const PLANS: Record<string, Plan & { price: number; priceDisplay: string; description: string; conversationsLimit: number; leadsLimit: number; botsLimit: number }> = {
  Starter: { ...PLANS_LIST[0], price: PLANS_LIST[0].monthlyPriceCLP, priceDisplay: formatPriceCLP(PLANS_LIST[0].monthlyPriceCLP), description: PLANS_LIST[0].tagline, conversationsLimit: 500, leadsLimit: 500, botsLimit: 1 },
  Pro:     { ...PLANS_LIST[1], price: PLANS_LIST[1].monthlyPriceCLP, priceDisplay: formatPriceCLP(PLANS_LIST[1].monthlyPriceCLP), description: PLANS_LIST[1].tagline, conversationsLimit: 2000, leadsLimit: 2000, botsLimit: 3 },
  Business: { ...PLANS_LIST[2], price: PLANS_LIST[2].monthlyPriceCLP, priceDisplay: formatPriceCLP(PLANS_LIST[2].monthlyPriceCLP), description: PLANS_LIST[2].tagline, conversationsLimit: 4000, leadsLimit: 99999, botsLimit: 5 },
  Enterprise: { ...PLANS_LIST[3], price: 0, priceDisplay: 'Contactar', description: PLANS_LIST[3].tagline, conversationsLimit: 999999, leadsLimit: 999999, botsLimit: 999 },
}

/** Legacy MRR map */
export const PLAN_MRR: Record<string, number> = {
  Starter: PLANS_LIST[0].monthlyPriceCLP,
  Pro: PLANS_LIST[1].monthlyPriceCLP,
  Business: PLANS_LIST[2].monthlyPriceCLP,
  Enterprise: 0,
}

/** Get Plan by name (falls back to Starter) */
export function getPlan(name: string | null | undefined): Plan {
  const found = PLANS_LIST.find(p => p.name.toLowerCase() === (name ?? '').toLowerCase())
  return found ?? PLANS_LIST[0]
}

/** Format CLP price */
export function formatPriceCLP(price: number): string {
  if (price === 0) return 'Gratis'
  return '$' + price.toLocaleString('es-CL') + '/mes'
}

/** Legacy alias */
export const formatPrice = formatPriceCLP

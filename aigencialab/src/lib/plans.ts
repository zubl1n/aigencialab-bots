/**
 * plans.ts — Single Source of Truth for AIgenciaLab pricing.
 * Prices: USD primary, CLP secondary (× 940 approx.)
 * Cliengo-inspired structure.
 */

export type PlanId = 'starter' | 'pro' | 'business' | 'enterprise'
export type Currency = 'USD' | 'CLP'
export type Billing = 'monthly' | 'annual'

export interface Feature {
  text: string
  included: boolean
}

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  monthlyUSD: number
  annualUSD: number      // per month, billed annually
  monthlyCLP: number     // rounded to thousands
  annualCLP: number
  highlight: boolean
  badge?: string
  ctaLabel: string
  ctaHref: string
  isContact: boolean
  trialDays: number
  features: Feature[]
  limits: {
    chatbots: number | string
    conversations: number | string
    agents: number | string
    leads: number | string
  }
}

export const PLANS_LIST: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Responde a tus clientes las 24hs',
    monthlyUSD: 45,
    annualUSD: 36,
    monthlyCLP: 42000,
    annualCLP: 34000,
    highlight: false,
    isContact: false,
    trialDays: 14,
    ctaLabel: 'Comenzar prueba gratis',
    ctaHref: '/register',
    features: [
      { text: 'Widget de chat en tu sitio web', included: true },
      { text: '1 Agente IA conversacional', included: true },
      { text: '3 Chatbots programables', included: true },
      { text: '500 conversaciones/mes', included: true },
      { text: 'Captura de leads automática', included: true },
      { text: 'Panel de leads básico', included: true },
      { text: 'Soporte por email', included: true },
      { text: 'Integración WhatsApp API', included: false },
      { text: 'Mensajes salientes (HSM)', included: false },
      { text: 'Multi-idioma', included: false },
    ],
    limits: { chatbots: 3, conversations: 500, agents: 1, leads: 500 },
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'La mejor atención IA personalizada',
    monthlyUSD: 119,
    annualUSD: 95,
    monthlyCLP: 112000,
    annualCLP: 89000,
    highlight: true,
    badge: 'Más elegido',
    isContact: false,
    trialDays: 14,
    ctaLabel: 'Comenzar prueba gratis',
    ctaHref: '/register',
    features: [
      { text: 'Todo lo de Starter', included: true },
      { text: '3 Agentes IA especializados', included: true },
      { text: '10 Chatbots IA', included: true },
      { text: '2.000 conversaciones IA/mes', included: true },
      { text: 'CRM de leads integrado', included: true },
      { text: 'Historial de conversaciones', included: true },
      { text: 'IA Copilot para tus agentes', included: true },
      { text: 'Integración WhatsApp Business', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'Mensajes salientes (HSM)', included: false },
    ],
    limits: { chatbots: 10, conversations: 2000, agents: 3, leads: 2000 },
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Crecimiento inteligente para tu empresa',
    monthlyUSD: 259,
    annualUSD: 207,
    monthlyCLP: 244000,
    annualCLP: 195000,
    highlight: false,
    isContact: false,
    trialDays: 14,
    ctaLabel: 'Comenzar prueba gratis',
    ctaHref: '/register',
    features: [
      { text: 'Todo lo de Pro', included: true },
      { text: '5 Agentes IA especializados', included: true },
      { text: '20 Chatbots IA', included: true },
      { text: '4.000 conversaciones IA/mes', included: true },
      { text: 'Mensajes salientes (HSM)', included: true },
      { text: 'Integración WhatsApp API oficial', included: true },
      { text: 'Multi-idioma (ES/EN/PT)', included: true },
      { text: 'Analytics avanzados', included: true },
      { text: 'Soporte dedicado + onboarding', included: true },
    ],
    limits: { chatbots: 20, conversations: 4000, agents: 5, leads: 'Ilimitados' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Infraestructura IA para grandes equipos',
    monthlyUSD: 0,
    annualUSD: 0,
    monthlyCLP: 0,
    annualCLP: 0,
    highlight: false,
    isContact: true,
    trialDays: 0,
    ctaLabel: 'Hablar con un ejecutivo',
    ctaHref: '/contacto',
    features: [
      { text: 'Todo lo de Business', included: true },
      { text: 'Agentes y chatbots ilimitados', included: true },
      { text: 'Conversaciones ilimitadas', included: true },
      { text: 'CRM personalizado con tu marca', included: true },
      { text: 'Integraciones y desarrollos a medida', included: true },
      { text: 'SLA garantizado (99.9% uptime)', included: true },
      { text: 'Soporte 24/7 con ejecutivo dedicado', included: true },
      { text: 'Onboarding y capacitación premium', included: true },
    ],
    limits: { chatbots: 'Ilimitados', conversations: 'Ilimitadas', agents: 'Ilimitados', leads: 'Ilimitados' },
  },
]

/** Legacy map for backwards compat */
export const PLANS: Record<string, Plan & { price: number; priceDisplay: string; description: string; conversationsLimit: number; leadsLimit: number; botsLimit: number }> = {
  Starter:    { ...PLANS_LIST[0], price: PLANS_LIST[0].monthlyUSD, priceDisplay: `$${PLANS_LIST[0].monthlyUSD} USD/mes`, description: PLANS_LIST[0].tagline, conversationsLimit: 500,    leadsLimit: 500,    botsLimit: 1 },
  Pro:        { ...PLANS_LIST[1], price: PLANS_LIST[1].monthlyUSD, priceDisplay: `$${PLANS_LIST[1].monthlyUSD} USD/mes`, description: PLANS_LIST[1].tagline, conversationsLimit: 2000,   leadsLimit: 2000,   botsLimit: 3 },
  Business:   { ...PLANS_LIST[2], price: PLANS_LIST[2].monthlyUSD, priceDisplay: `$${PLANS_LIST[2].monthlyUSD} USD/mes`, description: PLANS_LIST[2].tagline, conversationsLimit: 4000,   leadsLimit: 99999,  botsLimit: 5 },
  Enterprise: { ...PLANS_LIST[3], price: 0,                        priceDisplay: 'A consultar',                          description: PLANS_LIST[3].tagline, conversationsLimit: 999999, leadsLimit: 999999, botsLimit: 999 },
}

/** Legacy MRR helper (in USD) */
export const PLAN_MRR: Record<string, number> = {
  Starter: PLANS_LIST[0].monthlyUSD,
  Pro:     PLANS_LIST[1].monthlyUSD,
  Business: PLANS_LIST[2].monthlyUSD,
  Enterprise: 0,
}

/** Format price for display — accepts Plan+currency+billing OR legacy number */
export function formatPrice(plan: Plan, currency: Currency, billing: Billing): string
export function formatPrice(amountUSD: number): string
export function formatPrice(planOrAmount: Plan | number, currency?: Currency, billing?: Billing): string {
  if (typeof planOrAmount === 'number') {
    // Legacy: display USD amount
    if (planOrAmount === 0) return 'Gratis'
    return `$${planOrAmount.toLocaleString('en-US')} USD`
  }
  const plan = planOrAmount
  if (plan.isContact) return 'A consultar'
  const usd = billing === 'annual' ? plan.annualUSD : plan.monthlyUSD
  const clp = billing === 'annual' ? plan.annualCLP : plan.monthlyCLP
  if (currency === 'CLP') return `$${clp.toLocaleString('es-CL')}`
  return `$${usd}`
}

export function getPlan(name: string | null | undefined): Plan {
  const found = PLANS_LIST.find(p => p.name.toLowerCase() === (name ?? '').toLowerCase())
  return found ?? PLANS_LIST[0]
}

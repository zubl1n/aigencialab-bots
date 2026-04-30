/**
 * src/config/plans.ts
 * FUENTE DE VERDAD — Precios y configuración de los 4 planes.
 * REGLA: Importar PLANS en toda la app. NUNCA hardcodear precios fuera de aquí.
 * Sistema de precios: CLP primario | USD referencial via fx-rates.
 */

export const PLANS = {
  basic: {
    name: 'Basic',
    slug: 'basic',
    tagline: 'Para empezar con IA conversacional',
    mpPlanId: process.env.MP_PLAN_ID_BASIC,
    implPriceCLP: 29990,
    monthlyPriceCLP: 45000,
    annualPriceCLP: 36000,
    conversations: 500,
    agents: 1,
    users: 2,
    channels: ['WEB'] as const,
    overageClp: 60,
    guarantee: '15 días devolución',
    ctaLabel: 'Contratar ahora',
    ctaPath: '/checkout/basic',
    isFeatured: false,
    isEnterprise: false,
    badgeLabel: null as string | null,
    color: '#1e3a5f',
    features: [
      '1 Agente IA entrenado',
      'Webchat en tu sitio web',
      'Dashboard básico de métricas',
      'Soporte por WhatsApp',
      'Modelo: Claude Haiku / Gemini Flash',
      'App móvil iOS/Android',
    ],
    notIncluded: [
      'WhatsApp Business',
      'Instagram',
      'AIgenciaLab Connect',
      'Múltiples embudos',
    ],
  },
  starter: {
    name: 'Starter',
    slug: 'starter',
    tagline: 'Para equipos que venden por redes sociales',
    mpPlanId: process.env.MP_PLAN_ID_STARTER,
    implPriceCLP: 59990,
    monthlyPriceCLP: 120000,
    annualPriceCLP: 96000,
    conversations: 2000,
    agents: 3,
    users: 5,
    channels: ['WEB', 'WHATSAPP', 'INSTAGRAM_BETA'] as const,
    overageClp: 50,
    isFeatured: true,
    isEnterprise: false,
    guarantee: '30 días devolución',
    ctaLabel: 'Contratar ahora',
    ctaPath: '/checkout/starter',
    badgeLabel: 'Más popular' as string | null,
    color: '#1d4ed8',
    features: [
      '3 Agentes IA entrenados',
      'WhatsApp Business',
      'Instagram (beta)',
      'Webchat',
      'AIgenciaLab Connect (integraciones básicas)',
      'Dashboard de conversiones',
      'Calificación automática de leads',
      'Modelos: GPT-4o Mini / Claude Sonnet / Gemini Flash',
      'App móvil iOS/Android',
      'Soporte prioritario por WhatsApp',
    ],
    notIncluded: [
      'Facebook Messenger',
      'Integraciones personalizadas',
      'Consultoría mensual',
    ],
  },
  pro: {
    name: 'Pro',
    slug: 'pro',
    tagline: 'Para operaciones multicanal de alto volumen',
    mpPlanId: process.env.MP_PLAN_ID_PRO,
    implPriceCLP: 149990,
    monthlyPriceCLP: 200000,
    annualPriceCLP: 160000,
    conversations: null as number | null,
    agents: null as number | null,
    users: null as number | null,
    channels: ['WEB', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER'] as const,
    overageClp: null as number | null,
    isEnterprise: false,
    isFeatured: false,
    guarantee: 'Garantía de ROI en contrato',
    ctaLabel: 'Contratar ahora',
    ctaPath: '/checkout/pro',
    badgeLabel: 'Full Suite' as string | null,
    color: '#0f172a',
    features: [
      'Agentes IA ilimitados',
      'WhatsApp Business',
      'Instagram',
      'Facebook Messenger',
      'Webchat',
      'AIgenciaLab Connect completo (150+ integraciones)',
      'Todos los modelos IA: GPT-4o, Claude Sonnet 4, Gemini 2.5',
      'Dashboard con atribución de ingresos',
      'Múltiples embudos de conversión',
      'Consultoría mensual incluida',
      'Soporte Gold',
      'App móvil iOS/Android',
      'Horas de desarrollo incluidas',
    ],
    notIncluded: [] as string[],
  },
  enterprise: {
    name: 'Enterprise',
    slug: 'enterprise',
    tagline: 'Infraestructura IA para grandes equipos',
    mpPlanId: null as string | null,
    implPriceCLP: null as number | null,
    monthlyPriceCLP: null as number | null,
    annualPriceCLP: null as number | null,
    conversations: null as number | null,
    agents: null as number | null,
    users: null as number | null,
    channels: ['WEB', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER', 'CUSTOM'] as const,
    overageClp: null as number | null,
    isEnterprise: true,
    isFeatured: false,
    guarantee: 'SLA contractual + garantía de ROI',
    ctaLabel: 'Agendar reunión',
    ctaPath: '/agendar',
    badgeLabel: 'Enterprise' as string | null,
    color: '#18181b',
    features: [
      'Todo lo del plan Pro',
      'Infraestructura dedicada (no compartida)',
      'Onboarding y capacitación del equipo interno',
      'Integraciones a medida con sistemas propios (ERP, CRM custom, etc.)',
      'SLA 99.95% de disponibilidad',
      'Equipo de ingeniería dedicado',
      'Gestor de cuenta exclusivo',
      'Reportes de atribución personalizados',
      'Múltiples marcas / multi-tenant',
      'Auditorías de seguridad',
      'Contrato anual con factura',
    ],
    notIncluded: [] as string[],
  },
} as const;

export type PlanSlug = keyof typeof PLANS;
export type PlanConfig = (typeof PLANS)[PlanSlug];

export function getPlanBySlug(slug: string): PlanConfig | null {
  return PLANS[slug as PlanSlug] ?? null;
}

/** Format CLP price for display */
export function formatCLP(amount: number | null): string {
  if (amount === null) return 'A consultar';
  return `$${amount.toLocaleString('es-CL')} CLP`;
}

/** Format USD reference price */
export function formatUSDRef(amountCLP: number | null, usdRate: number): string {
  if (amountCLP === null || usdRate <= 0) return '';
  const usd = Math.round(amountCLP / usdRate);
  return `~USD $${usd}`;
}

/**
 * plans.ts — Single Source of Truth for AIgenciaLab pricing.
 * ALL components must import prices from here. No hardcoded prices anywhere.
 *
 * Prices are in CLP (Chilean Pesos).
 */

export type PlanName = 'Starter' | 'Pro' | 'Enterprise';

export interface Plan {
  name: PlanName;
  /** Monthly price in CLP. 0 = free. */
  price: number;
  /** Human-readable display string */
  priceDisplay: string;
  /** Short description */
  description: string;
  /** Conversation limit per month */
  conversationsLimit: number;
  /** Lead limit per month */
  leadsLimit: number;
  /** Max active bots */
  botsLimit: number;
  /** Trial days for new accounts */
  trialDays: number;
  /** MercadoPago plan ID (if applicable) */
  mpPlanId: string | null;
}

export const PLANS: Record<PlanName, Plan> = {
  Starter: {
    name: 'Starter',
    price: 0,
    priceDisplay: 'Gratis',
    description: 'Para pequeñas empresas que inician su viaje en la IA.',
    conversationsLimit: 500,
    leadsLimit: 100,
    botsLimit: 1,
    trialDays: 14,
    mpPlanId: null,
  },
  Pro: {
    name: 'Pro',
    price: 29990,
    priceDisplay: '$29.990/mes',
    description: 'Ideal para empresas en crecimiento con necesidades omnicanal.',
    conversationsLimit: 2500,
    leadsLimit: 500,
    botsLimit: 3,
    trialDays: 14,
    mpPlanId: process.env.NEXT_PUBLIC_MP_PLAN_PRO_ID || null,
  },
  Enterprise: {
    name: 'Enterprise',
    price: 99990,
    priceDisplay: '$99.990/mes',
    description: 'Soluciones integradas para grandes corporaciones.',
    conversationsLimit: 10000,
    leadsLimit: 2000,
    botsLimit: 10,
    trialDays: 14,
    mpPlanId: process.env.NEXT_PUBLIC_MP_PLAN_ENTERPRISE_ID || null,
  },
};

/** Map plan name → monthly CLP price (for MRR calculations) */
export const PLAN_MRR: Record<PlanName, number> = {
  Starter: PLANS.Starter.price,     // 0
  Pro: PLANS.Pro.price,              // 29990
  Enterprise: PLANS.Enterprise.price // 99990
};

/** Get Plan object safely (falls back to Starter) */
export function getPlan(name: string | null | undefined): Plan {
  return PLANS[(name as PlanName)] ?? PLANS.Starter;
}

/** Format CLP price for display */
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return '$' + price.toLocaleString('es-CL') + '/mes';
}

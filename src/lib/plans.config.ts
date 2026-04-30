/**
 * lib/plans.config.ts
 * FUENTE DE VERDAD para todos los feature gates del sistema.
 * Importar desde aquí en CUALQUIER componente que necesite verificar plan.
 *
 * NOTA: No modifica los archivos existentes config/plans.ts ni lib/plans.ts
 * que se usan para pricing/checkout. Este archivo es exclusivamente para
 * feature gating en el dashboard.
 */

export const PLAN_CONFIG = {
  basic: {
    id: "basic" as const,
    name: "Basic",
    price_clp: 45000,
    color: "purple",
    limits: {
      bots: 1,
      conversations_month: 500,
      leads: 300,
      team_members: 1,
      knowledge_files: 3,
      knowledge_urls: 5,
      analytics_days: 7,
      integrations: ["widget"] as string[],
      crm: false,
      crm_pipeline: false,
      reports: false,
      reports_export: false,
      api_access: false,
      webhooks: false,
      white_label: false,
      team_roles: false,
      bot_ab_testing: false,
      bot_handoff: false,
      bot_scheduled: false,
      sla_tickets: false,
      priority_support: false,
    },
  },
  starter: {
    id: "starter" as const,
    name: "Starter",
    price_clp: 120000,
    color: "teal",
    limits: {
      bots: 3,
      conversations_month: 3000,
      leads: 2000,
      team_members: 1,
      knowledge_files: 15,
      knowledge_urls: 20,
      analytics_days: 30,
      integrations: ["widget", "whatsapp"] as string[],
      crm: true,
      crm_pipeline: false,
      reports: false,
      reports_export: false,
      api_access: false,
      webhooks: false,
      white_label: false,
      team_roles: false,
      bot_ab_testing: false,
      bot_handoff: true,
      bot_scheduled: false,
      sla_tickets: false,
      priority_support: false,
    },
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    price_clp: 200000,
    color: "blue",
    limits: {
      bots: 10,
      conversations_month: 15000,
      leads: -1, // ilimitado
      team_members: 5,
      knowledge_files: 50,
      knowledge_urls: 100,
      analytics_days: 90,
      integrations: ["widget", "whatsapp", "telegram", "slack"] as string[],
      crm: true,
      crm_pipeline: true,
      reports: true,
      reports_export: true,
      api_access: true,
      webhooks: true,
      white_label: false,
      team_roles: true,
      bot_ab_testing: true,
      bot_handoff: true,
      bot_scheduled: true,
      sla_tickets: true,
      priority_support: true,
    },
  },
  enterprise: {
    id: "enterprise" as const,
    name: "Enterprise",
    price_clp: -1, // custom
    color: "amber",
    limits: {
      bots: -1,
      conversations_month: -1,
      leads: -1,
      team_members: -1,
      knowledge_files: -1,
      knowledge_urls: -1,
      analytics_days: -1,
      integrations: ["widget", "whatsapp", "telegram", "slack", "api", "webhooks"] as string[],
      crm: true,
      crm_pipeline: true,
      reports: true,
      reports_export: true,
      api_access: true,
      webhooks: true,
      white_label: true,
      team_roles: true,
      bot_ab_testing: true,
      bot_handoff: true,
      bot_scheduled: true,
      sla_tickets: true,
      priority_support: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLAN_CONFIG;
export type PlanLimits = typeof PLAN_CONFIG.basic.limits;
export type PlanFeature = keyof PlanLimits;

/** Static color maps for Tailwind v4 (no dynamic class generation) */
export const PLAN_COLORS: Record<PlanId, {
  bg10: string;
  bg20: string;
  border20: string;
  border30: string;
  text400: string;
  text300: string;
  bg600: string;
  bg700: string;
}> = {
  basic: {
    bg10: "bg-purple-500/10",
    bg20: "bg-purple-500/20",
    border20: "border-purple-500/20",
    border30: "border-purple-500/30",
    text400: "text-purple-400",
    text300: "text-purple-300",
    bg600: "bg-purple-600",
    bg700: "bg-purple-700",
  },
  starter: {
    bg10: "bg-teal-500/10",
    bg20: "bg-teal-500/20",
    border20: "border-teal-500/20",
    border30: "border-teal-500/30",
    text400: "text-teal-400",
    text300: "text-teal-300",
    bg600: "bg-teal-600",
    bg700: "bg-teal-700",
  },
  pro: {
    bg10: "bg-blue-500/10",
    bg20: "bg-blue-500/20",
    border20: "border-blue-500/20",
    border30: "border-blue-500/30",
    text400: "text-blue-400",
    text300: "text-blue-300",
    bg600: "bg-blue-600",
    bg700: "bg-blue-700",
  },
  enterprise: {
    bg10: "bg-amber-500/10",
    bg20: "bg-amber-500/20",
    border20: "border-amber-500/20",
    border30: "border-amber-500/30",
    text400: "text-amber-400",
    text300: "text-amber-300",
    bg600: "bg-amber-600",
    bg700: "bg-amber-700",
  },
};

/** Plan hierarchy for comparison */
const PLAN_ORDER: PlanId[] = ["basic", "starter", "pro", "enterprise"];

/** Get the numeric rank of a plan (0 = basic ... 3 = enterprise) */
export function planRank(planId: string): number {
  const idx = PLAN_ORDER.indexOf(planId.toLowerCase() as PlanId);
  return idx >= 0 ? idx : 0;
}

/** Check if planA >= planB in the hierarchy */
export function planAtLeast(planA: string, planB: string): boolean {
  return planRank(planA) >= planRank(planB);
}

/** Normalize any plan string to a valid PlanId */
export function normalizePlanId(raw: string | null | undefined): PlanId {
  const slug = (raw ?? "basic").toLowerCase();
  if (slug in PLAN_CONFIG) return slug as PlanId;
  // Handle legacy names
  if (slug === "business") return "pro";
  return "basic";
}

/** Check if the plan has access to a feature */
export function planHasFeature(planId: PlanId, feature: PlanFeature): boolean {
  const limit = PLAN_CONFIG[planId]?.limits[feature];
  if (typeof limit === "boolean") return limit;
  if (typeof limit === 'number') return Number(limit) !== 0;
  if (Array.isArray(limit)) return limit.length > 0;
  return false;
}

/** Check the minimum plan required for a feature */
export function minimumPlanFor(feature: PlanFeature): PlanId {
  for (const pid of PLAN_ORDER) {
    if (planHasFeature(pid, feature)) return pid;
  }
  return "enterprise";
}

/** Check if a value is within the plan's limit */
export function withinPlanLimit(
  planId: PlanId,
  feature: PlanFeature,
  currentUsage: number
): { allowed: boolean; limit: number; percentage: number } {
  const raw = PLAN_CONFIG[planId]?.limits[feature];
  const limit: number = Number(typeof raw === 'number' ? raw : 0);
  if (limit === -1) return { allowed: true, limit: -1, percentage: 0 };
  if (limit < 1) return { allowed: false, limit: 0, percentage: 100 };
  return {
    allowed: currentUsage < limit,
    limit,
    percentage: Math.round((currentUsage / limit) * 100),
  };
}

/** Format plan limit for display */
export function formatLimit(planId: PlanId, feature: PlanFeature): string {
  const raw = PLAN_CONFIG[planId]?.limits[feature];
  if (typeof raw === "number") {
    if (raw === -1) return "Ilimitado";
    return raw.toLocaleString("es-CL");
  }
  if (typeof raw === "boolean") return raw ? "✓" : "✗";
  if (Array.isArray(raw)) return raw.join(", ");
  return "-";
}

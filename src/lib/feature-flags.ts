/**
 * lib/feature-flags.ts — Plan-based feature gate system
 * Single source of truth for what each plan can access.
 * Aligned with config/plans.ts: basic, starter, pro, enterprise.
 *
 * Usage:
 *   const can = getFeatureFlags('starter');
 *   if (!can.whatsapp) return <UpgradeCTA feature="WhatsApp" />;
 */

export type PlanSlug = 'basic' | 'starter' | 'pro' | 'enterprise';

export interface FeatureFlags {
  // Channels
  whatsapp:      boolean;
  instagram:     boolean;
  messenger:     boolean;

  // Connect / Integrations
  connect:       boolean; // Can access /dashboard/connect at all?
  connectFull:   boolean; // Unlocked if pro+ (150+ integrations vs basic 10)

  // Agents & Conversations
  maxAgents:     number | null; // null = unlimited
  maxConvs:      number | null; // null = unlimited
  overagePerConv: number | null; // CLP per extra conversation (null = not applicable)

  // Bot / AI Models
  aiModels:      string[]; // Available LLM model IDs

  // Dashboard features
  advancedAnalytics: boolean;
  revenueAttribution: boolean;
  multiEmbudos:  boolean;
  apiAccess:     boolean;

  // Support
  supportLevel:  'basic' | 'priority' | 'gold' | 'dedicated';
  consultoria:   boolean; // Monthly consulting call included

  // Sidebar nav locking
  lockedNavItems: string[]; // Routes that show lock for this plan
}

const FLAGS: Record<PlanSlug, FeatureFlags> = {
  basic: {
    whatsapp:          false,
    instagram:         false,
    messenger:         false,
    connect:           false,
    connectFull:       false,
    maxAgents:         1,
    maxConvs:          500,
    overagePerConv:    60,
    aiModels:          ['claude-haiku', 'gemini-flash'],
    advancedAnalytics: false,
    revenueAttribution: false,
    multiEmbudos:      false,
    apiAccess:         false,
    supportLevel:      'basic',
    consultoria:       false,
    lockedNavItems:    ['/dashboard/connect'],
  },
  starter: {
    whatsapp:          true,
    instagram:         true,  // beta
    messenger:         false,
    connect:           true,
    connectFull:       false,
    maxAgents:         3,
    maxConvs:          2000,
    overagePerConv:    50,
    aiModels:          ['gpt-4o-mini', 'claude-sonnet', 'gemini-flash'],
    advancedAnalytics: false,
    revenueAttribution: false,
    multiEmbudos:      false,
    apiAccess:         false,
    supportLevel:      'priority',
    consultoria:       false,
    lockedNavItems:    [],
  },
  pro: {
    whatsapp:          true,
    instagram:         true,
    messenger:         true,
    connect:           true,
    connectFull:       true,
    maxAgents:         null,
    maxConvs:          null,
    overagePerConv:    null,
    aiModels:          ['gpt-4o', 'claude-sonnet-4', 'gemini-2.5'],
    advancedAnalytics: true,
    revenueAttribution: true,
    multiEmbudos:      true,
    apiAccess:         true,
    supportLevel:      'gold',
    consultoria:       true,
    lockedNavItems:    [],
  },
  enterprise: {
    whatsapp:          true,
    instagram:         true,
    messenger:         true,
    connect:           true,
    connectFull:       true,
    maxAgents:         null,
    maxConvs:          null,
    overagePerConv:    null,
    aiModels:          ['gpt-4o', 'claude-sonnet-4', 'gemini-2.5', 'custom'],
    advancedAnalytics: true,
    revenueAttribution: true,
    multiEmbudos:      true,
    apiAccess:         true,
    supportLevel:      'dedicated',
    consultoria:       true,
    lockedNavItems:    [],
  },
};

/**
 * Returns feature flags for the given plan slug.
 * Defaults to 'basic' if plan is invalid or undefined.
 */
export function getFeatureFlags(plan: string | null | undefined): FeatureFlags {
  const slug = (plan ?? '').toLowerCase() as PlanSlug;
  return FLAGS[slug] ?? FLAGS.basic;
}

/**
 * Checks if a specific plan can access a feature.
 * Shorthand for getFeatureFlags(plan)[feature].
 */
export function canAccess(plan: string | null | undefined, feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags(plan);
  const val = flags[feature];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (val === null) return true; // null = unlimited = can access
  return Boolean(val);
}

/**
 * Returns the plan slug from a plan name (handles capitalization).
 * e.g. 'Starter' → 'starter', 'PRO' → 'pro', 'basic' → 'basic'
 */
export function normalizePlanSlug(plan: string | null | undefined): PlanSlug {
  const slug = (plan ?? '').toLowerCase() as PlanSlug;
  return FLAGS[slug] ? slug : 'basic';
}

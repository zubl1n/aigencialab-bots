"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  PLAN_CONFIG,
  PlanId,
  PlanFeature,
  normalizePlanId,
  planHasFeature,
  withinPlanLimit,
} from "@/lib/plans.config";

interface PlanUsage {
  conversations_count?: number;
  leads_count?: number;
  bots_count?: number;
  api_calls_count?: number;
  [key: string]: number | undefined;
}

interface Subscription {
  plan: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  impl_paid_at: string | null;
  billing_start_date: string | null;
}

interface UsePlanReturn {
  /** Normalized plan id */
  planId: PlanId;
  /** Full plan config object */
  plan: typeof PLAN_CONFIG.basic;
  /** Whether the user is currently on a trial */
  isTrialing: boolean;
  /** Trial end date string or null */
  trialEndsAt: string | null;
  /** Days remaining in trial */
  trialDaysLeft: number;
  /** Check if the current plan has access to a feature */
  can: (feature: PlanFeature) => boolean;
  /** Check usage against plan limits */
  limit: (feature: PlanFeature) => { allowed: boolean; limit: number; percentage: number };
  /** Convenience booleans */
  isBasic: boolean;
  isStarter: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  /** Raw subscription data */
  subscription: Subscription | null;
  /** Current usage data */
  usage: PlanUsage;
  /** Loading state */
  loading: boolean;
  /** Refresh data */
  refresh: () => Promise<void>;
}

export function usePlan(): UsePlanReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<PlanUsage>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch subscription
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("plan, status, trial_ends_at, current_period_end, impl_paid_at, billing_start_date")
        .eq("client_id", user.id)
        .maybeSingle();

      if (subData) {
        setSubscription({
          plan: subData.plan ?? "basic",
          status: subData.status ?? "trialing",
          trial_ends_at: subData.trial_ends_at,
          current_period_end: subData.current_period_end,
          impl_paid_at: subData.impl_paid_at,
          billing_start_date: subData.billing_start_date,
        });
      }

      // Fetch usage counts (current month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [convsRes, leadsRes, botsRes] = await Promise.all([
        supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("client_id", user.id)
          .gte("created_at", monthStart),
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("client_id", user.id)
          .gte("created_at", monthStart),
        supabase
          .from("bot_configs")
          .select("*", { count: "exact", head: true })
          .eq("client_id", user.id),
      ]);

      setUsage({
        conversations_count: convsRes.count ?? 0,
        leads_count: leadsRes.count ?? 0,
        bots_count: botsRes.count ?? 0,
      });
    } catch (err) {
      console.error("[usePlan] Error fetching plan data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const planId = normalizePlanId(subscription?.plan);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = PLAN_CONFIG[planId] as any as (typeof PLAN_CONFIG)['basic'];

  const isTrialing = subscription?.status === "trialing" || subscription?.status === "trial";
  const trialEndsAt = subscription?.trial_ends_at ?? null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const featureToUsageKey: Partial<Record<PlanFeature, string>> = {
    conversations_month: "conversations_count",
    leads: "leads_count",
    bots: "bots_count",
  };

  return {
    planId,
    plan,
    isTrialing,
    trialEndsAt,
    trialDaysLeft,

    can: (feature: PlanFeature) => planHasFeature(planId, feature),

    limit: (feature: PlanFeature) => {
      const usageKey = featureToUsageKey[feature] ?? feature;
      const currentUsage = usage[usageKey] ?? 0;
      return withinPlanLimit(planId, feature, currentUsage);
    },

    isBasic: planId === "basic",
    isStarter: planId === "starter",
    isPro: planId === "pro",
    isEnterprise: planId === "enterprise",

    subscription,
    usage,
    loading,
    refresh: fetchData,
  };
}

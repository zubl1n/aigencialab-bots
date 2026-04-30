"use client";

import { usePlan } from "@/hooks/usePlan";
import {
  PLAN_CONFIG,
  PLAN_COLORS,
  PlanFeature,
  PlanId,
} from "@/lib/plans.config";
import { Lock, Zap } from "lucide-react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   PlanGate — Wraps content that requires a specific plan.
   ───────────────────────────────────────────────────────────── */

interface PlanGateProps {
  feature: PlanFeature;
  requiredPlan: "starter" | "pro" | "enterprise";
  /** true → blurs children with lock overlay. false → placeholder card. */
  blurContent?: boolean;
  children: React.ReactNode;
  /** Optional fallback content for lower plans */
  fallback?: React.ReactNode;
}

export function PlanGate({
  feature,
  requiredPlan,
  blurContent = true,
  children,
  fallback,
}: PlanGateProps) {
  const { can } = usePlan();

  if (can(feature)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const planName = PLAN_CONFIG[requiredPlan].name;
  const colors = PLAN_COLORS[requiredPlan];

  if (!blurContent) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center border border-dashed border-white/10 rounded-2xl">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg10} border ${colors.border20}`}
        >
          <Lock size={20} className={colors.text400} />
        </div>
        <div>
          <p className="text-white font-medium text-sm mb-1">
            Disponible en plan {planName}
          </p>
          <p className="text-gray-500 text-xs max-w-xs">
            Actualiza tu plan para desbloquear esta funcionalidad
          </p>
        </div>
        <Link href="/dashboard/settings/billing">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${colors.bg600} hover:${colors.bg700} text-white transition-colors`}
          >
            <Zap size={12} /> Actualizar a {planName}
          </button>
        </Link>
      </div>
    );
  }

  // Versión con blur overlay (para widgets grandes)
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg20} border ${colors.border30}`}
        >
          <Lock size={22} className={colors.text400} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm mb-1">
            Plan {planName} requerido
          </p>
          <p className="text-gray-400 text-xs">
            Esta función está disponible desde el plan {planName}
          </p>
        </div>
        <Link href="/dashboard/settings/billing">
          <button
            className={`px-5 py-2 rounded-xl text-sm font-medium ${colors.bg600} text-white transition-all flex items-center gap-2 hover:brightness-110`}
          >
            <Zap size={14} /> Actualizar plan →
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FeatureLock — Inline badge for features inside forms
   ───────────────────────────────────────────────────────────── */

export function FeatureLock({
  feature,
  requiredPlan,
  label,
}: {
  feature: PlanFeature;
  requiredPlan: "starter" | "pro" | "enterprise";
  label?: string;
}) {
  const { can } = usePlan();
  if (can(feature)) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs ml-2">
      <Lock size={10} /> {label ?? PLAN_CONFIG[requiredPlan].name}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   PlanBadge — Shows plan tier badge inline
   ───────────────────────────────────────────────────────────── */

export function PlanBadge({ plan }: { plan: PlanId }) {
  const colors = PLAN_COLORS[plan];
  const planName = PLAN_CONFIG[plan].name;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg10} ${colors.text400} border ${colors.border20}`}
    >
      {planName}
    </span>
  );
}

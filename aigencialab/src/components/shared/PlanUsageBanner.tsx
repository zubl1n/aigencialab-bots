"use client";

import { usePlan } from "@/hooks/usePlan";
import { Clock, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";

/**
 * PlanUsageBanner — Displays contextual alerts about plan limits.
 * Shows:
 *   - Trial expiry warning (≤5 days remaining)
 *   - Usage limit warning (≥80% of conversations or leads)
 *
 * Place at the top of the dashboard layout or page content.
 */
export function PlanUsageBanner() {
  const { limit, planId, isTrialing, trialDaysLeft, loading } = usePlan();

  if (loading) return null;

  const convLimit = limit("conversations_month");
  const leadsLimit = limit("leads");

  // Trial expiring soon
  if (isTrialing && trialDaysLeft <= 5) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between mb-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-300 text-sm font-medium">
              Tu trial termina en {trialDaysLeft} día{trialDaysLeft !== 1 ? "s" : ""}
            </p>
            <p className="text-amber-500/80 text-xs">
              Activa un plan para no perder tus datos y configuraciones
            </p>
          </div>
        </div>
        <Link href="/dashboard/billing">
          <button className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Zap size={12} />
            Activar plan
          </button>
        </Link>
      </div>
    );
  }

  // Trial fully expired
  if (isTrialing && trialDaysLeft <= 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between mb-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-300 text-sm font-medium">
              Tu período de prueba ha expirado
            </p>
            <p className="text-red-500/80 text-xs">
              Suscríbete ahora para mantener acceso a tu agente y datos
            </p>
          </div>
        </div>
        <Link href="/dashboard/billing">
          <button className="px-4 py-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5">
            <Zap size={12} />
            Suscribirse →
          </button>
        </Link>
      </div>
    );
  }

  // Usage alerts
  const alerts: { label: string; percentage: number; limit: number }[] = [];
  if (convLimit.percentage >= 80 && convLimit.limit !== -1) {
    alerts.push({ label: "conversaciones", ...convLimit });
  }
  if (leadsLimit.percentage >= 80 && leadsLimit.limit !== -1) {
    alerts.push({ label: "leads", ...leadsLimit });
  }

  if (alerts.length === 0) return null;

  const primary = alerts[0];
  const isExceeded = primary.percentage >= 100;

  return (
    <div
      className={`${
        isExceeded
          ? "bg-red-500/10 border-red-500/20"
          : "bg-amber-500/10 border-amber-500/20"
      } border rounded-xl px-4 py-3 flex items-center justify-between mb-6 animate-in fade-in duration-500`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          size={16}
          className={isExceeded ? "text-red-400" : "text-amber-400"}
        />
        <div>
          <p
            className={`text-sm font-medium ${
              isExceeded ? "text-red-300" : "text-amber-300"
            }`}
          >
            {isExceeded
              ? `Has alcanzado el límite de ${primary.label} del mes`
              : `Estás usando el ${primary.percentage}% de tus ${primary.label} del mes`}
          </p>
          <p
            className={`text-xs ${
              isExceeded ? "text-red-500/70" : "text-amber-500/70"
            }`}
          >
            {alerts.length > 1
              ? `También estás al ${alerts[1].percentage}% de tus ${alerts[1].label}`
              : isExceeded
              ? "Actualiza tu plan para seguir recibiendo mensajes"
              : `Límite: ${primary.limit.toLocaleString("es-CL")} ${primary.label}/mes`}
          </p>
        </div>
      </div>
      <Link href="/dashboard/billing">
        <button
          className={`px-4 py-1.5 ${
            isExceeded
              ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300"
              : "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 text-amber-300"
          } border text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5`}
        >
          <Zap size={12} />
          Aumentar límite →
        </button>
      </Link>
    </div>
  );
}

'use client';

import React from 'react';
import { FileBarChart } from 'lucide-react';
import { PlanGate } from '@/components/shared/PlanGate';

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-600">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <FileBarChart className="w-7 h-7 text-orange-400" /> Reportes
        </h1>
        <p className="text-gray-500 text-sm mt-1">Exporta y programa reportes detallados</p>
      </div>
      <PlanGate feature="reports_export" requiredPlan="pro" blurContent={false}>
        <div className="glass rounded-[28px] border border-white/5 p-12 text-center">
          <FileBarChart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-2">Reportes exportables disponibles en Plan Pro</p>
          <p className="text-gray-700 text-xs">Exporta conversaciones, leads y métricas en CSV/PDF</p>
        </div>
      </PlanGate>
    </div>
  );
}

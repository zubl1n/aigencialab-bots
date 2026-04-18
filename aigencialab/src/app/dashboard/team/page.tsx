'use client';

import React from 'react';
import { Users2, Lock } from 'lucide-react';
import { PlanGate } from '@/components/shared/PlanGate';

export default function TeamPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-600">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users2 className="w-7 h-7 text-indigo-400" /> Equipo
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona los miembros de tu equipo</p>
      </div>
      <PlanGate feature="team_roles" requiredPlan="pro" blurContent={false}>
        <div className="glass rounded-[28px] border border-white/5 p-12 text-center">
          <Users2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-2">Gestión de equipo disponible en Plan Pro</p>
          <p className="text-gray-700 text-xs">Invita hasta 5 miembros con roles diferenciados: Admin, Agente y Viewer</p>
        </div>
      </PlanGate>
    </div>
  );
}

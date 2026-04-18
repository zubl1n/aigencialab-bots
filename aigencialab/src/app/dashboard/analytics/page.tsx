'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BarChart3, TrendingUp, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePlan } from '@/hooks/usePlan';
import { PlanGate } from '@/components/shared/PlanGate';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';

type Period = '7d' | '30d' | '90d';

interface DayStats { date: string; conversations: number; leads: number; messages: number; }
interface KPIs {
  total_conversations: number; total_leads: number; avg_duration_min: number;
  resolution_rate: number; lead_conversion_rate: number; avg_messages_per_conv: number;
}

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="glass rounded-[24px] p-6 border border-white/5">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{label}</div>
      <div className="text-3xl font-black text-white tracking-tight" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="text-gray-400 font-bold mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const supabase = createClient();
  const { planId, can } = usePlan();
  const [period, setPeriod] = useState<Period>('7d');
  const [dailyStats, setDailyStats] = useState<DayStats[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const canAccess30d = !['basic'].includes(planId);
  const canAccess90d = ['pro', 'enterprise'].includes(planId);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    const [convsRes, leadsRes] = await Promise.all([
      supabase.from('conversations').select('id, created_at, status, messages_count, duration_min')
        .eq('client_id', user.id).gte('created_at', sinceISO).order('created_at', { ascending: true }),
      supabase.from('leads').select('id, created_at')
        .eq('client_id', user.id).gte('created_at', sinceISO).order('created_at', { ascending: true }),
    ]);

    const convs = convsRes.data ?? [];
    const leads = leadsRes.data ?? [];

    // Build day-by-day stats
    const dayMap: Record<string, DayStats> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
      dayMap[key] = { date: key, conversations: 0, leads: 0, messages: 0 };
    }
    convs.forEach(c => {
      const key = new Date(c.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
      if (dayMap[key]) { dayMap[key].conversations++; dayMap[key].messages += c.messages_count ?? 0; }
    });
    leads.forEach(l => {
      const key = new Date(l.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
      if (dayMap[key]) dayMap[key].leads++;
    });

    setDailyStats(Object.values(dayMap));

    const resolved = convs.filter(c => c.status === 'resolved').length;
    const avgDur = convs.length > 0 ? Math.round(convs.reduce((a, c) => a + (c.duration_min ?? 0), 0) / convs.length) : 0;
    const avgMsgs = convs.length > 0 ? Math.round(convs.reduce((a, c) => a + (c.messages_count ?? 0), 0) / convs.length) : 0;

    setKpis({
      total_conversations: convs.length,
      total_leads: leads.length,
      avg_duration_min: avgDur,
      resolution_rate: convs.length > 0 ? Math.round((resolved / convs.length) * 100) : 0,
      lead_conversion_rate: convs.length > 0 ? Math.round((leads.length / convs.length) * 100) : 0,
      avg_messages_per_conv: avgMsgs,
    });
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-purple-400" /> Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Métricas reales de tu agente IA · Datos en vivo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {(['7d', '30d', '90d'] as Period[]).map(p => {
              const locked = (p === '30d' && !canAccess30d) || (p === '90d' && !canAccess90d);
              return (
                <button key={p} onClick={() => !locked && setPeriod(p)} disabled={locked}
                  className={`px-4 py-2 text-xs font-bold transition-all ${period === p ? 'bg-purple-600 text-white' : locked ? 'text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                  title={locked ? 'Requiere plan superior' : ''}
                >
                  {p} {locked ? '🔒' : ''}
                </button>
              );
            })}
          </div>
          <button onClick={fetchAnalytics} className="p-2 hover:bg-white/5 rounded-xl border border-white/5 transition text-gray-600 hover:text-gray-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-purple-400 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KPICard label="Conversaciones" value={kpis?.total_conversations ?? 0} sub={`Últimos ${period}`} color="#a855f7" />
            <KPICard label="Leads capturados" value={kpis?.total_leads ?? 0} sub={`Últimos ${period}`} color="#10b981" />
            <KPICard label="Tasa de resolución" value={`${kpis?.resolution_rate ?? 0}%`} sub="Conversaciones resueltas" color="#3b82f6" />
            <KPICard label="Conversión a lead" value={`${kpis?.lead_conversion_rate ?? 0}%`} sub="De conv. a lead" color="#f59e0b" />
            <KPICard label="Duración promedio" value={`${kpis?.avg_duration_min ?? 0} min`} sub="Por conversación" color="#06b6d4" />
            <KPICard label="Mensajes avg" value={kpis?.avg_messages_per_conv ?? 0} sub="Por conversación" color="#8b5cf6" />
          </div>

          <div className="glass rounded-[32px] border border-white/5 p-7">
            <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Volumen diario — Conversaciones + Leads
            </h3>
            {dailyStats.length === 0 || dailyStats.every(d => d.conversations === 0 && d.leads === 0) ? (
              <div className="flex items-center justify-center py-12 text-gray-600 text-sm">
                Sin datos para este período. Los datos aparecen cuando tu bot tiene conversaciones.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyStats} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="conversations" name="Conversaciones" fill="#a855f7" radius={[4,4,0,0]} maxBarSize={28} />
                  <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4,4,0,0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <PlanGate feature="reports" requiredPlan="pro">
            <div className="glass rounded-[32px] border border-white/5 p-7">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" /> Mensajes totales por día
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="messages" name="Mensajes" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PlanGate>
        </>
      )}
    </div>
  );
}

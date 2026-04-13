'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { 
  Users, 
  Bot, 
  Target, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminMetrics } from '@/types/admin';

const AdminAnalyticsChart = dynamic(() => import('@/components/admin/AdminAnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-[350px] w-full flex items-center justify-center bg-white/5 rounded-3xl animate-pulse">Cargando gráfico...</div>
});

const data = [
  { week: 'Semana 1', count: 12 },
  { week: 'Semana 2', count: 18 },
  { week: 'Semana 3', count: 15 },
  { week: 'Semana 4', count: 25 },
  { week: 'Semana 5', count: 32 },
  { week: 'Semana 6', count: 28 },
  { week: 'Semana 7', count: 35 },
  { week: 'Semana 8', count: 42 },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMetrics();

    // Subscribe to changes in critical tables
    const channel = supabase
      .channel('admin-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_configs' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => fetchMetrics())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchMetrics() {
    try {
      const { data: clients } = await supabase.from('clients').select('status, plan');
      const { data: bots } = await supabase.from('bot_configs').select('active');
      const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      const { count: convsCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true });

      const mrrMap = { 'Starter': 49, 'Pro': 149, 'Enterprise': 499 };
      
      const newMetrics: AdminMetrics = {
        total_clients_active: clients?.filter(c => c.status === 'active').length || 0,
        total_clients_pending: clients?.filter(c => c.status === 'pending').length || 0,
        total_clients_suspended: clients?.filter(c => c.status === 'suspended').length || 0,
        total_bots_active: bots?.filter(b => b.active).length || 0,
        total_bots_inactive: bots?.filter(b => !b.active).length || 0,
        total_bots_configuring: clients?.filter(c => c.status === 'onboarding').length || 0,
        total_leads_month: leadsCount || 0,
        total_conversations_month: convsCount || 0,
        estimated_mrr: clients?.reduce((acc, c) => acc + (mrrMap[c.plan as keyof typeof mrrMap] || 0), 0) || 0
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Global</h1>
        <p className="text-[var(--muted)]">Vista general del ecosistema AIgenciaLab.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="MRR Estimado" value={`$${metrics?.estimated_mrr.toLocaleString()}`} icon={DollarSign} trend="+12.5%" color="blue" />
        <MetricCard title="Leads del Mes" value={metrics?.total_leads_month || 0} icon={Target} trend="+8%" color="emerald" />
        <MetricCard title="Conversaciones" value={metrics?.total_conversations_month || 0} icon={MessageSquare} trend="+24%" color="purple" />
        <MetricCard title="Clientes Activos" value={metrics?.total_clients_active || 0} icon={Users} trend="+3" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-8 border border-[var(--border)]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-semibold text-white">Nuevos Registros</h3>
              <p className="text-sm text-[var(--muted)]">Clientes registrados en las últimas 8 semanas</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Creciendo</span>
            </div>
          </div>
          
          <Suspense fallback={<div className="h-[350px] w-full flex items-center justify-center bg-white/5 rounded-3xl animate-pulse">Cargando gráfico...</div>}>
            <AdminAnalyticsChart data={data} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-white mb-6">Estado de Bots</h3>
            <div className="space-y-6">
              <StatusRow label="Activos" value={metrics?.total_bots_active || 0} color="bg-emerald-500" />
              <StatusRow label="Inactivos" value={metrics?.total_bots_inactive || 0} color="bg-red-500" />
              <StatusRow label="En Configuración" value={metrics?.total_bots_configuring || 0} color="bg-orange-500" />
            </div>
          </div>

          <div className="glass rounded-3xl p-8 border border-[var(--border)] overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-2">Plan Enterprise</h3>
              <p className="text-sm text-[var(--muted)] mb-4">4 nuevos clientes solicitando upgrade</p>
              <button className="w-full py-3 bg-[var(--bg3)] hover:bg-[var(--bg2)] text-white rounded-xl font-medium transition-colors border border-[var(--border)]">
                Gestionar Solicitudes
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/10',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/10',
    purple: 'from-purple-500 to-pink-600 shadow-purple-500/10',
    orange: 'from-orange-500 to-amber-600 shadow-orange-500/10'
  };

  return (
    <div className="glass rounded-3xl p-6 border border-[var(--border)] hover:border-blue-500/30 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--muted)] mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-sm text-[var(--sub)] font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { 
  MessageSquare, 
  Target, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  Bot,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ClientDashboardMetrics, ActivityFeedItem } from '@/types/dashboard';
import ChartSkeleton from '@/components/dashboard/ChartSkeleton';

const AnalyticsChart = dynamic(() => import('@/components/dashboard/AnalyticsChart'), { 
  ssr: false,
  loading: () => <ChartSkeleton />
});

interface DashboardContentProps {
  data: any[];
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const [metrics, setMetrics] = useState<ClientDashboardMetrics | null>(null);
  const [isBotActive, setIsBotActive] = useState(false);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock metrics for demo
      setMetrics({
        total_conversations_month: 245,
        captured_leads_month: 42,
        response_rate: 98.2,
        uptime_percentage: 99.9
      });

      // Fetch bot status
      const { data: bot } = await supabase
        .from('bot_configs')
        .select('active')
        .eq('client_id', user.id)
        .single();
      
      if (bot) setIsBotActive(bot.active);

      // Mock activity
      setActivities([
        { id: '1', type: 'lead', title: 'Nuevo Lead: Carlos Ruiz', description: 'Interesado en Plan Pro. Correo capturado.', timestamp: 'Hace 5 min' },
        { id: '2', type: 'conversation', title: 'Conversación finalizada', description: 'Resuelta por IA sin intervención humana.', timestamp: 'Hace 20 min' },
        { id: '3', type: 'conversation', title: 'Pregunta frecuente detectada', description: 'Bot respondió sobre horarios de despacho.', timestamp: 'Hace 1 hora' },
        { id: '4', type: 'system', title: 'Actualización de Sistema', description: 'Mejoras en el modelo Gemini-1.5-Flash.', timestamp: 'Ayer' },
      ]);

      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-[var(--muted)]">Esto es lo que ha pasado con tu asistente IA este mes.</p>
        </div>
        <div className="hidden md:block">
           <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mr-2">Estado del servicio:</span>
           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Operativo
           </span>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Conversaciones" value={metrics?.total_conversations_month || 0} icon={MessageSquare} trend="+12%" color="blue" />
        <MetricCard title="Leads Capturados" value={metrics?.captured_leads_month || 0} icon={Target} trend="+5%" color="emerald" />
        <MetricCard title="Tasa de Respuesta" value={`${metrics?.response_rate}%`} icon={Activity} trend="+0.5%" color="purple" />
        <MetricCard title="Tiempo Activo" value={`${metrics?.uptime_percentage}%`} icon={Clock} trend="Stable" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Principal */}
        <div className="lg:col-span-2 glass rounded-[32px] p-8 border border-[var(--border)]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-white">Volumen de Conversaciones</h3>
              <p className="text-sm text-[var(--muted)]">Actividad diaria de los últimos 7 días</p>
            </div>
            <select className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 px-4 text-white text-xs focus:outline-none">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
            </select>
          </div>
          
          <Suspense fallback={<ChartSkeleton />}>
            <AnalyticsChart data={data} />
          </Suspense>
        </div>

        {/* Panel lateral: Estado del Bot & Actividad */}
        <div className="space-y-8">
           {/* Bot Status Card */}
           <div className={`glass rounded-[32px] p-8 border transition-all duration-500 ${isBotActive ? 'border-emerald-500/20' : 'border-orange-500/20 shadow-lg shadow-orange-500/5'}`}>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-white">Estado del Bot</h3>
                 <div className={`p-2 rounded-xl ${isBotActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    <Bot className="w-6 h-6" />
                 </div>
              </div>

              {!isBotActive ? (
                <div className="space-y-4">
                   <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-200 leading-relaxed font-medium">
                        Tu bot está en espera de activación por parte del equipo de AIgenciaLab.
                      </p>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest text-orange-500">
                        <span>Progreso de Onboarding</span>
                        <span>80%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 w-[80%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                      </div>
                   </div>
                   <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/5">
                      Contactar Soporte
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <p className="text-sm text-[var(--muted)] leading-relaxed">
                     Tu asistente IA está <span className="text-emerald-500 font-bold">activo</span> y respondiendo a tus clientes 24/7.
                   </p>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                         <p className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Modelo</p>
                         <p className="text-sm font-bold text-white">GPT-4o</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                         <p className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Latencia</p>
                         <p className="text-sm font-bold text-white">~1.2s</p>
                      </div>
                   </div>
                   <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                      Ver logs en vivo <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
              )}
           </div>

           {/* Recent Activity */}
           <div className="glass rounded-[32px] p-8 border border-[var(--border)]">
              <h3 className="text-lg font-bold text-white mb-6">Actividad Reciente</h3>
              <div className="space-y-6">
                 {activities.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 transition-transform group-hover:scale-110 ${
                         item.type === 'lead' ? 'bg-emerald-500/10 text-emerald-500' : 
                         item.type === 'conversation' ? 'bg-blue-500/10 text-blue-500' : 
                         'bg-purple-500/10 text-purple-500'
                       }`}>
                          {item.type === 'lead' ? <Target className="w-5 h-5" /> : 
                           item.type === 'conversation' ? <MessageSquare className="w-5 h-5" /> : 
                           <Activity className="w-5 h-5" />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                             <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.title}</h4>
                             <span className="text-[9px] font-bold text-[var(--muted)] uppercase whitespace-nowrap ml-2">{item.timestamp}</span>
                          </div>
                          <p className="text-xs text-[var(--muted)] line-clamp-1">{item.description}</p>
                       </div>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 text-xs font-bold text-blue-400 hover:text-white transition-colors flex items-center justify-center gap-2 group">
                 Ver todo el historial <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/10 text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/10 text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'from-purple-500 to-pink-600 shadow-purple-500/10 text-purple-500 bg-purple-500/10 border-purple-500/20',
    orange: 'from-orange-500 to-amber-600 shadow-orange-500/10 text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className="glass rounded-[32px] p-6 border border-[var(--border)] hover:border-blue-500/30 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-[var(--muted)] mb-1 uppercase tracking-widest">{title}</p>
        <h2 className="text-3xl font-bold text-white tracking-tighter">{value}</h2>
      </div>
    </div>
  );
}

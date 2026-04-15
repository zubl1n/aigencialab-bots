'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  MessageSquare,
  Target,
  Activity,
  TrendingUp,
  Bot,
  ChevronRight,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  DollarSign,
  Zap,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ChartSkeleton from '@/components/dashboard/ChartSkeleton';
import Link from 'next/link';

const AnalyticsChart = dynamic(() => import('@/components/dashboard/AnalyticsChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

interface DashboardContentProps {
  data: any[];
}

export default function DashboardContent({ data }: DashboardContentProps) {
  const [metrics, setMetrics] = useState<{
    totalLeads: number;
    convsThisWeek: number;
    convsLastWeek: number;
    responseRate: number;
  } | null>(null);
  const [isBotActive, setIsBotActive] = useState(false);
  const [botStatus, setBotStatus] = useState<'active' | 'pending' | 'error'>('pending');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    plan: string; status: string; currentPeriodEnd: string | null; trialEndsAt: string | null;
  } | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Bot status
    const { data: bot } = await supabase
      .from('bot_configs')
      .select('active')
      .eq('client_id', user.id)
      .single();

    if (bot) {
      setIsBotActive(bot.active);
      setBotStatus(bot.active ? 'active' : 'pending');
    }

    // Real metrics
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - 14);

    const [leadsRes, convsWeekRes, convsLastWeekRes, apiKeyRes, recentLeadsRes] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('client_id', user.id),
      supabase.from('conversations').select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .gte('created_at', startOfWeek.toISOString()),
      supabase.from('conversations').select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .gte('created_at', startOfLastWeek.toISOString())
        .lt('created_at', startOfWeek.toISOString()),
      supabase.from('api_keys').select('key').eq('client_id', user.id).limit(1).single(),
      supabase.from('leads').select('id, contact_name, status, created_at').eq('client_id', user.id).order('created_at', { ascending: false }).limit(3),
    ]);

    // Fetch subscription info
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, trial_ends_at')
      .eq('client_id', user.id)
      .limit(1)
      .single();

    if (subData) {
      setSubscription({
        plan: subData.plan ?? 'Starter',
        status: subData.status ?? 'trialing',
        currentPeriodEnd: subData.current_period_end,
        trialEndsAt: subData.trial_ends_at,
      });
    }

    const totalLeads = leadsRes.count || 0;
    const convsThisWeek = convsWeekRes.count || 0;
    const convsLastWeek = convsLastWeekRes.count || 0;
    const cvr = convsThisWeek > 0 ? Math.round((totalLeads / Math.max(convsThisWeek * 4, 1)) * 100) : 0;

    setMetrics({ totalLeads, convsThisWeek, convsLastWeek, responseRate: Math.min(cvr, 100) });
    if (apiKeyRes.data?.key) setApiKey(apiKeyRes.data.key);

    const activityItems = (recentLeadsRes.data || []).map((lead: any) => ({
      id: lead.id,
      type: 'lead',
      title: `Nuevo Lead: ${lead.contact_name}`,
      description: `Estado: ${lead.status}`,
      timestamp: formatRelativeTime(lead.created_at)
    }));
    setActivities(activityItems);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // FASE 2: Realtime subscription on bot_configs for this client_id
    let channel: any;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel(`bot-status-${user.id}`)
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'bot_configs', filter: `client_id=eq.${user.id}` },
          (payload: any) => {
            const active = payload.new?.active;
            setIsBotActive(active);
            setBotStatus(active ? 'active' : 'pending');
          }
        )
        .subscribe();
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleCopySnippet = () => {
    const snippet = `<script src="https://aigencialab.cl/widget/widget.js" data-api-key="${apiKey}" defer></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const cvrTrend = metrics && metrics.convsLastWeek > 0
    ? Math.round(((metrics.convsThisWeek - metrics.convsLastWeek) / metrics.convsLastWeek) * 100)
    : 0;

  // FASE 2: avg ticket = 15.000 CLP
  const estimatedValue = (metrics?.totalLeads || 0) * 15000;

  // ── FASE 2: Bot status config ────────────────────────────────────────────
  const statusConfig = {
    active: {
      bg: 'bg-gradient-to-br from-emerald-950/60 to-slate-900/80 border-emerald-500/30 shadow-2xl shadow-emerald-500/5',
      glow: 'bg-emerald-500',
      dotColor: 'bg-emerald-400 animate-pulse',
      dotLabel: 'text-emerald-400',
      labelText: 'Bot Activo',
      title: 'Tu bot está activo',
      desc: 'Respondiendo consultas, capturando leads y calificando prospectos.',
      iconClass: 'bg-emerald-500/20 border border-emerald-500/40',
      iconColor: 'text-emerald-400',
      cta: { label: 'Ver instalación →', href: '/dashboard/installation', cls: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30' }
    },
    error: {
      bg: 'bg-gradient-to-br from-red-950/60 to-slate-900/80 border-red-500/30 shadow-2xl shadow-red-500/5',
      glow: 'bg-red-500',
      dotColor: 'bg-red-400',
      dotLabel: 'text-red-400',
      labelText: 'Error de Configuración',
      title: 'Problema detectado',
      desc: 'Hay un error en la configuración. Contacta soporte para resolverlo.',
      iconClass: 'bg-red-500/20 border border-red-500/40',
      iconColor: 'text-red-400',
      cta: { label: 'Contactar soporte →', href: '/dashboard/support', cls: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' }
    },
    pending: {
      bg: 'bg-gradient-to-br from-slate-800/40 to-slate-900/80 border-slate-700/30',
      glow: 'bg-slate-500',
      dotColor: 'bg-slate-500',
      dotLabel: 'text-slate-400',
      labelText: 'Pendiente de Activación',
      title: 'Tu bot está en revisión',
      desc: 'Nuestro equipo lo revisará y activará en menos de 24 horas.',
      iconClass: 'bg-slate-700/50 border border-slate-600/40',
      iconColor: 'text-slate-400',
      cta: { label: 'Ver estado →', href: '/dashboard/support', cls: 'bg-white/5 hover:bg-white/10 text-white border border-white/10' }
    }
  };

  const sc = statusConfig[botStatus];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ─── FASE 2: Bot Status HERO — Largest block ────────────────────── */}
      <div className={`relative rounded-[32px] p-8 md:p-10 border overflow-hidden transition-all duration-500 ${sc.bg}`}>
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/4 ${sc.glow}`} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Status Icon */}
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 ${sc.iconClass}`}>
            <Bot className={`w-10 h-10 ${sc.iconColor}`} />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${sc.dotColor}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${sc.dotLabel}`}>
                {sc.labelText}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
              {sc.title}
            </h2>
            <p className="text-slate-400 text-sm">{sc.desc}</p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Link
              href={sc.cta.href}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${sc.cta.cls}`}
            >
              {sc.cta.label} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── FASE 2: Impacto Section — 4 metric cards ──────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Impacto de tu Bot</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Leads Totales"
            value={metrics?.totalLeads || 0}
            icon={Target}
            trend={`+${metrics?.totalLeads || 0}`}
            color="emerald"
          />
          <MetricCard
            title="Convs. esta semana"
            value={metrics?.convsThisWeek || 0}
            icon={MessageSquare}
            trend={cvrTrend >= 0 ? `+${cvrTrend}%` : `${cvrTrend}%`}
            trendPositive={cvrTrend >= 0}
            color="blue"
          />
          <MetricCard
            title="CVR Estimado"
            value={`${metrics?.responseRate || 0}%`}
            icon={Activity}
            trend="Calculado"
            color="purple"
          />
          <MetricCard
            title="Valor Estimado"
            value={`$${(estimatedValue / 1000).toFixed(0)}K`}
            icon={DollarSign}
            trend="+leads × $15K"
            color="orange"
          />
        </div>
      </div>

      {/* ─── Chart + Activity + Snippet ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-[32px] p-8 border border-[var(--border)]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-white">Volumen de Conversaciones</h3>
              <p className="text-sm text-[var(--muted)]">Actividad diaria de los últimos 7 días</p>
            </div>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <AnalyticsChart data={data} />
          </Suspense>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Snippet card */}
          <div className="glass rounded-[32px] p-6 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Tu Snippet</h3>
              <button
                id="copy-snippet-dashboard"
                onClick={handleCopySnippet}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
              </button>
            </div>
            <pre className="bg-slate-950 rounded-xl p-3 text-[10px] text-emerald-400 font-mono overflow-hidden">
              {`<script\n  src="...widget.js"\n  data-api-key="${apiKey ? apiKey.slice(0, 16) + '...' : 'LOADING'}"\n  defer>\n</script>`}
            </pre>
            {botStatus === 'active' && (
              <div className="mt-4 h-32 bg-slate-950 rounded-xl border border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Vista previa activa</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="glass rounded-[32px] p-6 border border-[var(--border)]">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Actividad Reciente</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Sin actividad todavía. Los leads aparecerán aquí.</p>
            ) : (
              <div className="space-y-4">
                {activities.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.description} · {item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/leads" className="flex items-center justify-center gap-1 mt-4 text-xs font-bold text-blue-400 hover:text-white transition-colors">
              Ver todos los leads <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Subscription & Quick Links ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <div className="glass rounded-[32px] p-8 border border-[var(--border)]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Tu Suscripción</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Plan Actual</span>
              <span className="text-sm font-bold text-white bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                {subscription?.plan ?? 'Starter'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Estado</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                subscription?.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                subscription?.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {subscription?.status === 'active' ? 'Activo' : subscription?.status === 'trialing' ? 'Trial' : subscription?.status ?? 'Pendiente'}
              </span>
            </div>
            {subscription?.trialEndsAt && subscription.status === 'trialing' && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted)]">Trial hasta</span>
                <span className="text-sm font-bold text-yellow-400">
                  {new Date(subscription.trialEndsAt).toLocaleDateString('es-CL')}
                </span>
              </div>
            )}
            {subscription?.currentPeriodEnd && subscription.status === 'active' && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted)]">Próximo cobro</span>
                <span className="text-sm font-bold text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-CL')}
                </span>
              </div>
            )}
          </div>
          <Link href="/dashboard/billing" className="flex items-center justify-center gap-1 mt-5 text-xs font-bold text-purple-400 hover:text-white transition-colors">
            Ver facturación <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Quick Nav */}
        <div className="glass rounded-[32px] p-8 border border-[var(--border)]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/bot" className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
              <Bot className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-white">Configurar Agente</p>
                <p className="text-[10px] text-[var(--muted)]">Prompt, modelo, idioma</p>
              </div>
            </Link>
            <Link href="/dashboard/leads" className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
              <Target className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-white">Mis Leads</p>
                <p className="text-[10px] text-[var(--muted)]">Ver y gestionar</p>
              </div>
            </Link>
            <Link href="/dashboard/conversations" className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
              <MessageSquare className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-white">Conversaciones</p>
                <p className="text-[10px] text-[var(--muted)]">Historial completo</p>
              </div>
            </Link>
            <Link href="/dashboard/installation" className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
              <Zap className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-white">Instalación</p>
                <p className="text-[10px] text-[var(--muted)]">Snippet y widget</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendPositive = true, color }: any) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className="glass rounded-[24px] p-5 border border-[var(--border)] hover:border-blue-500/20 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${trendPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-bold text-[var(--muted)] mb-1 uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-bold text-white tracking-tighter">{value}</h2>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${days}d`;
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bot, CreditCard, MessageSquare, Bell, Zap, ArrowRight,
  TrendingUp, Users, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Loader2, Calendar, RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface DashboardData {
  client: any;
  subscription: any;
  bot: any;
  leads_count: number;
  open_tickets: number;
  conversations_count: number;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: string;
  title: string;
  detail: string;
  created_at: string;
  read: boolean;
}

const PLAN_LIMITS: Record<string, number> = {
  Starter: 500,
  Pro: 2000,
  Business: 10000,
  Enterprise: 99999,
};

function getPlanColor(plan: string) {
  if (plan === 'Enterprise') return '#f59e0b';
  if (plan === 'Business')   return '#8b5cf6';
  if (plan === 'Pro')        return '#3b82f6';
  return '#10b981';
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}

function StatCard({ icon, label, value, sub, color = '#7C3AED', href }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string; href?: string;
}) {
  const content = (
    <div className="glass rounded-[24px] p-6 border border-white/5 hover:border-white/10 transition-all group cursor-default">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '15', border: '1px solid ' + color + '25' }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {href && <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition" />}
      </div>
      <div className="text-2xl font-black text-white tracking-tight mb-0.5">{value}</div>
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardHomePage() {
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [
      { data: client },
      { data: sub },
      { data: bot },
      { count: leads },
      { count: openTix },
      { count: convos },
      { data: notifs },
    ] = await Promise.all([
      supabase.from('clients').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('client_id', user.id).maybeSingle(),
      supabase.from('bot_configs').select('*').eq('client_id', user.id).maybeSingle(),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('client_id', user.id),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('client_id', user.id).eq('status', 'open'),
      supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('client_id', user.id),
      supabase.from('alerts').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);

    setData({
      client,
      subscription: sub,
      bot,
      leads_count:          leads ?? 0,
      open_tickets:         openTix ?? 0,
      conversations_count:  convos ?? 0,
      notifications: (notifs ?? []).map(n => ({
        id:         n.id,
        type:       n.type,
        title:      n.title,
        detail:     n.detail,
        created_at: n.created_at,
        read:       false,
      })),
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
        <p className="text-sm text-gray-600">Cargando tu dashboard…</p>
      </div>
    );
  }

  if (!data) return null;

  const plan       = data.client?.plan ?? 'Starter';
  const planColor  = getPlanColor(plan);
  const status     = data.subscription?.status ?? 'trialing';
  const trialEnds  = data.subscription?.trial_ends_at;
  const renewDate  = data.subscription?.current_period_end;
  const daysLeft   = trialEnds ? daysUntil(trialEnds) : null;
  const limit      = PLAN_LIMITS[plan] ?? 500;
  const usedPct    = Math.min(100, Math.round((data.conversations_count / limit) * 100));
  const company    = data.client?.company_name || data.client?.company || 'Tu empresa';
  const botActive  = data.bot?.active;

  // Contextual CTA
  let ctaLabel = '';
  let ctaHref  = '';
  if (status === 'trialing' && daysLeft !== null && daysLeft <= 5) {
    ctaLabel = `⏰ Trial vence en ${daysLeft} días — Suscribirse ahora`;
    ctaHref  = '/dashboard/billing';
  } else if (!botActive) {
    ctaLabel = '🤖 Tu bot está inactivo — Configurar agente';
    ctaHref  = '/dashboard/bot';
  } else if (!data.client?.company) {
    ctaLabel = '👤 Completa tu perfil de empresa';
    ctaHref  = '/dashboard/settings';
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Bienvenido, <span style={{ color: planColor }}>{data.client?.contact_name?.split(' ')[0] ?? company}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">{company} · Plan {plan}</p>
        </div>
        <button onClick={fetchData} className="p-2.5 hover:bg-white/5 rounded-xl border border-white/5 transition text-gray-600 hover:text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Contextual CTA banner */}
      {ctaLabel && (
        <Link href={ctaHref} className="block">
          <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between hover:border-purple-500/40 transition group">
            <span className="text-sm font-bold text-purple-300">{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      )}

      {/* ── Plan + Suscripción card ── */}
      <div className="glass rounded-[32px] border border-white/5 p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: planColor + '20', border: '1px solid ' + planColor + '30' }}>
              <Zap className="w-5 h-5" style={{ color: planColor }} />
            </div>
            <div>
              <div className="font-black text-white text-lg">{plan}</div>
              <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Plan activo</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
              status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              status === 'trialing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {status === 'active' ? '🟢 Activo' : status === 'trialing' ? `⏳ Trial` : '⛔ Inactivo'}
            </div>
            {(trialEnds || renewDate) && (
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" />
                {status === 'trialing' ? `Vence ${new Date(trialEnds!).toLocaleDateString('es-CL')}` : `Renueva ${new Date(renewDate!).toLocaleDateString('es-CL')}`}
              </p>
            )}
          </div>
        </div>

        {/* Usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-500">Uso del mes</span>
            <span className="text-white">{data.conversations_count.toLocaleString()} / {limit.toLocaleString()} conversaciones</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${usedPct}%`,
                background: usedPct > 80 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : `linear-gradient(90deg,${planColor},${planColor}99)`
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-700">
            <span>{usedPct}% utilizado</span>
            {usedPct > 80 && <span className="text-orange-400 font-bold">Considera actualizar tu plan</span>}
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Conversaciones"
          value={data.conversations_count}
          sub="Este mes"
          color="#6366f1"
          href="/dashboard/conversations"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Leads capturados"
          value={data.leads_count}
          sub="Total acumulado"
          color="#10b981"
          href="/dashboard/leads"
        />
        <StatCard
          icon={<Ticket className="w-5 h-5" />}
          label="Tickets abiertos"
          value={data.open_tickets}
          sub={data.open_tickets === 0 ? 'Sin pendientes ✅' : 'Requieren atención'}
          color={data.open_tickets > 0 ? '#f59e0b' : '#10b981'}
          href="/dashboard/tickets"
        />
        <StatCard
          icon={<Bot className="w-5 h-5" />}
          label="Agente IA"
          value={botActive ? 'Activo' : 'Inactivo'}
          sub={botActive ? `Modelo: ${data.bot?.model ?? 'Llama 3.1'}` : 'Activar en configuración'}
          color={botActive ? '#10b981' : '#6b7280'}
          href="/dashboard/bot"
        />
      </div>

      {/* ── Bot status + Recent notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot status card */}
        <div className="glass rounded-[28px] border border-white/5 p-7">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" /> Estado del Agente IA
          </h3>
          {data.bot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Nombre</span>
                <span className="text-sm font-bold text-white">{data.bot.bot_name || data.bot.name || 'Asistente IA'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Modelo IA</span>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{data.bot.model ?? 'llama-3.1-8b-instant'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Estado</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${botActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {botActive ? '🟢 En línea' : '⛔ Inactivo'}
                </span>
              </div>
              <Link href="/dashboard/bot" className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 rounded-xl text-sm text-gray-400 hover:text-white transition font-medium mt-2">
                Configurar agente <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 text-sm">Sin bot configurado</p>
              <Link href="/dashboard/bot" className="text-purple-400 text-xs hover:underline mt-2 inline-block">Configurar →</Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass rounded-[28px] border border-white/5 p-7">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" /> Alertas recientes
          </h3>
          {data.notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
              <p className="text-sm text-gray-600">Sin alertas — Todo en orden ✅</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white leading-tight">{n.title}</p>
                    {n.detail && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.detail}</p>}
                    <p className="text-[9px] text-gray-700 mt-1">{new Date(n.created_at).toLocaleDateString('es-CL')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h3 className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-3">Accesos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/installation', label: 'Instalar widget', icon: <Zap className="w-4 h-4" />, color: '#6366f1' },
            { href: '/dashboard/leads',        label: 'Ver leads',       icon: <Users className="w-4 h-4" />, color: '#10b981' },
            { href: '/dashboard/tickets',      label: 'Mis tickets',     icon: <MessageSquare className="w-4 h-4" />, color: '#f59e0b' },
            { href: '/dashboard/billing',      label: 'Facturación',     icon: <CreditCard className="w-4 h-4" />, color: '#8b5cf6' },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition group"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.color + '15' }}>
                <div style={{ color: a.color }}>{a.icon}</div>
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add missing import
function Ticket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  );
}

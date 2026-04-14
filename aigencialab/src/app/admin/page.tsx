'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Users,
  Bot,
  Target,
  MessageSquare,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  AlertTriangle,
  XCircle,
  Wifi,
  MessageCircle,
  Globe,
  Zap,
  UserCheck,
  UserX,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PLAN_MRR } from '@/lib/plans';

// ── Inline SVGs ───────────────────────────────────────────────────────────────
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const AdminAnalyticsChart = dynamic(() => import('@/components/admin/AdminAnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full flex items-center justify-center bg-white/5 rounded-3xl animate-pulse text-slate-500 text-sm">Cargando...</div>
});

const MRR_MAP: Record<string, number> = PLAN_MRR;

// ── Toast component ───────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success' ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' : 'bg-red-950 border-red-500/30 text-red-300'
    }`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
      <span className="text-sm font-semibold">{msg}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'leads'>('overview');
  const supabase = createClient();

  // ── Clients table state ───────────────────────────────────────────────────
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Leads tab state ───────────────────────────────────────────────────────
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadClientFilter, setLeadClientFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  }, []);

  // ── Fetch overview metrics ────────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const [clientsRes, botsRes, leadsRes, convsRes, botsThisMonthRes, trialsExpiringRes, failedPaymentsRes] = await Promise.all([
        supabase.from('clients').select('id, status, plan, company_name, trial_ends_at, payment_status'),
        supabase.from('bot_configs').select('active, client_id, created_at'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true }),
        supabase.from('bot_configs').select('*', { count: 'exact', head: true }).eq('active', true).gte('created_at', startOfMonth.toISOString()),
        supabase.from('clients').select('id, company_name, trial_ends_at').lte('trial_ends_at', threeDaysFromNow.toISOString()).gt('trial_ends_at', now.toISOString()),
        supabase.from('clients').select('id, company_name, payment_status').eq('payment_status', 'failed')
      ]);

      const cs = clientsRes.data || [];
      const bs = botsRes.data || [];
      const estimatedMrr = cs.reduce((acc: number, c: any) => acc + (MRR_MAP[c.plan] || 0), 0);

      setMetrics({
        total_clients_active: cs.filter((c: any) => c.status === 'active').length,
        total_clients_pending: cs.filter((c: any) => c.status === 'pending').length,
        total_bots_active: bs.filter((b: any) => b.active).length,
        total_bots_inactive: bs.filter((b: any) => !b.active).length,
        total_leads: leadsRes.count || 0,
        total_conversations: convsRes.count || 0,
        bots_activated_month: botsThisMonthRes.count || 0,
        estimated_mrr: estimatedMrr
      });

      const newAlerts: any[] = [];
      (trialsExpiringRes.data || []).forEach((c: any) => {
        const daysLeft = Math.ceil((new Date(c.trial_ends_at).getTime() - now.getTime()) / 86400000);
        newAlerts.push({ id: `trial_${c.id}`, type: 'warning', message: `${c.company_name} — trial vence en ${daysLeft}d`, action: 'Ver' });
      });
      (failedPaymentsRes.data || []).forEach((c: any) => {
        newAlerts.push({ id: `pay_${c.id}`, type: 'error', message: `${c.company_name} — pago fallido`, action: 'Ver' });
      });
      setAlerts(newAlerts);

      setChartData([
        { week: 'Sem 1', count: Math.max(1, cs.length - 7) },
        { week: 'Sem 2', count: Math.max(1, cs.length - 5) },
        { week: 'Sem 3', count: Math.max(1, cs.length - 3) },
        { week: 'Sem 4', count: cs.length }
      ]);
    } catch (e) {
      console.error('fetchMetrics:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch clients list ─────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    let q = supabase
      .from('clients')
      .select(`id, company_name, email, plan, status, trial_ends_at, payment_status, created_at,
               bot_configs (id, active)`)
      .order('created_at', { ascending: false });

    if (clientSearch) {
      q = q.or(`company_name.ilike.%${clientSearch}%,email.ilike.%${clientSearch}%`);
    }

    const { data } = await q;
    setClients((data || []).map((c: any) => ({
      ...c,
      bot_configs: Array.isArray(c.bot_configs) ? c.bot_configs[0] : c.bot_configs
    })));
    setClientsLoading(false);
  }, [clientSearch]);

  // ── Fetch all leads ────────────────────────────────────────────────────────
  const fetchAllLeads = useCallback(async () => {
    setLeadsLoading(true);
    let q = supabase
      .from('leads')
      .select(`id, contact_name, email, status, created_at,
               client_id, clients:clients(company_name)`)
      .order('created_at', { ascending: false });

    if (leadClientFilter !== 'all') q = q.eq('client_id', leadClientFilter);
    if (leadStatusFilter !== 'all') q = q.eq('status', leadStatusFilter);

    const { data } = await q;
    setAllLeads(data || []);
    setLeadsLoading(false);
  }, [leadClientFilter, leadStatusFilter]);

  useEffect(() => {
    fetchMetrics();
    const channel = supabase
      .channel('admin-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_configs' }, fetchMetrics)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchMetrics]);

  useEffect(() => { if (activeTab === 'clients') fetchClients(); }, [activeTab, fetchClients]);
  useEffect(() => { if (activeTab === 'leads') fetchAllLeads(); }, [activeTab, fetchAllLeads]);

  // ── FASE 2: Activar / Desactivar bot + toast ──────────────────────────────
  const handleToggleBot = async (clientId: string, botId: string | undefined, currentActive: boolean, companyName: string) => {
    if (!botId) {
      showToast('Este cliente no tiene bot configurado', 'error');
      return;
    }
    setTogglingId(clientId);
    const newActive = !currentActive;
    const { error } = await supabase
      .from('bot_configs')
      .update({ active: newActive })
      .eq('id', botId);

    if (error) {
      showToast(`Error al ${newActive ? 'activar' : 'desactivar'} bot`, 'error');
    } else {
      if (newActive) {
        // Trigger notify
        fetch('/api/admin/notify-activation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId })
        }).catch(() => {});
      }
      showToast(`Bot de ${companyName} ${newActive ? 'activado' : 'desactivado'} ✓`, 'success');
      fetchClients();
      fetchMetrics();
    }
    setTogglingId(null);
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'
            }`}>
              {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <p className={`flex-1 text-sm font-medium ${alert.type === 'warning' ? 'text-amber-200' : 'text-red-200'}`}>{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        <p className="text-[var(--muted)]">Gestión global del ecosistema AIgenciaLab.</p>
      </div>

      {/* ── FASE 2: Metrics Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="MRR Estimado" value={`$${(metrics?.estimated_mrr || 0).toLocaleString('es-CL')}`} icon={DollarSign} trend="Real" color="blue" />
        <MetricCard title="Leads Totales" value={metrics?.total_leads || 0} icon={Target} trend="Real" color="emerald" />
        <MetricCard title="Bots Activos" value={metrics?.total_bots_active || 0} icon={Bot} trend={`+${metrics?.bots_activated_month || 0} este mes`} color="purple" />
        <MetricCard title="Activaciones" value={metrics?.bots_activated_month || 0} icon={Zap} trend="Este mes" color="orange" />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit">
        {(['overview', 'clients', 'leads'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Resumen' : tab === 'clients' ? 'Clientes' : 'Leads Globales'}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-3xl p-8 border border-[var(--border)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">Nuevos Registros</h3>
                <p className="text-sm text-[var(--muted)]">Últimas semanas</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-medium">
                <TrendingUp className="w-4 h-4" /><span>Creciendo</span>
              </div>
            </div>
            <Suspense fallback={<div className="h-[280px] animate-pulse bg-white/5 rounded-3xl" />}>
              <AdminAnalyticsChart data={chartData} />
            </Suspense>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl p-6 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Estado Bots</h3>
              <div className="space-y-3">
                <StatusRow label="Activos" value={metrics?.total_bots_active || 0} color="bg-emerald-500" />
                <StatusRow label="Inactivos" value={metrics?.total_bots_inactive || 0} color="bg-red-500" />
                <StatusRow label="Pendientes" value={metrics?.total_clients_pending || 0} color="bg-orange-500" />
              </div>
            </div>
            <div className="glass rounded-3xl p-6 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Conversaciones</span><span className="font-bold text-white">{metrics?.total_conversations?.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Clientes activos</span><span className="font-bold text-white">{metrics?.total_clients_active}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Bots activados mes</span><span className="font-bold text-emerald-400">{metrics?.bots_activated_month}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Clients Table ─────────────────────────────────────────────── */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por empresa o email..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          {clientsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : (
            <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/3">
                <span>Empresa</span>
                <span>Plan</span>
                <span>Trial ends</span>
                <span>Bot</span>
                <span>Alertas</span>
                <span className="text-right">Acciones</span>
              </div>

              {clients.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">No hay clientes. La tabla se pobla al registrarse usuarios.</div>
              ) : (
                clients.map(client => {
                  const bot = client.bot_configs;
                  const botActive = bot?.active ?? false;
                  const trialEnd = client.trial_ends_at ? new Date(client.trial_ends_at) : null;
                  const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / 86400000) : null;
                  const isTrialAlert = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;
                  const isPayFailed = client.payment_status === 'failed';

                  return (
                    <div key={client.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-5 py-4 border-b border-white/5 hover:bg-white/3 transition-all items-center">
                      {/* Name + email */}
                      <div>
                        <p className="font-semibold text-white text-sm truncate">{client.company_name || '—'}</p>
                        <p className="text-xs text-slate-500 truncate">{client.email}</p>
                      </div>

                      {/* Plan badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border w-fit ${
                        client.plan === 'Enterprise' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        client.plan === 'Pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-slate-400 border-white/10'
                      }`}>{client.plan || 'Starter'}</span>

                      {/* trial_ends_at */}
                      <span className="text-xs text-slate-400">
                        {trialEnd ? trialEnd.toLocaleDateString('es-CL') : '—'}
                      </span>

                      {/* Bot status */}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${botActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className={`text-xs font-bold ${botActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {botActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      {/* Alert badges */}
                      <div className="flex flex-wrap gap-1">
                        {isTrialAlert && (
                          <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" />{daysLeft}d
                          </span>
                        )}
                        {isPayFailed && (
                          <span className="flex items-center gap-1 text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                            <XCircle className="w-2.5 h-2.5" />Pago fallido
                          </span>
                        )}
                      </div>

                      {/* Actions: Activar / Desactivar */}
                      <div className="flex justify-end gap-2">
                        <button
                          id={`btn-toggle-bot-${client.id}`}
                          disabled={togglingId === client.id}
                          onClick={() => handleToggleBot(client.id, bot?.id, botActive, client.company_name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            botActive
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {togglingId === client.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : botActive ? (
                            <><UserX className="w-3 h-3" /> Desactivar</>
                          ) : (
                            <><UserCheck className="w-3 h-3" /> Activar</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Global Leads ─────────────────────────────────────────────── */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={leadClientFilter}
                onChange={e => setLeadClientFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
              >
                <option value="all">Todos los clientes</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
              <select
                value={leadStatusFilter}
                onChange={e => setLeadStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
              >
                <option value="all">Todos los estados</option>
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="qualified">Calificado</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
          </div>

          {leadsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : (
            <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] px-5 py-3 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Contacto</span>
                <span>Cliente</span>
                <span>Estado</span>
                <span>Fecha</span>
                <span />
              </div>
              {allLeads.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">Sin leads para los filtros seleccionados.</div>
              ) : (
                allLeads.map(lead => (
                  <div key={lead.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] px-5 py-3.5 border-b border-white/5 hover:bg-white/3 transition-all items-center">
                    <div>
                      <p className="text-sm font-semibold text-white">{lead.contact_name || '—'}</p>
                      <p className="text-xs text-slate-500">{lead.email || '—'}</p>
                    </div>
                    <p className="text-xs text-slate-400">{lead.clients?.company_name || '—'}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${
                      lead.status === 'qualified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      lead.status === 'closed' ? 'bg-slate-700 text-slate-400 border-slate-600' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>{lead.status || 'new'}</span>
                    <p className="text-xs text-slate-500">{new Date(lead.created_at).toLocaleDateString('es-CL')}</p>
                    <span />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500'
  };
  return (
    <div className="glass rounded-3xl p-6 border border-[var(--border)] hover:border-blue-500/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
          <ArrowUpRight className="w-3 h-3" />{trend}
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--muted)] mb-1">{title}</p>
      <h2 className="text-2xl font-bold text-white tracking-tight">{value}</h2>
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-[var(--sub)] font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

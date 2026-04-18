'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle2, Bot, Users, RefreshCw, Filter } from 'lucide-react';

type Severity = 'critica' | 'alta' | 'media' | 'info';
type AlertStatus = 'open' | 'resolved';

interface AlertItem {
  id: string; type: Severity; status: AlertStatus; icon: string;
  title: string; detail: string; clientName: string; clientId: string;
  slaRemaining: string; createdAt: string; cta?: string; ctaHref?: string; isDbAlert: boolean;
}

const SEV_CFG: Record<Severity, { label: string; cls: string; iconComp: any }> = {
  critica: { label: 'Crítica', cls: 'text-red-400 bg-red-500/10 border-red-500/20', iconComp: AlertTriangle },
  alta:    { label: 'Alta',    cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20', iconComp: AlertCircle },
  media:   { label: 'Media',  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', iconComp: Bell },
  info:    { label: 'Info',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20', iconComp: Info },
};

export default function AdminAlertasClient({ alerts, counts, inactiveBots, clientsWithoutBot, activeClientsCount }: {
  alerts: AlertItem[];
  counts: { total: number; critica: number; alta: number; open: number; resolved: number };
  inactiveBots: { client_id: string; bot_name?: string; clients?: { id: string; company_name?: string; email?: string } }[];
  clientsWithoutBot: { id: string; company_name?: string; email?: string }[];
  activeClientsCount: number;
}) {
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = alerts
    .filter(a => !severityFilter || a.type === severityFilter)
    .filter(a => !statusFilter || a.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-600">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-400" /> Alertas del Sistema
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {counts.total} total · {counts.open} abiertas · <span className="text-red-400">{counts.critica} críticas</span>
          </p>
        </div>
        <Link href="/admin/alertas" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </Link>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`glass rounded-2xl border p-5 ${inactiveBots.length > 0 ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Bot className={`w-5 h-5 ${inactiveBots.length > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bots Inactivos</span>
          </div>
          <div className={`text-4xl font-black ${inactiveBots.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{inactiveBots.length}</div>
          {inactiveBots.length > 0 && (
            <ul className="mt-3 space-y-1">
              {inactiveBots.slice(0,3).map((b: any) => (
                <li key={b.client_id}><Link href={`/admin/clientes/${b.clients?.id}`} className="text-xs text-red-400 hover:underline">{b.clients?.company_name || b.clients?.email || '—'}</Link></li>
              ))}
              {inactiveBots.length > 3 && <li className="text-xs text-gray-700">+{inactiveBots.length - 3} más</li>}
            </ul>
          )}
          {inactiveBots.length === 0 && <p className="text-xs text-emerald-600 mt-1">✅ Todos operativos</p>}
        </div>

        <div className={`glass rounded-2xl border p-5 ${clientsWithoutBot.length > 0 ? 'border-amber-500/20' : 'border-emerald-500/20'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Users className={`w-5 h-5 ${clientsWithoutBot.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sin Bot Activo</span>
          </div>
          <div className={`text-4xl font-black ${clientsWithoutBot.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{clientsWithoutBot.length}</div>
        </div>

        <div className="glass rounded-2xl border border-blue-500/20 p-5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Clientes Activos</span>
          </div>
          <div className="text-4xl font-black text-blue-400">{activeClientsCount}</div>
          <p className="text-xs text-gray-600 mt-1">{inactiveBots.length === 0 && clientsWithoutBot.length === 0 ? '✅ Todo operativo' : `⚠️ ${inactiveBots.length + clientsWithoutBot.length} req atención`}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { v: counts.critica, label: 'Críticas',  color: 'text-red-400',    border: 'border-red-500/20' },
          { v: counts.alta,    label: 'Altas',     color: 'text-orange-400', border: 'border-orange-500/20' },
          { v: counts.open,    label: 'Abiertas',  color: 'text-blue-400',   border: 'border-blue-500/20' },
          { v: counts.resolved,label: 'Resueltas', color: 'text-emerald-400',border: 'border-emerald-500/20' },
        ].map(c => (
          <div key={c.label} className={`glass rounded-2xl border ${c.border} p-5`}>
            <div className={`text-3xl font-black ${c.color}`}>{c.v}</div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl border border-white/5 p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-600" />
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
          <option value="">Todas las severidades</option>
          <option value="critica">🔴 Crítica</option>
          <option value="alta">🟠 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="info">🔵 Info</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
          <option value="">Todos los estados</option>
          <option value="open">Abiertas</option>
          <option value="resolved">Resueltas</option>
        </select>
        {(severityFilter || statusFilter) && (
          <button onClick={() => { setSeverityFilter(''); setStatusFilter(''); }} className="text-xs text-gray-600 hover:text-white transition">× Limpiar</button>
        )}
      </div>

      {/* Alerts table */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay alertas con los filtros actuales</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Severidad', 'Cliente', 'Tipo / Detalle', 'SLA', 'Estado', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const crit = SEV_CFG[a.type] ?? SEV_CFG.info;
                  const SevIcon = crit.iconComp;
                  return (
                    <tr key={a.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${a.status === 'resolved' ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${crit.cls}`}>
                          <SevIcon className="w-2.5 h-2.5" /> {crit.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.clientId ? (
                          <Link href={`/admin/clientes/${a.clientId}`} className="text-purple-400 hover:underline font-medium text-xs">{a.clientName}</Link>
                        ) : <span className="text-gray-600 text-xs">{a.clientName}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="text-base">{a.icon}</span>
                          <div>
                            <div className="font-medium text-white text-xs">{a.title}</div>
                            {a.detail && <div className="text-[10px] text-gray-600 mt-0.5">{a.detail}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${a.slaRemaining === 'Vencido' || a.slaRemaining === 'Urgente' ? 'text-red-400' : 'text-gray-500'}`}>{a.slaRemaining}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${a.status === 'open' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                          {a.status === 'open' ? '🔴 Abierta' : '✅ Resuelta'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-600">{new Date(a.createdAt).toLocaleDateString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {a.cta && a.status === 'open' && (
                            <Link href={a.ctaHref ?? `/admin/clientes/${a.clientId}`}
                              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition">
                              {a.cta}
                            </Link>
                          )}
                          {a.isDbAlert && a.status === 'open' && (
                            <form action="/api/admin/resolve-alert" method="POST" className="inline">
                              <input type="hidden" name="alert_id" value={a.id} />
                              <input type="hidden" name="client_id" value={a.clientId} />
                              <button type="submit" className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition">✅ Resolver</button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-white/5 text-[10px] text-gray-700">
              Mostrando {filtered.length} de {alerts.length} alertas
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

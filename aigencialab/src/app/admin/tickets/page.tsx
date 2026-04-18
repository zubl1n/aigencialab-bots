'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Bot, MessageSquare, CreditCard,
  TicketIcon, Bell, ClipboardList, TrendingUp, TrendingDown,
  RefreshCw, Send, ChevronDown, ChevronUp, CheckCircle2,
  AlertCircle, Clock, X, Search, Filter, MoreHorizontal,
  Activity, DollarSign, Target, Zap, Eye, Mail, Phone,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
type TicketItem = {
  id: string; subject: string; message: string; status: string;
  priority: string; created_at: string; admin_response: string | null;
  client?: { email: string; company_name?: string; company?: string };
};

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  open:        { label: 'Abierto',     dot: 'bg-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  in_progress: { label: 'En proceso',  dot: 'bg-blue-400',    badge: 'bg-blue-500/10  text-blue-400  border-blue-500/20'  },
  resolved:    { label: 'Resuelto',    dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  closed:      { label: 'Cerrado',     dot: 'bg-gray-500',    badge: 'bg-white/5 text-gray-400 border-white/10' },
};
const PRIORITY_CFG: Record<string, { label: string; badge: string }> = {
  low:    { label: 'Baja',    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  normal: { label: 'Normal',  badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  medium: { label: 'Media',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  high:   { label: 'Alta',    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  urgent: { label: 'Urgente', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 3_600_000)  return `${Math.floor(ms / 60000)} min`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)} h`;
  return `${Math.floor(ms / 86_400_000)} d`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; trend?: 'up' | 'down' | null;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${color} transition-all hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-white/10 backdrop-blur-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-red-400/20 text-red-300'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </span>
        )}
      </div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
      <div className="text-[11px] text-white/60 mt-1 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Ticket Card ────────────────────────────────────────────────────────────
function TicketCard({ ticket, onRespond, onStatus }: {
  ticket: TicketItem;
  onRespond: (id: string, text: string) => Promise<void>;
  onStatus:  (id: string, status: string) => Promise<void>;
}) {
  const [open, setOpen]   = useState(false);
  const [text, setText]   = useState('');
  const [busy, setBusy]   = useState(false);
  const st  = STATUS_CFG[ticket.status]   ?? STATUS_CFG.open;
  const pri = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.normal;
  const name = ticket.client?.company_name || ticket.client?.company || ticket.client?.email || 'Cliente';

  const handleRespond = async () => {
    if (!text.trim()) return;
    setBusy(true);
    await onRespond(ticket.id, text);
    setText('');
    setBusy(false);
  };

  return (
    <div className={`glass rounded-2xl border transition-all ${
      ticket.status === 'open' ? 'border-amber-500/20' :
      ticket.status === 'resolved' ? 'border-emerald-500/10' : 'border-white/5'
    }`}>
      {/* Row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] rounded-2xl transition"
        onClick={() => setOpen(o => !o)}
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white truncate">{ticket.subject}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.badge}`}>{st.label}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pri.badge}`}>{pri.label}</span>
          </div>
          <div className="text-[11px] text-[#A09CB0] mt-0.5 flex items-center gap-2">
            <span>{name}</span>
            {ticket.client?.email && <span className="text-gray-600">·</span>}
            {ticket.client?.email && <span className="text-gray-600">{ticket.client.email}</span>}
            <span className="text-gray-700">· {timeAgo(ticket.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {ticket.admin_response && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Respondido
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.04] pt-4 space-y-4">
          {/* Client message */}
          <div>
            <p className="text-[10px] font-bold text-[#6B6480] uppercase tracking-wider mb-2">Mensaje del cliente</p>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-[#C0BDD0] leading-relaxed">
              {ticket.message}
            </div>
          </div>

          {/* Admin response if exists */}
          {ticket.admin_response && (
            <div>
              <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-2">Tu respuesta</p>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300 leading-relaxed">
                {ticket.admin_response}
              </div>
            </div>
          )}

          {/* Reply box */}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <div>
              <p className="text-[10px] font-bold text-[#6B6480] uppercase tracking-wider mb-2">Responder al cliente</p>
              <textarea
                rows={3}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Escribe tu respuesta... El cliente la recibirá por email."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4B4860] focus:outline-none focus:border-[#7C3AED]/50 resize-none transition"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRespond}
                  disabled={!text.trim() || busy}
                  className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {busy ? 'Enviando...' : 'Responder y resolver'}
                </button>
                <button
                  onClick={() => onStatus(ticket.id, 'in_progress')}
                  className="text-sm text-[#A09CB0] border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition"
                >
                  En proceso
                </button>
                <button
                  onClick={() => onStatus(ticket.id, 'closed')}
                  className="text-sm text-[#A09CB0] border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition"
                >
                  Cerrar
                </button>
                {ticket.client?.email && (
                  <a
                    href={`mailto:${ticket.client.email}`}
                    className="ml-auto flex items-center gap-1.5 text-xs text-[#A09CB0] hover:text-white border border-white/10 px-3 py-2 rounded-xl transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email directo
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────
export default function AdminTicketsPage() {
  const [tickets,        setTickets]       = useState<TicketItem[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [filter,         setFilter]        = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search,         setSearch]        = useState('');
  const [toast,          setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    // Use service-role API — no Bearer token needed, relies on cookies (admin session)
    const res  = await fetch('/api/admin/tickets');
    const data = await res.json();
    setTickets(data.tickets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRespond = async (id: string, text: string) => {
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_response: text, status: 'resolved' }),
    });
    if (res.ok) {
      showToast('✅ Respuesta enviada al cliente por email');
      await load();
    } else {
      const d = await res.json();
      showToast(`❌ ${d.error ?? 'Error'}`, false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Estado actualizado: ${STATUS_CFG[status]?.label ?? status}`);
      await load();
    }
  };

  const filtered = tickets
    .filter(t => filter         === 'all' || t.status   === filter)
    .filter(t => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter(t => !search || t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.client?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.client?.company_name ?? '').toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all:         tickets.length,
    open:        tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved:    tickets.filter(t => t.status === 'resolved').length,
    closed:      tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-medium shadow-xl animate-in slide-in-from-bottom-4 border ${
          toast.ok ? 'bg-[#0e0e18] border-emerald-500/30 text-emerald-400' : 'bg-[#0e0e18] border-red-500/30 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tickets de Soporte</h1>
          <p className="text-[#A09CB0] text-sm mt-0.5">Gestiona solicitudes de tus clientes en tiempo real</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-[#A09CB0] hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tickets abiertos"   value={counts.open}        icon={AlertCircle}  color="from-amber-600/20 to-orange-600/10 border-amber-500/20" trend={counts.open > 3 ? 'up' : null} />
        <StatCard label="En proceso"          value={counts.in_progress} icon={Clock}        color="from-blue-600/20 to-cyan-600/10 border-blue-500/20" />
        <StatCard label="Resueltos"           value={counts.resolved}     icon={CheckCircle2} color="from-emerald-600/20 to-teal-600/10 border-emerald-500/20" trend="up" />
        <StatCard label="Total tickets"       value={counts.all}          icon={TicketIcon}   color="from-purple-600/20 to-indigo-600/10 border-purple-500/20" />
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-1 flex-wrap">
            {([['all','Todos'], ['open','Abiertos'], ['in_progress','En proceso'], ['resolved','Resueltos'], ['closed','Cerrados']] as [string,string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition relative ${
                  filter === val ? 'bg-[#7C3AED] text-white' : 'text-[#A09CB0] hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
                {counts[val as keyof typeof counts] > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    filter === val ? 'bg-white/20' : 'bg-white/5'
                  }`}>
                    {counts[val as keyof typeof counts]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-bold text-[#A09CB0] focus:outline-none focus:border-[#7C3AED]/50 transition cursor-pointer"
          >
            <option value="all">Prioridad: Todas</option>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Alta</option>
            <option value="normal">🔵 Normal</option>
            <option value="medium">🔵 Media</option>
            <option value="low">⚪ Baja</option>
          </select>

          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6480]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por empresa, email o asunto..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#4B4860] focus:outline-none focus:border-[#7C3AED]/50 transition"
            />
          </div>
        </div>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 py-20 text-center">
          <TicketIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-[#A09CB0]">
            {search ? 'No hay tickets que coincidan' : filter !== 'all' ? `No hay tickets "${STATUS_CFG[filter]?.label}"` : 'No hay tickets aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <TicketCard
              key={t.id}
              ticket={t}
              onRespond={handleRespond}
              onStatus={handleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

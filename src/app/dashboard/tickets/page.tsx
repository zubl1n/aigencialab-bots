'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Ticket, Plus, ChevronRight, Clock, CheckCircle2, Circle,
  AlertCircle, Loader2, Send, X, MessageSquare, RefreshCw
} from 'lucide-react';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

interface TicketRow {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  unread_client: boolean;
  created_at: string;
  updated_at: string;
}
interface Message {
  id: string;
  author_id: string;
  role: 'client' | 'agent';
  body: string;
  created_at: string;
}

const STATUS_STYLE: Record<TicketStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  open:        { label: 'Abierto',      cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',   icon: <Circle className="w-3 h-3" /> },
  in_progress: { label: 'En progreso',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',         icon: <Clock className="w-3 h-3" /> },
  resolved:    { label: 'Resuelto',     cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  closed:      { label: 'Cerrado',      cls: 'bg-white/5 text-gray-400 border-white/10',                icon: <X className="w-3 h-3" /> },
};
const PRIORITY_STYLE: Record<TicketPriority, { label: string; cls: string }> = {
  low:    { label: 'Baja',    cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  normal: { label: 'Normal',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  high:   { label: 'Alta',    cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  urgent: { label: 'Urgente', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3_600_000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86_400_000) return `Hace ${Math.floor(diff / 3_600_000)} h`;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
}

// SLA helpers
function formatElapsed(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h  = Math.floor(ms / 3_600_000);
  const m  = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 48) return `${Math.floor(h / 24)} d`;
  if (h >= 1)  return `${h} h ${m} min`;
  return `${m} min`;
}

function getSLAStatus(createdAt: string, status: TicketStatus): 'ok' | 'warning' | 'breach' | null {
  if (status === 'resolved' || status === 'closed') return null;
  const ms = Date.now() - new Date(createdAt).getTime();
  const h  = ms / 3_600_000;
  if (h >= 24) return 'breach';   // > 24h sin respuesta = SLA breach
  if (h >= 4)  return 'warning';  // > 4h = améber
  return 'ok';
}


export default function TicketsPage() {
  const [tickets,     setTickets]   = useState<TicketRow[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [selected,    setSelected]  = useState<string | null>(null);
  const [messages,    setMessages]  = useState<Message[]>([]);
  const [ticketDetail,setTDetail]   = useState<TicketRow | null>(null);
  const [loadingDtl,  setLoadingDtl]= useState(false);
  const [reply,       setReply]     = useState('');
  const [sending,     setSending]   = useState(false);
  const [showNew,     setShowNew]   = useState(false);
  const [newSubj,     setNewSubj]   = useState('');
  const [newMsg,      setNewMsg]    = useState('');
  const [newPriority, setNewPrio]   = useState<TicketPriority>('normal');
  const [creating,    setCreating]  = useState(false);
  const [toast,       setToast]     = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadTickets = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/support/tickets');
    const data = await res.json().catch(() => ({ tickets: [] }));
    setTickets(data.tickets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const openTicket = async (id: string) => {
    setSelected(id);
    setLoadingDtl(true);
    const res = await fetch(`/api/support/tickets/${id}`);
    const data = await res.json();
    setTDetail(data.ticket);
    setMessages(data.messages ?? []);
    setLoadingDtl(false);
    // Mark as read locally
    setTickets(prev => prev.map(t => t.id === id ? { ...t, unread_client: false } : t));
    setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const res = await fetch(`/api/support/tickets/${selected}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply }),
    });
    if (res.ok) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        author_id: 'me',
        role: 'client',
        body: reply,
        created_at: new Date().toISOString(),
      }]);
      setReply('');
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    setSending(false);
  };

  const createTicket = async () => {
    if (!newSubj.trim() || !newMsg.trim()) return;
    setCreating(true);
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: newSubj, message: newMsg, priority: newPriority }),
    });
    const data = await res.json();
    if (data.ok) {
      setShowNew(false);
      setNewSubj(''); setNewMsg(''); setNewPrio('normal');
      showToast('✅ Ticket creado — te notificaremos cuando haya respuesta');
      await loadTickets();
      openTicket(data.ticketId);
    } else {
      showToast('Error al crear ticket: ' + (data.error ?? 'desconocido'));
    }
    setCreating(false);
  };

  const unread = tickets.filter(t => t.unread_client).length;

  return (
    <div className="flex h-full gap-0 -m-6 md:-m-8" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-2xl text-sm font-medium shadow-xl animate-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      {/* ── Left: ticket list ── */}
      <div className="w-full md:w-[360px] flex-shrink-0 border-r border-white/5 flex flex-col bg-[#030307]">
        {/* Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-400" />
              <h1 className="font-bold text-white text-base">Mis Tickets</h1>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
              )}
            </div>
            <button onClick={() => loadTickets()} className="p-1.5 hover:bg-white/5 rounded-lg transition">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition"
          >
            <Plus className="w-4 h-4" /> Crear nuevo ticket
          </button>
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="w-5 h-5 text-purple-400 animate-spin" /></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
              <MessageSquare className="w-10 h-10 text-gray-700" />
              <p className="text-sm text-gray-500 font-medium">No tienes tickets aún</p>
              <p className="text-xs text-gray-700">Crea uno para contactar con soporte</p>
            </div>
          ) : (
            tickets.map(t => {
              const st = STATUS_STYLE[t.status] ?? STATUS_STYLE.open;
              const pr = PRIORITY_STYLE[t.priority] ?? PRIORITY_STYLE.normal;
              return (
                <button
                  key={t.id}
                  onClick={() => openTicket(t.id)}
                  className={`w-full text-left p-4 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${selected === t.id ? 'bg-purple-500/8 border-l-2 border-l-purple-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.unread_client && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1" />}
                      <p className="text-sm font-medium text-white truncate">{t.subject}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${st.cls}`}>
                      {st.icon} {st.label}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${pr.cls}`}>
                      {pr.label}
                    </span>
                    {/* SLA badge */}
                    {(() => {
                      const sla = getSLAStatus(t.created_at, t.status);
                      if (!sla || sla === 'ok') return null;
                      return (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${
                          sla === 'breach'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <Clock className="w-2.5 h-2.5" />
                          {sla === 'breach' ? 'SLA vencido' : `${formatElapsed(t.created_at)}`}
                        </span>
                      );
                    })()}
                    <span className="text-[10px] text-gray-600 ml-auto">{formatDate(t.updated_at)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: ticket detail ── */}
      <div className="flex-1 flex flex-col bg-[#050508]">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-10">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Sistema de Soporte</h3>
              <p className="text-gray-500 text-sm max-w-xs">Selecciona un ticket para ver el hilo completo o crea uno nuevo</p>
            </div>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition">
              <Plus className="w-4 h-4" /> Crear ticket
            </button>
          </div>
        ) : loadingDtl ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
        ) : (
          <>
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base">{ticketDetail?.subject}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {ticketDetail && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[ticketDetail.status]?.cls}`}>
                      {STATUS_STYLE[ticketDetail.status]?.icon} {STATUS_STYLE[ticketDetail.status]?.label}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">Creado {ticketDetail ? formatDate(ticketDetail.created_at) : ''}</span>
                  {/* SLA elapsed time in detail view */}
                  {ticketDetail && (() => {
                    const sla = getSLAStatus(ticketDetail.created_at, ticketDetail.status);
                    if (!sla) return (
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Resuelto en {formatElapsed(ticketDetail.created_at)}
                      </span>
                    );
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        sla === 'breach'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : sla === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {sla === 'breach' ? `SLA vencido — ${formatElapsed(ticketDetail.created_at)} sin respuesta` :
                         sla === 'warning' ? `Esperando ${formatElapsed(ticketDetail.created_at)}` :
                         `Abierto hace ${formatElapsed(ticketDetail.created_at)}`}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>


            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'client'
                      ? 'bg-purple-600/80 text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/8 text-gray-200 rounded-bl-sm'
                  }`}>
                    {m.role === 'agent' && (
                      <p className="text-[10px] font-bold text-purple-400 mb-1 uppercase tracking-widest">Soporte AIgenciaLab</p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                    <p className="text-[9px] mt-1.5 opacity-50 text-right">{formatDate(m.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>

            {/* Reply area */}
            {ticketDetail?.status !== 'closed' ? (
              <div className="p-4 border-t border-white/5 bg-[#030307]">
                <div className="flex gap-3">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Escribe tu respuesta… (Enter para enviar)"
                    rows={2}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/40 resize-none"
                  />
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl transition flex-shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-white/5 text-center text-xs text-gray-600 bg-[#030307]">
                Este ticket está cerrado. <button onClick={() => setShowNew(true)} className="text-purple-400 hover:underline">Crear nuevo ticket →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── New Ticket Modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="bg-[#0e0e18] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-xl">Crear nuevo ticket</h3>
              <button onClick={() => setShowNew(false)} className="p-2 hover:bg-white/5 rounded-xl transition text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block tracking-widest">Asunto *</label>
                <input
                  type="text"
                  value={newSubj}
                  onChange={e => setNewSubj(e.target.value)}
                  placeholder="Ej: No puedo instalar el widget en WordPress"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block tracking-widest">Prioridad</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'normal', 'high', 'urgent'] as TicketPriority[]).map(p => {
                    const pr = PRIORITY_STYLE[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setNewPrio(p)}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${newPriority === p ? pr.cls + ' ring-1 ring-current' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
                      >
                        {pr.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block tracking-widest">Descripción *</label>
                <textarea
                  rows={5}
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder="Describe el problema en detalle. Incluye pasos para reproducirlo si es posible."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-sm text-gray-400 hover:border-white/20 transition font-medium">
                Cancelar
              </button>
              <button
                onClick={createTicket}
                disabled={!newSubj.trim() || !newMsg.trim() || creating}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando…</> : <><Send className="w-4 h-4" /> Crear ticket</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

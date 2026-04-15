'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  ChevronRight,
  LifeBuoy,
  BookOpen,
  MessageCircle,
  Zap,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Send,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<TicketStatus, { label: string; cls: string }> = {
  open:        { label: 'Abierto',      cls: 'text-blue-400 border-blue-500/20' },
  in_progress: { label: 'En progreso',  cls: 'text-amber-400 border-amber-500/20' },
  resolved:    { label: 'Resuelto',     cls: 'text-emerald-400 border-emerald-500/20' },
  closed:      { label: 'Cerrado',      cls: 'text-slate-400 border-white/10' },
};

const PRIORITY_LABELS: Record<TicketPriority, { label: string; cls: string }> = {
  low:    { label: 'Baja',    cls: 'text-slate-400' },
  medium: { label: 'Media',   cls: 'text-blue-400' },
  high:   { label: 'Alta',    cls: 'text-amber-400' },
  urgent: { label: 'Urgente', cls: 'text-red-400' },
};

export default function SupportPage() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New ticket form state
  const [form, setForm] = useState({
    subject:     '',
    description: '',
    priority:    'medium' as TicketPriority,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/support/tickets', { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      const json = await res.json();
      setTickets(json.data ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setFormError('El asunto y la descripción son obligatorios.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? `Error ${res.status}`);
      }

      // Success
      setModalOpen(false);
      setForm({ subject: '', description: '', priority: 'medium' });
      setSuccessMsg('¡Ticket creado! Te responderemos en menos de 24 horas.');
      await fetchTickets();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      setFormError(e.message ?? 'Error al crear ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCount     = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Soporte</h1>
          <p className="text-[var(--muted)]">
            {loading ? 'Cargando...' : `${openCount} abiertos · ${resolvedCount} resueltos`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTickets}
            title="Actualizar"
            className="p-3 bg-white/5 hover:bg-white/10 text-[var(--muted)] hover:text-white rounded-xl transition-all border border-white/5"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="open-ticket-btn"
            onClick={() => { setModalOpen(true); setFormError(null); }}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" /> Abrir Ticket
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Support channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[32px] border border-[var(--border)] bg-gradient-to-br from-blue-600/5 to-transparent flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-xl shadow-blue-500/5">
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Chat en Vivo</h3>
          <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mb-6">Promedio: 5 min</p>
          <button
            id="live-chat-btn"
            onClick={() => setModalOpen(true)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest"
          >
            Iniciar Chat
          </button>
        </div>
        <div className="glass p-8 rounded-[32px] border border-[var(--border)] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
            <BookOpen className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Base de Conocimiento</h3>
          <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mb-6">+50 Artículos</p>
          <a
            id="docs-btn"
            href="https://aigencialab.cl/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest block"
          >
            Ver Documentación
          </a>
        </div>
        <div className="glass p-8 rounded-[32px] border border-[var(--border)] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
            <LifeBuoy className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">AIgenciaLab Academy</h3>
          <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mb-6">Video Tutoriales</p>
          <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">
            Explorar Cursos
          </button>
        </div>
      </div>

      {/* Tickets list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[40px] border border-[var(--border)] p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Clock className="text-blue-400" /> Mis Tickets Recientes
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar ticket..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-red-400 font-semibold">{error}</p>
              <button
                onClick={fetchTickets}
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reintentar
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredTickets.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <MessageSquare className="w-12 h-12 text-[var(--muted)]" />
              <p className="text-white font-semibold">
                {tickets.length === 0 ? 'Aún no tienes tickets' : 'Sin resultados para tu búsqueda'}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {tickets.length === 0 ? 'Crea un ticket y te responderemos en menos de 24 horas.' : 'Intenta con otras palabras clave.'}
              </p>
              {tickets.length === 0 && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Abrir primer ticket
                </button>
              )}
            </div>
          )}

          {/* Ticket list */}
          {!loading && !error && filteredTickets.length > 0 && (
            <div className="space-y-4">
              {filteredTickets.map(t => {
                const s = STATUS_LABELS[t.status];
                const p = PRIORITY_LABELS[t.priority];
                return (
                  <div
                    key={t.id}
                    className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="p-3 rounded-2xl bg-[var(--bg3)] text-[var(--muted)] group-hover:text-blue-400 transition-colors">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                            #{t.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase ${s.cls}`}>
                            {s.label}
                          </span>
                          <span className={`text-[8px] font-bold uppercase ${p.cls}`}>
                            {p.label}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-400 mb-1">
                          {t.subject}
                        </h4>
                        <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">
                          {new Date(t.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {t.response && ' · Respuesta recibida ✓'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[var(--muted)] group-hover:text-white transition-all" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="glass rounded-[40px] p-8 border border-[var(--border)] bg-gradient-to-t from-blue-600/5 to-transparent flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
            <Zap className="w-6 h-6 text-blue-500" />
          </div>
          <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-tighter max-w-[150px]">
            Soporte Enterprise 24/7
          </h4>
          <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-8 leading-relaxed">
            Respuesta garantizada en menos de 15 minutos para clientes de nivel corporativo.
          </p>
          <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all">
            UPGRADE A ENTERPRISE
          </button>
        </div>
      </div>

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] shadow-2xl">
            <button
              onClick={() => { setModalOpen(false); setFormError(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo Ticket de Soporte</h2>
                  <p className="text-slate-400 text-sm">Te responderemos en menos de 24 horas</p>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">
                    Asunto *
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Ej: Error al cargar el widget"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">
                    Prioridad
                  </label>
                  <select
                    id="ticket-priority"
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="low">Baja — Consulta general</option>
                    <option value="medium">Media — Problema menor</option>
                    <option value="high">Alta — Afecta mi operación</option>
                    <option value="urgent">Urgente — Sistema caído</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">
                    Descripción detallada *
                  </label>
                  <textarea
                    id="ticket-description"
                    required
                    rows={5}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el problema con la mayor cantidad de detalles posible: pasos para reproducirlo, mensajes de error, comportamiento esperado vs actual..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed placeholder-slate-600"
                    maxLength={5000}
                  />
                  <p className="text-right text-[10px] text-slate-600 mt-1">{form.description.length}/5000</p>
                </div>
              </div>

              <button
                id="submit-ticket-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  : <><Send className="w-5 h-5" /> Enviar Ticket</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

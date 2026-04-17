'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket, Clock, CheckCircle, AlertCircle, MessageSquare,
  ChevronDown, ChevronUp, RefreshCw, Send, Filter,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TicketItem = {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  admin_response: string | null;
  client?: { email: string; company_name: string; company: string };
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En proceso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

const STATUS_COLORS: Record<string, string> = {
  open:        'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed:      'bg-slate-50 text-slate-600 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-50 text-slate-500 border-slate-200',
  medium: 'bg-blue-50 text-blue-600 border-blue-200',
  high:   'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [responding, setResponding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const res = await fetch('/api/v2/tickets', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setTickets(data.tickets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpdateStatus(id: string, status: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`/api/v2/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function handleRespond(id: string) {
    const text = responseText[id]?.trim();
    if (!text) return;
    setResponding(id);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setResponding(null); return; }
    await fetch(`/api/v2/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ admin_response: text, status: 'resolved' }),
    });
    setResponseText(p => ({ ...p, [id]: '' }));
    setResponding(null);
    await load();
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const counts = {
    all:         tickets.length,
    open:        tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved:    tickets.filter(t => t.status === 'resolved').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets de Soporte</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona los tickets de tus clientes</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 border border-slate-200 bg-white px-3 py-2 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'open', 'in_progress', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
          >
            {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-slate-100'}`}>
              {counts[f as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
          No hay tickets {filter !== 'all' ? `con estado "${STATUS_LABELS[filter]}"` : ''}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div
                className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ticket.status === 'open' ? 'bg-amber-50' :
                  ticket.status === 'resolved' ? 'bg-emerald-50' : 'bg-blue-50'
                }`}>
                  {ticket.status === 'resolved' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : ticket.status === 'open' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-500" />
                  )}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-slate-900 text-sm">{ticket.subject}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[ticket.status]}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[ticket.priority]}`}>
                      {PRIORITY_LABELS[ticket.priority]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {ticket.client?.company_name || ticket.client?.company || ticket.client?.email || 'Cliente'}
                    {' · '}
                    {new Date(ticket.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Expand */}
                {expanded === ticket.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                )}
              </div>

              {/* Expanded content */}
              {expanded === ticket.id && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                  {/* Client message */}
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1.5">MENSAJE DEL CLIENTE</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed">
                      {ticket.message}
                    </div>
                  </div>

                  {/* Admin response (if exists) */}
                  {ticket.admin_response && (
                    <div>
                      <div className="text-xs font-semibold text-emerald-600 mb-1.5">TU RESPUESTA</div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 leading-relaxed">
                        {ticket.admin_response}
                      </div>
                    </div>
                  )}

                  {/* Response form */}
                  {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1.5">RESPONDER AL CLIENTE</div>
                      <textarea
                        rows={3}
                        value={responseText[ticket.id] ?? ''}
                        onChange={e => setResponseText(p => ({ ...p, [ticket.id]: e.target.value }))}
                        placeholder="Escribe tu respuesta aquí... Se enviará por email al cliente."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRespond(ticket.id)}
                          disabled={!responseText[ticket.id]?.trim() || responding === ticket.id}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {responding === ticket.id ? 'Enviando...' : 'Responder y resolver'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                          className="text-sm text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg transition-all"
                        >
                          Marcar en proceso
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                          className="text-sm text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg transition-all"
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp CTA if we have phone */}
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={`mailto:${ticket.client?.email}`}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Email directo
                    </a>
                    <span className="text-xs text-slate-400 font-mono">{ticket.id}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket, MessageSquare, Check, Clock, AlertCircle, Plus, Send, X, ChevronDown, ChevronUp,
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
  admin_response: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto', in_progress: 'En proceso', resolved: 'Resuelto', closed: 'Cerrado',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function ClientSupportPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmitting(false); return; }
    const res = await fetch('/api/v2/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Error al crear ticket'); setSubmitting(false); return; }
    setForm({ subject: '', message: '', priority: 'medium' });
    setShowForm(false);
    setSubmitting(false);
    await load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Soporte</h1>
          <p className="text-slate-500 text-sm mt-0.5">Envía tickets y sigue el estado de tus solicitudes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancelar' : 'Nuevo ticket'}
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4">Crear nuevo ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Asunto *</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe brevemente el problema"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Descripción *</label>
              <textarea
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Explica el problema en detalle. Mientras más información, más rápido podemos ayudarte."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">Prioridad</label>
              <div className="flex gap-2">
                {[['low', 'Baja'], ['medium', 'Media'], ['high', 'Alta'], ['urgent', 'Urgente']].map(([val, label]) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setForm(p => ({ ...p, priority: val }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      form.priority === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</div>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Enviando...' : 'Enviar ticket'}
            </button>
          </form>
        </div>
      )}

      {/* WhatsApp fallback */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-semibold text-emerald-900">¿Necesitas ayuda urgente?</span>
          <span className="text-emerald-700"> Escríbenos directamente por WhatsApp y te responderemos en minutos.</span>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56991234567'}`}

          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
        >
          WhatsApp →
        </a>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Cargando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <div className="text-slate-500 font-medium">No tienes tickets abiertos</div>
          <div className="text-slate-400 text-sm mt-1">¿Necesitas ayuda? Crea un nuevo ticket arriba.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div
                className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ticket.status === 'resolved' ? 'bg-emerald-50' :
                  ticket.status === 'open' ? 'bg-amber-50' : 'bg-blue-50'
                }`}>
                  {ticket.status === 'resolved' ? <Check className="w-4 h-4 text-emerald-500" /> :
                   ticket.status === 'open' ? <AlertCircle className="w-4 h-4 text-amber-500" /> :
                   <Clock className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{ticket.subject}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[ticket.status]}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                    {ticket.admin_response && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">
                        ← Con respuesta
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {new Date(ticket.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {expanded === ticket.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {expanded === ticket.id && (
                <div className="px-5 pb-4 border-t border-slate-100 pt-4 space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed">
                    {ticket.message}
                  </div>
                  {ticket.admin_response && (
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-1.5">RESPUESTA DEL EQUIPO AIgenciaLab</div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 leading-relaxed">
                        {ticket.admin_response}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

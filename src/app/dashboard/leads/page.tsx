'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Bot
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Lead status config
const STATUSES = [
  { key: 'new',        label: 'Nuevo',      color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  { key: 'contacted',  label: 'Contactado', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  { key: 'qualified',  label: 'Calificado', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  { key: 'closed',     label: 'Cerrado',    color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' }
];

function statusBadge(status: string) {
  const s = STATUSES.find(x => x.key === status) ?? STATUSES[0];
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${s.color}`}>{s.label}</span>;
}

export default function LeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, any[]>>({});
  const [loadingConvs, setLoadingConvs] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    let query = supabase
      .from('leads')
      .select('id, contact_name, email, status, created_at, summary, source')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`contact_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    if (data) setLeads(data);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleToggleExpand = async (leadId: string) => {
    if (expandedId === leadId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(leadId);

    if (conversations[leadId]) return; // already loaded

    setLoadingConvs(leadId);
    const { data } = await supabase
      .from('conversations')
      .select('id, role, content, created_at')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });

    setConversations(prev => ({ ...prev, [leadId]: data || [] }));
    setLoadingConvs(null);
  };

  // FASE 2: status change persists to DB
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId);
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    }
    setUpdatingStatus(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Leads Capturados</h1>
          <p className="text-muted-foreground text-sm mt-1">Historial de contactos e hilo de conversaciones.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-border flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full bg-secondary border border-border rounded-xl py-2 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            className="bg-secondary border border-border rounded-xl py-2 px-4 text-foreground focus:outline-none text-sm font-medium"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="glass rounded-2xl border border-border p-12 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay leads todavía.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Los contactos aparecerán aquí cuando tu bot capture datos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => {
            const isExpanded = expandedId === lead.id;
            const convs = conversations[lead.id] || [];
            const lastMsg = lead.summary || (convs.length > 0 ? convs[convs.length - 1]?.content?.slice(0, 60) + '…' : 'Sin mensajes');

            return (
              <div key={lead.id} className="glass rounded-2xl border border-border overflow-hidden">
                {/* Row */}
                <div
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => handleToggleExpand(lead.id)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold uppercase text-sm">
                    {lead.contact_name?.charAt(0) || '?'}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{lead.contact_name || 'Sin nombre'}</span>
                      {statusBadge(lead.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{lead.email || '—'}</p>
                    <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{lastMsg}</p>
                  </div>

                  {/* Status dropdown — stops row click from propagating */}
                  <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      disabled={updatingStatus === lead.id}
                      onChange={e => handleStatusChange(lead.id, e.target.value)}
                      className="bg-secondary border border-border rounded-xl py-1.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="flex-shrink-0 text-[10px] text-muted-foreground hidden sm:block">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString('es-CL')}
                    </div>
                  </div>

                  {/* Expand arrow */}
                  <div className="flex-shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* ── Inline conversation thread ─────────────────────── */}
                {isExpanded && (
                  <div className="border-t border-border bg-slate-950/40 px-4 pb-4 pt-4 max-h-80 overflow-y-auto">
                    {loadingConvs === lead.id ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    ) : convs.length === 0 ? (
                      <div className="text-center py-6">
                        <MessageSquare className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Sin mensajes registrados aún.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {convs.map((msg: any) => {
                          const isBot = msg.role === 'assistant';
                          return (
                            <div key={msg.id} className={`flex gap-2.5 ${isBot ? '' : 'flex-row-reverse'}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                                isBot ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white'
                              }`}>
                                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-3.5 h-3.5" />}
                              </div>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                isBot
                                  ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                                  : 'bg-primary/20 text-primary-foreground rounded-tr-sm'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

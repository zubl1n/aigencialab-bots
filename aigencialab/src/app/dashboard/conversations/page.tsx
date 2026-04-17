'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  MessageSquare,
  User,
  Bot,
  Clock,
  ArrowUpRight,
  Loader2,
  ChevronRight,
  Headphones,
  Calendar,
  Zap,
  X,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

type ConvStatus = 'open' | 'resolved' | 'needs_human';
type ConvChannel = 'whatsapp' | 'web' | 'email';
type FilterTab = 'all' | 'open' | 'resolved' | 'needs_human';

interface Conversation {
  id: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  status: ConvStatus;
  channel: ConvChannel;
  created_at: string;
  updated_at: string;
  messages_count: number;
  duration_min: number;
  is_lead: boolean;
  lead_id: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'bot';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
  lead: { id: string; contact_name: string; status: string } | null;
}

const STATUS_LABELS: Record<ConvStatus, { label: string; cls: string }> = {
  open:         { label: 'Abierta',       cls: 'text-blue-500 border-blue-500/20 bg-blue-500/5' },
  resolved:     { label: 'Resuelta',      cls: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' },
  needs_human:  { label: 'Escala humano', cls: 'text-orange-500 border-orange-500/20 bg-orange-500/5' },
};

const CHANNEL_LABELS: Record<ConvChannel, string> = {
  whatsapp: '💬 WhatsApp',
  web:      '🌐 Web',
  email:    '✉️ Email',
};

export default function ClientConversationsPage() {
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filter, setFilter]                 = useState<FilterTab>('all');
  const [selectedConv, setSelectedConv]     = useState<Conversation | null>(null);
  const [detail, setDetail]                 = useState<ConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const messagesEndRef                      = useRef<HTMLDivElement>(null);

  // ── Fetch conversations from real API ─────────────────────
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (searchTerm)        params.set('q', searchTerm);
    params.set('limit', '50');

    const res  = await fetch(`/api/conversations?${params.toString()}`);
    const data = await res.json();
    setConversations(data.conversations ?? []);
    setLoading(false);
  }, [filter, searchTerm]);

  useEffect(() => {
    const t = setTimeout(fetchConversations, 250); // debounce search
    return () => clearTimeout(t);
  }, [fetchConversations]);

  // ── Fetch conversation detail + real messages ─────────────
  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingDetail(true);
    setDetail(null);

    const res  = await fetch(`/api/conversations/${conv.id}/messages`);
    const data = await res.json();
    setDetail(data);
    setLoadingDetail(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Historial de Conversaciones</h1>
          <p className="text-[var(--muted)]">Interacciones reales entre tu agente IA y tus clientes.</p>
        </div>
        <button
          onClick={fetchConversations}
          className="p-2 hover:bg-white/5 rounded-xl transition text-[var(--muted)] hover:text-white"
          title="Refrescar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden min-h-0">

        {/* ─── List Panel ──────────────────────── */}
        <div className="w-1/3 flex flex-col gap-3 overflow-hidden">

          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full bg-[var(--bg2)] border border-[var(--border)] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="shrink-0 flex bg-[var(--bg3)] p-1 rounded-xl border border-[var(--border)] overflow-hidden gap-1">
            {(['all', 'open', 'resolved', 'needs_human'] as FilterTab[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                  filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'text-[var(--muted)] hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'open' ? 'Abiertas' : f === 'resolved' ? 'Resueltas' : 'Escala 👤'}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {loading ? (
              <div className="p-12 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay conversaciones{filter !== 'all' ? ' con ese filtro' : ''}</p>
              </div>
            ) : conversations.map(conv => {
              const st = STATUS_LABELS[conv.status] ?? STATUS_LABELS.open;
              return (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`glass p-5 rounded-[24px] border transition-all cursor-pointer group ${selectedConv?.id === conv.id ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5' : 'border-[var(--border)] hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedConv?.id === conv.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-[var(--muted)]'}`}>
                        {conv.contact_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                          {conv.contact_name || 'Incógnito'}
                        </h3>
                        <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">
                          {format(new Date(conv.created_at), 'HH:mm • dd MMM')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-bold">
                      <MessageSquare className="w-3 h-3" /> {conv.messages_count} msgs
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-bold">
                      <Clock className="w-3 h-3" /> {conv.duration_min} min
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[var(--muted)] font-bold ml-auto">
                      {CHANNEL_LABELS[conv.channel] ?? conv.channel}
                    </div>
                    {conv.is_lead && (
                      <div className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">Lead</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Detail Panel ─────────────────────── */}
        <div className="flex-1 glass rounded-[40px] border border-[var(--border)] flex flex-col overflow-hidden relative shadow-2xl">
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mb-8 border border-blue-500/10">
                <MessageSquare className="w-10 h-10 text-blue-500/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-tight">Selecciona una conversación</h3>
              <p className="text-[var(--muted)] max-w-sm font-medium leading-relaxed">
                Haz clic en cualquier conversación de la lista lateral para ver la transcripción completa.
              </p>
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xl shadow-blue-500/20">
                    {selectedConv.contact_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{selectedConv.contact_name || 'Sin nombre'}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-400" /> {CHANNEL_LABELS[selectedConv.channel] ?? selectedConv.channel}
                      </span>
                      <span className="text-[var(--border)] text-xs">•</span>
                      <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(selectedConv.created_at), 'PPP', { locale: es })}
                      </span>
                      {selectedConv.contact_email && (
                        <>
                          <span className="text-[var(--border)] text-xs">•</span>
                          <span className="text-xs text-[var(--muted)]">{selectedConv.contact_email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedConv(null); setDetail(null); }} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gradient-to-b from-transparent to-black/20">
                {(detail?.messages ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <MessageSquare className="w-8 h-8 text-gray-700" />
                    <p className="text-sm text-gray-500">No hay mensajes en esta conversación</p>
                  </div>
                ) : (
                  detail?.messages.map(m => {
                    const isBot = m.role === 'assistant' || m.role === 'bot';
                    return (
                      <div key={m.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-[var(--muted)] uppercase tracking-widest">
                          {isBot ? <><Bot className="w-3 h-3 text-blue-400" /> Asistente IA</> : <><User className="w-3 h-3" /> {selectedConv.contact_name || 'Usuario'}</>}
                        </div>
                        <div className={`max-w-[70%] p-5 rounded-[24px] text-sm leading-relaxed shadow-xl ${
                          isBot
                            ? 'bg-blue-600/10 border border-blue-500/10 text-blue-100 rounded-tl-sm'
                            : 'bg-white/5 border border-white/10 text-white rounded-tr-sm'
                        }`}>
                          {m.content}
                        </div>
                        <span className="text-[9px] font-bold text-[var(--muted)] mt-2 uppercase tracking-tighter opacity-50">
                          {format(new Date(m.created_at), 'HH:mm')}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* needs_human banner */}
                {selectedConv.status === 'needs_human' && (
                  <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                    <Headphones className="w-5 h-5 text-orange-500" />
                    <p className="text-xs text-orange-200 font-bold uppercase tracking-widest">El cliente ha solicitado atención humana</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-[var(--border)] bg-white/[0.04] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Estado</span>
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${STATUS_LABELS[selectedConv.status]?.cls ?? ''}`}>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {STATUS_LABELS[selectedConv.status]?.label ?? selectedConv.status}
                  </span>
                </div>
                {detail?.lead && (
                  <Link
                    href={`/dashboard/leads?id=${detail.lead.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--bg3)] text-white border border-[var(--border)] rounded-2xl font-bold text-sm hover:bg-[var(--bg2)] transition-all"
                  >
                    Ver Lead Relacionado <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

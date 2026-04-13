'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  MessageSquare, 
  User, 
  Bot, 
  Clock, 
  ArrowUpRight, 
  Filter, 
  Loader2,
  ChevronRight,
  Headphones,
  Calendar,
  Zap,
  MoreVertical,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Conversation {
  id: string;
  contact_name: string;
  status: 'open' | 'resolved' | 'needs_human';
  channel: 'whatsapp' | 'web' | 'email';
  created_at: string;
  messages_count?: number;
  duration_min?: number;
  is_lead?: boolean;
}

export default function ClientConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const supabase = createClient();

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('conversations')
      .select('*')
      .eq('client_id', user.id);

    if (searchTerm) {
      query = query.or(`contact_name.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error) {
       // Enrich with mock counts if not in DB
       const enriched = (data as Conversation[]).map(c => ({
          ...c,
          messages_count: Math.floor(Math.random() * 20) + 2,
          duration_min: Math.floor(Math.random() * 15) + 1,
          is_lead: Math.random() > 0.5
       }));
       setConversations(enriched);
    }
    setLoading(false);
  }, [searchTerm, supabase]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Historial de Conversaciones</h1>
          <p className="text-[var(--muted)]">Explora las interacciones entre tu bot y tus clientes.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-[var(--bg3)] p-1 rounded-xl border border-[var(--border)] overflow-hidden">
              <button className="px-4 py-1.5 text-xs font-bold text-blue-400 bg-blue-400/10 rounded-lg border border-blue-400/20">Todas</button>
              <button className="px-4 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-white transition-colors">Abiertas</button>
              <button className="px-4 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-white transition-colors">Resueltas</button>
           </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden min-h-0">
         {/* List View */}
         <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
            <div className="relative shrink-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
               <input 
                 type="text" 
                 placeholder="Buscar por nombre..." 
                 className="w-full bg-[var(--bg2)] border border-[var(--border)] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all shadow-xl"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
               {loading ? (
                 <div className="p-12 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></div>
               ) : conversations.map((conv) => (
                 <div 
                   key={conv.id} 
                   onClick={() => setSelectedConv(conv)}
                   className={`glass p-5 rounded-[24px] border transition-all cursor-pointer group ${selectedConv?.id === conv.id ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5' : 'border-[var(--border)] hover:border-white/20'}`}
                 >
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${selectedConv?.id === conv.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-[var(--muted)]'}`}>
                             {conv.contact_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                          </div>
                          <div>
                             <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{conv.contact_name || 'Incógnito'}</h3>
                             <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">{format(new Date(conv.created_at), 'HH:mm • dd MMM')}</p>
                          </div>
                       </div>
                       <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase ${
                         conv.status === 'resolved' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                         conv.status === 'needs_human' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 
                         'text-blue-500 border-blue-500/20 bg-blue-500/5'
                       }`}>
                          {conv.status.replace('_', ' ')}
                       </span>
                    </div>
                    <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                       <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-bold">
                          <MessageSquare className="w-3 h-3" /> {conv.messages_count} msgs
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-bold">
                          <Clock className="w-3 h-3" /> {conv.duration_min} min
                       </div>
                       {conv.is_lead && (
                         <div className="ml-auto text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">Lead</div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Chat Detail View */}
         <div className="flex-1 glass rounded-[40px] border border-[var(--border)] flex flex-col overflow-hidden relative shadow-2xl">
            {selectedConv ? (
               <>
                 {/* Detail Header */}
                 <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xl shadow-blue-500/20">
                          {selectedConv.contact_name?.charAt(0).toUpperCase() || 'U'}
                       </div>
                       <div>
                          <h2 className="text-xl font-bold text-white uppercase tracking-tight">{selectedConv.contact_name || 'Conversación sin nombre'}</h2>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-xs text-[var(--muted)] flex items-center gap-1"><Zap className="w-3 h-3 text-blue-400" /> Vía Web Widget</span>
                             <span className="text-[var(--border)] text-xs">•</span>
                             <span className="text-xs text-[var(--muted)] flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(selectedConv.created_at), 'PPP', { locale: es })}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-3 bg-[var(--bg3)] border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-2xl transition-all"><MoreVertical className="w-5 h-5" /></button>
                       <button onClick={() => setSelectedConv(null)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
                    </div>
                 </div>

                 {/* Messages Area */}
                 <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gradient-to-b from-transparent to-black/20">
                    <ChatBubble type="bot" text="¡Hola! ¿En qué puedo ayudarte hoy?" time="10:00" />
                    <ChatBubble type="user" text="Hola, busco información sobre sus planes de hosting." time="10:01" />
                    <ChatBubble type="bot" text="¡Excelente! Contamos con planes desde los $10.000 mensuales. ¿Te gustaría que te envíe un PDF con la comparativa?" time="10:01" />
                    <ChatBubble type="user" text="Sí, por favor. Mi correo es juan.perez@empresa.com" time="10:02" />
                    <ChatBubble type="bot" text="Perfecto Juan. He enviado la información a tu correo. ¿Hay algo más en lo que pueda asistirte?" time="10:02" />
                    {selectedConv.status === 'needs_human' && (
                       <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                          <Headphones className="w-5 h-5 text-orange-500" />
                          <p className="text-xs text-orange-200 font-bold uppercase tracking-widest">El cliente ha solicitado un agente humano</p>
                       </div>
                    )}
                 </div>

                 {/* Actions Footer */}
                 <div className="p-6 border-t border-[var(--border)] bg-white/[0.04] flex items-center justify-between">
                    <div className="flex gap-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">Resultado de IA</span>
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                             <Zap className="w-3.5 h-3.5 fill-current" /> Lead Capturado Exitosamente
                          </span>
                       </div>
                    </div>
                    <button className="flex items-center gap-2 px-8 py-3 bg-[var(--bg3)] text-white border border-[var(--border)] rounded-2xl font-bold text-sm hover:bg-[var(--bg2)] transition-all">
                       Ver Lead Relacionado <ArrowUpRight className="w-4 h-4" />
                    </button>
                 </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mb-8 border border-blue-500/10">
                     <MessageSquare className="w-10 h-10 text-blue-500/40" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-tight">Selecciona una conversación</h3>
                  <p className="text-[var(--muted)] max-w-sm font-medium leading-relaxed">
                    Haz clic en cualquier interacción de la lista lateral para ver la transcripción completa y las métricas de IA.
                  </p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function ChatBubble({ type, text, time }: { type: 'bot' | 'user', text: string, time: string }) {
  return (
    <div className={`flex flex-col ${type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
       <div className="flex items-center gap-2 mb-2 font-bold text-[10px] text-[var(--muted)] uppercase tracking-widest">
          {type === 'bot' ? <><Bot className="w-3 h-3 text-blue-400" /> Asistente IA</> : <><User className="w-3 h-3" /> Usuario</>}
       </div>
       <div className={`max-w-[70%] p-5 rounded-[24px] text-sm leading-relaxed shadow-xl ${
         type === 'user' 
         ? 'bg-white/5 border border-white/10 text-white rounded-tr-sm' 
         : 'bg-blue-600/10 border border-blue-500/10 text-blue-100 rounded-tl-sm'
       }`}>
          {text}
       </div>
       <span className="text-[9px] font-bold text-[var(--muted)] mt-2 uppercase tracking-tighter opacity-50">{time}</span>
    </div>
  );
}

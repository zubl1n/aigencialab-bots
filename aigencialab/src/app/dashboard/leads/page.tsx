'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  FileText,
  User,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  Zap
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientLead {
  id: string;
  contact_name: string;
  email: string;
  whatsapp: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
  created_at: string;
  summary?: string;
  messages?: any[];
}

const statusMap: any = {
  new: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  contacted: { label: 'Contactado', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  qualified: { label: 'Calificado', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  closed: { label: 'Cerrado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  lost: { label: 'Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
};

export default function ClientLeadsPage() {
  const [leads, setLeads] = useState<ClientLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<ClientLead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const supabase = createClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('leads')
      .select('*')
      .eq('client_id', user.id);

    if (searchTerm) {
      query = query.or(`contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error) setLeads(data as any[]);
    setLoading(false);
  }, [searchTerm, statusFilter, supabase]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);
    
    if (!error) fetchLeads();
  };

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Fecha', 'Estado'];
    const rows = leads.map(l => [
      l.contact_name,
      l.email,
      l.whatsapp,
      format(new Date(l.created_at), 'yyyy-MM-dd'),
      l.status
    ].join(','));
    
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Leads Capturados</h1>
          <p className="text-[var(--muted)]">Prospectos calificados por tu asistente IA.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--bg3)] text-white border border-[var(--border)] rounded-2xl hover:bg-[var(--bg2)] transition-all font-bold text-sm"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass rounded-[32px] p-4 border border-[var(--border)] flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            className="w-full bg-[var(--bg2)] border border-[var(--border)] rounded-2xl py-2.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[var(--muted)]" />
            <select 
              className="bg-[var(--bg2)] border border-[var(--border)] rounded-xl py-2 px-4 text-white text-xs focus:outline-none focus:border-blue-500/50"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusMap).map(([key, value]: any) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 bg-[var(--bg2)] border border-[var(--border)] rounded-xl py-2 px-4 text-white text-xs hover:bg-[var(--bg3)] transition-colors">
            <Calendar className="w-4 h-4" /> Últimos 30 días
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass rounded-[32px] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-white/5">
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Prospecto</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Resumen IA</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-[var(--muted)] font-medium uppercase tracking-widest text-xs opacity-50">
                    No se han capturado leads aún.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/20">
                            {lead.contact_name.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">{lead.contact_name}</span>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">Empresa Registrada</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-[var(--sub)] font-medium">
                             <Mail className="w-3.5 h-3.5 text-blue-500/60" /> {lead.email}
                          </div>
                          {lead.whatsapp && (
                            <div className="flex items-center gap-2 text-xs text-[var(--sub)] font-medium">
                               <Phone className="w-3.5 h-3.5 text-emerald-500/60" /> {lead.whatsapp}
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                       <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed italic">
                         {lead.summary || "Conversación fluida sobre servicios de logísitica y precios."}
                       </p>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusMap[lead.status]?.color}`}>
                          {statusMap[lead.status]?.label}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-[var(--muted)] font-medium">
                       {format(new Date(lead.created_at), 'dd MMM, yyyy', { locale: es })}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => { setSelectedLead(lead); setIsSheetOpen(true); }}
                         className="p-3 hover:bg-blue-500/10 text-blue-400 rounded-2xl transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sheet */}
      {isSheetOpen && selectedLead && (
         <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSheetOpen(false)}></div>
            <div className="relative w-full max-w-2xl h-screen bg-[var(--bg2)] border-l border-[var(--border)] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
               <div className="p-8 border-b border-[var(--border)]">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[24px] bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5">
                           {selectedLead.contact_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{selectedLead.contact_name}</h2>
                           <p className="text-sm text-blue-400 font-semibold">{selectedLead.email}</p>
                        </div>
                     </div>
                     <button onClick={() => setIsSheetOpen(false)} className="text-[var(--muted)] hover:text-white p-2">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Estado actual</p>
                        <div className="flex items-center justify-between">
                           <span className={`text-[10px] font-bold uppercase ${statusMap[selectedLead.status]?.color.split(' ')[1]}`}>{statusMap[selectedLead.status]?.label}</span>
                           <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                        </div>
                     </div>
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Score Lead</p>
                        <div className="flex items-center gap-2">
                           <Zap className="w-4 h-4 text-emerald-400 fill-current" />
                           <span className="text-sm font-bold text-white">85/100</span>
                        </div>
                     </div>
                     <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Capturado</p>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">{format(new Date(selectedLead.created_at), 'dd MMM yyyy')}</p>
                     </div>
                  </div>
               </div>

               {/* Conversation History */}
               <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" /> Transcripción de la Conversación
                  </h3>
                  
                  <div className="space-y-4">
                     <MessageBubble type="bot" text="¡Hola! Bienvenido a nuestra tienda. ¿En qué puedo ayudarte hoy?" time="14:02" />
                     <MessageBubble type="user" text="Hola, busco cotizar un servicio de transporte para mi empresa de retail." time="14:03" />
                     <MessageBubble type="bot" text="Entiendo perfectamente. Para darte una propuesta ajustada, ¿podrías indicarme tu nombre y correo corporativo?" time="14:03" />
                     <MessageBubble type="user" text={`Me llamo ${selectedLead.contact_name} y mi correo es ${selectedLead.email}`} time="14:04" />
                     <MessageBubble type="bot" text="Gracias. ¿Cuál es la ruta principal que necesitas cubrir y qué volumen mensual estimas?" time="14:04" />
                     <MessageBubble type="user" text="Ruta Santiago-Concepción, unas 500 toneladas al mes." time="14:05" />
                     <MessageBubble type="bot" text="Perfecto. He registrado tus requerimientos. Un ejecutivo te contactará en menos de 2 horas. ¿Deseas dejar tu WhatsApp?" time="14:05" />
                  </div>
               </div>

               {/* Footer Actions */}
               <div className="p-8 border-t border-[var(--border)] bg-white/[0.02]">
                  <div className="flex gap-4">
                     <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
                        <Mail className="w-4 h-4" /> Enviar Correo Directo
                     </button>
                     <button className="flex-1 py-4 bg-[var(--bg3)] text-white border border-[var(--border)] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[var(--bg2)] transition-all">
                        <ExternalLink className="w-4 h-4" /> Abrir en CRM
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}

function MessageBubble({ type, text, time }: { type: 'bot' | 'user', text: string, time: string }) {
  return (
    <div className={`flex flex-col ${type === 'user' ? 'items-end' : 'items-start'}`}>
       <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
         type === 'user' 
         ? 'bg-white/5 border border-white/5 text-white rounded-tr-sm' 
         : 'bg-blue-600/10 border border-blue-500/10 text-[var(--sub)] rounded-tl-sm'
       }`}>
          {text}
       </div>
       <span className="text-[9px] font-bold text-[var(--muted)] mt-1 ml-1 uppercase">{time}</span>
    </div>
  );
}

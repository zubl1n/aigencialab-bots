'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  LifeBuoy, 
  BookOpen, 
  MessageCircle,
  ChevronRight,
  Zap,
  Loader2
} from 'lucide-react';

export default function SupportPage() {
  const tickets = [
    { id: 'TKT-1021', subject: 'Error al cargar el widget en Safari', status: 'En progreso', priority: 'Alta', date: 'Hace 2 horas' },
    { id: 'TKT-1018', subject: 'Consulta sobre integración CRM', status: 'Resuelto', priority: 'Baja', date: 'Ayer' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Soporte</h1>
          <p className="text-[var(--muted)]">Estamos aquí para ayudarte a escalar tu negocio con IA.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20">
           <Plus className="w-5 h-5" /> Abrir Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass p-8 rounded-[32px] border border-[var(--border)] bg-gradient-to-br from-blue-600/5 to-transparent flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-xl shadow-blue-500/5">
               <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Chat en Vivo</h3>
            <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mb-6">Promedio: 5 min</p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">Iniciar Chat</button>
         </div>
         <div className="glass p-8 rounded-[32px] border border-[var(--border)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
               <BookOpen className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">Base de Conocimiento</h3>
            <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mb-6">+50 Artículos</p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">Ver Documentación</button>
         </div>
         <div className="glass p-8 rounded-[32px] border border-[var(--border)] flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
               <LifeBuoy className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">AIgenciaLab Academy</h3>
            <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest mb-6">Video Tutoriales</p>
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">Explorar Cursos</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 glass rounded-[40px] border border-[var(--border)] p-10">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-bold text-white flex items-center gap-3"><Clock className="text-blue-400" /> Mis Tickets Recientes</h3>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input type="text" placeholder="Buscar ticket..." className="bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none" />
               </div>
            </div>

            <div className="space-y-4">
               {tickets.map((t) => (
                  <div key={t.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all flex items-center justify-between group cursor-pointer">
                     <div className="flex items-center gap-6">
                        <div className="p-3 rounded-2xl bg-[var(--bg3)] text-[var(--muted)] group-hover:text-blue-400 transition-colors">
                           <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{t.id}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase ${t.status === 'Resuelto' ? 'text-emerald-500 border-emerald-500/20' : 'text-orange-500 border-orange-500/20'}`}>{t.status}</span>
                           </div>
                           <h4 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-blue-400 mb-1">{t.subject}</h4>
                           <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">Última actividad: {t.date}</p>
                        </div>
                     </div>
                     <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[var(--muted)] group-hover:text-white transition-all">
                        <ChevronRight className="w-6 h-6" />
                     </button>
                  </div>
               ))}
            </div>
         </div>

         <div className="glass rounded-[40px] p-8 border border-[var(--border)] bg-gradient-to-t from-blue-600/5 to-transparent flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
               <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-tighter max-w-[150px]">Soporte Enterprise 24/7</h4>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-8 leading-relaxed">
              Respuesta garantizada en menos de 15 minutos para clientes de nivel corporativo.
            </p>
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all">UPGRADE A ENTERPRISE</button>
         </div>
      </div>
    </div>
  );
}

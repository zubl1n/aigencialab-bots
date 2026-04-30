import React from 'react';
import { 
  Users, Search, Filter, Download, MoreHorizontal, 
  CheckCircle2, Clock, XCircle, ArrowRight
} from 'lucide-react';

export default function EnhancedLeadsTableMockup() {
  const leads = [
    { id: '1', nombre: 'Carlos Santamaría', empresa: 'Logística Sur', email: 'csantamaria@logsur.cl', fecha: '2026-04-16', estado: 'Calificado', score: 92 },
    { id: '2', nombre: 'Marcela Figueroa', empresa: 'Retail Express', email: 'm.figueroa@retailex.com', fecha: '2026-04-16', estado: 'Contactando', score: 78 },
    { id: '3', nombre: 'Eduardo Valdés', empresa: 'Consultores EV', email: 'evaldes@ev.cl', fecha: '2026-04-15', estado: 'Cerrado', score: 100 },
    { id: '4', nombre: 'Ana María Rojas', empresa: 'Inmobiliaria RK', email: 'ana.rojas@inmork.cl', fecha: '2026-04-15', estado: 'Descartado', score: 25 },
    { id: '5', nombre: 'Pedro Pascal', empresa: 'Estudios PP', email: 'contacto@estudiospp.com', fecha: '2026-04-14', estado: 'Calificado', score: 88 },
  ];

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Calificado': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Calificado</span>;
      case 'Contactando': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[11px] font-medium border border-blue-500/20"><Clock className="w-3 h-3" /> En Contacto</span>;
      case 'Cerrado': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-medium border border-indigo-500/20"><CheckCircle2 className="w-3 h-3" /> Ganado</span>;
      case 'Descartado': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-500/10 text-zinc-400 text-[11px] font-medium border border-zinc-500/20"><XCircle className="w-3 h-3" /> Descartado</span>;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-zinc-500';
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-300 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
              <span className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Users className="w-6 h-6" />
              </span>
              Directorio de Leads
            </h1>
            <p className="text-zinc-500 text-sm mt-2 ml-1">Gestiona y analiza los prospectos capturados por tu IA.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium transition-all text-white flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4 text-zinc-400" /> Exportar CSV
            </button>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/25">
              Sincronizar CRM
            </button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, empresa o email..." 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition"
              />
           </div>
           <div className="flex gap-3">
              <button className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition flex items-center gap-2 text-zinc-300">
                 <Filter className="w-4 h-4 text-zinc-500" /> Estado: Todos
              </button>
              <button className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition flex items-center gap-2 text-zinc-300">
                  Puntaje IA
              </button>
           </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-zinc-800/60 bg-zinc-950/20 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                   <th className="px-6 py-5">Nombre y Contacto</th>
                   <th className="px-6 py-5">Empresa</th>
                   <th className="px-6 py-5">Fecha</th>
                   <th className="px-6 py-5">Estado</th>
                   <th className="px-6 py-5 text-center">Score IA</th>
                   <th className="px-6 py-5 text-right">Acción</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800/50">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/20 transition group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                               {lead.nombre.charAt(0)}
                            </div>
                            <div>
                               <p className="font-medium text-zinc-200">{lead.nombre}</p>
                               <p className="text-xs text-zinc-500">{lead.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-sm text-zinc-300">{lead.empresa}</span>
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-sm text-zinc-400 font-mono">{lead.fecha}</span>
                      </td>
                      <td className="px-6 py-4">
                         {getStatusBadge(lead.estado)}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="inline-flex items-center justify-center relative">
                            <svg className="w-10 h-10 transform -rotate-90">
                              <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-zinc-800" />
                              <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="3" strokeDasharray="100" strokeDashoffset={`${100 - lead.score}`} className={`${getScoreColor(lead.score)}`} />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono ${getScoreColor(lead.score)}`}>{lead.score}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-indigo-400 transition">
                            <ArrowRight className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-zinc-800/60 bg-zinc-950/20 flex justify-between items-center text-xs text-zinc-500">
             <span>Mostrando 1 a 5 de 1,284 leads</span>
             <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-md hover:bg-zinc-800 transition">Anterior</button>
                <button className="px-3 py-1.5 rounded-md hover:bg-zinc-800 transition">Siguiente</button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

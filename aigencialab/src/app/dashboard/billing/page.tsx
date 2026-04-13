'use client';

import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Loader2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Client } from '@/types/client';

export default function BillingPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch client data
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single();
        if (clientData) setClient(clientData);

        // Fetch invoices from Supabase (TAREA 5)
        const { data: invData } = await supabase
          .from('invoices')
          .select('*')
          .order('issued_at', { ascending: false });
        
        if (invData) setInvoices(invData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || !client) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const usage = {
    conversations: { current: 342, limit: client.plan === 'Starter' ? 500 : client.plan === 'Pro' ? 2500 : 10000 },
    leads: { current: 58, limit: client.plan === 'Starter' ? 100 : client.plan === 'Pro' ? 500 : 2000 },
    bots: { current: 1, limit: client.plan === 'Starter' ? 1 : client.plan === 'Pro' ? 3 : 10 }
  };

  // Formatting helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      'paid': 'Pagado',
      'pending': 'Pendiente',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Facturación y Uso</h1>
          <p className="text-[var(--muted)]">Gestiona tu suscripción, límites y métodos de pago.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm">
           Método de Pago <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Actual */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass rounded-[40px] p-10 border border-[var(--border)] bg-gradient-to-br from-blue-600/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-20 h-20 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <div className="relative z-10 flex justify-between items-start mb-10">
                 <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4 inline-block">Plan Sugerido</span>
                    <h3 className="text-4xl font-extrabold text-white tracking-tighter mb-2">Plan {client.plan}</h3>
                    <p className="text-sm text-[var(--muted)] font-medium">Suscripción activa desde hace 3 meses</p>
                 </div>
                 <div className="text-right">
                    <p className="text-3xl font-bold text-white">${client.plan === 'Starter' ? '49' : '149'}<span className="text-sm text-[var(--muted)]">/mes</span></p>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Próximo cobro: 01 May</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <UsageBar label="Conversaciones" current={usage.conversations.current} limit={usage.conversations.limit} color="blue" />
                 <UsageBar label="Leads del Mes" current={usage.leads.current} limit={usage.leads.limit} color="emerald" />
                 <UsageBar label="Bots IA" current={usage.bots.current} limit={usage.bots.limit} color="purple" />
              </div>

              <div className="mt-12 flex gap-4">
                 <button 
                   onClick={() => setModalOpen(true)}
                   className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                 >
                    Upgrade a Pro <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                 </button>
                 <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[20px] font-bold text-sm transition-all flex items-center justify-center gap-2">
                    Gestionar Suscripción <CreditCard className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Historial de Facturas */}
           <div className="glass rounded-[40px] p-8 border border-[var(--border)]">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                 <Clock className="text-blue-400" /> Historial de Facturación
              </h3>
              <div className="space-y-2">
                 {invoices.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                       <p className="text-[var(--muted)] text-sm font-medium uppercase tracking-widest">No hay facturas registradas</p>
                    </div>
                 ) : (
                    invoices.map((inv) => (
                       <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className="p-3 bg-white/5 rounded-xl text-[var(--muted)] group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">{inv.invoice_number}</p>
                                <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">{formatDate(inv.issued_at)}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <p className="text-sm font-bold text-white">${Number(inv.amount).toFixed(2)}</p>
                             <span className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                inv.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
                             }`}>
                                {getStatusLabel(inv.status)}
                             </span>
                             {inv.pdf_url ? (
                                <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-blue-500/10 text-[var(--muted)] hover:text-blue-400 rounded-lg transition-colors">
                                   <Download className="w-4 h-4" />
                                </a>
                             ) : (
                                <button disabled className="p-2 opacity-20 cursor-not-allowed">
                                   <Download className="w-4 h-4" />
                                </button>
                             )}
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Info & Help */}
        <div className="space-y-6">
           <div className="glass rounded-[32px] p-8 border border-[var(--border)] overflow-hidden relative">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Seguridad de Pago</span>
                 </div>
                 <h4 className="text-lg font-bold text-white mb-2">Pagos Procesados por Stripe</h4>
                 <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
                   Tu información está protegida bajo estándares PCI DSS Nivel 1. AIgenciaLab no almacena los datos de tu tarjeta.
                 </p>
                 <div className="flex items-center gap-4 opacity-50">
                    <img src="https://img.shields.io/badge/Stripe-Ready-blue?style=flat-square&logo=stripe" alt="Stripe" />
                    <img src="https://img.shields.io/badge/PCI-Compliant-emerald?style=flat-square" alt="PCI" />
                 </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
           </div>

           <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                 <HelpCircle className="w-4 h-4 text-orange-400" /> Preguntas Frecuentes
              </h4>
              <div className="space-y-4">
                 <FAQItem q="¿Puedo cancelar en cualquier momento?" a="Sí, AIgenciaLab no tiene contratos de permanencia. Puedes cancelar desde el panel." />
                 <FAQItem q="¿Qué pasa si supero mis límites?" a="Tu bot seguirá activo, pero los leads extra se cobrarán con un recargo pequeño por lead." />
                 <FAQItem q="¿Necesito pagar por bot extra?" a="El Plan Pro incluye hasta 3 bots, el Starter solo 1 bot activo." />
              </div>
           </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {modalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
            <div className="relative w-full max-w-4xl bg-[var(--bg2)] border border-[var(--border)] rounded-[40px] shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden">
               <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-12 space-y-8">
                     <div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Potencia tu empresa</h2>
                        <p className="text-[var(--muted)] font-medium">Desbloquea el poder absoluto de la IA generativa.</p>
                     </div>
                     <div className="space-y-6">
                        <FeatureItem text="Prompt de Sistema personalizado" />
                        <FeatureItem text="Hasta 2,500 conversaciones/mes" />
                        <FeatureItem text="Gestión de 3 Bots independientes" />
                        <FeatureItem text="Derivación avanzada a humanos" />
                        <FeatureItem text="Soporte Prioritario 24/7" />
                     </div>
                  </div>
                  <div className="bg-blue-600/5 p-12 flex flex-col items-center justify-center border-l border-[var(--border)]">
                     <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Upgrade a Pro</span>
                     <div className="text-6xl font-extrabold text-white mb-4 tracking-tighter">$149<span className="text-xl text-[var(--muted)]">/mes</span></div>
                     <p className="text-xs text-[var(--muted)] mb-8 text-center max-w-[200px]">Incluye todas las funcionalidades de Starter más IA avanzada.</p>
                     <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mb-4">
                        Confirmar Cambio <ChevronRight className="w-5 h-5" />
                     </button>
                     <button onClick={() => setModalOpen(false)} className="text-xs font-bold text-[var(--muted)] hover:text-white transition-colors underline underline-offset-4">Quizás más tarde</button>
                  </div>
               </div>
               <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-2 text-[var(--muted)] hover:text-white"><X className="w-6 h-6" /></button>
            </div>
         </div>
      )}
    </div>
  );
}

function UsageBar({ label, current, limit, color }: any) {
  const percentage = Math.min((current / limit) * 100, 100);
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-500/30',
    emerald: 'bg-emerald-600 shadow-emerald-500/30',
    purple: 'bg-purple-600 shadow-purple-500/30'
  };

  return (
    <div className="space-y-3">
       <div className="flex justify-between items-end">
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{label}</p>
          <p className="text-xs font-bold text-white truncate">{current} / {limit}</p>
       </div>
       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`} 
            style={{ width: `${percentage}%` }}
          ></div>
       </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="group border-b border-white/5 pb-4 last:border-0">
       <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-tight group-hover:text-blue-400 transition-colors">{q}</h5>
       <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium">{a}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-3 h-3" />
       </div>
       <span className="text-sm font-bold text-[var(--sub)] uppercase tracking-tight">{text}</span>
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
    </svg>
  );
}

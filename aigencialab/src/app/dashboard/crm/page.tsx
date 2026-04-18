'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, UserPlus, Phone, Mail, Building, Star, Loader2, Search, RefreshCw, TrendingUp, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PlanGate } from '@/components/shared/PlanGate';

interface Contact {
  id: string; first_name: string; last_name: string | null;
  email: string | null; phone: string | null; company: string | null;
  score: number; stage: string; source: string; created_at: string;
  estimated_value: number;
}

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  new:        { label: 'Nuevo',      color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  contacted:  { label: 'Contactado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  qualified:  { label: 'Calificado', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  proposal:   { label: 'Propuesta',  color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  closed_won: { label: '✅ Cerrado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  closed_lost:{ label: '❌ Perdido', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      <Star className="w-2.5 h-2.5" /> {score}
    </span>
  );
}

function CRMContent() {
  const supabase = createClient();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    let q = supabase.from('crm_contacts').select('*')
      .eq('client_id', user.id)
      .order('score', { ascending: false });

    if (stageFilter !== 'all') q = q.eq('stage', stageFilter);
    if (search) q = q.or(`first_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);

    const { data } = await q;
    setContacts(data ?? []);
    setLoading(false);
  }, [search, stageFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStage = async (id: string, stage: string) => {
    await supabase.from('crm_contacts').update({ stage }).eq('id', id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
  };

  const totalValue = contacts.reduce((a, c) => a + (c.estimated_value ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-[20px] border border-white/5 p-5">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-2">Total contactos</p>
          <p className="text-2xl font-black text-white">{contacts.length}</p>
        </div>
        <div className="glass rounded-[20px] border border-white/5 p-5">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-2">Calificados</p>
          <p className="text-2xl font-black text-white">{contacts.filter(c => c.stage === 'qualified' || c.stage === 'proposal').length}</p>
        </div>
        <div className="glass rounded-[20px] border border-white/5 p-5">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-2">Cerrados</p>
          <p className="text-2xl font-black text-emerald-400">{contacts.filter(c => c.stage === 'closed_won').length}</p>
        </div>
        <div className="glass rounded-[20px] border border-white/5 p-5">
          <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mb-2">Valor pipeline</p>
          <p className="text-2xl font-black text-amber-400">${totalValue.toLocaleString('es-CL')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-white/5 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input type="text" placeholder="Buscar contacto..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/50" />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white text-sm focus:outline-none">
          <option value="all">Todas las etapas</option>
          {Object.entries(STAGE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={fetch} className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-gray-600 hover:text-white transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Contacts table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-purple-400 animate-spin" /></div>
      ) : contacts.length === 0 ? (
        <div className="glass rounded-[28px] border border-white/5 p-16 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Sin contactos en el CRM</p>
          <p className="text-gray-700 text-xs mt-2">Los contactos se crean automáticamente desde tus leads capturados</p>
        </div>
      ) : (
        <div className="glass rounded-[28px] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Contacto', 'Empresa', 'Email/Tel', 'Score', 'Etapa', 'Valor', 'Fuente'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map(c => {
                  const stage = STAGE_CONFIG[c.stage] ?? STAGE_CONFIG.new;
                  return (
                    <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">
                            {c.first_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{c.first_name} {c.last_name ?? ''}</p>
                            <p className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleDateString('es-CL')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-400">{c.company ?? '—'}</td>
                      <td className="px-5 py-4">
                        {c.email && <p className="text-gray-400 text-xs">{c.email}</p>}
                        {c.phone && <p className="text-gray-600 text-xs">{c.phone}</p>}
                      </td>
                      <td className="px-5 py-4"><ScoreBadge score={c.score} /></td>
                      <td className="px-5 py-4">
                        <select value={c.stage} onChange={e => updateStage(c.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer ${stage.color} bg-transparent`}>
                          {Object.entries(STAGE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-amber-400 font-bold text-sm">
                        {c.estimated_value > 0 ? `$${c.estimated_value.toLocaleString('es-CL')}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs capitalize">{c.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CRMPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-600">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-400" /> CRM
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gestión de contactos y pipeline de ventas</p>
      </div>
      <PlanGate feature="crm" requiredPlan="starter" blurContent={false}>
        <CRMContent />
      </PlanGate>
    </div>
  );
}

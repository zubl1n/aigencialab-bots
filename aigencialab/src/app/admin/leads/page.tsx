import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STAGES = [
  { key: 'new',        label: 'Nuevo',      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { key: 'contacted',  label: 'Contactado', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { key: 'qualified',  label: 'Calificado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { key: 'lost',       label: 'Perdido',    color: 'text-gray-500 bg-white/5 border-white/10' },
];

export default async function AdminLeads({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const clientFilter = params?.client;
  const statusFilter = params?.status;

  let query = supabase
    .from('leads')
    .select(`id, name, email, phone, status, source, created_at, last_message, clients(id, email, company_name)`)
    .order('created_at', { ascending: false }).limit(200);
  if (clientFilter) query = query.eq('client_id', clientFilter);
  if (statusFilter) query = query.eq('status', statusFilter);
  const { data: leads } = await query;

  const { data: clientList } = await supabase.from('clients').select('id, company_name, email').order('company_name');

  // ── Funnel data (real counts) ──
  const funnelCounts = STAGES.map(s => ({
    ...s,
    count: (leads ?? []).filter(l => (l.status ?? 'new') === s.key).length,
  }));
  const totalLeads = leads?.length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads Global</h1>
          <p className="text-gray-500 text-sm mt-0.5">{totalLeads} leads encontrados</p>
        </div>
        <a href={`/api/leads/export?client=${clientFilter ?? ''}`}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition">
          📥 Exportar CSV
        </a>
      </div>

      {/* Funnel Pipeline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {funnelCounts.map((s, i) => (
          <div key={s.key} className={`glass rounded-2xl border ${s.color.split(' ')[2]} p-5`}>
            <div className={`text-3xl font-black ${s.color.split(' ')[0]}`}>{s.count}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{s.label}</div>
            {totalLeads > 0 && (
              <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / totalLeads) * 100}%`, background: i === 0 ? '#60A5FA' : i === 1 ? '#FBBF24' : i === 2 ? '#34D399' : '#6B7280' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="glass rounded-2xl border border-white/5 p-4 flex flex-wrap gap-3 items-center">
        <select name="client" defaultValue={clientFilter ?? ''}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
          <option value="">Todos los clientes</option>
          {(clientList ?? []).map(c => (
            <option key={c.id} value={c.id} className="bg-[#0e0e18]">{c.company_name ?? c.email}</option>
          ))}
        </select>
        <select name="status" defaultValue={statusFilter ?? ''}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50">
          <option value="">Todos los estados</option>
          {STAGES.map(s => <option key={s.key} value={s.key} className="bg-[#0e0e18]">{s.label}</option>)}
        </select>
        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition">Filtrar</button>
        {(clientFilter || statusFilter) && (
          <Link href="/admin/leads" className="text-xs text-gray-600 hover:text-white transition">× Limpiar</Link>
        )}
      </form>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Fecha', 'Lead', 'Fuente', 'Cliente dueño', 'Estado', 'Último msg'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map(l => {
                const client = l.clients as any;
                const stage = STAGES.find(s => s.key === (l.status ?? 'new')) ?? STAGES[0];
                return (
                  <tr key={l.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-[10px] text-gray-600">{new Date(l.created_at).toLocaleDateString('es-CL')}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-white text-xs">{l.name ?? '—'}</div>
                      <div className="text-[10px] text-gray-700">{l.email}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{l.source ?? 'widget'}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/clientes/${client?.id}`} className="text-purple-400 hover:underline text-xs">{client?.company_name ?? client?.email ?? '—'}</Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${stage.color}`}>{stage.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 max-w-xs truncate">{l.last_message ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!leads?.length && (
          <div className="py-16 text-center text-gray-600">No hay leads con los filtros actuales.</div>
        )}
      </div>
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLeads({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const clientFilter = searchParams?.client;
  const statusFilter = searchParams?.status;

  let query = supabase
    .from('leads')
    .select(`
      id, name, email, status, created_at, last_message,
      clients(id, email, company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (clientFilter) query = query.eq('client_id', clientFilter);
  if (statusFilter) query = query.eq('status', statusFilter);

  const { data: leads } = await query;

  // Get client list for filter dropdown
  const { data: clientList } = await supabase
    .from('clients')
    .select('id, company_name, email')
    .order('company_name');

  // Export CSV link (server action result)
  const csvRows = (leads ?? []).map(l => [
    new Date(l.created_at).toLocaleDateString('es-CL'),
    l.name ?? '',
    l.email ?? '',
    (l.clients as any)?.company_name ?? '',
    l.status ?? '',
    l.last_message ?? '',
  ]);

  const statusBadge = (status: string | null) => {
    const map: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-green-100 text-green-700',
      lost: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
        {status ?? 'new'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Global</h1>
          <p className="text-gray-500 mt-1">{leads?.length ?? 0} leads encontrados</p>
        </div>
        <a
          href={`/api/leads/export?client=${clientFilter ?? ''}`}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
        >
          📥 Exportar CSV
        </a>
      </div>

      {/* FILTERS */}
      <form method="GET" className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <select name="client" defaultValue={clientFilter ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los clientes</option>
          {(clientList ?? []).map(c => (
            <option key={c.id} value={c.id}>{c.company_name ?? c.email}</option>
          ))}
        </select>
        <select name="status" defaultValue={statusFilter ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Calificado</option>
          <option value="lost">Perdido</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
          Filtrar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Cliente dueño</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Última conversación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(leads ?? []).map(l => {
              const client = (l.clients as any);
              return (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(l.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{l.name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{l.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/clientes`} className="text-purple-600 hover:underline text-xs">
                      {client?.company_name ?? client?.email ?? '—'}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{statusBadge(l.status)}</td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                    {l.last_message ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!leads?.length && (
          <div className="py-16 text-center text-gray-400">No hay leads con los filtros actuales.</div>
        )}
      </div>
    </div>
  );
}

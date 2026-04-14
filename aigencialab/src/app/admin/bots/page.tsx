import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminBots() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: bots } = await supabase
    .from('bot_configs')
    .select(`
      id, active, config, created_at,
      clients(id, email, company_name, plan)
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bots / Agentes</h1>
        <p className="text-gray-500 mt-1">{bots?.length ?? 0} bots registrados en el sistema</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Bot ID</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Config</th>
              <th className="px-6 py-4">Registrado</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(bots ?? []).map(b => {
              const client = (b.clients as any);
              return (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">{b.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{client?.company_name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{client?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">{client?.plan ?? 'Starter'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${b.active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className={`text-sm font-medium ${b.active ? 'text-green-700' : 'text-red-600'}`}>
                        {b.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <details className="cursor-pointer">
                      <summary className="text-purple-600 hover:underline text-xs font-medium">Ver config JSON</summary>
                      <pre className="mt-2 bg-gray-50 rounded-lg p-3 text-xs overflow-x-auto max-w-xs max-h-40 overflow-y-auto border border-gray-200">
                        {JSON.stringify(b.config, null, 2)}
                      </pre>
                    </details>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <form action="/api/admin/toggle-bot" method="POST">
                      <input type="hidden" name="bot_id" value={b.id} />
                      <input type="hidden" name="active" value={b.active ? 'false' : 'true'} />
                      <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${b.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} transition`}>
                        {b.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!bots?.length && (
          <div className="py-16 text-center text-gray-400">No hay bots registrados.</div>
        )}
      </div>
    </div>
  );
}

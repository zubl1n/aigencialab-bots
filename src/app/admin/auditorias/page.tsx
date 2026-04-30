import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function AdminAuditorias() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // audit_requests table might not exist yet — handle gracefully
  const { data: audits, error } = await supabase
    .from('audit_requests')
    .select('*')
    .order('created_at', { ascending: false })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-700',
      en_proceso: 'bg-blue-100 text-blue-700',
      entregada: 'bg-green-100 text-green-700',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
        {status}
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditorías</h1>
          <p className="text-gray-500 mt-1">{audits?.length ?? 0} solicitudes recibidas</p>
        </div>
        <a href="/api/leads/export?table=audit_requests"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition">
          📥 Exportar CSV
        </a>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-sm">
          ⚠️ La tabla <code>audit_requests</code> aún no existe. Crea el formulario de auditoría para comenzar a recibir solicitudes, o ejecuta la migración SQL.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {!audits?.length ? (
          <div className="py-16 text-center text-gray-400">
            No hay auditorías aún. Las solicitudes de <strong>/audit</strong> aparecerán aquí.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Industria</th>
                <th className="px-6 py-4">Empleados</th>
                <th className="px-6 py-4">Consultas/mes</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {audits.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{a.empresa}</div>
                    <div className="text-gray-400 text-xs">{a.nombre}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.email}</td>
                  <td className="px-6 py-4 text-gray-600">{a.industria ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{a.empleados ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{a.consultas_mensuales ?? '—'}</td>
                  <td className="px-6 py-4">{statusBadge(a.status ?? 'pendiente')}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <details className="cursor-pointer">
                      <summary className="text-purple-600 hover:underline text-xs font-medium">Ver detalle</summary>
                      <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs text-gray-700 max-w-xs">
                        <p><strong>Desafío:</strong> {a.desafio ?? '—'}</p>
                        <p className="mt-1"><strong>Sitio web:</strong> {a.sitio_web ?? '—'}</p>
                        <p className="mt-1"><strong>Teléfono:</strong> {a.telefono ?? '—'}</p>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

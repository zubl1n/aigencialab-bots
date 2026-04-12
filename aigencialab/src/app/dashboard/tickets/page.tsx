import { createAdminSupabase } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tickets — AigenciaLab' }

const priorityMap = {
  critico: { label:'Crítico', cls:'text-red-300 bg-red-500/10 border-red-500/30' },
  alto:    { label:'Alto',    cls:'text-orange-300 bg-orange-500/10 border-orange-500/30' },
  medio:   { label:'Medio',  cls:'text-yellow-300 bg-yellow-500/10 border-yellow-500/30' },
  bajo:    { label:'Bajo',   cls:'text-slate-300 bg-white/5 border-white/10' },
}
const statusMap = {
  'Abierto':          { cls:'text-blue-300 bg-blue-500/10 border-blue-500/30' },
  'En progreso':      { cls:'text-violet-300 bg-violet-500/10 border-violet-500/30' },
  'Esperando cliente':{ cls:'text-yellow-300 bg-yellow-500/10 border-yellow-500/30' },
  'Resuelto':         { cls:'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
}

export default async function TicketsPage() {
  const supabase = createAdminSupabase()
  const { data: rawTickets } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  const tickets = rawTickets ?? []

  const open     = tickets.filter(t => t.status !== 'Resuelto').length
  const critical = tickets.filter(t => t.priority === 'critico').length
  const resolved = tickets.filter(t => t.status === 'Resuelto').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Soporte & Tickets</h1>
          <p className="text-slate-500 text-sm">{open} abiertos · {critical} críticos · {resolved} resueltos</p>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label:'Abiertos',  value:open,     color:'border-blue-500/30    bg-blue-600/10'    },
          { label:'Críticos',  value:critical, color:'border-red-500/30     bg-red-600/10'     },
          { label:'Resueltos', value:resolved, color:'border-emerald-500/30 bg-emerald-600/10' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border ${s.color}`}>
            <div className="text-3xl font-black mb-1">{s.value}</div>
            <div className="text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabla tickets */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 text-xs">
              <th className="text-left px-6 py-4">Ticket</th>
              <th className="text-left px-6 py-4">Empresa</th>
              <th className="text-left px-6 py-4">Problema</th>
              <th className="text-left px-6 py-4">Prioridad</th>
              <th className="text-left px-6 py-4">Estado</th>
              <th className="text-left px-6 py-4">Canal</th>
              <th className="text-left px-6 py-4">SLA</th>
              <th className="text-left px-6 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-600">Sin tickets registrados</td></tr>
            )}
            {tickets.map(t => {
              const p = priorityMap[t.priority as keyof typeof priorityMap] ?? priorityMap.bajo
              const s = statusMap[t.status as keyof typeof statusMap] ?? statusMap['Abierto']
              const slaOk = t.sla_deadline ? new Date(t.sla_deadline) > new Date() : true
              return (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{t.ticket_num}</td>
                  <td className="px-6 py-4 font-medium text-slate-200">{t.company ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{t.issue}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-lg border font-medium ${p.cls}`}>{p.label}</span></td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-lg border ${s.cls}`}>{t.status}</span></td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{t.channel}</td>
                  <td className="px-6 py-4">
                    {t.sla_deadline ? (
                      <span className={`text-xs ${slaOk ? 'text-emerald-400' : 'text-red-400 font-bold'}`}>
                        {slaOk ? '✓ OK' : '⚠ Vencido'}
                      </span>
                    ) : <span className="text-slate-700 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(t.created_at).toLocaleDateString('es-CL')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

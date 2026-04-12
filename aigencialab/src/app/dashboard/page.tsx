import { createAdminSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardOverview() {
  const supabase = createAdminSupabase()

  // KPIs en paralelo
  const [leadsRes, clientsRes, ticketsRes, convsRes] = await Promise.all([
    supabase.from('leads').select('id, score, tier, created_at').order('created_at', { ascending: false }),
    supabase.from('clients').select('id, status'),
    supabase.from('tickets').select('id, status, priority'),
    supabase.from('conversations').select('id, status').eq('status', 'needs_human'),
  ])

  const leads   = leadsRes.data   ?? []
  const clients = clientsRes.data ?? []
  const tickets = ticketsRes.data ?? []
  const convNeedHuman = convsRes.data?.length ?? 0

  // Stats
  const now    = new Date()
  const week   = new Date(now.getTime() - 7*24*60*60*1000)
  const leadsThisWeek = leads.filter(l => new Date(l.created_at) > week).length
  const activeClients = clients.filter(c => c.status === 'active').length
  const openTickets   = tickets.filter(t => t.status !== 'Resuelto').length
  const hotLeads      = leads.filter(l => l.tier === 'hot').length

  const kpis = [
    { label: 'Leads esta semana',    value: leadsThisWeek, icon: '🎯', sub: `${hotLeads} calientes 🔥`,    color: 'from-blue-600/20 to-blue-600/5',    border: 'border-blue-500/30' },
    { label: 'Clientes activos',     value: activeClients, icon: '🏢', sub: `${clients.length} total`,     color: 'from-violet-600/20 to-violet-600/5', border: 'border-violet-500/30' },
    { label: 'Tickets abiertos',     value: openTickets,   icon: '🎫', sub: `${tickets.filter(t=>t.priority==='critico').length} críticos`,  color: 'from-yellow-600/20 to-yellow-600/5', border: 'border-yellow-500/30' },
    { label: 'Chats con humano req', value: convNeedHuman, icon: '💬', sub: 'requieren respuesta',          color: 'from-red-600/20 to-red-600/5',       border: 'border-red-500/30' },
  ]

  // Últimos leads
  const recentLeads = leads.slice(0, 8)
  const tierConfig = { hot: { label:'Caliente 🔥', cls:'text-red-400 bg-red-500/10' }, warm: { label:'Tibio 🌡️', cls:'text-yellow-400 bg-yellow-500/10' }, cold: { label:'Frío ❄️', cls:'text-blue-400 bg-blue-500/10' } }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Operativo</h1>
          <p className="text-slate-500 text-sm mt-1">Vista en tiempo real · Supabase Postgres</p>
        </div>
        <div className="flex gap-3">
          <Link href="/audit" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            🔍 Nueva Auditoría
          </Link>
          <Link href="/dashboard/onboarding" className="border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm hover:border-white/20 transition-colors">
            ⚙️ Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-5 bg-gradient-to-br ${kpi.color} border ${kpi.border}`}>
            <div className="text-2xl mb-2">{kpi.icon}</div>
            <div className="text-3xl font-black mb-1">{kpi.value}</div>
            <div className="text-sm font-medium text-slate-300">{kpi.label}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold">Últimos Leads</h2>
            <Link href="/dashboard/leads" className="text-xs text-blue-400 hover:underline">Ver todos →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs">
                  <th className="text-left px-6 py-3">Empresa</th>
                  <th className="text-left px-6 py-3">Score</th>
                  <th className="text-left px-6 py-3">Tier</th>
                  <th className="text-left px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-slate-600">Sin leads aún · <Link href="/audit" className="text-blue-400">Crear auditoría →</Link></td></tr>
                )}
                {recentLeads.map(lead => {
                  const t = tierConfig[lead.tier as keyof typeof tierConfig] ?? tierConfig.cold
                  return (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-3 text-slate-300 font-medium">Lead #{lead.id.slice(-6)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/5 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{width:`${lead.score}%`}}/>
                          </div>
                          <span className="text-slate-300">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${t.cls}`}>{t.label}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {new Date(lead.created_at).toLocaleDateString('es-CL')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-2">
              {[
                { href:'/audit',                label:'🔍 Nueva Auditoría',      desc:'Analizar sitio de prospecto' },
                { href:'/dashboard/leads',       label:'🎯 Ver Pipeline',         desc:'Gestionar leads' },
                { href:'/dashboard/tickets',     label:'🎫 Ver Tickets',          desc:'Soporte pendiente' },
                { href:'/dashboard/onboarding',  label:'⚙️ Activar Cliente',     desc:'Onboarding en <2h' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div>
                    <div className="text-sm font-medium text-slate-300 group-hover:text-white">{a.label}</div>
                    <div className="text-xs text-slate-600">{a.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold mb-3">💡 Sistema</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400"><span>Base de datos</span><span className="text-emerald-400">✓ Supabase Online</span></div>
              <div className="flex justify-between text-slate-400"><span>WhatsApp</span><span className="text-yellow-400">⚙ Pendiente config</span></div>
              <div className="flex justify-between text-slate-400"><span>Email</span><span className="text-yellow-400">⚙ Pendiente Resend</span></div>
              <div className="flex justify-between text-slate-400"><span>PageSpeed API</span><span className="text-emerald-400">✓ Activo (100/día)</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

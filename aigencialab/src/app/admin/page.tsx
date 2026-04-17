import { createClient } from '@supabase/supabase-js'
import { AdminCharts } from '@/components/admin/AdminCharts'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // ── Core metrics ─────────────────────────────────────────
  const [
    { data: subs },
    { count: clientsTotal },
    { count: botsActive },
    { count: botsTotal },
    { count: leadsTotal },
    { count: leadsToday },
    { count: trialClients },
    { count: paidClients },
    { count: suspendedClients },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('subscriptions').select('plan, status, impl_paid_at').eq('status', 'active'),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('bot_configs').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('bot_configs').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('audit_logs').select('id, event, module, metadata, created_at').eq('module', 'admin').order('created_at', { ascending: false }).limit(10),
  ])

  // ── MRR calc — usando config/plans.ts con precios CLP reales ──────────────
  // Fuente única de verdad: config/plans.ts (precios CLP mensuales mes 3+)
  const PLAN_MONTHLY_CLP: Record<string, number> = {
    Basic:       45000,
    Starter:    120000,
    Pro:        200000,
    Enterprise:      0, // A consultar — excluir del MRR automático
  }

  const mrr = (subs ?? []).reduce((acc, s) => {
    return acc + (PLAN_MONTHLY_CLP[s.plan] ?? 0)
  }, 0)
  const arr = mrr * 12
  const conversionRate = (clientsTotal ?? 0) > 0
    ? Math.round(((paidClients ?? 0) / (clientsTotal ?? 1)) * 100)
    : 0

  // ── MRR History — últimos 6 meses desde suscripciones activas reales ─────
  const mrrHistory = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const end = new Date()
      end.setMonth(end.getMonth() - (5 - i) + 1)
      end.setDate(1)
      end.setHours(0, 0, 0, 0)
      const start = new Date(end)
      start.setMonth(start.getMonth() - 1)

      const label = start.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })

      // Suscripciones activas que pagaron implementación antes del fin del mes
      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('status', 'active')
        .lte('impl_paid_at', end.toISOString())

      const monthMRR = (activeSubs ?? []).reduce((acc, s) => {
        return acc + (PLAN_MONTHLY_CLP[s.plan] ?? 0)
      }, 0)

      return { month: label, mrr: monthMRR }
    })
  )

  // ── Weekly signups (last 8 weeks) ────────────────────────
  const weeklySignups = await Promise.all(
    Array.from({ length: 8 }, async (_, i) => {
      const end   = new Date()
      end.setDate(end.getDate() - i * 7)
      const start = new Date(end)
      start.setDate(start.getDate() - 7)
      const label = start.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
      const { count } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lt('created_at', end.toISOString())
      return { week: label, clients: count ?? 0 }
    })
  )
  weeklySignups.reverse()

  // ── Plan distribution (nombres de config/plans.ts) ───────────────────────
  const configPlanNames = ['Basic', 'Starter', 'Pro', 'Enterprise']
  const planDist = configPlanNames.map(name => ({
    name,
    value: (subs ?? []).filter(s => s.plan === name).length,
  }))

  // ── Open tickets count ───────────────────────────────────────────────────
  const { count: openTickets } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .in('status', ['open', 'in_progress'])

  const metrics = [
    { label: 'MRR Total (CLP)',       value: `$${mrr.toLocaleString('es-CL')}`,       sub: `ARR: $${arr.toLocaleString('es-CL')} CLP`,                             icon: '💰', color: 'from-purple-50 border-purple-200 text-purple-700' },
    { label: 'Clientes Totales',      value: String(clientsTotal ?? 0),                sub: `${trialClients ?? 0} trial · ${paidClients ?? 0} pagos · ${suspendedClients ?? 0} suspendidos`, icon: '👥', color: 'from-blue-50 border-blue-200 text-blue-700' },
    { label: 'Bots Activos',          value: `${botsActive ?? 0}/${botsTotal ?? 0}`,   sub: 'bots encendidos vs total',                                             icon: '🤖', color: 'from-green-50 border-green-200 text-green-700' },
    { label: 'Leads Hoy',             value: String(leadsToday ?? 0),                  sub: `${leadsTotal ?? 0} leads acumulados`,                                  icon: '🎯', color: 'from-orange-50 border-orange-200 text-orange-700' },
    { label: 'Conversión Trial→Pago', value: `${conversionRate}%`,                     sub: `${paidClients ?? 0} clientes pagos`,                                   icon: '📈', color: 'from-pink-50 border-pink-200 text-pink-700' },
    { label: 'Tickets Abiertos',      value: String(openTickets ?? 0),                 sub: 'Requieren atención de soporte',                                        icon: '🎫', color: 'from-red-50 border-red-200 text-red-700' },
  ]

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vista General</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/admin/export/clients"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            ⬇️ Exportar Clientes CSV
          </a>
          <Link
            href="/admin/tickets"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${(openTickets ?? 0) > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            🎫 Tickets {(openTickets ?? 0) > 0 ? `(${openTickets} abiertos)` : ''}
          </Link>
          <Link
            href="/admin/clientes"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Ver todos los clientes →
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-2">
        {metrics.map(m => (
          <div key={m.label} className={`bg-gradient-to-br ${m.color} rounded-xl p-6 shadow-sm border`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">{m.label}</span>
              <span className="text-2xl">{m.icon}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{m.value}</div>
            <div className="text-xs opacity-60">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Recharts ────────────────────────────────────── */}
      <AdminCharts
        mrrHistory={mrrHistory}
        weeklySignups={weeklySignups}
        planDist={planDist}
      />

      {/* ─── Recent Activity ─────────────────────────────── */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Actividad Reciente</h3>
          <span className="text-xs text-gray-400">Últimas 10 acciones admin</span>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentActivity ?? []).length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">Sin actividad registrada aún</div>
          ) : (
            (recentActivity ?? []).map((log: any) => {
              const meta = log.metadata as Record<string, string> | null
              const clientId = meta?.client_id
              return (
                <div key={log.id} className="px-6 py-3 flex items-start gap-4 hover:bg-gray-50 transition">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 mt-0.5">
                    {log.module === 'admin' ? 'A' : log.module === 'payment' ? '$' : 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{log.event.replace(/_/g, ' ')}</span>
                      {clientId && (
                        <Link href={`/admin/clientes/${clientId}`} className="text-xs text-purple-600 hover:underline">
                          Ver cliente ↗
                        </Link>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.created_at).toLocaleString('es-CL')}
                      {meta?.details && <span className="ml-2 text-gray-500">· {meta.details}</span>}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

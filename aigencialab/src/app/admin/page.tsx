import { createClient } from '@supabase/supabase-js'
import { AdminCharts } from '@/components/admin/AdminCharts'
import Link from 'next/link'
import {
  Users, Bot, Target, TicketIcon, DollarSign, TrendingUp,
  Activity, Download, ArrowRight, AlertCircle, CheckCircle2,
  Clock, Zap, BarChart3,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, gradient, alert }: {
  label: string; value: string | number; sub?: string;
  icon: any; gradient: string; alert?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${gradient} transition-all hover:scale-[1.02] cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/50">{label}</div>
        <div className={`p-2 rounded-xl ${alert ? 'bg-red-500/20' : 'bg-white/10'}`}>
          <Icon className={`w-4 h-4 ${alert ? 'text-red-300' : 'text-white/70'}`} />
        </div>
      </div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-white/40 mt-1.5 font-medium leading-relaxed">{sub}</div>}
      {/* Decorative blur circle */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
    </div>
  )
}

// ── Activity Row ──────────────────────────────────────────────────────────
function ActivityRow({ event, module, createdAt, clientId, details }: {
  event: string; module: string; createdAt: string; clientId?: string; details?: string;
}) {
  const moduleColors: Record<string, string> = {
    admin:   'bg-purple-500/20 text-purple-300',
    payment: 'bg-emerald-500/20 text-emerald-300',
    system:  'bg-blue-500/20 text-blue-300',
    bot:     'bg-cyan-500/20 text-cyan-300',
  }
  const cls = moduleColors[module] ?? 'bg-white/5 text-white/50'
  const elapsed = (() => {
    const ms = Date.now() - new Date(createdAt).getTime()
    if (ms < 3_600_000) return `Hace ${Math.floor(ms/60000)} min`
    if (ms < 86_400_000) return `Hace ${Math.floor(ms/3_600_000)} h`
    return new Date(createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
  })()

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-white/[0.02] transition rounded-xl group">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${cls}`}>
        {module === 'admin' ? 'A' : module === 'payment' ? '$' : module === 'bot' ? '🤖' : 'S'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/80 truncate">
          {event.replace(/_/g, ' ')}
          {details && <span className="text-white/30 ml-2">· {details}</span>}
        </div>
        <div className="text-[11px] text-white/30">{elapsed}</div>
      </div>
      {clientId && (
        <Link href={`/admin/clientes/${clientId}`}
          className="opacity-0 group-hover:opacity-100 text-[10px] text-purple-400 hover:text-purple-300 border border-purple-500/20 px-2 py-1 rounded-lg transition flex items-center gap-1"
        >
          Ver <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

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
    { count: openTickets },
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
    supabase.from('audit_logs').select('id, event, module, metadata, created_at').eq('module', 'admin').order('created_at', { ascending: false }).limit(12),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
  ])

  // Churn risk: trialing clients with period ending within 3 days
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  const { count: churnRiskCount } = await supabase.from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'trialing').lte('current_period_end', in3Days)

  // Platform health: inactive bots
  const { count: inactiveBotsCount } = await supabase.from('bot_configs')
    .select('id', { count: 'exact', head: true }).eq('active', false)
  const healthScore = (botsTotal ?? 0) > 0
    ? Math.round(((botsActive ?? 0) / (botsTotal ?? 1)) * 100) : 100

  // MRR usando config/plans.ts precios CLP
  const PLAN_MONTHLY_CLP: Record<string, number> = {
    Basic: 45000, Starter: 120000, Pro: 200000, Enterprise: 0,
  }
  const mrr = (subs ?? []).reduce((acc, s) => acc + (PLAN_MONTHLY_CLP[s.plan] ?? 0), 0)
  const arr = mrr * 12
  const conversionRate = (clientsTotal ?? 0) > 0
    ? Math.round(((paidClients ?? 0) / (clientsTotal ?? 1)) * 100) : 0

  // MRR History — últimos 6 meses
  const mrrHistory = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const end = new Date(); end.setMonth(end.getMonth() - (5 - i) + 1); end.setDate(1); end.setHours(0,0,0,0)
      const start = new Date(end); start.setMonth(start.getMonth() - 1)
      const label = start.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
      const { data: activeSubs } = await supabase.from('subscriptions').select('plan').eq('status', 'active').lte('impl_paid_at', end.toISOString())
      const monthMRR = (activeSubs ?? []).reduce((acc, s) => acc + (PLAN_MONTHLY_CLP[s.plan] ?? 0), 0)
      return { month: label, mrr: monthMRR }
    })
  )

  const weeklySignups = await Promise.all(
    Array.from({ length: 8 }, async (_, i) => {
      const end = new Date(); end.setDate(end.getDate() - i * 7)
      const start = new Date(end); start.setDate(start.getDate() - 7)
      const label = start.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
      const { count } = await supabase.from('clients').select('id', { count: 'exact', head: true })
        .gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
      return { week: label, clients: count ?? 0 }
    })
  )
  weeklySignups.reverse()

  const planDist = ['Basic', 'Starter', 'Pro', 'Enterprise'].map(name => ({
    name, value: (subs ?? []).filter(s => s.plan === name).length,
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Vista General</h1>
          <p className="text-[#A09CB0] text-sm mt-0.5">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(openTickets ?? 0) > 0 && (
            <Link href="/admin/tickets"
              className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-bold transition animate-pulse"
            >
              <AlertCircle className="w-4 h-4" />
              {openTickets} ticket{(openTickets ?? 0) !== 1 ? 's' : ''} pendiente{(openTickets ?? 0) !== 1 ? 's' : ''}
            </Link>
          )}
          <a
            href="/api/admin/export/clients"
            className="flex items-center gap-2 text-[#A09CB0] hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-semibold transition"
          >
            <Download className="w-4 h-4" /> CSV
          </a>
          <Link href="/admin/clientes"
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            Clientes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="MRR Total CLP"
          value={`$${(mrr/1000).toFixed(0)}K`}
          sub={`ARR: $${(arr/1000000).toFixed(1)}M · ${paidClients ?? 0} clientes pagos`}
          icon={DollarSign}
          gradient="from-violet-600/30 to-purple-600/10 border-violet-500/20"
        />
        <StatCard
          label="Clientes Totales"
          value={clientsTotal ?? 0}
          sub={`${trialClients ?? 0} trial · ${paidClients ?? 0} pagos · ${suspendedClients ?? 0} suspendidos`}
          icon={Users}
          gradient="from-blue-600/30 to-cyan-600/10 border-blue-500/20"
        />
        <StatCard
          label="Bots Activos"
          value={`${botsActive ?? 0}/${botsTotal ?? 0}`}
          sub="bots encendidos vs total configurados"
          icon={Bot}
          gradient="from-emerald-600/30 to-teal-600/10 border-emerald-500/20"
        />
        <StatCard
          label="Leads Hoy"
          value={leadsToday ?? 0}
          sub={`${leadsTotal ?? 0} leads acumulados en total`}
          icon={Target}
          gradient="from-orange-600/30 to-amber-600/10 border-orange-500/20"
        />
        <StatCard
          label="Conversión Trial→Pago"
          value={`${conversionRate}%`}
          sub={`${paidClients ?? 0} de ${clientsTotal ?? 0} clientes son pagos`}
          icon={TrendingUp}
          gradient="from-pink-600/30 to-rose-600/10 border-pink-500/20"
        />
        <StatCard
          label="Tickets Abiertos"
          value={openTickets ?? 0}
          sub={(openTickets ?? 0) > 0 ? 'Requieren atención — ver tickets' : 'Sin tickets pendientes ✓'}
          icon={TicketIcon}
          gradient={(openTickets ?? 0) > 0 ? 'from-red-600/30 to-orange-600/10 border-red-500/20' : 'from-white/5 to-white/[0.02] border-white/10'}
          alert={(openTickets ?? 0) > 0}
        />
        <StatCard
          label="Riesgo de Churn"
          value={churnRiskCount ?? 0}
          sub="trials venciendo en ≤3 días"
          icon={AlertCircle}
          gradient={(churnRiskCount ?? 0) > 0 ? 'from-red-600/30 to-rose-600/10 border-red-500/20' : 'from-white/5 to-white/[0.02] border-white/10'}
          alert={(churnRiskCount ?? 0) > 0}
        />
        <StatCard
          label="Salud Plataforma"
          value={`${healthScore}%`}
          sub={`${inactiveBotsCount ?? 0} bots inactivos de ${botsTotal ?? 0}`}
          icon={Activity}
          gradient={healthScore >= 80 ? 'from-emerald-600/30 to-teal-600/10 border-emerald-500/20' : 'from-amber-600/30 to-orange-600/10 border-amber-500/20'}
        />
      </div>

      {/* ── Charts ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-white text-sm">Analytics</span>
          <span className="text-[11px] text-[#A09CB0] ml-1">MRR · Signups · Distribución planes</span>
        </div>
        <div className="p-4">
          <AdminCharts mrrHistory={mrrHistory} weeklySignups={weeklySignups} planDist={planDist} />
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white text-sm">Actividad Reciente</span>
          </div>
          <span className="text-[11px] text-[#A09CB0]">Últimas 12 acciones</span>
        </div>
        <div className="p-2">
          {(recentActivity ?? []).length === 0 ? (
            <div className="py-10 text-center text-[#A09CB0] text-sm">Sin actividad registrada aún</div>
          ) : (recentActivity ?? []).map((log: any) => {
            const meta = log.metadata as Record<string, string> | null
            return (
              <ActivityRow
                key={log.id}
                event={log.event}
                module={log.module}
                createdAt={log.created_at}
                clientId={meta?.client_id}
                details={meta?.details}
              />
            )
          })}
        </div>
      </div>

      {/* ── Quick nav ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/admin/clientes',  label: 'Clientes',   icon: Users,      color: 'text-blue-400' },
          { href: '/admin/bots',      label: 'Bots',       icon: Bot,        color: 'text-emerald-400' },
          { href: '/admin/pagos',     label: 'Pagos',      icon: DollarSign, color: 'text-purple-400' },
          { href: '/admin/tickets',   label: 'Tickets',    icon: TicketIcon, color: 'text-amber-400' },
          { href: '/admin/leads',     label: 'Leads',      icon: Target,     color: 'text-orange-400' },
          { href: '/admin/alertas',   label: 'Alertas',    icon: AlertCircle,color: 'text-red-400' },
          { href: '/admin/auditorias',label: 'Auditorías', icon: Activity,   color: 'text-cyan-400' },
          { href: '/admin/settings',  label: 'Config',     icon: Zap,        color: 'text-pink-400' },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition group"
          >
            <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
            <span className="text-sm font-semibold text-white/70 group-hover:text-white transition">{label}</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 ml-auto transition" />
          </Link>
        ))}
      </div>
    </div>
  )
}

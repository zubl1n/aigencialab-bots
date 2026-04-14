import { createClient } from '@supabase/supabase-js';
import { PLANS, formatPrice } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { data: subs },
    { count: clientsTotal },
    { count: botsActive },
    { count: botsTotal },
    { count: leadsTotal },
    { count: leadsToday },
    { count: trialClients },
    { count: paidClients },
  ] = await Promise.all([
    supabase.from('subscriptions').select('plan, status').eq('status', 'active'),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('bot_configs').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('bot_configs').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().slice(0, 10)),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  const mrr = (subs || []).reduce((acc, s) => {
    const plan = PLANS[s.plan as keyof typeof PLANS];
    return acc + (plan?.price ?? 0);
  }, 0);

  const arr = mrr * 12;
  const conversionRate = (clientsTotal || 0) > 0
    ? Math.round(((paidClients || 0) / (clientsTotal || 1)) * 100)
    : 0;

  const metrics = [
    { label: 'MRR Total', value: formatPrice(mrr), sub: `ARR: ${formatPrice(arr)}`, color: 'border-purple-500' },
    { label: 'Clientes', value: String(clientsTotal ?? 0), sub: `${trialClients ?? 0} en trial`, color: 'border-blue-500' },
    { label: 'Bots Activos', value: `${botsActive ?? 0} / ${botsTotal ?? 0}`, sub: 'activos / total', color: 'border-green-500' },
    { label: 'Leads Hoy', value: String(leadsToday ?? 0), sub: `${leadsTotal ?? 0} total`, color: 'border-orange-500' },
    { label: 'Conversión Trial→Paid', value: `${conversionRate}%`, sub: `${paidClients ?? 0} clientes pagos`, color: 'border-pink-500' },
    { label: 'ARR Proyectado', value: formatPrice(arr), sub: '12x MRR actual', color: 'border-indigo-500' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vista General</h1>
          <p className="text-gray-500 mt-1">Métricas en tiempo real de AIgenciaLab</p>
        </div>
        <div className="text-sm text-gray-400">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {metrics.map(m => (
          <div key={m.label} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${m.color} border border-gray-100`}>
            <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">{m.label}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{m.value}</div>
            <div className="text-xs text-gray-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* CHARTS PLACEHOLDER — would use recharts in a client component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Nuevos registros (últimos 30 días)</h3>
          <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
            <span>📈 Gráfico de línea — integrar recharts aquí</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Distribución de planes</h3>
          <div className="space-y-3">
            {Object.values(PLANS).map(p => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium text-xs">
                  {(subs || []).filter(s => s.plan === p.name).length} clientes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

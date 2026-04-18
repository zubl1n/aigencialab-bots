import { createClient } from '@supabase/supabase-js';
import { PLANS, formatCLP } from '@/config/plans';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPagos() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: billing } = await supabase
    .from('billing_profiles')
    .select(`
      id, payment_status, mp_customer_id, mp_payment_id, updated_at,
      clients(id, email, company_name, plan)
    `)
    .order('updated_at', { ascending: false });

  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('plan, status, created_at')
    .eq('status', 'active');

  const { count: totalClients } = await supabase.from('clients')
    .select('id', { count: 'exact', head: true });

  const { count: churned } = await supabase.from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'cancelled');

  const mrr = (activeSubs ?? []).reduce((acc, s) => {
    const slug = (s.plan ?? '').toLowerCase() as keyof typeof PLANS;
    const p = PLANS[slug];
    return acc + (p?.monthlyPriceCLP ?? 0);
  }, 0);

  const arr = mrr * 12;
  const activeCount = activeSubs?.length ?? 0;
  const churnRate = (totalClients ?? 0) > 0 ? Math.round(((churned ?? 0) / (totalClients ?? 1)) * 100) : 0;
  const ltv = activeCount > 0 ? Math.round(mrr / Math.max(activeCount, 1) * 12) : 0;
  const failedPayments = (billing ?? []).filter(b => b.payment_status === 'failed');

  const BADGE: Record<string, { label: string; cls: string }> = {
    approved: { label: '✓ Aprobado', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    pending:  { label: '⏳ Pendiente', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    failed:   { label: '✗ Fallido', cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pagos & Suscripciones</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vista financiera completa del platform</p>
        </div>
        <a href="/api/admin/export/billing"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition">
          📥 Exportar
        </a>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'MRR', value: formatCLP(mrr), border: 'border-purple-500/20', color: 'text-purple-400' },
          { label: 'ARR', value: formatCLP(arr), border: 'border-blue-500/20', color: 'text-blue-400' },
          { label: 'LTV (avg/año)', value: formatCLP(ltv), border: 'border-teal-500/20', color: 'text-teal-400' },
          { label: 'Churn Rate', value: `${churnRate}%`, border: churnRate > 10 ? 'border-red-500/20' : 'border-emerald-500/20', color: churnRate > 10 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Pagos Fallidos', value: String(failedPayments.length), border: failedPayments.length > 0 ? 'border-red-500/20' : 'border-white/5', color: failedPayments.length > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(kpi => (
          <div key={kpi.label} className={`glass rounded-2xl border ${kpi.border} p-5`}>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Failed payments alert */}
      {failedPayments.length > 0 && (
        <div className="glass border border-red-500/20 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-red-400 text-sm">⚠️ Pagos fallidos que requieren atención</h3>
          <div className="space-y-2">
            {failedPayments.map(b => {
              const client = b.clients as any;
              return (
                <div key={b.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                  <div>
                    <Link href={`/admin/clientes/${client?.id}`} className="font-semibold text-white text-sm hover:text-purple-400 transition">
                      {client?.company_name ?? client?.email}
                    </Link>
                    <span className="text-gray-600 text-xs ml-2">{client?.plan}</span>
                  </div>
                  <div className="text-[10px] text-gray-700">{new Date(b.updated_at).toLocaleDateString('es-CL')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payments table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="font-bold text-white text-sm">Historial de Pagos</h3>
          <span className="text-[10px] text-gray-700">{(billing ?? []).length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Cliente', 'Plan', 'Monto', 'Estado MP', 'Payment ID', 'Fecha'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(billing ?? []).map(b => {
                const client = b.clients as any;
                const slug = (client?.plan ?? '').toLowerCase() as keyof typeof PLANS;
                const plan = PLANS[slug];
                const bg = BADGE[b.payment_status ?? ''] ?? { label: '— sin pago', cls: 'text-gray-600 bg-white/5 border-white/10' };
                return (
                  <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-white text-xs">{client?.company_name ?? '—'}</div>
                      <div className="text-[10px] text-gray-700">{client?.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {client?.plan ?? 'Starter'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-white text-xs">{plan ? formatCLP(plan.monthlyPriceCLP) : '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${bg.cls}`}>{bg.label}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-[10px] text-gray-700">{b.mp_payment_id ?? '—'}</td>
                    <td className="px-5 py-3 text-[10px] text-gray-600">{new Date(b.updated_at).toLocaleDateString('es-CL')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!billing?.length && (
          <div className="py-16 text-center text-gray-600">No hay registros de pago.</div>
        )}
      </div>
    </div>
  );
}

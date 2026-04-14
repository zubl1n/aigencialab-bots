import { createClient } from '@supabase/supabase-js';
import { PLANS, formatPrice } from '@/lib/plans';

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
    .select('plan')
    .eq('status', 'active');

  const mrr = (activeSubs ?? []).reduce((acc, s) => {
    const p = PLANS[s.plan as keyof typeof PLANS];
    return acc + (p?.price ?? 0);
  }, 0);

  const failedPayments = (billing ?? []).filter(b => b.payment_status === 'failed');

  const badge = (status: string | null) => {
    const map: Record<string, { label: string; cls: string }> = {
      approved: { label: '✓ Aprobado', cls: 'bg-green-100 text-green-700' },
      pending:  { label: '⏳ Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
      failed:   { label: '✗ Fallido',   cls: 'bg-red-100 text-red-700' },
    };
    const s = map[status ?? ''] ?? { label: '— sin pago', cls: 'bg-gray-100 text-gray-500' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pagos & Suscripciones</h1>
        <p className="text-gray-500 mt-1">Vista financiera completa</p>
      </div>

      {/* MRR SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500 border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">MRR Actual</div>
          <div className="text-3xl font-bold text-gray-900">{formatPrice(mrr)}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500 border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">ARR Proyectado</div>
          <div className="text-3xl font-bold text-gray-900">{formatPrice(mrr * 12)}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500 border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Pagos Fallidos</div>
          <div className="text-3xl font-bold text-red-600">{failedPayments.length}</div>
        </div>
      </div>

      {/* FAILED PAYMENTS ALERT */}
      {failedPayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <h3 className="font-bold text-red-800 mb-3">⚠️ Pagos fallidos que requieren atención</h3>
          <div className="space-y-2">
            {failedPayments.map(b => {
              const client = b.clients as any;
              return (
                <div key={b.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                  <div>
                    <span className="font-semibold text-gray-900">{client?.company_name ?? client?.email}</span>
                    <span className="text-gray-400 text-sm ml-2">{client?.plan}</span>
                  </div>
                  <div className="text-xs text-gray-400">{new Date(b.updated_at).toLocaleDateString('es-CL')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAYMENTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Todos los pagos</h3>
          <a
            href="/api/leads/export"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            📥 Exportar reporte pagos
          </a>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Monto</th>
              <th className="px-6 py-4">Estado MP</th>
              <th className="px-6 py-4">MP Payment ID</th>
              <th className="px-6 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(billing ?? []).map(b => {
              const client = b.clients as any;
              const plan = PLANS[client?.plan as keyof typeof PLANS];
              return (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{client?.company_name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{client?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {client?.plan ?? 'Starter'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {plan ? formatPrice(plan.price) : 'Gratis'}
                  </td>
                  <td className="px-6 py-4">{badge(b.payment_status)}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    {b.mp_payment_id ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(b.updated_at).toLocaleDateString('es-CL')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!billing?.length && (
          <div className="py-16 text-center text-gray-400">No hay registros de pago.</div>
        )}
      </div>
    </div>
  );
}

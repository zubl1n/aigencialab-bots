import { createClient } from '@supabase/supabase-js';
import { PLANS, formatPrice } from '@/lib/plans';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function PaymentBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: '✓ Verificado', cls: 'bg-green-100 text-green-700' },
    pending:  { label: '⏳ Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
    failed:   { label: '✗ Fallido',   cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status ?? ''] ?? { label: '— Trial', cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

function SubStatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    active:   'bg-green-100 text-green-700',
    trialing: 'bg-blue-100 text-blue-700',
    past_due: 'bg-red-100 text-red-700',
    canceled: 'bg-gray-200 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>
      {status ?? 'sin plan'}
    </span>
  );
}

export default async function AdminClientes({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id, email, company_name, full_name, phone, plan, status, created_at,
      subscriptions(status, current_period_end, plan),
      bot_configs(id, active, created_at),
      billing_profiles(payment_status, card_brand, card_last4, mp_customer_id),
      api_keys(key),
      leads(id)
    `)
    .order('created_at', { ascending: false });

  const planFilter = searchParams?.plan;
  const payFilter  = searchParams?.payment;
  const search     = searchParams?.q?.toLowerCase() ?? '';

  const filtered = (clients ?? []).filter(c => {
    if (search && !c.email?.toLowerCase().includes(search) && !c.company_name?.toLowerCase().includes(search)) return false;
    if (planFilter && c.plan !== planFilter) return false;
    const payStatus = (c.billing_profiles as any[])?.[0]?.payment_status;
    if (payFilter && payStatus !== payFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{filtered.length} clientes encontrados</p>
        </div>
      </div>

      {/* FILTERS */}
      <form method="GET" className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <input
          name="q"
          defaultValue={search}
          placeholder="Buscar por nombre o email…"
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <select name="plan" defaultValue={planFilter ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos los planes</option>
          <option value="Starter">Starter</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select name="payment" defaultValue={payFilter ?? ''} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos los estados de pago</option>
          <option value="approved">Verificado</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
          Filtrar
        </button>
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Suscripción</th>
              <th className="px-6 py-4">Pago MP</th>
              <th className="px-6 py-4">Bot</th>
              <th className="px-6 py-4">Leads</th>
              <th className="px-6 py-4">Registrado</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c, i) => {
              const sub    = (c.subscriptions as any[])?.[0];
              const bot    = (c.bot_configs as any[])?.[0];
              const billing = (c.billing_profiles as any[])?.[0];
              const apiKey  = (c.api_keys as any[])?.[0]?.key;
              const leadsCount = (c.leads as any[])?.length ?? 0;
              const plan = PLANS[c.plan as keyof typeof PLANS];

              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{c.company_name ?? c.full_name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{c.email}</div>
                    {billing?.mp_customer_id && (
                      <a
                        href={`https://www.mercadopago.cl/subscriptions/${billing.mp_customer_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-500 hover:underline"
                      >
                        Ver en MP ↗
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {c.plan ?? 'Starter'}
                    </span>
                    {plan && <div className="text-xs text-gray-400 mt-1">{formatPrice(plan.price)}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <SubStatusBadge status={sub?.status ?? null} />
                    {sub?.current_period_end && (
                      <div className="text-xs text-gray-400 mt-1">
                        hasta {new Date(sub.current_period_end).toLocaleDateString('es-CL')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <PaymentBadge status={billing?.payment_status ?? null} />
                    {billing?.card_brand && (
                      <div className="text-xs text-gray-400 mt-1">
                        {billing.card_brand} •••• {billing.card_last4}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${bot?.active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-xs text-gray-600">{bot?.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/leads?client=${c.id}`} className="text-purple-600 hover:underline font-semibold">
                      {leadsCount}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                      <form action="/api/admin/toggle-bot" method="POST" className="inline">
                        <input type="hidden" name="client_id" value={c.id} />
                        <input type="hidden" name="active" value={bot?.active ? 'false' : 'true'} />
                        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg w-full ${bot?.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'} transition`}>
                          {bot?.active ? 'Desactivar Bot' : 'Activar Bot'}
                        </button>
                      </form>
                      <Link
                        href={`/admin/leads?client=${c.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-center"
                      >
                        Ver Leads
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">No se encontraron clientes con los filtros actuales.</div>
        )}
      </div>
    </div>
  );
}

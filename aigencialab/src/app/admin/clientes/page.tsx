import { createClient } from '@supabase/supabase-js';
import { PLANS, formatPrice } from '@/lib/plans';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

/* ── Badge Components ──────────────────────────────────────── */

function StatusBadge({ status, trialEnd }: { status: string | null; trialEnd?: string | null }) {
  const now = new Date();
  const isTrialExpired = trialEnd && new Date(trialEnd) < now;

  let label: string;
  let cls: string;

  if (status === 'active') {
    label = '✓ Activo';
    cls = 'bg-emerald-100 text-emerald-700';
  } else if (status === 'suspended') {
    label = '⛔ Suspendido';
    cls = 'bg-red-100 text-red-700';
  } else if (isTrialExpired) {
    label = '⏰ Vencido';
    cls = 'bg-orange-100 text-orange-700';
  } else if (status === 'trialing' || status === 'pending' || status === 'onboarding') {
    label = '🧪 Trial';
    cls = 'bg-blue-100 text-blue-700';
  } else {
    label = status ?? 'Sin estado';
    cls = 'bg-gray-100 text-gray-600';
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: '✓ Verificado', cls: 'bg-green-100 text-green-700' },
    pending:  { label: '⏳ Pendiente', cls: 'bg-yellow-100 text-yellow-700' },
    failed:   { label: '✗ Fallido',   cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status ?? ''] ?? { label: '— Sin MP', cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

/* ── Main Page ─────────────────────────────────────────────── */

export default async function AdminClientes({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Parse params
  const search     = (params?.q ?? '').toLowerCase();
  const planFilter = params?.plan ?? '';
  const statusFilter = params?.status ?? '';
  const currentPage = Math.max(0, parseInt(params?.page ?? '0', 10));

  // Build query
  let query = supabase
    .from('clients')
    .select(`
      id, email, company_name, company, full_name, contact_name, phone, plan, status, created_at,
      subscriptions(status, current_period_end, plan, trial_ends_at),
      bot_configs(id, active, created_at),
      billing_profiles(payment_status, card_brand, card_last4, mp_customer_id),
      api_keys(key),
      leads(id)
    `, { count: 'exact' });

  // Server-side filters
  if (search) {
    query = query.or(`email.ilike.%${search}%,company_name.ilike.%${search}%,company.ilike.%${search}%,contact_name.ilike.%${search}%,full_name.ilike.%${search}%`);
  }
  if (planFilter) {
    query = query.eq('plan', planFilter);
  }
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: clients, count: totalCount } = await query
    .order('created_at', { ascending: false })
    .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

  const total = totalCount ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rows = clients ?? [];

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{total} clientes en total · Página {currentPage + 1} de {Math.max(1, totalPages)}</p>
        </div>
        <a
          href="/api/admin/export/clients"
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
        >
          ⬇️ Exportar CSV
        </a>
      </div>

      {/* FILTERS */}
      <form method="GET" className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <input
          name="q"
          defaultValue={search}
          placeholder="Buscar por nombre o email…"
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <select name="plan" defaultValue={planFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos los planes</option>
          <option value="Starter">Starter</option>
          <option value="Pro">Pro</option>
          <option value="Business">Business</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="pending">Pendiente/Trial</option>
          <option value="onboarding">Onboarding</option>
          <option value="suspended">Suspendido</option>
          <option value="paused">Pausado</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
          Filtrar
        </button>
        {(search || planFilter || statusFilter) && (
          <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600 self-center">
            Limpiar filtros
          </Link>
        )}
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Pago MP</th>
              <th className="px-6 py-4">Bot</th>
              <th className="px-6 py-4">Leads</th>
              <th className="px-6 py-4">Registrado</th>
              <th className="px-6 py-4">Último acceso</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((c: any, i: number) => {
              const sub     = (c.subscriptions as any[])?.[0];
              const bot     = (c.bot_configs as any[])?.[0];
              const billing = (c.billing_profiles as any[])?.[0];
              const leadsCount = (c.leads as any[])?.length ?? 0;
              const plan = PLANS[c.plan as keyof typeof PLANS];
              const displayName = c.company_name || c.company || c.full_name || c.contact_name || '—';
              const displayEmail = c.email ?? '—';
              const trialEnd = sub?.trial_ends_at ?? sub?.current_period_end;
              const subStatus = sub?.status ?? c.status;

              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">{currentPage * PAGE_SIZE + i + 1}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/clientes/${c.id}`} className="group">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{displayName}</div>
                      <div className="text-gray-400 text-xs">{displayEmail}</div>
                    </Link>
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
                    <StatusBadge status={subStatus} trialEnd={trialEnd} />
                    {trialEnd && (
                      <div className="text-xs text-gray-400 mt-1">
                        hasta {new Date(trialEnd).toLocaleDateString('es-CL')}
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
                  <td className="px-6 py-4 text-xs text-gray-400">
                    —
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
                        href={`/admin/clientes/${c.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition text-center"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-16 text-center text-gray-400">No se encontraron clientes con los filtros actuales.</div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 0 && (
            <Link
              href={`/admin/clientes?page=${currentPage - 1}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              ← Anterior
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const pageNum = i;
            return (
              <Link
                key={pageNum}
                href={`/admin/clientes?page=${pageNum}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${pageNum === currentPage ? 'bg-purple-600 text-white' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
              >
                {pageNum + 1}
              </Link>
            );
          })}
          {currentPage < totalPages - 1 && (
            <Link
              href={`/admin/clientes?page=${currentPage + 1}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import { PLANS, formatPrice } from '@/lib/plans';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_SIZE = 25;

/* ── Badges ───────────────────────────────────────────────────── */

function PlanBadge({ plan }: { plan: string | null }) {
  const colors: Record<string, string> = {
    Starter:    'bg-blue-100 text-blue-700',
    Pro:        'bg-purple-100 text-purple-700',
    Business:   'bg-indigo-100 text-indigo-700',
    Enterprise: 'bg-orange-100 text-orange-700',
  };
  const p = plan ?? 'Starter';
  const cls = colors[p] ?? 'bg-gray-100 text-gray-600';
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{p}</span>;
}

function StatusBadge({ status, trialEnd }: { status: string | null; trialEnd?: string | null }) {
  const now = new Date();
  const expired = trialEnd && new Date(trialEnd) < now;
  if (status === 'active')     return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">✓ Activo</span>;
  if (status === 'suspended')  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">⛔ Suspendido</span>;
  if (expired)                 return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">⏰ Trial vencido</span>;
  if (status === 'trialing' || status === 'pending') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">🧪 Trial</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{status ?? '—'}</span>;
}

function BotBadge({ active }: { active: boolean | null }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Activo</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Inactivo</span>;
}

/* ── Main Page ─────────────────────────────────────────────────── */

export default async function AdminClientes({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const search       = (params?.q ?? '').trim();
  const planFilter   = params?.plan   ?? '';
  const statusFilter = params?.status ?? '';
  const currentPage  = Math.max(0, parseInt(params?.page ?? '0', 10));

  // Use service role — bypasses ALL RLS policies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let clients: any[] = [];
  let totalCount = 0;
  let queryError: string | null = null;

  try {
    // Only query columns that actually exist in the clients table schema
    let query = supabase
      .from('clients')
      .select(`
        id,
        email,
        company_name,
        company,
        contact_name,
        plan,
        status,
        created_at,
        trial_ends_at,
        payment_status,
        subscriptions ( status, plan, trial_ends_at, current_period_end ),
        bot_configs   ( id, active, created_at, bot_name ),
        billing_profiles ( payment_status, card_brand, card_last4, mp_customer_id ),
        leads         ( id )
      `, { count: 'exact' });

    // Search across text columns that exist
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,company_name.ilike.%${search}%,company.ilike.%${search}%,contact_name.ilike.%${search}%`
      );
    }
    if (planFilter)   query = query.ilike('plan', planFilter);
    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (error) {
      queryError = error.message;
      console.error('[admin/clientes] query error:', error.message, error.details, error.hint);
    } else {
      clients    = data ?? [];
      totalCount = count ?? 0;
    }
  } catch (err: any) {
    queryError = err.message;
    console.error('[admin/clientes] exception:', err);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {queryError
              ? <span className="text-red-500">⚠ Error DB: {queryError}</span>
              : <>{totalCount} clientes en total · Página {currentPage + 1} de {totalPages}</>
            }
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/admin/export/clients"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            ⬇️ CSV
          </a>
          <Link
            href="/api/admin/sync-clients"
            className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            🔄 Sync Auth→Clients
          </Link>
        </div>
      </div>

      {/* Debug banner — only in dev or when there's an error */}
      {queryError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-mono">
          <strong>Error de base de datos:</strong> {queryError}
          <br /><br />
          Ejecutar <code>supabase/migrations/20260416_fix_auth_clients_sync.sql</code> en Supabase.
        </div>
      )}

      {/* FILTERS */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <input
          name="q"
          defaultValue={search}
          placeholder="Buscar email, empresa, nombre…"
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <select name="plan" defaultValue={planFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los planes</option>
          <option value="Starter">Starter</option>
          <option value="Pro">Pro</option>
          <option value="Business">Business</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="trialing">Trial</option>
          <option value="pending">Pendiente</option>
          <option value="suspended">Suspendido</option>
        </select>
        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
          Filtrar
        </button>
        {(search || planFilter || statusFilter) && (
          <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600 self-center">
            × Limpiar
          </Link>
        )}
      </form>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Plan</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Bot</th>
              <th className="px-5 py-4">Pago MP</th>
              <th className="px-5 py-4">Leads</th>
              <th className="px-5 py-4">Registrado</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.map((c: any, i: number) => {
              const sub      = (c.subscriptions as any[])?.[0];
              const bot      = (c.bot_configs as any[])?.[0];
              const billing  = (c.billing_profiles as any[])?.[0];
              const leadsN   = (c.leads as any[])?.length ?? 0;
              const name     = c.company_name || c.company || c.contact_name || c.email?.split('@')[0] || '—';
              const trialEnd = sub?.trial_ends_at ?? c.trial_ends_at;
              const subStatus = sub?.status ?? c.status;

              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">{currentPage * PAGE_SIZE + i + 1}</td>

                  {/* Cliente */}
                  <td className="px-5 py-4">
                    <Link href={`/admin/clientes/${c.id}`} className="group">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{name}</div>
                      <div className="text-gray-400 text-xs">{c.email}</div>
                    </Link>
                    {billing?.mp_customer_id && (
                      <div className="text-xs text-purple-500 mt-0.5">MP ID: {billing.mp_customer_id.slice(0, 12)}…</div>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="px-5 py-4">
                    <PlanBadge plan={c.plan} />
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <StatusBadge status={subStatus} trialEnd={trialEnd} />
                    {trialEnd && (
                      <div className="text-xs text-gray-400 mt-1">
                        hasta {new Date(trialEnd).toLocaleDateString('es-CL')}
                      </div>
                    )}
                  </td>

                  {/* Bot */}
                  <td className="px-5 py-4">
                    <BotBadge active={bot?.active ?? false} />
                    {bot?.bot_name && <div className="text-xs text-gray-400 mt-0.5">{bot.bot_name}</div>}
                  </td>

                  {/* Pago MP */}
                  <td className="px-5 py-4">
                    {billing?.card_last4 ? (
                      <div>
                        <span className="text-xs text-gray-700 font-medium">{billing.card_brand ?? 'Tarjeta'} ••{billing.card_last4}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin tarjeta</span>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">{c.payment_status ?? billing?.payment_status ?? '—'}</div>
                  </td>

                  {/* Leads */}
                  <td className="px-5 py-4">
                    <Link href={`/admin/leads?client=${c.id}`} className="text-purple-600 hover:underline font-bold text-sm">
                      {leadsN}
                    </Link>
                  </td>

                  {/* Registrado */}
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('es-CL') : '—'}
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5 min-w-[130px]">
                      {/* Toggle bot */}
                      <form action="/api/admin/toggle-bot" method="POST">
                        <input type="hidden" name="client_id" value={c.id} />
                        <input type="hidden" name="active" value={bot?.active ? 'false' : 'true'} />
                        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg w-full transition ${bot?.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {bot?.active ? '⏸ Desactivar Bot' : '▶ Activar Bot'}
                        </button>
                      </form>
                      {/* Ver detalle */}
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition text-center"
                      >
                        Ver Detalle →
                      </Link>
                      {/* Cambio de plan rápido */}
                      <form action="/api/admin/set-plan" method="POST" className="flex gap-1">
                        <input type="hidden" name="client_id" value={c.id} />
                        <select name="plan" defaultValue={c.plan ?? 'Starter'} className="flex-1 text-xs border border-gray-200 rounded-lg px-1 py-1">
                          <option value="Starter">Starter</option>
                          <option value="Pro">Pro</option>
                          <option value="Business">Business</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                        <button type="submit" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg font-semibold transition">
                          ✓
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {clients.length === 0 && !queryError && (
          <div className="py-16 text-center text-gray-400">
            {search || planFilter || statusFilter
              ? 'No se encontraron clientes con los filtros actuales.'
              : 'No hay clientes registrados aún.'}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {currentPage > 0 && (
            <Link
              href={`/admin/clientes?page=${currentPage - 1}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >← Anterior</Link>
          )}
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <Link
              key={i}
              href={`/admin/clientes?page=${i}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${i === currentPage ? 'bg-purple-600 text-white' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}
            >{i + 1}</Link>
          ))}
          {currentPage < totalPages - 1 && (
            <Link
              href={`/admin/clientes?page=${currentPage + 1}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >Siguiente →</Link>
          )}
        </div>
      )}
    </div>
  );
}

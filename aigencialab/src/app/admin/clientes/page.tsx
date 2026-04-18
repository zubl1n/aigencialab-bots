import { createClient } from '@supabase/supabase-js';
import { PLANS, formatCLP } from '@/config/plans';

import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_SIZE = 25;

/* ─── Badges ─────────────────────────────────────────────── */
function PlanBadge({ plan }: { plan: string | null }) {
  const map: Record<string, string> = {
    basic:      'bg-gray-100 text-gray-700',
    starter:    'bg-blue-100 text-blue-700',
    pro:        'bg-purple-100 text-purple-700',
    enterprise: 'bg-orange-100 text-orange-700',
  };
  const p = (plan ?? 'basic').toLowerCase();
  const label = PLANS[p as keyof typeof PLANS]?.name ?? plan ?? 'Basic';
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[p] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}


function StatusBadge({ status, trialEnd }: { status: string | null; trialEnd?: string | null }) {
  const expired = trialEnd && new Date(trialEnd) < new Date();
  if (status === 'active')                          return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">✓ Activo</span>;
  if (status === 'suspended')                       return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">⛔ Suspendido</span>;
  if (expired)                                      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">⏰ Trial vencido</span>;
  if (status === 'trialing' || status === 'pending') return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">🧪 Trial</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{status ?? '—'}</span>;
}

/* ─── Page ───────────────────────────────────────────────── */
export default async function AdminClientes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search       = (params.q ?? '').trim();
  const planFilter   = params.plan   ?? '';
  const statusFilter = params.status ?? '';
  const currentPage  = Math.max(0, parseInt(params.page ?? '0', 10));
  const syncMsg      = params.sync ?? '';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let clients:    any[] = [];
  let totalCount: number = 0;
  let queryError: string | null = null;

  /* ── Query 1: Clients (simple, no nested relations) ─────── */
  try {
    let q = supabase
      .from('clients')
      .select('id, email, company_name, company, contact_name, plan, status, created_at, trial_ends_at, payment_status', { count: 'exact' });

    if (search)       q = q.or(`email.ilike.%${search}%,company_name.ilike.%${search}%,company.ilike.%${search}%,contact_name.ilike.%${search}%`);
    if (planFilter)   q = q.ilike('plan', planFilter);
    if (statusFilter) q = q.eq('status', statusFilter);

    const { data, count, error } = await q
      .order('created_at', { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (error) throw error;
    clients    = data ?? [];
    totalCount = count ?? 0;
  } catch (err: any) {
    queryError = err.message;
    console.error('[admin/clientes] clients query error:', err.message);
  }

  /* ── Query 2: Bot configs for the returned client IDs ───── */
  const clientIds = clients.map(c => c.id);
  let botsMap:     Record<string, any> = {};
  let subsMap:     Record<string, any> = {};
  let billingMap:  Record<string, any> = {};
  let leadsCount:  Record<string, number> = {};

  if (clientIds.length > 0) {
    // Bots
    const { data: bots } = await supabase
      .from('bot_configs')
      .select('client_id, id, active, bot_name')
      .in('client_id', clientIds);
    (bots ?? []).forEach(b => { botsMap[b.client_id] = b; });

    // Subscriptions
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('client_id, status, plan, trial_ends_at, current_period_end')
      .in('client_id', clientIds);
    (subs ?? []).forEach(s => { subsMap[s.client_id] = s; });

    // Billing profiles
    const { data: billing } = await supabase
      .from('billing_profiles')
      .select('client_id, payment_status, card_brand, card_last4, mp_customer_id')
      .in('client_id', clientIds);
    (billing ?? []).forEach(b => { billingMap[b.client_id] = b; });

    // Lead counts
    const { data: leads } = await supabase
      .from('leads')
      .select('client_id')
      .in('client_id', clientIds);
    (leads ?? []).forEach(l => {
      leadsCount[l.client_id] = (leadsCount[l.client_id] ?? 0) + 1;
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {queryError
              ? <span className="text-red-500 font-medium">⚠ DB error</span>
              : <>{totalCount} registros · Página {currentPage + 1} de {totalPages}</>
            }
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <a href="/api/admin/export/clients"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
            ⬇ CSV
          </a>
          <a href="/api/admin/sync-clients"
            className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
            🔄 Sync Auth→Clients
          </a>
        </div>
      </div>

      {/* Sync result banner */}
      {syncMsg === 'ok' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          ✅ Sincronización completada — {params.inserted ?? 0} usuarios procesados
        </div>
      )}

      {/* DB Error banner */}
      {queryError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-mono break-all">
          <strong>Error de base de datos:</strong> {queryError}
        </div>
      )}

      {/* FILTERS */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <input name="q" defaultValue={search} placeholder="Buscar email, empresa, nombre…"
          className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <select name="plan" defaultValue={planFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos los planes</option>
          {Object.values(PLANS).map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
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
          <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-gray-600 self-center">× Limpiar</Link>
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
              <th className="px-5 py-4">Health</th>
              <th className="px-5 py-4">Registrado</th>
              <th className="px-5 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.map((c, i) => {
              const bot      = botsMap[c.id];
              const sub      = subsMap[c.id];
              const billing  = billingMap[c.id];
              const nLeads   = leadsCount[c.id] ?? 0;
              const name     = c.company_name || c.company || c.contact_name || c.email?.split('@')[0] || '—';
              const trialEnd = sub?.trial_ends_at ?? c.trial_ends_at;
              const subStatus = sub?.status ?? c.status;
              const planSlug  = (c.plan ?? 'basic').toLowerCase() as keyof typeof PLANS;
              const planInfo  = PLANS[planSlug];


              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-400 text-xs font-mono">{currentPage * PAGE_SIZE + i + 1}</td>

                  {/* Cliente */}
                  <td className="px-5 py-4">
                    <Link href={`/admin/clientes/${c.id}`} className="group">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{name}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{c.email}</div>
                    </Link>
                    {billing?.mp_customer_id && (
                      <div className="text-xs text-purple-400 mt-0.5">MP: {String(billing.mp_customer_id).slice(0,12)}…</div>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="px-5 py-4">
                    <PlanBadge plan={c.plan} />
                    {planInfo && <div className="text-xs text-gray-400 mt-1">{formatCLP(planInfo.monthlyPriceCLP)}/mes</div>}

                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <StatusBadge status={subStatus} trialEnd={trialEnd} />
                    {trialEnd && <div className="text-xs text-gray-400 mt-1">hasta {new Date(trialEnd).toLocaleDateString('es-CL')}</div>}
                  </td>

                  {/* Bot */}
                  <td className="px-5 py-4">
                    {bot ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bot.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${bot.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {bot.active ? 'Activo' : 'Inactivo'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin bot</span>
                    )}
                  </td>

                  {/* Pago */}
                  <td className="px-5 py-4">
                    {billing?.card_last4
                      ? <div className="text-xs font-medium text-gray-700">{billing.card_brand ?? '••'} ••{billing.card_last4}</div>
                      : <span className="text-xs text-gray-400 italic">Sin tarjeta</span>
                    }
                    <div className="text-xs text-gray-400 mt-0.5">{c.payment_status ?? billing?.payment_status ?? '—'}</div>
                  </td>

                  {/* Leads */}
                  <td className="px-5 py-4">
                    <Link href={`/admin/leads?client=${c.id}`}
                      className="text-purple-600 hover:underline font-bold text-sm">{nLeads}</Link>
                  </td>

                  {/* Health Score */}
                  <td className="px-5 py-4">
                    {(() => {
                      let score = 0;
                      if (bot?.active) score += 40;
                      if (subStatus === 'active') score += 30;
                      else if (subStatus === 'trialing') score += 15;
                      if (nLeads > 0) score += 20;
                      if (billing?.payment_status === 'approved') score += 10;
                      score = Math.min(score, 100);
                      const cls = score >= 70 ? 'text-emerald-700 bg-emerald-100' : score >= 40 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100';
                      return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cls}`}>{score}%</span>;
                    })()}
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
                        <input type="hidden" name="active"    value={bot?.active ? 'false' : 'true'} />
                        <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg w-full transition ${bot?.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {bot?.active ? '⏸ Desactivar Bot' : '▶ Activar Bot'}
                        </button>
                      </form>
                      {/* Ver detalle */}
                      <Link href={`/admin/clientes/${c.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition text-center">
                        Ver Detalle →
                      </Link>
                      {/* Cambio de plan rápido */}
                      <form action="/api/admin/set-plan" method="POST" className="flex gap-1">
                        <input type="hidden" name="client_id" value={c.id} />
                        <select name="plan" defaultValue={c.plan ?? 'basic'}
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-1 py-1 focus:outline-none">
                          {Object.values(PLANS).filter(p => !p.isEnterprise).map(p =>
                            <option key={p.slug} value={p.slug}>{p.name}</option>
                          )}
                          <option value="enterprise">Enterprise</option>
                        </select>

                        <button type="submit"
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg font-semibold transition">✓</button>
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
              : <>No hay clientes aún. <a href="/api/admin/sync-clients" className="text-purple-600 underline">Sincronizar ahora →</a></>
            }
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {currentPage > 0 && (
            <Link href={`/admin/clientes?page=${currentPage - 1}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">← Anterior</Link>
          )}
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <Link key={i} href={`/admin/clientes?page=${i}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${i === currentPage ? 'bg-purple-600 text-white' : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'}`}>
              {i + 1}
            </Link>
          ))}
          {currentPage < totalPages - 1 && (
            <Link href={`/admin/clientes?page=${currentPage + 1}${search ? `&q=${search}` : ''}${planFilter ? `&plan=${planFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">Siguiente →</Link>
          )}
        </div>
      )}
    </div>
  );
}

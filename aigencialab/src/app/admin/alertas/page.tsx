import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Severity = 'critica' | 'alta' | 'media' | 'info';
type AlertStatus = 'open' | 'resolved';

interface AlertItem {
  id: string;
  type: Severity;
  status: AlertStatus;
  icon: string;
  title: string;
  detail: string;
  clientName: string;
  clientId: string;
  slaRemaining: string;
  createdAt: string;
  cta?: string;
  ctaHref?: string;
  isDbAlert: boolean;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, { cls: string; label: string }> = {
    critica: { cls: 'bg-red-100 text-red-700 border-red-200',       label: '🔴 Crítica' },
    alta:    { cls: 'bg-orange-100 text-orange-700 border-orange-200', label: '🟠 Alta' },
    media:   { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '🟡 Media' },
    info:    { cls: 'bg-blue-100 text-blue-700 border-blue-200',     label: '🔵 Info' },
  };
  const s = map[severity] ?? map.info;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>{s.label}</span>;
}

function StatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
      status === 'open' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
    }`}>
      {status === 'open' ? '🔴 Abierta' : '✅ Resuelta'}
    </span>
  );
}

export default async function AdminAlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const severityFilter = params?.severity ?? '';
  const statusFilter   = params?.status   ?? '';
  const dateFrom       = params?.from     ?? '';
  const dateTo         = params?.to       ?? '';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now      = new Date();
  const in3Days  = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: trialExpiring },
    { data: trialExpired },
    { data: failedPayments },
    { data: recentClients },
    { data: dbAlerts },
  ] = await Promise.all([
    supabase.from('subscriptions')
      .select('id, current_period_end, trial_ends_at, clients(id, email, company_name, company)')
      .eq('status', 'trialing').lte('current_period_end', in3Days).gte('current_period_end', now.toISOString()),
    supabase.from('subscriptions')
      .select('id, current_period_end, clients(id, email, company_name, company)')
      .eq('status', 'trialing').lt('current_period_end', now.toISOString()),
    supabase.from('billing_profiles')
      .select('id, updated_at, clients(id, email, company_name, company, plan)')
      .eq('payment_status', 'failed'),
    supabase.from('clients')
      .select('id, email, company_name, company, plan, created_at')
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }),
    supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  const alerts: AlertItem[] = [];

  // Trial expiring soon
  (trialExpiring ?? []).forEach(s => {
    const c = s.clients as any;
    const daysLeft = Math.ceil((new Date(s.current_period_end).getTime() - now.getTime()) / 86400000);
    alerts.push({
      id: `trial-exp-${s.id}`, type: 'alta', status: 'open', icon: '⏳',
      title: `Trial venciendo en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`,
      detail: `Vence: ${new Date(s.current_period_end).toLocaleDateString('es-CL')}`,
      clientName: c?.company_name || c?.company || c?.email || '—',
      clientId: c?.id ?? '', slaRemaining: `${daysLeft}d`,
      createdAt: s.current_period_end, cta: 'Enviar recordatorio', isDbAlert: false,
    });
  });

  // Trial expired
  (trialExpired ?? []).forEach(s => {
    const c = s.clients as any;
    alerts.push({
      id: `trial-dead-${s.id}`, type: 'critica', status: 'open', icon: '🚫',
      title: 'Trial vencido sin conversión',
      detail: `Venció: ${new Date(s.current_period_end).toLocaleDateString('es-CL')}`,
      clientName: c?.company_name || c?.company || c?.email || '—',
      clientId: c?.id ?? '', slaRemaining: 'Vencido',
      createdAt: s.current_period_end, cta: 'Contactar cliente', isDbAlert: false,
    });
  });

  // Failed payments
  (failedPayments ?? []).forEach(b => {
    const c = b.clients as any;
    alerts.push({
      id: `pay-fail-${b.id}`, type: 'critica', status: 'open', icon: '💳',
      title: 'Pago fallido',
      detail: `Plan ${c?.plan ?? '—'} · ${new Date(b.updated_at).toLocaleDateString('es-CL')}`,
      clientName: c?.company_name || c?.company || c?.email || '—',
      clientId: c?.id ?? '', slaRemaining: 'Urgente',
      createdAt: b.updated_at, cta: 'Ver pagos', ctaHref: '/admin/pagos', isDbAlert: false,
    });
  });

  // New clients this week
  (recentClients ?? []).forEach(c => {
    alerts.push({
      id: `new-${c.id}`, type: 'info', status: 'open', icon: '🎉',
      title: 'Nuevo cliente registrado',
      detail: `Plan ${c.plan ?? 'Starter'} · ${new Date(c.created_at).toLocaleDateString('es-CL')}`,
      clientName: c.company_name || c.company || c.email || '—',
      clientId: c.id, slaRemaining: '—',
      createdAt: c.created_at, isDbAlert: false,
    });
  });

  // DB alerts
  (dbAlerts ?? []).forEach((a: any) => {
    const typeMap: Record<string, Severity> = { critical: 'critica', high: 'alta', medium: 'media', info: 'info' };
    alerts.push({
      id: a.id,
      type: typeMap[a.type] ?? 'info',
      status: a.status === 'resolved' || a.dismissed ? 'resolved' : 'open',
      icon: a.type === 'critical' ? '🔴' : a.type === 'high' ? '🟠' : '🔵',
      title: a.title, detail: a.detail ?? '',
      clientName: '—', clientId: a.client_id ?? '',
      slaRemaining: '—',
      createdAt: a.created_at,
      isDbAlert: true,
    });
  });

  // Apply filters
  let filtered = alerts;
  if (severityFilter) filtered = filtered.filter(a => a.type === severityFilter);
  if (statusFilter)   filtered = filtered.filter(a => a.status === statusFilter);
  if (dateFrom)       filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(dateFrom));
  if (dateTo)         filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(dateTo + 'T23:59:59'));

  const severityOrder: Record<string, number> = { critica: 0, alta: 1, media: 2, info: 3 };
  filtered.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
    return (severityOrder[a.type] ?? 4) - (severityOrder[b.type] ?? 4);
  });

  const counts = {
    total:   alerts.length,
    critica: alerts.filter(a => a.type === 'critica' && a.status === 'open').length,
    alta:    alerts.filter(a => a.type === 'alta' && a.status === 'open').length,
    open:    alerts.filter(a => a.status === 'open').length,
    resolved:alerts.filter(a => a.status === 'resolved').length,
  };

  const hasFilters = !!(severityFilter || statusFilter || dateFrom || dateTo);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas del Sistema</h1>
          <p className="text-gray-500 mt-1">
            {counts.total} total · {counts.open} abiertas · {counts.critica} críticas · {counts.resolved} resueltas
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { v: counts.critica, label: 'Críticas',  cls: 'text-red-600',    bg: 'bg-red-50 border-red-100' },
          { v: counts.alta,    label: 'Alta',      cls: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          { v: counts.open,    label: 'Abiertas',  cls: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
          { v: counts.resolved,label: 'Resueltas', cls: 'text-green-600',  bg: 'bg-green-50 border-green-100' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 shadow-sm ${card.bg}`}>
            <div className={`text-3xl font-bold ${card.cls}`}>{card.v}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <select name="severity" defaultValue={severityFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todas las severidades</option>
          <option value="critica">🔴 Crítica</option>
          <option value="alta">🟠 Alta</option>
          <option value="media">🟡 Media</option>
          <option value="info">🔵 Info</option>
        </select>
        <select name="status" defaultValue={statusFilter} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos los estados</option>
          <option value="open">Abiertas</option>
          <option value="resolved">Resueltas</option>
        </select>
        <input type="date" name="from" defaultValue={dateFrom}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          placeholder="Desde" title="Desde" />
        <input type="date" name="to" defaultValue={dateTo}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          placeholder="Hasta" title="Hasta" />
        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
          Filtrar
        </button>
        {hasFilters && (
          <Link href="/admin/alertas" className="text-sm text-gray-400 hover:text-gray-600 self-center">
            Limpiar filtros
          </Link>
        )}
      </form>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          ✅ No hay alertas con los filtros actuales.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 w-28">Severidad</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Tipo / Detalle</th>
                <th className="px-4 py-3 w-20">SLA</th>
                <th className="px-4 py-3 w-28">Estado</th>
                <th className="px-4 py-3 w-24">Fecha</th>
                <th className="px-4 py-3 w-48">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${a.status === 'resolved' ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={a.type} />
                  </td>
                  <td className="px-4 py-3">
                    {a.clientId ? (
                      <Link href={`/admin/clientes/${a.clientId}`} className="text-purple-600 hover:underline font-semibold text-sm">
                        {a.clientName}
                      </Link>
                    ) : (
                      <span className="text-gray-500 text-sm">{a.clientName}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-base">{a.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{a.title}</div>
                        {a.detail && <div className="text-xs text-gray-400 mt-0.5">{a.detail}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${a.slaRemaining === 'Vencido' || a.slaRemaining === 'Urgente' ? 'text-red-600' : 'text-gray-500'}`}>
                      {a.slaRemaining}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(a.createdAt).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.cta && a.status === 'open' && (
                        <Link
                          href={a.ctaHref ?? `/admin/clientes/${a.clientId}`}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                        >
                          {a.cta}
                        </Link>
                      )}
                      {/* Only DB alerts can be resolved via API */}
                      {a.isDbAlert && a.status === 'open' && (
                        <form action="/api/admin/resolve-alert" method="POST" className="inline">
                          <input type="hidden" name="alert_id" value={a.id} />
                          <input type="hidden" name="client_id" value={a.clientId} />
                          <button
                            type="submit"
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            ✅ Resolver
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Mostrando {filtered.length} de {alerts.length} alertas
          </div>
        </div>
      )}
    </div>
  );
}

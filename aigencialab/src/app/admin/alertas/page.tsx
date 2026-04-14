import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function AdminAlertas() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: trialExpiring },
    { data: trialExpired },
    { data: failedPayments },
    { data: recentClients },
  ] = await Promise.all([
    // Trials ending ≤3 days
    supabase.from('subscriptions')
      .select('id, current_period_end, clients(id, email, company_name)')
      .eq('status', 'trialing')
      .lte('current_period_end', in3Days)
      .gte('current_period_end', now.toISOString()),
    // Trials expired (past now, still trialing = no conversion)
    supabase.from('subscriptions')
      .select('id, current_period_end, clients(id, email, company_name)')
      .eq('status', 'trialing')
      .lt('current_period_end', now.toISOString()),
    // Failed payments
    supabase.from('billing_profiles')
      .select('id, updated_at, clients(id, email, company_name, plan)')
      .eq('payment_status', 'failed'),
    // Clients registered last 7 days
    supabase.from('clients')
      .select('id, email, company_name, plan, created_at')
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }),
  ]);

  type AlertType = {
    type: 'warning' | 'error' | 'info' | 'orange';
    icon: string;
    title: string;
    detail: string;
    cta?: string;
  };

  const alerts: AlertType[] = [];

  (trialExpiring ?? []).forEach(s => {
    const c = (s.clients as any);
    const daysLeft = Math.ceil((new Date(s.current_period_end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    alerts.push({
      type: 'warning',
      icon: '⏳',
      title: `Trial venciendo: ${c?.company_name ?? c?.email}`,
      detail: `Vence en ${daysLeft} día(s) — ${new Date(s.current_period_end).toLocaleDateString('es-CL')}`,
      cta: 'Enviar recordatorio',
    });
  });

  (trialExpired ?? []).forEach(s => {
    const c = (s.clients as any);
    alerts.push({
      type: 'error',
      icon: '🚫',
      title: `Trial vencido sin conversión: ${c?.company_name ?? c?.email}`,
      detail: `Venció el ${new Date(s.current_period_end).toLocaleDateString('es-CL')}`,
      cta: 'Contactar cliente',
    });
  });

  (failedPayments ?? []).forEach(b => {
    const c = (b.clients as any);
    alerts.push({
      type: 'error',
      icon: '💳',
      title: `Pago fallido: ${c?.company_name ?? c?.email}`,
      detail: `Plan ${c?.plan} — Fecha fallo: ${new Date(b.updated_at).toLocaleDateString('es-CL')}`,
      cta: 'Ver en Pagos',
    });
  });

  (recentClients ?? []).forEach(c => {
    alerts.push({
      type: 'info',
      icon: '🎉',
      title: `Nuevo cliente registrado: ${c.company_name ?? c.email}`,
      detail: `Plan ${c.plan ?? 'Starter'} — ${new Date(c.created_at).toLocaleDateString('es-CL')}`,
    });
  });

  const colorMap: Record<string, string> = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    orange:  'bg-orange-50 border-orange-200 text-orange-800',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
        <p className="text-gray-500 mt-1">{alerts.length} alertas activas que requieren atención</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
          ✅ No hay alertas activas. Todo funciona correctamente.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start justify-between p-5 rounded-xl border ${colorMap[a.type] ?? colorMap.info}`}>
              <div className="flex items-start gap-4">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-bold text-base">{a.title}</div>
                  <div className="text-sm mt-0.5 opacity-80">{a.detail}</div>
                </div>
              </div>
              {a.cta && (
                <button className="shrink-0 ml-4 bg-white border border-current px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition">
                  {a.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

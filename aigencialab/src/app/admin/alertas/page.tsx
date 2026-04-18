import { createClient } from '@supabase/supabase-js';
import AlertasClient from './AlertasClient';

export const dynamic = 'force-dynamic';

type Severity = 'critica' | 'alta' | 'media' | 'info';
type AlertStatus = 'open' | 'resolved';

interface AlertItem {
  id: string; type: Severity; status: AlertStatus; icon: string;
  title: string; detail: string; clientName: string; clientId: string;
  slaRemaining: string; createdAt: string; cta?: string; ctaHref?: string; isDbAlert: boolean;
}

export default async function AdminAlertasPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now     = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

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

  const { data: allBotConfigs } = await supabase.from('bot_configs').select('client_id');
  const botClientIds = new Set((allBotConfigs ?? []).map((b: any) => b.client_id));
  const activeClients = (await supabase.from('clients').select('id, email, company_name, plan').eq('status','active')).data ?? [];
  const clientsWithoutBot = activeClients.filter((c: any) => !botClientIds.has(c.id));
  const inactiveBots = (await supabase.from('bot_configs').select('client_id, bot_name, active, clients(id, email, company_name)').eq('active', false)).data ?? [];

  const alerts: AlertItem[] = [];

  (trialExpiring ?? []).forEach((s: any) => {
    const c = s.clients as any;
    const daysLeft = Math.ceil((new Date(s.current_period_end).getTime() - now.getTime()) / 86400000);
    alerts.push({ id: `trial-exp-${s.id}`, type: 'alta', status: 'open', icon: '⏳', title: `Trial venciendo en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`, detail: `Vence: ${new Date(s.current_period_end).toLocaleDateString('es-CL')}`, clientName: c?.company_name || c?.company || c?.email || '—', clientId: c?.id ?? '', slaRemaining: `${daysLeft}d`, createdAt: s.current_period_end, cta: 'Enviar recordatorio', isDbAlert: false });
  });

  (trialExpired ?? []).forEach((s: any) => {
    const c = s.clients as any;
    alerts.push({ id: `trial-dead-${s.id}`, type: 'critica', status: 'open', icon: '🚫', title: 'Trial vencido sin conversión', detail: `Venció: ${new Date(s.current_period_end).toLocaleDateString('es-CL')}`, clientName: c?.company_name || c?.company || c?.email || '—', clientId: c?.id ?? '', slaRemaining: 'Vencido', createdAt: s.current_period_end, cta: 'Contactar cliente', isDbAlert: false });
  });

  (failedPayments ?? []).forEach((b: any) => {
    const c = b.clients as any;
    alerts.push({ id: `pay-fail-${b.id}`, type: 'critica', status: 'open', icon: '💳', title: 'Pago fallido', detail: `Plan ${c?.plan ?? '—'} · ${new Date(b.updated_at).toLocaleDateString('es-CL')}`, clientName: c?.company_name || c?.company || c?.email || '—', clientId: c?.id ?? '', slaRemaining: 'Urgente', createdAt: b.updated_at, cta: 'Ver pagos', ctaHref: '/admin/pagos', isDbAlert: false });
  });

  (recentClients ?? []).forEach((c: any) => {
    alerts.push({ id: `new-${c.id}`, type: 'info', status: 'open', icon: '🎉', title: 'Nuevo cliente registrado', detail: `Plan ${c.plan ?? 'Starter'} · ${new Date(c.created_at).toLocaleDateString('es-CL')}`, clientName: c.company_name || c.company || c.email || '—', clientId: c.id, slaRemaining: '—', createdAt: c.created_at, isDbAlert: false });
  });

  (dbAlerts ?? []).forEach((a: any) => {
    const typeMap: Record<string, Severity> = { critical: 'critica', high: 'alta', medium: 'media', info: 'info' };
    alerts.push({ id: a.id, type: typeMap[a.type] ?? 'info', status: a.status === 'resolved' || a.dismissed ? 'resolved' : 'open', icon: a.type === 'critical' ? '🔴' : a.type === 'high' ? '🟠' : '🔵', title: a.title, detail: a.detail ?? '', clientName: '—', clientId: a.client_id ?? '', slaRemaining: '—', createdAt: a.created_at, isDbAlert: true });
  });

  const severityOrder: Record<string, number> = { critica: 0, alta: 1, media: 2, info: 3 };
  alerts.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
    return (severityOrder[a.type] ?? 4) - (severityOrder[b.type] ?? 4);
  });

  const counts = {
    total:    alerts.length,
    critica:  alerts.filter(a => a.type === 'critica' && a.status === 'open').length,
    alta:     alerts.filter(a => a.type === 'alta'    && a.status === 'open').length,
    open:     alerts.filter(a => a.status === 'open').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <AlertasClient
      alerts={alerts}
      counts={counts}
      inactiveBots={inactiveBots as any}
      clientsWithoutBot={clientsWithoutBot as any}
      activeClientsCount={activeClients.length}
    />
  );
}

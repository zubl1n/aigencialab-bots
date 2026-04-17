/**
 * GET /api/cron/weekly-report
 * Sends weekly admin report every Monday at 08:00
 *
 * Add to vercel.json:
 *   "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 8 * * 1" }]
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklyAdminReport } from '@/lib/emails';

export const dynamic = 'force-dynamic';

const PLAN_MONTHLY_CLP: Record<string, number> = {
  Basic:       45000,
  Starter:    120000,
  Pro:        200000,
  Enterprise:      0,
};

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  const authHeader  = req.headers.get('Authorization');
  const expectedKey = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && authHeader !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase  = adminClient();
  const now       = new Date();
  const weekStart = new Date(now.getTime() - 7 * 86400000);
  const weekLabel = `${weekStart.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} – ${now.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  const [
    { data: activeSubs },
    { count: activeClients },
    { count: trialClients },
    { count: suspendedClients },
    { count: newClients },
    { count: newLeads },
    { count: totalLeads },
    { count: openTickets },
    { count: resolvedThisWeek },
    { count: botsActive },
    { count: botsTotal },
  ] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('status', 'active'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
    supabase.from('clients').select('id', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'resolved').gte('updated_at', weekStart.toISOString()),
    supabase.from('bot_configs').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('bot_configs').select('id', { count: 'exact', head: true }),
  ]);

  const mrrCLP = (activeSubs ?? []).reduce((acc, s) => acc + (PLAN_MONTHLY_CLP[s.plan] ?? 0), 0);

  await sendWeeklyAdminReport({
    weekLabel,
    newClients:        newClients ?? 0,
    activeClients:     activeClients ?? 0,
    trialClients:      trialClients ?? 0,
    suspendedClients:  suspendedClients ?? 0,
    mrrCLP,
    arrCLP:            mrrCLP * 12,
    newLeads:          newLeads ?? 0,
    totalLeads:        totalLeads ?? 0,
    openTickets:       openTickets ?? 0,
    resolvedTickets:   resolvedThisWeek ?? 0,
    botsActive:        botsActive ?? 0,
    botsTotal:         botsTotal ?? 0,
  });

  return NextResponse.json({ ok: true, weekLabel });
}

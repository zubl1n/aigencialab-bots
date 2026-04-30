/**
 * GET /api/cron/daily-alerts
 * Runs daily automated alert jobs:
 *   1. Trial expiring alerts (users with 1, 2 or 3 days left)
 *   2. Quota warning alerts (users at 80%+ conversation usage)
 *
 * Schedule: Call this endpoint daily via Vercel Cron (vercel.json)
 * Protection: CRON_SECRET header check
 *
 * Add to vercel.json:
 *   "crons": [{ "path": "/api/cron/daily-alerts", "schedule": "0 9 * * *" }]
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendTrialExpiringEmail,
  sendQuotaWarningEmail,
} from '@/lib/emails';

export const dynamic = 'force-dynamic';

// CLP overage costs from config/plans.ts
const PLAN_OVERAGE_CLP: Record<string, number | null> = {
  Basic:       60,
  Starter:     50,
  Pro:         null,
  Enterprise:  null,
};

// Max conversation limits from config/plans.ts
const PLAN_MAX_CONVS: Record<string, number | null> = {
  Basic:       500,
  Starter:     2000,
  Pro:         null,
  Enterprise:  null,
};

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  // Verify CRON_SECRET (Vercel sets Authorization: Bearer <secret> automatically)
  const authHeader  = req.headers.get('Authorization');
  const expectedKey = `Bearer ${process.env.CRON_SECRET}`;
  if (process.env.CRON_SECRET && authHeader !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = adminClient();
  const results  = { trialAlerts: 0, quotaAlerts: 0, errors: [] as string[] };

  // ── 1. Trial Expiring Alerts ──────────────────────────────────
  const now   = new Date();
  const in3d  = new Date(now.getTime() + 3  * 86400000).toISOString();
  const in0d  = now.toISOString();

  const { data: trialingClients } = await supabase
    .from('subscriptions')
    .select('client_id, trial_ends_at, plan')
    .eq('status', 'trialing')
    .gte('trial_ends_at', in0d)   // not yet expired
    .lte('trial_ends_at', in3d);  // expires in next 3 days

  for (const sub of (trialingClients ?? [])) {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('email, contact_name, company_name, company')
        .eq('id', sub.client_id)
        .maybeSingle();

      if (!client?.email) continue;

      const trialEnd  = new Date(sub.trial_ends_at);
      const daysLeft  = Math.max(1, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000));
      const trialDate = trialEnd.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });

      await sendTrialExpiringEmail({
        email:        client.email,
        name:         client.contact_name ?? 'Cliente',
        company:      client.company_name ?? client.company ?? '',
        plan:         sub.plan ?? 'Starter',
        daysLeft,
        trialEndDate: trialDate,
      });

      results.trialAlerts++;
    } catch (err: any) {
      results.errors.push(`trial:${sub.client_id}: ${err.message}`);
    }
  }

  // ── 2. Quota Warning Alerts (80%+) ────────────────────────────
  // Get current month conversation counts per client
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Get all active clients with conversation limits
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('client_id, plan')
    .eq('status', 'active');

  for (const sub of (activeSubs ?? [])) {
    const maxConvs = PLAN_MAX_CONVS[sub.plan ?? ''];
    if (!maxConvs) continue; // unlimited plan, skip

    try {
      // Count conversations this month
      const { count: convCount } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', sub.client_id)
        .gte('created_at', monthStart);

      const used       = convCount ?? 0;
      const pct        = Math.round((used / maxConvs) * 100);

      if (pct < 80) continue; // Only warn at 80%+

      // Check if we already sent a quota warning this month (via audit_logs)
      const { data: existingAlert } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('module', 'quota_alert')
        .eq('metadata->>client_id', sub.client_id)
        .gte('created_at', monthStart)
        .maybeSingle();

      if (existingAlert) continue; // Already alerted this month

      const { data: client } = await supabase
        .from('clients')
        .select('email, contact_name, company_name, company')
        .eq('id', sub.client_id)
        .maybeSingle();

      if (!client?.email) continue;

      await sendQuotaWarningEmail({
        email:          client.email,
        name:           client.contact_name ?? 'Cliente',
        company:        client.company_name ?? client.company ?? '',
        plan:           sub.plan ?? 'Starter',
        used,
        total:          maxConvs,
        percentUsed:    pct,
        overageCostCLP: PLAN_OVERAGE_CLP[sub.plan ?? ''] ?? null,
      });

      // Mark as sent
      await supabase.from('audit_logs').insert({
        event:    'quota_warning_sent',
        module:   'quota_alert',
        metadata: { client_id: sub.client_id, plan: sub.plan, percent_used: pct },
      });

      results.quotaAlerts++;
    } catch (err: any) {
      results.errors.push(`quota:${sub.client_id}: ${err.message}`);
    }
  }

  console.log('[cron/daily-alerts]', results);
  return NextResponse.json({ ok: true, ...results });
}

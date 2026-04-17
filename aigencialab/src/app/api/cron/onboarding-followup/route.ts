/**
 * GET /api/cron/onboarding-followup
 *
 * Runs daily and sends onboarding follow-up emails to new clients
 * at days 3, 7, and 14 after their impl_paid_at date.
 *
 * - Day 3:  "¿Cómo va la implementación?"
 * - Day 7:  "¡1 semana de IA! Tips para sacarle el máximo"
 * - Day 14: "Revisión de tu implementación + ¿qué sigue?"
 *
 * Uses audit_logs to prevent duplicate sends.
 * Schedule: daily via vercel.json crons
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOnboardingFollowupEmail } from '@/lib/emails';

export const dynamic = 'force-dynamic';

const FOLLOWUP_DAYS = [3, 7, 14] as const;
type FollowupDay = typeof FOLLOWUP_DAYS[number];

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
  const now      = new Date();
  const results  = { sent: 0, skipped: 0, errors: [] as string[] };

  // Get all subscriptions with an impl_paid_at date (active clients)
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('client_id, plan, impl_paid_at')
    .eq('status', 'active')
    .not('impl_paid_at', 'is', null);

  for (const sub of (subs ?? [])) {
    if (!sub.impl_paid_at) continue;

    const implDate  = new Date(sub.impl_paid_at);
    const daysSince = Math.floor((now.getTime() - implDate.getTime()) / 86400000);

    // Check if today aligns with a follow-up milestone
    const targetDay = FOLLOWUP_DAYS.find(d => d === daysSince) as FollowupDay | undefined;
    if (!targetDay) continue;

    // Check if we already sent this day's email (dedup via audit_logs)
    const { data: existing } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('event', `onboarding_followup_day${targetDay}`)
      .eq('module', 'onboarding')
      .contains('metadata', { client_id: sub.client_id })
      .maybeSingle();

    if (existing) {
      results.skipped++;
      continue;
    }

    // Fetch client info
    const { data: client } = await supabase
      .from('clients')
      .select('email, contact_name, full_name, company_name, company')
      .eq('id', sub.client_id)
      .maybeSingle();

    if (!client?.email) continue;

    try {
      await sendOnboardingFollowupEmail({
        email:    client.email,
        name:     client.contact_name ?? client.full_name ?? 'Cliente',
        company:  client.company_name ?? client.company ?? '',
        planName: sub.plan ?? 'Starter',
        day:      targetDay,
      });

      // Mark as sent
      await supabase.from('audit_logs').insert({
        event:    `onboarding_followup_day${targetDay}`,
        module:   'onboarding',
        metadata: {
          client_id: sub.client_id,
          day:       targetDay,
          plan:      sub.plan,
          sent_at:   now.toISOString(),
        },
      });

      results.sent++;
    } catch (err: any) {
      results.errors.push(`day${targetDay}:${sub.client_id}: ${err.message}`);
    }
  }

  console.log('[cron/onboarding-followup]', results);
  return NextResponse.json({ ok: true, ...results });
}

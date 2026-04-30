/**
 * GET /api/admin/test-emails?secret=<CRON_SECRET>
 * Fires ONE test email per template to admin@aigencialab.cl
 * Use for production smoke-testing all Resend flows.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendPaymentApprovedEmail,
  sendPaymentFailedEmail,
  sendBotActivatedEmail,
  sendBotDeactivatedEmail,
  sendTrialExpiringEmail,
  sendCancellationEmail,
  sendNewTicketAdminEmail,
  sendTicketReplyEmail,
  sendTicketStatusEmail,
  sendContactFormEmail,
  sendNewPartnerEmail,
  sendAdminNewClientEmail,
  sendAdminPaymentFailedEmail,
  sendImplWelcomeEmail,
  sendOnboardingFollowupEmail,
  sendQuotaWarningEmail,
  sendWeeklyAdminReport,
} from '@/lib/emails';

export const dynamic = 'force-dynamic';

const ADMIN = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aigencialab.cl';

const SAMPLE = {
  email:     ADMIN,
  name:      'Admin Test',
  company:   'AIgenciaLab (TEST)',
  plan:      'Pro',
  planName:  'Pro',
  clientId:  'test-client-id-000',
  userId:    'test-user-id-000',
  ticketId:  'ticket-test-000',
  subject:   'Problema con el bot — TEST',
  botName:   'Asistente IA Demo',
};

type Result = { name: string; status: 'ok' | 'error'; error?: string };

async function run(name: string, fn: () => Promise<unknown>): Promise<Result> {
  try {
    await fn();
    return { name, status: 'ok' };
  } catch (e: any) {
    return { name, status: 'error', error: e.message };
  }
}

export async function GET(req: NextRequest) {
  // Basic auth guard
  const secret = req.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized — pass ?secret=CRON_SECRET' }, { status: 401 });
  }

  const results: Result[] = [];
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  // ── 1. Bienvenida post-registro ──────────────────────────────
  results.push(await run('1. sendWelcomeEmail', () =>
    sendWelcomeEmail({ email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, plan: SAMPLE.plan })
  ));
  await delay(500);

  // ── 2. Pago aprobado (cobro recurrente) ────────────────────
  results.push(await run('2. sendPaymentApprovedEmail', () =>
    sendPaymentApprovedEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, plan: SAMPLE.plan,
      amountCLP: 120000, nextBillingDate: '01/06/2026',
    })
  ));
  await delay(500);

  // ── 3. Pago fallido → cliente ──────────────────────────────
  results.push(await run('3. sendPaymentFailedEmail', () =>
    sendPaymentFailedEmail({ email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, plan: SAMPLE.plan })
  ));
  await delay(500);

  // ── 4. Bot activado ────────────────────────────────────────
  results.push(await run('4. sendBotActivatedEmail', () =>
    sendBotActivatedEmail({ email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, botName: SAMPLE.botName })
  ));
  await delay(500);

  // ── 5. Bot desactivado ─────────────────────────────────────
  results.push(await run('5. sendBotDeactivatedEmail', () =>
    sendBotDeactivatedEmail({ email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, reason: 'Pago pendiente (TEST)' })
  ));
  await delay(500);

  // ── 6. Trial por vencer ────────────────────────────────────
  results.push(await run('6. sendTrialExpiringEmail', () =>
    sendTrialExpiringEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, plan: SAMPLE.plan,
      daysLeft: 3, trialEndDate: '25/04/2026',
    })
  ));
  await delay(500);

  // ── 7. Cancelación ─────────────────────────────────────────
  results.push(await run('7. sendCancellationEmail', () =>
    sendCancellationEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, plan: SAMPLE.plan,
      endsOn: '30/04/2026',
    })
  ));
  await delay(500);

  // ── 8. Nuevo ticket → admin ────────────────────────────────
  results.push(await run('8. sendNewTicketAdminEmail', () =>
    sendNewTicketAdminEmail({
      ticketId: SAMPLE.ticketId, company: SAMPLE.company, email: SAMPLE.email,
      subject: SAMPLE.subject, body: 'El bot no responde correctamente (TEST MESSAGE).', priority: 'high',
    })
  ));
  await delay(500);

  // ── 9. Ticket respondido → cliente ─────────────────────────
  results.push(await run('9. sendTicketReplyEmail', () =>
    sendTicketReplyEmail({
      email: SAMPLE.email, name: SAMPLE.name, ticketId: SAMPLE.ticketId,
      subject: SAMPLE.subject, agentName: 'AIgenciaLab Soporte',
      replyBody: 'Hemos revisado tu caso y está solucionado. (TEST)', newStatus: 'resolved',
    })
  ));
  await delay(500);

  // ── 10. Cambio de estado ticket ────────────────────────────
  results.push(await run('10. sendTicketStatusEmail', () =>
    sendTicketStatusEmail({
      email: SAMPLE.email, name: SAMPLE.name, ticketId: SAMPLE.ticketId,
      subject: SAMPLE.subject, newStatus: 'resolved',
    })
  ));
  await delay(500);

  // ── 11. Formulario de contacto ─────────────────────────────
  results.push(await run('11. sendContactFormEmail', () =>
    sendContactFormEmail({
      name: SAMPLE.name, email: SAMPLE.email, company: SAMPLE.company,
      phone: '+56 9 1234 5678', message: 'Quiero saber más sobre el Plan Pro. (TEST)',
    })
  ));
  await delay(500);

  // ── 12. Nuevo partner ──────────────────────────────────────
  results.push(await run('12. sendNewPartnerEmail', () =>
    sendNewPartnerEmail({
      name: SAMPLE.name, company: 'Agencia Demo SpA (TEST)', email: SAMPLE.email,
      phone: '+56 9 9876 5432', partnerType: 'agencia', message: 'Nos interesa el programa. (TEST)',
    })
  ));
  await delay(500);

  // ── 13. Admin nuevo cliente ────────────────────────────────
  results.push(await run('13. sendAdminNewClientEmail', () =>
    sendAdminNewClientEmail({
      company: SAMPLE.company, email: SAMPLE.email, plan: SAMPLE.plan, clientId: SAMPLE.clientId,
    })
  ));
  await delay(500);

  // ── 14. Admin pago fallido ─────────────────────────────────
  results.push(await run('14. sendAdminPaymentFailedEmail', () =>
    sendAdminPaymentFailedEmail({
      company: SAMPLE.company, email: SAMPLE.email, plan: SAMPLE.plan, clientId: SAMPLE.clientId,
    })
  ));
  await delay(500);

  // ── 15. Bienvenida pago implementación (v2 checkout) ───────
  results.push(await run('15. sendImplWelcomeEmail', () =>
    sendImplWelcomeEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company,
      planName: SAMPLE.planName, userId: SAMPLE.userId,
    })
  ));
  await delay(500);

  // ── 16. Onboarding día 3 ───────────────────────────────────
  results.push(await run('16a. sendOnboardingFollowupEmail (día 3)', () =>
    sendOnboardingFollowupEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, planName: SAMPLE.planName, day: 3,
    })
  ));
  await delay(500);

  // ── 17. Onboarding día 7 ───────────────────────────────────
  results.push(await run('16b. sendOnboardingFollowupEmail (día 7)', () =>
    sendOnboardingFollowupEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, planName: SAMPLE.planName, day: 7,
    })
  ));
  await delay(500);

  // ── 18. Onboarding día 14 ──────────────────────────────────
  results.push(await run('16c. sendOnboardingFollowupEmail (día 14)', () =>
    sendOnboardingFollowupEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, planName: SAMPLE.planName, day: 14,
    })
  ));
  await delay(500);

  // ── 19. Alerta de cuota al 80% ─────────────────────────────
  results.push(await run('17. sendQuotaWarningEmail', () =>
    sendQuotaWarningEmail({
      email: SAMPLE.email, name: SAMPLE.name, company: SAMPLE.company, plan: SAMPLE.plan,
      used: 1640, total: 2000, percentUsed: 82, overageCostCLP: 500,
    })
  ));
  await delay(500);

  // ── 20. Reporte semanal admin ──────────────────────────────
  results.push(await run('18. sendWeeklyAdminReport', () =>
    sendWeeklyAdminReport({
      weekLabel: '14 abr – 21 abr 2026 (TEST)',
      newClients: 3, activeClients: 12, trialClients: 4, suspendedClients: 1,
      mrrCLP: 1_080_000, arrCLP: 12_960_000,
      newLeads: 47, totalLeads: 312,
      openTickets: 2, resolvedTickets: 8,
      botsActive: 11, botsTotal: 12,
    })
  ));

  const total  = results.length;
  const ok     = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error');

  return NextResponse.json({
    summary: `${ok}/${total} emails enviados a ${ADMIN}`,
    results,
    errors: errors.length > 0 ? errors : 'ninguno',
  }, { status: 200 });
}

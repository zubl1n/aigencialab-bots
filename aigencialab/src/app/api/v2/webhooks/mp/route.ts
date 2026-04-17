/**
 * POST /api/v2/webhooks/mp
 * Handles MercadoPago webhook events for the v2 checkout flow.
 * ALWAYS returns 200 — MP retries on non-200.
 *
 * Events handled:
 * - payment (impl_payment approved) → activates account + creates recurring subscription
 * - subscription_authorized_payment → updates last_billing_at
 * - subscription_preapproval (cancelled) → suspends account
 */
import { createClient } from '@supabase/supabase-js';
import { getPlanBySlug } from '@/config/plans';

export const dynamic = 'force-dynamic';

const MP_BASE = 'https://api.mercadopago.com';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function mpGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${MP_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN!}` },
  });
  if (!res.ok) throw new Error(`[MP] ${res.status} ${path}`);
  return res.json();
}

async function sendEmail(payload: object) {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes('REPLACE')) return;
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  }).catch(console.error);
}

async function notifyAdmin(event: string, details: Record<string, unknown>) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aigencialab.cl';
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl';

  const subjects: Record<string, string> = {
    new_client_activated: `[AIgenciaLab] Nuevo cliente activado · ${details.planName} · $${Number(details.implAmountCLP).toLocaleString('es-CL')} CLP`,
    recurring_payment_ok: `[AIgenciaLab] Cobro recurrente OK · ${details.planName} · $${Number(details.amount).toLocaleString('es-CL')} CLP`,
    subscription_suspended: `[AIgenciaLab] Suscripción suspendida · ${details.userId}`,
  };

  await sendEmail({
    from,
    to: adminEmail,
    subject: subjects[event] ?? `[AIgenciaLab] Evento: ${event}`,
    html: `<pre style="font-family: monospace; font-size: 13px; background: #f1f5f9; padding: 20px; border-radius: 8px;">${JSON.stringify({ event, ...details }, null, 2)}</pre><p><a href="${siteUrl}/admin">Ver en Admin →</a></p>`,
  });
}

async function sendWelcomeEmail(opts: { email: string; planName: string; userId: string }) {
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl';
  await sendEmail({
    from,
    to: opts.email,
    subject: `¡Bienvenido a AIgenciaLab! Tu Plan ${opts.planName} está listo 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0a0f1e; color: #fff; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">¡Bienvenido a AIgenciaLab!</h1>
          <p style="color: #94a3b8; margin: 8px 0 0;">Tu agente IA está en camino.</p>
        </div>
        <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Plan ${opts.planName} activado ✅</h2>
          <p style="color: #475569; line-height: 1.6;">Recibimos tu pago de implementación. Aquí están tus próximos pasos:</p>
          <div style="background: #eff6ff; border-left: 4px solid #1d4ed8; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <strong>📅 Próximas 48 horas</strong><br>
            <span style="color: #475569; font-size: 14px;">Tu ingeniero asignado te contactará por WhatsApp para coordinar el onboarding.</span>
          </div>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <strong>🤖 Días 1–14</strong><br>
            <span style="color: #475569; font-size: 14px;">Implementación y entrenamiento de tu agente IA.</span>
          </div>
          <div style="background: #fefce8; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <strong>⚡ Días 15–60</strong><br>
            <span style="color: #475569; font-size: 14px;">Ajustes y optimización sin cobro mensual.</span>
          </div>
          <a href="${siteUrl}/dashboard" style="display: inline-block; background: #1d4ed8; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
            Ir al Dashboard →
          </a>
        </div>
      </div>
    `,
  });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let body: any = {};
    try { body = await req.json(); } catch { /* IPN via query */ }

    const type   = body?.type   ?? url.searchParams.get('type');
    const dataId = body?.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id');

    if (!dataId) return Response.json({ ok: true, msg: 'ping' });

    const supabase = getAdminClient();
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl';

    // ── Payment (implementation month 1) ─────────────────────────────────────
    if (type === 'payment') {
      let payment: any;
      try { payment = await mpGet(`/v1/payments/${dataId}`); }
      catch { return Response.json({ ok: true, msg: 'payment not found' }); }

      if (payment.status !== 'approved') {
        // Handle rejection
        if (payment.status === 'rejected') {
          const extRef = payment.metadata?.userId ?? payment.external_reference;
          if (extRef) {
            await supabase.from('subscriptions').upsert(
              { client_id: extRef, payment_status: 'failed' },
              { onConflict: 'client_id' }
            );
          }
        }
        return Response.json({ ok: true });
      }

      const { userId, planSlug, type: payType } = payment.metadata ?? {};
      if (payType !== 'impl_payment' || !userId || !planSlug) {
        return Response.json({ ok: true, msg: 'not impl_payment or missing meta' });
      }

      const plan = getPlanBySlug(planSlug);
      if (!plan || plan.isEnterprise) return Response.json({ ok: true });

      const billingStartDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      // 1. Activate subscription in Supabase
      await supabase.from('subscriptions').upsert({
        client_id: userId,
        plan: plan.name,
        status: 'active',
        payment_status: 'approved',
        impl_paid_at: new Date().toISOString(),
        billing_start_date: billingStartDate.toISOString().split('T')[0],
        mp_payment_id: payment.id,
      }, { onConflict: 'client_id' });

      // 2. Update client status
      await supabase.from('clients')
        .update({ plan: plan.name, status: 'active', payment_status: 'active' })
        .eq('id', userId)
        .maybeSingle();

      // 3. Create recurring MP subscription (starts month 3 = +60 days)
      let mpSubscriptionId: string | null = null;
      if (plan.mpPlanId && plan.monthlyPriceCLP) {
        const subPayload = {
          preapproval_plan_id: plan.mpPlanId,
          payer_email: payment.payer?.email,
          external_reference: userId,
          back_url: `${siteUrl}/dashboard`,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            start_date: billingStartDate.toISOString(),
            transaction_amount: plan.monthlyPriceCLP,
            currency_id: 'CLP',
          },
          status: 'pending', // pending = user must authorize recurring charge
        };

        try {
          const subRes = await fetch('https://api.mercadopago.com/preapproval', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(subPayload),
          }).then(r => r.json());

          mpSubscriptionId = subRes.id ?? null;

          // If status was 'pending', send init_point to user so they can authorize
          if (subRes.status === 'pending' && subRes.init_point) {
            await sendEmail({
              from: process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl',
              to: payment.payer?.email,
              subject: `[AIgenciaLab] Autoriza tu suscripción mensual — Paso final`,
              html: `<p>Para activar tu suscripción mensual a partir del día 61, haz clic aquí:</p><a href="${subRes.init_point}" style="background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:600;">Autorizar suscripción →</a>`,
            });
          }
        } catch (subErr: any) {
          console.warn('[webhooks/mp] Could not create recurring subscription:', subErr.message);
        }
      }

      // 4. Update billing_profiles
      await supabase.from('billing_profiles').upsert({
        client_id: userId,
        mp_subscription_id: mpSubscriptionId,
        impl_paid_at: new Date().toISOString(),
        billing_start_date: billingStartDate.toISOString().split('T')[0],
        currency_preference: 'CLP',
        payment_status: 'approved',
      }, { onConflict: 'client_id' });

      // 5. Provision workspace
      const { data: wsExisting } = await supabase
        .from('workspaces').select('id').eq('user_id', userId).maybeSingle();
      if (!wsExisting) {
        await supabase.from('workspaces').insert({
          user_id: userId,
          plan_slug: planSlug,
          status: 'onboarding',
        });
      }

      // 6. Welcome email to client
      await sendWelcomeEmail({
        email: payment.payer?.email,
        planName: plan.name,
        userId,
      });

      // 7. Notify admin
      await notifyAdmin('new_client_activated', {
        planName: plan.name,
        userId,
        email: payment.payer?.email,
        implAmountCLP: plan.implPriceCLP,
        mpPaymentId: payment.id,
        mpSubscriptionId,
        billingStartDate: billingStartDate.toISOString().split('T')[0],
      });
    }

    // ── Recurring payment (month 3+) ──────────────────────────────────────────
    else if (type === 'subscription_authorized_payment') {
      const subId = dataId;
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('client_id, plan')
        .eq('mp_subscription_id', subId)
        .maybeSingle();

      if (sub) {
        await supabase.from('subscriptions')
          .update({ last_billing_at: new Date().toISOString(), payment_status: 'approved' })
          .eq('mp_subscription_id', subId);
        await notifyAdmin('recurring_payment_ok', {
          planName: sub.plan,
          userId: sub.client_id,
          subId,
          amount: 0, // amount fetched separately if needed
        });
      }
    }

    // ── Subscription cancelled/paused ────────────────────────────────────────
    else if (type === 'subscription_preapproval') {
      let sub: any;
      try { sub = await mpGet(`/preapproval/${dataId}`); }
      catch { return Response.json({ ok: true }); }

      if (sub.status === 'cancelled' || sub.status === 'paused') {
        const clientId = sub.external_reference;
        if (clientId) {
          await supabase.from('subscriptions')
            .update({ status: sub.status === 'cancelled' ? 'canceled' : 'paused' })
            .eq('client_id', clientId);
          await supabase.from('clients')
            .update({ status: sub.status === 'cancelled' ? 'suspended' : 'paused' })
            .eq('id', clientId)
            .maybeSingle();
          await notifyAdmin('subscription_suspended', {
            userId: clientId,
            subId: dataId,
            reason: sub.status,
          });
        }
      }
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('[webhooks/mp v2]', err.message);
    return Response.json({ ok: true, internal_error: err.message });
  }
}

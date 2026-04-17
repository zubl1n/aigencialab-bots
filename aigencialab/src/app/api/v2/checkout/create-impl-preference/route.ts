/**
 * POST /api/v2/checkout/create-impl-preference
 * Creates a MercadoPago preference for the implementation payment (Month 1).
 * Uses PLANS from src/config/plans.ts — never hardcoded prices.
 * ALWAYS returns init_point — never sandbox_init_point.
 */
import { createClient } from '@supabase/supabase-js';
import { getPlanBySlug } from '@/config/plans';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { planSlug, userEmail, userId } = body as {
      planSlug?: string;
      userEmail?: string;
      userId?: string;
    };

    if (!planSlug || !userEmail || !userId) {
      return Response.json(
        { error: 'Faltan parámetros: planSlug, userEmail, userId' },
        { status: 400 }
      );
    }

    const plan = getPlanBySlug(planSlug);

    if (!plan) {
      return Response.json(
        { error: `Plan inválido: ${planSlug}` },
        { status: 400 }
      );
    }

    // Enterprise never goes through checkout
    if (plan.isEnterprise) {
      return Response.json(
        { error: 'Plan Enterprise requiere contacto directo.', redirect: '/agendar' },
        { status: 422 }
      );
    }

    if (!plan.implPriceCLP || plan.implPriceCLP <= 0) {
      return Response.json(
        { error: 'Plan sin precio de implementación configurado.' },
        { status: 400 }
      );
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurado');

    // Sanitize siteUrl — strip trailing slashes/whitespace/newlines (critical for MP back_urls)
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl').trim().replace(/\/+$/, '');
    if (!siteUrl.startsWith('https://') && !siteUrl.startsWith('http://')) {
      throw new Error(`NEXT_PUBLIC_SITE_URL inválida: "${siteUrl}"`);
    }

    // Create MP Preference for Month 1 (implementation payment)
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: `impl_${planSlug}`,
            title: `AIgenciaLab ${plan.name} — Implementación Mes 1`,
            description: `Pago único de implementación · aigencialab.cl`,
            category_id: 'services',
            quantity: 1,
            currency_id: 'CLP',
            unit_price: plan.implPriceCLP,
          },
        ],
        payer: { email: userEmail },
        external_reference: userId,
        back_urls: {
          success: `${siteUrl}/checkout/success?plan=${planSlug}`,
          failure: `${siteUrl}/checkout/failed?plan=${planSlug}`,
          pending: `${siteUrl}/checkout/pending?plan=${planSlug}`,
        },
        auto_return: 'approved',
        statement_descriptor: 'AIGENCIALAB',
        notification_url: `${siteUrl}/api/v2/webhooks/mp`,
        metadata: {
          userId,
          planSlug,
          type: 'impl_payment',
          implPriceCLP: plan.implPriceCLP,
        },
      }),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error('[impl-preference] MP error:', mpData);
      throw new Error(mpData?.message ?? 'Error al crear preference en MercadoPago');
    }

    // ALWAYS use init_point, NEVER sandbox_init_point
    const checkoutUrl = mpData.init_point;
    if (!checkoutUrl) throw new Error('Preference creada sin init_point');

    // Save pending record in Supabase
    const supabase = getAdminClient();
    await supabase.from('subscriptions').upsert(
      {
        client_id: userId,
        plan: plan.name,
        status: 'pending_impl',
        payment_status: 'pending',
        mp_preference_id: mpData.id,
      },
      { onConflict: 'client_id', ignoreDuplicates: false }
    );

    console.log(
      `[impl-preference] User ${userId} → plan ${plan.name} | impl: $${plan.implPriceCLP} CLP | pref: ${mpData.id}`
    );

    return Response.json({ checkoutUrl, preferenceId: mpData.id });
  } catch (err: any) {
    console.error('[impl-preference] Fatal:', err.message);
    return Response.json(
      { error: err.message ?? 'Error interno' },
      { status: 500 }
    );
  }
}

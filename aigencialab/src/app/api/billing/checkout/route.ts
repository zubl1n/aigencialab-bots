/**
 * POST /api/billing/checkout
 * Creates a MercadoPago checkout URL for the selected plan.
 *
 * Strategy:
 * - Always uses MP Preferences to ensure the price is controlled by plans.ts.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLANS_LIST } from '@/lib/plans';

export const dynamic = 'force-dynamic';

const MP_BASE = 'https://api.mercadopago.com';

/** Get price in CLP for the plan from plans.ts (single source of truth) */
function getPlanPriceCLP(planName: string): number {
  const plan = PLANS_LIST.find(p => p.name.toLowerCase() === planName.toLowerCase());
  // Fallback: if monthlyCLP is 0, assume USD price * 950 (approx conversion)
  if (plan?.monthlyCLP === 0 && plan?.monthlyUSD) {
    return plan.monthlyUSD * 950;
  }
  return plan?.monthlyCLP ?? 0;
}

async function mpFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN not configured');

  const res = await fetch(`${MP_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `MP error ${res.status}`;
    throw new Error(`[MP] ${msg}: ${JSON.stringify(data)}`);
  }
  return data as T;
}

/**
 * Preference-based checkout.
 * Uses the monthlyCLP price from plans.ts — THIS IS THE GROUND TRUTH PRICE.
 */
async function preferenceCheckout(
  planName: string,
  priceCLP: number,
  clientId: string,
  payerEmail: string,
  siteUrl: string,
): Promise<string> {
  const preference = await mpFetch<{ init_point?: string; id?: string }>('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items: [{
        id: `plan_${planName.toLowerCase()}`,
        title: `AIgenciaLab — Plan ${planName}`,
        description: `Suscripción mensual Plan ${planName} · aigencialab.cl`,
        category_id: 'services',
        quantity: 1,
        currency_id: 'CLP',
        unit_price: priceCLP, // Precio 100% desde plans.ts — nunca hardcodeado
      }],
      payer: { email: payerEmail },
      external_reference: clientId,
      back_urls: {
        success: `${siteUrl}/dashboard/billing?payment=success`,
        failure:  `${siteUrl}/dashboard/billing?payment=failure`,
        pending:  `${siteUrl}/dashboard/billing?payment=pending`,
      },
      auto_return: 'approved',
      // Aparece como "AIGENCIALAB" en el estado de cuenta bancario del pagador
      statement_descriptor: 'AIGENCIALAB',
      // El webhook existente en /api/billing/webhook procesa la confirmación de pago
      notification_url: `${siteUrl}/api/billing/webhook`,
      metadata: {
        client_id: clientId,
        plan:      planName,
        price_clp: priceCLP, // Audit trail: precio exacto usado en esta transacción
      },
    }),
  });

  if (!preference.init_point) {
    throw new Error('Preference created but missing init_point');
  }
  return preference.init_point;
}

export async function POST(request: Request) {
  try {
    // Sanitize siteUrl — CRÍTICO: MP rechaza back_urls con trailing \n o /
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl').trim().replace(/\/+$/, '');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // ── Parse body ─────────────────────────────────────────
    let bodyData: { plan?: string; email?: string } = {};
    try { bodyData = await request.json(); } catch { /* empty body OK */ }

    const planRaw = (bodyData.plan ?? 'Pro').trim();

    // Validate plan — accept all 4 plans + case variations
    const validPlans = ['Starter', 'Pro', 'Business', 'Enterprise'];
    const planName = validPlans.find(p => p.toLowerCase() === planRaw.toLowerCase());

    if (!planName) {
      return NextResponse.json(
        { error: `Plan inválido: "${planRaw}". Opciones válidas: Starter, Pro, Business, Enterprise` },
        { status: 400 }
      );
    }

    // Enterprise → contact sales (no checkout)
    if (planName === 'Enterprise') {
      return NextResponse.json(
        { error: 'El plan Enterprise requiere contactar a ventas.', redirect: '/contacto' },
        { status: 422 }
      );
    }

    // ── Authenticate user ──────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let userId = '';
    let clientEmail = '';

    if (authHeader?.startsWith('Bearer ')) {
      const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser();

      if (!authErr && user) {
        userId = user.id;
        const { data: clientData } = await supabaseAdmin
          .from('clients')
          .select('email')
          .eq('id', user.id)
          .maybeSingle();

        clientEmail = clientData?.email ?? user.email ?? '';
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No autenticado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }

    // ── Determine checkout strategy ────────────────────────
    const priceCLP = getPlanPriceCLP(planName);

    if (priceCLP <= 0) {
      return NextResponse.json(
        { error: `Plan ${planName} no tiene precio configurado.` },
        { status: 400 }
      );
    }

    console.log(`[checkout] User ${userId} → plan ${planName} (price: ${priceCLP})`);
    const checkoutUrl = await preferenceCheckout(planName, priceCLP, userId, clientEmail, siteUrl);

    // ── Save pending payment record ────────────────────────
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        client_id: userId,
        plan: planName,
        status: 'trialing',
        payment_status: 'pending',
      }, { onConflict: 'client_id', ignoreDuplicates: false });

    console.log(`[checkout] Redirecting user ${userId} to: ${checkoutUrl.slice(0, 80)}...`);

    return NextResponse.json({ url: checkoutUrl, plan: planName });

  } catch (err: any) {
    console.error('[Billing Checkout API] Fatal error:', err.message);
    return NextResponse.json(
      { error: err.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

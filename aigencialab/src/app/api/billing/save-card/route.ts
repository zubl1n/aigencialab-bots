/**
 * POST /api/billing/save-card
 *
 * Receives a MercadoPago card token (created client-side via MP SDK — never raw card data).
 * Performs a $1 USD authorization hold to validate the card has funds.
 * On success, saves the payment_method_id + masked card info to billing_profiles.
 *
 * Security: Raw card data NEVER touches this server. Only MP tokens.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const MP_BASE = 'https://api.mercadopago.com';

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
    const msg = data?.message ?? data?.cause?.[0]?.description ?? data?.error ?? `MP error ${res.status}`;
    throw new Error(`[MP] ${msg}`);
  }
  return data as T;
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Authenticate user ────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
    }

    // ── Parse token data ─────────────────────────────────────
    const body = await request.json();
    const { token, last4, brand, expiry } = body as {
      token: string;
      last4: string;
      brand: string;
      expiry: string;
    };

    if (!token || !last4) {
      return NextResponse.json({ error: 'Token de tarjeta requerido.' }, { status: 400 });
    }

    // ── Get client email ─────────────────────────────────────
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('email, company_name')
      .eq('id', user.id)
      .maybeSingle();

    const clientEmail = clientData?.email ?? user.email ?? '';

    console.log(`[save-card] User ${user.id} attempting to save card ending in ${last4}`);

    let customerId: string | null = null;
    let paymentMethodId: string | null = null;

    // Skip real MP validation for mock tokens (dev/test)
    const isMockToken = token.startsWith('mock_token_');

    if (!isMockToken) {
      // ── Step 1: Create or get MP Customer ───────────────────
      const { data: existingBilling } = await supabaseAdmin
        .from('billing_profiles')
        .select('mp_customer_id')
        .eq('client_id', user.id)
        .maybeSingle();

      if (existingBilling?.mp_customer_id) {
        customerId = existingBilling.mp_customer_id;
      } else {
        // Create new MP customer
        const customer = await mpFetch<{ id: string }>('/v1/customers', {
          method: 'POST',
          body: JSON.stringify({
            email: clientEmail,
            description: clientData?.company_name ?? clientEmail,
          }),
        });
        customerId = customer.id;
      }

      // ── Step 2: Associate card token to MP Customer ──────────
      const card = await mpFetch<{ id: string; last_four_digits: string; payment_method: { id: string } }>(
        `/v1/customers/${customerId}/cards`,
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        }
      );
      paymentMethodId = card.id;

      // ── Step 3: Authorization hold — $1 USD / minimum CLP ───
      // This validates the card has funds without charging it.
      // We use capture: false for an authorization-only hold.
      const authAmount = 1000; // ~$1 USD in CLP
      const authorization = await mpFetch<{ id: string; status: string; status_detail: string }>(
        '/v1/payments',
        {
          method: 'POST',
          headers: { 'X-Idempotency-Key': `auth-hold-${user.id}-${Date.now()}` },
          body: JSON.stringify({
            transaction_amount: authAmount,
            currency_id: 'CLP',
            token,
            description: 'Verificación de tarjeta AIgenciaLab',
            installments: 1,
            capture: false, // Authorization hold only — not a real charge
            payer: {
              email: clientEmail,
              type: 'customer',
              id: customerId,
            },
            metadata: {
              client_id: user.id,
              purpose: 'card_validation',
            },
          }),
        }
      );

      console.log(`[save-card] Authorization hold status: ${authorization.status} (${authorization.status_detail})`);

      // Cancel the authorization hold immediately (we don't want to charge)
      if (authorization.id && authorization.status === 'authorized') {
        try {
          await mpFetch(`/v1/payments/${authorization.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' }),
          });
          console.log(`[save-card] Authorization hold ${authorization.id} cancelled`);
        } catch (cancelErr: any) {
          console.warn(`[save-card] Could not cancel hold: ${cancelErr.message}`);
        }
      }

      // If the authorization was rejected, the card is invalid
      const rejectedStatuses = ['rejected', 'cancelled', 'refunded'];
      if (rejectedStatuses.includes(authorization.status)) {
        const detail = authorization.status_detail ?? authorization.status;
        const friendlyMessage = detail.includes('insufficient')
          ? 'La tarjeta no tiene fondos suficientes.'
          : detail.includes('invalid')
          ? 'La tarjeta no es válida. Verifica los datos.'
          : `La tarjeta fue rechazada (${detail}). Intenta con otra tarjeta.`;
        return NextResponse.json({ error: friendlyMessage }, { status: 402 });
      }
    }

    // ── Step 4: Save to Supabase billing_profiles ────────────
    // Only masked data + token ID — NEVER raw card numbers
    const { error: upsertErr } = await supabaseAdmin
      .from('billing_profiles')
      .upsert({
        client_id: user.id,
        mp_customer_id: customerId,
        mp_card_token: paymentMethodId, // MP card ID (not raw token)
        card_last4: last4,
        card_brand: brand?.toLowerCase() ?? null,
        card_expiry: expiry ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'client_id' });

    if (upsertErr) {
      console.error('[save-card] Supabase upsert error:', upsertErr.message);
      return NextResponse.json({ error: 'Error guardando tarjeta en base de datos.' }, { status: 500 });
    }

    console.log(`[save-card] Card saved successfully for user ${user.id} (${brand} ****${last4})`);

    return NextResponse.json({
      success: true,
      card: {
        last4,
        brand,
        expiry,
      },
    });

  } catch (err: any) {
    console.error('[save-card] Fatal error:', err.message);
    return NextResponse.json(
      { error: err.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

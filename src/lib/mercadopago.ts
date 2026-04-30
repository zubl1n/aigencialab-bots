/**
 * src/lib/mercadopago.ts
 * MercadoPago server-side client — single instance, no secrets leaked.
 * ONLY imported in server components / API routes (never 'use client').
 */

const MP_BASE = 'https://api.mercadopago.com';

// ── Plan ID map — all 4 plans ─────────────────────────────────────────────────
// Starter and Business need their own MP preapproval plan IDs created in the MP dashboard.
// Until those env vars are set, checkout falls back to preference-based checkout with correct price.
export const MP_PLAN_IDS: Record<string, string | undefined> = {
  Starter:    process.env.MP_PLAN_STARTER_ID    ?? undefined,
  Pro:        process.env.MP_PLAN_PRO_ID        ?? 'b2a75ff35c44491f81721b5134112f19',
  Business:   process.env.MP_PLAN_BUSINESS_ID   ?? undefined,
  Enterprise: process.env.MP_PLAN_ENTERPRISE_ID ?? 'c579d6146d16485ba450b55e2ee10613',
};

// ── Typed response helpers ───────────────────────────────────────────────────
async function mpFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  // Always read token at runtime (not module load) so env is available
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('[MP] MP_ACCESS_TOKEN not set');

  const res = await fetch(`${MP_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {})
    }
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `MP error ${res.status}`;
    throw new Error(`[MercadoPago] ${msg}: ${JSON.stringify(data)}`);
  }
  return data as T;
}

// ── Subscriptions API ────────────────────────────────────────────────────────

/**
 * Creates a "preapproval" pending subscription with external_reference=clientId.
 * This generates a unique init_point URL that embeds our client ID,
 * which MP sends back in the webhook so we can match the payment.
 *
 * Returns { checkout_url, preapproval_id }
 */
export async function getMpCheckoutUrl(
  planName: 'Pro' | 'Enterprise',
  payer: { email: string; name?: string },
  clientId: string
): Promise<{ checkout_url: string; preapproval_plan_id: string }> {
  const planId = MP_PLAN_IDS[planName];
  if (!planId) {
    throw new Error(`Plan ID not configured for plan: ${planName}`);
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl';

  // Create a pending preapproval with external_reference so the webhook can match this client
  const payload = {
    preapproval_plan_id: planId,
    payer_email: payer.email,
    external_reference: clientId,           // ← CRITICAL: used by webhook to find client
    back_url: `${siteUrl}/dashboard/billing?payment=success`,
  };

  let preapproval: any;
  try {
    preapproval = await mpFetch('/preapproval', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (createErr: any) {
    // Fallback: if creating preapproval fails (e.g., payer not registered),
    // fall back to plan's static init_point
    console.warn('[MP] Preapproval create failed, falling back to plan init_point:', createErr.message);
    const plan = await getMpPlan(planId);
    if (!plan?.init_point) {
      throw new Error('Plan not found or missing init_point');
    }
    return {
      checkout_url: plan.init_point,
      preapproval_plan_id: planId
    };
  }

  const checkoutUrl = preapproval?.init_point;
  if (!checkoutUrl) {
    throw new Error('Preapproval created but missing init_point');
  }

  return {
    checkout_url: checkoutUrl,
    preapproval_plan_id: planId
  };
}

/**
 * Get subscription details by preapproval ID
 */
export async function getMpSubscription(preapprovalId: string) {
  return mpFetch(`/preapproval/${preapprovalId}`);
}

/**
 * Cancel a subscription
 */
export async function cancelMpSubscription(preapprovalId: string) {
  return mpFetch(`/preapproval/${preapprovalId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' })
  });
}

/**
 * Search subscriptions by external_reference (= client_id)
 */
export async function getMpSubscriptionByClient(clientId: string) {
  const data = await mpFetch<{ results: any[] }>(
    `/preapproval/search?external_reference=${clientId}&status=authorized&limit=1`
  );
  return data.results?.[0] ?? null;
}

/**
 * Get plan details
 */
export async function getMpPlan(planId: string) {
  return mpFetch(`/preapproval_plan/${planId}`);
}

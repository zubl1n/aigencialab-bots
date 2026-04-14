/**
 * src/lib/mercadopago.ts
 * MercadoPago server-side client — single instance, no secrets leaked.
 * ONLY imported in server components / API routes (never 'use client').
 */

const MP_BASE = 'https://api.mercadopago.com';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

if (!ACCESS_TOKEN && process.env.NODE_ENV !== 'test') {
  console.warn('[MP] MP_ACCESS_TOKEN not set in environment variables');
}

// ── Plan ID map ──────────────────────────────────────────────────────────────
export const MP_PLAN_IDS = {
  Pro:        process.env.MP_PLAN_PRO_ID        ?? 'b2a75ff35c44491f81721b5134112f19',
  Enterprise: process.env.MP_PLAN_ENTERPRISE_ID ?? 'c579d6146d16485ba450b55e2ee10613',
} as const;

// ── Typed response helpers ───────────────────────────────────────────────────
async function mpFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${MP_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {})
    }
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message ?? data?.error ?? `MP error ${res.status}`;
    throw new Error(`[MercadoPago] ${msg}`);
  }
  return data as T;
}

// ── Subscriptions API ────────────────────────────────────────────────────────

/**
 * Get subscription checkout URL for a plan.
 * Returns { checkout_url, preapproval_plan_id }
 */
export async function getMpCheckoutUrl(
  planName: 'Pro' | 'Enterprise',
  payer: { email: string; name?: string },
  clientId: string
): Promise<{ checkout_url: string; preapproval_plan_id: string }> {
  const planId = MP_PLAN_IDS[planName];

  // For MercadoPago Subscriptions with Hosted Checkout, we provide the plan's init_point.
  // MP matches the user by email or by them entering their details on the checkout form.
  // In our webhook, we will match the new subscription via payer_email or other identifiers.
  const plan = await getMpPlan(planId);
  
  if (!plan?.init_point) {
    throw new Error('Plan not found or missing init_point');
  }

  return {
    checkout_url: plan.init_point,
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

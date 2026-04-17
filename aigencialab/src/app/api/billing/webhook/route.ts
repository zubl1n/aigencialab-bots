/**
 * POST /api/billing/webhook  ← v1 (LEGACY FORWARD)
 *
 * This endpoint existed before the v2 checkout flow was introduced.
 * All incoming MercadoPago webhooks are forwarded internally to the
 * canonical v2 handler (/api/v2/webhooks/mp) which contains the full,
 * maintained business logic.
 *
 * WHY KEEP THIS ROUTE?
 * MercadoPago stores webhook URLs per subscription/payment preference.
 * Legacy subscriptions created before the v2 migration still point here.
 * Changing the URL in MP requires re-authorizing every active subscription.
 * Instead we forward here → no downtime, no duplicated code.
 *
 * TO REMOVE: once all active MP subscriptions have been migrated or
 * renewed under the v2 checkout, this file can be safely deleted.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const bodyText = await request.text();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl')
    .replace(/[\r\n\s]+/g, '');

  const v2Url = `${siteUrl}/api/v2/webhooks/mp${request.nextUrl.search}`;

  try {
    const v2Res = await fetch(v2Url, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
        'X-Forwarded-From': 'webhook-v1',
      },
      body: bodyText || undefined,
    });

    const payload = await v2Res.json().catch(() => ({ ok: true }));
    // Always return 200 — MercadoPago retries on any non-200
    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    console.error('[webhook-v1 forward error]', err.message);
    return NextResponse.json({ ok: true, forwarded: false });
  }
}

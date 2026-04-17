/**
 * POST /api/billing/checkout — DEPRECATED v1
 * Redirige al flujo v2 (/api/v2/checkout/create-impl-preference)
 * Este endpoint se mantiene por compatibilidad hacia atrás pero delega al v2.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const planRaw = (body.plan ?? '').trim();

    // Mapeo de nombres legacy (lib/plans.ts) → slugs actuales (config/plans.ts)
    const LEGACY_PLAN_MAP: Record<string, string> = {
      starter:  'starter',
      Starter:  'starter',
      pro:      'pro',
      Pro:      'pro',
      business: 'starter', // Business no existe en config/plans.ts → fallback a Starter
      Business: 'starter',
      enterprise: 'enterprise',
      Enterprise: 'enterprise',
    };

    const planSlug = LEGACY_PLAN_MAP[planRaw];

    if (!planSlug) {
      return NextResponse.json(
        { error: `Plan inválido: "${planRaw}". Opciones: basic, starter, pro, enterprise` },
        { status: 400 }
      );
    }

    // Enterprise → contact sales
    if (planSlug === 'enterprise') {
      return NextResponse.json(
        { error: 'El plan Enterprise requiere contactar a ventas.', redirect: '/agendar' },
        { status: 422 }
      );
    }

    // Delegar al v2 — reenviar la misma request con el slug correcto
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl').trim().replace(/\/+$/, '');
    const v2Url = `${siteUrl}/api/v2/checkout/create-impl-preference`;

    // Obtener auth header para pasarlo al v2
    const authHeader = request.headers.get('Authorization');

    // Parsear userId y userEmail del auth header si está disponible
    // El frontend debe enviar estos en el body al llamar directamente al v2
    const userId     = body.user_id ?? body.userId ?? '';
    const userEmail  = body.email ?? body.userEmail ?? '';

    if (!userId || !userEmail) {
      // No tenemos los datos que necesita v2 — devolver redirect para que el frontend use el checkout v2 directamente
      return NextResponse.json(
        {
          error: 'Este endpoint está deprecado. Usa /checkout/[plan] directamente.',
          redirect: `/checkout/${planSlug}`,
          deprecated: true,
        },
        { status: 301 }
      );
    }

    const v2Res = await fetch(v2Url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ planSlug, userEmail, userId }),
    });

    const v2Data = await v2Res.json();

    if (!v2Res.ok) {
      return NextResponse.json({ error: v2Data.error ?? 'Error en checkout v2' }, { status: v2Res.status });
    }

    // v2 devuelve { checkoutUrl, preferenceId } — adaptar al formato legacy { url, plan }
    return NextResponse.json({
      url:  v2Data.checkoutUrl,
      plan: planSlug,
      // Indicar al cliente que migre al nuevo flujo
      _note: 'Este endpoint está deprecado. Por favor usa /checkout/[plan].',
    });

  } catch (err: any) {
    console.error('[Billing Checkout API v1 deprecated]', err.message);
    return NextResponse.json(
      { error: err.message ?? 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

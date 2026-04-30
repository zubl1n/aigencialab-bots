/**
 * GET /api/client/verify-widget
 * Verifies if the client's widget is properly installed on their registered domain.
 * Checks if the widget script is reachable AND returns a 200 response.
 *
 * Returns: { installed: boolean, domain: string | null, checkedAt: string, error?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const adminSupa = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get client's registered domain + clientId
    const { data: client } = await adminSupa
      .from('clients')
      .select('website, domain')
      .eq('id', user.id)
      .maybeSingle();

    const rawDomain = client?.domain ?? client?.website ?? null;
    if (!rawDomain) {
      return NextResponse.json({
        installed:  false,
        domain:     null,
        checkedAt:  new Date().toISOString(),
        error:      'No tienes un dominio registrado. Actualiza tu dominio en Configuración.',
      });
    }

    // Normalize domain
    let domain = rawDomain.trim().replace(/\/$/, '');
    if (!domain.startsWith('http')) domain = `https://${domain}`;

    // Check 1: Fetch the client's homepage and look for the widget script tag
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl';
    const scriptPattern = new RegExp(`${siteUrl}/api/widget/${user.id}/script\\.js`, 'i');

    let installed = false;
    let checkError: string | undefined;

    try {
      const res = await fetch(domain, {
        headers: { 'User-Agent': 'AIgenciaLab-WidgetVerifier/1.0' },
        signal:  AbortSignal.timeout(8000),
        // @ts-ignore
        redirect: 'follow',
      });

      if (res.ok) {
        const html = await res.text();
        installed = scriptPattern.test(html);

        if (!installed) {
          checkError = 'El snippet no fue encontrado en el HTML de tu sitio. Verifica que está antes de </body>.';
        }
      } else {
        checkError = `Tu sitio respondió con HTTP ${res.status}. Verifica que el dominio es accesible.`;
      }
    } catch (fetchErr: any) {
      checkError = `No se pudo acceder a ${domain}: ${fetchErr.message}`;
    }

    // Persist result in clients table if column exists
    await adminSupa
      .from('clients')
      .update({ widget_verified: installed, widget_verified_at: new Date().toISOString() })
      .eq('id', user.id)
      .maybeSingle(); // ignore error if columns don't exist

    return NextResponse.json({
      installed,
      domain,
      checkedAt: new Date().toISOString(),
      error:     checkError ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, installed: false }, { status: 500 });
  }
}

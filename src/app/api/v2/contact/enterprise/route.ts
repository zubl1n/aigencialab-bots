/**
 * POST /api/v2/contact/enterprise
 * Handles Enterprise contact form submissions.
 * Inserts into contact_requests table and notifies admin.
 */
import { createClient } from '@supabase/supabase-js';

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
    const {
      name,
      email,
      company,
      phone,
      teamSize,
      channels,
      message,
      planInterest = 'enterprise',
    } = body as {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
      teamSize?: string;
      channels?: string[];
      message?: string;
      planInterest?: string;
    };

    // Validation
    const missing = [];
    if (!name?.trim()) missing.push('nombre');
    if (!email?.trim()) missing.push('email');
    if (!company?.trim()) missing.push('empresa');
    if (!phone?.trim()) missing.push('teléfono');
    if (!teamSize?.trim()) missing.push('tamaño del equipo');

    if (missing.length > 0) {
      return Response.json(
        { error: `Campos requeridos: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Insert contact request
    const { data: contactReq, error: insertErr } = await supabase
      .from('contact_requests')
      .insert({
        name: name!.trim(),
        email: email!.trim().toLowerCase(),
        company: company!.trim(),
        phone: phone!.trim(),
        team_size: teamSize,
        message: message?.trim() || null,
        plan_interest: planInterest,
        channels_interest: channels ? channels.join(', ') : null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('[enterprise-contact] DB error:', insertErr);
      throw new Error('Error al guardar la solicitud');
    }

    // Send admin notification email
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aigencialab.cl';

    if (resendKey && !resendKey.includes('REPLACE')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl',
          to: adminEmail,
          subject: `[AIgenciaLab] Solicitud Enterprise · ${company} · Equipo: ${teamSize}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0a0f1e; color: #fff; padding: 24px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 20px;">🏢 Nueva Solicitud Enterprise</h2>
              </div>
              <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 140px;">Nombre</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}">${email}</a></td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Empresa</td><td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${company}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Teléfono</td><td style="padding: 8px 0; color: #0f172a;"><a href="https://wa.me/${phone?.replace(/\D/g, '')}">${phone}</a></td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Equipo</td><td style="padding: 8px 0; color: #0f172a;">${teamSize}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Canales</td><td style="padding: 8px 0; color: #0f172a;">${channels?.join(', ') || '—'}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; vertical-align: top;">Mensaje</td><td style="padding: 8px 0; color: #0f172a;">${message || '—'}</td></tr>
                </table>
              </div>
              <div style="background: #eff6ff; padding: 16px 24px; border: 1px solid #bfdbfe; border-top: none; border-radius: 0 0 8px 8px;">
                <a href="https://wa.me/${phone?.replace(/\D/g, '')}" 
                   style="background: #25d366; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 12px;">
                  💬 Responder por WhatsApp
                </a>
                <a href="https://aigencialab.cl/admin" 
                   style="background: #1d4ed8; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Ver en Admin →
                </a>
              </div>
            </div>
          `,
        }),
      }).catch(console.error);
    }

    console.log(`[enterprise-contact] New request: ${contactReq?.id} | ${company} | ${email}`);

    return Response.json({ ok: true, id: contactReq?.id });
  } catch (err: any) {
    console.error('[enterprise-contact] Fatal:', err.message);
    return Response.json(
      { error: err.message ?? 'Error interno' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contact
 * Handles contact form submissions from the public site.
 * Sends confirmation to sender + notification to admin@aigencialab.cl
 */
import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/emails';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email y message son requeridos' }, { status: 400 });
    }

    await sendContactFormEmail({ name, email, company, phone, message });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[api/contact] error:', err);
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 });
  }
}

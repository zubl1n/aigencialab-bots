/**
 * POST /api/partners
 * Partner program registration — sends notification to admin + confirmation to partner
 * Uses lib/emails.ts sendNewPartnerEmail (professional template with BCC audit)
 */
import { NextResponse } from 'next/server';
import { sendNewPartnerEmail } from '@/lib/emails';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, agencyName, website, message, partnerType } = body;

    if (!name || !email || !agencyName) {
      return NextResponse.json({ error: 'name, email y agencyName son requeridos' }, { status: 400 });
    }

    await sendNewPartnerEmail({
      name,
      company:     agencyName,
      email,
      phone:       body.phone,
      partnerType: partnerType ?? 'agencia',
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[api/partners] error:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la solicitud' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, agencyName, website, message } = body;

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.warn('RESEND_API_KEY no detectado. Modo desarrollo: simulando envío.');
      return NextResponse.json({ success: true, simulated: true });
    }

    const { Resend } = require('resend');
    const resend = new Resend(key);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl',
      to: ['admin@aigencialab.cl'],
      subject: `🤝 Nueva Solicitud de Partner: ${agencyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #1e40af;">Nueva Solicitud de Agencia Partner</h2>
          <p>Una nueva agencia está interesada en vender nuestra tecnología IA.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Nombre de la Agencia:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${agencyName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Contacto:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${name}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Sitio Web o Portafolio:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${website || 'No especificado'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #ccc;"><strong>Mensaje/Comentarios:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ccc;">${message || 'Sin mensaje'}</td></tr>
          </table>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">AIgenciaLab Partner Network - Sistema Automático</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando email de partner:', error);
    return NextResponse.json({ error: 'Hubo un problema al enviar la solicitud' }, { status: 500 });
  }
}

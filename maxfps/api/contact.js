export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY || 're_CZwbGdxm_JaoPLL4A8xyfQhehPh8NVEpi');
    
    let data;
    if (typeof req.body === 'string') {
      data = JSON.parse(req.body);
    } else {
      data = req.body;
    }

    const { name, company, email, phone, details } = data;

    const emailPayload = {
      from: 'onboarding@resend.dev',
      to: 'admin@aigencialab.cl',
      reply_to: email,
      subject: `🚨 Nuevo Lead Comercial (MaxFPS): ${company || name}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#050608;color:#e2e8f0;border-radius:12px;overflow:hidden;border:1px solid #1e293b;">
          <div style="background:linear-gradient(135deg,#00FF66,#00d2ff);padding:24px;text-align:center;">
            <h1 style="margin:0;font-size:1.5rem;color:#000;">NUEVO PROYECTO WEB</h1>
          </div>
          <div style="padding:24px;background:#0F141C;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono/WhatsApp:</strong> ${phone}</p>
            <p><strong>Empresa/Organización:</strong> ${company || 'No especificada'}</p>
            <hr style="border-color:#1e293b;margin:20px 0;"/>
            <p><strong>Detalles del proyecto requeridos:</strong></p>
            <p style="white-space:pre-wrap;color:#94a3b8;">${details}</p>
          </div>
        </div>
      `,
    };

    let emailResponse = await resend.emails.send(emailPayload);

    if (emailResponse.error) {
      if (emailResponse.error.message.includes('own email address')) {
         const fallbackResponse = await resend.emails.send({
            ...emailPayload,
            to: 'mi.vallejossalazar@gmail.com',
            subject: `[REDIRECCIÓN SANDBOX] 🚨 Nuevo Lead: ${company || name}`,
            html: `<p style="color:orange;"><b>Aviso:</b> Este correo fue redirigido a mi.vallejossalazar@gmail.com predeterminadamente ya que tu llave de Resend no tiene un dominio verificado para enviar a admin@aigencialab.cl.</p>` + emailPayload.html
         });
         
         if(fallbackResponse.error) {
             return res.status(400).json({ error: fallbackResponse.error, message: 'Failed standard and fallback dispatch' });
         }
         return res.status(200).json({ success: true, message: 'Sent via fallback', id: fallbackResponse.data?.id });
      }
      return res.status(400).json(emailResponse.error);
    }

    return res.status(200).json({ success: true, id: emailResponse.data?.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

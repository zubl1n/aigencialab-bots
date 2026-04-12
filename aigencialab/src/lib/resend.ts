/**
 * resend.ts — Email notifications via Resend (3.000/mes gratis)
 * Lazy initialization: Resend se crea dentro de cada función, no a nivel módulo
 */

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl'
const TO   = process.env.RESEND_TO_EMAIL   ?? 'contacto@aigencialab.cl'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require('resend') as typeof import('resend')
  return new Resend(key)
}

export async function sendLeadNotificationEmail(data: {
  name: string; company: string; whatsapp: string; email: string;
  url: string; score: number; tier: string; rubro: string; realData: boolean;
}) {
  const resend = getResend()
  if (!resend) return  // Skip si no está configurado

  const tierEmoji = data.tier === 'hot' ? '🔥' : data.tier === 'warm' ? '🌡️' : '❄️'
  const subject   = `${tierEmoji} Nuevo lead: ${data.company || data.name} — Score ${data.score}/100`

  await resend.emails.send({
    from:    FROM,
    to:      [TO],
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0c14;color:#e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:1.5rem;color:#fff;">🚨 Nuevo Lead — AigenciaLab.cl</h1>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:40%;">Empresa</td><td style="color:#e2e8f0;font-weight:600;">${data.company || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Contacto</td><td style="color:#e2e8f0;">${data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">WhatsApp</td><td><a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}" style="color:#00d4ff;">${data.whatsapp}</a></td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Email</td><td style="color:#e2e8f0;">${data.email || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Sitio web</td><td><a href="${data.url}" style="color:#00d4ff;">${data.url || '—'}</a></td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Rubro</td><td style="color:#e2e8f0;">${data.rubro}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Score</td><td style="color:#f59e0b;font-weight:700;font-size:1.2rem;">${data.score}/100 ${tierEmoji}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Análisis</td><td style="color:#e2e8f0;">${data.realData ? '📡 Datos reales (PageSpeed + HTML)' : '📊 Estimado por rubro'}</td></tr>
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="https://wa.me/${data.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${data.name}! Vi tu auditoría en AigenciaLab.cl. Tu score fue ${data.score}/100. ¿Cuándo podemos hablar?`)}"
               style="display:inline-block;background:#25d366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-right:12px;">
              💬 Responder por WhatsApp
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'}/dashboard/leads"
               style="display:inline-block;background:#1e40af;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
              📊 Ver en Dashboard
            </a>
          </div>
        </div>
        <div style="padding:12px 24px;text-align:center;color:#475569;font-size:.75rem;">
          AigenciaLab.cl · Ley N°19.628 · Este email se envió automáticamente al recibir una auditoría.
        </div>
      </div>
    `,
  })
}

export async function sendOnboardingWelcomeEmail(data: {
  contactName: string; company: string; email: string; plan: string; dashboardUrl: string;
}) {
  const resend = getResend()
  if (!resend || !data.email) return

  await resend.emails.send({
    from: FROM,
    to:   [data.email],
    subject: `🎉 ¡Bienvenido a AigenciaLab, ${data.company}! Tu agente IA está listo`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;color:#fff;font-size:1.8rem;">¡Bienvenido/a, ${data.contactName}! 🎉</h1>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0;">Tu cuenta en AigenciaLab.cl está lista</p>
        </div>
        <div style="background:#0a0c14;color:#e2e8f0;padding:32px;border-radius:0 0 12px 12px;">
          <p>Hola ${data.contactName},</p>
          <p>Tu empresa <strong>${data.company}</strong> ha sido activada con el plan <strong>${data.plan.toUpperCase()}</strong>.</p>
          <h3 style="color:#00d4ff;">Próximos pasos:</h3>
          <ol style="color:#94a3b8;line-height:1.8;">
            <li>Accede a tu dashboard 👇</li>
            <li>Completa la configuración de tu agente IA</li>
            <li>Conecta tu WhatsApp Business</li>
            <li>¡Empieza a atender clientes automáticamente!</li>
          </ol>
          <div style="text-align:center;margin-top:24px;">
            <a href="${data.dashboardUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem;">
              📊 Acceder a mi Dashboard
            </a>
          </div>
          <p style="margin-top:24px;color:#94a3b8;font-size:.85rem;">
            ¿Tienes dudas? Escríbenos al WhatsApp: <a href="https://wa.me/${process.env.NEXT_PUBLIC_WA_SALES_NUMBER}" style="color:#00d4ff;">+${process.env.NEXT_PUBLIC_WA_SALES_NUMBER}</a>
          </p>
        </div>
      </div>
    `,
  })
}

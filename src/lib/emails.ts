/**
 * src/lib/emails.ts — Full transactional email system via Resend
 * ALL templates:
 * - Professional HTML with AIgenciaLab dark/neon branding
 * - BCC to admin@aigencialab.cl on every client email
 * - Dynamic variables (name, plan, amount, date, etc.)
 * Covers all 13 required flows.
 */

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL        ?? 'https://aigencialab.cl'
const FROM      = process.env.RESEND_FROM_EMAIL            ?? 'noreply@aigencialab.cl'
const ADMIN_BCC = process.env.ADMIN_NOTIFICATION_EMAIL     ?? 'admin@aigencialab.cl'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require('resend') as typeof import('resend')
  return new Resend(key)
}

// ─── Base styles ─────────────────────────────────────────────
const BASE = `font-family:Inter,'Plus Jakarta Sans',sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#F1F0F5;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);`
const HDR  = `background:linear-gradient(135deg,#1e3a8a,#7C3AED);padding:40px 36px;text-align:center;`
const BDY  = `padding:36px 36px 28px;`
const FTR  = `padding:20px 36px;text-align:center;background:#0d0d14;color:#6B6480;font-size:11px;border-top:1px solid rgba(255,255,255,0.05);line-height:1.8;`
const BTN  = `display:inline-block;background:#7C3AED;color:#fff!important;padding:15px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:-0.3px;`
const MUTED= `color:#A09CB0;line-height:1.75;font-size:14px;`
const H1   = `margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px;line-height:1.2;`
const SUB  = `color:rgba(255,255,255,0.7);margin:10px 0 0;font-size:14px;`
const BOX_P= `background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:22px;margin:24px 0;`
const BOX_G= `background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:22px;margin:24px 0;`
const BOX_R= `background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:22px;margin:24px 0;`
const BOX_Y= `background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:22px;margin:24px 0;`

function footer(extra?: string) {
  return `${extra ? `<p style="color:#A09CB0;font-size:13px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);">${extra}</p>` : ''}
    <p style="${MUTED}font-size:12px">¿Tienes dudas? Escríbenos a <a href="mailto:hola@aigencialab.cl" style="color:#C084FC">hola@aigencialab.cl</a></p>`
}

function wrap(hdr: string, body: string, footerExtra?: string): string {
  return `<div style="${BASE}">
    <div style="${HDR}">${hdr}</div>
    <div style="${BDY}">${body}${footer(footerExtra)}</div>
    <div style="${FTR}">AIgenciaLab.cl · Plataforma de Agentes IA para Empresas · ${new Date().getFullYear()}<br>
    Cumple Ley N°19.628 y N°21.663 Chile · <a href="${SITE_URL}/privacidad" style="color:#6B6480">Política de Privacidad</a></div>
  </div>`
}

function row(label: string, value: string, color = '#F1F0F5') {
  return `<tr><td style="padding:8px 0;color:#A09CB0;width:42%;font-size:13px;">${label}</td><td style="color:${color};font-weight:600;font-size:13px;">${value}</td></tr>`
}

// ─── Helper: send with BCC to admin ──────────────────────────
async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  bccAdmin?: boolean  // default true
}) {
  const r = getResend()
  if (!r) { console.warn('[emails] RESEND_API_KEY not set — email not sent'); return }
  
  try {
    await r.emails.send({
      from: FROM,
      to: [opts.to],
      bcc: opts.bccAdmin !== false ? [ADMIN_BCC] : [],
      subject: opts.subject,
      html: opts.html,
    })
  } catch (err) {
    console.error('[emails] send error:', err)
  }
}

async function sendAdminEmail(subject: string, html: string) {
  const r = getResend()
  if (!r) return
  try {
    await r.emails.send({ from: FROM, to: [ADMIN_BCC], subject, html })
  } catch (err) {
    console.error('[emails] admin send error:', err)
  }
}

/* ══════════════════════════════════════════════════════════════
   1. BIENVENIDA POST-REGISTRO
   ══════════════════════════════════════════════════════════════ */
export async function sendWelcomeEmail(data: {
  email: string; name: string; company: string; plan: string
}) {
  await sendEmail({
    to: data.email,
    subject: `🎉 Bienvenido/a a AIgenciaLab, ${data.company}`,
    html: wrap(
      `<h1 style="${H1}">¡Bienvenido/a, ${data.name}! 🎉</h1>
       <p style="${SUB}">Tu cuenta en AIgenciaLab está lista</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Tu empresa <strong style="color:#C084FC">${data.company}</strong> ha sido registrada con el plan <strong style="color:#34d399">${data.plan.toUpperCase()}</strong>. Tienes <strong>14 días de prueba gratuita</strong>.</p>
       <div style="${BOX_G}">
         <div style="text-align:center;font-size:32px;margin-bottom:8px">🚀</div>
         <table style="width:100%;border-collapse:collapse">
           ${row('Plan activo', data.plan.toUpperCase(), '#34d399')}
           ${row('Trial', '14 días gratuitos')}
           ${row('Soporte', 'Incluido en todos los planes')}
         </table>
       </div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard" style="${BTN}">🚀 Ir a mi Dashboard</a></p>`,
      'Puedes cancelar en cualquier momento sin cargos adicionales.'
    ),
  })

  // Admin notification
  await sendAdminEmail(`🎉 Nuevo registro: ${data.company} (${data.plan})`,
    wrap(
      `<h1 style="${H1}">Nuevo Cliente Registrado</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', data.company, '#C084FC')}
         ${row('Contacto', data.name)}
         ${row('Email', data.email)}
         ${row('Plan', data.plan.toUpperCase(), '#34d399')}
       </table>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes" style="${BTN}">Ver en Panel Admin</a></p>`
    )
  )
}

/* ══════════════════════════════════════════════════════════════
   2. PAGO APROBADO / SUSCRIPCIÓN ACTIVA
   ══════════════════════════════════════════════════════════════ */
export async function sendPaymentApprovedEmail(data: {
  email: string; name: string; company: string; plan: string
  amountCLP?: number; nextBillingDate: string
}) {
  const amount = data.amountCLP ? `$${data.amountCLP.toLocaleString('es-CL')} CLP` : 'Ver factura'
  await sendEmail({
    to: data.email,
    subject: `✅ Pago confirmado — Plan ${data.plan} activado`,
    html: wrap(
      `<h1 style="${H1}">¡Pago confirmado! ✅</h1>
       <p style="${SUB}">${data.company}</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Tu pago fue procesado correctamente. Tu plan <strong style="color:#C084FC">${data.plan.toUpperCase()}</strong> está activo.</p>
       <div style="${BOX_G}">
         <table style="width:100%;border-collapse:collapse">
           ${row('Plan', data.plan.toUpperCase(), '#34d399')}
           ${row('Monto', amount)}
           ${row('Próximo cobro', data.nextBillingDate)}
           ${row('Estado', '🟢 Activo')}
         </table>
       </div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">Ver mi suscripción</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   3. PAGO FALLIDO
   ══════════════════════════════════════════════════════════════ */
export async function sendPaymentFailedEmail(data: {
  email: string; name: string; company: string; plan: string
}) {
  await sendEmail({
    to: data.email,
    subject: `⚠️ Problema con tu pago — Acción requerida urgente`,
    html: wrap(
      `<h1 style="${H1}">Problema con tu pago ⚠️</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">No pudimos procesar el pago de tu plan <strong style="color:#C084FC">${data.plan}</strong>. Para evitar interrupciones en tu agente IA, actualiza tu método de pago.</p>
       <div style="${BOX_R}">
         <p style="color:#f87171;font-weight:700;text-align:center;margin:0;font-size:14px">⛔ Tu agente puede pausarse en las próximas 24 horas</p>
       </div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">Actualizar método de pago</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   4. BOT ACTIVADO
   ══════════════════════════════════════════════════════════════ */
export async function sendBotActivatedEmail(data: {
  email: string; name: string; company: string; botName: string
}) {
  await sendEmail({
    to: data.email,
    subject: `🤖 ¡Tu Agente IA "${data.botName}" ya está activo!`,
    html: wrap(
      `<h1 style="${H1}">¡Bot Activado! 🤖</h1>
       <p style="${SUB}">${data.company} · Listo para operar</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Grandes noticias: tu Agente IA <strong style="color:#C084FC">"${data.botName}"</strong> fue activado y ya está atendiendo visitas en tiempo real.</p>
       <div style="${BOX_G}">
         <div style="text-align:center;font-size:40px;margin-bottom:10px">🟢</div>
         <p style="color:#34d399;font-weight:800;text-align:center;margin:0;font-size:16px">AGENTE ACTIVO Y OPERANDO</p>
       </div>
       <h3 style="color:#C084FC;font-size:15px">📋 Próximo paso: Instalar en tu sitio</h3>
       <p style="${MUTED}">Copia el snippet de 1 línea desde tu dashboard e instálalo en tu web.</p>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard/installation" style="${BTN}">Obtener snippet de instalación</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   5. BOT DESACTIVADO
   ══════════════════════════════════════════════════════════════ */
export async function sendBotDeactivatedEmail(data: {
  email: string; name: string; company: string; reason?: string
}) {
  await sendEmail({
    to: data.email,
    subject: `⏸ Tu agente IA ha sido pausado`,
    html: wrap(
      `<h1 style="${H1}">Agente pausado ⏸</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Tu agente IA de <strong style="color:#C084FC">${data.company}</strong> ha sido pausado temporalmente.${data.reason ? ` <br><strong>Motivo:</strong> ${data.reason}` : ''}</p>
       <p style="${MUTED}">Para reactivarlo, verifica tu suscripción o contacta a nuestro equipo.</p>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">Verificar suscripción</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   6. TRIAL POR VENCER
   ══════════════════════════════════════════════════════════════ */
export async function sendTrialExpiringEmail(data: {
  email: string; name: string; company: string; plan: string; daysLeft: number; trialEndDate: string
  /** @deprecated use trialEndDate */ expiresOn?: string
}) {
  await sendEmail({
    to: data.email,
    subject: `⏰ Tu prueba gratuita vence en ${data.daysLeft} días — AIgenciaLab`,
    html: wrap(
      `<h1 style="${H1}">Tu prueba vence pronto ⏰</h1>
       <p style="${SUB}">${data.company} · Plan ${data.plan.toUpperCase()}</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Tu prueba gratuita del plan <strong style="color:#C084FC">${data.plan.toUpperCase()}</strong> vence el <strong style="color:#fbbf24">${data.trialEndDate ?? data.expiresOn}</strong> (${data.daysLeft} días).</p>
       <div style="${BOX_Y}">
         <div style="text-align:center;font-size:28px;margin-bottom:8px">🔔</div>
         <p style="color:#fbbf24;text-align:center;font-weight:700;margin:0 0 8px">¿Qué pasa si no me suscribo?</p>
         <p style="color:#A09CB0;font-size:13px;text-align:center;margin:0">Tu bot quedará en pausa y no podrás recibir nuevos leads hasta activar tu plan.</p>
       </div>
       <p style="${MUTED}">Para continuar sin interrupciones, activa tu plan ahora. Puedes cancelar en cualquier momento.</p>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">✅ Activar Plan Ahora</a></p>`,
      `Si no quieres continuar, no necesitas hacer nada — tu cuenta se pausará automáticamente.`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   7. CANCELACIÓN DE SUSCRIPCIÓN
   ══════════════════════════════════════════════════════════════ */
export async function sendCancellationEmail(data: {
  email: string; name: string; company: string; plan: string; endsOn: string
}) {
  await sendEmail({
    to: data.email,
    subject: `❌ Suscripción cancelada — Plan ${data.plan}`,
    html: wrap(
      `<h1 style="${H1}">Suscripción cancelada</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Hemos cancelado tu suscripción al plan <strong style="color:#C084FC">${data.plan}</strong>. Tu acceso continuará activo hasta el <strong>${data.endsOn}</strong>.</p>
       <div style="${BOX_Y}">
         <table style="width:100%;border-collapse:collapse">
           ${row('Empresa', data.company)}
           ${row('Plan', data.plan.toUpperCase(), '#C084FC')}
           ${row('Acceso hasta', data.endsOn, '#fbbf24')}
         </table>
       </div>
       <p style="${MUTED}">Lamentamos verte partir. Si fue un error o quieres reactivar, puedes hacerlo en cualquier momento.</p>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/precios" style="${BTN}">Reactivar suscripción</a></p>`,
      '¿Podemos mejorar algo? Escríbenos a hola@aigencialab.cl — leemos cada mensaje.'
    ),
  })
  // Admin notification
  await sendAdminEmail(`❌ Cancelación: ${data.company} (${data.plan})`,
    wrap(`<h1 style="${H1}">Suscripción Cancelada</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', data.company, '#f87171')}
         ${row('Email', data.email)}
         ${row('Plan', data.plan.toUpperCase())}
         ${row('Acceso hasta', data.endsOn)}
       </table>`
    )
  )
}

/* ══════════════════════════════════════════════════════════════
   8. NUEVO TICKET → ADMIN
   ══════════════════════════════════════════════════════════════ */
export async function sendNewTicketAdminEmail(data: {
  ticketId: string; company: string; email: string
  subject: string; body: string; priority: string
}) {
  await sendAdminEmail(`🎫 Nuevo ticket [${data.priority.toUpperCase()}]: ${data.subject}`,
    wrap(
      `<h1 style="${H1}">🎫 Nuevo Ticket de Soporte</h1>
       <p style="${SUB}">${data.company}</p>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', data.company, '#C084FC')}
         ${row('Email', data.email)}
         ${row('Asunto', data.subject)}
         ${row('Prioridad', data.priority.toUpperCase(), data.priority === 'urgent' ? '#f87171' : data.priority === 'high' ? '#fbbf24' : '#A09CB0')}
       </table>
       <div style="${BOX_P}">
         <p style="color:#A09CB0;font-size:12px;margin:0 0 8px;text-transform:uppercase;font-weight:600">Mensaje del cliente:</p>
         <p style="color:#F1F0F5;margin:0;font-size:14px;line-height:1.6">${data.body}</p>
       </div>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/soporte/${data.ticketId}" style="${BTN}">Responder Ticket</a></p>`
    )
  )
}

/* ══════════════════════════════════════════════════════════════
   9. TICKET RESPONDIDO → CLIENTE
   ══════════════════════════════════════════════════════════════ */
export async function sendTicketReplyEmail(data: {
  email: string; name: string; ticketId: string; subject: string
  agentName: string; replyBody: string; newStatus?: string
}) {
  await sendEmail({
    to: data.email,
    subject: `💬 Respuesta a tu ticket: "${data.subject}"`,
    html: wrap(
      `<h1 style="${H1}">Respuesta a tu ticket 💬</h1>
       <p style="${SUB}">${data.subject}</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">El equipo de soporte de AIgenciaLab ha respondido tu ticket.</p>
       <div style="${BOX_P}">
         <p style="color:#A09CB0;font-size:11px;margin:0 0 8px;text-transform:uppercase;font-weight:600">Respuesta de ${data.agentName}:</p>
         <p style="color:#F1F0F5;margin:0;font-size:14px;line-height:1.65">${data.replyBody}</p>
       </div>
       ${data.newStatus ? `<p style="${MUTED}">Estado actualizado: <strong style="color:#34d399">${data.newStatus}</strong></p>` : ''}
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard/tickets/${data.ticketId}" style="${BTN}">Ver hilo completo</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   10. CAMBIO DE ESTADO DE TICKET → CLIENTE
   ══════════════════════════════════════════════════════════════ */
export async function sendTicketStatusEmail(data: {
  email: string; name: string; ticketId: string; subject: string; newStatus: string
}) {
  const statusLabel: Record<string, string> = {
    in_progress: '🔵 En progreso',
    resolved: '✅ Resuelto',
    closed: '🔒 Cerrado',
  }
  await sendEmail({
    to: data.email,
    subject: `📋 Estado actualizado: "${data.subject}" → ${statusLabel[data.newStatus] ?? data.newStatus}`,
    html: wrap(
      `<h1 style="${H1}">Estado de ticket actualizado 📋</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">El estado de tu ticket <strong>"${data.subject}"</strong> ha sido actualizado.</p>
       <div style="${BOX_G}">
         <p style="text-align:center;font-size:20px;margin:0;font-weight:800;color:#34d399">${statusLabel[data.newStatus] ?? data.newStatus}</p>
       </div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard/tickets/${data.ticketId}" style="${BTN}">Ver mi ticket</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   11. FORMULARIO DE CONTACTO RECIBIDO
   ══════════════════════════════════════════════════════════════ */
export async function sendContactFormEmail(data: {
  name: string; email: string; company?: string; message: string; phone?: string
}) {
  // Confirmation to sender
  await sendEmail({
    to: data.email,
    subject: `Hemos recibido tu mensaje — AIgenciaLab`,
    bccAdmin: false,
    html: wrap(
      `<h1 style="${H1}">¡Recibimos tu mensaje! ✉️</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Gracias por contactarnos. Nuestro equipo revisará tu mensaje y te responderá en a la brevedad (normalmente dentro de las 24 horas hábiles).</p>
       <div style="${BOX_P}">
         <p style="color:#A09CB0;font-size:12px;margin:0 0 8px;font-weight:600">Tu mensaje:</p>
         <p style="color:#F1F0F5;font-size:13px;margin:0;line-height:1.6">${data.message.slice(0, 300)}${data.message.length > 300 ? '...' : ''}</p>
       </div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}" style="${BTN}">Volver al sitio</a></p>`
    ),
  })
  // Admin alert
  await sendAdminEmail(`📩 Nuevo contacto: ${data.name}${data.company ? ` — ${data.company}` : ''}`,
    wrap(`<h1 style="${H1}">Nuevo Formulario de Contacto</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Nombre', data.name, '#C084FC')}
         ${row('Email', data.email)}
         ${data.company ? row('Empresa', data.company) : ''}
         ${data.phone ? row('Teléfono', data.phone) : ''}
       </table>
       <div style="${BOX_P}">
         <p style="color:#A09CB0;font-size:12px;margin:0 0 8px;font-weight:600">Mensaje:</p>
         <p style="color:#F1F0F5;font-size:13px;margin:0;line-height:1.6">${data.message}</p>
       </div>
       <p style="text-align:center"><a href="mailto:${data.email}?subject=Re: Tu consulta a AIgenciaLab&body=Hola ${encodeURIComponent(data.name)}," style="${BTN}">Responder</a></p>`
    )
  )
}

/* ══════════════════════════════════════════════════════════════
   12. NUEVO PARTNER → ADMIN
   ══════════════════════════════════════════════════════════════ */
export async function sendNewPartnerEmail(data: {
  name: string; company: string; email: string; phone?: string
  partnerType: string; message?: string
}) {
  await sendAdminEmail(`🤝 Nuevo Partner: ${data.company} (${data.partnerType})`,
    wrap(
      `<h1 style="${H1}">🤝 Nuevo Registro de Partner</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', data.company, '#C084FC')}
         ${row('Contacto', data.name)}
         ${row('Email', data.email)}
         ${data.phone ? row('Teléfono', data.phone) : ''}
         ${row('Tipo de partner', data.partnerType, '#34d399')}
       </table>
       ${data.message ? `<div style="${BOX_P}"><p style="color:#F1F0F5;font-size:13px;margin:0;line-height:1.6">${data.message}</p></div>` : ''}
       <p style="text-align:center;margin:24px 0"><a href="mailto:${data.email}" style="${BTN}">Contactar partner</a></p>`
    )
  )
  // Confirmation to partner
  await sendEmail({
    to: data.email,
    subject: `Bienvenido al Programa de Partners — AIgenciaLab`,
    bccAdmin: false,
    html: wrap(
      `<h1 style="${H1}">¡Gracias por unirte! 🤝</h1>
       <p style="${SUB}">Programa de Partners AIgenciaLab</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Recibimos tu solicitud de <strong style="color:#C084FC">${data.company}</strong> para unirte como partner de tipo <strong>${data.partnerType}</strong>.</p>
       <p style="${MUTED}">Nuestro equipo comercial te contactará en las próximas 24-48 horas hábiles para coordinar los detalles.</p>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/socios" style="${BTN}">Ver beneficios del programa</a></p>`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   13. ADMIN NUEVO CLIENTE (para admin dashboard)
   ══════════════════════════════════════════════════════════════ */
export async function sendAdminNewClientEmail(data: {
  company: string; email: string; plan: string; clientId: string
}) {
  await sendAdminEmail(`🎉 Nuevo cliente: ${data.company} (${data.plan})`,
    wrap(
      `<h1 style="${H1}">Nuevo Cliente Registrado 🎉</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', data.company, '#C084FC')}
         ${row('Email', data.email)}
         ${row('Plan', data.plan.toUpperCase(), '#34d399')}
       </table>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes/${data.clientId}" style="${BTN}">Ver en Panel Admin</a></p>`
    )
  )
}

/* ══════════════════════════════════════════════════════════════
   14. ADMIN PAGO FALLIDO
   ══════════════════════════════════════════════════════════════ */
export async function sendAdminPaymentFailedEmail(data: {
  company: string; email: string; plan: string; clientId: string
}) {
  await sendAdminEmail(`🚨 URGENTE — Pago fallido: ${data.company}`,
    wrap(
      `<h1 style="${H1}" style="color:#f87171">⚠️ Pago Fallido — Acción Requerida</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', data.company, '#f87171')}
         ${row('Email', data.email)}
         ${row('Plan', data.plan.toUpperCase())}
       </table>
       <div style="${BOX_R}">
         <p style="color:#f87171;text-align:center;font-weight:700;margin:0">Contactar al cliente para regularizar el pago</p>
       </div>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes/${data.clientId}" style="${BTN}">Gestionar cliente</a></p>`
    )
  )
}


/* ══════════════════════════════════════════════════════════════
   18. WELCOME (IMPLEMENTATION PAYMENT) — v2 checkout flow
   Sent when impl_payment is approved in /api/v2/webhooks/mp
   Different from sendWelcomeEmail (which is for form registration)
   ══════════════════════════════════════════════════════════════ */
export async function sendImplWelcomeEmail(data: {
  email: string; name?: string; company?: string; planName: string; userId: string
}) {
  const name    = data.name    ?? 'Cliente'
  const company = data.company ?? ''
  await sendEmail({
    to: data.email,
    subject: `¡Bienvenido a AIgenciaLab! Tu Plan ${data.planName} está activo 🎉`,
    html: wrap(
      `<h1 style="${H1}">¡Bienvenido, ${name}! 🎉</h1>
       <p style="${SUB}">Plan ${data.planName.toUpperCase()} activado · ${company}</p>`,
      `<p style="${MUTED}">Recibimos tu pago de implementación con éxito. Tu agente IA está en camino.</p>
       <div style="${BOX_G}">
         <p style="color:#34d399;font-weight:700;margin:0 0 12px">📅 Próximas 48 horas</p>
         <p style="color:#A09CB0;font-size:13px;margin:0">Tu ingeniero asignado te contactará por WhatsApp para coordinar el onboarding.</p>
       </div>
       <div style="${BOX_P}">
         <p style="color:#C084FC;font-weight:700;margin:0 0 12px">🤖 Días 1–14: Implementación</p>
         <p style="color:#A09CB0;font-size:13px;margin:0">Entrenamiento y configuración de tu agente IA personalizado.</p>
       </div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard" style="${BTN}">Ir a mi Dashboard →</a></p>`,
      `Este email confirma la activación de tu plan ${data.planName}. Guárdalo como comprobante.`
    ),
  })
}


/* ══════════════════════════════════════════════════════════════
   19. ONBOARDING FOLLOW-UP — Sequence: día 3, 7, 14
   Triggered by CRON /api/cron/onboarding-followup daily
   ══════════════════════════════════════════════════════════════ */
export async function sendOnboardingFollowupEmail(data: {
  email: string; name: string; company: string; planName: string
  day: 3 | 7 | 14
}) {
  type DayKey = 3 | 7 | 14
  const configs: Record<DayKey, { subject: string; headline: string; body: string; cta: string; ctaHref: string }> = {
    3: {
      subject:  `Día 3: ¿Cómo va tu implementación? — AIgenciaLab`,
      headline: `¿Cómo va la implementación? 🔧`,
      body: `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
             <p style="${MUTED}">Llevamos 3 días juntos y queremos saber cómo te ha ido el primer contacto con tu agente IA.</p>
             <div style="${BOX_P}">
               <p style="color:#C084FC;font-weight:700;margin:0 0 12px">✅ Esta semana deberías poder:</p>
               <ul style="color:#A09CB0;font-size:13px;margin:0;padding-left:20px;line-height:2">
                 <li>Instalar el widget en tu sitio web</li>
                 <li>Enviar tu primer mensaje de prueba al bot</li>
                 <li>Personalizar el nombre y color de tu asistente</li>
               </ul>
             </div>
             <p style="${MUTED}">Si tienes alguna duda, responde este email y te ayudamos en menos de 24 horas.</p>`,
      cta:     '🚀 Configurar mi bot',
      ctaHref: `${SITE_URL}/dashboard/bot`,
    },
    7: {
      subject:  `Día 7: ¡1 semana de IA! Tips para sacarle el máximo — AIgenciaLab`,
      headline: `¡1 semana con tu agente IA! 🎯`,
      body: `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
             <p style="${MUTED}">¡Llevas una semana! Este es el momento perfecto para revisar tus primeras conversaciones y ajustar el bot.</p>
             <div style="${BOX_G}">
               <p style="color:#34d399;font-weight:700;margin:0 0 12px">📊 3 cosas que deberías revisar hoy:</p>
               <ol style="color:#A09CB0;font-size:13px;margin:0;padding-left:20px;line-height:2.2">
                 <li><strong style="color:#fff">Conversaciones:</strong> ¿Responde bien a las preguntas reales?</li>
                 <li><strong style="color:#fff">Leads:</strong> ¿Estás capturando contactos automáticamente?</li>
                 <li><strong style="color:#fff">Prompt:</strong> ¿El tono del bot refleja tu marca?</li>
               </ol>
             </div>`,
      cta:     '📊 Ver mis conversaciones',
      ctaHref: `${SITE_URL}/dashboard/conversations`,
    },
    14: {
      subject:  `Día 14: Revisión de tu implementación + ¿qué sigue? — AIgenciaLab`,
      headline: `Revisión de 14 días 🏁`,
      body: `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
             <p style="${MUTED}">¡Dos semanas! Es el momento de la revisión oficial de tu implementación.</p>
             <div style="${BOX_P}">
               <p style="color:#C084FC;font-weight:700;margin:0 0 12px">🎯 Checklist de implementación:</p>
               <ul style="color:#A09CB0;font-size:13px;margin:0;padding-left:20px;line-height:2.2">
                 <li>Widget instalado ✅</li>
                 <li>Bot configurado con datos de tu empresa</li>
                 <li>Primeros leads capturados</li>
                 <li>Conversaciones revisadas y ajustadas</li>
               </ul>
             </div>
             <div style="${BOX_G}">
               <p style="color:#34d399;font-weight:700;margin:0 0 8px">💰 Tu suscripción mensual inicia el día 61</p>
               <p style="color:#A09CB0;font-size:13px;margin:0">Hasta entonces tienes acceso completo sin costo adicional.</p>
             </div>`,
      cta:     '📞 Hablar con soporte',
      ctaHref: `${SITE_URL}/dashboard/support`,
    },
  }

  const cfg = configs[data.day]
  await sendEmail({
    to:      data.email,
    subject: cfg.subject,
    html: wrap(
      `<h1 style="${H1}">${cfg.headline}</h1>
       <p style="${SUB}">Día ${data.day} de implementación · Plan ${data.planName} · ${data.company}</p>`,
      `${cfg.body}
       <p style="text-align:center;margin:32px 0"><a href="${cfg.ctaHref}" style="${BTN}">${cfg.cta}</a></p>`,
      `Recibes este email porque eres cliente de AIgenciaLab con Plan ${data.planName}.`
    ),
  })
}
/* ══════════════════════════════════════════════════════════════
   16. CUOTA AL 80% — CRON activated

   ══════════════════════════════════════════════════════════════ */
export async function sendQuotaWarningEmail(data: {
  email: string; name: string; company: string; plan: string
  used: number; total: number; percentUsed: number; overageCostCLP: number | null
}) {
  const overageNote = data.overageCostCLP
    ? `Cada conversación adicional tiene un costo de <strong style="color:#fbbf24">$${data.overageCostCLP} CLP</strong>.`
    : 'Contacta a soporte para gestionar tu cuota.'

  await sendEmail({
    to: data.email,
    subject: `⚠️ Has usado el ${data.percentUsed}% de tus conversaciones — AIgenciaLab`,
    html: wrap(
      `<h1 style="${H1}">Alerta de cuota ⚠️</h1>
       <p style="${SUB}">${data.company} · Plan ${data.plan.toUpperCase()}</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">${data.name}</strong>,</p>
       <p style="${MUTED}">Has utilizado <strong style="color:#fbbf24">${data.used.toLocaleString('es-CL')} de ${data.total.toLocaleString('es-CL')}</strong> conversaciones este mes (<strong>${data.percentUsed}%</strong>).</p>
       <div style="${BOX_Y}">
         <div style="background:#fbbf24/10;border-radius:8px;height:12px;width:100%;overflow:hidden;margin-bottom:12px">
           <div style="height:100%;width:${data.percentUsed}%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:8px"></div>
         </div>
         <p style="color:#A09CB0;font-size:13px;margin:0">${overageNote}</p>
       </div>
       <p style="${MUTED}">Considera hacer upgrade de tu plan para evitar interrupciones en la atención a tus clientes.</p>
       <div style="display:flex;gap:12px;justify-content:center;margin-top:28px">
         <a href="${SITE_URL}/dashboard/billing" style="${BTN}">⬆️ Mejorar Plan</a>
       </div>`,
      `Este aviso se envía automáticamente cuando superas el 80% de tu cuota mensual.`
    ),
  })
}

/* ══════════════════════════════════════════════════════════════
   17. REPORTE SEMANAL ADMIN — Enviado cada lunes
   ══════════════════════════════════════════════════════════════ */
export async function sendWeeklyAdminReport(data: {
  weekLabel: string
  newClients: number; activeClients: number; trialClients: number; suspendedClients: number
  mrrCLP: number; arrCLP: number
  newLeads: number; totalLeads: number
  openTickets: number; resolvedTickets: number
  botsActive: number; botsTotal: number
}) {
  const fmt = (n: number) => n.toLocaleString('es-CL')
  await sendAdminEmail(`📊 Reporte Semanal AIgenciaLab · ${data.weekLabel}`,
    wrap(
      `<h1 style="${H1}">📊 Reporte Semanal</h1>
       <p style="${SUB}">${data.weekLabel}</p>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('MRR actual (CLP)', `$${fmt(data.mrrCLP)}`, '#34d399')}
         ${row('ARR proyectado (CLP)', `$${fmt(data.arrCLP)}`, '#34d399')}
         ${row('Clientes activos', String(data.activeClients), '#C084FC')}
         ${row('Nuevos esta semana', String(data.newClients), data.newClients > 0 ? '#34d399' : '#F1F0F5')}
         ${row('En trial', String(data.trialClients))}
         ${row('Suspendidos', String(data.suspendedClients), data.suspendedClients > 0 ? '#f87171' : '#F1F0F5')}
       </table>
       <div style="${BOX_P}">
         <table style="width:100%;border-collapse:collapse">
           ${row('Leads nuevos', String(data.newLeads), '#C084FC')}
           ${row('Leads totales', String(data.totalLeads))}
           ${row('Tickets abiertos', String(data.openTickets), data.openTickets > 0 ? '#fbbf24' : '#F1F0F5')}
           ${row('Tickets resueltos', String(data.resolvedTickets), '#34d399')}
           ${row('Bots activos', `${data.botsActive}/${data.botsTotal}`)}
         </table>
       </div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/admin" style="${BTN}">Ver Panel Admin →</a></p>`
    )
  )
}


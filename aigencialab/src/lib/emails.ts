/**
 * src/lib/emails.ts — Transactional emails via Resend
 * All templates use AIgenciaLab dark/neon brand: #0A0A0F bg, #7C3AED accent
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'
const FROM      = process.env.RESEND_FROM_EMAIL   ?? 'noreply@aigencialab.cl'
const ADMIN_TO  = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aigencialab.cl'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require('resend') as typeof import('resend')
  return new Resend(key)
}

const BASE_STYLE = `font-family:Inter,'Plus Jakarta Sans',sans-serif;max-width:580px;margin:0 auto;background:#0A0A0F;color:#F1F0F5;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);`
const HEADER_STYLE = `background:linear-gradient(135deg,#1e40af,#7C3AED);padding:36px 32px;text-align:center;`
const BODY_STYLE   = `padding:36px 32px;`
const FOOTER_STYLE = `padding:20px 32px;text-align:center;background:#111118;color:#6B6480;font-size:12px;border-top:1px solid rgba(255,255,255,0.05);`
const BTN_STYLE    = `display:inline-block;background:#7C3AED;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;`
const MUTED        = `color:#A09CB0;line-height:1.7;`

function wrap(header: string, body: string, footer?: string) {
  return `<div style="${BASE_STYLE}">
    <div style="${HEADER_STYLE}">${header}</div>
    <div style="${BODY_STYLE}">${body}</div>
    <div style="${FOOTER_STYLE}">${footer ?? 'AIgenciaLab.cl · Plataforma de Agentes IA · ' + new Date().getFullYear() + '<br>Cumple Ley N°19.628 y N°21.663 Chile'}</div>
  </div>`
}

/* ── 1. Bienvenida al registrarse ──────────────────────────── */
export async function sendWelcomeEmail(data: {
  email: string; name: string; company: string; plan: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [data.email],
    subject: `🎉 Bienvenido a AIgenciaLab, ${data.company}`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:26px">¡Bienvenido, ${data.name}!</h1>
       <p style="color:rgba(255,255,255,0.75);margin:8px 0 0">Tu cuenta en AIgenciaLab está lista</p>`,
      `<p style="${MUTED}">Hola <strong>${data.name}</strong>,</p>
       <p style="${MUTED}">Tu empresa <strong>${data.company}</strong> ha sido registrada con el plan <strong>${data.plan.toUpperCase()}</strong>. Tienes 14 días de prueba gratuita.</p>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard" style="${BTN_STYLE}">🚀 Ir a mi Dashboard</a></p>
       <p style="${MUTED}">¿Dudas? Escríbenos a <a href="mailto:hola@aigencialab.cl" style="color:#C084FC">hola@aigencialab.cl</a></p>`
    )
  })
}

/* ── 2. Pago aprobado ──────────────────────────────────────── */
export async function sendPaymentApprovedEmail(data: {
  email: string; name: string; company: string; plan: string; nextBillingDate: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [data.email],
    subject: `✅ Pago confirmado — Plan ${data.plan} activado`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:26px">¡Pago confirmado! ✅</h1>
       <p style="color:rgba(255,255,255,0.75);margin:8px 0 0">${data.company}</p>`,
      `<p style="${MUTED}">Hola <strong>${data.name}</strong>,</p>
       <p style="${MUTED}">Tu pago para el plan <strong>${data.plan.toUpperCase()}</strong> fue procesado correctamente.</p>
       <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:20px;margin:24px 0">
         <div style="display:flex;justify-content:space-between;margin-bottom:8px">
           <span style="color:#A09CB0">Plan</span><span style="font-weight:700;color:#C084FC">${data.plan}</span>
         </div>
         <div style="display:flex;justify-content:space-between">
           <span style="color:#A09CB0">Próximo cobro</span><span style="font-weight:700;color:#F1F0F5">${data.nextBillingDate}</span>
         </div>
       </div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard" style="${BTN_STYLE}">Ver mi suscripción</a></p>
       <p style="${MUTED}">Tu agente IA estará listo para activarse pronto. Nuestro equipo te contactará en las próximas horas.</p>`
    )
  })
}

/* ── 3. Bot activado por admin ─────────────────────────────── */
export async function sendBotActivatedEmail(data: {
  email: string; name: string; company: string; botName: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [data.email],
    subject: `🤖 ¡Tu Agente IA "${data.botName}" ya está activo!`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:26px">¡Bot Activado! 🤖</h1>
       <p style="color:rgba(255,255,255,0.75);margin:8px 0 0">${data.company}</p>`,
      `<p style="${MUTED}">Hola <strong>${data.name}</strong>,</p>
       <p style="${MUTED}">Grandes noticias: tu Agente IA <strong>"${data.botName}"</strong> fue activado por nuestro equipo y ya está atendiendo visitas.</p>
       <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;margin:24px 0;text-align:center">
         <div style="font-size:36px">🟢</div>
         <div style="color:#34d399;font-weight:700;margin-top:8px">AGENTE ACTIVO Y OPERANDO</div>
       </div>
       <h3 style="color:#C084FC">Próximo paso: Instalación</h3>
       <p style="${MUTED}">Copia el snippet de instalación desde tu dashboard y pégalo en tu sitio web.</p>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/installation" style="${BTN_STYLE}">📋 Obtener snippet de instalación</a></p>`
    )
  })
}

/* ── 4. Trial vence en 3 días ──────────────────────────────── */
export async function sendTrialExpiringEmail(data: {
  email: string; name: string; company: string; expiresOn: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [data.email],
    subject: `⚠️ Tu prueba gratuita vence el ${data.expiresOn}`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:26px">Tu trial termina pronto ⏰</h1>`,
      `<p style="${MUTED}">Hola <strong>${data.name}</strong>,</p>
       <p style="${MUTED}">Tu prueba gratuita de AIgenciaLab vence el <strong>${data.expiresOn}</strong>. Para continuar usando tu agente IA sin interrupciones, activa tu suscripción ahora.</p>
       <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px;margin:24px 0">
         <p style="color:#fbbf24;font-weight:600;text-align:center;margin:0">🔒 Después del vencimiento tu bot se pausará automáticamente</p>
       </div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/precios" style="${BTN_STYLE}">Elegir mi plan</a></p>`,
      'AIgenciaLab.cl · Puedes cancelar en cualquier momento sin cargos adicionales'
    )
  })
}

/* ── 5. Pago fallido ───────────────────────────────────────── */
export async function sendPaymentFailedEmail(data: {
  email: string; name: string; company: string; plan: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [data.email],
    subject: `⚠️ Problema con tu pago — Acción requerida`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:26px">Problema con tu suscripción</h1>`,
      `<p style="${MUTED}">Hola <strong>${data.name}</strong>,</p>
       <p style="${MUTED}">No pudimos procesar el pago de tu plan <strong>${data.plan}</strong>. Para evitar interrupciones en tu servicio, actualiza tu método de pago.</p>
       <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px;margin:24px 0">
         <p style="color:#f87171;font-weight:600;text-align:center;margin:0">⛔ Tu agente puede pausarse en las próximas 24 horas</p>
       </div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN_STYLE}">Actualizar método de pago</a></p>`
    )
  })
}

/* ── 6. Notificación admin: nuevo cliente ──────────────────── */
export async function sendAdminNewClientEmail(data: {
  company: string; email: string; plan: string; clientId: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [ADMIN_TO],
    subject: `🎉 Nuevo cliente: ${data.company} (${data.plan})`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:22px">🎉 Nuevo Cliente Registrado</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         <tr><td style="padding:8px 0;color:#A09CB0;width:40%">Empresa</td><td style="color:#F1F0F5;font-weight:600">${data.company}</td></tr>
         <tr><td style="padding:8px 0;color:#A09CB0">Email</td><td style="color:#F1F0F5">${data.email}</td></tr>
         <tr><td style="padding:8px 0;color:#A09CB0">Plan</td><td style="color:#C084FC;font-weight:700">${data.plan}</td></tr>
       </table>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes/${data.clientId}" style="${BTN_STYLE}">Ver en Panel Admin</a></p>`
    )
  })
}

/* ── 7. Notificación admin: pago fallido ───────────────────── */
export async function sendAdminPaymentFailedEmail(data: {
  company: string; email: string; plan: string; clientId: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [ADMIN_TO],
    subject: `🚨 URGENTE — Pago fallido: ${data.company}`,
    html: wrap(
      `<h1 style="margin:0;color:#f87171;font-size:22px">⚠️ Pago Fallido — Acción Requerida</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         <tr><td style="padding:8px 0;color:#A09CB0;width:40%">Empresa</td><td style="color:#F1F0F5;font-weight:700">${data.company}</td></tr>
         <tr><td style="padding:8px 0;color:#A09CB0">Email</td><td style="color:#F1F0F5">${data.email}</td></tr>
         <tr><td style="padding:8px 0;color:#A09CB0">Plan</td><td style="color:#f87171;font-weight:700">${data.plan}</td></tr>
       </table>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes/${data.clientId}" style="${BTN_STYLE}">Gestionar cliente</a></p>`
    )
  })
}

/* ── 8. Bot desactivado ────────────────────────────────────── */
export async function sendBotDeactivatedEmail(data: {
  email: string; name: string; company: string; reason?: string
}) {
  const r = getResend(); if (!r) return
  await r.emails.send({
    from: FROM, to: [data.email],
    subject: `⏸ Tu agente IA ha sido pausado`,
    html: wrap(
      `<h1 style="margin:0;color:#fff;font-size:26px">Agente pausado ⏸</h1>`,
      `<p style="${MUTED}">Hola <strong>${data.name}</strong>,</p>
       <p style="${MUTED}">Tu agente IA de <strong>${data.company}</strong> ha sido pausado temporalmente.${data.reason ? ` Motivo: ${data.reason}` : ''}</p>
       <p style="${MUTED}">Para reactivarlo, contacta a nuestro equipo o accede a tu panel.</p>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard" style="${BTN_STYLE}">Ir a mi dashboard</a></p>`
    )
  })
}

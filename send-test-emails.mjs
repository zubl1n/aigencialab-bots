/**
 * send-test-emails.mjs
 * Sends all 18 email templates to admin@aigencialab.cl using Resend directly.
 * Run: node send-test-emails.mjs
 */
import { Resend } from 'resend';

const API_KEY      = 're_DJk8KEDA_13j4ioC6F2wDrgBsCCJT4GUz';
const FROM         = 'noreply@aigencialab.cl';
const ADMIN        = 'admin@aigencialab.cl';
const SITE_URL     = 'https://aigencialab.cl';

const resend = new Resend(API_KEY);

// ── Shared styles ─────────────────────────────────────────────────────────────
const BASE  = `font-family:Inter,'Plus Jakarta Sans',sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#F1F0F5;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);`;
const HDR   = `background:linear-gradient(135deg,#1e3a8a,#7C3AED);padding:40px 36px;text-align:center;`;
const BDY   = `padding:36px 36px 28px;`;
const FTR   = `padding:20px 36px;text-align:center;background:#0d0d14;color:#6B6480;font-size:11px;border-top:1px solid rgba(255,255,255,0.05);line-height:1.8;`;
const BTN   = `display:inline-block;background:#7C3AED;color:#fff!important;padding:15px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:-0.3px;`;
const MUTED = `color:#A09CB0;line-height:1.75;font-size:14px;`;
const H1    = `margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-1px;line-height:1.2;`;
const SUB   = `color:rgba(255,255,255,0.7);margin:10px 0 0;font-size:14px;`;
const BOX_G = `background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:22px;margin:24px 0;`;
const BOX_R = `background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:22px;margin:24px 0;`;
const BOX_P = `background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:22px;margin:24px 0;`;
const BOX_Y = `background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:22px;margin:24px 0;`;

function wrap(header, body) {
  return `<div style="${BASE}">
    <div style="${HDR}">${header}</div>
    <div style="${BDY}">${body}
      <p style="color:#A09CB0;font-size:12px">¿Tienes dudas? <a href="mailto:hola@aigencialab.cl" style="color:#C084FC">hola@aigencialab.cl</a></p>
    </div>
    <div style="${FTR}">AIgenciaLab.cl · Plataforma de Agentes IA · ${new Date().getFullYear()}<br>
    <a href="${SITE_URL}/privacidad" style="color:#6B6480">Política de Privacidad</a></div>
  </div>`;
}

function row(label, value, color = '#F1F0F5') {
  return `<tr><td style="padding:8px 0;color:#A09CB0;width:42%;font-size:13px;">${label}</td><td style="color:${color};font-weight:600;font-size:13px;">${value}</td></tr>`;
}

// ── Templates ─────────────────────────────────────────────────────────────────
const EMAILS = [
  {
    id: 1,
    subject: '🎉 [TEST 1/18] Bienvenido/a a AIgenciaLab, AIgenciaLab (TEST) — Registro',
    html: wrap(
      `<h1 style="${H1}">¡Bienvenido/a, Admin Test! 🎉</h1><p style="${SUB}">Tu cuenta está lista</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">Admin Test</strong>,</p>
       <p style="${MUTED}">Tu empresa <strong style="color:#C084FC">AIgenciaLab (TEST)</strong> ha sido registrada con el plan <strong style="color:#34d399">PRO</strong>. Tienes <strong>14 días de prueba gratuita</strong>.</p>
       <div style="${BOX_G}"><table style="width:100%;border-collapse:collapse">
         ${row('Plan activo', 'PRO', '#34d399')}
         ${row('Trial', '14 días gratuitos')}
       </table></div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard" style="${BTN}">🚀 Ir a mi Dashboard</a></p>`
    ),
  },
  {
    id: 2,
    subject: '✅ [TEST 2/18] Pago confirmado — Plan Pro activado',
    html: wrap(
      `<h1 style="${H1}">¡Pago confirmado! ✅</h1><p style="${SUB}">AIgenciaLab (TEST)</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">Admin Test</strong>,</p>
       <p style="${MUTED}">Tu pago fue procesado correctamente. Tu plan <strong style="color:#C084FC">PRO</strong> está activo.</p>
       <div style="${BOX_G}"><table style="width:100%;border-collapse:collapse">
         ${row('Plan', 'PRO', '#34d399')}
         ${row('Monto', '$120.000 CLP')}
         ${row('Próximo cobro', '01/06/2026')}
         ${row('Estado', '🟢 Activo')}
       </table></div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">Ver mi suscripción</a></p>`
    ),
  },
  {
    id: 3,
    subject: '⚠️ [TEST 3/18] Problema con tu pago — Acción requerida urgente',
    html: wrap(
      `<h1 style="${H1}">Problema con tu pago ⚠️</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">Admin Test</strong>,</p>
       <p style="${MUTED}">No pudimos procesar el pago de tu plan <strong style="color:#C084FC">Pro</strong>.</p>
       <div style="${BOX_R}"><p style="color:#f87171;font-weight:700;text-align:center;margin:0">⛔ Tu agente puede pausarse en las próximas 24 horas</p></div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">Actualizar método de pago</a></p>`
    ),
  },
  {
    id: 4,
    subject: '🤖 [TEST 4/18] ¡Tu Agente IA "Asistente IA Demo" ya está activo!',
    html: wrap(
      `<h1 style="${H1}">¡Bot Activado! 🤖</h1><p style="${SUB}">AIgenciaLab (TEST) · Listo para operar</p>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">Admin Test</strong>,</p>
       <p style="${MUTED}">Tu Agente IA <strong style="color:#C084FC">"Asistente IA Demo"</strong> fue activado y ya está atendiendo visitas en tiempo real.</p>
       <div style="${BOX_G}"><div style="text-align:center;font-size:40px;margin-bottom:10px">🟢</div>
         <p style="color:#34d399;font-weight:800;text-align:center;margin:0;font-size:16px">AGENTE ACTIVO Y OPERANDO</p></div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard/installation" style="${BTN}">Obtener snippet de instalación</a></p>`
    ),
  },
  {
    id: 5,
    subject: '⏸ [TEST 5/18] Tu agente IA ha sido pausado',
    html: wrap(
      `<h1 style="${H1}">Agente pausado ⏸</h1>`,
      `<p style="${MUTED}">Hola <strong style="color:#fff">Admin Test</strong>,</p>
       <p style="${MUTED}">Tu agente IA de <strong style="color:#C084FC">AIgenciaLab (TEST)</strong> ha sido pausado temporalmente.<br><strong>Motivo:</strong> Pago pendiente (TEST)</p>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">Verificar suscripción</a></p>`
    ),
  },
  {
    id: 6,
    subject: '⏰ [TEST 6/18] Tu prueba gratuita vence en 3 días — AIgenciaLab',
    html: wrap(
      `<h1 style="${H1}">Tu prueba vence pronto ⏰</h1><p style="${SUB}">AIgenciaLab (TEST) · Plan PRO</p>`,
      `<p style="${MUTED}">Tu prueba vence el <strong style="color:#fbbf24">25/04/2026</strong> (3 días).</p>
       <div style="${BOX_Y}"><p style="color:#fbbf24;text-align:center;font-weight:700;margin:0 0 8px">¿Qué pasa si no me suscribo?</p>
         <p style="color:#A09CB0;font-size:13px;text-align:center;margin:0">Tu bot quedará en pausa y no podrás recibir nuevos leads.</p></div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/billing" style="${BTN}">✅ Activar Plan Ahora</a></p>`
    ),
  },
  {
    id: 7,
    subject: '❌ [TEST 7/18] Suscripción cancelada — Plan Pro',
    html: wrap(
      `<h1 style="${H1}">Suscripción cancelada</h1>`,
      `<p style="${MUTED}">Tu suscripción al plan <strong style="color:#C084FC">Pro</strong> ha sido cancelada. Tu acceso continúa hasta el <strong>30/04/2026</strong>.</p>
       <div style="${BOX_Y}"><table style="width:100%;border-collapse:collapse">
         ${row('Empresa', 'AIgenciaLab (TEST)')}
         ${row('Acceso hasta', '30/04/2026', '#fbbf24')}
       </table></div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/precios" style="${BTN}">Reactivar suscripción</a></p>`
    ),
  },
  {
    id: 8,
    subject: '🎫 [TEST 8/18] Nuevo ticket [HIGH]: Problema con el bot — TEST',
    html: wrap(
      `<h1 style="${H1}">🎫 Nuevo Ticket de Soporte</h1><p style="${SUB}">AIgenciaLab (TEST)</p>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', 'AIgenciaLab (TEST)', '#C084FC')}
         ${row('Email', ADMIN)}
         ${row('Asunto', 'Problema con el bot — TEST')}
         ${row('Prioridad', 'HIGH', '#fbbf24')}
       </table>
       <div style="${BOX_P}"><p style="color:#A09CB0;font-size:12px;margin:0 0 8px;text-transform:uppercase;font-weight:600">Mensaje del cliente:</p>
         <p style="color:#F1F0F5;margin:0;font-size:14px;line-height:1.6">El bot no responde correctamente. (TEST MESSAGE)</p></div>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/soporte/ticket-test-000" style="${BTN}">Responder Ticket</a></p>`
    ),
  },
  {
    id: 9,
    subject: '💬 [TEST 9/18] Respuesta a tu ticket: "Problema con el bot — TEST"',
    html: wrap(
      `<h1 style="${H1}">Respuesta a tu ticket 💬</h1><p style="${SUB}">Problema con el bot — TEST</p>`,
      `<p style="${MUTED}">El equipo de soporte ha respondido tu ticket.</p>
       <div style="${BOX_P}"><p style="color:#A09CB0;font-size:11px;margin:0 0 8px;text-transform:uppercase;font-weight:600">Respuesta de AIgenciaLab Soporte:</p>
         <p style="color:#F1F0F5;margin:0;font-size:14px;line-height:1.65">Hemos revisado tu caso y está solucionado. (TEST)</p></div>
       <p style="color:#34d399">Estado actualizado: <strong>✅ Resuelto</strong></p>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard/tickets/ticket-test-000" style="${BTN}">Ver hilo completo</a></p>`
    ),
  },
  {
    id: 10,
    subject: '📋 [TEST 10/18] Estado actualizado: "Problema con el bot" → ✅ Resuelto',
    html: wrap(
      `<h1 style="${H1}">Estado de ticket actualizado 📋</h1>`,
      `<p style="${MUTED}">El estado de tu ticket <strong>"Problema con el bot — TEST"</strong> ha sido actualizado.</p>
       <div style="${BOX_G}"><p style="text-align:center;font-size:20px;margin:0;font-weight:800;color:#34d399">✅ Resuelto</p></div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard/tickets/ticket-test-000" style="${BTN}">Ver mi ticket</a></p>`
    ),
  },
  {
    id: 11,
    subject: '📩 [TEST 11/18] Nuevo formulario de contacto — Admin Test — AIgenciaLab (TEST)',
    html: wrap(
      `<h1 style="${H1}">Nuevo Formulario de Contacto</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Nombre', 'Admin Test', '#C084FC')}
         ${row('Email', ADMIN)}
         ${row('Empresa', 'AIgenciaLab (TEST)')}
         ${row('Teléfono', '+56 9 1234 5678')}
       </table>
       <div style="${BOX_P}"><p style="color:#A09CB0;font-size:12px;margin:0 0 8px;font-weight:600">Mensaje:</p>
         <p style="color:#F1F0F5;font-size:13px;margin:0;line-height:1.6">Quiero saber más sobre el Plan Pro. (TEST)</p></div>
       <p style="text-align:center"><a href="mailto:${ADMIN}?subject=Re: Tu consulta a AIgenciaLab" style="${BTN}">Responder</a></p>`
    ),
  },
  {
    id: 12,
    subject: '🤝 [TEST 12/18] Nuevo Partner: Agencia Demo SpA (TEST) (agencia)',
    html: wrap(
      `<h1 style="${H1}">🤝 Nuevo Registro de Partner</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', 'Agencia Demo SpA (TEST)', '#C084FC')}
         ${row('Contacto', 'Admin Test')}
         ${row('Email', ADMIN)}
         ${row('Tipo de partner', 'Agencia', '#34d399')}
       </table>
       <div style="${BOX_P}"><p style="color:#F1F0F5;font-size:13px;margin:0;line-height:1.6">Nos interesa el programa. (TEST)</p></div>
       <p style="text-align:center;margin:24px 0"><a href="mailto:${ADMIN}" style="${BTN}">Contactar partner</a></p>`
    ),
  },
  {
    id: 13,
    subject: '🎉 [TEST 13/18] Nuevo cliente: AIgenciaLab (TEST) (Pro) — Admin',
    html: wrap(
      `<h1 style="${H1}">Nuevo Cliente Registrado 🎉</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', 'AIgenciaLab (TEST)', '#C084FC')}
         ${row('Email', ADMIN)}
         ${row('Plan', 'PRO', '#34d399')}
       </table>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes/test-client-id-000" style="${BTN}">Ver en Panel Admin</a></p>`
    ),
  },
  {
    id: 14,
    subject: '🚨 [TEST 14/18] URGENTE — Pago fallido: AIgenciaLab (TEST)',
    html: wrap(
      `<h1 style="${H1};color:#f87171">⚠️ Pago Fallido — Acción Requerida</h1>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('Empresa', 'AIgenciaLab (TEST)', '#f87171')}
         ${row('Email', ADMIN)}
         ${row('Plan', 'PRO')}
       </table>
       <div style="${BOX_R}"><p style="color:#f87171;text-align:center;font-weight:700;margin:0">Contactar al cliente para regularizar el pago</p></div>
       <p style="text-align:center;margin:24px 0"><a href="${SITE_URL}/admin/clientes/test-client-id-000" style="${BTN}">Gestionar cliente</a></p>`
    ),
  },
  {
    id: 15,
    subject: '🎉 [TEST 15/18] Bienvenido a AIgenciaLab. Plan Pro activado (checkout v2)',
    html: wrap(
      `<h1 style="${H1}">¡Bienvenido, Admin Test! 🎉</h1><p style="${SUB}">Plan PRO activado · AIgenciaLab (TEST)</p>`,
      `<p style="${MUTED}">Recibimos tu pago de implementación con éxito. Tu agente IA está en camino.</p>
       <div style="${BOX_G}"><p style="color:#34d399;font-weight:700;margin:0 0 12px">📅 Próximas 48 horas</p>
         <p style="color:#A09CB0;font-size:13px;margin:0">Tu ingeniero asignado te contactará por WhatsApp para coordinar el onboarding.</p></div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/dashboard" style="${BTN}">Ir a mi Dashboard →</a></p>`
    ),
  },
  {
    id: 16,
    subject: '🔧 [TEST 16/18] Día 3: ¿Cómo va tu implementación? — AIgenciaLab',
    html: wrap(
      `<h1 style="${H1}">¿Cómo va la implementación? 🔧</h1><p style="${SUB}">Día 3 · Plan PRO · AIgenciaLab (TEST)</p>`,
      `<p style="${MUTED}">Llevamos 3 días juntos y queremos saber cómo va tu primer contacto con el agente IA.</p>
       <div style="${BOX_P}"><p style="color:#C084FC;font-weight:700;margin:0 0 12px">✅ Esta semana deberías poder:</p>
         <ul style="color:#A09CB0;font-size:13px;margin:0;padding-left:20px;line-height:2">
           <li>Instalar el widget en tu sitio web</li>
           <li>Enviar tu primer mensaje de prueba</li>
           <li>Personalizar nombre y color del asistente</li>
         </ul></div>
       <p style="text-align:center;margin:32px 0"><a href="${SITE_URL}/dashboard/bot" style="${BTN}">🚀 Configurar mi bot</a></p>`
    ),
  },
  {
    id: 17,
    subject: '⚠️ [TEST 17/18] Has usado el 82% de tus conversaciones — AIgenciaLab',
    html: wrap(
      `<h1 style="${H1}">Alerta de cuota ⚠️</h1><p style="${SUB}">AIgenciaLab (TEST) · Plan PRO</p>`,
      `<p style="${MUTED}">Has utilizado <strong style="color:#fbbf24">1.640 de 2.000</strong> conversaciones este mes (<strong>82%</strong>).</p>
       <div style="${BOX_Y}"><div style="background:rgba(245,158,11,0.15);border-radius:8px;height:12px;width:100%;overflow:hidden;margin-bottom:12px">
           <div style="height:100%;width:82%;background:linear-gradient(90deg,#f59e0b,#fbbf24);border-radius:8px"></div></div>
         <p style="color:#A09CB0;font-size:13px;margin:0">Cada conversación adicional: <strong style="color:#fbbf24">$500 CLP</strong></p></div>
       <div style="display:flex;gap:12px;justify-content:center;margin-top:28px">
         <a href="${SITE_URL}/dashboard/billing" style="${BTN}">⬆️ Mejorar Plan</a></div>`
    ),
  },
  {
    id: 18,
    subject: '📊 [TEST 18/18] Reporte Semanal AIgenciaLab · 14 abr – 21 abr 2026 (TEST)',
    html: wrap(
      `<h1 style="${H1}">📊 Reporte Semanal</h1><p style="${SUB}">14 abr – 21 abr 2026 (TEST)</p>`,
      `<table style="width:100%;border-collapse:collapse">
         ${row('MRR actual (CLP)', '$1.080.000', '#34d399')}
         ${row('ARR proyectado (CLP)', '$12.960.000', '#34d399')}
         ${row('Clientes activos', '12', '#C084FC')}
         ${row('Nuevos esta semana', '3', '#34d399')}
         ${row('En trial', '4')}
         ${row('Suspendidos', '1', '#f87171')}
       </table>
       <div style="${BOX_P}"><table style="width:100%;border-collapse:collapse">
         ${row('Leads nuevos', '47', '#C084FC')}
         ${row('Leads totales', '312')}
         ${row('Tickets abiertos', '2', '#fbbf24')}
         ${row('Tickets resueltos', '8', '#34d399')}
         ${row('Bots activos', '11/12')}
       </table></div>
       <p style="text-align:center;margin:28px 0"><a href="${SITE_URL}/admin" style="${BTN}">Ver Panel Admin →</a></p>`
    ),
  },
];

// ── Send all ──────────────────────────────────────────────────────────────────
async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`\n📧 Enviando ${EMAILS.length} emails de prueba a ${ADMIN}\n`);
  const results = [];

  for (const email of EMAILS) {
    try {
      const { data, error } = await resend.emails.send({
        from:    FROM,
        to:      [ADMIN],
        subject: email.subject,
        html:    email.html,
      });

      if (error) {
        console.error(`❌ ${email.id}: ${email.subject.substring(0,60)}...`);
        console.error(`   → ${error.message}`);
        results.push({ id: email.id, status: 'error', error: error.message });
      } else {
        console.log(`✅ ${email.id}: Enviado → ID ${data?.id}`);
        results.push({ id: email.id, status: 'ok', resendId: data?.id });
      }
    } catch (err) {
      console.error(`❌ ${email.id}: Error inesperado: ${err.message}`);
      results.push({ id: email.id, status: 'error', error: err.message });
    }
    await delay(400); // Respect rate limits
  }

  const ok  = results.filter(r => r.status === 'ok').length;
  const err = results.filter(r => r.status === 'error').length;

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Total: ${EMAILS.length} | ✅ OK: ${ok} | ❌ Error: ${err}`);
  console.log(`  Destino: ${ADMIN}`);
  console.log(`═══════════════════════════════════════\n`);
}

main().catch(console.error);

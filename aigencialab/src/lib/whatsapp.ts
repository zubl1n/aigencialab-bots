/**
 * whatsapp.ts — Helper para WhatsApp Cloud API
 */

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<void> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type:    'individual',
      to:                to.replace(/\D/g, ''),
      type:              'text',
      text:              { preview_url: false, body: text },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`WA API error ${res.status}: ${JSON.stringify(err)}`)
  }
}

/** Enviar template de WhatsApp (requiere aprobación Meta) */
export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  components: unknown[] = []
): Promise<void> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: { name: templateName, language: { code: 'es' }, components },
    }),
  })
  if (!res.ok) throw new Error(`WA template error ${res.status}`)
}

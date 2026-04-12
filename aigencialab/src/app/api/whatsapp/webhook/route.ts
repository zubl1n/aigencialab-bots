/**
 * GET/POST /api/whatsapp/webhook
 * Meta WhatsApp Cloud API webhook handler
 * GET  → verificación del webhook (Meta llama una vez al configurar)
 * POST → recibe mensajes entrantes, responde con FAQ, guarda en Supabase
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import type { FAQ } from '@/lib/types'
import crypto from 'crypto'
import OpenAI from 'openai'

/* ── GET: Verificación del webhook ────────────────────────── */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
    console.log('[webhook] Verificación exitosa')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/* ── POST: Recepción de mensajes ─────────────────────────── */
export async function POST(req: NextRequest) {
  // Validar firma X-Hub-Signature-256
  const rawBody = await req.text()
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  if (!verifySignature(rawBody, signature)) {
    console.error('[webhook] Firma inválida')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const body = JSON.parse(rawBody)
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    if (changes?.field !== 'messages') {
      return NextResponse.json({ status: 'no-op' })
    }

    const waBusinessId = entry.id
    const value    = changes.value
    const messages = value?.messages

    if (!messages?.length) return NextResponse.json({ status: 'no-messages' })

    const supabase = createAdminSupabase()

    for (const msg of messages) {
      if (msg.type !== 'text') continue

      const from    = msg.from                   // número del cliente ej "56912345678"
      const msgText = msg.text?.body ?? ''
      const msgId   = msg.id

      // ── Buscar cliente por wa_phone_id ──
      const { data: client } = await supabase
        .from('clients')
        .select('id, company, faqs, config, wa_phone_id, wa_token_enc')
        .eq('wa_phone_id', waBusinessId)
        .single()

      // ── Buscar o crear conversación ──
      let convId: string
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id, status')
        .eq('contact_wa', from)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingConv) {
        convId = existingConv.id
      } else {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({ client_id: client?.id ?? null, channel: 'whatsapp', contact_wa: from, status: 'open' })
          .select('id').single()
        if (convError || !newConv) {
          console.error('[webhook] Failed to create conversation:', convError)
          return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
        }
        convId = newConv.id
      }

      // ── Guardar mensaje entrante ──
      await supabase.from('messages').insert({
        conversation_id: convId, direction: 'in', content: msgText, wa_message_id: msgId,
      })

      // ── Motor de respuesta OpenAI ──
      const reply = await generateReply(
        msgText,
        client?.faqs as FAQ[] ?? [],
        client?.config as { agent_name?: string; escalate_keyword?: string; welcome_msg?: string; system_prompt?: string } | null,
        convId,
        supabase,
        client?.id ?? ''
      )
      const needsHuman = reply.needsHuman

      // ── Actualizar estado conversación si necesita humano ──
      if (needsHuman) {
        await supabase.from('conversations').update({ status: 'needs_human' }).eq('id', convId)
        // Crear ticket automático
        await supabase.from('tickets').insert({
          client_id: client?.id ?? null,
          company:   client?.company ?? 'Desconocido',
          issue:     `WhatsApp: "${msgText.substring(0,100)}" — requiere atención humana`,
          priority:  'alto', channel: 'WhatsApp',
        })
      }

      // ── Enviar respuesta vía WhatsApp Cloud API ──
      if (client?.wa_phone_id && client?.wa_token_enc) {
        await sendWhatsAppMessage(client.wa_phone_id, client.wa_token_enc, from, reply.text)
          .catch(err => console.error('[webhook] WA send error:', err))

        // ── Guardar mensaje saliente ──
        await supabase.from('messages').insert({
          conversation_id: convId, direction: 'out', content: reply.text,
        })
      }

      // ── Audit log ──
      await supabase.from('audit_logs').insert({
        event: 'whatsapp_message', module: 'whatsapp',
        metadata: { from, conv_id: convId, needs_human: needsHuman, client_id: client?.id },
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('[webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/* ── Reply Engine ─────────────────────────────────────────── */
/* ── LLM Reply Engine con Function Calling ─────────────────── */
async function generateReply(
  text: string,
  faqs: FAQ[],
  config: { agent_name?: string; escalate_keyword?: string; welcome_msg?: string; system_prompt?: string } | null,
  convId: string,
  supabase: any,
  clientId: string
): Promise<{ text: string; needsHuman: boolean }> {
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const { data: rawMsgs } = await supabase.from('messages')
    .select('direction, content')
    .eq('conversation_id', convId)
    .order('timestamp', { ascending: false })
    .limit(10)
  
  const msgs = (rawMsgs ?? []).reverse()
  const agentName   = config?.agent_name ?? 'Nova'
  const sysPrompt   = config?.system_prompt ?? `Eres ${agentName}, asistente virtual de atención al cliente. Sé breve y amable.`
  
  const faqContext = faqs.length ? `BASE DE CONOCIMIENTOS (Usa esto para responder):\n${JSON.stringify(faqs)}` : ''
  const systemMessage = `${sysPrompt}\n\nSi el cliente exige hablar con un asesor, persona o humano, o si no sabes la respuesta tras buscar en la base de conocimientos, usa la herramienta escalate_to_human.\nSi el cliente demuestra clara intención de compra o pide cotizar, usa create_lead.\n\n${faqContext}`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemMessage }
  ]
  
  msgs.forEach(m => {
    messages.push({ role: m.direction === 'in' ? 'user' : 'assistant', content: m.content })
  })

  // Evitar duplicar el último si ya estaba (en Postgres ya se guardó recién, así que el último es el usuario)

  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "escalate_to_human",
        description: "Transfiere la conversación a un operador humano.",
        parameters: { type: "object", properties: { reason: { type: "string" } }, required: ["reason"] }
      }
    },
    {
      type: "function",
      function: {
        name: "create_lead",
        description: "Registra en CRM cuando un cliente está caliente para venta.",
        parameters: { type: "object", properties: { name: { type: "string" }, interest: { type: "string" } }, required: ["name", "interest"] }
      }
    }
  ]

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2
    })

    const responseMsg = completion.choices[0].message
    
    if (responseMsg.tool_calls) {
      for (const toolCall of responseMsg.tool_calls) {
        if (toolCall.function.name === 'escalate_to_human') {
          return { text: "Entendido, transferiré tu consulta a nuestro equipo humano. Pronto te responderán por este canal.", needsHuman: true }
        }
        if (toolCall.function.name === 'create_lead') {
          const args = JSON.parse(toolCall.function.arguments)
          await supabase.from('leads').insert({
            client_id: clientId,
            contact_name: args.name,
            tier: 'hot',
            source: 'whatsapp',
            score: 90
          })
          return { text: `He anotado tu interés, ${args.name}. Un ejecutivo te contactará en breve con la cotización comercial. ¡Gracias!`, needsHuman: true }
        }
      }
    }

    return { text: responseMsg.content || 'Sin respuesta', needsHuman: false }
  } catch (error) {
    console.error('[llm] Error openai:', error)
    // Fallback elegante
    return { text: `Registré tu mensaje: "${text.substring(0,20)}...". En breve te responderemos.`, needsHuman: false }
  }
}

/* ── Signature Verifier ───────────────────────────────────── */
function verifySignature(rawBody: string, signature: string): boolean {
  const appSecret = process.env.WA_APP_SECRET
  if (!appSecret) return true // En desarrollo sin secret configurado
  try {
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch { return false }
}

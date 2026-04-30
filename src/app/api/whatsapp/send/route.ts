/**
 * POST /api/whatsapp/send
 * Enviar mensaje WhatsApp desde el dashboard (respuesta manual)
 */
import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { createAdminSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  client_id:       z.string().uuid(),
  conversation_id: z.string().uuid(),
  to:              z.string().min(8),
  message:         z.string().min(1).max(4096),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

    const { client_id, conversation_id, to, message } = parsed.data
    const supabase = createAdminSupabase()

    // Obtener credenciales del cliente
    const { data: client, error } = await supabase
      .from('clients')
      .select('wa_phone_id, wa_token_enc')
      .eq('id', client_id)
      .single()

    if (error || !client?.wa_phone_id) {
      return NextResponse.json({ error: 'Cliente no encontrado o sin WhatsApp configurado' }, { status: 404 })
    }

    await sendWhatsAppMessage(client.wa_phone_id, client.wa_token_enc!, to, message)
    await supabase.from('messages').insert({ conversation_id, direction: 'out', content: message })
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation_id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[wa/send]', err)
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}

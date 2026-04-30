import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await request.formData()
  const clientId = formData.get('client_id') as string
  const botId    = formData.get('bot_id') as string

  if (!clientId) {
    return NextResponse.json({ error: 'Missing client_id' }, { status: 400 })
  }

  const botName    = formData.get('bot_name') as string
  const personality= formData.get('personality') as string
  const language   = formData.get('language') as string
  const widgetColor= formData.get('widget_color') as string
  const welcome    = formData.get('welcome_message') as string
  const prompt     = formData.get('system_prompt') as string
  const model      = formData.get('model') as string
  const temperature= parseFloat(formData.get('temperature') as string || '0.7')
  const escKws     = formData.get('escalation_keywords') as string
  const msgLimit   = parseInt(formData.get('msg_limit') as string || '1000', 10)

  const update: Record<string, unknown> = {
    bot_name:            botName,
    name:                botName,   // compat: schema uses both
    personality,
    language,
    widget_color:        widgetColor,
    welcome_message:     welcome,
    instructions:        prompt,    // original schema col
    escalation_threshold: escKws,
    msg_limit_monthly:   msgLimit,
    llm_config: {
      model,
      temperature,
      system_prompt: prompt,
      max_tokens: 2048,
    },
  }

  let err
  if (botId) {
    const res = await supabase.from('bot_configs').update(update).eq('id', botId)
    err = res.error
  } else {
    const res = await supabase.from('bot_configs').upsert({ client_id: clientId, ...update }, { onConflict: 'client_id' })
    err = res.error
  }

  if (err) {
    console.error('[update-bot]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    event: 'bot_config_updated',
    module: 'admin',
    metadata: { client_id: clientId, bot_id: botId, fields: Object.keys(update) },
  })

  const referer = request.headers.get('referer') ?? `/admin/clientes/${clientId}`
  return NextResponse.redirect(referer, { status: 303 })
}

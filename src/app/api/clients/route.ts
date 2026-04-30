/**
 * GET  /api/clients    → list clients
 * POST /api/clients    → create client (onboarding)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { sendOnboardingWelcomeEmail } from '@/lib/resend'
import { z } from 'zod'

export async function GET() {
  const supabase = createAdminSupabase()
  const { data, error } = await supabase
    .from('clients')
    .select('id,company,rubro,contact_name,whatsapp,email,plan,status,channels,created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

const schema = z.object({
  company:      z.string().min(1),
  rubro:        z.string().optional(),
  contact_name: z.string().optional(),
  whatsapp:     z.string().optional(),
  email:        z.string().email().optional().or(z.literal('')),
  url:          z.string().optional(),
  plan:         z.enum(['starter','advanced','enterprise']).default('starter'),
  faqs:         z.array(z.object({ q:z.string(),a:z.string() })).optional().default([]),
  products:     z.array(z.object({ name:z.string(),price:z.string().optional(),stock:z.string().optional() })).optional().default([]),
  channels:     z.object({ whatsapp:z.boolean(),web:z.boolean(),email:z.boolean() }).optional(),
  wa_phone_id:  z.string().optional().nullable(),
  wa_token_enc: z.string().optional().nullable(),
  config:       z.record(z.string(), z.unknown()).optional().default({}),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })

    const d = parsed.data
    const supabase = createAdminSupabase()

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        company:     d.company,
        rubro:       d.rubro,
        contact_name:d.contact_name,
        whatsapp:    d.whatsapp,
        email:       d.email || null,
        url:         d.url,
        plan:        d.plan,
        status:      'onboarding',
        faqs:        d.faqs,
        products:    d.products,
        channels:    d.channels ?? { whatsapp:false,web:false,email:false },
        wa_phone_id: d.wa_phone_id ?? null,
        wa_token_enc:d.wa_token_enc ?? null,
        config:      d.config,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Audit log
    await supabase.from('audit_logs').insert({
      event:'client_created', module:'onboarding', metadata:{ client_id:client?.id, company:d.company, plan:d.plan }
    })

    // Email de bienvenida (no bloqueante)
    if (d.email) {
      sendOnboardingWelcomeEmail({
        contactName:  d.contact_name ?? d.company,
        company:      d.company,
        email:        d.email,
        plan:         d.plan,
        dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'}/dashboard`,
      }).catch(err => console.error('[clients] Email error:', err))
    }

    return NextResponse.json({ data: client }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

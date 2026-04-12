/**
 * POST /api/audit
 * Realiza auditoría real server-side (PageSpeed + HTML fetch, sin CORS)
 * Guarda lead en Supabase y envía email de notificación
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchPageSpeed, fetchSiteHTML, buildAnalysis } from '@/lib/audit-engine'
import { createAdminSupabase } from '@/lib/supabase/server'
import { sendLeadNotificationEmail } from '@/lib/resend'

const schema = z.object({
  url:     z.string().max(500).optional().default(''),
  rubro:   z.string().min(1),
  name:    z.string().min(2).max(100),
  company: z.string().max(200).optional().default(''),
  whatsapp:z.string().min(8).max(20),
  email:   z.string().email().optional().or(z.literal('')).default(''),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { url, rubro, name, company, whatsapp, email } = parsed.data

    // Normalizar URL
    let cleanUrl = url.trim()
    if (cleanUrl && !cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl

    // ── Análisis en paralelo (server-side, sin problemas de CORS) ──
    const [psi, seo] = await Promise.all([
      cleanUrl ? fetchPageSpeed(cleanUrl) : Promise.resolve(null),
      cleanUrl ? fetchSiteHTML(cleanUrl)  : Promise.resolve(null),
    ])

    const analysis = buildAnalysis(cleanUrl, rubro, psi, seo)

    // Determinar tier del pipeline
    const score = analysis.score
    const tier  = score >= 70 ? 'hot' : score >= 45 ? 'warm' : 'cold'
    const prob  = Math.min(90, Math.round(score * 0.85))

    // ── Guardar lead en Supabase ──
    const supabase = createAdminSupabase()
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({
        company:      company || (cleanUrl ? new URL(cleanUrl.startsWith('http') ? cleanUrl : 'https://' + cleanUrl).hostname : name),
        contact_name: name,
        url:          cleanUrl || null,
        rubro,
        whatsapp:     whatsapp.startsWith('+56') ? whatsapp : `+56${whatsapp.replace(/\D/g,'')}`,
        email:        email || null,
        score,
        tier,
        prob,
        psi_data:     psi  as unknown as Record<string, unknown> | null,
        seo_data:     seo  as unknown as Record<string, unknown> | null,
        notes:        `Score real: ${score}/100 · Rubro: ${rubro} · Fuente: auditoría ${analysis.realData ? 'real' : 'estimada'}`,
        source:       'audit',
      })
      .select('id')
      .single()

    if (leadErr) console.error('[audit] Lead save error:', leadErr.message)

    // ── Audit log ──
    await supabase.from('audit_logs').insert({
      event:    'audit_completed',
      module:   'audit',
      metadata: { lead_id: lead?.id, score, tier, realData: analysis.realData, url: cleanUrl, rubro },
    })

    // ── Email de notificación (no bloqueante) ──
    sendLeadNotificationEmail({ name, company, whatsapp, email, url: cleanUrl, score, tier, rubro, realData: analysis.realData })
      .catch(err => console.error('[audit] Email error:', err))

    return NextResponse.json({
      success:  true,
      lead_id:  lead?.id ?? null,
      analysis,
    })

  } catch (err) {
    console.error('[audit] Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

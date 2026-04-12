/**
 * GET  /api/leads         → list leads (con filtros)
 * POST /api/leads         → create lead manual
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tier   = searchParams.get('tier')
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500)
  const offset = parseInt(searchParams.get('offset') ?? '0')
  const q      = searchParams.get('q')

  const supabase = createAdminSupabase()
  let query = supabase.from('leads').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tier) query = query.eq('tier', tier)
  if (q)    query = query.or(`company.ilike.%${q}%,contact_name.ilike.%${q}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count })
}

const createSchema = z.object({
  company:      z.string().min(1),
  contact_name: z.string().optional(),
  url:          z.string().optional(),
  rubro:        z.string().optional(),
  whatsapp:     z.string().optional(),
  email:        z.string().email().optional().or(z.literal('')),
  score:        z.number().min(0).max(100).optional().default(0),
  notes:        z.string().optional(),
  source:       z.enum(['audit','manual','whatsapp','landing']).optional().default('manual'),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })

    const d = parsed.data
    const score = d.score ?? 0
    const tier  = score >= 70 ? 'hot' : score >= 45 ? 'warm' : 'cold'

    const supabase = createAdminSupabase()
    const { data, error } = await supabase.from('leads').insert({ ...d, tier, prob: Math.round(score * 0.85) }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

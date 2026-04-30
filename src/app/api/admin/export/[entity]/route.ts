import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v).replace(/"/g, '""')
    return /[",\n\r]/.test(s) ? `"${s}"` : s
  }
  const header = columns.join(',')
  const body   = rows.map(r => columns.map(c => escape(r[c])).join(',')).join('\n')
  return `${header}\n${body}`
}

export async function GET(request: NextRequest) {
  // Verify admin session
  const serverClient = await createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = user.app_metadata?.role ?? user.user_metadata?.role
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url    = new URL(request.url)
  const entity = url.pathname.split('/').pop() // 'clients' or 'leads'
  const clientFilter = url.searchParams.get('client')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let csv = ''
  let filename = ''

  if (entity === 'clients') {
    const { data } = await supabase
      .from('clients')
      .select(`
        id, email, company_name, company, contact_name, full_name,
        plan, status, created_at,
        subscriptions(status, trial_ends_at),
        bot_configs(active),
        leads(id)
      `)
      .order('created_at', { ascending: false })

    const rows = (data ?? []).map((c: any) => ({
      empresa:       c.company_name || c.company || '—',
      email:         c.email ?? '',
      plan:          c.plan ?? 'Starter',
      estado:        (c.subscriptions as any[])?.[0]?.status ?? c.status ?? '—',
      bot_activo:    (c.bot_configs as any[])?.[0]?.active ? 'Sí' : 'No',
      total_leads:   (c.leads as any[])?.length ?? 0,
      trial_hasta:   (c.subscriptions as any[])?.[0]?.trial_ends_at
                       ? new Date((c.subscriptions as any[])[0].trial_ends_at).toLocaleDateString('es-CL')
                       : '—',
      fecha_registro: new Date(c.created_at).toLocaleDateString('es-CL'),
    }))

    csv = toCSV(rows, ['empresa','email','plan','estado','bot_activo','total_leads','trial_hasta','fecha_registro'])
    filename = `clientes-aigencialab-${new Date().toISOString().slice(0,10)}.csv`

  } else if (entity === 'leads') {
    let q = supabase
      .from('leads')
      .select('contact_name, email, whatsapp, tier, score, status, rubro, source, created_at, client_id')
      .order('created_at', { ascending: false })

    if (clientFilter) q = q.eq('client_id', clientFilter)

    const { data } = await q

    const rows = (data ?? []).map((l: any) => ({
      nombre:         l.contact_name ?? '—',
      email:          l.email ?? '',
      whatsapp:       l.whatsapp ?? '',
      score:          l.score ?? 0,
      tier:           l.tier ?? '—',
      estado:         l.status ?? '—',
      rubro:          l.rubro ?? '—',
      fuente:         l.source ?? '—',
      fecha:          new Date(l.created_at).toLocaleDateString('es-CL'),
      client_id:      l.client_id ?? '',
    }))

    csv = toCSV(rows, ['nombre','email','whatsapp','score','tier','estado','rubro','fuente','fecha','client_id'])
    filename = `leads-aigencialab-${new Date().toISOString().slice(0,10)}.csv`

  } else {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 400 })
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

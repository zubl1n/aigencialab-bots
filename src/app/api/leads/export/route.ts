/**
 * GET /api/leads/export → exportar leads como CSV
 */
import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminSupabase()
  const { data, error } = await supabase
    .from('leads')
    .select('company,contact_name,url,rubro,whatsapp,email,score,tier,prob,source,notes,created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const leads = data ?? []

  const headers = ['Empresa','Contacto','URL','Rubro','WhatsApp','Email','Score','Tier','Prob%','Fuente','Notas','Fecha']
  const rows = leads.map(l => [
    l.company, l.contact_name, l.url, l.rubro, l.whatsapp, l.email,
    l.score, l.tier, l.prob, l.source, l.notes,
    new Date(l.created_at).toLocaleDateString('es-CL')
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const filename = `leads-aigencialab-${new Date().toISOString().slice(0,10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    }
  })
}

import { createAdminSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leads & Pipeline — AigenciaLab' }

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ tier?: string; q?: string }> }) {
  const sp      = await searchParams
  const tierF   = sp.tier ?? ''
  const query   = sp.q   ?? ''
  const supabase = createAdminSupabase()

  let q = supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (tierF) q = q.eq('tier', tierF)
  if (query) q = q.or(`company.ilike.%${query}%,contact_name.ilike.%${query}%,url.ilike.%${query}%`)

  const { data: rawLeads } = await q.limit(100)
  const leads = rawLeads ?? []

  const tierMap = { hot:{ label:'Caliente 🔥', cls:'text-red-400 bg-red-500/10 border-red-500/20' }, warm:{ label:'Tibio 🌡️', cls:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' }, cold:{ label:'Frío ❄️', cls:'text-blue-400 bg-blue-500/10 border-blue-500/20' } }
  const sourceMap: Record<string, { label: string; cls: string }> = { audit: { label:'🔍 Auditoría', cls:'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }, whatsapp: { label:'💬 WhatsApp', cls:'text-green-400 bg-green-500/10 border-green-500/20' }, landing: { label:'🌐 Landing', cls:'text-blue-400 bg-blue-500/10 border-blue-500/20' }, manual: { label:'✏️ Manual', cls:'text-violet-400 bg-violet-500/10 border-violet-500/20' }, chatbot: { label:'🤖 Chatbot', cls:'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' } }
  const waNumber = process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56912345678'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Pipeline de Leads</h1>
          <p className="text-slate-500 text-sm">{leads.length} leads · Datos reales Supabase</p>
        </div>
        <div className="flex gap-3">
          <a href="/api/leads/export" className="border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm hover:border-white/20 transition-colors">
            📥 Exportar CSV
          </a>
          <Link href="/audit" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            🔍 Nueva Auditoría
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form className="flex-1 max-w-xs">
          <input name="q" defaultValue={query} placeholder="Buscar empresa, contacto, URL..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"/>
        </form>
        <div className="flex gap-2">
          {[['', 'Todos'], ['hot','🔥 Calientes'], ['warm','🌡️ Tibios'], ['cold','❄️ Fríos']].map(([val, lbl]) => (
            <Link key={val} href={`/dashboard/leads${val ? `?tier=${val}` : ''}${query ? `${val?'&':'?'}q=${query}` : ''}`}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${tierF === val ? 'bg-blue-600/30 border-blue-500/40 text-blue-300' : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'}`}>
              {lbl}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 text-xs">
              <th className="text-left px-6 py-4">Empresa / Contacto</th>
              <th className="text-left px-6 py-4">URL</th>
              <th className="text-left px-6 py-4">Rubro</th>
              <th className="text-left px-6 py-4">Score</th>
              <th className="text-left px-6 py-4">Tier</th>
              <th className="text-left px-6 py-4">Origen</th>
              <th className="text-left px-6 py-4">WhatsApp</th>
              <th className="text-left px-6 py-4">Email</th>
              <th className="text-left px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={10} className="text-center py-16 text-slate-600">
                Sin leads aún — <Link href="/audit" className="text-blue-400 hover:underline">genera tu primera auditoría →</Link>
              </td></tr>
            )}
            {leads.map(lead => {
              const t = tierMap[lead.tier as keyof typeof tierMap] ?? tierMap.cold
              const wa = lead.whatsapp?.replace(/\D/g,'') ?? ''
              return (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{lead.company || '—'}</div>
                    <div className="text-xs text-slate-500">{lead.contact_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.url ? (
                      <a href={lead.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs truncate max-w-32 block">
                        {lead.url.replace(/^https?:\/\//,'')}
                      </a>
                    ) : <span className="text-slate-600 text-xs">Sin sitio</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{lead.rubro}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-12 bg-white/5 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{width:`${lead.score}%`}}/>
                      </div>
                      <span className="font-bold text-slate-200 w-6">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${t.cls}`}>{t.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    {(() => { const s = sourceMap[lead.source as string] ?? { label: lead.source ?? '—', cls: 'text-slate-400 bg-white/5 border-white/10' }; return <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${s.cls}`}>{s.label}</span> })()}
                  </td>
                  <td className="px-6 py-4">
                    {lead.whatsapp ? (
                      <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola ${lead.contact_name ?? ''}! Te contactamos desde AigenciaLab.cl respecto a tu auditoría.`)}`}
                         target="_blank" rel="noreferrer"
                         className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-medium">
                        💬 {lead.whatsapp}
                      </a>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline text-xs truncate max-w-32 block">{lead.email}</a>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(lead.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4">
                    <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola ${lead.contact_name ?? ''}! Vimos tu auditoría (score ${lead.score}/100). ¿Cuándo podemos hablar?`)}`}
                       target="_blank" rel="noreferrer"
                       className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-600/30 transition-colors whitespace-nowrap">
                      Contactar →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { createAdminSupabase } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Clientes — AigenciaLab' }

const planMap  = { starter:'STARTER', advanced:'ADVANCED', enterprise:'ENTERPRISE' }
const statusMap = {
  active:     { label:'Activo',       cls:'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  onboarding: { label:'Onboarding',   cls:'text-blue-300 bg-blue-500/10 border-blue-500/30'         },
  paused:     { label:'Pausado',      cls:'text-yellow-300 bg-yellow-500/10 border-yellow-500/30'   },
  churned:    { label:'Cancelado',    cls:'text-red-300 bg-red-500/10 border-red-500/30'             },
}

export default async function ClientsPage() {
  const supabase = createAdminSupabase()
  const { data: rawClients } = await supabase
    .from('clients')
    .select('id, company, rubro, contact_name, whatsapp, email, plan, status, channels, created_at')
    .order('created_at', { ascending: false })
  const clients = rawClients ?? []

  const waNumber = process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56912345678'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-slate-500 text-sm">{clients.filter(c=>c.status==='active').length} activos · {clients.length} total</p>
        </div>
        <Link href="/dashboard/onboarding" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90">
          ⚙️ Activar nuevo cliente
        </Link>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {clients.length === 0 && (
          <div className="col-span-3 glass rounded-2xl p-12 text-center text-slate-600">
            Sin clientes registrados — <Link href="/dashboard/onboarding" className="text-blue-400">activar primer cliente →</Link>
          </div>
        )}
        {clients.map(c => {
          const s = statusMap[c.status as keyof typeof statusMap] ?? statusMap.onboarding
          const ch = c.channels as { whatsapp?: boolean; web?: boolean; email?: boolean } | null
          const wa = c.whatsapp?.replace(/\D/g,'') ?? ''
          return (
            <div key={c.id} className="glass rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{c.company}</h3>
                  <div className="text-xs text-slate-500">{c.rubro}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${s.cls}`}>{s.label}</span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-slate-400">
                  <span>Contacto</span><span className="text-slate-300">{c.contact_name ?? '—'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Plan</span><span className="text-slate-300 font-mono text-xs">{planMap[c.plan as keyof typeof planMap] ?? c.plan}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Canales</span>
                  <div className="flex gap-1">
                    {ch?.whatsapp && <span className="text-xs text-emerald-400">WA</span>}
                    {ch?.web      && <span className="text-xs text-blue-400">Web</span>}
                    {ch?.email    && <span className="text-xs text-violet-400">Email</span>}
                    {!ch?.whatsapp && !ch?.web && !ch?.email && <span className="text-xs text-slate-600">Sin canales</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-white/5">
                {c.whatsapp && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"
                     className="flex-1 text-center bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 py-2 rounded-xl text-xs font-medium hover:bg-emerald-600/30 transition-colors">
                    💬 WhatsApp
                  </a>
                )}
                <a href={`mailto:${c.email}`}
                   className="flex-1 text-center border border-white/10 text-slate-400 py-2 rounded-xl text-xs hover:border-white/20 transition-colors">
                  📧 Email
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

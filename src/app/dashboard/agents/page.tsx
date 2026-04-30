import { createAdminSupabase } from '@/lib/supabase/server'
import AgentsClient from './agents-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Configuración Agentes IA — AigenciaLab' }

export default async function AgentsPage() {
  const supabase = createAdminSupabase()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company, status, faqs, config')
    .order('company')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Configuración de Agentes IA</h1>
          <p className="text-slate-500 text-sm">Comportamiento, conocimiento (RAG) y prompts dinámicos por cliente</p>
        </div>
      </div>

      <AgentsClient initialClients={clients ?? []} />
    </div>
  )
}

import { createAdminSupabase } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ChatClient from './chat-client'

export const metadata: Metadata = { title: 'Conversaciones (En Vivo) — AigenciaLab' }

export default async function ChatsPage() {
  const supabase = createAdminSupabase()

  const { data: rawConvs, error } = await supabase
    .from('conversations')
    .select('*, messages(id, direction, content, timestamp)')
    .order('updated_at', { ascending: false })
    .limit(50)

  const convs = rawConvs ?? []
  const needsHuman = convs.filter(c => c.status === 'needs_human').length
  const open       = convs.filter(c => c.status === 'open').length

  return (
    <div className="p-8 h-screen max-h-screen overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Conversaciones WhatsApp</h1>
          <p className="text-slate-500 text-sm">{open} abiertas · <span className="text-red-400">{needsHuman} requieren humano</span></p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatClient initialConvs={convs as any} />
      </div>
    </div>
  )
}

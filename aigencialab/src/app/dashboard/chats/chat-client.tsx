'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, User, Bot, AlertTriangle, Send, ShieldAlert } from 'lucide-react'

type Message = { id: string; direction: string; content: string; timestamp: string }
type Conv = { id: string; contact_wa: string; contact_name: string; status: string; channel: string; updated_at: string; messages: Message[] }

export default function ChatClient({ initialConvs }: { initialConvs: Conv[] }) {
  const [convs, setConvs] = useState<Conv[]>(initialConvs)
  const [activeId, setActiveId] = useState<string | null>(null)
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    // Realtime subscription setup
    const channel = supabase.channel('realtime:public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any
        setConvs(prev => prev.map(c => {
          if (c.id === newMsg.conversation_id) {
            return { ...c, messages: [...c.messages, newMsg], updated_at: newMsg.timestamp }
          }
          return c
        }).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, (payload) => {
        const updatedConv = payload.new as any
        setConvs(prev => prev.map(c => c.id === updatedConv.id ? { ...c, status: updatedConv.status } : c))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convs, activeId])

  const activeConv = convs.find(c => c.id === activeId)

  const toggleStatus = async (convId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'needs_human' ? 'open' : 'needs_human'
    await supabase.from('conversations').update({ status: newStatus }).eq('id', convId)
    // local state updates optimistically or via generic subscription
  }

  const sendReply = async (convId: string) => {
    if (!replyText.trim() || !activeConv) return
    const payload = {
      client_id: activeConv.client_id || '00000000-0000-0000-0000-000000000000', // needs real client_id from conv
      conversation_id: convId,
      to: activeConv.contact_wa,
      message: replyText
    }
    
    // Optimistic UI update not needed strictly because WS will push the new msg, but good for speed
    setReplyText('')

    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  return (
    <div className="flex h-[calc(100vh-120px)] border border-white/10 rounded-2xl overflow-hidden glass">
      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 border-r border-white/10 flex flex-col bg-white/5">
        <div className="p-4 border-b border-white/5 font-semibold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Bandeja de Entrada
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {convs.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={`w-full text-left p-4 rounded-xl transition-all ${activeId === c.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : 'hover:bg-white/5 border-l-4 border-transparent'}`}>
              <div className="flex justify-between items-start mb-1">
                <div className="font-semibold text-sm truncate">{c.contact_name || c.contact_wa}</div>
                <div className="text-xs text-slate-500">{new Date(c.updated_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
              </div>
              <div className="text-xs text-slate-400 truncate">
                {c.messages?.length ? c.messages[c.messages.length - 1].content : 'Sin mensajes'}
              </div>
              {c.status === 'needs_human' && (
                <div className="mt-2 text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded inline-block">Req. Humano</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Area - Active Chat */}
      <div className="flex-1 flex flex-col bg-slate-900/40">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Selecciona una conversación</div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <div className="font-bold">{activeConv.contact_name || activeConv.contact_wa}</div>
                <div className="text-xs text-slate-400">{activeConv.channel}</div>
              </div>
              <button 
                onClick={() => toggleStatus(activeConv.id, activeConv.status)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeConv.status === 'needs_human' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                {activeConv.status === 'needs_human' ? <><ShieldAlert className="w-4 h-4"/> Resolver</> : <><AlertTriangle className="w-4 h-4"/> Pausar IA</>}
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(activeConv.messages || []).map((msg, i) => {
                const isHumanOut = msg.direction === 'out' && msg.content.includes('humano') // simple check based on future logic
                const isOut = msg.direction === 'out'
                return (
                  <div key={msg.id || i} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 ${isOut ? 'bg-blue-600/20 text-blue-100 rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                      <div className="flex items-center gap-2 mb-1 opacity-70">
                        {isOut ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span className="text-[10px]">{isOut ? 'IA / Operador' : 'Cliente'}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              {activeConv.status === 'needs_human' ? (
                <div className="relative">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply(activeConv.id)}
                    placeholder="Escribe una respuesta manual..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                  <button 
                    onClick={() => sendReply(activeConv.id)}
                    className="absolute right-2 top-2 p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-500 py-3 bg-slate-900/50 rounded-xl border border-white/5">
                  El agente IA tiene el control. Presiona "Pausar IA" para intervenir.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

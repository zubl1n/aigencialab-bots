'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AgentsClient({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients)
  const [activeId, setActiveId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  
  const activeClient = clients.find(c => c.id === activeId)
  
  // Form State
  const [agentName, setAgentName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [faqsStr, setFaqsStr] = useState('')

  const handleSelect = (id: string) => {
    setActiveId(id)
    const c = clients.find(x => x.id === id)
    if (c) {
      setAgentName(c.config?.agent_name || '')
      setSystemPrompt(c.config?.system_prompt || '')
      setFaqsStr(JSON.stringify(c.faqs || [], null, 2))
    }
  }

  const handleSave = async () => {
    if (!activeId) return
    setSaving(true)
    try {
      let parsedFaqs = []
      try {
        parsedFaqs = JSON.parse(faqsStr)
      } catch(e) {
        alert('Error en formato JSON de FAQs')
        setSaving(false)
        return
      }

      const newConfig = { ...activeClient?.config, agent_name: agentName, system_prompt: systemPrompt }
      
      const supabase = createClient()
      const { error } = await supabase.from('clients').update({
        config: newConfig, faqs: parsedFaqs
      }).eq('id', activeId)
      
      if (error) throw error

      setClients(prev => prev.map(c => c.id === activeId ? { ...c, config: newConfig, faqs: parsedFaqs } : c))
      alert('Configuración guardada exitosamente ✅')
    } catch (e: any) {
      console.error(e)
      alert('Error guardando en Supabase: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Selector */}
      <div className="glass rounded-2xl p-6 h-fit">
        <h2 className="font-semibold mb-4">🏢 Seleccionar Cliente</h2>
        <p className="text-xs text-slate-500 mb-4">El contexto del agente está estrictamente aislado por Tenant_ID.</p>
        <select 
          value={activeId} onChange={(e) => handleSelect(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Elige un cliente --</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.company} ({c.id.substring(0,6)})</option>
          ))}
        </select>
        
        {activeClient && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="text-xs text-slate-400 mb-1">Estado del Cliente</div>
            <div className={`font-medium text-sm ${activeClient.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {activeClient.status === 'active' ? 'Online 🟢' : 'Onboarding 🟡'}
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="lg:col-span-2 glass rounded-2xl p-6 opacity-100 transition-opacity" style={{ opacity: activeId ? 1 : 0.5, pointerEvents: activeId ? 'auto' : 'none' }}>
        <h2 className="font-semibold mb-6">🧠 Prompt System y Conocimiento</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Agente</label>
            <input 
              type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
              placeholder="Ej: Nova"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Instrucción Base (System Prompt)</label>
            <textarea 
              value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-32 focus:border-blue-500 outline-none resize-y"
              placeholder="Eres un agente experto en ventas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Base de Conocimientos (RAG FAQs JSON)</label>
            <textarea 
              value={faqsStr} onChange={e => setFaqsStr(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-48 focus:border-blue-500 outline-none resize-y font-mono bg-slate-900"
              placeholder='[{"q":"¿Hacen despachos?","a":"Sí, a todo Chile"}]'
            />
          </div>

          <button 
            disabled={saving} onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  )
}

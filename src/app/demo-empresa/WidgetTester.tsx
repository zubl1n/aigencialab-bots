'use client'

import { useState, useEffect } from 'react'

export function WidgetTester() {
  const [apiKey, setApiKey] = useState('')
  const [activeLoadedKey, setActiveLoadedKey] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  const loadWidget = (key: string) => {
    if (!key) return alert('Debes ingresar una API Key válida')

    // Remove old widget string if any
    removeWidget()

    setTimeout(() => {
      const s = document.createElement('script')
      s.src = '/widget/widget.js'
      s.setAttribute('data-api-key', key)
      s.id = 'aigencialab-widget-script'
      s.defer = true
      document.body.appendChild(s)
      setActiveLoadedKey(key)
    }, 100)
  }

  const removeWidget = () => {
    const script = document.getElementById('aigencialab-widget-script')
    if (script) script.remove()
    
    // The widget might have injected DOM elements (usually an iframe or a div container)
    // We try to find and remove standard AigenciaLab widget containers just in case.
    const widgetContainer = document.getElementById('aigencialab-widget-container')
    const chatIframe = document.getElementById('aigencialab-chat-app')
    if (widgetContainer) widgetContainer.remove()
    if (chatIframe) chatIframe.remove()

    setActiveLoadedKey(null)
  }

  // Helper plans to prefill dummy IDs (if useful for the user)
  const testPlans = [
    { name: 'Básico (FAQ)', demoKey: 'demo_basic_key' },
    { name: 'Starter (Leads)', demoKey: 'demo_starter_key' },
    { name: 'Pro (Ventas/CRM)', demoKey: 'demo_pro_key' },
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans shadow-2xl">
      {isOpen ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] w-80">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Modo Testing</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Prueba la integración del agente en un entorno real. Ingresa tu API Key de cliente.
            </p>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">API Key (Client ID)</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Ej: d7f8a1... o a8b2..."
                className="w-full bg-gray-950 border border-gray-700 text-white rounded px-3 py-2 text-xs outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => loadWidget(apiKey)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded transition-colors"
              >
                Inyectar Widget
              </button>
              <button 
                onClick={removeWidget}
                disabled={!activeLoadedKey}
                className="bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 text-xs font-bold py-2 rounded transition-colors"
              >
                Remover
              </button>
            </div>

            {activeLoadedKey && (
              <div className="mt-2 text-[10px] text-green-400 bg-green-400/10 p-2 rounded border border-green-400/20 text-center">
                ✅ Widget inyectado exitosamente.<br/>
                Key: <span className="font-mono">{activeLoadedKey.substring(0,6)}...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 border border-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center animate-bounce"
          title="Abrir Testing Tools"
        >
          ⚙️
        </button>
      )}
    </div>
  )
}

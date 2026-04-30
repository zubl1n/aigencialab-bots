import React from 'react';
import { 
  Bot, Settings2, Sliders, Save, Database, 
  Sparkles, ShieldAlert, FileText, ChevronDown, CheckCircle2
} from 'lucide-react';

export default function EnhancedBotConfigMockup() {
  return (
    <div className="min-h-screen bg-[#060608] text-zinc-300 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-end border-b border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Settings2 className="w-6 h-6" />
              </span>
              Inteligencia del Agente
            </h1>
            <p className="text-zinc-500 text-sm mt-2 ml-1">Configura el comportamiento, conocimiento y tono de tu asistente virtual.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800/50 text-white font-medium text-sm hover:bg-zinc-800 transition">
              Descartar Cambios
            </button>
            <button className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-indigo-600/30 text-white font-medium text-sm flex items-center gap-2 transition">
               <Save className="w-4 h-4" /> Guardar y Reentrenar
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Config Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personality Section */}
            <div className="rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-medium text-white">Identidad y Comportamiento</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Nombre del Agente</label>
                    <input 
                      type="text" 
                      defaultValue="AigenciaBot"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Tono de Conversación</label>
                    <div className="relative">
                      <select className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 appearance-none">
                        <option>Profesional y Directo</option>
                        <option>Amigable y Cercano</option>
                        <option>Técnico y Detallado</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Prompt Principal (Instrucciones Base)</label>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">Generar con IA</button>
                  </div>
                  <textarea 
                    rows={6}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-300 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono leading-relaxed resize-none custom-scrollbar"
                    defaultValue="Eres el asistente virtual experto de la empresa AigenciaLab. Tu objetivo principal es ayudar a los visitantes a entender cómo nuestras soluciones de automatización con IA pueden escalar sus negocios. Eres empático, pero enfocado en la conversión. Recopila nombre y requerimiento antes de derivar."
                  />
                  <p className="text-[11px] text-zinc-600 text-right">382 / 2000 caracteres</p>
                </div>
              </div>
            </div>

            {/* Knowledge Base */}
            <div className="rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-medium text-white">Base de Conocimiento (RAG)</h3>
              </div>
              
              <p className="text-sm text-zinc-400 mb-6">El agente utilizará estos documentos para responder las dudas de tus clientes. Si no sabe la respuesta, pedirá los datos del usuario para escalar.</p>

              <div className="space-y-3 relative z-10">
                {/* File Item */}
                <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-emerald-500/20 rounded-xl group hover:border-emerald-500/40 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Precios_Y_Servicios_2024.pdf</p>
                      <p className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Procesado e indexado (24KB)</p>
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-red-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                </div>

                {/* File Item */}
                <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl group hover:border-zinc-700 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Preguntas_Frecuentes_Aigencia.docx</p>
                      <p className="text-xs text-zinc-500">Subido hace 2 días</p>
                    </div>
                  </div>
                  <button className="text-zinc-500 hover:text-red-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col justify-center items-center gap-2 group mt-4">
                   <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition">
                      <span className="text-zinc-400 group-hover:text-indigo-400 font-bold">+</span>
                   </div>
                   <span className="text-sm font-medium text-zinc-400 group-hover:text-indigo-300">Añadir Documento o Sitio Web</span>
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar / Simulation Preview */}
          <div className="space-y-6">
            
            {/* Model & Technical */}
            <div className="rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Sliders className="w-4 h-4 text-zinc-400" />
                <h3 className="text-md font-medium text-white">Configuración Técnica</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase mb-2 block">Modelo de IA</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 text-sm">
                    <option>GPT-4o (Recomendado)</option>
                    <option>Claude 3.5 Sonnet</option>
                    <option>GPT-4 Turbo</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Creatividad (Temperature)</label>
                     <span className="text-xs text-indigo-400 font-mono">0.3</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="30" className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                    <span>Preciso/Rígido</span>
                    <span>Creativo/Libre</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Constraints & Limits */}
            <div className="rounded-[2rem] bg-zinc-900/40 border border-zinc-800/60 p-6">
              <div className="flex items-center gap-3 mb-5">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <h3 className="text-md font-medium text-white">Límites y Reglas</h3>
              </div>
              <div className="space-y-3">
                 <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 bg-zinc-900 border-zinc-700 rounded" />
                    <div>
                       <p className="text-sm text-zinc-300 font-medium">Requerir Email</p>
                       <p className="text-xs text-zinc-500">El bot no revelará precios sin solicitar un email antes.</p>
                    </div>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 bg-zinc-900 border-zinc-700 rounded" />
                    <div>
                       <p className="text-sm text-zinc-300 font-medium">Límite de mensajes</p>
                       <p className="text-xs text-zinc-500">Desconectar al usuario tras 20 interacciones sin conversión.</p>
                    </div>
                 </label>
              </div>
            </div>

            {/* Test action */}
            <button className="w-full py-4 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 transition flex items-center justify-center gap-2 text-zinc-200 font-medium">
               <Bot className="w-4 h-4" /> Probar Agente en Sandbox
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  Palette, 
  MessageSquare, 
  Globe, 
  Clock, 
  Shield, 
  Save, 
  Eye, 
  Loader2,
  Lock,
  Zap,
  ChevronDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BotConfig, Client } from '@/types/client';

export default function MyBotPage() {
  const [botConfig, setBotConfig] = useState<any>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bConfig } = await supabase
        .from('bot_configs')
        .select('*')
        .eq('client_id', user.id)
        .single();
      
      const { data: cData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (bConfig) setBotConfig(bConfig);
      if (cData) setClient(cData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('bot_configs')
      .update(botConfig)
      .eq('id', botConfig.id);
    
    if (!error) {
      setPreviewKey(prev => prev + 1); // Refresh preview
      alert('Configuración guardada correctamente.');
    }
    setSaving(false);
  };

  if (loading || !botConfig) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isPro = client?.plan !== 'Starter';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Configuración del Bot</h1>
          <p className="text-[var(--muted)]">Personaliza la personalidad y apariencia de tu asistente.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Settings */}
        <div className="space-y-6">
          {/* General Config */}
          <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <Bot className="text-blue-400 w-5 h-5" /> Apariencia e Identidad
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Nombre del Asistente</label>
                 <input 
                   type="text" 
                   className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                   value={botConfig.bot_name}
                   onChange={(e) => setBotConfig({...botConfig, bot_name: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Color del Widget</label>
                 <div className="flex gap-3">
                   <input 
                     type="color" 
                     className="w-12 h-11 bg-transparent border-none p-0 cursor-pointer rounded-lg rounded-full"
                     value={botConfig.widget_color}
                     onChange={(e) => setBotConfig({...botConfig, widget_color: e.target.value})}
                   />
                   <input 
                     type="text" 
                     className="flex-1 bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-xs font-mono uppercase focus:outline-none"
                     value={botConfig.widget_color}
                     onChange={(e) => setBotConfig({...botConfig, widget_color: e.target.value})}
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Mensaje de Bienvenida</label>
               <textarea 
                 rows={3}
                 maxLength={200}
                 className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                 value={botConfig.welcome_message}
                 onChange={(e) => setBotConfig({...botConfig, welcome_message: e.target.value})}
               />
               <div className="flex justify-end pr-2 text-[10px] font-bold text-[var(--muted)]">
                 {botConfig.welcome_message?.length || 0} / 200
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Idioma Predeterminado</label>
                 <select 
                   className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
                   value={botConfig.language}
                   onChange={(e) => setBotConfig({...botConfig, language: e.target.value})}
                 >
                   <option value="es">Español (Chile)</option>
                   <option value="en">English (US)</option>
                   <option value="pt">Português</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Avatar (Emoji)</label>
                 <input 
                   type="text" 
                   className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none"
                   placeholder="🤖"
                 />
               </div>
            </div>
          </div>

          {/* Prompt / Personality (Lock if Starter) */}
          <div className={`glass rounded-[32px] p-8 border transition-all duration-300 ${!isPro ? 'opacity-50 grayscale' : 'border-[var(--border)]'}`}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="text-purple-400 w-5 h-5" /> Instrucciones & Personalidad
                </h3>
                {!isPro && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                    <Lock className="w-3 h-3" /> Requiere Plan Pro
                  </span>
                )}
             </div>

             <div className="space-y-4 relative">
                {!isPro && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg2)]/50 backdrop-blur-[2px] rounded-2xl p-6 text-center">
                     <p className="text-sm font-bold text-white mb-2 uppercase tracking-tight">Mejora a Pro para editar el prompt</p>
                     <p className="text-[10px] text-[var(--muted)] mb-4">Define cómo habla tu bot, sus límites y su base de conocimiento avanzada.</p>
                     <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20">
                        Mejorar Plan <Zap className="w-3 h-3" />
                     </button>
                  </div>
                )}
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Prompt del Sistema</label>
                   <textarea 
                     disabled={!isPro}
                     rows={8}
                     className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-4 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none font-mono leading-relaxed"
                     placeholder="Eres un asistente experto en ventas para..."
                   />
                </div>
             </div>
          </div>

          {/* Work Hours & Mode */}
          <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Clock className="text-orange-400 w-5 h-5" /> Comportamiento y Horarios
              </h3>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Modo de Operación</label>
                    <select className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none">
                       <option value="ia_only">Solo IA (24/7)</option>
                       <option value="ia_human">IA + Derivar a Humano</option>
                       <option value="human_only">Solo Humano (Chat en vivo)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Horario Atención</label>
                    <button className="w-full flex justify-between items-center bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm font-medium">
                       Lunes a Viernes, 9-18h <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
                    </button>
                 </div>
              </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-6 lg:sticky lg:top-8 self-start">
           <div className="glass rounded-[32px] border border-[var(--border)] overflow-hidden">
              <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Eye className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">Vista Previa en Vivo</h4>
                      <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">Simulación del Widget</p>
                   </div>
                 </div>
                 <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-orange-500/20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                 </div>
              </div>

              {/* Mock Widget UI */}
              <div className="relative bg-[#080a12] h-[500px] flex flex-col p-6 overflow-hidden">
                 <div className="flex-1 space-y-4">
                    <div className="flex justify-end">
                       <div className="bg-white/10 rounded-2xl rounded-tr-sm p-4 text-xs text-white max-w-[80%] border border-white/5">
                          ¡Hola! Estoy interesado en contratar sus servicios para mi empresa.
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5" style={{backgroundColor: botConfig.widget_color + '20'}}>
                          <Bot className="w-5 h-5" style={{color: botConfig.widget_color}} />
                       </div>
                       <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 text-xs text-[var(--sub)] max-w-[80%] border border-white/5 leading-relaxed">
                          {botConfig.welcome_message}
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto">
                    <div className="relative">
                       <input 
                         disabled
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm text-white"
                         placeholder="Escribe un mensaje..."
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl" style={{backgroundColor: botConfig.widget_color}}>
                          <Zap className="w-4 h-4 text-white fill-current" />
                       </div>
                    </div>
                    <p className="text-center text-[8px] text-[var(--muted)] mt-4 font-bold uppercase tracking-widest">Powered by AIgenciaLab.cl</p>
                 </div>

                 {/* Floating Button Mock */}
                 <div 
                   className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center cursor-not-allowed scale-75 opacity-50"
                   style={{backgroundColor: botConfig.widget_color}}
                 >
                    <MessageSquare className="w-7 h-7 text-white fill-current" />
                 </div>
              </div>
           </div>

           <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[24px]">
              <div className="flex items-start gap-4">
                 <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                 <div>
                    <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Protección de Datos</h5>
                    <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium">
                      Todas tus configuraciones y el conocimiento de tu bot están cifrados. Cumplimos con la Ley N°19.628 de protección de datos personales.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

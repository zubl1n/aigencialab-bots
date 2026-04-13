'use client';

import React, { useEffect, useState } from 'react';
import { 
  Save, 
  Mail, 
  CreditCard, 
  Zap, 
  Webhook, 
  Flag, 
  Plus, 
  Trash2, 
  Settings as SettingsIcon,
  Loader2,
  CheckCircle2,
  Globe,
  Bell
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'emails' | 'webhooks' | 'flags'>('plans');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();
      
      if (!error) setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', 'global');
    
    if (!error) {
      alert('Configuración guardada correctamente.');
    } else {
      alert('Error al guardar: ' + error.message);
    }
    setSaving(false);
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Configuración Global</h1>
          <p className="text-[var(--muted)]">Parametrización del ecosistema y límites de servicio.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Guardar Todo</>}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Navigation */}
        <div className="w-64 space-y-2">
          <TabButton icon={CreditCard} label="Planes y Precios" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
          <TabButton icon={Mail} label="Email Templates" active={activeTab === 'emails'} onClick={() => setActiveTab('emails')} />
          <TabButton icon={Webhook} label="Webhooks" active={activeTab === 'webhooks'} onClick={() => setActiveTab('webhooks')} />
          <TabButton icon={Flag} label="Feature Flags" active={activeTab === 'flags'} onClick={() => setActiveTab('flags')} />
        </div>

        {/* Content Area */}
        <div className="flex-1 glass rounded-[32px] border border-[var(--border)] p-8">
          {activeTab === 'plans' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <CreditCard className="text-blue-400" /> Límites por Plan
                </h3>
                <button className="text-sm font-bold text-blue-400 hover:text-white flex items-center gap-1"><Plus className="w-4 h-4" /> Nuevo Plan</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {settings.plans.map((plan: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-3xl grid grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--muted)] mb-2 block">Nombre</label>
                      <input 
                        type="text" 
                        className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                        value={plan.name}
                        onChange={(e) => {
                          const newPlans = [...settings.plans];
                          newPlans[idx].name = e.target.value;
                          setSettings({...settings, plans: newPlans});
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--muted)] mb-2 block">Precio ($)</label>
                      <input 
                        type="number" 
                        className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                        value={plan.price}
                        onChange={(e) => {
                          const newPlans = [...settings.plans];
                          newPlans[idx].price = parseInt(e.target.value);
                          setSettings({...settings, plans: newPlans});
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--muted)] mb-2 block">Max Bots</label>
                      <input 
                        type="number" 
                        className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                        value={plan.max_bots}
                        onChange={(e) => {
                          const newPlans = [...settings.plans];
                          newPlans[idx].max_bots = parseInt(e.target.value);
                          setSettings({...settings, plans: newPlans});
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-[var(--muted)] mb-2 block">Max Leads/Mes</label>
                        <input 
                          type="number" 
                          className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                          value={plan.max_leads}
                          onChange={(e) => {
                            const newPlans = [...settings.plans];
                            newPlans[idx].max_leads = parseInt(e.target.value);
                            setSettings({...settings, plans: newPlans});
                          }}
                        />
                      </div>
                      <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors h-10 mb-0.5"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'emails' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Mail className="text-orange-400" /> Templates Transaccionales
              </h3>
              <div className="space-y-8">
                {Object.keys(settings.email_templates).map((key) => (
                  <div key={key} className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--sub)] uppercase tracking-widest">{key}</h4>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--muted)] mb-2 block">Asunto</label>
                        <input 
                          type="text" 
                          className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                          value={settings.email_templates[key].subject}
                          onChange={(e) => {
                            const newTemplates = {...settings.email_templates};
                            newTemplates[key].subject = e.target.value;
                            setSettings({...settings, email_templates: newTemplates});
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[var(--muted)] mb-2 block">Cuerpo del Mensaje (Markdown/HTML)</label>
                        <textarea 
                          rows={4}
                          className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                          value={settings.email_templates[key].body}
                          onChange={(e) => {
                            const newTemplates = {...settings.email_templates};
                            newTemplates[key].body = e.target.value;
                            setSettings({...settings, email_templates: newTemplates});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center py-20">
               <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Webhook className="w-10 h-10 text-blue-500" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Webhooks Globales</h3>
               <p className="text-[var(--muted)] max-w-sm mx-auto mb-8">Notifica eventos críticos (nuevos registros, errores LLM) a Slack o Discord.</p>
               <button className="px-8 py-3 bg-[var(--bg3)] border border-[var(--border)] text-white font-bold rounded-2xl hover:bg-[var(--bg2)] transition-all">Configurar nuevo Webhook</button>
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Flag className="text-purple-400" /> Feature Flags
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {Object.keys(settings.feature_flags).map((flag) => (
                   <div key={flag} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-tight">{flag.replace(/_/g, ' ')}</h4>
                        <p className="text-xs text-[var(--muted)]">Activado globalmente</p>
                      </div>
                      <div 
                        onClick={() => {
                          const newFlags = {...settings.feature_flags};
                          newFlags[flag] = !newFlags[flag];
                          setSettings({...settings, feature_flags: newFlags});
                        }}
                        className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${settings.feature_flags[flag] ? 'bg-blue-600' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${settings.feature_flags[flag] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium border
        ${active 
          ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5' 
          : 'text-[var(--muted)] border-transparent hover:bg-white/5 hover:text-white'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-[var(--muted)]'}`} />
      <span>{label}</span>
    </button>
  );
}

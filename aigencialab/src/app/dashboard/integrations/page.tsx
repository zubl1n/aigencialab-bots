'use client';

import React, { useEffect, useState } from 'react';
import { Plug, CheckCircle2, XCircle, Lock, ExternalLink, Code, Zap, MessageSquare, Globe, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePlan } from '@/hooks/usePlan';

interface Integration {
  id: string; name: string; description: string; icon: string;
  status: 'connected' | 'disconnected' | 'comingsoon';
  minPlan: string; docsUrl?: string; category: string;
}

const INTEGRATIONS: Integration[] = [
  { id: 'widget', name: 'Widget Web', description: 'Chatbot flotante para tu sitio web. Copia y pega 1 línea de código.', icon: '🌐', status: 'connected', minPlan: 'basic', docsUrl: '/dashboard/installation', category: 'Canal' },
  { id: 'whatsapp', name: 'WhatsApp Business', description: 'Conecta tu número de WhatsApp Business oficial con la API de Meta.', icon: '💬', status: 'disconnected', minPlan: 'starter', category: 'Canal' },
  { id: 'telegram', name: 'Telegram', description: 'Bot de Telegram conectado a tu agente IA.', icon: '✈️', status: 'comingsoon', minPlan: 'pro', category: 'Canal' },
  { id: 'slack', name: 'Slack', description: 'Responde en canales de Slack automáticamente.', icon: '💡', status: 'comingsoon', minPlan: 'pro', category: 'Canal' },
  { id: 'api', name: 'REST API', description: 'Accede a tu agente via API REST con tu API Key.', icon: '⚡', status: 'disconnected', minPlan: 'pro', docsUrl: '/dashboard/settings', category: 'Desarrollo' },
  { id: 'webhooks', name: 'Webhooks', description: 'Recibe eventos en tiempo real cuando ocurren conversaciones o leads.', icon: '🔗', status: 'comingsoon', minPlan: 'pro', category: 'Desarrollo' },
  { id: 'zapier', name: 'Zapier', description: 'Conecta con 3000+ apps via Zapier.', icon: '⚡', status: 'comingsoon', minPlan: 'enterprise', category: 'Automatización' },
  { id: 'hubspot', name: 'HubSpot CRM', description: 'Sincroniza leads capturados directamente a HubSpot.', icon: '🟠', status: 'comingsoon', minPlan: 'enterprise', category: 'CRM' },
];

const STATUS_MAP = {
  connected:    { label: 'Conectado',    cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  disconnected: { label: 'Disponible',   cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',         icon: XCircle },
  comingsoon:   { label: 'Próximamente', cls: 'text-gray-500 bg-gray-500/10 border-gray-500/20',         icon: Lock },
};

const PLAN_ORDER = ['basic', 'starter', 'pro', 'enterprise'];

export default function IntegrationsPage() {
  const supabase = createClient();
  const { planId, loading } = usePlan();
  const [botId, setBotId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: bot } = await supabase.from('bot_configs').select('id').eq('client_id', user.id).maybeSingle();
      setBotId(bot?.id ?? null);
    }
    fetch();
  }, []);

  const canAccess = (minPlan: string) => {
    const ci = PLAN_ORDER.indexOf(planId ?? 'basic');
    const ri = PLAN_ORDER.indexOf(minPlan);
    return ci >= ri;
  };

  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-purple-400 animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Plug className="w-7 h-7 text-cyan-400" /> Integraciones
        </h1>
        <p className="text-gray-500 text-sm mt-1">Conecta tu agente IA con tus herramientas</p>
      </div>

      {/* Widget snippet highlight */}
      {botId && userId && (
        <div className="glass rounded-[28px] border border-emerald-500/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">Widget activo · Instalación rápida</h3>
          </div>
          <p className="text-gray-500 text-xs mb-3">Pega este código antes del cierre de tu {'</body>'}:</p>
          <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto border border-white/5">
            {`<script src="https://aigencialab.cl/widget.js" data-bot="${botId}"></script>`}
          </div>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INTEGRATIONS.filter(i => i.category === cat).map(intg => {
              const locked = !canAccess(intg.minPlan);
              const isComingSoon = intg.status === 'comingsoon';
              const st = STATUS_MAP[intg.status];
              const StatusIcon = st.icon;

              return (
                <div key={intg.id}
                  className={`glass rounded-[24px] border p-6 transition-all ${locked ? 'border-white/5 opacity-50' : intg.status === 'connected' ? 'border-emerald-500/20' : 'border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{intg.icon}</div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{intg.name}</h3>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${st.cls}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {st.label}
                        </span>
                      </div>
                    </div>
                    {locked && (
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Plan {intg.minPlan.charAt(0).toUpperCase()}{intg.minPlan.slice(1)}+
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs mb-4 leading-relaxed">{intg.description}</p>
                  <div className="flex gap-2">
                    {intg.docsUrl && !locked && (
                      <a href={intg.docsUrl}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
                      >
                        {intg.id === 'widget' ? <><Code className="w-3 h-3" /> Ver código</> : <><ExternalLink className="w-3 h-3" /> Configurar</>}
                      </a>
                    )}
                    {isComingSoon && (
                      <span className="text-[10px] text-gray-700 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02]">
                        En desarrollo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

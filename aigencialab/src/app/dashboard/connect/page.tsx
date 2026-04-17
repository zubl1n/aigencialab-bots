'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Check, RefreshCw, AlertCircle, Database, Calendar, CreditCard,
  ShoppingCart, Bell, Power, Lock, Loader2, CheckCircle2, XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Integration catalog (UI only — state persisted in DB via /api/client/integrations) ────
const CATALOG: {
  category: string;
  icon: typeof Database;
  planRequired: 'basic' | 'starter' | 'pro';
  integrations: { key: string; name: string; desc: string }[];
}[] = [
  {
    category: 'CRM', icon: Database, planRequired: 'starter',
    integrations: [
      { key: 'hubspot',    name: 'HubSpot',    desc: 'Sincroniza contactos, deals y notas automáticamente' },
      { key: 'salesforce', name: 'Salesforce', desc: 'CRM empresarial (Pro/Enterprise)' },
      { key: 'zoho_crm',  name: 'Zoho CRM',   desc: 'Gestión de leads y cuentas' },
      { key: 'pipedrive',  name: 'Pipedrive',  desc: 'Pipeline de ventas visual' },
    ],
  },
  {
    category: 'Calendarios', icon: Calendar, planRequired: 'starter',
    integrations: [
      { key: 'google_calendar', name: 'Google Calendar', desc: 'El agente agenda reuniones en tu calendario' },
      { key: 'calendly',        name: 'Calendly',        desc: 'Detecta slots disponibles y agenda' },
      { key: 'outlook',         name: 'Microsoft Outlook', desc: 'Calendarios corporativos (Pro/Enterprise)' },
    ],
  },
  {
    category: 'Pagos', icon: CreditCard, planRequired: 'starter',
    integrations: [
      { key: 'mercadopago', name: 'MercadoPago',    desc: 'Consultar pagos y enviar links de cobro' },
      { key: 'stripe',      name: 'Stripe',         desc: 'Pagos internacionales (Pro+)' },
      { key: 'transbank',   name: 'Transbank WebPay', desc: 'Exclusivo Chile (Pro+)' },
    ],
  },
  {
    category: 'E-commerce', icon: ShoppingCart, planRequired: 'starter',
    integrations: [
      { key: 'shopify',     name: 'Shopify',      desc: 'Consultar stock, pedidos y envíos en tiempo real' },
      { key: 'woocommerce', name: 'WooCommerce',  desc: 'Catálogo y pedidos' },
      { key: 'jumpseller',  name: 'Jumpseller',   desc: 'E-commerce Chile' },
    ],
  },
  {
    category: 'Notificaciones & Datos', icon: Bell, planRequired: 'starter',
    integrations: [
      { key: 'slack',         name: 'Slack',         desc: 'Alertas internas al equipo cuando hay un lead' },
      { key: 'google_sheets', name: 'Google Sheets', desc: 'Inventario y precios en tiempo real' },
      { key: 'airtable',      name: 'Airtable',      desc: 'Base de datos flexible como fuente de verdad' },
    ],
  },
];

const PLAN_ORDER = ['basic', 'starter', 'pro', 'enterprise'];

function planCanAccess(clientPlan: string, required: string): boolean {
  const ci = PLAN_ORDER.indexOf(clientPlan?.toLowerCase());
  const ri = PLAN_ORDER.indexOf(required);
  return ci >= ri;
}

export default function DashboardConnectPage() {
  const [integrationMap, setIntegrationMap]   = useState<Record<string, { enabled: boolean; updated_at: string }>>({});
  const [loading, setLoading]                 = useState(true);
  const [toggling, setToggling]               = useState<string | null>(null);
  const [clientPlan, setClientPlan]           = useState('basic');
  const [toast, setToast]                     = useState<{ msg: string; ok: boolean } | null>(null);
  const supabase = createClient();

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Load integrations state + client plan
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get plan
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('client_id', user.id)
      .maybeSingle();

    if (sub?.plan) setClientPlan(sub.plan.toLowerCase());

    // Get integration states
    const res  = await fetch('/api/client/integrations');
    const data = await res.json();
    setIntegrationMap(data.integrations ?? {});
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleIntegration = async (key: string, currentEnabled: boolean) => {
    setToggling(key);
    const newEnabled = !currentEnabled;

    const res = await fetch('/api/client/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integration_key: key, enabled: newEnabled }),
    });
    const data = await res.json();

    if (res.ok) {
      setIntegrationMap(prev => ({
        ...prev,
        [key]: { enabled: newEnabled, updated_at: new Date().toISOString() },
      }));
      showToast(newEnabled ? `✅ Integración activada` : `🔌 Integración desactivada`, true);
    } else {
      showToast(`❌ Error: ${data.error ?? 'desconocido'}`, false);
    }
    setToggling(null);
  };

  const activeCount = Object.values(integrationMap).filter(v => v.enabled).length;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-medium shadow-xl animate-in slide-in-from-bottom-4 border ${
          toast.ok ? 'bg-[#0e0e18] border-emerald-500/30 text-emerald-400' : 'bg-[#0e0e18] border-red-500/30 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AIgenciaLab Connect</h1>
          <p className="text-[var(--muted)] mt-1">Conecta tu agente IA con tus herramientas de negocio. Los cambios se guardan automáticamente.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{activeCount} activas</span>
          </div>
          <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-xl transition text-[var(--muted)] hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="space-y-10">
          {CATALOG.map(cat => {
            const catIcon = cat.icon;
            const CatIcon = catIcon;
            const canAccess = planCanAccess(clientPlan, cat.planRequired);

            return (
              <div key={cat.category}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2 rounded-xl border ${canAccess ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <h2 className={`text-sm font-bold uppercase tracking-widest ${canAccess ? 'text-white' : 'text-gray-600'}`}>
                    {cat.category}
                  </h2>
                  {!canAccess && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" /> Plan {cat.planRequired.charAt(0).toUpperCase() + cat.planRequired.slice(1)}+
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.integrations.map(intg => {
                    const state   = integrationMap[intg.key];
                    const enabled = state?.enabled ?? false;
                    const isTogg  = toggling === intg.key;
                    const locked  = !canAccess;

                    return (
                      <div
                        key={intg.key}
                        className={`glass rounded-2xl p-5 border transition-all ${
                          locked     ? 'opacity-40 border-white/5' :
                          enabled    ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' :
                                       'border-[var(--border)] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-bold text-white">{intg.name}</h3>
                            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">{intg.desc}</p>
                          </div>
                          <button
                            disabled={locked || isTogg}
                            onClick={() => toggleIntegration(intg.key, enabled)}
                            className={`flex-shrink-0 ml-3 p-2 rounded-xl border transition-all ${
                              locked   ? 'opacity-30 cursor-not-allowed border-white/10 text-gray-600' :
                              enabled  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' :
                                         'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-white'
                            }`}
                            title={locked ? 'Requiere upgrade de plan' : enabled ? 'Desactivar' : 'Activar'}
                          >
                            {isTogg ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : locked ? (
                              <Lock className="w-4 h-4" />
                            ) : enabled ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                          <div className={`w-1.5 h-1.5 rounded-full ${locked ? 'bg-gray-700' : enabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            locked ? 'text-gray-600' : enabled ? 'text-emerald-400' : 'text-gray-600'
                          }`}>
                            {locked ? 'Bloqueado' : enabled ? 'Activa' : 'Inactiva'}
                          </span>
                          {!locked && state?.updated_at && (
                            <span className="text-[9px] text-gray-700 ml-auto">
                              {new Date(state.updated_at).toLocaleDateString('es-CL')}
                            </span>
                          )}
                          {locked && (
                            <a href="/dashboard/billing" className="ml-auto text-[10px] text-purple-400 hover:text-purple-300 font-bold transition">
                              Upgrade →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      <div className="glass rounded-2xl p-6 border border-blue-500/10 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-400 mb-1">¿Cómo funciona Connect?</h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Al activar una integración, tu agente IA podrá comunicarse con esa herramienta en tiempo real.
              Por ejemplo: cuando se capture un nuevo lead, se creará automáticamente en HubSpot y se notificará a Slack.
              Las credenciales y configuración avanzada se gestionan desde <a href="/dashboard/settings" className="text-blue-400 hover:underline">Configuración → Integraciones</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

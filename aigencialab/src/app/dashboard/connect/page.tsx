'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Zap, Check, Play, Plus, RefreshCw, AlertCircle, CheckCircle, Clock,
  Database, Calendar, CreditCard, ShoppingCart, Bell, BarChart3,
  ExternalLink, Power,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  setupUrl?: string;
};

type Playbook = {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  active: boolean;
};

const CATALOG: { category: string; icon: typeof Database; integrations: { name: string; desc: string }[] }[] = [
  { category: 'CRM', icon: Database, integrations: [
    { name: 'HubSpot', desc: 'Sincroniza contactos, deals y notas' },
    { name: 'Salesforce', desc: 'CRM empresarial (Pro/Enterprise)' },
    { name: 'Zoho CRM', desc: 'Gestión de leads y cuentas' },
    { name: 'Pipedrive', desc: 'Pipeline de ventas' },
  ]},
  { category: 'Calendarios', icon: Calendar, integrations: [
    { name: 'Google Calendar', desc: 'El agente puede agendar reuniones' },
    { name: 'Calendly', desc: 'Detecta slots y agenda' },
    { name: 'Microsoft Outlook', desc: 'Para empresas (Pro/Enterprise)' },
  ]},
  { category: 'Pagos', icon: CreditCard, integrations: [
    { name: 'MercadoPago', desc: 'Consultar pagos, enviar links' },
    { name: 'Stripe', desc: 'Pagos internacionales (Pro+)' },
    { name: 'Transbank WebPay', desc: 'Exclusivo Chile (Pro+)' },
  ]},
  { category: 'E-commerce', icon: ShoppingCart, integrations: [
    { name: 'Shopify', desc: 'Stock, pedidos, envíos' },
    { name: 'WooCommerce', desc: 'Catálogo y pedidos' },
    { name: 'Jumpseller', desc: 'E-commerce Chile' },
  ]},
  { category: 'Notificaciones', icon: Bell, integrations: [
    { name: 'Slack', desc: 'Alertas internas al equipo' },
    { name: 'Google Sheets', desc: 'Inventario y precios en tiempo real' },
    { name: 'Airtable', desc: 'Base de datos flexible' },
  ]},
];

const PLAYBOOKS_DATA: Playbook[] = [
  { id: 'p1', title: 'Lead → HubSpot + Slack', desc: 'Nuevo lead de WhatsApp → crear contacto en HubSpot + notificar Slack', tags: ['WhatsApp', 'HubSpot', 'Slack'], active: false },
  { id: 'p2', title: 'Consulta de stock → Shopify', desc: 'Consulta de stock → verificar en Shopify → responder con disponibilidad', tags: ['Shopify', 'Chat'], active: false },
  { id: 'p3', title: 'Solicitud de reunión → Calendar', desc: 'Solicitud de reunión → verificar Calendar → agendar y confirmar', tags: ['Google Calendar', 'WhatsApp'], active: false },
  { id: 'p4', title: 'Lead calificado → Pipedrive', desc: 'Lead calificado por IA → crear deal en Pipedrive', tags: ['Pipedrive', 'Chat'], active: false },
  { id: 'p5', title: 'Abandono de carrito → WA', desc: 'Abandono de carrito → enviar mensaje WhatsApp a las 2h', tags: ['WooCommerce', 'WhatsApp'], active: false },
];

export default function DashboardConnectPage() {
  const [activeIntegrations, setActiveIntegrations] = useState<Integration[]>([]);
  const [playbooks, setPlaybooks] = useState(PLAYBOOKS_DATA);
  const [loading, setLoading] = useState(true);
  const [planAllows, setPlanAllows] = useState(false);
  const [actionsThisMonth, setActionsThisMonth] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check plan allows Connect
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('client_id', user.id)
        .single();

      const allowedPlans = ['Starter', 'Pro', 'Business', 'Enterprise'];
      const plan = sub?.plan ?? '';
      setPlanAllows(allowedPlans.some(p => plan.toLowerCase().includes(p.toLowerCase())));
      setActionsThisMonth(Math.floor(Math.random() * 450) + 50); // Mock for now
      setLoading(false);
    }
    load();
  }, []);

  function togglePlaybook(id: string) {
    setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!planAllows) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">AIgenciaLab Connect</h2>
        <p className="text-slate-500 mb-8">
          El módulo Connect está disponible desde el plan Starter.
          Conecta tu agente con CRMs, calendarios y más de 150 integraciones.
        </p>
        <a
          href="/precios"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Ver planes disponibles →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header KPIs */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">AIgenciaLab Connect</h1>
        <p className="text-slate-500 text-sm mb-6">Conecta todos tus sistemas. Tu agente IA hace el resto.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Integraciones activas', value: activeIntegrations.filter(i => i.status === 'active').length.toString(), icon: Check, color: 'emerald' },
            { label: 'Acciones este mes', value: actionsThisMonth.toLocaleString('es-CL'), icon: Zap, color: 'blue' },
            { label: 'Playbooks activos', value: playbooks.filter(p => p.active).length.toString(), icon: Play, color: 'violet' },
            { label: 'Uptime conectores', value: '99.8%', icon: CheckCircle, color: 'emerald' },
          ].map(({ label, value, icon: Icon, color }) => {
            const colors: Record<string, string> = {
              emerald: 'bg-emerald-50 text-emerald-600',
              blue:    'bg-blue-50 text-blue-600',
              violet:  'bg-violet-50 text-violet-600',
            };
            return (
              <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Playbooks */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900">Playbooks de automatización</h2>
            <p className="text-xs text-slate-500 mt-0.5">Flujos listos para activar con un clic</p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Crear flujo
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {playbooks.map((pb) => (
            <div key={pb.id} className="flex items-center gap-4 px-6 py-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${pb.active ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <Play className={`w-4 h-4 ${pb.active ? 'text-emerald-500' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 text-sm mb-0.5">{pb.title}</div>
                <div className="text-xs text-slate-500 mb-1.5">{pb.desc}</div>
                <div className="flex gap-1">
                  {pb.tags.map(t => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => togglePlaybook(pb.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  pb.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                <Power className="w-3 h-3" />
                {pb.active ? 'Activo' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Catálogo de integraciones</h2>
          <span className="text-xs text-slate-500">150+ disponibles</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATALOG.map(({ category, icon: CatIcon, integrations }) => (
            <div key={category} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <CatIcon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{category}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {integrations.map(({ name, desc }) => {
                  const isActive = activeIntegrations.some(i => i.name === name && i.status === 'active');
                  return (
                    <div key={name} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{name}</div>
                        <div className="text-xs text-slate-400">{desc}</div>
                      </div>
                      <button className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      }`}>
                        {isActive ? <><Check className="w-3 h-3" /> Activo</> : <><Plus className="w-3 h-3" /> Conectar</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

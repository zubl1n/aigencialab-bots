'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, RefreshCw, AlertCircle, Database, Calendar, CreditCard,
  ShoppingCart, Bell, Power, Lock, Loader2, CheckCircle2,
  Settings, X, Eye, EyeOff, ExternalLink, Copy, Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Config schema per integration ──────────────────────────────────────────
type FieldDef = { key: string; label: string; placeholder: string; type?: 'text' | 'password' | 'url'; hint?: string };

const INTEGRATION_FIELDS: Record<string, { docsUrl: string; fields: FieldDef[] }> = {
  hubspot:        { docsUrl: 'https://developers.hubspot.com/docs/api/overview',    fields: [{ key: 'api_key', label: 'API Key (Private App Token)', placeholder: 'pat-na1-...', type: 'password', hint: 'Crea un Private App en HubSpot → Settings → Integrations → Private Apps' }] },
  salesforce:     { docsUrl: 'https://help.salesforce.com/s/',                        fields: [{ key: 'instance_url', label: 'Instance URL', placeholder: 'https://mycompany.salesforce.com' }, { key: 'access_token', label: 'Access Token', placeholder: 'Bearer ...', type: 'password' }] },
  zoho_crm:       { docsUrl: 'https://www.zoho.com/crm/developer/docs/',              fields: [{ key: 'api_key', label: 'OAuth Token', placeholder: 'Zoho-oauthtoken ...', type: 'password' }] },
  pipedrive:      { docsUrl: 'https://pipedrive.readme.io/docs/getting-started',     fields: [{ key: 'api_key', label: 'API Token', placeholder: 'abc123...', type: 'password', hint: 'Settings → Personal Preferences → API' }] },
  google_calendar:{ docsUrl: 'https://developers.google.com/calendar/api/guides/overview', fields: [{ key: 'calendar_id', label: 'Calendar ID', placeholder: 'tucorreo@gmail.com', hint: 'Calendar Settings → Integrate calendar → Calendar ID' }, { key: 'service_account_json', label: 'Service Account JSON', placeholder: '{"type":"service_account",...}', type: 'password', hint: 'Descarga el JSON de tu Service Account en Google Cloud Console' }] },
  calendly:       { docsUrl: 'https://developer.calendly.com/',                      fields: [{ key: 'api_key', label: 'Personal Access Token', placeholder: 'eyJra...', type: 'password', hint: 'Calendly → Integrations → API & Webhooks' }] },
  outlook:        { docsUrl: 'https://learn.microsoft.com/en-us/graph/overview',     fields: [{ key: 'client_id', label: 'Azure App Client ID', placeholder: 'xxxxxxxx-xxxx-...' }, { key: 'client_secret', label: 'Client Secret', placeholder: '...', type: 'password' }, { key: 'tenant_id', label: 'Tenant ID', placeholder: 'xxxxxxxx-xxxx-...' }] },
  mercadopago:    { docsUrl: 'https://www.mercadopago.cl/developers/es/docs',        fields: [{ key: 'access_token', label: 'Access Token (producción)', placeholder: 'APP_USR-...', type: 'password', hint: 'MercadoPago Developers → Credenciales → Producción' }] },
  stripe:         { docsUrl: 'https://stripe.com/docs/api',                          fields: [{ key: 'api_key', label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' }, { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'whsec_...', type: 'password' }] },
  transbank:      { docsUrl: 'https://www.transbankdevelopers.cl/',                  fields: [{ key: 'commerce_code', label: 'Código de Comercio', placeholder: '597055555532' }, { key: 'api_key', label: 'API Key', placeholder: '...', type: 'password' }] },
  shopify:        { docsUrl: 'https://shopify.dev/docs/api',                         fields: [{ key: 'shop_domain', label: 'Dominio Shopify', placeholder: 'mitienda.myshopify.com', type: 'url' }, { key: 'api_key', label: 'Admin API Access Token', placeholder: 'shpat_...', type: 'password', hint: 'Apps → App and sales channel settings → Develop apps' }] },
  woocommerce:    { docsUrl: 'https://woocommerce.com/document/woocommerce-rest-api/', fields: [{ key: 'shop_url', label: 'URL de la tienda', placeholder: 'https://mitienda.com', type: 'url' }, { key: 'consumer_key', label: 'Consumer Key', placeholder: 'ck_...', type: 'password' }, { key: 'consumer_secret', label: 'Consumer Secret', placeholder: 'cs_...', type: 'password' }] },
  jumpseller:     { docsUrl: 'https://jumpseller.com/support/api/',                  fields: [{ key: 'login', label: 'Login (email)', placeholder: 'tu@email.com' }, { key: 'auth_token', label: 'Auth Token', placeholder: '...', type: 'password', hint: 'Jumpseller → Preferences → API tokens' }] },
  slack:          { docsUrl: 'https://api.slack.com/',                               fields: [{ key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/services/...', type: 'url', hint: 'Crea una Incoming Webhook en api.slack.com → Tu App → Incoming Webhooks' }] },
  google_sheets:  { docsUrl: 'https://developers.google.com/sheets/api/guides/concepts', fields: [{ key: 'spreadsheet_id', label: 'ID de la hoja', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms', hint: 'El ID está en la URL de Google Sheets' }, { key: 'service_account_json', label: 'Service Account JSON', placeholder: '{"type":"service_account",...}', type: 'password' }] },
  airtable:       { docsUrl: 'https://airtable.com/developers/web/api/introduction', fields: [{ key: 'api_key', label: 'Personal Access Token', placeholder: 'pat...', type: 'password', hint: 'airtable.com/create/tokens' }, { key: 'base_id', label: 'Base ID', placeholder: 'appXXXXXXXXXXXXXX', hint: 'En la URL de tu base de Airtable' }] },
};

// ── Integration catalog ───────────────────────────────────────────────────
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
      { key: 'calendly',        name: 'Calendly',        desc: 'Detecta slots disponibles y agenda automáticamente' },
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

// ── Config Modal ───────────────────────────────────────────────────────────
function ConfigModal({
  intgKey, intgName, existingConfig, onSave, onClose,
}: {
  intgKey: string;
  intgName: string;
  existingConfig: Record<string, string>;
  onSave: (config: Record<string, string>) => Promise<void>;
  onClose: () => void;
}) {
  const schema = INTEGRATION_FIELDS[intgKey];
  const [values, setValues] = useState<Record<string, string>>(existingConfig);
  const [show, setShow]     = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };

  if (!schema) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Configurar {intgName}</h3>
            <p className="text-xs text-[#A09CB0] mt-1">Las credenciales se guardan cifradas en tu cuenta</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4 mb-6">
          {schema.fields.map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-[#A09CB0] mb-1.5 uppercase tracking-wider">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.type === 'password' && !show[field.key] ? 'password' : 'text'}
                  value={values[field.key] ?? ''}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  {values[field.key] && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(values[field.key], field.key)}
                      className="p-1 hover:text-white text-gray-500 transition"
                      title="Copiar"
                    >
                      {copied === field.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShow(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                      className="p-1 hover:text-white text-gray-500 transition"
                    >
                      {show[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              {field.hint && <p className="text-[10px] text-[#6B6480] mt-1.5 leading-relaxed">{field.hint}</p>}
            </div>
          ))}
        </div>

        {/* Docs link */}
        <a
          href={schema.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mb-5 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver documentación oficial →
        </a>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardConnectPage() {
  const [integrationMap, setIntegrationMap] = useState<Record<string, { enabled: boolean; config: Record<string, string>; updated_at: string }>>({});
  const [loading, setLoading]               = useState(true);
  const [toggling, setToggling]             = useState<string | null>(null);
  const [clientPlan, setClientPlan]         = useState('basic');
  const [toast, setToast]                   = useState<{ msg: string; ok: boolean } | null>(null);
  const [configModal, setConfigModal]       = useState<{ key: string; name: string } | null>(null);

  const supabase = createClient();

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('client_id', user.id)
      .maybeSingle();

    if (sub?.plan) setClientPlan(sub.plan.toLowerCase());

    const res  = await fetch('/api/client/integrations');
    const data = await res.json();
    setIntegrationMap(data.integrations ?? {});
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  // Toggle integration on/off (if has required fields filled, save them too)
  const toggleIntegration = async (key: string, currentEnabled: boolean) => {
    const schema       = INTEGRATION_FIELDS[key];
    const existingConf = integrationMap[key]?.config ?? {};
    const newEnabled   = !currentEnabled;

    // If enabling and has config fields and no existing config → open modal first
    if (newEnabled && schema && schema.fields.length > 0) {
      const hasConfig = schema.fields.every(f => !!existingConf[f.key]);
      if (!hasConfig) {
        setConfigModal({ key, name: CATALOG.flatMap(c => c.integrations).find(i => i.key === key)?.name ?? key });
        return;
      }
    }

    setToggling(key);
    const res = await fetch('/api/client/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integration_key: key, enabled: newEnabled, config: existingConf }),
    });
    const data = await res.json();

    if (res.ok) {
      setIntegrationMap(prev => ({
        ...prev,
        [key]: { enabled: newEnabled, config: existingConf, updated_at: new Date().toISOString() },
      }));
      showToast(newEnabled ? `✅ Integración activada` : `🔌 Integración desactivada`, true);
    } else {
      showToast(`❌ Error: ${data.error ?? 'desconocido'}`, false);
    }
    setToggling(null);
  };

  // Save config from modal → toggle on at the same time
  const handleSaveConfig = async (config: Record<string, string>) => {
    if (!configModal) return;
    const key = configModal.key;

    const res = await fetch('/api/client/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ integration_key: key, enabled: true, config }),
    });
    const data = await res.json();

    if (res.ok) {
      setIntegrationMap(prev => ({
        ...prev,
        [key]: { enabled: true, config, updated_at: new Date().toISOString() },
      }));
      showToast(`✅ ${configModal.name} configurada y activada`, true);
    } else {
      showToast(`❌ Error: ${data.error ?? 'desconocido'}`, false);
    }
    setConfigModal(null);
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

      {/* Config Modal */}
      {configModal && (
        <ConfigModal
          intgKey={configModal.key}
          intgName={configModal.name}
          existingConfig={integrationMap[configModal.key]?.config ?? {}}
          onSave={handleSaveConfig}
          onClose={() => setConfigModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AIgenciaLab Connect</h1>
          <p className="text-[var(--muted)] mt-1">Conecta tu agente IA con tus herramientas de negocio. Las credenciales se guardan de forma segura.</p>
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
            const CatIcon   = cat.icon;
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
                    const state      = integrationMap[intg.key];
                    const enabled    = state?.enabled ?? false;
                    const hasConfig  = INTEGRATION_FIELDS[intg.key]?.fields.every(f => !!(state?.config?.[f.key]));
                    const isTogg     = toggling === intg.key;
                    const locked     = !canAccess;

                    return (
                      <div
                        key={intg.key}
                        className={`glass rounded-2xl p-5 border transition-all ${
                          locked  ? 'opacity-40 border-white/5' :
                          enabled ? 'border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/5' :
                                    'border-[var(--border)] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white">{intg.name}</h3>
                            <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">{intg.desc}</p>
                          </div>
                          <button
                            disabled={locked || isTogg}
                            onClick={() => toggleIntegration(intg.key, enabled)}
                            className={`flex-shrink-0 ml-3 p-2 rounded-xl border transition-all ${
                              locked  ? 'opacity-30 cursor-not-allowed border-white/10 text-gray-600' :
                              enabled ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' :
                                        'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-white'
                            }`}
                            title={locked ? 'Requiere upgrade de plan' : enabled ? 'Desactivar' : 'Activar'}
                          >
                            {isTogg ? <Loader2 className="w-4 h-4 animate-spin" /> :
                             locked  ? <Lock className="w-4 h-4" /> :
                             enabled ? <CheckCircle2 className="w-4 h-4" /> :
                                       <Power className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                          <div className={`w-1.5 h-1.5 rounded-full ${locked ? 'bg-gray-700' : enabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            locked ? 'text-gray-600' : enabled ? 'text-emerald-400' : 'text-gray-600'
                          }`}>
                            {locked ? 'Bloqueado' : enabled ? 'Activa' : 'Inactiva'}
                          </span>

                          {/* Config button for configured integrations */}
                          {!locked && INTEGRATION_FIELDS[intg.key] && (
                            <button
                              onClick={() => setConfigModal({ key: intg.key, name: intg.name })}
                              className={`ml-auto flex items-center gap-1 text-[10px] font-bold transition px-2 py-0.5 rounded-md ${
                                hasConfig
                                  ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10'
                                  : 'text-orange-400 hover:text-orange-300 bg-orange-500/10'
                              }`}
                              title="Configurar credenciales"
                            >
                              <Settings className="w-3 h-3" />
                              {hasConfig ? 'Credenciales ✓' : 'Configurar'}
                            </button>
                          )}

                          {locked && (
                            <a href="/dashboard/billing" className="ml-auto text-[10px] text-purple-400 hover:text-purple-300 font-bold transition">
                              Upgrade →
                            </a>
                          )}

                          {!locked && state?.updated_at && !INTEGRATION_FIELDS[intg.key] && (
                            <span className="text-[9px] text-gray-700 ml-auto">
                              {new Date(state.updated_at).toLocaleDateString('es-CL')}
                            </span>
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
              Al activar una integración y configurar tus credenciales, tu agente IA podrá comunicarse con esa herramienta en tiempo real.
              Por ejemplo: cuando se capture un nuevo lead, se creará automáticamente en HubSpot y se notificará a Slack.
              Las credenciales se almacenan de forma segura en tu cuenta y nunca son compartidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

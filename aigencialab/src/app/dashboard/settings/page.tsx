'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  User,
  Shield,
  Bell,
  Globe,
  Trash2,
  Save,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Tab = 'profile' | 'security' | 'notifications' | 'connections';

interface ClientConfig {
  id: string;
  email: string;
  company: string;
  company_name?: string;
  contact_name?: string;
  whatsapp?: string;
  url?: string;
  rubro?: string;
  channels?: { whatsapp: boolean; web: boolean; email: boolean };
  plan: string;
  status: string;
}

interface BotConfig {
  bot_name?: string;
  welcome_message?: string;
  widget_color?: string;
  language?: string;
  instructions?: string;
  active?: boolean;
}

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [client, setClient]       = useState<ClientConfig | null>(null);
  const [bot, setBot]             = useState<BotConfig>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local editable state
  const [form, setForm] = useState({
    company:      '',
    company_name: '',
    contact_name: '',
    whatsapp:     '',
    url:          '',
    rubro:        '',
    channels: { whatsapp: false, web: false, email: false },
    bot: {
      bot_name:        '',
      welcome_message: '',
      widget_color:    '#6366f1',
      language:        'es',
      instructions:    '',
    },
  });

  const supabase = createClient();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/client/config', { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Error ${res.status}`);
      }
      const json = await res.json();
      const c: ClientConfig = json.data?.client;
      const b: BotConfig    = json.data?.bot ?? {};

      setClient(c);
      setBot(b);

      if (c) {
        setForm({
          company:      c.company ?? '',
          company_name: c.company_name ?? '',
          contact_name: c.contact_name ?? '',
          whatsapp:     c.whatsapp ?? '',
          url:          c.url ?? '',
          rubro:        c.rubro ?? '',
          channels:     c.channels ?? { whatsapp: false, web: false, email: false },
          bot: {
            bot_name:        b.bot_name ?? '',
            welcome_message: b.welcome_message ?? '',
            widget_color:    b.widget_color ?? '#6366f1',
            language:        b.language ?? 'es',
            instructions:    b.instructions ?? '',
          },
        });
      }
    } catch (e: any) {
      setFetchError(e.message ?? 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const payload = {
        company:      form.company,
        company_name: form.company_name,
        contact_name: form.contact_name,
        whatsapp:     form.whatsapp,
        url:          form.url,
        rubro:        form.rubro,
        channels:     form.channels,
        bot:          form.bot,
      };

      const res = await fetch('/api/client/config', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? `Error ${res.status}`);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e: any) {
      setSaveError(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const TABS: { id: Tab; icon: any; label: string }[] = [
    { id: 'profile',       icon: User,   label: 'Perfil Público' },
    { id: 'security',      icon: Shield, label: 'Seguridad & Password' },
    { id: 'notifications', icon: Bell,   label: 'Notificaciones' },
    { id: 'connections',   icon: Globe,  label: 'Conexiones & API' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-red-400 font-semibold">{fetchError}</p>
        <button
          onClick={fetchConfig}
          className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:underline"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Configuración de Cuenta</h1>
          <p className="text-[var(--muted)]">
            {client?.email} · Plan <span className="capitalize text-blue-400">{client?.plan ?? 'Starter'}</span>
          </p>
        </div>
        <button
          id="save-settings-btn"
          form="settings-form"
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>

      {/* Success banner */}
      {saveSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          Configuración guardada correctamente en la base de datos.
        </div>
      )}

      {/* Error banner */}
      {saveError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {saveError}
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <div className="w-64 space-y-2 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between px-6 py-4 w-full rounded-2xl transition-all font-bold text-xs uppercase tracking-widest border ${
                activeTab === tab.id
                  ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                  : 'text-[var(--muted)] border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : 'text-[var(--muted)]'}`} />
                {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
          <div className="pt-8 mt-8 border-t border-[var(--border)]">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
              <Trash2 className="w-4 h-4" /> Eliminar Cuenta
            </button>
          </div>
        </div>

        {/* Content */}
        <form id="settings-form" onSubmit={handleSave} className="flex-1 space-y-8">
          {activeTab === 'profile' && (
            <>
              <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-8">
                {/* Avatar placeholder */}
                <div className="flex items-center gap-6 mb-2">
                  <div className="w-20 h-20 rounded-[24px] bg-[var(--bg3)] border border-white/5 flex items-center justify-center text-3xl font-bold text-blue-400">
                    {(form.company_name || form.company || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Imagen de Perfil</h3>
                    <p className="text-xs text-[var(--muted)] mb-4 font-medium max-w-[200px]">
                      Se recomienda un logo de al menos 400×400px en formato PNG o JPG.
                    </p>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <InputGroup
                    id="field-company"
                    label="Nombre de Empresa"
                    value={form.company}
                    onChange={v => setForm(f => ({ ...f, company: v }))}
                  />
                  <InputGroup
                    id="field-sitio"
                    label="Sitio Web"
                    type="url"
                    value={form.url}
                    onChange={v => setForm(f => ({ ...f, url: v }))}
                    placeholder="https://tuempresa.cl"
                  />
                  <InputGroup
                    id="field-contact"
                    label="Nombre de Contacto"
                    value={form.contact_name}
                    onChange={v => setForm(f => ({ ...f, contact_name: v }))}
                  />
                  <InputGroup
                    id="field-whatsapp"
                    label="WhatsApp"
                    value={form.whatsapp}
                    onChange={v => setForm(f => ({ ...f, whatsapp: v }))}
                    placeholder="+56912345678"
                  />
                  <InputGroup
                    id="field-rubro"
                    label="Rubro / Industria"
                    value={form.rubro}
                    onChange={v => setForm(f => ({ ...f, rubro: v }))}
                    placeholder="Retail, Salud, Educación..."
                  />
                </div>

                {/* Channels */}
                <div className="pt-6 border-t border-white/5">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1 mb-4">
                    Canales de Atención
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    {(['whatsapp', 'web', 'email'] as const).map(ch => (
                      <label
                        key={ch}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                          form.channels[ch]
                            ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                            : 'bg-white/5 border-white/10 text-[var(--muted)]'
                        }`}
                      >
                        <input
                          id={`channel-${ch}`}
                          type="checkbox"
                          checked={form.channels[ch]}
                          onChange={e => setForm(f => ({
                            ...f,
                            channels: { ...f.channels, [ch]: e.target.checked },
                          }))}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold uppercase tracking-widest capitalize">{ch}</span>
                        {form.channels[ch] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bot config */}
              <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  🤖 Configuración del Bot
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <InputGroup
                    id="field-botname"
                    label="Nombre del Bot"
                    value={form.bot.bot_name}
                    onChange={v => setForm(f => ({ ...f, bot: { ...f.bot, bot_name: v } }))}
                    placeholder="Asistente IA"
                  />
                  <InputGroup
                    id="field-botcolor"
                    label="Color del Widget"
                    type="color"
                    value={form.bot.widget_color}
                    onChange={v => setForm(f => ({ ...f, bot: { ...f.bot, widget_color: v } }))}
                  />
                  <InputGroup
                    id="field-welcome"
                    label="Mensaje de Bienvenida"
                    value={form.bot.welcome_message}
                    onChange={v => setForm(f => ({ ...f, bot: { ...f.bot, welcome_message: v } }))}
                    placeholder="¡Hola! ¿En qué puedo ayudarte?"
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">
                      Idioma
                    </label>
                    <select
                      id="field-language"
                      value={form.bot.language}
                      onChange={e => setForm(f => ({ ...f, bot: { ...f.bot, language: e.target.value } }))}
                      className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">
                    Instrucciones del Bot (System Prompt)
                  </label>
                  <textarea
                    id="field-instructions"
                    rows={4}
                    value={form.bot.instructions}
                    onChange={e => setForm(f => ({ ...f, bot: { ...f.bot, instructions: e.target.value } }))}
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    placeholder="Eres un asistente IA de [empresa]. Tu objetivo es ayudar a los clientes con..."
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Shield className="text-blue-400" /> Seguridad de Acceso
              </h3>
              <div className="space-y-4">
                <SecurityCard title="Autenticación de Dos Factores (2FA)" status="Desactivado" action="Configurar" />
                <SecurityCard title="Alertas de Inicio de Sesión" status="Activado" action="Gestionar" />
                <SecurityCard title="Direcciones IP Permitidas" status="Cualquiera" action="Restringir" />
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">
                  Email de cuenta
                </label>
                <p className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono">
                  {client?.email ?? '—'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Bell className="text-blue-400" /> Preferencias de Notificaciones
              </h3>
              <p className="text-sm text-[var(--muted)]">
                Configura qué tipo de alertas quieres recibir por email y en el dashboard.
              </p>
              {[
                { label: 'Nuevos leads capturados', desc: 'Recibe un email por cada lead generado por el bot' },
                { label: 'Alertas de pago', desc: 'Notificaciones de cobros y facturas' },
                { label: 'Actualizaciones del sistema', desc: 'Nuevas funcionalidades y mantenimientos' },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-white">{n.label}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{n.desc}</p>
                  </div>
                  <label className="relative w-10 h-6 cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-6 bg-white/10 peer-checked:bg-blue-600 rounded-full transition-colors" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Globe className="text-blue-400" /> Conexiones & API
              </h3>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">
                  Tu ID de Cliente
                </label>
                <p className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono">
                  {client?.id ?? '—'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">
                  Estado del Bot
                </label>
                <p className={`px-4 py-3 rounded-xl text-xs font-bold border ${
                  bot?.active
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {bot?.active ? '● Bot Activo' : '● Bot Inactivo'}
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function InputGroup({
  id, label, value, onChange, type = 'text', placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
      />
    </div>
  );
}

function SecurityCard({ title, status, action }: { title: string; status: string; action: string }) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between">
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">{title}</h4>
        <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">
          Estado: <span className={status === 'Activado' ? 'text-emerald-500' : 'text-red-500'}>{status}</span>
        </p>
      </div>
      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
        {action}
      </button>
    </div>
  );
}

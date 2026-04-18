'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bot, Palette, MessageSquare, Globe, Clock, Shield,
  Save, Eye, Loader2, Lock, Zap, CheckCircle2, Cpu, AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PlanGate } from '@/components/shared/PlanGate';
import { usePlan } from '@/hooks/usePlan';

/* ── AI models catalog with plan gating ───────────────────────── */
const ALL_MODELS = [
  // ── Basic plan (included in all plans) ──
  { value: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B Instant',      provider: 'Groq',    minPlan: 'basic' },
  { value: 'gemma2-9b-it',            label: 'Gemma 2 9B',                 provider: 'Groq',    minPlan: 'basic' },
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile',   provider: 'Groq',    minPlan: 'basic' },
  { value: 'compound-beta',           label: 'Compound Beta',              provider: 'Groq',    minPlan: 'basic' },
  { value: 'gemini-1.5-flash',        label: 'Gemini Flash 1.5',           provider: 'Google',  minPlan: 'basic' },
  // ── Starter+ ──
  { value: 'gpt-4o-mini',             label: 'GPT-4o Mini',                provider: 'OpenAI',  minPlan: 'starter' },
  { value: 'gemini-2.0-flash',        label: 'Gemini 2.0 Flash',           provider: 'Google',  minPlan: 'starter' },
  // ── Pro+ ──
  { value: 'gpt-4o',                  label: 'GPT-4o',                     provider: 'OpenAI',  minPlan: 'pro' },
  { value: 'claude-3-5-sonnet',       label: 'Claude 3.5 Sonnet',          provider: 'Anthropic', minPlan: 'pro' },
  { value: 'gemini-2.5-pro',          label: 'Gemini 2.5 Pro',             provider: 'Google',  minPlan: 'pro' },
] as const;

type ModelValue = (typeof ALL_MODELS)[number]['value'];

const PLAN_ORDER = ['basic', 'starter', 'pro', 'enterprise'];
function planCanUseModel(clientPlan: string, minPlan: string): boolean {
  const ci = PLAN_ORDER.indexOf((clientPlan ?? '').toLowerCase());
  const ri = PLAN_ORDER.indexOf(minPlan);
  return ci >= 0 && ri >= 0 && ci >= ri;
}

const PROVIDER_COLORS: Record<string, string> = {
  Groq:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Google:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OpenAI:    'bg-green-500/10 text-green-400 border-green-500/20',
  Anthropic: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};


export default function MyBotPage() {
  const [botConfig, setBotConfig]   = useState<any>(null);
  const [client,    setClient]      = useState<any>(null);
  const [loading,   setLoading]     = useState(true);
  const [saving,    setSaving]      = useState(false);
  const [saved,     setSaved]       = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [testMsg,   setTestMsg]     = useState('');
  const [testReply, setTestReply]   = useState('');
  const [testing,   setTesting]     = useState(false);
  const [clientPlan, setClientPlan] = useState('basic');
  const [activeTab, setActiveTab]   = useState<'config' | 'identity' | 'schedule' | 'test'>('config');
  const { planId } = usePlan();

  const supabase = createClient();

  // Compute available models based on plan
  const availableModels = ALL_MODELS.map(m => ({
    ...m,
    enabled: planCanUseModel(clientPlan, m.minPlan),
  }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: bConfig }, { data: cData }, { data: subData }] = await Promise.all([
      supabase.from('bot_configs').select('*').eq('client_id', user.id).maybeSingle(),
      supabase.from('clients').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('plan').eq('client_id', user.id).maybeSingle(),
    ]);

    if (bConfig) setBotConfig(bConfig);
    if (cData) setClient(cData);
    const plan = subData?.plan ?? cData?.plan ?? 'basic';
    setClientPlan((plan as string).toLowerCase());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);


  const handleSave = async () => {
    if (!botConfig?.id) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    // Only save allowed fields (whitelist to avoid RLS/schema errors)
    const { error } = await supabase
      .from('bot_configs')
      .update({
        bot_name:        botConfig.bot_name,
        name:            botConfig.bot_name, // keep in sync
        welcome_message: botConfig.welcome_message,
        widget_color:    botConfig.widget_color,
        language:        botConfig.language,
        model:           botConfig.model,
        system_prompt:   botConfig.system_prompt,
        temperature:     botConfig.temperature,
        max_tokens:      botConfig.max_tokens,
      })
      .eq('id', botConfig.id);

    if (error) {
      setSaveError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleTestChat = async () => {
    if (!testMsg.trim() || !client?.id) return;
    setTesting(true);
    setTestReply('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client-id': client.id },
        body: JSON.stringify({ message: testMsg, history: [] }),
      });
      const data = await res.json();
      setTestReply(data.reply ?? data.error ?? 'Sin respuesta');
    } catch {
      setTestReply('Error de conexión');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  if (!botConfig) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Bot className="w-12 h-12 text-gray-500" />
        <p className="text-gray-400">No hay bot configurado aún. Contacta al soporte.</p>
      </div>
    );
  }

  const isPro = ['pro', 'enterprise'].includes(clientPlan);
  // selectedModel kept for backward compat — use ALL_MODELS now
  // (actual active model display is in the model selector section)


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Configuración del Bot</h1>
          <p className="text-[var(--muted)]">Personaliza tu asistente IA. Los cambios se aplican en tiempo real.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><CheckCircle2 className="w-5 h-5" /> Guardado</> : <><Save className="w-5 h-5" /> Guardar Cambios</>}
        </button>
      </div>

      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-1">
        {[
          { id: 'config' as const, label: 'Configuración', icon: Bot },
          { id: 'identity' as const, label: 'Identidad', icon: Palette },
          { id: 'schedule' as const, label: 'Horarios & Handoff', icon: Clock },
          { id: 'test' as const, label: 'Test en Vivo', icon: Zap },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {t.id === 'schedule' && !['starter','pro','enterprise'].includes(planId) && <Lock className="w-3 h-3 text-gray-700" />}
          </button>
        ))}
      </div>

      {activeTab === 'config' && (

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Settings */}
        <div className="space-y-6">

          {/* ── Apariencia ──────────────────────────────────── */}
          <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="text-blue-400 w-5 h-5" /> Apariencia e Identidad
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Nombre del Asistente</label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  value={botConfig.bot_name ?? ''}
                  onChange={(e) => setBotConfig({ ...botConfig, bot_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Color del Widget</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    className="w-12 h-11 bg-transparent border-none p-0 cursor-pointer rounded-lg"
                    value={botConfig.widget_color ?? '#6366f1'}
                    onChange={(e) => setBotConfig({ ...botConfig, widget_color: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-xs font-mono uppercase focus:outline-none"
                    value={botConfig.widget_color ?? '#6366f1'}
                    onChange={(e) => setBotConfig({ ...botConfig, widget_color: e.target.value })}
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
                value={botConfig.welcome_message ?? ''}
                onChange={(e) => setBotConfig({ ...botConfig, welcome_message: e.target.value })}
              />
              <div className="flex justify-end pr-2 text-[10px] font-bold text-[var(--muted)]">
                {(botConfig.welcome_message?.length ?? 0)} / 200
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Idioma Predeterminado</label>
              <select
                className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
                value={botConfig.language ?? 'es'}
                onChange={(e) => setBotConfig({ ...botConfig, language: e.target.value })}
              >
                <option value="es">Español (Chile)</option>
                <option value="en">English (US)</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>

          {/* ── Modelo IA ──────────────────────────────────── */}
          <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="text-purple-400 w-5 h-5" /> Modelo de Inteligencia Artificial
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">REAL · No simulado</span>
            </div>
            <p className="text-xs text-[var(--muted)]">El modelo seleccionado procesa TODAS las conversaciones reales de tus usuarios. Puedes cambiar en cualquier momento.</p>

            <div className="space-y-2">
              {availableModels.map((m) => {
                const isSelected = (botConfig.model ?? 'llama-3.1-8b-instant') === m.value;
                const isLocked   = !m.enabled;
                return (
                  <button
                    key={m.value}
                    onClick={() => !isLocked && setBotConfig({ ...botConfig, model: m.value })}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : isLocked
                        ? 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
                        : 'border-white/10 bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5'
                    }`}
                  >
                    <div className="text-left flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isSelected ? 'border-purple-400 bg-purple-400' : 'border-white/20'}`} />
                      <div>
                        <span className="font-bold text-white text-sm block">{m.label}</span>
                        <span className="text-[10px] text-[var(--muted)]">{m.provider}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${PROVIDER_COLORS[m.provider]}`}>{m.provider}</span>
                      {isLocked && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> {m.minPlan.charAt(0).toUpperCase() + m.minPlan.slice(1)}+
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active model summary */}
            {(() => {
              const activeModel = ALL_MODELS.find(m => m.value === (botConfig.model ?? 'llama-3.1-8b-instant')) ?? ALL_MODELS[0];
              return (
                <div className={`p-4 rounded-xl border text-xs ${PROVIDER_COLORS[activeModel.provider]}`}>
                  <strong>Activo:</strong> {activeModel.label} ({activeModel.provider}) — responderá a todos tus usuarios en tiempo real.
                </div>
              );
            })()}
          </div>

          {/* ── Prompt / Personalidad ─────────────────────── */}
          <div className={`glass rounded-[32px] p-8 border transition-all duration-300 ${!isPro ? 'opacity-60' : 'border-[var(--border)]'}`}>
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
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Prompt del Sistema</label>
              <textarea
                disabled={!isPro}
                rows={8}
                className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-4 px-4 text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none font-mono leading-relaxed disabled:cursor-not-allowed"
                placeholder="Eres un asistente experto en ventas para la empresa X. Responde siempre en español de manera amable y profesional..."
                value={botConfig.system_prompt ?? ''}
                onChange={(e) => setBotConfig({ ...botConfig, system_prompt: e.target.value })}
              />
              {!isPro && (
                <p className="text-xs text-purple-400/70 px-1">Actualiza a Plan Pro para personalizar el prompt del sistema del agente.</p>
              )}
            </div>
          </div>

          {/* ── Parámetros avanzados ─────────────────────── */}
          {isPro && (
            <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="text-orange-400 w-5 h-5" /> Parámetros Avanzados
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">
                    Temperatura: {botConfig.temperature ?? 0.7}
                  </label>
                  <input
                    type="range" min="0" max="2" step="0.1"
                    className="w-full accent-orange-500"
                    value={botConfig.temperature ?? 0.7}
                    onChange={(e) => setBotConfig({ ...botConfig, temperature: parseFloat(e.target.value) })}
                  />
                  <div className="flex justify-between text-[9px] text-[var(--muted)]">
                    <span>Preciso (0)</span><span>Creativo (2)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Max Tokens: {botConfig.max_tokens ?? 512}</label>
                  <input
                    type="range" min="64" max="2048" step="64"
                    className="w-full accent-orange-500"
                    value={botConfig.max_tokens ?? 512}
                    onChange={(e) => setBotConfig({ ...botConfig, max_tokens: parseInt(e.target.value) })}
                  />
                  <div className="flex justify-between text-[9px] text-[var(--muted)]">
                    <span>64</span><span>2048</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Preview + Test */}
        <div className="space-y-6 lg:sticky lg:top-8 self-start">
          {/* Live Preview */}
          <div className="glass rounded-[32px] border border-[var(--border)] overflow-hidden">
            <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Vista Previa</h4>
                  <p className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">Widget en tiempo real</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></div>
              </div>
            </div>

            <div className="relative bg-[#080a12] h-[320px] flex flex-col p-6 overflow-hidden">
              <div className="flex-1 space-y-4">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5" style={{ backgroundColor: (botConfig.widget_color ?? '#6366f1') + '30' }}>
                    <Bot className="w-5 h-5" style={{ color: botConfig.widget_color ?? '#6366f1' }} />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 text-xs text-[var(--sub)] max-w-[85%] border border-white/5 leading-relaxed">
                    {botConfig.welcome_message || '¡Hola! ¿En qué puedo ayudarte?'}
                  </div>
                </div>
                {testReply && (
                  <>
                    <div className="flex justify-end">
                      <div className="bg-white/10 rounded-2xl rounded-tr-sm p-3 text-xs text-white max-w-[80%] border border-white/5">{testMsg}</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5" style={{ backgroundColor: (botConfig.widget_color ?? '#6366f1') + '30' }}>
                        <Bot className="w-5 h-5" style={{ color: botConfig.widget_color ?? '#6366f1' }} />
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 text-xs text-[var(--sub)] max-w-[85%] border border-white/5 leading-relaxed">{testReply}</div>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-auto">
                <div className="relative">
                  <input disabled type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-10 text-sm text-white opacity-60" placeholder="Escribe un mensaje..." />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl" style={{ backgroundColor: botConfig.widget_color ?? '#6366f1' }}>
                    <Zap className="w-3.5 h-3.5 text-white fill-current" />
                  </div>
                </div>
                <p className="text-center text-[8px] text-[var(--muted)] mt-3 font-bold uppercase tracking-widest">Powered by AIgenciaLab.cl</p>
              </div>
            </div>
          </div>

          {/* Test chat real */}
          <div className="glass rounded-[32px] p-6 border border-[var(--border)] space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Probar Agente en Vivo (Real)
            </h4>
            <p className="text-[10px] text-[var(--muted)]">Envía un mensaje real al motor IA ({(ALL_MODELS.find(m => m.value === (botConfig?.model ?? 'llama-3.1-8b-instant')) ?? ALL_MODELS[0]).label}) para verificar que responde correctamente.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                placeholder="Escribe un mensaje de prueba..."
                className="flex-1 bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={handleTestChat}
                disabled={testing || !testMsg.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition flex items-center gap-2"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </button>
            </div>
            {testing && <p className="text-xs text-[var(--muted)] animate-pulse">Llamando a {(ALL_MODELS.find(m => m.value === (botConfig?.model ?? 'llama-3.1-8b-instant')) ?? ALL_MODELS[0]).label}…</p>}

            {testReply && !testing && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 leading-relaxed">
                <strong className="block text-emerald-400 mb-1">Respuesta real del agente:</strong>
                {testReply}
              </div>
            )}
          </div>

          {/* Security note */}
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[24px]">
            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Protección de Datos</h5>
                <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium">
                  Todas tus configuraciones y el conocimiento de tu bot están cifrados. Cumplimos con la Ley N°19.628.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Identity tab */}
      {activeTab === 'identity' && (
        <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" /> Identidad y Personalidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Tono de Voz</label>
              <select
                className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                value={botConfig?.tone ?? 'profesional'}
                onChange={e => setBotConfig({ ...botConfig, tone: e.target.value })}>
                <option value="profesional" className="bg-[#0e0e18]">Profesional</option>
                <option value="amigable" className="bg-[#0e0e18]">Amigable</option>
                <option value="formal" className="bg-[#0e0e18]">Formal</option>
                <option value="casual" className="bg-[#0e0e18]">Casual</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Avatar del Bot</label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-white/10" style={{ backgroundColor: (botConfig?.widget_color ?? '#6366f1') + '20' }}>
                  🤖
                </div>
                <p className="text-xs text-gray-600">El avatar se muestra en el widget de chat junto al nombre del bot.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Temas Prohibidos</label>
              <textarea rows={3} className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                value={botConfig?.off_limits ?? ''}
                onChange={e => setBotConfig({ ...botConfig, off_limits: e.target.value })}
                placeholder="Temas que el bot no debe discutir (ej: precios de la competencia, política)" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Captura de Leads</label>
              <select className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
                value={botConfig?.lead_capture ?? 'auto'}
                onChange={e => setBotConfig({ ...botConfig, lead_capture: e.target.value })}>
                <option value="auto" className="bg-[#0e0e18]">Automática (solicitar datos cuando es natural)</option>
                <option value="aggressive" className="bg-[#0e0e18]">Agresiva (pedir datos temprano)</option>
                <option value="passive" className="bg-[#0e0e18]">Pasiva (solo si el usuario ofrece)</option>
                <option value="off" className="bg-[#0e0e18]">Desactivada</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Schedule & Handoff tab */}
      {activeTab === 'schedule' && (
        <PlanGate feature="bot_scheduled" requiredPlan="starter">
          <div className="glass rounded-[32px] p-8 border border-[var(--border)] space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Horarios de Atención
            </h3>
            <p className="text-sm text-gray-500">Define en qué horarios el bot está activo. Fuera de horario, mostrará un mensaje de ausencia.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Hora de Inicio</label>
                <input type="time" value={botConfig?.schedule_start ?? '09:00'}
                  onChange={e => setBotConfig({ ...botConfig, schedule_start: e.target.value })}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Hora de Fin</label>
                <input type="time" value={botConfig?.schedule_end ?? '18:00'}
                  onChange={e => setBotConfig({ ...botConfig, schedule_end: e.target.value })}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest px-1">Mensaje fuera de horario</label>
              <input type="text" value={botConfig?.away_message ?? 'Estamos fuera de horario. Te responderemos pronto.'}
                onChange={e => setBotConfig({ ...botConfig, away_message: e.target.value })}
                className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">🔀 Handoff a Humano</h4>
              <p className="text-xs text-gray-600">Cuando el bot detecta que no puede resolver la consulta, transfiere al agente humano.</p>
              <div className="flex items-center gap-4">
                <label className="relative w-10 h-6 cursor-pointer">
                  <input type="checkbox" checked={botConfig?.handoff_enabled ?? false}
                    onChange={e => setBotConfig({ ...botConfig, handoff_enabled: e.target.checked })} className="sr-only peer" />
                  <div className="w-10 h-6 bg-white/10 peer-checked:bg-blue-600 rounded-full transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                </label>
                <span className="text-sm text-gray-400">Handoff habilitado</span>
              </div>
            </div>
          </div>
        </PlanGate>
      )}

      {/* Test tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          {/* Widget preview */}
          {botConfig && (
            <div className="glass rounded-[32px] p-6 border border-[var(--border)]">
              <h4 className="text-sm font-bold text-white mb-4">Vista previa del widget</h4>
              <div className="max-w-[340px] mx-auto rounded-2xl border border-white/10 bg-[#0a0a12] overflow-hidden" style={{ height: 420 }}>
                <div className="p-3 flex items-center gap-2" style={{ background: botConfig.widget_color ?? '#6366f1' }}>
                  <Bot className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm text-white">{botConfig.bot_name || 'Asistente IA'}</span>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (botConfig.widget_color ?? '#6366f1') + '30' }}>
                      <Bot className="w-3.5 h-3.5" style={{ color: botConfig.widget_color ?? '#6366f1' }} />
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 text-gray-400 border border-white/5">{botConfig.welcome_message || '¡Hola! ¿En qué puedo ayudarte?'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real test chat */}
          <div className="glass rounded-[32px] p-6 border border-[var(--border)] space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Probar Agente en Vivo (Real)
            </h4>
            <p className="text-[10px] text-[var(--muted)]">Envía un mensaje real al motor IA ({(ALL_MODELS.find(m => m.value === (botConfig?.model ?? 'llama-3.1-8b-instant')) ?? ALL_MODELS[0]).label}) para verificar que responde correctamente.</p>
            <div className="flex gap-2">
              <input type="text" value={testMsg} onChange={(e) => setTestMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                placeholder="Escribe un mensaje de prueba..."
                className="flex-1 bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
              <button onClick={handleTestChat} disabled={testing || !testMsg.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition flex items-center gap-2">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </button>
            </div>
            {testing && <p className="text-xs text-[var(--muted)] animate-pulse">Llamando…</p>}
            {testReply && !testing && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 leading-relaxed">
                <strong className="block text-emerald-400 mb-1">Respuesta real del agente:</strong>
                {testReply}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

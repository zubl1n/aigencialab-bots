'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Bot, Palette, MessageSquare, Globe, Clock, Shield,
  Save, Eye, Loader2, Lock, Zap, CheckCircle2, Cpu, AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ── Free/low-cost AI models available ─────────────────────────── */
const FREE_MODELS = [
  // ── Groq (free tier) — modelos ACTIVOS abril 2025 ──
  { value: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B Instant (Groq — Gratis)',    provider: 'Groq',   tier: 'free' },
  { value: 'gemma2-9b-it',            label: 'Gemma 2 9B (Groq — Gratis)',               provider: 'Groq',   tier: 'free' },
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Groq — Gratis)', provider: 'Groq',   tier: 'free' },
  { value: 'compound-beta',           label: 'Compound Beta (Groq — Gratis)',             provider: 'Groq',   tier: 'free' },
  // ── Google Gemini ──
  { value: 'gemini-1.5-flash',        label: 'Gemini Flash 1.5 (Google — Gratis)',       provider: 'Google', tier: 'free' },
  // ── OpenAI (requiere OPENAI_API_KEY) ──
  { value: 'gpt-4o-mini',             label: 'GPT-4o Mini (OpenAI — Requiere clave)',    provider: 'OpenAI', tier: 'pro' },
] as const;

type ModelValue = (typeof FREE_MODELS)[number]['value'];

const PROVIDER_COLORS: Record<string, string> = {
  Groq:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Google: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  OpenAI: 'bg-green-500/10 text-green-400 border-green-500/20',
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

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: bConfig }, { data: cData }] = await Promise.all([
      supabase.from('bot_configs').select('*').eq('client_id', user.id).maybeSingle(),
      supabase.from('clients').select('*').eq('id', user.id).maybeSingle(),
    ]);

    if (bConfig) setBotConfig(bConfig);
    if (cData) setClient(cData);
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

  const isPro = client?.plan && client.plan !== 'Starter';
  const selectedModel = FREE_MODELS.find(m => m.value === botConfig.model) ?? FREE_MODELS[0];

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
              {FREE_MODELS.map((m) => {
                const isSelected = (botConfig.model ?? 'llama3-8b-8192') === m.value;
                const isLocked   = m.tier === 'pro' && !isPro;
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
                      {m.tier === 'free'
                        ? <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">GRATIS</span>
                        : <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Pro</span>
                      }
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active model summary */}
            <div className={`p-4 rounded-xl border text-xs ${PROVIDER_COLORS[selectedModel.provider]}`}>
              <strong>Activo:</strong> {selectedModel.label} — responderá a todos tus usuarios en tiempo real.
            </div>
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
            <p className="text-[10px] text-[var(--muted)]">Envía un mensaje real al motor IA ({selectedModel.label}) para verificar que responde correctamente.</p>
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
            {testing && <p className="text-xs text-[var(--muted)] animate-pulse">Llamando a {selectedModel.label}…</p>}
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
    </div>
  );
}

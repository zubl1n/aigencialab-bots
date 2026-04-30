// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bot, Search, RefreshCw, Power, PowerOff, Settings,
  ChevronDown, ChevronUp, Loader2,
  Zap, Globe, Palette, MessageSquare, Shield,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface BotConfig {
  id: string; client_id: string; active: boolean;
  bot_name: string | null; name: string | null;
  welcome_message: string | null; widget_color: string | null;
  language: string | null; system_prompt: string | null;
  model: string | null; temperature: number | null;
  max_tokens: number | null; allowed_domains: string[] | null;
  rate_limit: number | null; created_at: string; updated_at: string | null;
  client_email?: string; client_company?: string; client_plan?: string;
}

const MODEL_OPTIONS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-5-sonnet', 'claude-3-haiku'];
const LANG_OPTIONS  = [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }];

const PLAN_BADGE: Record<string, string> = {
  pro:        'bg-purple-500/15 text-purple-400 border-purple-500/25',
  starter:    'bg-teal-500/15 text-teal-400 border-teal-500/25',
  basic:      'bg-white/10 text-gray-400 border-white/10',
  enterprise: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

export default function AdminBotsPage() {
  const [bots, setBots]         = useState<BotConfig[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [edits, setEdits]       = useState<Record<string, Partial<BotConfig>>>({});
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const fetchBots = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/bots', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBots(data.bots ?? []);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const toggleBot = async (botId: string, clientId: string, currentActive: boolean) => {
    setSaving(botId);
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: botId, client_id: clientId, active: !currentActive }),
      });
      if (!res.ok) throw new Error(await res.text());
      setBots(prev => prev.map(b => b.id === botId ? { ...b, active: !currentActive } : b));
      showToast(`Bot ${!currentActive ? 'activado' : 'desactivado'} correctamente`);
    } catch (e: any) { showToast(`Error: ${e.message}`, false); } finally { setSaving(null); }
  };

  const saveConfig = async (botId: string, clientId: string) => {
    const changes = edits[botId];
    if (!changes || Object.keys(changes).length === 0) return;
    setSaving(botId);
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: botId, client_id: clientId, ...changes }),
      });
      if (!res.ok) throw new Error(await res.text());
      setBots(prev => prev.map(b => b.id === botId ? { ...b, ...changes } : b));
      setEdits(prev => { const n = { ...prev }; delete n[botId]; return n; });
      showToast('Configuración guardada');
    } catch (e: any) { showToast(`Error al guardar: ${e.message}`, false); } finally { setSaving(null); }
  };

  const updateEdit = (botId: string, field: string, value: any) => {
    setEdits(prev => ({ ...prev, [botId]: { ...(prev[botId] ?? {}), [field]: value } }));
  };

  const getVal = (bot: BotConfig, field: keyof BotConfig) => edits[bot.id]?.[field] ?? bot[field];

  const filtered = bots.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.client_email?.toLowerCase().includes(q) || b.client_company?.toLowerCase().includes(q) || (b.bot_name ?? b.name ?? '').toLowerCase().includes(q);
    const matchActive = filterActive === 'all' || (filterActive === 'active' && b.active) || (filterActive === 'inactive' && !b.active);
    return matchSearch && matchActive;
  });

  const activeCount   = bots.filter(b => b.active).length;
  const inactiveCount = bots.filter(b => !b.active).length;

  const fieldCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition placeholder-gray-700';
  const lblCls   = 'block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-medium shadow-xl border animate-in slide-in-from-bottom-4 ${toast.ok ? 'bg-[#0e0e18] border-emerald-500/30 text-emerald-400' : 'bg-[#0e0e18] border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bot className="w-6 h-6 text-purple-400" /> Bots / Agentes
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {bots.length} total · <span className="text-emerald-400 font-semibold">{activeCount} activos</span> · <span className="text-gray-600">{inactiveCount} inactivos</span>
          </p>
        </div>
        <button onClick={fetchBots} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white border border-white/10 hover:bg-white/5 px-4 py-2 rounded-xl transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="glass border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">Error</p>
            <p className="text-xs text-red-500/70 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="glass border border-white/5 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input type="text" placeholder="Buscar por cliente, empresa o bot…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 transition" />
        </div>
        <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterActive === f ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {f === 'all' ? 'Todos' : f === 'active' ? '● Activos' : '○ Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      )}

      {/* Bot cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="glass border border-white/5 rounded-2xl py-16 text-center">
              <Bot className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600">No hay bots que coincidan con los filtros</p>
            </div>
          )}
          {filtered.map(bot => {
            const isExp    = expanded === bot.id;
            const isSaving = saving === bot.id;
            const hasEdits = Object.keys(edits[bot.id] ?? {}).length > 0;
            const planCls  = PLAN_BADGE[(bot.client_plan ?? 'basic').toLowerCase()] ?? PLAN_BADGE.basic;

            return (
              <div key={bot.id} className={`glass rounded-2xl border transition-all ${bot.active ? 'border-emerald-500/15' : 'border-white/5'}`}>
                {/* Row summary */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${bot.active ? 'bg-emerald-400 shadow-[0_0_8px_#4ade80]' : 'bg-gray-700'}`} />

                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{bot.client_company || bot.client_email?.split('@')[0] || '—'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${planCls}`}>{bot.client_plan ?? 'Starter'}</span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">{bot.client_email}</div>
                  </div>

                  {/* Bot name */}
                  <div className="hidden md:block text-sm text-gray-400 font-medium min-w-0 w-40 truncate">
                    <Bot className="w-3.5 h-3.5 inline mr-1 text-purple-500" />
                    {bot.bot_name ?? bot.name ?? 'Asistente IA'}
                  </div>

                  {/* Model */}
                  <div className="hidden lg:block text-xs text-gray-600 font-mono w-28 truncate">{bot.model ?? 'gpt-4o-mini'}</div>

                  {/* Toggle active */}
                  <button onClick={() => toggleBot(bot.id, bot.client_id, bot.active)} disabled={isSaving}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 border ${bot.active ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'}`}>
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : bot.active ? <><PowerOff className="w-3.5 h-3.5" /> Desactivar</> : <><Power className="w-3.5 h-3.5" /> Activar</>}
                  </button>

                  {/* Expand */}
                  <button onClick={() => setExpanded(isExp ? null : bot.id)}
                    className="p-2 rounded-xl hover:bg-white/5 text-gray-600 transition flex-shrink-0">
                    {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded config panel */}
                {isExp && (
                  <div className="border-t border-white/[0.04] px-5 py-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-400" /> Configuración Técnica
                      </h3>
                      <div className="flex gap-2">
                        {hasEdits && (
                          <button onClick={() => setEdits(prev => { const n = {...prev}; delete n[bot.id]; return n; })}
                            className="text-xs text-gray-600 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
                            Descartar
                          </button>
                        )}
                        <button onClick={() => saveConfig(bot.id, bot.client_id)} disabled={!hasEdits || isSaving}
                          className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition">
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {hasEdits ? 'Guardar cambios' : 'Sin cambios'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Bot Name */}
                      <div>
                        <label className={lblCls}><Bot className="w-3 h-3 inline mr-1" />Nombre del Bot</label>
                        <input type="text" className={fieldCls} value={getVal(bot, 'bot_name') ?? ''} onChange={e => updateEdit(bot.id, 'bot_name', e.target.value)} placeholder="Asistente IA" />
                      </div>

                      {/* Welcome Message */}
                      <div>
                        <label className={lblCls}><MessageSquare className="w-3 h-3 inline mr-1" />Mensaje de bienvenida</label>
                        <input type="text" className={fieldCls} value={getVal(bot, 'welcome_message') ?? ''} onChange={e => updateEdit(bot.id, 'welcome_message', e.target.value)} placeholder="¡Hola! ¿En qué puedo ayudarte?" />
                      </div>

                      {/* Widget Color */}
                      <div>
                        <label className={lblCls}><Palette className="w-3 h-3 inline mr-1" />Color del widget</label>
                        <div className="flex gap-2">
                          <input type="color" className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer p-0.5 bg-transparent" value={getVal(bot, 'widget_color') ?? '#6366f1'} onChange={e => updateEdit(bot.id, 'widget_color', e.target.value)} />
                          <input type="text" className={`${fieldCls} flex-1`} value={getVal(bot, 'widget_color') ?? '#6366f1'} onChange={e => updateEdit(bot.id, 'widget_color', e.target.value)} placeholder="#6366f1" />
                        </div>
                      </div>

                      {/* Model */}
                      <div>
                        <label className={lblCls}><Zap className="w-3 h-3 inline mr-1" />Modelo IA <span className="text-purple-500 normal-case">(Admin)</span></label>
                        <select className={fieldCls} value={getVal(bot, 'model') ?? 'gpt-4o-mini'} onChange={e => updateEdit(bot.id, 'model', e.target.value)}>
                          {MODEL_OPTIONS.map(m => <option key={m} value={m} className="bg-[#0e0e18]">{m}</option>)}
                        </select>
                      </div>

                      {/* Temperature */}
                      <div>
                        <label className={lblCls}><Zap className="w-3 h-3 inline mr-1" />Temperatura <span className="text-purple-500 normal-case">(Admin)</span></label>
                        <div className="flex items-center gap-3">
                          <input type="range" min="0" max="1" step="0.1" className="flex-1 accent-purple-500" value={getVal(bot, 'temperature') ?? 0.7} onChange={e => updateEdit(bot.id, 'temperature', parseFloat(e.target.value))} />
                          <span className="text-sm font-mono w-8 text-gray-400">{getVal(bot, 'temperature') ?? 0.7}</span>
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <label className={lblCls}><Globe className="w-3 h-3 inline mr-1" />Idioma</label>
                        <select className={fieldCls} value={getVal(bot, 'language') ?? 'es'} onChange={e => updateEdit(bot.id, 'language', e.target.value)}>
                          {LANG_OPTIONS.map(l => <option key={l.value} value={l.value} className="bg-[#0e0e18]">{l.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* System Prompt */}
                    <div>
                      <label className={lblCls}><Shield className="w-3 h-3 inline mr-1" />System Prompt <span className="text-purple-500 normal-case">(Admin · no visible al cliente)</span></label>
                      <textarea rows={4} className={`${fieldCls} resize-y font-mono text-xs leading-relaxed`}
                        value={getVal(bot, 'system_prompt') ?? ''} onChange={e => updateEdit(bot.id, 'system_prompt', e.target.value)}
                        placeholder="Eres un asistente IA de AIgenciaLab..." />
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-700 pt-2 border-t border-white/[0.04]">
                      <span>Creado: {new Date(bot.created_at).toLocaleDateString('es-CL')}</span>
                      {bot.updated_at && <span>Actualizado: {new Date(bot.updated_at).toLocaleDateString('es-CL')}</span>}
                      <span className="font-mono text-gray-800">{bot.id.slice(0, 8)}…</span>
                      <Link href={`/admin/clientes/${bot.client_id}`} className="text-purple-400 hover:underline ml-auto">Ver cliente →</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

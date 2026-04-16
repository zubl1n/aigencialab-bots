'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bot, Search, RefreshCw, Power, PowerOff, Settings,
  ChevronDown, ChevronUp, Eye, EyeOff, Loader2,
  Zap, User, Globe, Palette, MessageSquare, Shield,
  CheckCircle2, XCircle, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';

interface BotConfig {
  id: string;
  client_id: string;
  active: boolean;
  bot_name: string | null;
  name: string | null;
  welcome_message: string | null;
  widget_color: string | null;
  language: string | null;
  system_prompt: string | null;
  model: string | null;
  temperature: number | null;
  max_tokens: number | null;
  allowed_domains: string[] | null;
  rate_limit: number | null;
  created_at: string;
  updated_at: string | null;
  // joined
  client_email?: string;
  client_company?: string;
  client_plan?: string;
}

interface EditState {
  botId: string;
  field: string;
  value: any;
}

const MODEL_OPTIONS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-5-sonnet', 'claude-3-haiku'];
const LANG_OPTIONS  = [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }, { value: 'pt', label: 'Português' }];

export default function AdminBotsPage() {
  const [bots, setBots]         = useState<BotConfig[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState<string | null>(null); // botId being saved
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [edits, setEdits]       = useState<Record<string, Partial<BotConfig>>>({});

  const fetchBots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/bots', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBots(data.bots ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const toggleBot = async (botId: string, clientId: string, currentActive: boolean) => {
    setSaving(botId);
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: botId, client_id: clientId, active: !currentActive }),
      });
      if (!res.ok) throw new Error(await res.text());
      setBots(prev => prev.map(b =>
        b.id === botId ? { ...b, active: !currentActive } : b
      ));
    } catch (e: any) {
      setError(`Error al cambiar estado: ${e.message}`);
    } finally {
      setSaving(null);
    }
  };

  const saveConfig = async (botId: string, clientId: string) => {
    const changes = edits[botId];
    if (!changes || Object.keys(changes).length === 0) return;
    setSaving(botId);
    try {
      const res = await fetch('/api/admin/bots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_id: botId, client_id: clientId, ...changes }),
      });
      if (!res.ok) throw new Error(await res.text());
      setBots(prev => prev.map(b => b.id === botId ? { ...b, ...changes } : b));
      setEdits(prev => { const n = { ...prev }; delete n[botId]; return n; });
    } catch (e: any) {
      setError(`Error al guardar: ${e.message}`);
    } finally {
      setSaving(null);
    }
  };

  const updateEdit = (botId: string, field: string, value: any) => {
    setEdits(prev => ({
      ...prev,
      [botId]: { ...(prev[botId] ?? {}), [field]: value }
    }));
  };

  const getVal = (bot: BotConfig, field: keyof BotConfig) =>
    edits[bot.id]?.[field] ?? bot[field];

  // Filter bots
  const filtered = bots.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.client_email?.toLowerCase().includes(q) ||
      b.client_company?.toLowerCase().includes(q) ||
      (b.bot_name ?? b.name ?? '').toLowerCase().includes(q);
    const matchActive =
      filterActive === 'all' ||
      (filterActive === 'active' && b.active) ||
      (filterActive === 'inactive' && !b.active);
    return matchSearch && matchActive;
  });

  const activeCount   = bots.filter(b => b.active).length;
  const inactiveCount = bots.filter(b => !b.active).length;

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition';
  const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1';

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" /> Bots / Agentes
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {bots.length} bots total · <span className="text-green-600 font-semibold">{activeCount} activos</span> · <span className="text-gray-400">{inactiveCount} inactivos</span>
          </p>
        </div>
        <button onClick={fetchBots} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Error</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, empresa o bot…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filterActive === f ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? '✓ Activos' : '○ Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-gray-500">Cargando bots…</span>
        </div>
      )}

      {/* BOT CARDS */}
      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
              No hay bots que coincidan con los filtros.
            </div>
          )}

          {filtered.map(bot => {
            const isExp    = expanded === bot.id;
            const isSaving = saving === bot.id;
            const hasEdits = Object.keys(edits[bot.id] ?? {}).length > 0;

            return (
              <div
                key={bot.id}
                className={`bg-white rounded-xl border transition-all shadow-sm ${bot.active ? 'border-green-200' : 'border-gray-100'}`}
              >
                {/* ROW SUMMARY */}
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Active indicator */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${bot.active ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-gray-300'}`} />

                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 truncate">{bot.client_company || bot.client_email?.split('@')[0] || '—'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${bot.client_plan === 'Pro' ? 'bg-purple-100 text-purple-700' : bot.client_plan === 'Business' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                        {bot.client_plan ?? 'Starter'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">{bot.client_email}</div>
                  </div>

                  {/* Bot name */}
                  <div className="hidden md:block text-sm text-gray-600 font-medium min-w-0 w-40 truncate">
                    <Bot className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
                    {bot.bot_name ?? bot.name ?? 'Asistente IA'}
                  </div>

                  {/* Model */}
                  <div className="hidden lg:block text-xs text-gray-400 font-mono w-28 truncate">
                    {bot.model ?? 'gpt-4o-mini'}
                  </div>

                  {/* Toggle active */}
                  <button
                    onClick={() => toggleBot(bot.id, bot.client_id, bot.active)}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 ${bot.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : bot.active ? <><PowerOff className="w-4 h-4" /> Desactivar</> : <><Power className="w-4 h-4" /> Activar</>}
                  </button>

                  {/* Expand */}
                  <button
                    onClick={() => setExpanded(isExp ? null : bot.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition flex-shrink-0"
                    title="Configuración técnica"
                  >
                    {isExp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* EXPANDED: FULL CONFIG PANEL */}
                {isExp && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50 rounded-b-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-500" /> Configuración Técnica Avanzada
                      </h3>
                      <div className="flex gap-2">
                        {hasEdits && (
                          <button
                            onClick={() => setEdits(prev => { const n = {...prev}; delete n[bot.id]; return n; })}
                            className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                          >
                            Descartar cambios
                          </button>
                        )}
                        <button
                          onClick={() => saveConfig(bot.id, bot.client_id)}
                          disabled={!hasEdits || isSaving}
                          className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {hasEdits ? 'Guardar cambios' : 'Sin cambios'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Bot Name */}
                      <div>
                        <label className={labelCls}><Bot className="w-3 h-3 inline mr-1" />Nombre del Bot</label>
                        <input
                          type="text"
                          className={inputCls}
                          value={getVal(bot, 'bot_name') ?? ''}
                          onChange={e => updateEdit(bot.id, 'bot_name', e.target.value)}
                          placeholder="Asistente IA"
                        />
                      </div>

                      {/* Welcome Message */}
                      <div>
                        <label className={labelCls}><MessageSquare className="w-3 h-3 inline mr-1" />Mensaje de bienvenida</label>
                        <input
                          type="text"
                          className={inputCls}
                          value={getVal(bot, 'welcome_message') ?? ''}
                          onChange={e => updateEdit(bot.id, 'welcome_message', e.target.value)}
                          placeholder="¡Hola! ¿En qué puedo ayudarte?"
                        />
                      </div>

                      {/* Widget Color */}
                      <div>
                        <label className={labelCls}><Palette className="w-3 h-3 inline mr-1" />Color del widget</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                            value={getVal(bot, 'widget_color') ?? '#6366f1'}
                            onChange={e => updateEdit(bot.id, 'widget_color', e.target.value)}
                          />
                          <input
                            type="text"
                            className={`${inputCls} flex-1`}
                            value={getVal(bot, 'widget_color') ?? '#6366f1'}
                            onChange={e => updateEdit(bot.id, 'widget_color', e.target.value)}
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>

                      {/* Model — Admin only */}
                      <div>
                        <label className={labelCls}><Zap className="w-3 h-3 inline mr-1" />Modelo IA <span className="text-purple-500">(Admin)</span></label>
                        <select
                          className={inputCls}
                          value={getVal(bot, 'model') ?? 'gpt-4o-mini'}
                          onChange={e => updateEdit(bot.id, 'model', e.target.value)}
                        >
                          {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>

                      {/* Temperature — Admin only */}
                      <div>
                        <label className={labelCls}><Zap className="w-3 h-3 inline mr-1" />Temperatura <span className="text-purple-500">(Admin)</span></label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range" min="0" max="1" step="0.1"
                            className="flex-1"
                            value={getVal(bot, 'temperature') ?? 0.7}
                            onChange={e => updateEdit(bot.id, 'temperature', parseFloat(e.target.value))}
                          />
                          <span className="text-sm font-mono w-8 text-gray-600">{getVal(bot, 'temperature') ?? 0.7}</span>
                        </div>
                      </div>

                      {/* Max Tokens — Admin only */}
                      <div>
                        <label className={labelCls}><Zap className="w-3 h-3 inline mr-1" />Max Tokens <span className="text-purple-500">(Admin)</span></label>
                        <input
                          type="number" min="256" max="8192" step="256"
                          className={inputCls}
                          value={getVal(bot, 'max_tokens') ?? 1024}
                          onChange={e => updateEdit(bot.id, 'max_tokens', parseInt(e.target.value))}
                        />
                      </div>

                      {/* Language */}
                      <div>
                        <label className={labelCls}><Globe className="w-3 h-3 inline mr-1" />Idioma</label>
                        <select
                          className={inputCls}
                          value={getVal(bot, 'language') ?? 'es'}
                          onChange={e => updateEdit(bot.id, 'language', e.target.value)}
                        >
                          {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </div>

                      {/* Rate Limit — Admin only */}
                      <div>
                        <label className={labelCls}><Shield className="w-3 h-3 inline mr-1" />Rate limit (req/hora) <span className="text-purple-500">(Admin)</span></label>
                        <input
                          type="number" min="0" max="10000"
                          className={inputCls}
                          value={getVal(bot, 'rate_limit') ?? 100}
                          onChange={e => updateEdit(bot.id, 'rate_limit', parseInt(e.target.value))}
                          placeholder="100"
                        />
                      </div>

                      {/* Bot ID (readonly) */}
                      <div>
                        <label className={labelCls}>Bot ID</label>
                        <input
                          type="text"
                          readOnly
                          className={`${inputCls} bg-gray-100 font-mono text-xs text-gray-500`}
                          value={bot.id}
                        />
                      </div>
                    </div>

                    {/* System Prompt — full width, Admin only */}
                    <div className="mt-4">
                      <label className={labelCls}>
                        <Shield className="w-3 h-3 inline mr-1" />System Prompt <span className="text-purple-500">(Admin — no visible para el cliente)</span>
                      </label>
                      <textarea
                        rows={5}
                        className={`${inputCls} resize-y font-mono text-xs`}
                        value={getVal(bot, 'system_prompt') ?? ''}
                        onChange={e => updateEdit(bot.id, 'system_prompt', e.target.value)}
                        placeholder="Eres un asistente IA de AIgenciaLab. Ayuda al usuario con consultas sobre los productos y servicios de la empresa..."
                      />
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                      <span>Creado: {new Date(bot.created_at).toLocaleDateString('es-CL')}</span>
                      {bot.updated_at && <span>Actualizado: {new Date(bot.updated_at).toLocaleDateString('es-CL')}</span>}
                      <a href={`/admin/clientes/${bot.client_id}`} className="text-purple-500 hover:underline ml-auto">
                        Ver cliente →
                      </a>
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
